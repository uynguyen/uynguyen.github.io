---
title: "Reliable BLE Data Transfer: Handling MTU, Throughput & Chunking"
date: 2026-04-12 10:00:00
tags: [BLE, iOS, Android, Bluetooth, CoreBluetooh]
layout: post
---

![](/Post-Resources/BLE-DataTransfer/cover.png "Cover")

Sooner or later, every BLE developer runs into the same wall: you need to send more than 20 bytes at a time. Maybe it is a firmware image, a batch of sensor readings, or a configuration payload. You fire off a write and... only the first 20 bytes arrive. The rest is silently dropped.

The root of this problem is the **MTU (Maximum Transmission Unit)** — the maximum number of bytes a single BLE packet can carry. Understanding MTU, knowing how to negotiate it, and building a reliable chunking layer on top of it is essential for any real-world BLE application.

In this article we will cover everything you need to know: what MTU actually is, how to negotiate it on iOS and Android, the difference between write types, how to build a chunking protocol, and how to maximize throughput.

Let's get started!

<!-- more -->

---

## Foundational Knowledge

Before we dive into code, let's build a clear mental model of how BLE data transfer works.

### The ATT Layer

BLE data exchange happens through the **ATT (Attribute Protocol)** layer. When you read or write a characteristic, you are sending an ATT packet. Every ATT packet has a fixed overhead of **3 bytes** (1 byte opcode + 2 bytes attribute handle), leaving the rest for your actual payload.

```
┌──────────────────────────────────────────┐
│              ATT Packet                  │
├──────────┬───────────┬───────────────────┤
│  Opcode  │  Handle   │     Payload       │
│  1 byte  │  2 bytes  │  (MTU - 3) bytes  │
├──────────┴───────────┴───────────────────┤
│             Total = MTU bytes            │
└──────────────────────────────────────────┘
```

So the effective payload per write is:

> **Effective payload = MTU - 3 bytes**

With the default MTU of **23 bytes**, you get only **20 bytes** of usable data per write. That is why 20 bytes is the magic number you see everywhere.

### MTU vs Packet Length vs Throughput

These three concepts are related but different:

| Concept | What it means | Default |
|---|---|---|
| **MTU** | Max ATT payload per packet | 23 bytes |
| **Data Length (DLE)** | Max Link Layer payload (Bluetooth 4.2+) | 27 bytes, up to 251 |
| **Throughput** | Actual data transferred per second | Depends on all factors |

MTU is negotiated at the application level. Data Length Extension (DLE) is negotiated at the link layer. Both must be optimized for maximum throughput.

---

## MTU Negotiation

The default BLE MTU is 23 bytes — designed in 2010 for tiny sensor readings. Modern BLE 4.2+ devices support MTU up to **517 bytes** (the Bluetooth spec maximum). To unlock this, the central must explicitly request a larger MTU.

### On iOS (CoreBluetooth)

iOS handles MTU negotiation automatically. When you connect to a peripheral, CoreBluetooth negotiates the highest MTU supported by both sides. You do not call any "request MTU" method — instead, you query the result:

```swift
// After connecting and discovering characteristics
let mtu = peripheral.maximumWriteValueLength(for: .withoutResponse)
print("Negotiated MTU payload: \(mtu) bytes")
```

There are two variants:

```swift
// For write-without-response — returns the max payload directly
let mtuWithoutResponse = peripheral.maximumWriteValueLength(for: .withoutResponse)

// For write-with-response — always returns min(MTU - 3, 512)
let mtuWithResponse = peripheral.maximumWriteValueLength(for: .withResponse)
```

**Important:** on iOS, you cannot set a specific MTU value. The system negotiates the maximum automatically. Starting from iOS 16, most devices negotiate **517 bytes** MTU when the peripheral supports it.

### On Android

Android requires an explicit MTU request:

```kotlin
// After connecting to the GATT server
bluetoothGatt.requestMtu(517) // Request maximum

// Handle the callback
override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
    if (status == BluetoothGatt.GATT_SUCCESS) {
        val payload = mtu - 3
        Log.d("BLE", "Negotiated MTU: $mtu, usable payload: $payload bytes")
    }
}
```

**Timing matters.** Always request MTU **after** connection is established but **before** you start reading or writing characteristics. A common mistake is to request MTU too late, after the default 23-byte MTU has already been used for service discovery.

```kotlin
// Recommended connection flow on Android
override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
    if (newState == BluetoothProfile.STATE_CONNECTED) {
        // Step 1: Request MTU first
        gatt.requestMtu(517)
    }
}

override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
    if (status == BluetoothGatt.GATT_SUCCESS) {
        // Step 2: Now discover services
        gatt.discoverServices()
    }
}
```

