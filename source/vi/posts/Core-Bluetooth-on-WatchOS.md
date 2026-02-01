---
title: Core Bluetooth trên WatchOS
tags: [WatchOS, BLE]
layout: post
lang: vi
---

![](/Post-Resources/watchos/banner.png "WatchOS banner")
Bạn đã bao giờ nghĩ đến việc thêm Watch App vào sản phẩm của mình chưa? Thắc mắc làm thế nào để CoreBluetooth hoạt động trên Watch App của bạn? Bạn đã đến đúng nơi! Hướng dẫn này là cẩm nang dành cho bạn. Trong bài viết này, chúng tôi sẽ hướng dẫn bạn từng bước qua quy trình tích hợp mượt mà dữ liệu từ các thiết bị Bluetooth vào ứng dụng Apple Watch của bạn.

<!-- more -->

Khám phá cách khai thác tiềm năng của các thiết bị Bluetooth để nâng cao trải nghiệm người dùng Apple Watch của bạn. Chúng tôi cũng sẽ cung cấp những hiểu biết về cách vượt qua các thách thức phổ biến khi làm việc với Core Bluetooth trên watchOS. Dù bạn là chuyên gia dày dạn hay người mới bắt đầu, hướng dẫn này đơn giản hóa quy trình cho bạn.

**_Môi trường: XCode 15.0.1, iOS 17.0.3, WatchOS 10.1.1, Swift 5._**

## Thiết lập project

Bắt đầu bằng cách vào cài đặt project của bạn, sau đó chọn `File` > `New Target` > `Watch OS` > `App`, và điền các trường bắt buộc. Sau khi hoàn tất, Xcode sẽ tích hợp mượt mà một project watch app mới vào workspace hiện tại của bạn.

![](/Post-Resources/watchos/create_project.png "Tạo project")

## Cấu hình Bluetooth

Về cơ bản, tất cả các method và sự kiện Bluetooth trên WatchOS rất giống với iOS. Nếu bạn đã có một class `BluetoothManager` xử lý các chức năng Bluetooth khác nhau, như khởi tạo scanning hoặc kết nối đến peripheral, và quản lý các delegate Bluetooth, bạn đã sẵn sàng.

```swift
class BluetoothManager : NSObject, CBCentralManagerDelegate {
    private var central: CBCentralManager!

    override init() {
        super.init()
        central = CBCentralManager(
            delegate: self,
            queue: nil,
            options: [:]
        )
    }

    func startScanning() {
        central.scanForPeripherals(withServices: nil, options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
    }

    func connect(periperal: CBPeripheral) {
        central.connect(periperal)
    }
    // Phần còn lại được lược bỏ
}
```

Để tiết kiệm thời gian và tránh duplicate code, bạn có thể dễ dàng chia sẻ file chứa class `BluetoothManager` với cả iOS và watch app target. Với thiết lập này, bạn có thể sử dụng class `BluetoothManager` trong watch app giống như cách bạn làm trong iOS app.

```swift
struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hello, world!")
        }
        .padding()
        .onAppear(perform: {
            BluetoothManager.shared.startScanning()
        })
    }
}
```

## Lưu ý quan trọng

- Để kiểm tra chức năng Bluetooth của project, điều cần thiết là chạy nó trên Apple Watch thật vì simulator không hỗ trợ Bluetooth.
- Hãy nhớ rằng thời gian kết nối trên Apple Watch có thể bị ảnh hưởng bởi tình trạng pin của thiết bị, ngay cả khi chế độ tiết kiệm pin không được bật.
- Đảm bảo rằng bạn thêm thủ công capability cần thiết vào file plist của Watch App. Bước này rất quan trọng; nếu không, ứng dụng của bạn sẽ không thể scan, kết nối, hoặc thực hiện bất kỳ lệnh Bluetooth nào khi nó ở background.

```
<key>UIBackgroundModes</key>
<array>
    <string>bluetooth-central</string>
</array>
```

- Không giống như Bluetooth trên iOS, nơi bạn có thể tận dụng State preservation và restoration để đánh thức ứng dụng nếu nó đã bị hệ thống terminate do các sự kiện Bluetooth (xem Best practice: [Best practice: How to deal with Bluetooth Low Energy in background](/2018/07/23/Best-practice-How-to-deal-with-Bluetooth-Low-Energy-in-background/)), điều quan trọng cần lưu ý là không có cơ chế State preservation và restoration tương đương trên watchOS.
  ![](/Post-Resources/watchos/state_preservation.png "State Preservation & Restoration")
- Thời gian kết nối trên iOS và WatchOS khá tương đương. Tôi đã đo API Connect bằng cách thực hiện 200 lần gọi (cùng thiết bị, cùng môi trường kiểm thử). Trung bình trên iOS là khoảng 0.69 giây, trong khi trên WatchOS là 0.78 giây.
  ![](/Post-Resources/watchos/connection_report.png "Báo cáo kết nối")

## Kết luận

Tóm lại, bằng cách học cách kết nối Apple Watch với các thiết bị Bluetooth, bạn đã nâng cao các tính năng của đồng hồ. Hướng dẫn này đã hướng dẫn bạn cách sử dụng Core Bluetooth trên watchOS, xử lý các vấn đề phổ biến trong quá trình đó. Dù bạn là chuyên gia hay người mới bắt đầu, chúng tôi đã phân tích cho bạn. Giờ đây, Watch App của bạn không chỉ hoạt động tốt mà còn gây ấn tượng với người dùng. Khi bạn tiếp tục phát triển ứng dụng, hãy sử dụng những kỹ năng này để tạo ra những trải nghiệm tuyệt vời và mượt mà. Happy coding!

## Tham khảo

[1] [WWDC 2021](https://developer.apple.com/videos/play/wwdc2021/10005)
[2] [WWDC 2022](https://developer.apple.com/videos/play/wwdc2022/10135/)
[3] [Core Bluetooth in watchOS Tutorial](https://www.kodeco.com/336-core-bluetooth-in-watchos-tutorial)
