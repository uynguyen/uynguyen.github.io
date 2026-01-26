---
title: Hội nghị Swift Summit tại San Francisco 2017
date: 2017-11-29 09:36:20
tags: [Conference, Swift, iOS]
layout: post
permalink: vi/posts/Swift-Summit-conference-in-San-Francisco-2017/
lang: vi
---

[Hội nghị Swift Summit 2017](https://www.swiftsummit.com/) được tổ chức tại Palace Of Fine Arts, San Francisco, một trong mười cung điện nằm ở trung tâm của Triển lãm Panama-Pacific. Tại hội nghị, các lập trình viên Swift từ khắp nơi trên thế giới đã chia sẻ kiến thức mới, công cụ và ý tưởng về nền tảng iOS và ngôn ngữ Swift.
![](/Post-Resources/SwiftSummit/UyNguyen.JPG "")
<center>Hình 1. Tôi đã có mặt tại hội nghị Swift Summit 2017</center>
<!-- more -->

Hội nghị tổ chức hơn 20 phiên kỹ thuật và phòng thí nghiệm dành cho lập trình viên. Đặc biệt, có một khu triển lãm với các công ty công nghệ hàng đầu như Facebook, IBM, Lyft, Capital One, v.v. Tại đó, tôi đã gặp gỡ các lập trình viên khác, thảo luận về các công nghệ mới và nhận quà tặng từ các nhà tài trợ.

![](/Post-Resources/SwiftSummit/Swag.jpg "")
<center>Hình 2. Túi của tôi (và một túi khác của bạn tôi) đầy ắp quà tặng từ hội nghị :)).</center>

## Mười ngày tận hưởng nước Mỹ, hai ngày tận hưởng hội nghị

Vì đây là lần đầu tiên tôi đến San Francisco, tôi không quen với thời tiết ở đây. Tôi nhớ rằng vào buổi sáng đầu tiên khi tôi đến Palace of Fine Arts, thời tiết lúc đó là 13 độ C. Tôi lạnh cóng!
Khi bước vào hội trường chính, tôi cảm thấy dễ chịu hơn nhờ ánh sáng ấm áp. Ban tổ chức đã chuẩn bị rất nhiều đồ ăn và trái cây trên một chiếc bàn ở giữa hội trường. Tôi và bạn bè đi quanh thăm các công ty công nghệ, thử nghiệm các công nghệ mới của họ và nhận quà tặng.
Quy mô của hội nghị không như tôi mong đợi. Nó khá nhỏ, khoảng một trăm người, tôi đoán vậy. Nhưng ban tổ chức và các diễn giả đã chuẩn bị nội dung rất tốt. Dưới đây là một số phiên chính mà tôi đánh giá cao nhất trong hai ngày hội nghị.

### Lập trình bất đồng bộ

