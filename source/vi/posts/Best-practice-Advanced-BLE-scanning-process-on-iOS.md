---
title: 'Best practice: Quy trình quét BLE nâng cao trên iOS'
date: 2020-08-23 09:51:43
tags: [iOS, BLE]
layout: post
lang: vi
thumbnail: /Post-Resources/ScanningInBG/cover.png
---

Các nhà phát triển iOS đang xây dựng các ứng dụng đóng vai trò cả Peripheral và Central để trao đổi dữ liệu với các bản sao ứng dụng khác. Dữ liệu có thể trao đổi một lượng nhỏ thông tin thông qua các gói tin BLE hoặc giá trị chỉ báo cường độ tín hiệu (RSSI) từ thiết bị này sang thiết bị khác. Tuy nhiên, việc giữ ứng dụng chạy mãi ở foreground là không thể. Sớm hay muộn, ứng dụng sẽ chuyển sang chế độ background bởi người dùng và cuối cùng sẽ bị hệ thống tạm dừng tùy thuộc vào RAM khả dụng, mức tiêu thụ năng lượng và các yếu tố khác. Do đó, việc hiểu quy trình advertising và scanning trên thiết bị iOS giúp bạn xây dựng các ứng dụng tốt đáp ứng kỳ vọng của bạn.
Ở cuối hướng dẫn này, chúng ta sẽ xây dựng một ứng dụng đơn giản hoạt động vừa là scanner vừa là advertiser. Khi hai ứng dụng tìm thấy nhau, chúng sẽ ghi một bản ghi log để phân tích. Dựa trên kết quả, chúng ta sẽ tìm hiểu xem ứng dụng của mình sử dụng Core Bluetooth hiệu quả như thế nào.
Hãy bắt đầu thôi!

<!-- more -->

## Kiến thức nền tảng

Theo sách `Getting Started With Bluetooth Low Energy`, hai mục đích chính của các gói tin advertising là:
- Để broadcast dữ liệu cho các ứng dụng.
- Để khám phá các slave và kết nối với chúng.

Kích thước tối đa của payload mỗi gói tin advertising là **31 bytes**, cùng với thông tin header. Mỗi khoảng thời gian trôi qua, từ 20ms đến 10.24s, các gói tin advertising được broadcast một cách mù quáng để thông báo sự hiện diện của nó cho các thiết bị hoặc ứng dụng khác. Có hai loại phương pháp scanning:
- **Passive Scanning**: Scanner chỉ đơn giản nhận các gói tin advertising mà không có bất kỳ hành động nào tiếp theo.
- **Active Scanning**: Sau khi nhận được gói tin advertising, scanner thực hiện gói tin Scanning Request đến advertiser. Sau khi nhận được Scanning Request, advertiser phản hồi bằng gói tin Scanning Response cho phép advertiser gửi thêm dữ liệu (Thêm 31 bytes) đến scanner.

![](/Post-Resources/ScanningInBG/ScanningProcedures.png "Quy trình Scanning")

Để phân loại các loại gói tin advertising, chúng ta dựa vào ba thuộc tính: `connectability`, `scannability`, và `directability`

Loại gói tin Adv             |  Connectability: Xác định scanner có thể tạo kết nối hay không | Scannability: Xác định scanner có thể gửi scan request hay không | Directability: Xác định gói tin này có nhắm đến bất kỳ scanner cụ thể nào không.
:-------------------------:|:-------------------------|:-------------------------:|:-------------------------:
ADV_IND | Có | Có | Không
ADV_DIRECT_IND | Có | Không | Có
ADV_NONCONN_IND | Không | Không | Không
ADV_SCAN_IND | Không | Có | Không

Có nhiều chủ đề nâng cao hơn được mô tả chi tiết trong sách `Getting Started With Bluetooth Low Energy`, như cách dữ liệu được tổ chức trong các thiết bị BLE và cách giao tiếp với phần cứng hiện có, v.v. Nếu bạn muốn biết thêm, vui lòng tham khảo sách.
Vì phạm vi của bài viết này, việc hiểu về quy trình advertising là đủ tốt để chúng ta chuyển sang phần tiếp theo.

## Scanning và advertising trên iOS

### Thiết lập advertiser - Peripheral

Chúng ta sẽ tái sử dụng repo trước đó của tôi cho phép điện thoại iOS advertise như một peripheral sử dụng Core Bluetooth.
Đầu tiên, tôi sẽ tạo 5 UUID làm service của advertiser (Peripheral).

