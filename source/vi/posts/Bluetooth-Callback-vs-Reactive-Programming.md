---
title: 'Phát triển Bluetooth: Callback vs Reactive Programming'
date: 2026-01-31 10:00:00
tags: [iOS, Android, BLE, RxSwift, RxJava, Reactive]
lang: vi
layout: post
---

![](/Post-Resources/BLEReactive/cover.png "Banner")

Xây dựng ứng dụng Bluetooth Low Energy liên quan đến việc xử lý nhiều thao tác bất đồng bộ: quét, kết nối, khám phá dịch vụ, đọc/ghi characteristic, và xử lý ngắt kết nối. Cách tiếp cận dựa trên callback truyền thống có thể nhanh chóng trở nên khó quản lý, dẫn đến điều mà các nhà phát triển gọi là "callback hell". Trong bài viết này, chúng ta sẽ so sánh cách tiếp cận callback với lập trình reactive sử dụng RxSwift và RxJava, và khám phá cách các pattern reactive có thể cải thiện đáng kể code BLE của bạn.

<!-- more -->

## Thách thức của phát triển BLE

Các thao tác Bluetooth Low Energy vốn dĩ là bất đồng bộ. Một luồng điển hình để đọc giá trị characteristic bao gồm:

1. Bắt đầu quét thiết bị
2. Kết nối đến peripheral được phát hiện
3. Khám phá services
4. Khám phá characteristics
5. Đọc giá trị characteristic
6. Xử lý lỗi tiềm ẩn ở mỗi bước

Mỗi bước phụ thuộc vào bước trước hoàn thành thành công, tạo ra một chuỗi các thao tác phụ thuộc cần được điều phối cẩn thận.

## Cách tiếp cận Callback

Hãy bắt đầu bằng cách xem xét cách chúng ta triển khai một luồng BLE hoàn chỉnh sử dụng pattern delegate/callback truyền thống trong iOS.

### iOS với CoreBluetooth Delegates

```swift
import CoreBluetooth

class CallbackBLEManager: NSObject {
    private var centralManager: CBCentralManager!
    private var targetPeripheral: CBPeripheral?
    private var targetCharacteristic: CBCharacteristic?

    // Callbacks cho mỗi thao tác
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

    // Hàm chính để đọc nhịp tim
    func readHeartRate(completion: @escaping (Int?, Error?) -> Void) {
        // Bước 1: Quét thiết bị
        scanForDevice { [weak self] peripheral, error in
            guard let self = self, let peripheral = peripheral else {
                completion(nil, error ?? BLEError.deviceNotFound)
                return
            }

            // Bước 2: Kết nối đến thiết bị
            self.connect(to: peripheral) { error in
                guard error == nil else {
                    completion(nil, error)
                    return
                }

                // Bước 3: Khám phá services
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

                    // Bước 4: Khám phá characteristics
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

                        // Bước 5: Đọc giá trị
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

        // Timeout sau 10 giây
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
        // Xử lý thay đổi trạng thái
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

### Vấn đề với cách tiếp cận Callback

Nhìn vào code ở trên, một số vấn đề trở nên rõ ràng:

1. **Callback Hell**: Các callback lồng nhau trong `readHeartRate()` tạo ra "kim tự tháp tử thần" khó đọc và bảo trì.

2. **Quản lý trạng thái**: Chúng ta cần nhiều completion handler optional và phải quản lý cẩn thận vòng đời của chúng.

3. **Xử lý lỗi**: Xử lý lỗi lặp đi lặp lại và phân tán khắp code.

4. **Quản lý bộ nhớ**: Rủi ro retain cycle với closures đòi hỏi sử dụng cẩn thận `[weak self]`.

5. **Xử lý timeout**: Mỗi thao tác cần logic timeout riêng.

6. **Không có khả năng kết hợp**: Các thao tác không thể dễ dàng kết hợp, thử lại, hoặc biến đổi.

## Cách tiếp cận Reactive

### Lập trình Reactive là gì?

Lập trình Reactive là một mô hình lập trình khai báo tập trung vào các luồng dữ liệu và sự lan truyền thay đổi. Thay vì viết các hướng dẫn từng bước (mệnh lệnh), bạn mô tả *những gì* bạn muốn xảy ra khi dữ liệu chảy qua hệ thống của bạn.

Hãy nghĩ về nó như việc thiết lập một đường ống: dữ liệu đi vào một đầu, chảy qua các biến đổi khác nhau, và đi ra đầu kia ở dạng bạn cần. Đường ống tự động xử lý luồng, lỗi, và hoàn thành.

### Các khái niệm cốt lõi

**1. Observable (Luồng)**
Observable đại diện cho một luồng dữ liệu có thể phát ra các giá trị theo thời gian. Nó có thể phát ra:
- **Next**: Một giá trị mới trong luồng
- **Error**: Một lỗi xảy ra, luồng kết thúc
- **Complete**: Luồng hoàn thành thành công

```swift
// Một Observable phát ra các giá trị nhịp tim theo thời gian
Observable<Int>  // phát ra: 72 -> 75 -> 71 -> 68 -> ...
```

**2. Observer (Người đăng ký)**
Observer đăng ký vào Observable và phản ứng với các giá trị được phát ra:

```swift
heartRateObservable
    .subscribe(
        onNext: { value in print("Nhịp tim: \(value)") },
        onError: { error in print("Lỗi: \(error)") },
        onComplete: { print("Dừng theo dõi") }
    )
