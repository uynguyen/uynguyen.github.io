---
title: 'Thực tiễn tốt nhất: Xử lý nền iOS - Background App Refresh Task'
date: 2020-09-26 21:53:32
tags:
layout: post
permalink: vi/posts/Best-practice-iOS-background-processing-Background-App-Refresh-Task/
lang: vi
---

![](/Post-Resources/RefreshInBg/RefreshAppBg.png "Cover")

Không giống như Android, iOS có các hạn chế về việc sử dụng xử lý nền trong nỗ lực cải thiện thời lượng pin và trải nghiệm người dùng. Khi ứng dụng của bạn chuyển sang chế độ nền, đó là lúc developers mất quyền kiểm soát ứng dụng của họ. Cách thức và thời điểm ứng dụng của bạn có cơ hội thực thi task hoàn toàn phụ thuộc vào hệ thống. Ở trung tâm của iOS, Apple sử dụng thuật toán phức tạp nội bộ riêng để xác định ứng dụng nào được phép chạy trong nền, dựa trên nhiều yếu tố khác nhau như mô hình hoạt động của người dùng, trạng thái pin hiện tại, v.v.
Trong hướng dẫn này, chúng ta sẽ học cách yêu cầu thời gian thực thi định kỳ trên iOS. Sau khi hiểu cách nó hoạt động, chúng ta sẽ áp dụng kỹ thuật này cho một ứng dụng dựa trên BLE trong một số trường hợp cụ thể ở hướng dẫn tiếp theo.
Bắt đầu thôi!

<!-- more -->

