---
title: Đóng Vai Trò Central Và Peripheral Với CoreBluetooth
date: 2018-02-21 21:01:26
tags: [iOS, CoreBluetooh, BLE]
layout: post
lang: vi
---
## Giới thiệu
![](/Post-Resources/PlayRolesInCoreBluetooth/Banner.jpg "I love CoreBluetooth")
Như tôi đã đề cập trong [bài viết trước](/2017/10/13/Bluetooth-Low-Energy-On-iOS/), CoreBluetooth cho phép chúng ta tạo các ứng dụng có thể giao tiếp với các thiết bị BLE như máy đo nhịp tim, cảm biến cơ thể, thiết bị theo dõi hoặc các thiết bị hybrid.
Có hai vai trò trong các khái niệm CoreBluetooth: Central và peripheral.
- Central: Lấy dữ liệu từ các peripheral.
- Peripheral: Phát hành dữ liệu để được truy cập bởi central. Chúng ta có thể làm cho một thiết bị Bluetooth đóng vai trò peripheral từ phía firmware hoặc phía software.

Trong bài viết này, tôi sẽ hướng dẫn bạn cách tạo một peripheral bằng cách sử dụng các identifier của riêng chúng ta. Cũng như sử dụng một thiết bị khác, làm central, để kết nối và khám phá các service của chúng ta. Hãy bắt đầu.
<!-- more -->
## Thiết lập Peripheral
Để tạo một service, bạn cần có một identifier duy nhất gọi là UUID. Một service tiêu chuẩn có UUID 16-bit và một service tùy chỉnh có UUID 128-bit. Hãy gõ lệnh sau để tạo một uuid duy nhất từ terminal của bạn.

```bash
$ uuidgen
```
![](/Post-Resources/PlayRolesInCoreBluetooth/UUIDGen.png "")

Như bạn thấy, lệnh trả về một uuid ở định dạng hexa (128 bit): `A56E51F3-AFFE-4E14-87A2-54927B22354C`. Chúng ta sẽ sử dụng chuỗi này để thiết lập service của riêng mình.

```swift
class ViewController: UIViewController, CBPeripheralManagerDelegate {
    let kServiceUUID = "A56E51F3-AFFE-4E14-87A2-54927B22354C"

    // Other properties
    ...

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        peripheralManager = CBPeripheralManager(delegate: self, queue: nil)  [1]
    }

    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        print("peripheralManagerDidUpdateState \(peripheral.state.rawValue)")

        if peripheral.state == .poweredOn {
            let serviceUUID = CBUUID(string: kServiceUUID) [2]
            self.service = CBMutableService(type: serviceUUID, primary: true) [3]
        }
        // Other code
    }
}
```

Đây là những gì các phương thức này làm:
- [1] Bạn tạo một instance của class `PeripheralManager`, sẽ đóng vai trò peripheral trong ví dụ của chúng ta. Lưu ý rằng có một tham số `queue` trong constructor. Các event của vai trò peripheral sẽ được dispatch trên queue được cung cấp. Nếu chúng ta truyền `nil`, main queue sẽ được sử dụng.
- [2] Để thiết lập một service, chúng ta cần tạo một instance của class `CBUUID`. Constructor nhận một uuid duy nhất làm tham số, để phân biệt service của chúng ta với các service khác.
- [3] Chúng ta tạo một instance của class `CBMutableService`. Constructor nhận hai tham số: Tham số đầu tiên là uuid duy nhất của chúng ta, được định nghĩa tại [2]; tham số thứ hai chỉ ra rằng service của chúng ta có phải là primary hay không. Nếu không, service của chúng ta sẽ không được tìm thấy khi ứng dụng ở background.

Lưu ý rằng bạn có thể thêm bao nhiêu service tùy thích. Để đơn giản, tôi chỉ tạo một service trong bài viết này.
OK, hãy chuyển sang bước tiếp theo. Chúng ta sẽ định nghĩa các characteristic cho service bằng code dưới đây.

```swift
let characteristic = CBMutableCharacteristic.init(
    type: CBUUID(string: kCharacteristicUUID), [1]
    properties: [.read, .write, .notify], [2]
    value: nil, [3]
    permissions: [CBAttributePermissions.readable, CBAttributePermissions.writeable]) [4]
```

