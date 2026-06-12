---
title: "Modern BLE: async/await on iOS and Coroutines on Android"
date: 2026-06-20 10:00:00
tags: [BLE, iOS, Android, Bluetooth, CoreBluetooth, Swift Concurrency, Kotlin Coroutines]
thumbnail: /Post-Resources/BLE-AsyncAwait/cover.png
layout: post
---

Both `CoreBluetooth` (2011) and Android's `BluetoothGatt` (2013) were designed in the age of delegates and callbacks. Every BLE operation — connect, discover, read, write, subscribe — fires its result into a *different method*, far away from where you started it. The result is the infamous "callback maze": logic for a single user action smeared across half a dozen delegate methods, all coordinated by shared mutable state.

We already explored one way out in [Callback vs Reactive Programming](/2026/01/31/Bluetooth-Callback-vs-Reactive-Programming/): reactive streams. But reactive frameworks bring a dependency and a learning curve. Today both platforms ship a *native* answer — **Swift Concurrency (async/await)** on iOS and **Kotlin Coroutines (suspend + Flow)** on Android — that turns the callback maze into linear, cancellable, testable code with zero third-party dependencies.

In this article we will build a small, modern BLE layer on both platforms from the ground up, and cover the sharp edges nobody warns you about: double-resume crashes, leaked continuations, timeouts, and cancellation.

Let's get started!

<!-- more -->

---

## The Problem: The Callback Maze

Consider the simplest real task: *connect to a peripheral, discover a characteristic, and read its value.* Here is what it looks like with the native delegate API on iOS:

```swift
// The "before" — logic scattered across the delegate
func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
    peripheral.discoverServices([myServiceUUID])
}

func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
    guard let service = peripheral.services?.first else { return }
    peripheral.discoverCharacteristics([myCharUUID], for: service)
}

func peripheral(_ peripheral: CBPeripheral,
                didDiscoverCharacteristicsFor service: CBService, error: Error?) {
    guard let char = service.characteristics?.first else { return }
    peripheral.readValue(for: char)
}

func peripheral(_ peripheral: CBPeripheral,
                didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
    let data = characteristic.value   // ...finally. But where do I return this?
}
```

Four methods, no return values, and the "result" surfaces in a fifth place with no obvious way to hand it back to the caller that started the flow. Android's `BluetoothGattCallback` has the exact same shape. The control flow is inverted, error handling is duplicated, and there is no natural place to express "give up after 10 seconds."

The goal of this article is to make that whole flow read like this instead:

```swift
let data = try await ble.connect(peripheral)
    .readValue(for: myCharUUID)
```

---

## Foundational Knowledge

The bridge from callbacks to modern concurrency rests on two primitives per platform — one for **one-shot** operations and one for **streams**.

| Concept | iOS (Swift Concurrency) | Android (Kotlin Coroutines) |
|---|---|---|
| One-shot (connect, read, write) | `withCheckedThrowingContinuation` | `suspendCancellableCoroutine` |
| Ongoing stream (scan, notifications) | `AsyncThrowingStream` | `callbackFlow` |
| Safe shared state | `actor` | `Mutex` / single-threaded dispatcher |

The mental model is identical on both platforms:

```
A one-shot callback  →  suspend the caller, resume it once when the delegate fires
A repeating callback →  emit into a stream, close the stream when done/cancelled
```

Everything below is an application of those two ideas. Get them right and the rest is mechanical.

---

## iOS: Swift Concurrency

### Bridging a One-Shot Operation

`withCheckedThrowingContinuation` suspends the calling `async` function and hands you a `continuation`. You stash it, and when the matching delegate method fires, you `resume` it — turning a fire-and-forget callback into a value you can `await`.

```swift
actor BLEManager {
    private var connectContinuation: CheckedContinuation<Void, Error>?

    func connect(_ peripheral: CBPeripheral) async throws {
        try await withCheckedThrowingContinuation { continuation in
            self.connectContinuation = continuation
            self.central.connect(peripheral, options: nil)
        }
    }

    // Called from the delegate (see threading note below)
    fileprivate func didConnect() {
        connectContinuation?.resume()
        connectContinuation = nil          // critical — see pitfalls
    }

    fileprivate func didFailToConnect(_ error: Error) {
        connectContinuation?.resume(throwing: error)
        connectContinuation = nil
    }
}
```

The same pattern wraps `readValue(for:)` — store a continuation keyed by characteristic, resume it in `didUpdateValueFor` with the `Data`.

> **Swift 6.2 note:** the older overload that took an explicit `isolation:` parameter — `withCheckedThrowingContinuation(isolation:function:_:)` — is now **deprecated**, replaced by an overload whose body is `nonisolated(nonsending)`. The practical upshot: the continuation closure now runs on the **caller's** actor executor, so inside an `actor` you can touch isolated state directly without an explicit hop. You don't write the overload by name — keep calling `withCheckedThrowingContinuation { … }` and let the compiler pick the current one.

