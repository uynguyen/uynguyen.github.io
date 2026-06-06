---
title: Remote Notification
date: 2021-04-08 18:22:07
tags: [iOS, Notification]
layout: post
lang: vi
thumbnail: /Post-Resources/Remote_Notification/remote_notification.png
---

Push notification cho phép ứng dụng của bạn tiếp cận người dùng thường xuyên hơn, và cũng có thể thực hiện một số tác vụ. Trong hướng dẫn này, chúng ta sẽ học cách cấu hình ứng dụng để nhận remote notifications, hiển thị nội dung và sau đó thực hiện một số hành động khi người dùng nhấn vào.
Hãy bắt đầu.

<!-- more -->
### APNs

APNs, viết tắt của Apple Push Notification service, là một dịch vụ gửi messages đến ứng dụng của bạn. Thông tin notification được gửi có thể bao gồm badges, sounds, nội dung tùy chỉnh, hoặc text alerts tùy chỉnh. Lưu ý rằng bạn cần một tài khoản developer trả phí để có thể cấu hình ứng dụng với Push Notification capability. Bạn cũng cần một thiết bị vật lý để testing nếu bạn muốn khởi chạy remote notifications vì push notifications không khả dụng trong simulator. Bạn chỉ có thể simulate notifications trên simulators.

### Cấu hình
Đầu tiên, bạn cần thêm push notifications entitlement vào project của bạn,
Đi đến Project Setting > Signing Capabilities > + Capability > Thêm `Push Notification`

![](/Post-Resources/Remote_Notification/add_noti.png "")

Nếu bạn muốn gửi notifications đến thiết bị thật, bạn cần làm một số bước bổ sung để có notification key:

1. Đăng nhập vào [Apple developer](https://developer.apple.com/account/resources/certificates/list)
2. Dưới phần `Keys` > Thêm keys mới > Nhập tên key của bạn > Chọn `Apple Push Notifications service (APNs)` > Tiếp tục.
![](/Post-Resources/Remote_Notification/create_key.png "")
3. Download key và lưu nó vào bất kỳ vị trí nào bạn muốn lưu key này. Lưu ý tên file của key file có pattern `AuthKey_[Key ID].p8`

### Yêu cầu quyền từ người dùng
Tiếp theo, ứng dụng cần xin quyền từ người dùng để hiển thị notifications.
Mở `AppDelegate.swift` và thêm code sau

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // The rest omitted
    self.registerPushNotifications()
    ...
}

func registerPushNotifications() {
    UNUserNotificationCenter.current()
        .requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            guard granted else { return }
            // If the user allows showing notification, then register the device to receive a push notification
            self.registerForRemoteNotification()
    }
}

func registerForRemoteNotification() {
    UNUserNotificationCenter.current().getNotificationSettings { settings in
        guard settings.authorizationStatus == .authorized else { return }

        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
}

```

Nếu quá trình hoàn thành thành công, callback `didRegisterForRemoteNotificationsWithDeviceToken:` sẽ được gọi bao gồm device token của bạn (Một giá trị duy nhất để xác định thiết bị của bạn, lưu ý rằng nó khác nhau mỗi khi bạn cài đặt lại ứng dụng).
Nếu có lỗi xảy ra, `didFailToRegisterForRemoteNotificationsWithError:` sẽ được kích hoạt.

```swift
func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    print("Did register remote notification successfully \(deviceToken.hexadecimalString)")
}

