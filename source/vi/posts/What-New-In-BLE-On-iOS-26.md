---
title: 'Có gì mới trong BLE trên iOS 26?'
date: 2026-01-30 10:00:00
tags: [iOS, BLE, WWDC26]
lang: vi
layout: post
---

![](/Post-Resources/BLEiOS26/cover.png "Banner")

Apple tiếp tục nâng cao khả năng Bluetooth Low Energy trong iOS 26, mang đến các tính năng mới và cải tiến cho các nhà phát triển xây dựng trải nghiệm kết nối. Trong bài viết này, chúng ta sẽ khám phá những bổ sung mới nhất cho Core Bluetooth và cách chúng có thể mang lại lợi ích cho ứng dụng của bạn.

<!-- more -->

## Tổng quan

iOS 26 giới thiệu một số cập nhật quan trọng cho framework Core Bluetooth:

- **Hỗ trợ Channel Sounding**: Đo khoảng cách độ chính xác cao sử dụng Bluetooth 6.0 Channel Sounding
- **Quét nền nâng cao**: Các chế độ nền mới với lập lịch thông minh
- **Connection Subrating**: Điều chỉnh tham số kết nối động để tiết kiệm năng lượng tốt hơn
- **Cải thiện kiểm soát quyền riêng tư**: API ủy quyền mới và luồng đồng ý người dùng
- **Cải tiến LE Audio**: Tích hợp tốt hơn với các tính năng Bluetooth LE Audio

Hãy cùng đi sâu vào từng cập nhật thú vị này!

## Hỗ trợ Channel Sounding

Một trong những tính năng được mong đợi nhất trong iOS 26 là hỗ trợ **Bluetooth 6.0 Channel Sounding**. Công nghệ này cho phép đo khoảng cách ở mức centimet giữa các thiết bị, một cải tiến đáng kể so với đo khoảng cách dựa trên RSSI.

### Channel Sounding là gì?

Channel Sounding (trước đây được gọi là High Accuracy Distance Measurement hoặc HADM) sử dụng các phép đo dựa trên pha và thời gian khứ hồi để tính toán khoảng cách chính xác giữa hai thiết bị Bluetooth. Không giống như RSSI, có thể bị ảnh hưởng bởi các yếu tố môi trường, Channel Sounding cung cấp độ chính xác nhất quán bất kể chướng ngại vật hoặc phản xạ.

### API mới

iOS 26 giới thiệu class `CBChannelSounding` và các API liên quan:

```swift
import CoreBluetooth

class RangingManager: NSObject, CBCentralManagerDelegate, CBChannelSoundingDelegate {
    var centralManager: CBCentralManager!
    var channelSounding: CBChannelSounding?

    func startRanging(with peripheral: CBPeripheral) {
        // Kiểm tra xem Channel Sounding có được hỗ trợ không
        guard CBChannelSounding.isSupported else {
            print("Channel Sounding không được hỗ trợ trên thiết bị này")
            return
        }

        // Tạo phiên Channel Sounding
        let config = CBChannelSoundingConfiguration()
        config.mode = .roundTripTime  // hoặc .phaseBasedRanging
        config.updateInterval = 0.1   // cập nhật mỗi 100ms

        channelSounding = CBChannelSounding(
            peripheral: peripheral,
            configuration: config,
            delegate: self
        )

        channelSounding?.startRanging()
    }

    // MARK: - CBChannelSoundingDelegate

    func channelSounding(_ channelSounding: CBChannelSounding,
                         didUpdateDistance distance: CBDistance) {
        print("Khoảng cách: \(distance.meters) mét")
        print("Độ tin cậy: \(distance.confidence)")
        print("Góc phương vị: \(distance.azimuth ?? 0) độ")
    }

    func channelSounding(_ channelSounding: CBChannelSounding,
                         didFailWithError error: Error) {
        print("Đo khoảng cách thất bại: \(error.localizedDescription)")
    }
}
```

### Các trường hợp sử dụng

Channel Sounding mở ra những khả năng mới cho các ứng dụng iOS:

- **Điều hướng trong nhà chính xác**: Hướng dẫn người dùng với độ chính xác cấp centimet
- **Theo dõi tài sản**: Định vị vật phẩm với độ chính xác chưa từng có
- **Tự động hóa dựa trên khoảng cách**: Kích hoạt hành động dựa trên khoảng cách chính xác
- **Âm thanh không gian**: Định vị nguồn âm thanh chính xác trong không gian 3D