### Bridging a Stream

Scanning and characteristic notifications produce *many* values over time, so a continuation (which resumes exactly once) is the wrong tool. Use `AsyncThrowingStream`, and — crucially — stop the underlying work in `onTermination` so cancellation actually cancels the scan:

```swift
func scan(for services: [CBUUID]) -> AsyncStream<DiscoveredPeripheral> {
    AsyncStream { continuation in
        self.scanContinuation = continuation
        self.central.scanForPeripherals(withServices: services)

        // Fires when the consumer's Task is cancelled or the stream is broken
        continuation.onTermination = { @Sendable _ in
            self.central.stopScan()
        }
    }
}

// In the delegate:
func centralManager(_ central: CBCentralManager,
                    didDiscover peripheral: CBPeripheral,
                    advertisementData: [String: Any], rssi RSSI: NSNumber) {
    scanContinuation?.yield(DiscoveredPeripheral(peripheral, rssi: RSSI))
}
```

Consuming it is now a plain `for await` loop — and breaking out of the loop automatically stops the scan:

```swift
for await found in ble.scan(for: [myServiceUUID]) {
    print("Found \(found.peripheral.name ?? "?") at \(found.rssi)")
    if found.rssi.intValue > -60 { break }   // onTermination calls stopScan()
}
```

### Notifications as an AsyncThrowingStream

Characteristic notifications (`didUpdateValueFor` after `setNotifyValue(true)`) map perfectly onto a throwing stream — values flow until an error or disconnect closes it:

```swift
func notifications(for characteristic: CBCharacteristic) -> AsyncThrowingStream<Data, Error> {
    AsyncThrowingStream { continuation in
        self.notifyContinuations[characteristic.uuid] = continuation
        self.peripheral.setNotifyValue(true, for: characteristic)
        continuation.onTermination = { @Sendable _ in
            self.peripheral.setNotifyValue(false, for: characteristic)
        }
    }
}
```

### The Payoff

The four-method maze collapses into one readable function:

```swift
func readSensor() async throws -> Data {
    try await ble.connect(peripheral)
    let service = try await ble.discoverService(myServiceUUID)
    let char    = try await ble.discoverCharacteristic(myCharUUID, in: service)
    return try await ble.readValue(for: char)
}
```

### SwiftUI Integration

With `@Observable` and the `.task` modifier, the stream drives your UI directly and cancels automatically when the view disappears:

```swift
struct ScanView: View {
    @State private var devices: [DiscoveredPeripheral] = []
    let ble: BLEManager

    var body: some View {
        List(devices, id: \.id) { Text($0.name) }
            .task {                                  // cancelled on disappear
                for await found in await ble.scan(for: [myServiceUUID]) {
                    devices.append(found)
                }
            }
    }
}
```

---

## Android: Kotlin Coroutines

The Android `BluetoothGattCallback` has exactly the same callback-maze shape, and coroutines solve it with the same two primitives.

### Bridging a One-Shot Operation

`suspendCancellableCoroutine` is the direct analog of iOS's continuation. It suspends the caller and resumes once when the GATT callback fires:

```kotlin
class BleClient(private val context: Context) {

    private var connectCont: CancellableContinuation<Unit>? = null

    suspend fun connect(device: BluetoothDevice): Unit =
        suspendCancellableCoroutine { cont ->
            connectCont = cont
            val gatt = device.connectGatt(context, false, gattCallback)

            // If the coroutine is cancelled, tear down the connection
            cont.invokeOnCancellation { gatt.close() }
        }

    private val gattCallback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
            when {
                newState == BluetoothProfile.STATE_CONNECTED &&
                    status == BluetoothGatt.GATT_SUCCESS -> {
                    connectCont?.resume(Unit)
                    connectCont = null
                }
                else -> {
                    connectCont?.resumeWithException(BleException(status))
                    connectCont = null
                }
            }
        }
    }
}
```

Reading a characteristic is the same shape — store the continuation, resume it with the bytes in `onCharacteristicRead`:

```kotlin
suspend fun readValue(char: BluetoothGattCharacteristic): ByteArray =
    suspendCancellableCoroutine { cont ->
        readCont = cont
        gatt.readCharacteristic(char)
    }

override fun onCharacteristicRead(
    gatt: BluetoothGatt, char: BluetoothGattCharacteristic,
    value: ByteArray, status: Int
) {
    if (status == BluetoothGatt.GATT_SUCCESS) readCont?.resume(value)
    else readCont?.resumeWithException(BleException(status))
    readCont = null
}
```

### Bridging a Stream

`callbackFlow` is Android's `AsyncStream`. It builds a `Flow` from a callback-based API and — like `onTermination` on iOS — uses `awaitClose` to stop the scan when the collector cancels:

