---
title: Đưa ứng dụng iOS của bạn lên Store
date: 2018-12-13 17:34:08
tags:
layout: post
lang: vi
---
![](/Post-Resources/Delivery/delivery.png "Delivery")

Gửi ứng dụng của bạn lên Apple Store không đơn giản như việc nhấn một nút "thần kỳ" rồi mọi thứ tự động hoàn thành, nhưng cũng không phức tạp như bạn nghĩ. Có thể đây là lần đầu tiên bạn phát hành ứng dụng đầu tiên của mình, và bạn chưa có cơ hội làm quen với quy trình gửi ứng dụng trước đó. Hướng dẫn từng bước này sẽ chỉ cho bạn quy trình chính để gửi ứng dụng từ con số không đến thành công. Lưu ý rằng bạn cần có Tài khoản Developer trả phí để hoàn thành việc này.
Bắt đầu thôi!
<!-- more -->
## Certificates, app IDs và provisioning profiles
Để gửi ứng dụng của bạn lên App Store, bạn cần hiểu certificates, app IDs và provisioning profiles là gì. Về cơ bản, một distribution certificate xác định team/tổ chức của bạn trong một distribution provisioning profile và cho phép bạn gửi ứng dụng lên Apple App Store. Hình ảnh sau đây mô tả mối quan hệ giữa chúng.

<div style="text-align:center">
<img src="/Post-Resources/Delivery/Certificates.png" />
</div>

### Tạo Distribution Certificate
1. Trên Mac của bạn, mở ứng dụng **Key Chain Access**.
2. Vào Certificate Assistant > Request a Certificate From a Certificate Authority.

![](/Post-Resources/Delivery/Generate_P12_1.png "Create CSR")

3. Điền email của bạn vào ô email.

![](/Post-Resources/Delivery/Generate_P12_3.png "Create CSR")

Keychain Access sẽ tạo một private key, được lưu trữ trong keychain, và một file `.certSigningRequest` sẽ được tải lên Apple. Apple sẽ cấp một certificate cho bạn dựa trên file `.certSigningRequest`. Certificate chứa public key. Sau đó, bạn có thể tải file về và mở nó. Public key sẽ được đẩy vào Keychain và ghép cặp với private key để tạo thành "Code Signing Identity".

Để bạn biết CSR là gì
>*CSR hay Certificate Signing Request là một khối văn bản được mã hóa được cung cấp cho Certificate Authority khi đăng ký SSL Certificate. Nó thường được tạo trên server nơi certificate sẽ được cài đặt và chứa thông tin sẽ được đưa vào certificate như tên tổ chức, common name (tên miền), địa phương và quốc gia. Nó cũng chứa public key sẽ được đưa vào certificate. Private key thường được tạo cùng lúc khi bạn tạo CSR, tạo thành một cặp key.*

