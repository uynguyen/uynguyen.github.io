---
title: 'Bluetooth Development: Callback vs Reactive Programming'
date: 2026-01-31 10:00:00
tags: [iOS, Android, BLE, RxSwift, RxJava, Reactive]
thumbnail: /Post-Resources/BLEReactive/cover.png
---

Building Bluetooth Low Energy applications involves handling numerous asynchronous operations: scanning, connecting, discovering services, reading/writing characteristics, and handling disconnections. The traditional callback-based approach can quickly become unwieldy, leading to what developers call "callback hell." In this post, we'll compare the callback approach with reactive programming using RxSwift and RxJava, and explore how reactive patterns can dramatically improve your BLE code.

<!-- more -->

## The Challenge of BLE Development

Bluetooth Low Energy operations are inherently asynchronous. A typical flow to read a characteristic value involves:

1. Start scanning for devices
2. Connect to the discovered peripheral
3. Discover services
4. Discover characteristics
5. Read the characteristic value
6. Handle potential errors at each step

Each step depends on the previous one completing successfully, creating a cascade of dependent operations that must be carefully orchestrated.

## The Callback Approach

Let's start by looking at how we'd implement a complete BLE flow using the traditional delegate/callback pattern in iOS.

### iOS with CoreBluetooth Delegates