```swift
let kServiceUUID1 = "1FA2FD8A-17E0-4D3B-AF45-305DA6130E39"
...
let kServiceUUID4 = "4FA2FD8A-17E0-4D3B-AF45-305DA6130E39"
let kServiceUUID5 = "5FA2FD8A-17E0-4D3B-AF45-305DA6130E39"
```

Tiếp theo, tôi sẽ tạo một danh sách `CBMutableService` và sau đó thêm chúng vào đối tượng `CBPeripheralManager`.

```swift
services.forEach { (each) in
    let cbService = CBMutableService(type: each.uuid.cbUUID, primary: true)
    var charArr = [CBMutableCharacteristic]()

    each.characteristics.forEach { (char) in
        charArr.append(CBMutableCharacteristic.init(
            type: char.uuid.cbUUID,
        properties: [.read, .write, .notify],
        value: nil,
        permissions: CBAttributePermissions(char.permissions.map { $0.cbAttributePermission } )))
    }

    cbService.characteristics = charArr

    self.peripheralManager.add(cbService)
}
```

Cuối cùng, chúng ta bắt đầu advertising peripheral khi state của nó sẵn sàng.

```swift
self.peripheralManager.startAdvertising([CBAdvertisementDataLocalNameKey: "uynguyen",
                                        CBAdvertisementDataServiceUUIDsKey: self.cbServices.map { $0.uuid }])
```

Khi đoạn code trên được thực thi, chúng ta sẽ thấy log sau được in ra.

```bash
Add service 1FA2FD8A-17E0-4D3B-AF45-305DA6130E39 Succeeded
---> Chars [<CBMutableCharacteristic: 0x2802d4070 UUID = 463FED20-DA93-45E7-B00F-B5CD99775150, Value = (null), Properties = 0x1A, Permissions = 0x3, Descriptors = (null), SubscribedCentrals = (
)>, <CBMutableCharacteristic: 0x2802d4380 UUID = 463FED21-DA93-45E7-B00F-B5CD99775150, Value = (null), Properties = 0x112, Permissions = 0x1, Descriptors = (null), SubscribedCentrals = (
)>, <CBMutableCharacteristic: 0x2802d4620 UUID = 463FED22-DA93-45E7-B00F-B5CD99775150, Value = {length = 6, bytes = 0x486168616861}, Properties = 0x2, Permissions = 0x1, Descriptors = (null), SubscribedCentrals = (
)>]

...

Add service 5FA2FD8A-17E0-4D3B-AF45-305DA6130E39 Succeeded
---> Chars []

===> Start advertising Succeeded
```

### Thiết lập scanner - Central
Bước tiếp theo là thiết lập Central Manager - scanner của chúng ta. Như bạn có thể biết từ hướng dẫn trước của tôi, code để quét các thiết bị gần đó khá đơn giản.
```swift
private func startScanning() {
    self.centralManager?.scanForPeripherals(withServices: nil,
                                            options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
}
```

- Giá trị `nil` chúng ta truyền vào param `withServices` chỉ ra rằng chúng ta sẽ quét tất cả các thiết bị gần đó mà không chỉ định service uuid.
- Option `CBCentralManagerScanOptionAllowDuplicatesKey` chỉ định việc quét nên chạy mà không lọc trùng lặp.

Khi central phát hiện một peripheral, chúng ta sẽ in thông tin của nó bao gồm local name và giá trị `CBAdvertisementDataServiceUUIDsKey` trong gói tin advertising.

```swift
public func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
    print("Did found per \(peripheral.name)")
    print("CBAdvertisementDataServiceUUIDsKey adv value " + advertisementData[CBAdvertisementDataServiceUUIDsKey])
// ...
}
```

Hãy build và chạy project,

```bash
Did found peripheral name: Optional("Uy Nguyen iPad")
CBAdvertisementDataServiceUUIDsKey adv value:
Optional(<__NSArrayM 0x282a79350>(
    1FA2FD8A-17E0-4D3B-AF45-305DA6130E39
))
```

Nhìn vào log, bạn có thể phát hiện điều gì sai không? Có một vấn đề với gói tin advertising: giá trị `CBAdvertisementDataServiceUUIDsKey` chỉ chứa 1 service, các service còn lại từ 2 đến 5 ở đâu?

Hãy in ra toàn bộ gói tin advertising để xem nó chứa gì.

```bash
["kCBAdvDataServiceUUIDs": <__NSArrayM 0x283460630>(
1FA2FD8A-17E0-4D3B-AF45-305DA6130E39
)
, "kCBAdvDataLocalName": uynguyen, "kCBAdvDataTimestamp": 620013184.4512661, "kCBAdvDataRxPrimaryPHY": 0, "kCBAdvDataIsConnectable": 1, "kCBAdvDataRxSecondaryPHY": 0]
```