```

**3. Operators (Toán tử)**
Operators biến đổi, lọc, và kết hợp các luồng. Các operator phổ biến bao gồm:

| Operator | Mục đích | Ví dụ |
|----------|---------|---------|
| `map` | Biến đổi mỗi giá trị | Chuyển đổi bytes thô thành nhịp tim |
| `filter` | Chỉ cho qua các giá trị thỏa điều kiện | Chỉ giá trị > 60 BPM |
| `flatMap` | Biến đổi thành Observable khác | Kết nối, sau đó khám phá services |
| `take` | Chỉ lấy N giá trị đầu tiên | Lấy thiết bị đầu tiên được phát hiện |
| `timeout` | Thất bại nếu không có giá trị trong thời gian | Timeout quét sau 10s |
| `retry` | Thử lại khi có lỗi | Kết nối lại khi bị ngắt |
| `catch` | Xử lý lỗi một cách nhẹ nhàng | Trả về giá trị mặc định khi có lỗi |

**4. Disposable (Quản lý đăng ký)**
Disposable đại diện cho một đăng ký đang hoạt động. Hủy nó sẽ hủy đăng ký và dọn dẹp tài nguyên:

```swift
let disposeBag = DisposeBag()

observable
    .subscribe(onNext: { value in /* xử lý */ })
    .disposed(by: disposeBag)  // Tự động hủy khi disposeBag bị deallocate
```

**5. Schedulers**
Schedulers kiểm soát thread/queue nào các thao tác chạy trên:

```swift
observable
    .subscribe(on: ConcurrentDispatchQueueScheduler(qos: .background))  // Làm việc trên background
    .observe(on: MainScheduler.instance)  // Trả kết quả trên main thread
```

### Tại sao Reactive phù hợp cho BLE?

Lập trình reactive đặc biệt phù hợp cho BLE vì:

1. **Phù hợp tự nhiên cho các sự kiện bất đồng bộ**: Các thao tác BLE là các luồng sự kiện (kết quả quét, trạng thái kết nối, cập nhật characteristic)
2. **Xử lý lỗi tích hợp**: Các operator như `retry`, `catch`, và `timeout` xử lý các kịch bản lỗi BLE phổ biến
3. **Kết hợp dễ dàng**: Nối chuỗi các thao tác một cách tự nhiên (quét → kết nối → khám phá → đọc)
4. **Dọn dẹp tài nguyên tự động**: Disposables đảm bảo các kết nối và quét được dọn dẹp đúng cách

Bây giờ hãy xem lập trình reactive biến đổi code này như thế nào. Chúng ta sẽ sử dụng RxSwift cho iOS và hiển thị các tương đương RxJava cho Android.

### iOS với RxSwift + RxBluetoothKit

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

    // Luồng BLE sạch, khai báo
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

    // Đăng ký cập nhật nhịp tim liên tục
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

// Sử dụng
class HeartRateViewController: UIViewController {
    private let bleManager = ReactiveBLEManager()
    private let disposeBag = DisposeBag()

    override func viewDidLoad() {
        super.viewDidLoad()

        // Đọc một lần
        bleManager.readHeartRate()
            .observe(on: MainScheduler.instance)
            .subscribe(
                onNext: { heartRate in
                    print("Nhịp tim: \(heartRate) BPM")
                },
                onError: { error in
                    print("Lỗi: \(error)")
                }
            )
            .disposed(by: disposeBag)

        // Theo dõi liên tục với tự động thử lại
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
        // Cập nhật UI
    }
}
```

### Android với RxJava + RxAndroidBle

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

// Sử dụng trong Activity
public class HeartRateActivity extends AppCompatActivity {
    private ReactiveBLEManager bleManager;
    private CompositeDisposable disposables = new CompositeDisposable();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        bleManager = new ReactiveBLEManager(this);

        // Đọc một lần
        disposables.add(
            bleManager.readHeartRate()
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                    heartRate -> Log.d("BLE", "Nhịp tim: " + heartRate),
                    error -> Log.e("BLE", "Lỗi: " + error.getMessage())
                )
        );

        // Theo dõi liên tục với thử lại
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

## Các Pattern Reactive nâng cao

Lập trình reactive cho phép các pattern mạnh mẽ mà sẽ phức tạp để triển khai với callbacks.

