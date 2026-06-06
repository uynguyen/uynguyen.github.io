---
title: 'Thực tiễn tốt nhất: Xử lý nền iOS - Background App Refresh Task'
date: 2020-09-26 21:53:32
tags: [iOS, BLE]
ping: true
layout: post
lang: vi
thumbnail: /Post-Resources/RefreshInBg/RefreshAppBg.png
---

Không giống Android, iOS hạn chế xử lý nền nhằm cải thiện thời lượng pin và trải nghiệm người dùng. Khi ứng dụng chuyển sang chế độ nền, developers mất quyền kiểm soát trực tiếp. Cách thức và thời điểm ứng dụng được phép thực thi tác vụ hoàn toàn phụ thuộc vào hệ thống. Về cơ bản, iOS sử dụng một thuật toán phức tạp để xác định ứng dụng nào được phép chạy nền, dựa trên các yếu tố như mô hình hoạt động của người dùng, trạng thái pin hiện tại và nhiều yếu tố khác.

Trong bài này, chúng ta sẽ học cách yêu cầu thời gian thực thi nền định kỳ trên iOS. Sau khi hiểu cách hoạt động, chúng ta sẽ áp dụng kỹ thuật này cho một ứng dụng BLE ở bài tiếp theo.

Bắt đầu thôi!

<!-- more -->