Đây là những gì đang xảy ra:
- [1] Giống như service, một characteristic cũng cần một uuid duy nhất để được phân biệt với các characteristic khác.
- [2] Chúng ta thiết lập các thuộc tính cho char. Có nhiều loại permission cho characteristic, nhưng tôi thường sử dụng một số trong số chúng:
    - *Read*: Được sử dụng cho các characteristic không thay đổi thường xuyên, ví dụ số phiên bản.
    - *Write*: Sửa đổi giá trị của characteristic.
    - *Indicate và notify*: Peripheral liên tục thông báo giá trị cập nhật của characteristic cho central. Central không phải liên tục yêu cầu nó.
    - *IndicateEncryptionRequired*: Chỉ các thiết bị đáng tin cậy mới có thể bật indication của giá trị characteristic.
Đối với các thuộc tính khác, vui lòng tham khảo [tài liệu Apple](https://developer.apple.com/documentation/corebluetooth/cbcharacteristicproperties)
- [3] Giá trị của characteristic.
*Lưu ý quan trọng:* Nếu bạn cung cấp một giá trị cho characteristic, characteristic phải là read-only. Nếu không, bạn sẽ gặp exception run-time như sau.
`2018-03-03 12:48:32.938615+0700 Peripheral[4238:3046876] *** Terminating app due to uncaught exception 'NSInternalInconsistencyException', reason: 'Characteristics with cached values must be read-only'`
Do đó, bạn phải chỉ định giá trị là nil nếu bạn mong đợi giá trị thay đổi trong suốt thời gian tồn tại của service đã publish (write).
- [4] Tất cả characteristic nên bao gồm permission "readable" để các central có thể đọc giá trị của nó. Nếu chúng ta muốn central có thể gửi lệnh đến peripheral, chúng ta cần đặt permission "writeable" cho characteristic.

Bây giờ chúng ta có một service và một characteristic. Hãy publish nó.
```swift
self.service?.characteristics = []
self.service?.characteristics?.append(characteristic)

self.peripheralManager.add(self.service!)
```

Sau khi thêm một service vào peripheral manager, delegate method `peripheralManager(_ peripheral: CBPeripheralManager, didAdd service: CBService, error: Error?)` sẽ được gọi.

```swift
func peripheralManager(_ peripheral: CBPeripheralManager, didAdd service: CBService, error: Error?) {
     if let error = error {
        print("Add service failed: \(error.localizedDescription)")
        return
    }
    print("Add service succeeded")
}

```

Chúng ta gần xong rồi, chỉ còn một bước nữa: Bắt đầu advertising peripheral để nó có thể được tìm thấy bởi các central khác.

```swift
peripheralManager.startAdvertising([CBAdvertisementDataLocalNameKey: "TiTan",
                                    CBAdvertisementDataServiceUUIDsKey : [self.service!.uuid]])
```

Sau khi advertising, delegate method `peripheralManagerDidStartAdvertising` sẽ được kích hoạt để chỉ ra liệu peripheral đã advertising thành công hay chưa.

```swift
func peripheralManagerDidStartAdvertising(_ peripheral: CBPeripheralManager, error: Error?) {
    if let error = error {
        print("Start advertising failed: \(error.localizedDescription)")
        return
    }
    print("Start advertising succeeded")
}
```

Tại thời điểm này, chúng ta đã định nghĩa và publish các service của mình. Từ bây giờ, peripheral có thể được khám phá bởi các central thông qua CoreBluetooth.

![](/Post-Resources/PlayRolesInCoreBluetooth/Peripheral_Result.png "")

## Thiết lập Central
Đầu tiên, chúng ta cần tạo một instance của class `CBCentralManager`.
```swift
class ViewController: UIViewController, CBCentralManagerDelegate, UITableViewDelegate, UITableViewDataSource, CBPeripheralDelegate {
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        centralManager = CBCentralManager(delegate: self, queue: nil)
        ...
    }
}
```
Giống như peripheral manager, có một tham số `queue` trong constructor. Các event của vai trò central sẽ được dispatch trên queue được cung cấp. Nếu chúng ta truyền `nil`, main queue sẽ được sử dụng.
Chúng ta cần đợi central manager sẵn sàng, sau đó chúng ta sẽ bắt đầu scan các thiết bị gần đó.
```swift
func centralManagerDidUpdateState(_ central: CBCentralManager) {
    print("peripheralManagerDidUpdateState \(central.state.rawValue)")

    if central.state == .poweredOn {
        self.centralManager.scanForPeripherals(withServices: nil, options: nil)
    }
}
```
Nếu nó tìm thấy một peripheral, delegate method `func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber)` sẽ được gọi.
```swift
func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
    if let name = peripheral.name {
        if (!checkIfExisted(name)) {
            let tupleDeviceInfo = (device: peripheral, rssi: RSSI)
            self.scannedDevices.append(tupleDeviceInfo)
        }

        DispatchQueue.main.async {
            self.tbvScannedDevices.reloadData()
        }
    }
}
```
Bên trong method, chúng ta sẽ kiểm tra xem peripheral có hợp lệ không, sau đó chúng ta sẽ thêm nó vào danh sách hiện tại, rồi reload table view. Lưu ý rằng giá trị RSSI đại diện cho cường độ của tín hiệu truyền. Chúng ta có thể ước tính khoảng cách hiện tại giữa central và peripheral dựa trên giá trị này. Giá trị càng lớn, thiết bị càng gần.
Build và chạy project, bạn sẽ thấy danh sách các thiết bị được phát hiện như thế này.

<img src="/Post-Resources/PlayRolesInCoreBluetooth/Scan_Devices.png" height="500" />

Bây giờ, hãy kết nối với peripheral của chúng ta (Thiết bị "Titan") bằng cách click vào hàng tương ứng.
Khi một kết nối được thực hiện thành công, delegate method `func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral)` sẽ được gọi. Nếu không, method `centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?)` sẽ được kích hoạt.

```swift
func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
    self.centralManager.stopScan()
    peripheral.delegate = self
    self.peripheral = peripheral
    self.peripheral?.discoverServices(nil) [1]
}
```

```swift
centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
    // Fail to connect peripheral
}
```
Lưu ý rằng sau khi kết nối với peripheral, chúng ta cần discover các service của peripheral để sử dụng nó ([1]).
Delegate method `func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?)` sẽ được gọi sau khi discovering services.

```swift
func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
    if let err = error {
        print("didDiscoverServices fail \(err.localizedDescription)")
        return
    }

    // [1] Start discovering all chars
    for service in (peripheral.services)! {
        peripheral.discoverCharacteristics(nil, for: service)
    }
}
```

Chúng ta vẫn chưa xong =.= Sau khi discovering services, chúng ta cũng cần discover tất cả các characteristic của các service tại [1].
Giống như các method khác, method `func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?)` sẽ được gọi sau khi discovering characteristics cho một service.

```swift
func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
    if let error = error {
        print("didDiscoverCharacteristicsFor Error \(error.localizedDescription)")
        return
    }
    for char in service.characteristics! {
        if char.properties.contains(.notify) {
            peripheral.setNotifyValue(true, for: char) [1]
        }
        ...
    }
}
```

Như bạn thấy, chúng ta cần đặt notify cho characteristic chứa thuộc tính `notify` để nhận cập nhật từ nó. [1]
Cuối cùng, chúng ta đã hoàn thành việc thiết lập kết nối giữa peripheral và central. Bây giờ hãy khám phá dữ liệu.

## Đọc và ghi dữ liệu từ peripheral
Bạn phải chỉ định characteristic nào bạn muốn đọc.
```swift
self.peripheral?.readValue(for: discovererChars[kCharacteristicUUID]!)
```
Từ phía peripheral, bạn sẽ nhận được một read request bên trong method
```swift
func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveRead request: CBATTRequest) {
    print("Read request")
    request.value = myValue.data(using: .utf8)
    peripheral.respond(to: request, withResult: .success)
}
```
Sau khi peripheral phản hồi các read request, delegate method `func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?)` sẽ được gọi từ phía central.
```swift
 func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
    let value = String.init(data: characteristic.value!, encoding: .utf8)!
    ...
}
```
Nếu giá trị được lấy thành công, bạn có thể truy cập nó thông qua thuộc tính value của characteristic, như trên.
Đôi khi chúng ta muốn ghi giá trị của một characteristic có thể ghi được. Chúng ta có thể ghi giá trị vào nó bằng cách gọi method `writeValue` của peripheral như thế này.
```swift
self.peripheral?.writeValue(data, for: discovererChars[kCharacteristicUUID]!, type: .withResponse)
```
Có một argument gọi là `type`, bạn chỉ định loại write bạn muốn thực hiện. Trong ví dụ trên, loại write là .withResponse, yêu cầu peripheral cho ứng dụng của bạn biết liệu việc write có thành công hay không.
Từ phía peripheral, bạn sẽ nhận được một write request bên trong method
```swift
func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveWrite requests: [CBATTRequest]) {
    print("Write request")
    peripheral.respond(to: requests[0], withResult: .success)
}
```
Sau khi write request nhận được phản hồi, method `peripheral(_ peripheral: CBPeripheral, didWriteValueFor characteristic: CBCharacteristic, error: Error?)` sẽ được gọi.
```swift
func peripheral(_ peripheral: CBPeripheral, didWriteValueFor characteristic: CBCharacteristic, error: Error?) {
    if let err = error {
        print("Did write value with error \(err.localizedDescription)")
    }
}
```
## Giá trị characteristic được mã hóa
Đôi khi chúng ta muốn bảo mật dữ liệu nhạy cảm. Chúng ta có thể cấu hình các thuộc tính và permission characteristic phù hợp. Như thế này

```swift
let encryptedChar = CBMutableCharacteristic.init(
                type: CBUUID(string: kCharacteristicUUID),
                properties: [.read, .notify, .notifyEncryptionRequired],
                value: nil,
                permissions: [.readable])
```

Bằng cách này, chúng ta đảm bảo rằng chỉ các thiết bị đáng tin cậy mới có quyền truy cập vào các dữ liệu này.
Trong ví dụ của tôi, một khi kết nối được thực hiện, CoreBluetooth cố gắng ghép nối peripheral (iPad) với central (iPhone) để tạo kết nối an toàn. Cả hai thiết bị sẽ nhận được một cảnh báo chỉ ra rằng thiết bị kia muốn ghép nối. Sau khi ghép nối, central có thể truy cập các giá trị characteristic được mã hóa của peripheral.

<img src="/Post-Resources/PlayRolesInCoreBluetooth/Paring_Request.png" height="200" />

## Một số lưu ý quan trọng
- Mô hình client-server của BLE được gọi là *mô hình publish và subscribe*.
- Peripheral chỉ tiêu thụ năng lượng khi nó đang advertising các service của mình, hoặc nhận hoặc phản hồi yêu cầu của central.
- Bạn có thể truyền một danh sách các service UUID bên trong method `scanForPeripherals`. Khi bạn chỉ định một danh sách các service UUID, central manager chỉ trả về các peripheral advertising những service đó, cho phép bạn chỉ scan các thiết bị mà bạn có thể quan tâm.
- Bạn cần cấp quyền để cho phép ứng dụng của bạn sử dụng phụ kiện Bluetooth LE, và hoạt động như một phụ kiện Bluetooth LE cho phía peripheral. (Đi đến project -> Capabilities để thiết lập).
- Bạn cũng cần thêm một thuộc tính thông tin nữa vào info.plist của bạn, hãy thêm một entry với key `Privacy - Bluetooth Peripheral Usage Description` và value `App communicates using CoreBluetooth` (Hoặc bất cứ điều gì bạn muốn mô tả).

## Xem nhanh ứng dụng của tôi
Hãy thử một số bài tập nhẹ từ ví dụ của tôi.
<img src="/Post-Resources/PlayRolesInCoreBluetooth/Demo.gif" height="500" />

## Tóm tắt luồng lập trình cho BLE
Để tóm tắt quy trình lập trình chung của CoreBluetooth trên iOS, vui lòng xem hình ảnh dưới đây.

![](/Post-Resources/PlayRolesInCoreBluetooth/Programming_Flow_BLE.png)

## Suy nghĩ cuối cùng
Trong bài viết này, tôi đã hướng dẫn bạn cách sử dụng CoreBluetooth để tạo một peripheral cũng như cách tạo một central để kết nối và lấy dữ liệu từ peripheral. Trong tương lai, chúng ta có thể thấy rằng tất cả các thiết bị xung quanh chúng ta được kết nối với nhau thông qua Bluetooth, hướng tới thế giới IoT.
Bạn có thể tải project hoàn chỉnh của central [tại đây](https://github.com/uynguyen/CoreBluetooth_CentralManager) hoặc peripheral [tại đây](https://github.com/uynguyen/Blog_CoreBluetooth_Peripheral).
Nếu bạn có bất kỳ câu hỏi hoặc bình luận nào, hãy thoải mái để lại trên bài viết của tôi. Mọi bình luận đều được chào đón.

## Tài liệu tham khảo
[1] [Core Bluetooth Programming Guide từ Apple](https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html#//apple_ref/doc/uid/TP40013257-CH1-SW1)