```swift
import CoreBluetooth

class CallbackBLEManager: NSObject {
    private var centralManager: CBCentralManager!
    private var targetPeripheral: CBPeripheral?
    private var targetCharacteristic: CBCharacteristic?

    // Callbacks for each operation
    private var scanCompletion: ((CBPeripheral?, Error?) -> Void)?
    private var connectCompletion: ((Error?) -> Void)?
    private var discoverServicesCompletion: (([CBService]?, Error?) -> Void)?
    private var discoverCharacteristicsCompletion: (([CBCharacteristic]?, Error?) -> Void)?
    private var readValueCompletion: ((Data?, Error?) -> Void)?

    private let targetServiceUUID = CBUUID(string: "180D")
    private let targetCharacteristicUUID = CBUUID(string: "2A37")

    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: nil)
    }

    // Main function to read heart rate
    func readHeartRate(completion: @escaping (Int?, Error?) -> Void) {
        // Step 1: Scan for device
        scanForDevice { [weak self] peripheral, error in
            guard let self = self, let peripheral = peripheral else {
                completion(nil, error ?? BLEError.deviceNotFound)
                return
            }

            // Step 2: Connect to device
            self.connect(to: peripheral) { error in
                guard error == nil else {
                    completion(nil, error)
                    return
                }

                // Step 3: Discover services
                self.discoverServices(for: peripheral) { services, error in
                    guard let services = services, error == nil else {
                        completion(nil, error)
                        return
                    }

                    guard let heartRateService = services.first(where: {
                        $0.uuid == self.targetServiceUUID
                    }) else {
                        completion(nil, BLEError.serviceNotFound)
                        return
                    }

                    // Step 4: Discover characteristics
                    self.discoverCharacteristics(for: heartRateService,
                                                 peripheral: peripheral) { characteristics, error in
                        guard let characteristics = characteristics, error == nil else {
                            completion(nil, error)
                            return
                        }

                        guard let heartRateChar = characteristics.first(where: {
                            $0.uuid == self.targetCharacteristicUUID
                        }) else {
                            completion(nil, BLEError.characteristicNotFound)
                            return
                        }

                        // Step 5: Read value
                        self.readValue(for: heartRateChar,
                                      peripheral: peripheral) { data, error in
                            guard let data = data, error == nil else {
                                completion(nil, error)
                                return
                            }

                            let heartRate = self.parseHeartRate(from: data)
                            completion(heartRate, nil)
                        }
                    }
                }
            }
        }
    }

    private func scanForDevice(completion: @escaping (CBPeripheral?, Error?) -> Void) {
        scanCompletion = completion
        centralManager.scanForPeripherals(withServices: [targetServiceUUID], options: nil)

        // Timeout after 10 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 10) { [weak self] in
            if self?.scanCompletion != nil {
                self?.centralManager.stopScan()
                self?.scanCompletion?(nil, BLEError.scanTimeout)
                self?.scanCompletion = nil
            }
        }
    }

    private func connect(to peripheral: CBPeripheral,
                        completion: @escaping (Error?) -> Void) {
        connectCompletion = completion
        targetPeripheral = peripheral
        centralManager.connect(peripheral, options: nil)
    }

    private func discoverServices(for peripheral: CBPeripheral,
                                  completion: @escaping ([CBService]?, Error?) -> Void) {
        discoverServicesCompletion = completion
        peripheral.delegate = self
        peripheral.discoverServices([targetServiceUUID])
    }

    private func discoverCharacteristics(for service: CBService,
                                         peripheral: CBPeripheral,
                                         completion: @escaping ([CBCharacteristic]?, Error?) -> Void) {
        discoverCharacteristicsCompletion = completion
        peripheral.discoverCharacteristics([targetCharacteristicUUID], for: service)
    }

    private func readValue(for characteristic: CBCharacteristic,
                          peripheral: CBPeripheral,
                          completion: @escaping (Data?, Error?) -> Void) {
        readValueCompletion = completion
        targetCharacteristic = characteristic
        peripheral.readValue(for: characteristic)
    }

    private func parseHeartRate(from data: Data) -> Int {
        let bytes = [UInt8](data)
        if bytes[0] & 0x01 == 0 {
            return Int(bytes[1])
        } else {
            return Int(bytes[1]) | (Int(bytes[2]) << 8)
        }
    }
}

// MARK: - CBCentralManagerDelegate
extension CallbackBLEManager: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        // Handle state changes
    }

    func centralManager(_ central: CBCentralManager,
                       didDiscover peripheral: CBPeripheral,
                       advertisementData: [String: Any],
                       rssi RSSI: NSNumber) {
        central.stopScan()
        scanCompletion?(peripheral, nil)
        scanCompletion = nil
    }

    func centralManager(_ central: CBCentralManager,
                       didConnect peripheral: CBPeripheral) {
        connectCompletion?(nil)
        connectCompletion = nil
    }

    func centralManager(_ central: CBCentralManager,
                       didFailToConnect peripheral: CBPeripheral,
                       error: Error?) {
        connectCompletion?(error ?? BLEError.connectionFailed)
        connectCompletion = nil
    }
}

// MARK: - CBPeripheralDelegate
extension CallbackBLEManager: CBPeripheralDelegate {
    func peripheral(_ peripheral: CBPeripheral,
                   didDiscoverServices error: Error?) {
        if let error = error {
            discoverServicesCompletion?(nil, error)
        } else {
            discoverServicesCompletion?(peripheral.services, nil)
        }
        discoverServicesCompletion = nil
    }

    func peripheral(_ peripheral: CBPeripheral,
                   didDiscoverCharacteristicsFor service: CBService,
                   error: Error?) {
        if let error = error {
            discoverCharacteristicsCompletion?(nil, error)
        } else {
            discoverCharacteristicsCompletion?(service.characteristics, nil)
        }
        discoverCharacteristicsCompletion = nil
    }

    func peripheral(_ peripheral: CBPeripheral,
                   didUpdateValueFor characteristic: CBCharacteristic,
                   error: Error?) {
        if let error = error {
            readValueCompletion?(nil, error)
        } else {
            readValueCompletion?(characteristic.value, nil)
        }
        readValueCompletion = nil
    }
}

enum BLEError: Error {
    case deviceNotFound
    case scanTimeout
    case connectionFailed
    case serviceNotFound
    case characteristicNotFound
}
```

### Problems with the Callback Approach

Looking at the code above, several issues become apparent:

1. **Callback Hell**: The nested callbacks in `readHeartRate()` create a "pyramid of doom" that's hard to read and maintain.

2. **State Management**: We need multiple optional completion handlers and must carefully manage their lifecycle.

3. **Error Handling**: Error handling is repetitive and scattered throughout the code.

4. **Memory Management**: Risk of retain cycles with closures requires careful use of `[weak self]`.

5. **Timeout Handling**: Each operation needs its own timeout logic.

6. **No Composition**: Operations can't be easily combined, retried, or transformed.

## The Reactive Approach

### What is Reactive Programming?

Reactive Programming is a declarative programming paradigm focused on data streams and the propagation of change. Instead of writing step-by-step instructions (imperative), you describe *what* you want to happen when data flows through your system.

Think of it like setting up a pipeline: data enters one end, flows through various transformations, and comes out the other end in the form you need. The pipeline automatically handles the flow, errors, and completion.

### Core Concepts