## Quét nền nâng cao

iOS 26 giới thiệu chế độ quét nền mới cân bằng giữa hiệu quả khám phá và thời lượng pin.

### Lập lịch quét thông minh

API `CBScanSchedule` mới cho phép nhà phát triển định nghĩa các mẫu quét thông minh:

```swift
class BackgroundScanner: NSObject, CBCentralManagerDelegate {
    var centralManager: CBCentralManager!

    func configureBackgroundScanning() {
        // Tạo lịch quét cho hoạt động nền
        let schedule = CBScanSchedule()

        // Quét 2 giây mỗi 30 giây
        schedule.scanDuration = 2.0
        schedule.scanInterval = 30.0

        // Tăng tần suất khi các thiết bị được nhìn thấy gần đây
        schedule.adaptiveMode = .recentActivity

        // Định nghĩa các quy tắc dựa trên thời gian
        schedule.addTimeRule(
            CBScanTimeRule(
                startHour: 8,
                endHour: 18,
                scanInterval: 15.0  // Thường xuyên hơn trong giờ làm việc
            )
        )

        // Áp dụng lịch
        let options: [String: Any] = [
            CBCentralManagerScanOptionAllowDuplicatesKey: false,
            CBCentralManagerScanOptionScheduleKey: schedule
        ]

        centralManager.scanForPeripherals(
            withServices: [targetServiceUUID],
            options: options
        )
    }
}
```

### Cải thiện việc gửi kết quả nền

iOS 26 cũng cải thiện cách kết quả quét được gửi đến các ứng dụng chạy nền:

```swift
func centralManager(_ central: CBCentralManager,
                    didDiscover peripheral: CBPeripheral,
                    advertisementData: [String: Any],
                    rssi RSSI: NSNumber) {
    // Mới: Truy cập ngữ cảnh gửi
    if let context = advertisementData[CBAdvertisementDataDeliveryContextKey] as? CBDeliveryContext {
        print("Phát hiện trong: \(context.mode)")  // .foreground, .background, .suspended
        print("Thời gian từ khi quét: \(context.latency) giây")
        print("Kích thước batch: \(context.batchCount)")
    }
}
```

## Connection Subrating

Connection Subrating là tính năng Bluetooth 5.3 mà iOS 26 giờ đây hoàn toàn mở cho các nhà phát triển. Nó cho phép điều chỉnh động các tham số kết nối mà không cần chi phí của việc cập nhật tham số đầy đủ.

### Cách hoạt động

Thay vì thương lượng các tham số kết nối mới (đòi hỏi nhiều lần trao đổi gói), Connection Subrating cho phép bạn chuyển đổi giữa các "subrate" được định nghĩa trước ngay lập tức:

```swift
class ConnectionManager: NSObject, CBPeripheralDelegate {

    func configureConnectionSubrating(for peripheral: CBPeripheral) {
        // Định nghĩa các tham số subrating
        let subrateConfig = CBConnectionSubrateConfiguration()

        // Khoảng cách kết nối cơ bản: 15ms
        subrateConfig.baseInterval = 0.015

        // Định nghĩa các hệ số subrate (bội số của khoảng cách cơ bản)
        subrateConfig.subrateFactor = 4      // 60ms khi không hoạt động
        subrateConfig.subrateLatency = 10    // Có thể bỏ qua tối đa 10 sự kiện

        // Thời gian chuyển đổi
        subrateConfig.continuationNumber = 2  // Số sự kiện trước khi subrate kích hoạt

        peripheral.setConnectionSubrate(subrateConfig) { error in
            if let error = error {
                print("Không thể đặt subrating: \(error)")
            } else {
                print("Đã cấu hình connection subrating")
            }
        }
    }

    // Yêu cầu chế độ độ trễ thấp ngay lập tức cho các thao tác nhạy cảm thời gian
    func requestLowLatency(for peripheral: CBPeripheral) {
        peripheral.requestSubrateChange(factor: 1) { error in
            // Giờ đang hoạt động ở khoảng cách cơ bản (15ms)
            self.performTimeSensitiveOperation()
        }
    }

    // Trở về chế độ tiết kiệm năng lượng
    func returnToLowPower(for peripheral: CBPeripheral) {
        peripheral.requestSubrateChange(factor: 4) { error in
            // Trở lại khoảng cách 60ms
        }
    }
}
```

