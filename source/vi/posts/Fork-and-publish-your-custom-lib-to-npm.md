---
title: Fork và publish thư viện tùy chỉnh của bạn lên npm - React Native Wheel Picker
date: 2022-03-26 10:00:26
tags:
layout: post
lang: vi
thumbnail: /Post-Resources/npm/cover.png
---


Khi phát triển một tính năng mới cho phần mềm của chúng ta, chúng ta có xu hướng tìm kiếm xem có thư viện hoặc framework "tương tự" nào có sẵn trong cộng đồng để tái sử dụng hay không. Không ai muốn phát minh lại bánh xe, phải không? Tuy nhiên, thư viện phù hợp nhất với yêu cầu của chúng ta đôi khi không hỗ trợ một tính năng bạn cần hoặc chỉ là một property tùy chỉnh. Bạn có thể mở một pull request đến repo gốc, nhưng có thể mất thời gian và phụ thuộc vào tác giả xem họ có chấp nhận thay đổi của bạn hay không. Trong trường hợp đó, bạn có thể tạo thư viện của riêng mình từ thư viện gốc, chúng ta gọi đó là quá trình "Fork".
Trong bài viết này, tôi sẽ tóm tắt ngắn gọn các bước để publish một thư viện lên `npm`, và kể cho bạn nghe về một câu chuyện mà tôi gặp phải khi sử dụng thư viện `React Native Wheel Picker`.

<!-- more -->

Việc publish một lib lên `npm` khá đơn giản. Chỉ cần làm theo các bước sau:
1. Đảm bảo bạn có tài khoản `npm`. Truy cập `https://www.npmjs.com` để đăng ký tài khoản nếu bạn chưa có.
2. Tiếp theo, đăng nhập vào tài khoản của bạn trên máy tính qua command line `npm login`.
![](/Post-Resources/npm/signin.png "")
3. Để kiểm tra người dùng nào đang đăng nhập, sử dụng `npm whoami`.
4. [Thư viện](https://www.npmjs.com/package/@gregfrench/react-native-wheel-picker) tôi sử dụng cho project của mình hỗ trợ component `Wheel Picker`, nhưng nó đã bị deprecated, và nó không hỗ trợ thiết lập màu của item được chọn trên Android. Bên cạnh đó, tôi muốn tạo thư viện của riêng mình để có thể dễ dàng thêm nhiều tính năng hơn sau này. Vì vậy tôi quyết định fork và tùy chỉnh wheel picker của riêng mình. Để fork một lib, hãy vào repo của lib bạn muốn chỉnh sửa, sau đó nhấn nút `fork` ở góc trên bên phải.
![](/Post-Resources/npm/fork.png "")

5. Sau khi fork thành công, bạn sẽ thấy repo trên dashboard của mình. Tiếp theo, clone code về máy tính của bạn, và thêm các tính năng mới của bạn.
Trong trường hợp của tôi, tôi cần thêm một tính năng mới hỗ trợ thiết lập màu cho item được chọn (Tham khảo [PR này](https://github.com/GregFrench/react-native-wheel-picker/pull/7/commits/b8bf478f3e4ffb7fb5be4e2f524e730678775e50))
![](/Post-Resources/npm/fork-repo.png "")

6. Khi hoàn thành việc chỉnh sửa, commit các thay đổi của bạn.
7. Cập nhật thông tin repo tại file `package.json` nếu cần (Author, version, description, v.v.).
8. Cuối cùng, chạy `npm publish --access public` để phát hành thư viện tuyệt vời của bạn.
![](/Post-Resources/npm/publish.png "")

Đã đến lúc kiểm tra thư viện mới. Nếu bạn cài đặt thư viện mới `@uynguyen505/react-native-wheel-picker` và thử sử dụng nó, bạn sẽ thấy kết quả như dưới đây.

![](/Post-Resources/npm/result.png "")

Chúc cuối tuần vui vẻ!

## Refs
1. [Creating and publishing scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
2. [Forking, Modifying, and Publishing NPM Packages — For those almost-perfect packages](https://brandontle.com/writing/forking-modifying-and-publishing-npm-packages/)