**1. Observable (Stream)**
An Observable represents a stream of data that can emit values over time. It can emit:
- **Next**: A new value in the stream
- **Error**: An error occurred, stream terminates
- **Complete**: Stream finished successfully

```swift
// An Observable that emits heart rate values over time
Observable<Int>  // emits: 72 -> 75 -> 71 -> 68 -> ...
```

**2. Observer (Subscriber)**
An Observer subscribes to an Observable and reacts to emitted values:

```swift
heartRateObservable
    .subscribe(
        onNext: { value in print("Heart rate: \(value)") },
        onError: { error in print("Error: \(error)") },
        onComplete: { print("Monitoring stopped") }
    )
```

**3. Operators**
Operators transform, filter, and combine streams. Common operators include:

| Operator | Purpose | Example |
|----------|---------|---------|
| `map` | Transform each value | Convert raw bytes to heart rate |
| `filter` | Only pass values matching condition | Only values > 60 BPM |
| `flatMap` | Transform into another Observable | Connect, then discover services |
| `take` | Take only first N values | Take first discovered device |
| `timeout` | Fail if no value within time | Scan timeout after 10s |
| `retry` | Retry on error | Reconnect on disconnection |
| `catch` | Handle errors gracefully | Return default value on error |

**4. Disposable (Subscription Management)**
A Disposable represents an active subscription. Disposing it cancels the subscription and cleans up resources:

```swift
let disposeBag = DisposeBag()

observable
    .subscribe(onNext: { value in /* handle */ })
    .disposed(by: disposeBag)  // Auto-disposed when disposeBag is deallocated
```

**5. Schedulers**
Schedulers control which thread/queue operations run on:

```swift
observable
    .subscribe(on: ConcurrentDispatchQueueScheduler(qos: .background))  // Work on background
    .observe(on: MainScheduler.instance)  // Deliver results on main thread
```

### Why Reactive for BLE?

Reactive programming is particularly well-suited for BLE because:

1. **Natural fit for async events**: BLE operations are streams of events (scan results, connection status, characteristic updates)
2. **Built-in error handling**: Operators like `retry`, `catch`, and `timeout` handle common BLE failure scenarios
3. **Easy composition**: Chain operations naturally (scan → connect → discover → read)
4. **Automatic resource cleanup**: Disposables ensure connections and scans are properly cleaned up

Now let's see how reactive programming transforms this code. We'll use RxSwift for iOS and show RxJava equivalents for Android.

### iOS with RxSwift + RxBluetoothKit

