---
title: 'WWDC 2020 - Những lý do hàng đầu khiến ứng dụng bị kill ở chế độ nền'
date: 2021-02-25 19:03:28
tags:
layout: post
lang: vi
thumbnail: /Post-Resources/AppGetKilled/AppGetKilled.png
---
Bạn có bao giờ thắc mắc tại sao ứng dụng của bạn bị hệ thống kill khi nó chuyển sang chế độ nền? Bài viết này sẽ tóm tắt những lý do hàng đầu được Apple giới thiệu trong WWDC 2020, và những gì bạn có thể làm để ngăn ứng dụng của mình bị kill ở chế độ nền. Bằng cách áp dụng những mẹo này, chúng ta có thể cải thiện trải nghiệm ứng dụng vì ứng dụng của bạn không phải khởi động lại từ đầu.
Hãy bắt đầu!

<!-- more -->

## Những lý do hàng đầu
Dưới đây mô tả 6 lý do hàng đầu khiến ứng dụng của bạn bị kill khi nó ở chế độ nền:

- Crash: Segmentation fault, illegal instruction, assert và uncaught exception.

- Watchdog:
Treo lâu trong quá trình chuyển đổi trạng thái ứng dụng như deadlock, vòng lặp vô hạn hoặc các tác vụ đồng bộ không kết thúc trên main thread. Trong khoảng 20 giây, ứng dụng của bạn phải chuyển từ trạng thái này sang trạng thái khác. Nếu không, nó sẽ bị kill.
```swift
    + application(_:didFinishLaunchingWithOptions)
    + applicationDidEnterBackground(_:)
    + applicationWillEnterForeground(_:)
```

- Sử dụng CPU quá mức:
Tải CPU cao liên tục ở chế độ nền. Nếu ứng dụng của bạn thực sự cần thực hiện các công việc nặng ở chế độ nền, bạn nên cân nhắc chuyển tác vụ vào background processing task, cho phép ứng dụng của bạn **chạy trong vài phút** khi đang sạc mà không có giới hạn tài nguyên CPU.

- Vượt quá giới hạn bộ nhớ:
Ứng dụng của bạn đang sử dụng quá nhiều bộ nhớ (giống nhau ở cả chế độ nền và foreground). Hãy nhớ rằng giới hạn khác nhau tùy theo thiết bị. Trước iPhone6s, 200M là giới hạn bộ nhớ (Thiết bị càng cũ, giới hạn càng nhỏ).

- Memory pressure exit (hay còn gọi là Jetsam):
Điều này xảy ra khi hệ thống cần giải phóng bộ nhớ của các ứng dụng nền cho các ứng dụng foreground (và các ứng dụng đang chạy khác như ứng dụng nhạc hoặc điều hướng). Để ngăn chặn điều này, hãy cố gắng giảm bộ nhớ càng nhỏ càng tốt, ít hơn **50M** (ví dụ: xóa các image view). Tuy nhiên, chúng ta không thể loại bỏ hoàn toàn rủi ro jetsam. Lời khuyên tốt nhất để khắc phục là tận dụng `State Restoration` có sẵn của UI để khôi phục trạng thái ứng dụng ngay trước khi nó bị kill ở chế độ nền.

    Video sau đây mô tả cách Jetsam xảy ra trên các thiết bị iOS. Giả sử chúng ta mở ứng dụng Amazon để mua sắm, sau đó chọn một mặt hàng yêu thích để xem chi tiết. Giả sử chúng ta phải rời khỏi ứng dụng một lúc để vào chế độ nền, sau đó bắt đầu mở các ứng dụng khác (Google Maps, Music, Photos, Spotify, v.v.). Tại một thời điểm nào đó, chúng ta mở lại ứng dụng Amazon. Như chúng ta thấy, ứng dụng khởi động lại từ đầu. Điều này là do ứng dụng đã bị hệ thống kết thúc.
    Rõ ràng, ứng dụng Amazon không làm gì sai, chỉ là hệ thống cần giải phóng bộ nhớ cho các ứng dụng khác đang chạy ở foreground.

<center>
<iframe width="100%" height="500" src="https://www.youtube.com/embed/JVPvaeoNNsk" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</center>

- Background task timeout:
Lý do phổ biến cuối cùng là sử dụng background task không đúng cách.
```swift
UIApplication.beginBackgroundTask(exprirationHandler:)
UIApplication.endBackgroundTask(_:)
```

    Khi ứng dụng của bạn chuyển từ foreground sang background, và bạn muốn hoàn thành một số tác vụ quan trọng, iOS cung cấp cho bạn thêm thời gian chạy (`chỉ vài giây`) bằng cách gọi phương thức `UIApplication.beginBackgroundTask`. Khi tác vụ hoàn thành, hãy nhớ gọi `UIApplication.endBackgroundTask` để thông báo cho hệ thống rằng tác vụ đã xong. Nếu bạn quên gọi `endBackgroundTask` một cách rõ ràng, timeout sẽ được kích hoạt 30 giây sau khi tạm dừng ứng dụng, và việc kết thúc ứng dụng sẽ xảy ra. Vì vậy, bạn nên xử lý cẩn thận các background task và không bắt đầu bất kỳ công việc tốn kém nào khi ứng dụng của bạn vào chế độ nền vì chúng ta chỉ có vài giây thời gian chạy.

    Trong khi debug, XCode sẽ tạo ra một thông báo log để thông báo nếu có một tác vụ đã được giữ quá lâu mà không kết thúc. Khi thấy thông báo này, bạn nên kiểm tra để xem có vấn đề gì với các lệnh gọi background task.

```bash

Background task still not ended after expiration handlers were called: <_UIBackgroundTaskInfo: 0x28190d140>: taskID = 8, taskName = Called by AppGetKilled,
from $s12AppGetKilled13SceneDelegateC23sceneDidEnterBackgroundyySo7UISceneCF, creationTime = 70784 (elapsed = 26).
This app will likely be terminated by the system. Call UIApplication.endBackgroundTask(_:) to avoid this.
Background Task 5 ("Called by AppGetKilled, from $s12AppGetKilled13SceneDelegateC23sceneDidEnterBackgroundyySo7UISceneCF"),
was created over 30 seconds ago.
In applications running in the background, this creates a risk of termination.
Remember to call UIApplication.endBackgroundTask(_:) for your task in a timely manner to avoid this.

```

## Kết luận
Trong bài viết này, tôi đã tóm tắt 6 lý do hàng đầu khiến ứng dụng có thể bị kết thúc ở chế độ nền, cách chúng ta có thể làm để ngăn chặn các vấn đề, và cách khôi phục ứng dụng một cách mượt mà từ các vấn đề không thể đoán trước như Jetsam.
Bạn có thể tìm tài liệu và video đầy đủ tại [WWDC 2020 - Why is my app getting killed](https://developer.apple.com/videos/play/wwdc2020/10078/)
