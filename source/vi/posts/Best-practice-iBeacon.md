---
title: 'Thực hành tốt nhất: iBeacon'
date: 2018-08-18 21:17:47
tags: [BLE, iOS, iBeacon]
layout: post
lang: vi
---
![](/Post-Resources/ibeacon/ibeacon.png "Delivery")
Chào mừng bạn đến với phần tiếp theo của series "[Cách xử lý BLE ở chế độ background](/2018/07/23/Best-practice-How-to-deal-with-Bluetooth-Low-Energy-in-background/)".
Trong phần trước, tôi đã hướng dẫn bạn cách giữ cho ứng dụng của bạn sống càng lâu càng tốt khi ứng dụng vào chế độ background bằng cách sử dụng kỹ thuật *State Preservation and Restoration* được Apple hỗ trợ. Tuy nhiên, có một số trường hợp sử dụng mà kỹ thuật này không thể xử lý được, như mô tả bên dưới (tham khảo [tài liệu Apple: Conditions Under Which Bluetooth State Restoration Will Relaunch An App](https://developer.apple.com/library/archive/qa/qa1962/_index.html))
![](/Post-Resources/ibeacon/condition_relaunch.png "Các điều kiện mà Bluetooth State Restoration sẽ khởi chạy lại ứng dụng")
Như bạn thấy, có một trường hợp phổ biến khi người dùng force quit ứng dụng từ multiple task view (Dù vô tình hay cố ý), kỹ thuật Restoration không thể đánh thức ứng dụng của bạn. Hãy tưởng tượng rằng ứng dụng của bạn có một tính năng cho phép người dùng nhấn một nút trên thiết bị BLE đã kết nối của bạn để tìm điện thoại của họ ở đâu, nhưng nếu ứng dụng của bạn không chạy hoặc không thể thức dậy để xử lý tín hiệu BLE gửi từ thiết bị của bạn, tính năng này sẽ vô dụng.
Trong bài viết này, tôi sẽ hướng dẫn bạn một kỹ thuật sử dụng iBeacon để giải quyết trường hợp này, giúp ứng dụng của bạn có thêm một cơ hội để thức dậy mặc dù nó đã bị người dùng terminate. Hãy bắt đầu!
<!-- more -->
## Chào mừng đến với thế giới iBeacon
[iBeacon](https://en.wikipedia.org/wiki/IBeacon) là một protocol được Apple giới thiệu lần đầu tại WWDC 2013. "iBeacon dựa trên cảm biến độ gần Bluetooth low energy bằng cách truyền một universally unique identifier được nhận bởi một ứng dụng hoặc hệ điều hành tương thích. Identifier và một vài byte được gửi cùng với nó có thể được sử dụng để xác định vị trí vật lý của thiết bị, theo dõi khách hàng, hoặc kích hoạt một hành động dựa trên vị trí trên thiết bị như check-in trên mạng xã hội hoặc push notification" (Wiki).
Ứng dụng của iBeacon rất đa dạng như dịch vụ dựa trên vị trí, thương mại di động hoặc quảng cáo, để kể tên một vài.
"The Automatic Museum Guide" là một project rất ấn tượng với tôi được xây dựng trên công nghệ iBeacon. Ứng dụng cho phép khách tham quan khám phá các hiện vật bằng cách hiển thị nội dung phù hợp bằng cách theo dõi vị trí của họ và khoảng cách của họ với beacon. Đó là một ý tưởng tuyệt vời!
<center>
	<iframe width="100%" height="400" src="https://www.youtube.com/embed/LlNLAAUkcRs" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</center>

## Cách hoạt động
Apple đã chuẩn hóa nội dung của dữ liệu advertisement iBeacon. Nó bao gồm một UUID 16 byte, phiên bản major và minor. Ba yếu tố này là duy nhất cho mỗi beacon. Một trường cuối cùng trong packet là TX power được sử dụng để xác định bạn gần beacon đến mức nào.
Một beacon broadcast packet này trong phạm vi của nó, xa từ 20m đến 300m, theo các khoảng thời gian đều đặn. Các packet này được các điện thoại gần đó tự động phát hiện, sau đó ứng dụng sẽ thực hiện một hành động được định nghĩa trước như hiển thị notification hoặc pop-up một mã khuyến mãi.

![](/Post-Resources/ibeacon/iBeacon_format.png "Định dạng dữ liệu iBeacon")
![](/Post-Resources/ibeacon/how_ibeacon_work.png "Định dạng dữ liệu iBeacon")

Mặc dù iBeacon dựa trên công nghệ Bluetooth low energy, một trong những khác biệt chính giữa hai là iBeacon là công nghệ truyền một chiều, nghĩa là chỉ điện thoại mới có thể nhận dữ liệu từ các thiết bị iBeacon.

## Tích hợp iOS: bắt đầu advertising như một iBeacon
Đầu tiên, chúng ta cần một beacon để có thể thực hiện bước tiếp theo. Tôi sẽ sử dụng iPad của mình để hoạt động như một beacon bằng cách sử dụng đối tượng `CLBeaconRegion` trong CoreBluetooth trên iOS.
UI chính chỉ đơn giản chứa hai nút chính sẽ bắt đầu và dừng advertisement của iBeacon, tương ứng.
![](/Post-Resources/ibeacon/ibeacon_device.png "UI chính iBeacon")

```swift
let region = CLBeaconRegion(proximityUUID: self.uuid!,
                                        major: self.major,
                                        minor: self.minor,
                                        identifier: self.identifier)
let peripheralData = region.peripheralData(withMeasuredPower: nil)
peripheral.startAdvertising(((peripheralData as NSDictionary) as! [String : Any]))
```

Sau đó, chúng ta triển khai delegate `peripheralManagerDidStartAdvertising(CBPeripheralManager, Error?)` để kiểm tra xem beacon có advertise thành công không.
```swift
func peripheralManagerDidStartAdvertising(_ peripheral: CBPeripheralManager, error: Error?) {
    if error == nil {
        print("Successfully started advertising our beacon data.")
    } else {
        print("Failed to advertise our beacon. Error = \(String(describing: error))")
    }
}
```

Để dừng advertising
```swift
peripheralManager?.stopAdvertising()
```

## Tận dụng công nghệ iBeacon để làm cho ứng dụng của chúng ta tồn tại mãi mãi
Đầu tiên, bên trong method `didFinishLaunchingWithOptions` của class `AppDelegate`, tôi sẽ hiển thị một notification để được thông báo bất cứ khi nào ứng dụng của chúng ta được khởi chạy lại.
```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    NotificationHandler.shared.showNotification(title: "App did launch", body: "")
    return true
}
```

Sau khi main view xuất hiện, tôi sẽ báo cho location manager bắt đầu monitoring region đã cho và bắt đầu ranging các iBeacon trong region đó
```swift
func startMonitoring() {
    locationManager.startMonitoring(for: beaconRegion)
    locationManager.startRangingBeacons(in: beaconRegion)
}
```
Theo mặc định, monitoring thông báo cho bạn khi region được enter hoặc exit bất kể ứng dụng của bạn có đang chạy hay không. Mặt khác, ranging chỉ giám sát độ gần của region khi ứng dụng của bạn đang chạy.

Đó là tất cả cho việc thiết lập. Trong phần demo sau, bạn sẽ thấy tôi mở ứng dụng rồi terminate nó từ multiple task view. Sau đó, tôi nhấn nút "Start advertising" trên iPad của tôi (Beacon). Bạn sẽ thấy ứng dụng được khởi chạy lại ngay lập tức mặc dù nó đã bị kill (Notification "App did launch" hiện lên). Thật tuyệt vời.
<center>
    <img src="/Post-Resources/ibeacon/ibeacon_relaunch.gif" width="300">
</center>

*Lưu ý*: Đừng mong đợi nhận được event ngay lập tức, vì chỉ boundary crossing mới tạo ra event. Đặc biệt, nếu vị trí của người dùng đã ở bên trong region tại thời điểm đăng ký, location manager không tự động tạo event. Thay vào đó, ứng dụng của bạn phải đợi người dùng vượt qua ranh giới region trước khi event được tạo và gửi đến delegate.

## Kết luận
Một trong những điều thú vị nhất của iBeacon là các ứng dụng iBeacon có thể được đánh thức ngay cả khi nó đã bị người dùng terminate. Điều này có nghĩa là các ứng dụng iBeacon có thể tồn tại mãi mãi. Để tải các project hoàn chỉnh, vui lòng click vào các link Github sau:
- Hoạt động như một iBeacon: https://github.com/uynguyen/iBeaconDevice
- Ứng dụng Central manager: https://github.com/uynguyen/CentralManager-iBeacon

Hãy thoải mái gửi email cho tôi nếu bạn có bất kỳ câu hỏi nào.

## Tài liệu tham khảo
[1] [Region Monitoring and iBeacon](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/LocationAwarenessPG/RegionMonitoring/RegionMonitoring.html)