```swift
import RxSwift
import RxBluetoothKit
import CoreBluetooth

class ReactiveBLEManager {
    private let centralManager: CentralManager
    private let disposeBag = DisposeBag()

    private let heartRateServiceUUID = CBUUID(string: "180D")
    private let heartRateMeasurementUUID = CBUUID(string: "2A37")

    init() {
        centralManager = CentralManager(queue: .main)
    }

    // Clean, declarative BLE flow
    func readHeartRate() -> Observable<Int> {
        return centralManager.observeState()
            .startWith(centralManager.state)
            .filter { $0 == .poweredOn }
            .take(1)
            .flatMap { [weak self] _ -> Observable<ScannedPeripheral> in
                guard let self = self else { return .empty() }
                return self.centralManager.scanForPeripherals(
                    withServices: [self.heartRateServiceUUID]
                )
            }
            .take(1)
            .timeout(.seconds(10), scheduler: MainScheduler.instance)
            .flatMap { scannedPeripheral -> Observable<Peripheral> in
                scannedPeripheral.peripheral.establishConnection()
            }
            .flatMap { [weak self] peripheral -> Observable<Service> in
                guard let self = self else { return .empty() }
                return peripheral.discoverServices([self.heartRateServiceUUID])
                    .flatMap { Observable.from($0) }
            }
            .flatMap { [weak self] service -> Observable<Characteristic> in
                guard let self = self else { return .empty() }
                return service.discoverCharacteristics([self.heartRateMeasurementUUID])
                    .flatMap { Observable.from($0) }
            }
            .flatMap { characteristic -> Observable<Characteristic> in
                characteristic.readValue()
            }
            .map { characteristic -> Int in
                guard let data = characteristic.value else {
                    throw BLEError.invalidData
                }
                return self.parseHeartRate(from: data)
            }
    }

    // Subscribe to continuous heart rate updates
    func observeHeartRate() -> Observable<Int> {
        return centralManager.observeState()
            .startWith(centralManager.state)
            .filter { $0 == .poweredOn }
            .take(1)
            .flatMap { [weak self] _ -> Observable<ScannedPeripheral> in
                guard let self = self else { return .empty() }
                return self.centralManager.scanForPeripherals(
                    withServices: [self.heartRateServiceUUID]
                )
            }
            .take(1)
            .timeout(.seconds(10), scheduler: MainScheduler.instance)
            .flatMap { scannedPeripheral -> Observable<Peripheral> in
                scannedPeripheral.peripheral.establishConnection()
            }
            .flatMap { [weak self] peripheral -> Observable<Characteristic> in
                guard let self = self else { return .empty() }
                return peripheral.discoverServices([self.heartRateServiceUUID])
                    .flatMap { Observable.from($0) }
                    .flatMap { service in
                        service.discoverCharacteristics([self.heartRateMeasurementUUID])
                    }
                    .flatMap { Observable.from($0) }
            }
            .flatMap { characteristic -> Observable<Characteristic> in
                characteristic.observeValueUpdateAndSetNotification()
            }
            .map { [weak self] characteristic -> Int in
                guard let self = self, let data = characteristic.value else {
                    throw BLEError.invalidData
                }
                return self.parseHeartRate(from: data)
            }
    }

    private func parseHeartRate(from data: Data) -> Int {
        let bytes = [UInt8](data)
        if bytes[0] & 0x01 == 0 {
            return Int(bytes[1])
        } else {
            return Int(bytes[1]) | (Int(bytes[2]) << 8)
        }
    }
}

// Usage
class HeartRateViewController: UIViewController {
    private let bleManager = ReactiveBLEManager()
    private let disposeBag = DisposeBag()

    override func viewDidLoad() {
        super.viewDidLoad()

        // One-time read
        bleManager.readHeartRate()
            .observe(on: MainScheduler.instance)
            .subscribe(
                onNext: { heartRate in
                    print("Heart rate: \(heartRate) BPM")
                },
                onError: { error in
                    print("Error: \(error)")
                }
            )
            .disposed(by: disposeBag)

        // Continuous monitoring with automatic retry
        bleManager.observeHeartRate()
            .retry(when: { errors in
                errors.delay(.seconds(5), scheduler: MainScheduler.instance)
            })
            .observe(on: MainScheduler.instance)
            .subscribe(onNext: { heartRate in
                self.updateUI(heartRate: heartRate)
            })
            .disposed(by: disposeBag)
    }

    private func updateUI(heartRate: Int) {
        // Update UI
    }
}
```

### Android with RxJava + RxAndroidBle

```java
import com.polidea.rxandroidble2.RxBleClient;
import com.polidea.rxandroidble2.RxBleConnection;
import com.polidea.rxandroidble2.RxBleDevice;
import com.polidea.rxandroidble2.scan.ScanSettings;
import io.reactivex.Observable;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

public class ReactiveBLEManager {
    private static final UUID HEART_RATE_SERVICE =
        UUID.fromString("0000180d-0000-1000-8000-00805f9b34fb");
    private static final UUID HEART_RATE_MEASUREMENT =
        UUID.fromString("00002a37-0000-1000-8000-00805f9b34fb");

    private final RxBleClient rxBleClient;
    private final CompositeDisposable disposables = new CompositeDisposable();

    public ReactiveBLEManager(Context context) {
        rxBleClient = RxBleClient.create(context);
    }

    public Observable<Integer> readHeartRate() {
        return rxBleClient.scanBleDevices(
                new ScanSettings.Builder()
                    .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                    .build(),
                new ScanFilter.Builder()
                    .setServiceUuid(new ParcelUuid(HEART_RATE_SERVICE))
                    .build()
            )
            .take(1)
            .timeout(10, TimeUnit.SECONDS)
            .map(scanResult -> scanResult.getBleDevice())
            .flatMap(device -> device.establishConnection(false))
            .flatMapSingle(connection ->
                connection.readCharacteristic(HEART_RATE_MEASUREMENT)
            )
            .map(this::parseHeartRate);
    }

    public Observable<Integer> observeHeartRate() {
        return rxBleClient.scanBleDevices(
                new ScanSettings.Builder()
                    .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                    .build(),
                new ScanFilter.Builder()
                    .setServiceUuid(new ParcelUuid(HEART_RATE_SERVICE))
                    .build()
            )
            .take(1)
            .timeout(10, TimeUnit.SECONDS)
            .map(scanResult -> scanResult.getBleDevice())
            .flatMap(device -> device.establishConnection(false))
            .flatMap(connection ->
                connection.setupNotification(HEART_RATE_MEASUREMENT)
            )
            .flatMap(observable -> observable)
            .map(this::parseHeartRate);
    }

    private int parseHeartRate(byte[] data) {
        if ((data[0] & 0x01) == 0) {
            return data[1] & 0xFF;
        } else {
            return (data[1] & 0xFF) | ((data[2] & 0xFF) << 8);
        }
    }

    public void dispose() {
        disposables.clear();
    }
}

// Usage in Activity
public class HeartRateActivity extends AppCompatActivity {
    private ReactiveBLEManager bleManager;
    private CompositeDisposable disposables = new CompositeDisposable();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        bleManager = new ReactiveBLEManager(this);

        // One-time read
        disposables.add(
            bleManager.readHeartRate()
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                    heartRate -> Log.d("BLE", "Heart rate: " + heartRate),
                    error -> Log.e("BLE", "Error: " + error.getMessage())
                )
        );

        // Continuous monitoring with retry
        disposables.add(
            bleManager.observeHeartRate()
                .retryWhen(errors ->
                    errors.delay(5, TimeUnit.SECONDS)
                )
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                    heartRate -> updateUI(heartRate),
                    error -> handleError(error)
                )
        );
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        disposables.clear();
    }
}
```