## Kiến thức nền tảng
Trước khi đi sâu vào thực hành, cần hiểu cách iOS quản lý các trạng thái ứng dụng. Apple đã trình bày tại WWDC một video mô tả các yếu tố hàng đầu ảnh hưởng đến thực thi nền ([WWDC 2020 - Background execution demystified](https://developer.apple.com/videos/play/wwdc2020/10063/?fbclid=IwAR1_oejf0JY9B8yV4d9riMAH4MQsLasO86iVjhwqmAruw2v64_utbuGZIEc)). Apple thiết kế iOS để cân bằng hai mục tiêu cạnh tranh nhau: giữ nội dung ứng dụng cập nhật, đồng thời đáp ứng các mục tiêu cốt lõi:

- **Thời lượng pin**: cho phép thực thi nền trong khi vẫn duy trì pin cả ngày.
- **Hiệu suất**: đảm bảo thực thi nền không ảnh hưởng tiêu cực đến việc sử dụng chủ động.
- **Quyền riêng tư**: người dùng nên được biết về các background task dựa trên mô hình sử dụng của họ.
- **Tôn trọng ý định người dùng**: nếu người dùng thực hiện một hành động nhất định, hệ thống phải phản hồi đúng.

Dưới đây là 7 yếu tố hàng đầu ảnh hưởng đến việc hệ thống lên lịch thực thi nền.

- **Pin yếu nghiêm trọng**: Khi điện thoại sắp hết pin (< 20%), hệ thống sẽ tạm dừng thực thi nền để tiết kiệm điện.
- **Chế độ tiết kiệm pin**: Khi người dùng bật chế độ này, họ đang báo hiệu rõ ràng rằng hệ thống chỉ nên ưu tiên các tác vụ quan trọng.
- **Cài đặt Background App Refresh**: Người dùng có thể bật/tắt để cho phép hoặc không cho phép ứng dụng cụ thể chạy background task.
![](/Post-Resources/RefreshInBg/app_refresh_setting.png "App refresh setting")
- **Mức sử dụng ứng dụng**: Tài nguyên trên điện thoại có giới hạn, hệ thống phải ưu tiên phân bổ cho các ứng dụng người dùng dùng nhiều nhất. Apple cũng giới thiệu "on-device predictive engine" học mô hình sử dụng của người dùng để ưu tiên thực thi nền.
- **App Switcher**: Chỉ các ứng dụng hiển thị trong App Switcher mới có cơ hội chạy background task.
- **Ngân sách hệ thống**: Để tránh thực thi nền làm cạn kiệt pin và data, có giới hạn hàng ngày về thời gian và dữ liệu sử dụng trong nền.
- **Rate limiting**: Hệ thống áp dụng một số giới hạn tốc độ theo mỗi lần khởi chạy.

Ngoài ra còn có các yếu tố khác: Chế độ máy bay, nhiệt độ thiết bị, trạng thái màn hình, trạng thái khóa thiết bị, v.v.

![](/Post-Resources/RefreshInBg/factors.png "Factors")

## Capabilities
Đảm bảo ứng dụng đã bật các capabilities sau.

![](/Post-Resources/RefreshInBg/BG-Capabilities.png "Capability")

## Trước iOS 13
Thiết lập background fetch trước iOS 13 khá đơn giản.
Bên trong method `application(_:didFinishLaunchingWithOptions)`, thêm dòng sau.
```swift
UIApplication.shared.setMinimumBackgroundFetchInterval(UIApplication.backgroundFetchIntervalMinimum)
```
`setMinimumBackgroundFetchInterval` chỉ định khoảng thời gian tối thiểu phải trôi qua giữa các lần thực thi background fetch. Tuy nhiên, thời điểm chính xác phụ thuộc vào hệ thống. Trong hầu hết trường hợp, `UIApplicationBackgroundFetchIntervalMinimum` là giá trị mặc định hợp lý.

Khi ứng dụng có cơ hội thực hiện background task, sự kiện `application(_:performFetchWithCompletionHandler)` sẽ được kích hoạt.
```swift
func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    Logger.shared.debug("\(Date().toString()) perfom bg fetch")
    completionHandler(.newData)
}
```

**Luôn luôn gọi callback `completionHandler`. Nếu không, hệ thống sẽ không biết task đã hoàn thành, dẫn đến giới hạn tần suất ứng dụng được đánh thức trong tương lai.**

Để giả lập background fetch, vào tab bar > Debug > Simulate Background Fetch. Lưu ý chỉ hoạt động trên thiết bị thật.

![](/Post-Resources/RefreshInBg/simulate_bg_fetch.png "Simulate background fetch")

<iframe width="100%" height="415" src="https://www.youtube.com/embed/oOysGc_f0pA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## iOS 13+, Xử lý nền nâng cao — WWDC 2019 và WWDC 2020
[Tại WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/707/), Apple giới thiệu framework mới để lên lịch công việc nền: `BackgroundTasks`. Framework này hỗ trợ tốt hơn cho các task cần chạy nền. Có hai loại task: `BGAppRefreshTaskRequest` và `BGProcessingTaskRequest`. Với framework mới này, Apple đã đánh dấu deprecated API background fetch cũ từ iOS 13 và ngừng hỗ trợ trên macOS.

Đầu tiên, đăng ký identifier của các background task trong `info.plist`.
```bash
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
    <string>YOUR_REFRESH_TASK_ID</string>
    <string>YOUR_PROCESSING_TASK_ID</string>
</array>
```

Bỏ qua bước này sẽ gây crash khi runtime:
```swift
2020-10-11 08:24:40.648838+0700 TestBgTask[275:5188] *** Terminating app due to uncaught exception 'NSInternalInconsistencyException', reason: 'No launch handler registered for task with identifier com.example.bgRefresh'
```

Dùng `BGAppRefreshTaskRequest` cho các task nền ngắn — ví dụ: fetch social media feed, email mới, giá cổ phiếu mới nhất. Hệ thống cấp tối đa **30 giây** thực thi mỗi lần khởi chạy.

`BGProcessingTaskRequest` cấp vài phút thời gian chạy cho các công việc nặng hơn, chẳng hạn như huấn luyện Core ML trên thiết bị.

Để đăng ký background task, thêm đoạn sau vào `application(_:didFinishLaunchingWithOptions)`.

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

Khi ứng dụng vào nền, lên lịch cả hai task để hệ thống biết cần chạy chúng sau.

```swift
func applicationDidEnterBackground(_ application: UIApplication) {
    Logger.shared.info("App did enter background")
    if #available(iOS 13, *) {
        self.scheduleAppRefresh()
        self.scheduleBackgroundProcessing()
    }
}
```

**Luôn gọi `task.setTaskCompleted(success: true)` càng sớm càng tốt.**
Lưu ý rằng sau khi gọi nó, cần gọi lại `self.scheduleAppRefresh()` và `self.scheduleBackgroundProcessing()` để lên lịch lại cho chu kỳ tiếp theo.

### Giả lập background task và background processing
Apple cung cấp cách kích hoạt thực thi nền trong quá trình phát triển.
Sau khi submit task lên hệ thống, tạm dừng ứng dụng tại bất kỳ breakpoint nào. Sau đó nhập lệnh sau vào Xcode console.
```bash
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"YOUR_REFRESH_TASK_ID || YOUR_PROCESSING_TASK_ID"]
```
Output sẽ trông như thế này:
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
Bạn có thể kỳ vọng thực thi nền được phân phối đều trong suốt cả ngày.
![](/Post-Resources/RefreshInBg/Expectation.png "Expectation")

Tuy nhiên, thực tế lại như sau. Vì 7 yếu tố đã đề cập, on-device predictive engine học mô hình sử dụng của người dùng — ví dụ, họ thường mở ứng dụng vào buổi sáng, giờ trưa và buổi tối. Vì vậy hệ thống sẽ lên lịch background task chạy ngay trước khi người dùng mở ứng dụng lên foreground. Các yếu tố khác bao gồm việc người dùng bật Chế độ tiết kiệm pin hoặc pin rơi vào trạng thái yếu nghiêm trọng.
![](/Post-Resources/RefreshInBg/Reality.png "Reality")

## Thực tiễn tốt nhất
- Background task sẽ không chạy cho đến khi thiết bị được mở khóa lần đầu sau khi khởi động lại.
- Kiểm tra xem người dùng có đang bật Chế độ tiết kiệm pin không:
```swift
ProcessInfo.processInfo.isLowPowerModeEnabled
NSProcessInfoPowerStateDidChange
```
- Kiểm tra trạng thái Background App Refresh:
```swift
UIApplication.shared.backgroundRefreshStatus
UIApplication.backgroundStatusDidChangeNotification
```
- Tối thiểu hóa sử dụng data: dùng thumbnail thay vì ảnh đầy đủ, chỉ tải những gì thực sự cần thiết.
- Tối thiểu hóa tiêu thụ điện năng: tránh dùng phần cứng không cần thiết như GPS, accelerometer. Hoàn thành task càng nhanh càng tốt.
- Dùng `BackgroundURLSession` để chuyển công việc mạng từ ứng dụng sang hệ thống.

## Tổng kết
Trong bài này, chúng ta đã khám phá các yếu tố ảnh hưởng đến thực thi nền, và hiểu sự khác biệt cốt lõi giữa `BGAppRefreshTaskRequest` và `BGProcessingTaskRequest`. Chúng ta cũng đã thực hiện một demo project để thấy nó hoạt động như thế nào trong thực tế.

Bây giờ bạn có thể chọn đúng loại request cho task của mình và phản hồi khéo léo với ý định của người dùng.
Còn một kỹ thuật khác để đánh thức ứng dụng — silent push notification. Chúng ta sẽ đề cập ở bài tiếp theo.

Chúc cuối tuần vui vẻ!

## Tài liệu tham khảo
1. [Background execution demystified WWDC 2020](https://developer.apple.com/videos/play/wwdc2020/10063)
2. [Advances in App Background Execution WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/707/)
