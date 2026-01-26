---
title: "iOS 18: Có gì mới trong CoreBluetooth?"
date: 2024-11-03 10:33:53
tags:
layout: post
permalink: vi/posts/iOS-18-What-s-news-in-CoreBluetooth/
lang: vi
---

![](/Post-Resources/AccessorySetupKit/cover.png "AccessorySetupKit")

`AccessorySetupKit`, được giới thiệu trong iOS 18, cách mạng hóa cách các phụ kiện Bluetooth và Wi-Fi của bên thứ ba tích hợp với các thiết bị iOS. Framework này mang lại trải nghiệm thiết lập liền mạch, tăng cường sự tiện lợi cho người dùng và mở rộng khả năng cho các nhà phát triển.
Trong khi `AccessorySetupKit` hỗ trợ khám phá cho các thiết bị Bluetooth, Wi-Fi và Local Network, bài viết này sẽ tập trung cụ thể vào BLE (Bluetooth Low Energy). Quy trình thiết lập cho các thiết bị Wi-Fi và Local Network tuân theo cách tiếp cận tương tự.

<!-- more -->

## Các tính năng chính
Dưới đây, chúng ta sẽ khám phá các chức năng chính làm cho `AccessorySetupKit` trở thành một thay đổi lớn cho việc quản lý phụ kiện.
- **Quy trình Pairing được đơn giản hóa**: Người dùng giờ đây có thể pair hoặc unpair phụ kiện và bật/tắt Bluetooth trực tiếp trong ứng dụng, loại bỏ nhu cầu phải vào cài đặt hệ thống. Cách tiếp cận được đơn giản hóa này nâng cao trải nghiệm người dùng và giảm thời gian thiết lập.
- **Quản lý truy cập thống nhất**: Khi một phụ kiện được pair, nó xuất hiện trong phần "Accessories" mới trong cài đặt Privacy. Tại đây, người dùng có thể quản lý quyền và xem các thiết bị đã kết nối, cung cấp một vị trí tập trung cho việc quản lý phụ kiện.
- **Kiểm soát nâng cao cho nhà phát triển**: Các nhà phát triển có thể định nghĩa các bộ lọc quét và cung cấp hình ảnh và tên tùy chỉnh cho thiết bị, đảm bảo trải nghiệm thiết lập có thương hiệu.

## Luồng thiết lập
Bạn có thể tìm thấy dự án mẫu được cung cấp bởi Apple tại [WWWDC24](https://developer.apple.com/videos/play/wwdc2024/10203/).
Để mô phỏng các phụ kiện, tôi đã sử dụng CoreBluetooth và định nghĩa Bluetooth profile của mình với hai UUID khác nhau: `1FA2FD8A-17E0-4D3B-AF45-305DA6130E39` và `1FA2FD8A-17E0-4D3B-AF45-305DA6130E38`, sau đó bắt đầu advertising chúng.
Tiếp theo, bạn cần sửa đổi scanning UUID service trong file Info.plist của bạn để khớp với các Bluetooth profile của bạn. Điều này thông báo cho hệ thống về các loại phụ kiện mà ứng dụng của bạn hỗ trợ.
Apple hỗ trợ các loại filter khác nhau, như:

```js
<dict>
    <key>NSAccessorySetupBluetoothCompanyIdentifiers</key>
    <array>
        #Matches the key of an advertised manufacturing data field
    </array>
    <key>NSAccessorySetupBluetoothServices</key>
    <array>
        #Matches either an advertised service UUID field or the key (service UUID) of an advertised service data field
    </array>
    <key>NSAccessorySetupBluetoothNames</key>
    <array>
        #Match any substring within the advertised name
    </array>
    <key>NSAccessorySetupKitSupports</key>
    <array>
        <string>Bluetooth</string>
    </array>
</dict>
```

Tiếp theo, tạo một `ASAccessorySession`. Session này rất cần thiết để quản lý quy trình thiết lập phụ kiện, cho phép bạn hiển thị accessory picker cho người dùng và xử lý các sự kiện liên quan đến phụ kiện một cách hiệu quả.

```js
private var session = ASAccessorySession()
```

Sau đó, hiển thị `Accessory Picker`. Điều này cho phép bạn hiển thị giao diện picker, cho phép người dùng dễ dàng chọn và pair phụ kiện của họ với ứng dụng.

```js
let pickerDevice1: ASPickerDisplayItem = {
    let descriptor = ASDiscoveryDescriptor()
    descriptor.bluetoothServiceUUID = ###

    return ASPickerDisplayItem(
        name: ###,
        productImage: UIImage(named: ###)!,
        descriptor: descriptor
    )
}()

let pickerDevice2: ASPickerDisplayItem = {
    let descriptor = ASDiscoveryDescriptor()
    descriptor.bluetoothServiceUUID = ###

    return ASPickerDisplayItem(
        name: ###,
        productImage: UIImage(named: ###)!,
        descriptor: descriptor
    )
}()

session.showPicker(for: [pickerDevice1, pickerDevice2]) { error in
    if let error {
        print("Failed to show picker due to: \(error.localizedDescription)")
    }
}
```

Người dùng bây giờ sẽ thấy danh sách các thiết bị được khám phá và có thể chọn một để bắt đầu quy trình pairing, theo luồng tiêu chuẩn.

```js
private func handleSessionEvent(event: ASAccessoryEvent) {
    switch event.eventType {
        case .accessoryAdded, .accessoryChanged:
            guard let device = event.accessory else { return }
            # Save your device
        case .activated:
            guard let device = session.accessories.first else { return }
            # Save your device
        case .accessoryRemoved:
            # Clean up
        case .pickerDidPresent:
            # Your logic
        case .pickerDidDismiss:
            # Your logic
        default: ###
    }
}
```

![](/Post-Resources/AccessorySetupKit/flow.png "AccessorySetupKit")

## Điều gì quan trọng?

`AccessorySetupKit` đơn giản hóa quy trình thiết lập cho người dùng, làm cho nó trực quan và hiệu quả hơn trong khi loại bỏ sự phức tạp thường liên quan đến việc kết nối phụ kiện của bên thứ ba.
Đối với các nhà phát triển, nó cung cấp một framework tích hợp được tiêu chuẩn hóa, đảm bảo trải nghiệm người dùng nhất quán và codebase đơn giản hóa. Bằng cách áp dụng `AccessorySetupKit`, các nhà phát triển có thể mang lại trải nghiệm liền mạch và gắn kết, đưa các phụ kiện của bên thứ ba phù hợp với các tiêu chuẩn cao mà người dùng liên kết với các sản phẩm Apple.


## Tài liệu tham khảo
[Meet AccessorySetupKit, WWWDC 2024](https://developer.apple.com/videos/play/wwdc2024/10203/)
[iOS 18 AccessorySetupKit: Everything BLE Developers Need To Know](https://punchthrough.com/ios18-accessorysetupkit-everything-ble-developers-need-to-know/)