### 1. Tự động kết nối lại

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
                    print("Kết nối lại sau \(delay) giây (lần thử \(attempt + 1))")
                    return Observable<Int>.timer(
                        .seconds(Int(delay)),
                        scheduler: MainScheduler.instance
                    )
                }
        })
}
```

### 2. Đọc nhiều Characteristics song song

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

### 3. Ghi với xác nhận phản hồi

```swift
func writeWithConfirmation(data: Data,
                           to characteristic: Characteristic) -> Observable<Bool> {
    return characteristic.writeValue(data, type: .withResponse)
        .timeout(.seconds(5), scheduler: MainScheduler.instance)
        .map { _ in true }
        .catch { error in
            print("Ghi thất bại: \(error)")
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

### 4. Quét với lọc RSSI

```swift
func scanForNearbyDevices(rssiThreshold: Int = -70) -> Observable<ScannedPeripheral> {
    return centralManager.scanForPeripherals(withServices: nil)
        .filter { $0.rssi.intValue >= rssiThreshold }
        .distinctUntilChanged { $0.peripheral.identifier == $1.peripheral.identifier }
        .buffer(timeSpan: .seconds(2), count: 100, scheduler: MainScheduler.instance)
        .flatMap { peripherals -> Observable<ScannedPeripheral> in
            // Trả về thiết bị có RSSI tốt nhất
            let sorted = peripherals.sorted { $0.rssi.intValue > $1.rssi.intValue }
            return Observable.from(sorted)
        }
}
```

## Tổng kết so sánh

| Khía cạnh | Callback | Reactive |
|--------|----------|----------|
| **Cấu trúc code** | Callbacks lồng nhau, kim tự tháp tử thần | Phẳng, các thao tác có thể nối chuỗi |
| **Xử lý lỗi** | Phân tán, lặp lại | Tập trung với `.catch`, `.retry` |
| **Kết hợp** | Khó khăn | Tự nhiên với operators |
| **Kiểm thử** | Mock phức tạp | Dễ dàng với test schedulers |
| **Xử lý timeout** | Triển khai thủ công | Operator `.timeout()` có sẵn |
| **Logic thử lại** | Quản lý trạng thái phức tạp | Đơn giản với `.retry()`, `.retryWhen()` |
| **Threading** | Dispatch thủ công | Khai báo với schedulers |
| **Quản lý bộ nhớ** | Xử lý closure cẩn thận | Tự động với DisposeBag |
| **Đường cong học tập** | Thấp hơn | Đầu tư ban đầu cao hơn |
| **Debug** | Stack traces rõ ràng | Có thể phức tạp |

## Khi nào sử dụng mỗi cách tiếp cận

### Sử dụng Callbacks khi:

- Xây dựng ứng dụng đơn giản với ít thao tác BLE
- Team chưa quen với lập trình reactive
- Các thao tác BLE đơn lẻ, một lần
- Tạo prototype hoặc proof-of-concept

### Sử dụng Reactive Programming khi:

- Luồng BLE phức tạp với nhiều thao tác
- Cần logic tự động kết nối lại và thử lại
- Streaming dữ liệu thời gian thực từ thiết bị
- Nhiều thao tác BLE đồng thời
- Dự án team lớn đòi hỏi patterns nhất quán
- Khả năng bảo trì dài hạn là quan trọng

## Chiến lược di chuyển

Nếu bạn đang chuyển từ callbacks sang reactive:

1. **Bắt đầu nhỏ**: Bắt đầu với các tính năng mới sử dụng reactive patterns
2. **Bọc code hiện có**: Tạo các wrapper reactive xung quanh code dựa trên callback
3. **Tái cấu trúc dần**: Thay thế các triển khai callback từng cái một
4. **Đào tạo team**: Đầu tư vào giáo dục lập trình reactive

```swift
// Bọc code dựa trên callback
extension CBCentralManager {
    func rx_scanForPeripherals(withServices services: [CBUUID]?) -> Observable<CBPeripheral> {
        return Observable.create { observer in
            // Cầu nối đến quét dựa trên callback
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

## Kết luận

Mặc dù cách tiếp cận callback đơn giản hơn để hiểu ban đầu, lập trình reactive cung cấp những lợi thế đáng kể cho phát triển BLE:

- **Code sạch hơn** đọc như một mô tả về những gì bạn muốn đạt được
- **Xử lý lỗi tốt hơn** với cơ chế retry và timeout có sẵn
- **Kết hợp dễ dàng hơn** các luồng bất đồng bộ phức tạp
- **Cải thiện khả năng kiểm thử** với lập lịch xác định

Đường cong học tập ban đầu đáng giá đầu tư cho bất kỳ dự án BLE nghiêm túc nào. Các thư viện như RxBluetoothKit (iOS) và RxAndroidBle (Android) giúp việc chuyển đổi dễ dàng hơn bằng cách cung cấp các wrapper reactive xung quanh các API Bluetooth gốc của nền tảng.

Bắt đầu với các thao tác đơn giản, dần dần áp dụng các pattern nâng cao hơn, và xem code BLE của bạn biến đổi từ callbacks rối rắm thành các reactive streams thanh lịch, dễ bảo trì.

## Tài liệu tham khảo

- [Tài liệu RxSwift](https://github.com/ReactiveX/RxSwift)
- [RxBluetoothKit](https://github.com/Polidea/RxBluetoothKit)
- [RxAndroidBle](https://github.com/Polidea/RxAndroidBle)
- [Tài liệu ReactiveX](http://reactivex.io/documentation)
- [Apple Core Bluetooth](https://developer.apple.com/documentation/corebluetooth)