### Lợi ích

- **Chuyển đổi nhanh hơn**: Chuyển đổi giữa các chế độ năng lượng trong micro giây thay vì mili giây
- **Thời lượng pin tốt hơn**: Tự động giảm tần suất kết nối khi không hoạt động
- **Độ trễ thấp hơn**: Nhanh chóng tăng cường cho các thao tác nhạy cảm thời gian

## Cải thiện kiểm soát quyền riêng tư

iOS 26 giới thiệu các API quyền riêng tư mới cho phép người dùng kiểm soát nhiều hơn việc truy cập Bluetooth đồng thời cung cấp cho nhà phát triển các luồng ủy quyền rõ ràng hơn.

### Quyền chi tiết

Ứng dụng giờ có thể yêu cầu các khả năng Bluetooth cụ thể:

```swift
class PrivacyAwareManager {

    func requestPermissions() async throws {
        // Chỉ yêu cầu các khả năng bạn cần
        let status = try await CBCentralManager.requestAuthorization(
            for: [
                .scanning,           // Khám phá thiết bị lân cận
                .connecting,         // Kết nối đến peripheral
                .backgroundScanning  // Quét khi chạy nền
            ]
        )

        switch status {
        case .authorized:
            print("Đã cấp quyền truy cập đầy đủ")
        case .partiallyAuthorized(let granted):
            print("Các khả năng được cấp: \(granted)")
        case .denied:
            print("Quyền truy cập bị từ chối")
        @unknown default:
            break
        }
    }
}
```

### Yêu cầu Privacy Manifest

iOS 26 yêu cầu các ứng dụng khai báo việc sử dụng Bluetooth trong Privacy Manifest:

```xml
<!-- PrivacyInfo.xcprivacy -->
<dict>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryBluetooth</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>BLE.device-communication</string>
                <string>BLE.proximity-detection</string>
            </array>
        </dict>
    </array>
</dict>
```

### Bảo vệ danh tính thiết bị

Các API mới giúp bảo vệ danh tính thiết bị trong khi vẫn cho phép chức năng cần thiết:

```swift
func centralManager(_ central: CBCentralManager,
                    didDiscover peripheral: CBPeripheral,
                    advertisementData: [String: Any],
                    rssi RSSI: NSNumber) {
    // Mới: Định danh ẩn danh thay đổi định kỳ
    let anonymousID = peripheral.anonymousIdentifier

    // Kiểm tra xem đây có phải là thiết bị người dùng đã tương tác trước đó không
    if peripheral.hasUserRelationship {
        // Có thể truy cập định danh ổn định
        let stableID = peripheral.identifier
    }
}
```

## Cải tiến LE Audio

iOS 26 cải thiện tích hợp giữa Core Bluetooth và các tính năng Bluetooth LE Audio.

### Quét Broadcast Audio

Ứng dụng giờ có thể khám phá và tương tác với các broadcast Bluetooth LE Audio:

```swift
class LEAudioScanner: NSObject, CBCentralManagerDelegate {
    var centralManager: CBCentralManager!

    func scanForBroadcasts() {
        let options: [String: Any] = [
            CBCentralManagerScanOptionScanTypeKey: CBScanType.leAudioBroadcast
        ]

        centralManager.scanForPeripherals(
            withServices: nil,
            options: options
        )
    }

    func centralManager(_ central: CBCentralManager,
                        didDiscoverBroadcast broadcast: CBLEAudioBroadcast) {
        print("Tìm thấy broadcast: \(broadcast.broadcastName ?? "Không xác định")")
        print("Thông tin chương trình: \(broadcast.programInfo ?? "N/A")")
        print("Broadcast ID: \(broadcast.broadcastID)")

        // Kiểm tra cấu hình âm thanh
        for subgroup in broadcast.subgroups {
            print("Codec: \(subgroup.codecConfiguration)")
            print("Ngôn ngữ: \(subgroup.language ?? "Không xác định")")
        }
    }
}
```

### Tích hợp Auracast

