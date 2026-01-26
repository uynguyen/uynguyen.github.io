---
title: Beta Test và TestFlight
date: 2020-04-14 21:25:25
tags:
layout: post
permalink: vi/posts/Beta-Test-and-TestFlight/
lang: vi
---
![](/Post-Resources/TestFlight/Cover.png "TestFlight")
Là một iOS developer, bạn có thể đã nghe về TestFlight - một sản phẩm của Apple cho phép bạn phân phối ứng dụng của mình đến người dùng beta. Vậy chúng ta có thể làm gì với nó? Nó có hữu ích không?
Trong hướng dẫn này, chúng ta sẽ đi qua các bước tải một build lên TestFlight, và mời người dùng test ứng dụng của bạn.
Bạn cũng cần tham khảo bài viết trước [Đưa ứng dụng của bạn lên Store](/2018/12/13/Shipping-your-iOS-app-to-Store/) để hoàn thành hướng dẫn này.
Hãy bắt đầu!
<!-- more -->
## TestFlight là gì?
TestFlight là một sản phẩm của Apple cho phép developers phân phối ứng dụng của họ đến người dùng beta trước khi đưa lên production. Với bản cập nhật mới nhất của ứng dụng TestFlight trên iOS 13, testers có thể đưa phản hồi trực tiếp từ ứng dụng với screenshots, crashes và các thông tin hữu ích khác được cung cấp. Sử dụng TestFlight là một cách tuyệt vời để giúp test ứng dụng của bạn và cải thiện hiệu suất trước khi nó được phát hành chính thức.
TestFlight cung cấp hai loại testers:
- Internal Tester: Cho phép tối đa 25 thành viên trong team của bạn đã được chỉ định vai trò cụ thể để test ứng dụng của bạn. Mỗi thành viên có thể test trên tối đa 30 thiết bị. Khi một beta build được gửi lên App Store Connect và sẵn sàng để testing, internal testers sẽ được thông báo để họ có thể cập nhật ứng dụng.
- External Tester: Bạn có thể mời tối đa 10.000 testers chỉ bằng địa chỉ email của họ hoặc bằng cách chia sẻ public link.

Sự khác biệt chính giữa hai loại là để cho External Tester test ứng dụng của bạn, bạn phải gửi ứng dụng cho Apple để review. Quá trình review giống như một submission chính thức nhưng thường nhanh hơn các app reviews bình thường. Ngược lại, testing ứng dụng của bạn với internal testers không yêu cầu review từ Apple.

## Chọn build để testing
Sau khi hoàn thành bước cuối cùng tại [Đưa ứng dụng của bạn lên Store](/2018/12/13/Shipping-your-iOS-app-to-Store/), ứng dụng của bạn đã được gửi thành công lên App Store Connect. Bây giờ, điều hướng đến [trang Apple developer](https://developer.apple.com) và đăng nhập với Apple Id của bạn, sau đó chọn "My Apps" để xem tất cả các ứng dụng có sẵn > Chọn một ứng dụng cụ thể > Từ thanh công cụ trên cùng > Chọn TestFlight > Bạn sẽ thấy tất cả các builds sẵn sàng để testing.
Hình ảnh sau đây cho bạn cái nhìn nhanh về TestFlight dashboard

![](/Post-Resources/TestFlight/TestFlight_Board.png "TestFlight_Board")

Từ cửa sổ chính, bạn có thể thấy tất cả các versions có sẵn của ứng dụng; khi nào hết hạn; bao nhiêu lời mời đã được gửi; bao nhiêu cài đặt thành công. v.v.
Để thêm người dùng mới, click vào "App Store Connect Users" ở thanh bên trái > Nhấn nút "+" > Sau đó điền thông tin tester của bạn bao gồm App Id của họ. Sau đó, bạn có thể thêm tester của mình vào build.

## Ứng dụng TestFlight
Testers cần cài đặt ứng dụng TestFlight trên thiết bị của họ. Ứng dụng này miễn phí và có sẵn trên App Store.
<div style="text-align:center">
<img src="/Post-Resources/TestFlight/TestFlight.jpeg"/>
</div>

Sau khi thêm testers của bạn vào build, testers sẽ sử dụng email mời hoặc public link để đăng ký testing.
Mở ứng dụng TestFlight, tester cần đăng nhập với App Id của họ. Sau đó, họ sẽ thấy tất cả các ứng dụng có sẵn mà họ có thể cài đặt, giống như App Store. Một lưu ý nhỏ là bạn sẽ thấy một chấm màu cam nhỏ gần tên ứng dụng để chỉ ra build này được cài đặt từ TestFlight. Dễ dàng, phải không?
<div style="text-align:center">
<img src="/Post-Resources/TestFlight/TestFlightApp.jpeg"/>
</div>

Từ giờ trở đi, bất cứ khi nào một build của ứng dụng này có sẵn, tester của bạn sẽ nhận được thông báo và email từ TestFlight. Sau đó họ có thể cập nhật ứng dụng này qua TestFlight và tận hưởng phiên bản mới nhất.

## Sau khi testing
Khi bạn hoàn tất testing, bạn có thể dừng ứng dụng khỏi testing, và sau đó tiến hành publish ứng dụng cho quá trình gửi ứng dụng lên App Store. Beta build của bạn sẽ không còn khả dụng trong TestFlight sau 90 ngày theo mặc định.
Trong bài viết này, chúng ta đã có cái nhìn nhanh về TestFlight và cách phân phối beta test đến testers của bạn. Trong thực tế, beta testing là một thuật ngữ phổ biến trong quy trình phát triển phần mềm. Có kiến thức về cách phân phối ứng dụng sẽ hữu ích trong một số tình huống.
Happy coding!!!