4. Sau khi có file `.certSigningRequest`, vào [trang Apple developer](https://developer.apple.com), đăng nhập vào Apple Account của bạn > Certificates, Identifiers & Profiles > Nhấn nút "+" để tạo certification mới > Nhớ chọn tùy chọn "iOS Distribution (App Store and Ad Hoc)".

![](/Post-Resources/Delivery/Create_Certificate_1.png "Create Certificate")

5. Tiếp theo, chọn để tải lên file `.certSigningRequest` bạn vừa tạo ở bước 3.

![](/Post-Resources/Delivery/Create_Certificate_2.png "Create Certificate")

6. Cuối cùng, bạn có thể tải file Certificate về Mac của mình, mở nó và key sẽ được đẩy vào keychain tự động.

![](/Post-Resources/Delivery/Create_Certificate_3.png "Create Certificate")

Đó là tất cả cho việc tạo Distribution Certificate, hãy chuyển sang bước tiếp theo, tạo app id của bạn.

### Tạo App Id
1. Nhấn nút "+" trên trang "All Identifiers"
![](/Post-Resources/Delivery/Create_App_Id_1.png "Create App Id")

2. Điền thông tin ứng dụng của bạn, bao gồm bundle Id. Xin lưu ý rằng bundle id này phải khớp với bundle id trong XCode của bạn. Bạn cũng có thể sử dụng wildcard pattern để định nghĩa bundle Id cho nhiều app Ids.
![](/Post-Resources/Delivery/Create_App_Id_3.png "Create App Id")

### Tạo Provisioning Profile
1. Nhấn nút "+" trên trang "Profiles", sau đó chọn tùy chọn "App Store".
![](/Post-Resources/Delivery/Provisioning_Profile_1.png "Create Provisioning Profile")

2. Chọn app Id mà bạn vừa tạo ở bước trước, Tạo App Id.
![](/Post-Resources/Delivery/Provisioning_Profile_2.png "Create Provisioning Profile")

3. Chọn Certificate mà bạn vừa tạo ở bước trước, Tạo Distribution Certificate
![](/Post-Resources/Delivery/Provisioning_Profile_3.png "Create Provisioning Profile")

Bây giờ bạn có một profile liên kết Certificate và app Ids của bạn. Tải file này về và mở nó. Provisioning Profiles sẽ được đẩy vào XCode tự động.

### Tải lên
Đã đến lúc tải ứng dụng của bạn lên Store.
Quay lại project của bạn, từ Top Tool Bar > Product > Archive, XCode sẽ rebuild project của bạn. Sau đó, XCode Organizer sẽ khởi chạy và hiển thị tất cả các archives bạn đã tạo trong quá khứ.
Chọn build hiện tại, sau đó click vào "Distribute App" ở bảng bên phải.

![](/Post-Resources/Delivery/Uploading_1.png "Uploading")

Cửa sổ tiếp theo cho phép bạn chọn credentials bao gồm Distribution Certificate và Provisioning Profiles bạn đã tạo ở phần đầu. Cuối cùng, nhấn nút upload, XCode sẽ làm phần còn lại cho bạn.

![](/Post-Resources/Delivery/Uploading_2.png "Uploading")

Một email sẽ được gửi để thông báo cho bạn ngay sau khi Apple hoàn tất quá trình xử lý, thường mất vài phút.
Ứng dụng của bạn đã được tải lên thành công vào iTunes Profile của bạn, hãy đến bước cuối cùng.

### Gửi duyệt
Điều hướng đến [App Store Connect](https://appstoreconnect.apple.com), chọn "My Apps". bạn sẽ thấy ứng dụng của mình xuất hiện trên trang.

![](/Post-Resources/Delivery/Submission.png "Submission")

Bạn cần chuẩn bị các thông tin sau để điền vào các trang này:
- Tên ứng dụng, Privacy Policy URL, Age Rating, Category.
- Screenshot ở các kích thước khác nhau: Điều này có thể tốn nhiều thời gian nhất của bạn, screenshots của bạn cần đáp ứng yêu cầu của Apple tại [Screenshot specifications](https://help.apple.com/app-store-connect/#/devd274dd925). Lưu ý rằng người dùng sẽ thấy các screenshots này liên quan đến thiết bị hiện tại của họ, vì vậy hãy đảm bảo ảnh của bạn đẹp và hấp dẫn nhất có thể. Fastlane cũng hỗ trợ chụp screenshots tự động, bạn có thể tìm [tài liệu](https://docs.fastlane.tools/getting-started/ios/screenshots/) nếu bạn quan tâm. Fastlane tools có thể tự động hóa quy trình này giúp nó nhanh chóng và nhất quán trong khi mang lại kết quả đẹp mắt!
- Mô tả version, keywords, support URL.
- **Nếu ứng dụng của bạn yêu cầu đăng nhập, điền thông tin tài khoản với username và password.**
- Ghi chú ứng dụng: Một số ghi chú quan trọng bạn muốn gửi cho người review để đảm bảo nó hoạt động đúng. (ví dụ: chúng tôi khuyên dùng dịch vụ với kết nối Wifi để có chất lượng tốt nhất)
- Tệp đính kèm: Tốt nhất nên có một video demo ngắn về ứng dụng của bạn.
- Thông tin liên hệ: Nếu có bất kỳ vấn đề gì, Apple sẽ liên hệ với bạn qua thông tin này.

Bạn đã hoàn tất. Bây giờ nhấn nút "Submit" để bắt đầu quá trình review.

## Quá trình review
Quá trình review của bạn mất một thời gian để hoàn thành, có thể từ vài ngày đến vài tuần tùy thuộc vào danh mục ứng dụng, tính năng và... người review.
Nếu ứng dụng của bạn vi phạm các quy tắc của Apple như sử dụng private APIs không được phê duyệt, thiếu mô tả quyền, crash hoặc hiệu suất kém, nó sẽ bị từ chối. Cuối cùng, chúng ta phải chấp nhận rằng Apple có quyền quyết định cuối cùng về việc cho phép bất cứ thứ gì vào App Store. Chỉ vì bạn nghĩ ứng dụng của mình tuyệt vời không có nghĩa là Apple sẽ cho phép nó vào App Store. Bản thân tôi đã trải nghiệm quy trình nghiêm ngặt-ngẫu nhiên-cảm xúc này khi gửi ứng dụng của mình. Lần gửi đầu tiên diễn ra suôn sẻ không có rắc rối gì. Lần thứ hai, chỉ cập nhật một số UI, bị từ chối vì Apple cho rằng ứng dụng của tôi chứa tính năng không được phép trong App Store. Với nhiều email và cuộc gọi điện thoại, cuối cùng tôi phải xóa tính năng này khỏi ứng dụng của mình. (?!)

## Lời kết
Trong bài viết này, tôi đã hướng dẫn bạn cách gửi ứng dụng lên Store một cách rất chi tiết. Hy vọng bài viết này tiết kiệm thời gian của bạn trong việc đưa các ứng dụng tuyệt vời đến người dùng. Không thể chờ đợi được nữa.
Trong bài viết tiếp theo, tôi sẽ chỉ cho bạn các bước để tải ứng dụng lên Google Play.
Happy coding.