func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("Did failed register remote notification \(error.localizedDescription)")
    // e.g Did failed register remote notification no valid "aps-environment" entitlement string found for application
}
```

Lưu ý `Alert`, `sound`, và `badge` là tổ hợp phổ biến khi yêu cầu authorization.
Có các options khác bạn có thể tìm thấy trên [Apple doc](https://developer.apple.com/documentation/usernotifications/unauthorizationoptions).
Một cảnh báo khác là nếu bạn chạy ứng dụng trên simulator, bạn sẽ nhận được sự kiện `didFailToRegisterForRemoteNotificationsWithError` vì remote notification không được hỗ trợ trên simulators.
### Xử lý notifications khi ứng dụng ở foreground
Sau khi đăng ký remote notification thành công, nếu bạn muốn xử lý notifications khi ứng dụng của bạn ở foreground, bạn cần implement `userNotificationCenter:willPresent:withCompletionHandler` trong class của bạn.

```swift
public func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    ...
    completionHandler([.alert, .sound, .badge])
}
```

**Nếu bạn không implement function này, notifications sẽ không hiển thị nếu ứng dụng của bạn ở foreground.**
### Đã đến lúc gửi notification
Có 2 cách để test implementation của bạn. Nếu bạn không có thiết bị vật lý, đừng lo, bạn vẫn có thể simulate notifications một cách đơn giản, hoặc bạn có thể gửi notifications thật đến thiết bị thật.
#### Simulate APNs
Tạo một file với ext `.apns`. ví dụ SimulateNoti.apns, sau đó copy nội dung của bạn vào file này
```bash
{
    "Simulator Target Bundle": "YOUR_APP_BUNDLE_ID", <--- THAY ĐỔI THÀNH APP BUNDLE ID CỦA BẠN
    "aps": {
        "alert": {
            "title" : "Your title",
            "subtitle" : "Your subtitle",
            "body" : "Your body"
        },
        "sound": "default"
    }
}
```

Kéo và thả file này vào simulator mục tiêu sẽ hiển thị notification

<div style="text-align:center">

![](/Post-Resources/Remote_Notification/simulate_notification.gif "Simulation")

</div>


#### Push đến thiết bị thật
Đầu tiên, bạn cần một công cụ remote notification client giúp bạn push notification. Một công cụ tuyệt vời để test là [Push notification tester](https://github.com/onmyway133/PushNotifications). Hãy điều hướng đến website này để download và khởi chạy ứng dụng.

Sau khi khởi chạy ứng dụng thành công,
1. Chuyển sang tab `TOKEN` trong phần `Authentication`.
2. Nhấn `SELECT P8` và chọn file P8 của bạn đã được download từ bước trước, sau đó điền thông tin còn lại `KEY ID`, `TEAM ID`. `KEY ID` là một phần của tên file P8 `AuthKey_[Key ID].p8`. Đối với `TEAM ID`, bạn có thể tìm thấy nó trên trang membership của bạn.
![](/Post-Resources/Remote_Notification/membership.png "")

3. Trong phần `Body`, điền app bundle Id của bạn (ví dụ com.example.yourapp) và device token được tạo từ callback `didRegisterForRemoteNotificationsWithDeviceToken:`.
4. Soạn nội dung của bạn. Đây là body phổ biến cho push notification.
ví dụ
```bash
{
    "aps": {
        "alert": {
            "title" : "Your title",
            "subtitle" : "Your subtitle",
            "body" : "Your body"
        },
        "sound": "default"
    }
}
```

Để biết tất cả các options có sẵn trong notification, vui lòng tham khảo [Apple doc: generating_a_remote_notification](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification)

![](/Post-Resources/Remote_Notification/testing.png "")

5. Nhấn nút `Send` để gửi notification đến thiết bị đã chọn. Một message sẽ xuất hiện ở phía trên nút để hiển thị kết quả.
<center>
<img src="/Post-Resources/Remote_Notification/notification.jpeg" alt="" style="width:300px;"/>
</center>

### Silent notification
Từ góc nhìn của tôi, tính năng thú vị nhất của Push notification là "Silent notification", **có thể đánh thức ứng dụng của bạn để thực hiện một số tác vụ trong khi ứng dụng của bạn ở trong nền**, ngay cả khi ứng dụng của bạn đã bị người dùng tắt. Nhiều kỹ sư ngoài kia đang tìm cách giữ cho ứng dụng của họ sống trong nền càng nhiều càng tốt. Có một số cách để đạt được điều đó bằng cách sử dụng restoration và preservation, core location, iBeacon. Silent push notification là một trong số đó.

Tôi sẽ có [một bài viết khác](/2021/08/06/Silent-notification) nói về silent notification và thí nghiệm của tôi để chúng ta có thêm chi tiết và thông tin.

Để gửi silent notification, chỉ cần thay đổi nội dung JSON thành

```bash
{
  "aps": {
    "content-available": 1
  }
}
```

Sau khi nhấn nút `Send`, không có notification nào hiển thị trên ứng dụng của bạn.
### Suy nghĩ cuối cùng
Bằng cách sử dụng push notifications một cách khôn ngoan, bạn có thể thu hút người dùng quay lại ứng dụng của bạn. Tuy nhiên, nếu bạn lạm dụng notifications, nó có thể dẫn đến các tác dụng tiêu cực như người dùng tắt quyền cho ứng dụng của bạn hoặc đánh giá ứng dụng 1* với các phàn nàn trên store (Giống như câu chuyện của chúng tôi trong quá khứ :)).
Notifications không chỉ giúp gửi messages của bạn đến người dùng mà còn có thể được sử dụng cho các mục đích nâng cao khác như đánh thức ứng dụng của bạn bằng cách sử dụng silent notifications. Trong bài viết tiếp theo, chúng ta sẽ có cái nhìn sâu hơn về tính năng tuyệt vời này.
Nếu bạn có bất kỳ thắc mắc hoặc bình luận nào, hãy cho tôi biết.
Happy sharing!
### Tài liệu tham khảo
1. [Apple doc: Generating a remote notification](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification)
2. [Raywenderlich: Push notification tutorial](https://www.raywenderlich.com/11395893-push-notifications-tutorial-getting-started)