## Advanced Reactive Patterns

Reactive programming enables powerful patterns that would be complex to implement with callbacks.

### 1. Automatic Reconnection

```swift
func connectWithAutoReconnect(to deviceId: UUID) -> Observable<Peripheral> {
    return centralManager.retrievePeripherals(withIdentifiers: [deviceId])
        .flatMap { peripherals -> Observable<Peripheral> in
            guard let peripheral = peripherals.first else {
                return .error(BLEError.deviceNotFound)
            }
            return peripheral.establishConnection()
        }
        .retry(when: { errors in
            errors
                .enumerated()
                .flatMap { (attempt, error) -> Observable<Int> in
                    guard attempt < 5 else {
                        return .error(error)
                    }
                    let delay = Double(min(attempt + 1, 5)) * 2.0
                    print("Reconnecting in \(delay) seconds (attempt \(attempt + 1))")
                    return Observable<Int>.timer(
                        .seconds(Int(delay)),
                        scheduler: MainScheduler.instance
                    )
                }
        })
}
```

### 2. Parallel Characteristic Reads

```swift
func readMultipleCharacteristics(from peripheral: Peripheral) -> Observable<DeviceInfo> {
    let firmwareChar = CBUUID(string: "2A26")
    let hardwareChar = CBUUID(string: "2A27")
    let serialChar = CBUUID(string: "2A25")
    let deviceInfoService = CBUUID(string: "180A")

    return peripheral.discoverServices([deviceInfoService])
        .flatMap { services -> Observable<Service> in
            guard let service = services.first else {
                return .error(BLEError.serviceNotFound)
            }
            return .just(service)
        }
        .flatMap { service in
            service.discoverCharacteristics([firmwareChar, hardwareChar, serialChar])
        }
        .flatMap { characteristics -> Observable<DeviceInfo> in
            let reads = characteristics.map { char in
                char.readValue().map { ($0.uuid, $0.value) }
            }

            return Observable.zip(reads) { results in
                var firmware = ""
                var hardware = ""
                var serial = ""

                for (uuid, data) in results {
                    guard let data = data,
                          let value = String(data: data, encoding: .utf8) else {
                        continue
                    }

                    switch uuid {
                    case firmwareChar: firmware = value
                    case hardwareChar: hardware = value
                    case serialChar: serial = value
                    default: break
                    }
                }

                return DeviceInfo(
                    firmware: firmware,
                    hardware: hardware,
                    serial: serial
                )
            }
        }
}
```

### 3. Write with Response Confirmation