## Kiến thức nền tảng
Trước khi đi sâu vào thực hành, tốt hơn là hiểu cách iOS quản lý các trạng thái ứng dụng. Đây là lần đầu tiên Apple chính thức công bố một video mô tả các yếu tố hàng đầu ảnh hưởng đến thời gian khởi chạy ứng dụng tại WWDC ([WWDC 2020 - Background execution demystified](https://developer.apple.com/videos/play/wwdc2020/10063/?fbclid=IwAR1_oejf0JY9B8yV4d9riMAH4MQsLasO86iVjhwqmAruw2v64_utbuGZIEc)). Tóm lại, Apple thiết kế iOS theo cách cho phép ứng dụng giữ nội dung cập nhật một mặt. Mặt khác, iOS phải thích ứng với các mục tiêu chính:
- **Thời lượng pin**: cho phép thực thi nền trong khi vẫn duy trì thời lượng pin cả ngày.
- **Hiệu suất**: đảm bảo thực thi nền không có bất kỳ ảnh hưởng tiêu cực nào đến việc sử dụng chủ động.
- **Quyền riêng tư**: Người dùng nên biết về các background tasks dựa trên mô hình sử dụng cụ thể của họ.
- **Tôn trọng ý định người dùng**: nếu người dùng thực hiện một hành động nhất định, đảm bảo hệ thống phản hồi chính xác.

Với những mục tiêu này trong đầu, đây là 7 yếu tố hàng đầu đóng vai trò trong việc lên lịch hệ thống cho thực thi nền.

- **Pin yếu nghiêm trọng**: Khi điện thoại sắp hết pin (< 20%), thực thi nền sẽ bị hệ thống tạm dừng để tránh sử dụng pin.
- **Chế độ tiết kiệm pin**: Khi người dùng chuyển điện thoại sang chế độ tiết kiệm pin, người dùng rõ ràng chỉ ra rằng hệ thống nên bảo tồn pin chỉ cho các tác vụ quan trọng.
- **Cài đặt Background App refresh**: Người dùng có thể bật/tắt cài đặt để cho phép hoặc không cho phép một ứng dụng cụ thể chạy background tasks.
![](/Post-Resources/RefreshInBg/app_refresh_setting.png "App refresh setting")
- **Mức sử dụng ứng dụng**: Có giới hạn tài nguyên trên điện thoại nên hệ thống phải ưu tiên ứng dụng nào nó nên phân bổ tài nguyên. Thông thường, các ứng dụng người dùng sử dụng nhiều nhất. Apple cũng đề cập đến "On-device predictive engine" học các ứng dụng người dùng thường sử dụng và khi nào. On-device predictive engine sẽ dựa vào thông tin này để ưu tiên thực thi nền.
- **App switcher**: Chỉ các ứng dụng hiển thị trong App Switcher mới có cơ hội chạy background tasks.
- **Ngân sách hệ thống**: Đảm bảo các hoạt động nền không tiêu hao pin và data plans, có giới hạn pin và data của thực thi nền trong suốt cả ngày.
- **Giới hạn tốc độ**: Hệ thống thực hiện một số giới hạn tốc độ cho mỗi lần khởi chạy.

và một số yếu tố khác: Chế độ máy bay, nhiệt độ thiết bị, màn hình, trạng thái khóa thiết bị, v.v.

![](/Post-Resources/RefreshInBg/factors.png "Factors")

## Capabilities
Đảm bảo ứng dụng của bạn đã thêm các capabilities sau

![](/Post-Resources/RefreshInBg/BG-Capabilities.png "Capability")

## Trước iOS 13
Việc thiết lập background fetch trước iOS 13 khá đơn giản.
Bên trong method `application(_:didFinishLaunchingWithOptions)`, chúng ta nên thêm lệnh sau.
```swift
UIApplication.shared.setMinimumBackgroundFetchInterval(UIApplication.backgroundFetchIntervalMinimum)
```
`setMinimumBackgroundFetchInterval` chỉ định khoảng thời gian tối thiểu phải trôi qua giữa các lần thực thi background fetch. Tuy nhiên, thời điểm chính xác của sự kiện phụ thuộc vào hệ thống. Thông thường, `UIApplicationBackgroundFetchIntervalMinimum` là giá trị mặc định tốt để sử dụng.

Khi ứng dụng của bạn có cơ hội thực hiện background tasks, sự kiện `application(_:,performFetchWithCompletionHandler)` sẽ được kích hoạt.
```swift
func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    Logger.shared.debug("\(Date().toString()) perfom bg fetch")
    completionHandler(.newData)
}
```

**Đừng quên gọi callback `completionHandler`. Nếu bạn không gọi callback này, hệ thống không biết task của bạn đã hoàn thành, dẫn đến việc hạn chế ứng dụng của bạn được đánh thức trong các sự kiện tiếp theo**

Để simulate background fetch, từ tab bar > Debug > Simulate background fetch. Lưu ý rằng nó chỉ hoạt động khi chạy trên thiết bị thật.

![](/Post-Resources/RefreshInBg/simulate_bg_fetch.png "Simulate background fetch")

<iframe width="100%" height="415" src="https://www.youtube.com/embed/oOysGc_f0pA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## iOS 13+, Xử lý nền nâng cao - WWDC 2019 và Background execution demystified - WWDC 2020
[Tại WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/707/), Apple giới thiệu một framework mới để lên lịch công việc nền: `BackgroundTasks`. Framework mới này hỗ trợ tốt hơn cho các tasks cần được thực hiện trong nền. Có hai loại tasks được hỗ trợ bởi `BackgroundTasks` framework: `BGAppRefreshTaskRequest`, và `BGProcessingTaskRequest`. Với sự xuất hiện của framework mới, Apple đánh dấu deprecated cho framework cũ từ iOS 13, và không còn hỗ trợ trên MacOS.
Đầu tiên, chúng ta phải đăng ký các identifiers của background tasks được thực thi trong ứng dụng. Mở file `info.plist`, và thêm thông tin sau.
```bash
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
    <string>YOUR_REFRESH_TASK_ID</string>
    <string>YOUR_PROCESSING_TASK_ID</string>
</array>
```

Quên bước trên dẫn đến crash ở runtime.
```swift
2020-10-11 08:24:40.648838+0700 TestBgTask[275:5188] *** Terminating app due to uncaught exception 'NSInternalInconsistencyException', reason: 'No launch handler registered for task with identifier com.example.bgRefresh'
```

`BGAppRefreshTaskRequest` được sử dụng khi bạn cần thực thi một task trong nền trong thời gian ngắn.
Các refresh tasks như fetching social media feed, emails mới, giá cổ phiếu mới nhất, v.v. phù hợp để lên lịch bởi `BGAppRefreshTaskRequest`. 30s là thời gian hệ thống cho phép task của bạn thực thi mỗi lần khởi chạy.

Vài phút thời gian chạy để hoàn thành công việc khi bạn đăng ký `BGProcessingTaskRequest`. Các tasks như Core ML training trên thiết bị nên được đăng ký bởi `BGProcessingTaskRequest`.

Để đăng ký background tasks, bên trong method `application(_:didFinishLaunchingWithOptions)`, chúng ta nên thêm lệnh sau.

```swift
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        if #available(iOS 13, *) {
            BGTaskScheduler.shared.register(forTaskWithIdentifier: appRefreshTaskId, using: nil) { task in
                Logger.shared.info("[BGTASK] Perform bg fetch \(appRefreshTaskId)")
                task.setTaskCompleted(success: true)
                self.scheduleAppRefresh()
            }

            BGTaskScheduler.shared.register(forTaskWithIdentifier: appProcessingTaskId, using: nil) { task in
                Logger.shared.info("[BGTASK] Perform bg processing \(appProcessingTaskId)")
                task.setTaskCompleted(success: true)
                self.scheduleBackgroundProcessing()
            }
        }
    }

    @available(iOS 13.0, *)
    func scheduleAppRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: "YOUR_REFRESH_TASK_ID")

        request.earliestBeginDate = Date(timeIntervalSinceNow: 5 * 60) // Refresh after 5 minutes.

        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            print("Could not schedule app refresh task \(error.localizedDescription)")
        }
    }

     @available(iOS 13.0, *)
    func scheduleBackgroundProcessing() {
        let request = BGProcessingTaskRequest(identifier: appProcessingTaskId)
        request.requiresNetworkConnectivity = true // Need to true if your task need to network process. Defaults to false.
        request.requiresExternalPower = true // Need to true if your task requires a device connected to power source. Defaults to false.

        request.earliestBeginDate = Date(timeIntervalSinceNow: 5 * 60) // Process after 5 minutes.

        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            print("Could not schedule image fetch: (error)")
        }
    }
}
```

Một điều nữa cần làm. Khi ứng dụng vào nền, chúng ta sẽ bắt đầu lên lịch background tasks.

```swift
func applicationDidEnterBackground(_ application: UIApplication) {
    Logger.shared.info("App did enter background")
    if #available(iOS 13, *) {
        self.scheduleAppRefresh()
        self.scheduleBackgroundProcessing()
    }
}
```

**Như thường lệ, điều quan trọng là gọi `task.setTaskCompleted(success: true)` càng nhanh càng tốt**.
Bạn có thể nhận thấy rằng sau khi gọi `task.setTaskCompleted(success: true)`, chúng ta cần gọi `self.scheduleAppRefresh()` và `self.scheduleBackgroundProcessing()` lại để lên lịch lại các tasks này cho hệ thống.

### Simulate background task và background processing
May mắn thay, Apple hỗ trợ cách để kích hoạt thực thi nền.
Sau khi submit task của bạn cho hệ thống, tạm dừng ứng dụng bằng bất kỳ break point nào. Sau đó, nhập lệnh sau vào Xcode console.
```bash
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"YOUR_REFRESH_TASK_ID || YOUR_PROCESSING_TASK_ID"]
```
Output sẽ là
```swift
2020-10-11 08:53:58.628667+0700 TestBgTask[381:17115] 💚-2020-10-11 08:53:58.628 +0700 Start schedule app refresh
(lldb) e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"com.example.bgRefresh"]
2020-10-11 08:54:01.927263+0700 TestBgTask[381:16973] Simulating launch for task with identifier com.example.bgRefresh
2020-10-11 08:54:03.669153+0700 TestBgTask[381:17095] Starting simulated task: <decode: missing data>
2020-10-11 08:54:07.560697+0700 TestBgTask[381:17095] Marking simulated task complete: <BGAppRefreshTask: com.example.bgRefresh>
2020-10-11 08:54:07.560750+0700 TestBgTask[381:17012] 💙-2020-10-11 08:54:06.045 +0700 [BGTASK] Perform bg fetch com.example.bgRefresh
2020-10-11 08:54:07.563846+0700 TestBgTask[381:17012] 💚-2020-10-11 08:54:07.562 +0700 Start schedule app refresh
```

<iframe width="100%" height="415" src="https://www.youtube.com/embed/e6KFwzZKmns" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


## Kỳ vọng vs Thực tế
Bạn có thể kỳ vọng rằng thực thi nền sẽ được phân phối đều trong suốt cả ngày.
![](/Post-Resources/RefreshInBg/Expectation.png "Expectation")

Tuy nhiên, đây là những gì chúng ta quan sát được trong thực tế. Vì 7 yếu tố tôi đã giới thiệu ở đầu hướng dẫn này, "On-device predictive engine" học mô hình sử dụng của người dùng và hiểu rằng người dùng thường mở ứng dụng vào buổi sáng, giờ ăn trưa và buổi tối. Đó là lý do tại sao hệ thống sẽ cho phép background tasks của bạn khởi chạy ngay trước khi người dùng đưa ứng dụng lên foreground. Các yếu tố khác ảnh hưởng đến kết quả là nếu người dùng bật "Chế độ tiết kiệm pin", hoặc nếu điện thoại rơi vào trạng thái pin yếu nghiêm trọng.
![](/Post-Resources/RefreshInBg/Reality.png "Reality")

## Lời khuyên tốt nhất
- Background tasks sẽ không chạy cho đến khi thiết bị được mở khóa lần đầu tiên sau khi khởi động lại.
- Chúng ta có thể kiểm tra xem người dùng có đang ở chế độ tiết kiệm pin không:
```swift
ProcessInfo.processInfo.isLowPowerModeEnabled
NSProcessInfoPowerStateDidChange
```
- Chúng ta cũng có thể kiểm tra trạng thái "background refresh setting".
```swift
UIApplication.shared.backgroundRefreshStatus
UIApplication.backgroundStatusDidChangeNotification
```
- Tối thiểu hóa sử dụng data: Sử dụng thumbnails thay vì full images, và chỉ download những gì thực sự cần thiết.
- Tối thiểu hóa tiêu thụ điện năng: tránh sử dụng phần cứng không cần thiết như GPS, accelerometer, v.v. Ngoài ra, đảm bảo bạn hoàn thành task càng sớm càng tốt.
- Sử dụng `BackgroundURLSession` để chuyển công việc từ ứng dụng sang hệ thống.

## Tổng kết
Trong bài viết này, chúng ta đã đi sâu vào các yếu tố góp phần vào thực thi nền của bạn, và hiểu sự khác biệt chính giữa `BGAppRefreshTaskRequest` và `BGProcessingTaskRequest`. Chúng ta cũng thực hiện một demo project để xem nó thực sự hoạt động như thế nào trong thực tế.
Lần tới, bạn có thể chọn loại request phù hợp nhất với tasks của mình, và cách bạn có thể phản hồi một cách khéo léo với ý định của người dùng.
Hy vọng, thông tin mà bài viết này mang lại giúp bạn xây dựng ứng dụng tốt hơn: tươi mới và tối ưu hóa.
Có một kỹ thuật khác để đánh thức ứng dụng của bạn, silent notification. Chúng ta sẽ nói về nó trong hướng dẫn tiếp theo.
Chúc cuối tuần vui vẻ!

## Tài liệu tham khảo
1. [Background execution demystified WWDC 2020](https://developer.apple.com/videos/play/wwdc2020/10063)
2. [Advances in App Background Execution WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/707/)