iOS 26 cung cấp API để khám phá và kết nối với các broadcast Auracast tại các địa điểm công cộng:

```swift
class AuracastManager {

    func discoverNearbyAuracast() async -> [CBLEAudioBroadcast] {
        // Khám phá các broadcast Auracast với ngữ cảnh vị trí
        let broadcasts = try await CBLEAudioBroadcast.discover(
            timeout: 10.0,
            includeLocationContext: true
        )

        return broadcasts.filter { $0.isAuracast }
    }

    func joinBroadcast(_ broadcast: CBLEAudioBroadcast) async throws {
        // Yêu cầu quyền người dùng để tham gia âm thanh công cộng
        guard await broadcast.requestUserPermission() else {
            throw AuracastError.permissionDenied
        }

        // Đồng bộ với broadcast
        try await broadcast.synchronize()

        // Định tuyến âm thanh đến đầu ra hệ thống
        try await broadcast.startReceiving()
    }
}
```

## Hướng dẫn di chuyển

Nếu bạn đang cập nhật từ iOS 25, đây là những thay đổi chính cần lưu ý:

### API không còn được khuyến nghị

```swift
// Không còn được khuyến nghị trong iOS 26
centralManager.scanForPeripherals(withServices: nil, options: nil)

// Sử dụng thay thế - cấu hình quét rõ ràng
let config = CBScanConfiguration()
config.services = nil  // Quét tất cả dịch vụ
config.allowDuplicates = false
centralManager.scanForPeripherals(with: config)
```

### Khả năng bắt buộc mới

Thêm vào `Info.plist` của bạn:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>bluetooth-central</string>
    <string>bluetooth-peripheral</string>
    <!-- Mới trong iOS 26 -->
    <string>bluetooth-ranging</string>
</array>
```

### Thay đổi không tương thích

1. **Khởi tạo CBPeripheralManager**: Giờ yêu cầu chỉ định queue rõ ràng
2. **Khôi phục nền**: Protocol delegate khôi phục mới `CBRestorationDelegate`
3. **Thương lượng MTU**: Tăng MTU tự động giờ là tùy chọn qua connection options

### Danh sách kiểm tra áp dụng

- [ ] Cập nhật lên Xcode 18 với iOS 26 SDK
- [ ] Thêm các mục Privacy Manifest cho việc sử dụng Bluetooth
- [ ] Xem xét và cập nhật logic quét nền
- [ ] Kiểm tra Channel Sounding trên phần cứng được hỗ trợ
- [ ] Di chuyển các lệnh gọi API không còn được khuyến nghị
- [ ] Cập nhật xử lý tham số kết nối cho hỗ trợ subrating

## Kết luận

iOS 26 mang đến những cải tiến có ý nghĩa cho phát triển Bluetooth Low Energy. Channel Sounding cho phép đo khoảng cách chính xác, quét nền nâng cao cải thiện thời lượng pin, và Connection Subrating cung cấp tối ưu hóa năng lượng động. Kết hợp với các kiểm soát quyền riêng tư được cải thiện và hỗ trợ LE Audio, những cập nhật này giúp việc xây dựng các ứng dụng kết nối đáng tin cậy, tiết kiệm năng lượng và tôn trọng quyền riêng tư trở nên dễ dàng hơn.

Hệ sinh thái BLE tiếp tục phát triển, và cam kết của Apple trong việc áp dụng các tiêu chuẩn Bluetooth mới nhất đảm bảo các nhà phát triển iOS có quyền truy cập vào các khả năng tiên tiến. Hãy bắt đầu thử nghiệm với các API mới này ngay hôm nay và chuẩn bị ứng dụng của bạn cho thế hệ trải nghiệm kết nối tiếp theo!

## Tài liệu tham khảo

- [Tài liệu Apple Core Bluetooth](https://developer.apple.com/documentation/corebluetooth)
- [Phiên WWDC26: Có gì mới trong Core Bluetooth](https://developer.apple.com/videos/)
- [Đặc tả Channel Sounding của Bluetooth SIG](https://www.bluetooth.com/specifications/)
- [Đặc tả lõi Bluetooth 6.0](https://www.bluetooth.com/specifications/specs/core-specification-6-0/)
- [Auracast Broadcast Audio](https://www.bluetooth.com/auracast/)