```kotlin
fun scan(serviceUuid: ParcelUuid): Flow<ScanResult> = callbackFlow {
    val scanner = bluetoothAdapter.bluetoothLeScanner
    val callback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            trySend(result)                  // emit into the flow
        }
        override fun onScanFailed(errorCode: Int) {
            close(BleException(errorCode))   // terminate with error
        }
    }

    val filter = ScanFilter.Builder().setServiceUuid(serviceUuid).build()
    val settings = ScanSettings.Builder()
        .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build()
    scanner.startScan(listOf(filter), settings, callback)

    awaitClose { scanner.stopScan(callback) }   // runs on cancellation
}
```

Collecting it mirrors the iOS `for await` — and leaving the collector stops the scan:

```kotlin
ble.scan(serviceUuid)
    .takeWhile { it.rssi <= -60 }     // stop when we get close enough
    .collect { result ->
        println("Found ${result.device.name} at ${result.rssi}")
    }
```

### Notifications as a Flow

Characteristic notifications map onto a `callbackFlow` just like iOS streams:

```kotlin
fun notifications(char: BluetoothGattCharacteristic): Flow<ByteArray> = callbackFlow {
    notifyChannels[char.uuid] = channel       // route onCharacteristicChanged here
    gatt.setCharacteristicNotification(char, true)
    // ...write the CCCD descriptor to actually enable notifications...
    awaitClose {
        gatt.setCharacteristicNotification(char, false)
        notifyChannels.remove(char.uuid)
    }
}
```

### The Payoff

```kotlin
suspend fun readSensor(device: BluetoothDevice): ByteArray {
    ble.connect(device)
    val service = ble.discoverService(MY_SERVICE_UUID)
    val char    = service.getCharacteristic(MY_CHAR_UUID)
    return ble.readValue(char)
}
```

### Lifecycle Integration

`viewModelScope` / `lifecycleScope` ties the whole BLE flow to the screen — when the user navigates away, the scope is cancelled, the continuations are cancelled, and `awaitClose` stops the scan. No manual cleanup:

```kotlin
class ScanViewModel(private val ble: BleClient) : ViewModel() {
    val devices = ble.scan(MY_SERVICE_UUID)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}
```

---

## Timeouts and Cancellation

This is where modern concurrency earns its keep. A BLE connection that never completes is a classic hang. With callbacks you would juggle a manual timer and a flag; with structured concurrency, a timeout is one line.

**iOS** — wrap the awaited operation in a task group that races it against a sleep:

```swift
func connect(_ peripheral: CBPeripheral, timeout: Duration = .seconds(10)) async throws {
    try await withThrowingTaskGroup(of: Void.self) { group in
        group.addTask { try await self.connectRaw(peripheral) }
        group.addTask {
            try await Task.sleep(for: timeout)
            throw BLEError.timeout
        }
        try await group.next()          // first to finish wins
        group.cancelAll()               // cancel the loser
    }
}
```

**Android** — `withTimeout` does it for you, and because we used `suspendCancellableCoroutine` + `invokeOnCancellation`, the timeout *actually closes the GATT connection*:

```kotlin
suspend fun connectWithTimeout(device: BluetoothDevice) =
    withTimeout(10_000) {            // throws TimeoutCancellationException
        connect(device)             // invokeOnCancellation { gatt.close() } runs
    }
```

Cancellation propagates the same way on both platforms: cancel the parent `Task`/`Job`, and every suspended BLE call unwinds and tears down its underlying operation. This is the single biggest reason to adopt native concurrency over hand-rolled callbacks.

---

## Common Pitfalls

### 1. Resuming a Continuation Twice (Crash)

A continuation may be resumed **exactly once**. But delegate methods can fire more than once, or a connect-failure can race a timeout. Resuming twice is a hard crash on iOS and an `IllegalStateException` on Android.

```swift
// WRONG — if didConnect fires after a timeout already resumed, it crashes
connectContinuation?.resume()

// RIGHT — nil it out so a second call is a no-op
connectContinuation?.resume()
connectContinuation = nil
```

Always set the stored continuation to `nil` immediately after resuming. On Android, guard with `if (cont.isActive)` before resuming.

### 2. Leaked Continuations (Hang Forever)

The opposite failure: a continuation that is **never** resumed. If the peripheral disconnects mid-read and you only resume in `onCharacteristicRead`, the caller hangs forever. Always resume pending continuations on disconnect:

```swift
func didDisconnect(_ error: Error?) {
    let err = error ?? BLEError.disconnected
    readContinuation?.resume(throwing: err);  readContinuation = nil
    connectContinuation?.resume(throwing: err); connectContinuation = nil
    // ...resume every pending continuation...
}
```