### iOS vs Android MTU Comparison

| Aspect | iOS | Android |
|---|---|---|
| How to request | Automatic | `requestMtu(517)` |
| Default | Negotiates max automatically | 23 until you request |
| Max supported | 517 | 517 |
| Query result | `maximumWriteValueLength(for:)` | `onMtuChanged` callback |
| Common gotcha | None — just read the value | Forgetting to call `requestMtu` |

---

## Write Types: With Response vs Without Response

BLE offers two write modes, and choosing the right one directly impacts reliability and throughput.

### Write With Response (Acknowledged)

```
Central                          Peripheral
   │                                 │
   │──── Write Request ─────────────►│
   │                                 │
   │◄─── Write Response ────────────│
   │                                 │
   │──── Write Request ─────────────►│
   │                                 │
   │◄─── Write Response ────────────│
```

- The peripheral **acknowledges** every write.
- If a write fails, you know immediately.
- **Slower** — must wait for acknowledgment before sending the next packet.
- Max payload per write: **min(MTU - 3, 512)** bytes.

### Write Without Response (Unacknowledged)

```
Central                          Peripheral
   │                                 │
   │──── Write Command ─────────────►│
   │──── Write Command ─────────────►│
   │──── Write Command ─────────────►│
   │──── Write Command ─────────────►│
   │                                 │
```

- No acknowledgment — fire and forget.
- **Much faster** — can queue multiple packets in a single connection event.
- Risk of packet loss if the peripheral's buffer overflows.
- Max payload per write: **(MTU - 3)** bytes.

### When to Use Each

| Scenario | Recommended Type |
|---|---|
| Configuration writes | With Response |
| Critical commands | With Response |
| Firmware update (OTA/DFU) | Without Response + app-level ACK |
| Streaming sensor data | Without Response |
| Large file transfer | Without Response + chunking protocol |

For high-throughput transfers, write-without-response is the way to go. But you need to build your own reliability layer on top — that is where chunking comes in.

---

## Flow Control: Avoiding Buffer Overflow

When using write-without-response, the biggest risk is overflowing the BLE stack's internal buffer. If you send packets faster than the radio can transmit them, packets get dropped silently.

### iOS — `canSendWriteWithoutResponse`

CoreBluetooth provides a built-in flow control mechanism:

```swift
func sendNextChunk() {
    while peripheral.canSendWriteWithoutResponse {
        guard let chunk = nextChunk() else { return }
        peripheral.writeValue(chunk, for: characteristic, type: .withoutResponse)
    }
}

// Called by CoreBluetooth when the buffer has space again
func peripheralIsReady(toSendWriteWithoutResponse peripheral: CBPeripheral) {
    sendNextChunk()
}
```

This is the **correct** way to stream data on iOS. Never use timers or arbitrary delays — `peripheralIsReady(toSendWriteWithoutResponse:)` tells you exactly when the stack is ready for more data.

### Android — Flow Control

On Android, `writeCharacteristic` returns `false` if the internal buffer is full. Additionally, you must wait for the `onCharacteristicWrite` callback before sending the next packet:

```kotlin
private val writeQueue = ArrayDeque<ByteArray>()
private var isWriting = false

fun enqueueChunk(data: ByteArray) {
    writeQueue.add(data)
    if (!isWriting) writeNext()
}

private fun writeNext() {
    val chunk = writeQueue.pollFirst() ?: run {
        isWriting = false
        return
    }
    isWriting = true
    characteristic.value = chunk
    characteristic.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
    bluetoothGatt.writeCharacteristic(characteristic)
}

override fun onCharacteristicWrite(
    gatt: BluetoothGatt,
    characteristic: BluetoothGattCharacteristic,
    status: Int
) {
    writeNext()
}
```

**Common mistake:** firing writes in a tight loop on Android without waiting for callbacks. This causes silent data loss that is extremely hard to debug.

---

## Building a Chunking Protocol

When your payload exceeds the MTU, you need to split it into chunks, send them sequentially, and reassemble on the other side. Here is a practical protocol design.

### Packet Format

```
┌─────────┬──────────┬─────────────────────┐
│  Flags  │  Seq #   │      Payload        │
│ 1 byte  │ 2 bytes  │  (MTU - 6) bytes    │
└─────────┴──────────┴─────────────────────┘

Flags:
  bit 0: SOF (Start of Frame)  — first chunk
  bit 1: EOF (End of Frame)    — last chunk
  bit 2: ACK request           — peripheral should confirm
```