Vẫn không may, chúng ta không thể tìm thấy các service khác từ `"2FA2FD8A-17E0-4D3B-AF45-305DA6130E39"` đến `"5FA2FD8A-17E0-4D3B-AF45-305DA6130E39"`.

### Tìm hiểu vấn đề
Hóa ra gói tin advertising mà Central nhận được phụ thuộc vào cách chúng ta gọi method `scanForPeripherals`.
Nếu chúng ta thay đổi param `withServices` thành một mảng các service của chúng ta từ `"1FA2FD8A-17E0-4D3B-AF45-305DA6130E39"` đến `"5FA2FD8A-17E0-4D3B-AF45-305DA6130E39"` một cách rõ ràng, chúng ta sẽ thấy sự khác biệt.
```swift
private func startScanning() {
    self.centralManager?.scanForPeripherals(withServices: [CBUUID(string: "1FA2FD8A-17E0-4D3B-AF45-305DA6130E39"),
                                                            CBUUID(string: "2FA2FD8A-17E0-4D3B-AF45-305DA6130E39"),
                                                            CBUUID(string: "3FA2FD8A-17E0-4D3B-AF45-305DA6130E39"),
                                                            CBUUID(string: "4FA2FD8A-17E0-4D3B-AF45-305DA6130E39"),
                                                            CBUUID(string: "5FA2FD8A-17E0-4D3B-AF45-305DA6130E39")],
                                                            options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
}
```

Đây là log nhận được.

```bash
["kCBAdvDataIsConnectable": 1, "kCBAdvDataServiceUUIDs": <__NSArrayM 0x280708750>(
1FA2FD8A-17E0-4D3B-AF45-305DA6130E39
)
, "kCBAdvDataLocalName": uynguyen, "kCBAdvDataRxSecondaryPHY": 0, "kCBAdvDataHashedServiceUUIDs": <__NSArrayM 0x280708720>(
2FA2FD8A-17E0-4D3B-AF45-305DA6130E39,
3FA2FD8A-17E0-4D3B-AF45-305DA6130E39,
4FA2FD8A-17E0-4D3B-AF45-305DA6130E39,
5FA2FD8A-17E0-4D3B-AF45-305DA6130E39
)
, "kCBAdvDataRxPrimaryPHY": 0, "kCBAdvDataTimestamp": 620013608.239601]
```

Bây giờ, chúng ta có thể thấy giá trị mới chứa bên trong gói tin advertising, `kCBAdvDataHashedServiceUUIDs`. Nhưng nó là gì?
Hãy quay lại phía Peripheral, nếu bạn nhìn kỹ hơn vào định nghĩa của method advertising của đối tượng Peripheral, bạn có thể biết nó thực sự là gì.

![](/Post-Resources/ScanningInBG/advertising_method.png "Định nghĩa Advertising")

Nói ngắn gọn, khi bạn làm cho iPhone advertise như một peripheral, nếu không có không gian cho bất kỳ service UUID nào chứa trong giá trị của `CBAdvertisementDataServiceUUIDsKey`, các service này sẽ được chuyển đến một không gian khác gọi là `overflow area`.

Một thuật ngữ khác, T_T Chính xác `overflow area` có nghĩa là gì?
Về cơ bản, `overflow area` được đặt trong gói tin scan response. Các service uuid này được hash bởi thuật toán của Apple và chỉ được phát hiện bởi thiết bị iOS quét chúng một cách rõ ràng. Trong trường hợp của chúng ta, vì chúng ta truyền các service uuid từ 1F đến 5F khi bắt đầu scanning, chúng ta sẽ nhận được giá trị `kCBAdvDataHashedServiceUUIDs` này trong các gói tin advertising.