`withCheckedContinuation` (vs `withUnsafeContinuation`) will at least log a warning when a continuation leaks — keep it during development.

### 3. Forgetting to Stop Work on Termination

Without `onTermination` (iOS) / `awaitClose` (Android), breaking out of a scan loop leaves the radio scanning in the background — draining battery and silently affecting other connections. The stream-stopping callback is not optional.

### 4. Threading and Actor Isolation

CoreBluetooth delegate callbacks arrive on the dispatch queue you passed to `CBCentralManager(delegate:queue:)` — *not* on your actor. The `continuation` *body* now runs on the caller's executor (Swift 6.2's `nonisolated(nonsending)`), but the *delegate method* still fires on CoreBluetooth's queue. So you must hop into the actor before touching stored continuation state from a delegate callback — `Task { await self.didConnect() }` — or make the delegate a separate non-isolated object that funnels events into the actor. Calling actor-isolated state directly from the delegate queue is a data race.

On Android, `BluetoothGattCallback` runs on a binder thread. Confine your continuation state to a single dispatcher (e.g. a `newSingleThreadContext` or a `Mutex`) so two callbacks never mutate it concurrently.

### 5. Serializing Operations

Most BLE stacks allow only **one outstanding GATT operation at a time** (especially Android, which silently drops a second concurrent write). Do not fire `readValue` and `writeValue` concurrently. Serialize them — an `actor` on iOS naturally does this; on Android, route all operations through a single `Channel`/`Mutex` queue.

```kotlin
private val opMutex = Mutex()
suspend fun <T> serialized(block: suspend () -> T): T = opMutex.withLock { block() }
```

---

## When (Not) to Use This

Native concurrency is the right default for most BLE apps, but be honest about the trade-offs:

| Approach | Best for | Watch out for |
|---|---|---|
| **async/await + Coroutines** | Linear flows, one-shot ops, simple subscriptions, native dependency-free code | Manual continuation bookkeeping; concurrent-op serialization |
| **Reactive (Rx)** | Complex multi-stream composition, retry/backoff operators, debounce/merge | Extra dependency, steeper learning curve — see [Callback vs Reactive](/2026/01/31/Bluetooth-Callback-vs-Reactive-Programming/) |
| **Raw callbacks** | Tiny apps, a single characteristic read | Scales into the callback maze |

If your app coordinates *many* simultaneous streams with sophisticated operators (merge three sensor feeds, debounce, retry with exponential backoff), Rx still composes more elegantly. For everything else — which is most apps — native async/await and coroutines give you 90% of the benefit with zero dependencies.

---

## Best Practices Summary

1. **One-shot → continuation** — `withCheckedThrowingContinuation` (iOS) / `suspendCancellableCoroutine` (Android). Always `nil`/deactivate it right after resuming.
2. **Streams → AsyncStream / callbackFlow** — for scanning and notifications, and always stop the work in `onTermination` / `awaitClose`.
3. **Resume on disconnect** — fail every pending continuation when the peripheral drops, or callers hang forever.
4. **Lean on structured timeouts** — `withThrowingTaskGroup` / `withTimeout` instead of manual timers and flags.
5. **Serialize GATT operations** — one outstanding operation at a time; use an `actor` or a `Mutex`/`Channel` queue.
6. **Respect callback threading** — hop into your actor/dispatcher before touching shared continuation state.
7. **Tie scopes to lifecycle** — `.task {}` / `viewModelScope` so cancellation cleans up the radio automatically.

---

## Summary

CoreBluetooth and `BluetoothGatt` were built for a callback world, but you no longer have to live there. With a thin bridging layer — continuations for one-shot operations, `AsyncStream`/`callbackFlow` for streams — the scattered delegate maze becomes a handful of linear `async`/`suspend` functions that read top to bottom, handle errors with `try`/`catch`, and cancel cleanly when the user walks away.

The patterns are nearly identical across iOS and Android, which means one mental model covers both platforms. The sharp edges — double-resume crashes, leaked continuations, operation serialization — are real, but they are finite and well understood. Wrap them once in a small BLE layer, and every feature you build on top reads like the business logic it actually is, not the plumbing underneath.

Have a great weekend!

---

## References

1. [Swift — `withCheckedThrowingContinuation`](https://developer.apple.com/documentation/swift/withcheckedthrowingcontinuation(function:_:))
2. [Swift — AsyncStream](https://developer.apple.com/documentation/swift/asyncstream)
3. [Apple — Core Bluetooth](https://developer.apple.com/documentation/corebluetooth)
4. [Kotlin — `suspendCancellableCoroutine`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/suspend-cancellable-coroutine.html)
5. [Kotlin — `callbackFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/callback-flow.html)
6. [Android — BLE Overview](https://developer.android.com/develop/connectivity/bluetooth/ble/ble-overview)