With a 517-byte MTU, each chunk carries up to **511 bytes** of payload (517 - 3 ATT overhead - 3 protocol header).

### iOS Implementation

```swift
struct ChunkHeader {
    static let size = 3 // 1 flag + 2 sequence
    static let sof: UInt8  = 0x01
    static let eof: UInt8  = 0x02
    static let ack: UInt8  = 0x04
}

class BLEChunkedSender {
    private let peripheral: CBPeripheral
    private let characteristic: CBCharacteristic
    private let chunkSize: Int

    init(peripheral: CBPeripheral, characteristic: CBCharacteristic) {
        self.peripheral = peripheral
        self.characteristic = characteristic
        let mtu = peripheral.maximumWriteValueLength(for: .withoutResponse)
        self.chunkSize = mtu - ChunkHeader.size
    }

    private var chunks: [Data] = []
    private var currentIndex = 0

    func send(data: Data) {
        chunks = buildChunks(from: data)
        currentIndex = 0
        sendNextChunk()
    }

    private func buildChunks(from data: Data) -> [Data] {
        var result: [Data] = []
        let totalChunks = Int(ceil(Double(data.count) / Double(chunkSize)))

        for i in 0..<totalChunks {
            let start = i * chunkSize
            let end = min(start + chunkSize, data.count)
            let payload = data[start..<end]

            var flags: UInt8 = 0
            if i == 0 { flags |= ChunkHeader.sof }
            if i == totalChunks - 1 { flags |= ChunkHeader.eof }

            var header = Data()
            header.append(flags)
            var seq = UInt16(i)
            header.append(Data(bytes: &seq, count: 2))

            result.append(header + payload)
        }
        return result
    }

    func sendNextChunk() {
        while peripheral.canSendWriteWithoutResponse && currentIndex < chunks.count {
            peripheral.writeValue(chunks[currentIndex], for: characteristic, type: .withoutResponse)
            currentIndex += 1
        }
    }

    // Call this from peripheralIsReady(toSendWriteWithoutResponse:)
    func onReadyToSend() {
        sendNextChunk()
    }
}
```

### Receiver Side (Peripheral / Firmware)

The peripheral reassembles based on the flags and sequence number:

```
1. Receive chunk
2. If SOF → allocate new buffer, reset expected sequence to 0
3. Verify sequence number matches expected
4. Append payload to buffer
5. Increment expected sequence
6. If EOF → buffer is complete, process the full payload
7. If sequence mismatch → request retransmit from that sequence
```

---

## Maximizing Throughput

BLE throughput depends on multiple factors working together. Here is how to optimize each one.

### 1. Negotiate Maximum MTU

```
MTU 23  → 20 bytes/packet   → ~2.5 KB/s typical
MTU 185 → 182 bytes/packet  → ~18 KB/s typical
MTU 517 → 514 bytes/packet  → ~45 KB/s typical
```

Always request 517. Even if the peripheral supports less, the negotiation settles on the highest common value.

### 2. Enable Data Length Extension (DLE)

DLE increases the Link Layer packet size from 27 to 251 bytes. This means fewer radio packets per ATT payload. On iOS, DLE is enabled automatically. On Android 5.0+, it is usually automatic after MTU negotiation, but some devices require:

```kotlin
// Android — some devices need explicit DLE request
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
    bluetoothGatt.requestMtu(517) // This often triggers DLE automatically
}
```

### 3. Use Write Without Response

With-response writes are limited to **one packet per connection event** due to the ACK round-trip. Without-response writes can pack **multiple packets** into a single connection event.

```
With Response:    1 packet × 514 bytes per event
Without Response: 4-6 packets × 514 bytes per event  ← up to 6x faster
```

### 4. Request Shorter Connection Interval

The connection interval determines how often the central and peripheral exchange data. Shorter intervals mean more opportunities to send packets.

```
Connection interval 30ms  → ~33 events/second
Connection interval 15ms  → ~67 events/second (iOS minimum)
Connection interval 7.5ms → ~133 events/second (Android minimum)
```

On iOS, you cannot set the connection interval directly — CoreBluetooth picks a value based on the peripheral's preferred parameters. On Android:

```kotlin
// Android — request high priority connection (shorter interval)
bluetoothGatt.requestConnectionPriority(BluetoothGatt.CONNECTION_PRIORITY_HIGH)
```

**Warning:** shorter intervals increase power consumption significantly. Use `CONNECTION_PRIORITY_HIGH` only during active data transfer, then switch back:

```kotlin
// After transfer completes
bluetoothGatt.requestConnectionPriority(BluetoothGatt.CONNECTION_PRIORITY_BALANCED)
```

### 5. Throughput Calculation

Theoretical maximum throughput:

```
Throughput = (MTU - 3) × packets_per_event × (1000 / connection_interval_ms)

Example with optimal settings:
= 514 bytes × 6 packets × (1000 / 7.5)
= 514 × 6 × 133
= ~400 KB/s theoretical maximum
```

In practice, expect **30-80 KB/s** on iOS and **50-100 KB/s** on Android with well-tuned parameters. Real-world factors like RF interference, other BLE connections, and peripheral firmware limitations reduce the theoretical maximum.

---

## Common Pitfalls

### 1. Sending Without MTU Negotiation

```
// Android — forgot to call requestMtu()
// Result: every write is capped at 20 bytes, silent truncation
```

Always negotiate MTU before any data transfer.

### 2. Writing in a Tight Loop

```swift
// iOS — WRONG
for chunk in chunks {
    peripheral.writeValue(chunk, for: characteristic, type: .withoutResponse)
}
// Many chunks silently dropped because the buffer overflowed
```

Use `canSendWriteWithoutResponse` and `peripheralIsReady(toSendWriteWithoutResponse:)` instead.

### 3. Ignoring Write Type Capability

Not every characteristic supports both write types. Always check:

```swift
if characteristic.properties.contains(.writeWithoutResponse) {
    // Can use .withoutResponse
}
if characteristic.properties.contains(.write) {
    // Can use .withResponse
}
```

### 4. Hardcoding MTU Values

```swift
// WRONG — hardcoded
let chunkSize = 20

// RIGHT — dynamic
let chunkSize = peripheral.maximumWriteValueLength(for: .withoutResponse)
```

MTU varies between devices. Always query at runtime.

### 5. Not Handling Disconnection During Transfer

Long transfers can be interrupted by disconnection. Your chunking protocol should support resumption:

```swift
class ResumeableTransfer {
    private var lastAckedSequence: UInt16 = 0

    func resume() {
        // Resume from lastAckedSequence instead of restarting
        currentIndex = Int(lastAckedSequence)
        sendNextChunk()
    }
}
```

---

## Best Practices Summary

1. **Always negotiate max MTU** — call `requestMtu(517)` on Android; on iOS it is automatic, just read the result.
2. **Use write-without-response for bulk data** — it is 4-6x faster than write-with-response.
3. **Respect flow control** — use `canSendWriteWithoutResponse` on iOS and wait for callbacks on Android. Never loop blindly.
4. **Build a chunking protocol** — include sequence numbers and start/end flags for reassembly and error recovery.
5. **Query MTU at runtime** — never hardcode 20 bytes. Devices negotiate different MTU values.
6. **Request high connection priority during transfer** — on Android, use `CONNECTION_PRIORITY_HIGH` during active transfer, then switch back to balanced.
7. **Handle disconnection gracefully** — support resumable transfers for large payloads.
8. **Test on real devices** — simulators do not reflect real-world BLE behavior. Always validate throughput and reliability on physical hardware in noisy RF environments.

---

## Summary

BLE data transfer is simple on the surface — write bytes to a characteristic — but getting it right requires understanding the full stack: MTU negotiation, write types, flow control, and chunking. The default 20-byte limit is not a hard wall, it is just the starting point.

With proper MTU negotiation (517 bytes), write-without-response, flow control, and a well-designed chunking protocol, you can achieve **30-100 KB/s** of reliable throughput — more than enough for firmware updates, configuration files, and sensor data batches.

The key takeaway: **never send BLE data without knowing your MTU, and never stream without flow control.** Get these two things right, and the rest follows naturally.

Have a great weekend!

---

## References

1. [Bluetooth Core Specification v5.3 — Vol 3, Part F (ATT)](https://www.bluetooth.com/specifications/specs/core-specification-5-3/)
2. [Apple — Core Bluetooth Programming Guide](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html)
3. [Android — BLE Overview](https://developer.android.com/develop/connectivity/bluetooth/ble/ble-overview)
4. [Nordic Semiconductor — Optimizing BLE Throughput](https://devzone.nordicsemi.com/guides/short-range-guides/b/bluetooth-low-energy/posts/ble-throughput-part-1)
5. [Punch Through — Maximizing BLE Throughput](https://punchthrough.com/maximizing-ble-throughput-on-ios-and-android/)