Để xác minh điều này, tôi sử dụng một công cụ được Apple giới thiệu để debug BLE - ([A New Way to Debug iOS Bluetooth Applications](https://www.bluetooth.com/blog/a-new-way-to-debug-iosbluetooth-applications/)), để lấy gói tin advertising từ Peripheral của chúng ta để phân tích.
Và đây là kết quả

![](/Post-Resources/ScanningInBG/Adv_Packets.png "Các gói tin Advertising")

- Loại gói tin Advertising: `ADV_IND`, có nghĩa là scanner có thể tạo kết nối với nó; và scanner có thể gửi scan request; và các gói tin của nó không nhắm đến bất kỳ scanner cụ thể nào.
- Hộp màu vàng là dữ liệu advertising: (Data: 02 01 1A 11 06 39 0E 13 A6 5D 30 45 AF 3B 4D E0 17 8A FD A2 1F 09 09 75 79 6E 67 75 79 65 6E), độ dài = 31 bytes; nó chứa `CBAdvertisementDataLocalName` (75 79 6E 67 75 79 65 6E > "uynguyen") và service uuid đầu tiên của chúng ta 1F A2 FD 8A 17 E0 4D 3B AF 45 30 5D A6 13 0E 39 (39 0E 13 A6 5D 30 45 AF 3B 4D E0 17 8A FD A2 1F).
- Gói tin scan response (SCAN_RSP) chứa các thông tin khác mà gói tin advertising không đủ độ dài để mang theo. Trong trường hợp của chúng ta, nó chứa các service khác từ 2F đến 5F. Việc hiểu gói tin này khá phức tạp để đưa vào hướng dẫn này nên tôi sẽ bỏ qua việc giải thích nó bây giờ. Tôi có một hướng dẫn khác làm việc với gói tin này sau.

Tóm lại, điều chúng ta đã tìm ra ở đây là: Advertising, khi ứng dụng ở background, hoạt động khác với khi ở foreground.
- `CBAdvertisementDataLocalNameKey` bị bỏ qua.
- Tất cả service UUID chứa trong giá trị của key CBAdvertisementDataServiceUUIDsKey được đặt trong vùng "overflow" đặc biệt; chúng chỉ có thể được phát hiện bởi thiết bị iOS đang quét chúng một cách rõ ràng.

## Kiểm thử

Bảng dưới đây tóm tắt những gì chúng ta đã điều tra.
```bash
* YES có nghĩa là Central có thể tìm thấy Peripheral.
```

#### Trường hợp 1 - Cả màn hình Peripheral và Central đều bật

   \                |  Peripheral Background          | Peripheral Foreground
:------------------:|:-------------------:|:-------------------------:
**Central Background**          | Có                 | Có
**Central Foreground**          | Có                 | Có

#### Trường hợp 2 - Màn hình Peripheral tắt (khóa), màn hình Central bật

   \                |  Peripheral Background          | Peripheral Foreground
:------------------:|:-------------------:|:-------------------------:
**Central Background**          | Có                 | Có
**Central Foreground**          | Có                 | Có

#### Trường hợp 3 - Màn hình Central tắt (khóa), màn hình Peripheral bật

   \                |  Peripheral Background          | Peripheral Foreground
:------------------:|:-------------------:|:-------------------------:
**Central Background**          | Không                 | Không
**Central Foreground**          | Không                 | Không

#### Trường hợp 4 - Cả màn hình Peripheral và Central đều tắt (khóa)

   \                |  Peripheral Background          | Peripheral Foreground
:------------------:|:-------------------:|:-------------------------:
**Central Background**          | Không                 | Không
**Central Foreground**          | Không                 | Không

Từ các thí nghiệm trên, bất kể trạng thái của thiết bị đóng vai trò Peripheral, màn hình của thiết bị đóng vai trò Central phải bật để nó có thể quét các peripheral gần đó. Nói cách khác, nếu chúng ta đang xây dựng một ứng dụng cho phép thiết bị iOS phát hiện các thiết bị iOS gần đó khác, chúng ta `phải chạy cả chế độ Central và Peripheral trên mỗi thiết bị VÀ quan trọng nhất, nếu hai thiết bị muốn tìm thấy nhau, một trong hai màn hình phải được bật.`
Có một kỹ thuật (Có vẻ như là một mẹo) để vượt qua vấn đề này, đó là lên lịch định kỳ để đẩy notification đến các thiết bị iOS của bạn, việc này ngay lập tức bật màn hình lên để Central có thể phát hiện các Peripheral gần đó.
Khi ứng dụng ở background, nó hoạt động khác với khi ở foreground. Một trong số đó là tần suất các gói tin advertising được gửi có thể giảm. Kết quả là, Scanner ở background tìm các peripheral gần đó chậm hơn so với khi ở foreground.

## Kết luận

Chúc mừng! Chúng ta đã đi qua một hướng dẫn để có cái nhìn sâu hơn về cách CoreBluetooth trên iOS hoạt động ở cả chế độ Central và Peripheral. Hy vọng bạn thấy bài viết này thú vị!
Nếu bạn có bất kỳ ý kiến nào, hãy gửi email cho tôi tại uynguyen.itus@gmail.com hoặc để lại câu hỏi của bạn trong hộp bình luận.

`Made with love.`
