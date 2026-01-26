---
title: Silent notification
date: 2021-08-06 19:59:44
tags: [iOS, Notification]
layout: post
permalink: vi/posts/Silent-notification/
lang: vi
---

![](/Post-Resources/Silent-Notification/silent_notification.png "")

Trong thế giới phát triển ứng dụng di động không ngừng phát triển, việc giữ cho người dùng tương tác và được cập nhật thông tin là điều then chốt. Đối với các nhà phát triển iOS, background notification là một công cụ mạnh mẽ giúp nâng cao trải nghiệm người dùng mà không làm gián đoạn các hoạt động hiện tại của họ. Nhưng chính xác thì background notification là gì và chúng hoạt động như thế nào? Hãy cùng tìm hiểu chi tiết.

<!-- more -->

## Background Notification là gì?
Background notification, hay silent notification, là một loại thông báo trong iOS cho phép ứng dụng thức dậy và thực hiện các tác vụ ở chế độ nền mà không cần cảnh báo người dùng bằng thông báo hiển thị. Không giống như các thông báo tiêu chuẩn xuất hiện trên màn hình và yêu cầu tương tác của người dùng, background notification được thiết kế để âm thầm cập nhật nội dung của ứng dụng hoặc thực hiện các hoạt động nền.

Các thông báo này đặc biệt hữu ích cho các ứng dụng cần giữ dữ liệu luôn mới hoặc thực hiện các tác vụ định kỳ mà không làm phiền người dùng. Ví dụ, một ứng dụng thời tiết có thể sử dụng background notification để cập nhật thông tin thời tiết, hoặc một ứng dụng tin tức có thể lấy các bài viết mới nhất ở chế độ nền.

## Background Notification hoạt động như thế nào?
Background notification dựa vào Apple Push Notification Service (APNs), đây là dịch vụ do Apple cung cấp để gửi thông báo đến các thiết bị iOS. Dưới đây là tổng quan đơn giản về cách chúng hoạt động:
- Đăng ký ứng dụng: Ứng dụng đăng ký với APNs và nhận được một device token duy nhất.
- Yêu cầu từ Server: Server của ứng dụng gửi yêu cầu push notification đến APNs, chỉ định device token và bao gồm payload của thông báo.
- Gửi thông báo: APNs gửi thông báo đến thiết bị. Đối với background notification, payload này bao gồm key content-available được đặt thành 1, cho biết thông báo nhằm mục đích đánh thức ứng dụng ở chế độ nền.
- Đánh thức ứng dụng: Khi nhận được background notification, iOS đánh thức ứng dụng để xử lý dữ liệu hoặc thực hiện các tác vụ nền. Điều này được thực hiện mà không hiển thị bất kỳ cảnh báo trực quan nào cho người dùng.
- Xử lý thông báo: Code của ứng dụng xử lý thông báo ở chế độ nền, cập nhật nội dung hoặc thực hiện các hành động cần thiết.

## Những điều cần lưu ý
- Hiệu quả và Giới hạn: Background notification nên được sử dụng hiệu quả để tránh sử dụng không cần thiết tài nguyên pin và mạng. iOS có thể giới hạn tần suất và kích thước của background notification để bảo vệ hiệu suất hệ thống và tuổi thọ pin.
- Quyền riêng tư và Quyền của người dùng: Mặc dù background notification không hiển thị cảnh báo, chúng vẫn yêu cầu quyền của người dùng để nhận thông báo. Đảm bảo rằng ứng dụng của bạn truyền đạt rõ ràng lý do tại sao cần quyền này.
- Xử lý tác vụ nền: Khi xử lý background notification, việc quản lý tác vụ hiệu quả là rất quan trọng. iOS cung cấp các API cụ thể cho các tác vụ nền để đảm bảo các hoạt động được hoàn thành kịp thời.
- Kiểm thử và Debug: Việc kiểm thử background notification có thể khó khăn. Sử dụng các công cụ debug và simulator để kiểm tra các kịch bản khác nhau và đảm bảo ứng dụng của bạn xử lý thông báo như mong đợi.

## Các trường hợp sử dụng thực tế
- Ứng dụng tin tức: Giữ cho người dùng được cập nhật với các tiêu đề mới nhất mà không cần nhắc họ bằng cảnh báo.
- Ứng dụng mạng xã hội: Cập nhật nội dung feed hoặc thông báo âm thầm cho ứng dụng về tin nhắn mới hoặc yêu cầu kết bạn.
- Ứng dụng năng suất: Đồng bộ dữ liệu hoặc làm mới nội dung ở chế độ nền để đảm bảo người dùng luôn có thông tin mới nhất khi họ mở ứng dụng.

## Kết luận

Background notification trong iOS là một tính năng mạnh mẽ giúp nâng cao chức năng và trải nghiệm người dùng của các ứng dụng di động. Bằng cách cho phép ứng dụng thực hiện các tác vụ ở chế độ nền mà không làm gián đoạn người dùng, chúng tạo ra các tương tác liền mạch và hiệu quả hơn. Tuy nhiên, chúng nên được sử dụng một cách cẩn thận để cân bằng hiệu suất, tuổi thọ pin và trải nghiệm người dùng.
Nếu bạn đang phát triển một ứng dụng iOS, hãy cân nhắc tích hợp background notification để cung cấp trải nghiệm năng động và phản hồi tốt hơn. Với việc triển khai đúng cách, bạn có thể giữ cho nội dung của ứng dụng luôn mới và người dùng luôn tương tác, đồng thời duy trì trải nghiệm người dùng mượt mà và không bị gián đoạn.
