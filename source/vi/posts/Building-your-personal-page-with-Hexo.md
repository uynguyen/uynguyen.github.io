---
title: Xây dựng trang cá nhân của bạn với Hexo
date: 2020-04-27 20:56:51
tags: Hexo
layout: post
permalink: vi/posts/Building-your-personal-page-with-Hexo/
lang: vi
---
![](/Post-Resources/Hexo/Cover.png "Hexo")
Khi tôi xây dựng trang web cá nhân này, mục tiêu đầu tiên của tôi là tận hưởng sở thích viết lách. Tôi viết bất cứ điều gì tôi học được trong công việc hàng ngày, và chia sẻ nó. Tôi hy vọng những chia sẻ của tôi sẽ giúp ai đó khi họ cần. Đổi lại, tôi sẽ có hiểu biết sâu hơn về những gì tôi viết, và đôi khi, nhận được "một ly cà phê" (Buy me Coffee) từ một người bạn tôi chưa từng gặp.
> **Sức mạnh đạt được bằng cách chia sẻ kiến thức, không phải bằng cách tích trữ nó**

Một số bạn bè đến hỏi tôi cách xây dựng một trang như của tôi. Tôi rất vui được chia sẻ với bạn cách tôi xây dựng nó.
Sau hướng dẫn này, bạn có thể xây dựng trang web của riêng mình trong vòng 5 phút.
Tôi hy vọng sớm thấy trang web của bạn ra mắt!

<!-- more -->
## Thiết lập công cụ

### [NodeJs cho mac](https://nodejs.org/en/download/)
Truy cập trang NodeJS, tải xuống và cài đặt gói NodeJs cho macOS.
Đối với những ai không biết NodeJs là gì, NodeJs là một môi trường runtime Js mã nguồn mở, đa nền tảng (OS X, Window, Linux), để viết server-side bằng Javascript.
Bằng cách sử dụng mô hình non-blocking I/O, NodeJS là một lựa chọn tuyệt vời cho các ứng dụng real-time, chat, data streaming, v.v.
Với một cộng đồng lớn, hệ sinh thái package của NodeJs ngày càng đa dạng và hiệu quả, khiến NodeJS trở thành một trong những xu hướng phát triển tốt nhất trong những năm gần đây. Bạn có thể tìm thêm thông tin về NodeJs trên internet nếu bạn thấy nó thú vị.
### [Hexo](https://hexo.io)
Hexo là một blog framework được hỗ trợ bởi NodeJs. Các tính năng đơn giản và nhanh chóng của Hexo khiến nó trở nên nổi bật trong số các blog framework khác như Hugo, Wordpress, Grav, v.v.
Tôi chọn Hexo để xây dựng blog của mình vì tôi đã quen với các lệnh NodeJS. Hơn nữa, Hexo cung cấp nhiều theme mà bạn có thể dễ dàng tích hợp vào blog của mình với đầy đủ khả năng tùy chỉnh.
Sau khi cài đặt NodeJs thành công, mở terminal của bạn và gõ các dòng sau
```bash
npm install hexo-cli -g [1]
hexo init blog [2]
cd blog [3]
npm install [4]
hexo server [5]
```
Đây là từng bước:
1. Cài đặt hexo command line như một lệnh global.
2. Tạo thư mục blog của bạn.
3. Di chuyển đến thư mục.
4. Cài đặt các node dependency.
5. Chạy server của bạn.

Hexo sẽ chạy tại `localhost:4000` theo mặc định. Bây giờ mở `http://localhost:4000` trong trình duyệt của bạn để xem kết quả.
![](/Post-Resources/Hexo/Blog.png "Blog")

## Cá nhân hóa website của bạn
Tại thư mục gốc, có một file `_config.yml` chứa các cấu hình trang của bạn. Bạn có thể chỉnh sửa một số thứ như tiêu đề trang, tác giả trang, định dạng bài viết, v.v. Để biết thêm thông tin, vui lòng tham khảo tài liệu Hexo.

## Bắt đầu viết
Để tạo bài viết mới, gõ
```bash
hexo new "My first blog"
```
Ở đây, bạn tạo một bài viết có tên "My first blog". Reload trình duyệt của bạn, bạn sẽ thấy kết quả.
![](/Post-Resources/Hexo/New_Post.png "New Post")

Xin lưu ý rằng Hexo sử dụng [cú pháp Markdown](https://en.wikipedia.org/wiki/Markdown) để chỉnh sửa, vì vậy hãy đảm bảo bạn quen thuộc với cú pháp Markdown.

## Themes
Cộng đồng của Hexo cung cấp rất nhiều theme mà bạn có thể chọn theo sở thích và cá nhân hóa theme này thành của riêng bạn. Nó tiết kiệm rất nhiều thời gian của bạn nhờ vào cộng đồng tuyệt vời.
Truy cập [Hexo themes](https://hexo.io/themes/) và tìm theme bạn thích, làm theo hướng dẫn của họ để tải xuống thư mục blog của bạn.
Tiếp theo, chỉnh sửa file `_config.yml`, tìm kiếm và thay thế cấu hình `themes` bằng tên theme mới của bạn.
```bash
theme: whatever
```

## Deployment
Bằng cách sử dụng command line `hexo generate`, Hexo sẽ tự động tạo tất cả các file static mà bạn có thể upload lên server và phân phối cho người dùng.
Trong trường hợp bạn không sở hữu server, đừng lo! Có rất nhiều free-host server ngoài kia. Bạn có thể đã nghe về [Github page](https://pages.github.com). Về cơ bản, Github page cung cấp host và domain miễn phí cho trang của bạn, giống như của tôi "uynguyen.github.io". Nếu bạn muốn sử dụng Github page làm host, vui lòng làm theo hướng dẫn để tạo repository github page của bạn.
Sau khi có repository của riêng mình, cài đặt `npm install hexo-deployer-git` cho phép bạn deploy trang của mình.
Tiếp theo, chỉnh sửa file `_config.yml`, từ phần "deploy" > thêm thông tin deployment target của bạn
```bash
deploy:
  type: git
  repo: <repository url>
  branch: [branch]
  message: [message]
```

Từ bây giờ, khi bạn viết xong, bạn có thể publish bài viết của mình qua lệnh
```bash
hexo clean && hexo deploy
```

Bạn cũng có thể sử dụng Heroku để deployment thay vì sử dụng github. Để biết thêm thông tin, vui lòng tham khảo [Hexo deployment](https://hexo.io/docs/one-command-deployment.html)

## Kết luận
Nếu bạn muốn một trang cá nhân đơn giản để chia sẻ ý tưởng và nội dung của mình, Hexo và Github page trở thành một công cụ tuyệt vời cho bạn. Với sự đơn giản và cộng đồng của nó, việc thiết lập rất dễ dàng, cho phép bạn chỉ tập trung vào điều quan trọng: Sự chia sẻ của bạn.
Tôi hy vọng bạn thấy bài viết này hữu ích.