Các phương thức bất đồng bộ (gọi tắt là Async) là các phương thức không trả về kết quả ngay lập tức như hầu hết các phương thức, các phương thức async cần một khoảng thời gian để tạo ra kết quả.
Trước khi tham dự phiên này, tôi thường sử dụng callback để xử lý các phương thức bất đồng bộ như quét thiết bị bluetooth hoặc truy xuất tài nguyên từ internet. Thực tế, callback là một kỹ thuật lập trình tồi. Callback sẽ làm code của chúng ta khó đọc, khó debug và mất nhiều thời gian hơn để bảo trì sau này. Cuối cùng, code của chúng ta sẽ trở thành thứ mà chúng ta gọi là callback hell.
Trong phiên này, diễn giả đã giới thiệu một framework giúp chúng ta đơn giản hóa lập trình bất đồng bộ, [PromiseKit](https://github.com/mxcl/PromiseKit). Nó dễ học, dễ sử dụng và tạo ra code rõ ràng, dễ đọc hơn.
Để biết thêm chi tiết về phiên này, vui lòng tham khảo bài viết khác của tôi: [Lập trình bất đồng bộ trong Swift](https://uynguyen.github.io/2018/01/16/Asynchronous-Programming-in-Swift/)

### Buglife

[BugLife](https://www.buglife.com/) là một framework mã nguồn mở giúp người dùng của chúng ta gửi báo cáo lỗi từ điện thoại của họ, và nó ngay lập tức hiển thị trên bảng điều khiển vấn đề của chúng ta. Lợi ích tốt nhất mà tôi thấy khi sử dụng BugLife là nó miễn phí và dễ dàng tích hợp vào ứng dụng của chúng ta mà không cần tốn nhiều công sức.
Để biết thêm chi tiết về cách sử dụng framework này, vui lòng tham khảo bài viết khác của tôi: [BugLife trong thực tế]()

### Mixpanel

Mixpanel là một thư viện giúp chúng ta theo dõi hành vi người dùng và các sự kiện khác xảy ra trên ứng dụng của chúng ta. Nhiều công ty công nghệ sử dụng Mixpanel để phân tích dữ liệu của họ để hiểu rõ hơn về người dùng. Từ kết quả, họ có thể đưa ra quyết định để cải thiện ứng dụng nhằm làm hài lòng người dùng.

![](/Post-Resources/SwiftSummit/Labs.jpg "")
<center>Hình 3. Các lập trình viên đang tham dự một phòng thí nghiệm.</center>

### Swift trên Server: Tình hình hiện tại

Phiên này mô tả tình trạng hiện tại của Swift trên server và đưa ra một số dự đoán về những gì năm tới sẽ mang lại. Đáng tiếc, tôi đã ngủ gật trong phiên này nên không nắm bắt được nhiều ý tưởng từ diễn giả.
Để biết thêm chi tiết về cách sử dụng framework này, vui lòng tham khảo bài viết khác của tôi: [Swift phía server]()

### Kiến trúc iOS trong bối cảnh

Tại sao chúng ta phải quan tâm đến việc chọn kiến trúc?
Ngày nay, chúng ta có rất nhiều kiến trúc phần mềm để lựa chọn, nếu chúng ta không chọn một kiến trúc phù hợp cho ứng dụng của mình, một ngày nào đó chúng ta sẽ thấy mình không thể tìm và sửa bất kỳ lỗi nào trong ứng dụng. Trong phiên này, diễn giả đã thảo luận về một số kiến trúc iOS như MVC, MVP, MVVM, VIPER, v.v. Với nhiều năm kinh nghiệm làm việc về kiến trúc phần mềm, ông đã đánh giá cả ưu điểm và nhược điểm của từng loại.
Đối với tôi, phiên này khá khó để nắm bắt tất cả ý tưởng của diễn giả vì tôi không có nhiều kinh nghiệm trong việc thiết kế kiến trúc phần mềm. Sau đó, tôi phải dành thêm thời gian để đọc các tài liệu và blog kỹ thuật khác để hiểu những gì ông nói.

![](/Post-Resources/SwiftSummit/Conference.JPG "")
<center>Hình 4. Cảnh xung quanh hội nghị</center>

## Sau cùng ...

Cuối ngày thứ hai, chúng tôi có một bữa tiệc Halloween trong hội trường của cung điện. Đây là lần đầu tiên tôi tham dự một hội nghị công nghệ tại một quốc gia dẫn đầu về công nghệ, nước Mỹ. Sau hai ngày tham dự hội nghị, tôi đã cập nhật một số công nghệ mới và cũng áp dụng một số công nghệ vào các dự án tại công ty của tôi. Thành thật mà nói, có một số phiên hơi nhàm chán và chỉ mang tính giới thiệu. Ngoài ra, jet lag khiến tôi cảm thấy mệt mỏi nên tôi đã không tập trung hoàn toàn vào một số phiên. Đó là một điều đáng tiếc.
Cuối cùng, đây vẫn là chuyến đi tuyệt vời nhất!

![](/Post-Resources/SwiftSummit/SanFran.jpg "")
<center>Hình 5. Một chuyến đi không thể nào quên</center>