```swift
func writeWithConfirmation(data: Data,
                           to characteristic: Characteristic) -> Observable<Bool> {
    return characteristic.writeValue(data, type: .withResponse)
        .timeout(.seconds(5), scheduler: MainScheduler.instance)
        .map { _ in true }
        .catch { error in
            print("Write failed: \(error)")
            return .just(false)
        }
}

func writeSequence(commands: [Data],
                   to characteristic: Characteristic) -> Observable<Int> {
    return Observable.from(commands)
        .enumerated()
        .concatMap { index, data in
            characteristic.writeValue(data, type: .withResponse)
                .map { _ in index }
                .delay(.milliseconds(100), scheduler: MainScheduler.instance)
        }
}
```

### 4. Scan with RSSI Filtering

```swift
func scanForNearbyDevices(rssiThreshold: Int = -70) -> Observable<ScannedPeripheral> {
    return centralManager.scanForPeripherals(withServices: nil)
        .filter { $0.rssi.intValue >= rssiThreshold }
        .distinctUntilChanged { $0.peripheral.identifier == $1.peripheral.identifier }
        .buffer(timeSpan: .seconds(2), count: 100, scheduler: MainScheduler.instance)
        .flatMap { peripherals -> Observable<ScannedPeripheral> in
            // Return the one with best RSSI
            let sorted = peripherals.sorted { $0.rssi.intValue > $1.rssi.intValue }
            return Observable.from(sorted)
        }
}
```

## Comparison Summary

| Aspect | Callback | Reactive |
|--------|----------|----------|
| **Code Structure** | Nested callbacks, pyramid of doom | Flat, chainable operations |
| **Error Handling** | Scattered, repetitive | Centralized with `.catch`, `.retry` |
| **Composition** | Difficult | Natural with operators |
| **Testing** | Complex mocking | Easy with test schedulers |
| **Timeout Handling** | Manual implementation | Built-in `.timeout()` operator |
| **Retry Logic** | Complex state management | Simple `.retry()`, `.retryWhen()` |
| **Threading** | Manual dispatch | Declarative with schedulers |
| **Memory Management** | Careful closure handling | Automatic with DisposeBag |
| **Learning Curve** | Lower | Higher initial investment |
| **Debugging** | Straightforward stack traces | Can be complex |

## When to Use Each Approach

### Use Callbacks When:

- Building a simple app with minimal BLE operations
- Team is unfamiliar with reactive programming
- Single, one-off BLE operations
- Prototyping or proof-of-concept

### Use Reactive Programming When:

- Complex BLE flows with multiple operations
- Need for automatic reconnection and retry logic
- Real-time data streaming from devices
- Multiple concurrent BLE operations
- Large team projects requiring consistent patterns
- Long-term maintainability is important

## Migration Strategy

If you're moving from callbacks to reactive:

1. **Start Small**: Begin with new features using reactive patterns
2. **Wrap Existing Code**: Create reactive wrappers around callback-based code
3. **Gradual Refactoring**: Replace callback implementations one at a time
4. **Team Training**: Invest in reactive programming education

```swift
// Wrapping callback-based code
extension CBCentralManager {
    func rx_scanForPeripherals(withServices services: [CBUUID]?) -> Observable<CBPeripheral> {
        return Observable.create { observer in
            // Bridge to callback-based scanning
            let delegate = RxCentralManagerDelegate(observer: observer)
            self.delegate = delegate
            self.scanForPeripherals(withServices: services, options: nil)

            return Disposables.create {
                self.stopScan()
            }
        }
    }
}
```

## Conclusion

While the callback approach is simpler to understand initially, reactive programming provides significant advantages for BLE development:

- **Cleaner code** that reads like a description of what you want to achieve
- **Better error handling** with built-in retry and timeout mechanisms
- **Easier composition** of complex asynchronous flows
- **Improved testability** with deterministic scheduling

The initial learning curve is worth the investment for any serious BLE project. Libraries like RxBluetoothKit (iOS) and RxAndroidBle (Android) make the transition easier by providing reactive wrappers around the platform's native Bluetooth APIs.

Start with simple operations, gradually adopt more advanced patterns, and watch your BLE code transform from tangled callbacks into elegant, maintainable reactive streams.

## References

- [RxSwift Documentation](https://github.com/ReactiveX/RxSwift)
- [RxBluetoothKit](https://github.com/Polidea/RxBluetoothKit)
- [RxAndroidBle](https://github.com/Polidea/RxAndroidBle)
- [ReactiveX Documentation](http://reactivex.io/documentation)
- [Apple Core Bluetooth](https://developer.apple.com/documentation/corebluetooth)
