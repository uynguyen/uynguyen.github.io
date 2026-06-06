---
title: 'Tích hợp Bluetooth với App Clips: Hướng dẫn chi tiết'
date: 2023-03-25 10:14:11
tags: [Bluetooth, Appclip, iOS]
layout: post
lang: vi
thumbnail: /Post-Resources/Appclip/banner.png
---
Ngày nay, người dùng yêu cầu truy cập nhanh chóng và dễ dàng vào các dịch vụ họ cần, mà không cần tải xuống phiên bản đầy đủ của ứng dụng. App Clips - một tính năng được Apple giới thiệu trên iOS 14 - cung cấp giải pháp cho nhu cầu này bằng cách cho phép người dùng truy cập một phần nhỏ của ứng dụng. Bằng cách tích hợp ứng dụng hỗ trợ Bluetooth của bạn vào App Clip, bạn có thể nâng trải nghiệm người dùng lên tầm cao mới. Điều này mở ra những khả năng mới, như cho phép người dùng kết nối với các thiết bị gần đó, thực hiện một tính năng cụ thể, và nhiều hơn nữa. Trong hướng dẫn này, tôi sẽ hướng dẫn bạn cách tích hợp Bluetooth vào App Clip của bạn. Dù bạn là nhà phát triển dày dạn kinh nghiệm hay người mới, bạn sẽ tìm thấy mọi thứ cần thiết để bắt đầu. Vậy, hãy bắt đầu thôi!
<!-- more -->

## App Clips
["App Clip là một phần nhỏ của ứng dụng có thể được khám phá vào đúng lúc cần thiết và cho phép người dùng hoàn thành một tác vụ nhanh chóng từ ứng dụng của bạn - ngay cả trước khi cài đặt ứng dụng đầy đủ."](https://developer.apple.com/app-clips/). App Clips được thiết kế để nhẹ và nhanh, cung cấp truy cập nhanh chóng vào các tính năng và dịch vụ cốt lõi của ứng dụng.
Có nhiều lợi ích của việc sử dụng App Clips. Thứ nhất, nó cung cấp một phần nhẹ của ứng dụng cho người dùng dùng thử tính năng mà không cần cam kết tải xuống đầy đủ. Thứ hai, App Clips có thể được khởi chạy thông qua nhiều kênh như thẻ NFS, mã QR, link từ Safari, hoặc Messages.
Dưới đây là một số trường hợp sử dụng và ứng dụng mẫu sử dụng App Clips:
- Bán vé: App Clip có thể được sử dụng để nhanh chóng mua và truy cập vé cho các sự kiện như concert, phim, hoặc sự kiện thể thao.
- Đặt xe: App Clip có thể được sử dụng để dễ dàng yêu cầu dịch vụ xe. Ví dụ: Lyft.
- Bán lẻ: App Clips có thể được sử dụng để nhanh chóng truy cập thông tin sản phẩm, mua hàng, hoặc đổi coupon tại cửa hàng bán lẻ.
- Đặt đồ ăn: người dùng có thể nhanh chóng truy cập menu nhà hàng và đặt món. Ví dụ: Panera Bread.
- Đỗ xe: Người dùng chỉ cần quét mã QR hoặc chạm thẻ NFS để khởi chạy App Clip và thanh toán chỗ đỗ xe.

**Xin lưu ý rằng cần có tài khoản Apple trả phí để phát triển App Clip.**
![](/Post-Resources/Appclip/bread.png "")
![](/Post-Resources/Appclip/parking.jpg "")

## Cấu hình
### Mở hosting
Trước khi khởi chạy App Clip, hệ thống đảm bảo rằng App Clip bao gồm chữ ký code trên website của bạn. Nếu bạn có website riêng, bạn có thể thêm các dòng sau vào Apple App Site Association (AASA) trên server và chuyển sang bước tiếp theo.
```
{
    "appclips": {
        "apps": [
            "[YOUR_TEAM_ID].[YOUR_APP_CLIP_BUNDLE_ID]"
        ]
    }
}
```
[Firebase Hosting](https://firebase.google.com/docs/hosting) có thể là lựa chọn tuyệt vời cho những ai không có server riêng. Với Firebase Hosting, bạn có thể dễ dàng cấu hình site mà không mất phí vì nó cung cấp gói miễn phí cho hosting.
1. Cài đặt công cụ dòng lệnh Firebase qua lệnh sau `sudo npm install -g firebase-tools`
2. Tiếp theo, đăng nhập vào tài khoản Firebase của bạn `firebase login`
![](/Post-Resources/Appclip/firebase_login_success.png "")
3. Sau khi đăng nhập thành công, điều hướng đến thư mục chứa file bạn muốn upload, và sau đó chạy `firebase init` để chọn option `hosting`.
4. Thêm các dòng sau vào file `firebase.json`.
```
    ...
    "headers": [
      {
        "source": "/.well-known/apple-app-site-association",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ]
      }
    ],
    "appAssociation": "NONE",
    ...
```
5. Tiếp theo, tạo file `public/.well-known/apple-app-site-association`.
```
{
    "appclips": {
        "apps": [
            "[YOUR_TEAM_ID].[YOUR_APP_CLIP_BUNDLE_ID]"
        ]
    }
}
```

6. Cuối cùng, upload file lên firebase `firebase deploy`
![](/Post-Resources/Appclip/firebase_deploy_completed.png "")

Sau khi deploy thành công, bạn sẽ được cung cấp URL cho website của mình. URL này sẽ được sử dụng để cấu hình khởi chạy App Clip của bạn.

### Thêm App Clip target
Đầu tiên, mở project Xcode của bạn và điều hướng đến menu File. Từ đó, chọn New và sau đó Target. Điều này sẽ hiển thị hộp thoại cho phép bạn chọn loại target mà bạn muốn tạo.

Tiếp theo, chọn option `App Clip` và click `Next`. Điều này sẽ đưa bạn đến màn hình nơi bạn có thể cấu hình các cài đặt khác nhau cho App Clip của mình, như tên, identifier, và deployment target.

Sau khi bạn đã cấu hình các cài đặt này, click `Finish` để tạo App Clip target mới. Điều này sẽ thêm các file và resource cần thiết vào project của bạn và cho phép bạn bắt đầu phát triển App Clip.

![](/Post-Resources/Appclip/add_target.png "")

Để cấu hình App Clip khởi chạy đúng cách, bạn cần làm theo một vài bước đơn giản.
Đầu tiên, chọn App Clip target từ Xcode, sau đó điều hướng đến `Signing & Capabilities` và chọn `Associated Domains`. Từ đó, bạn có thể thêm URL hosting của mình vào danh sách domain mà App Clip được liên kết.

Ví dụ, giả sử URL hosting của bạn là `awesomeapp-54431.web.app`. Trong trường hợp này, bạn sẽ thêm `appclips:awesomeapp-54431.web.app` vào danh sách domain.

Sau khi bạn hoàn thành các bước này, mọi thứ sẽ được thiết lập đúng cách và bạn có thể bắt đầu triển khai các chức năng App Clip của mình. Điều này có thể bao gồm viết code để tương tác với các API khác nhau, thiết kế giao diện người dùng, và nhiều hơn nữa. Chi tiết cụ thể sẽ phụ thuộc vào yêu cầu cụ thể của App Clip và các tính năng bạn muốn bao gồm.

## Triển khai
Tôi sẽ phát triển một ứng dụng rất đơn giản cho phép quét các thiết bị Bluetooth gần đó và hiển thị chúng trên danh sách khi khởi chạy App Clip để minh họa cách sử dụng Bluetooth trong App Clip. Bạn có thể sửa đổi ứng dụng để phù hợp với nhu cầu của mình, như tự động nhận dạng thiết bị được chọn trước theo địa chỉ và tự động kết nối đến thiết bị để thực hiện một tác vụ cụ thể.

```swift
struct ContentView: View {
    // Phần còn lại được lược bỏ
    ...
    var body: some View {
        NavigationView {
            VStack {
                Image("logo").resizable()
                    .scaledToFit()
                    .frame(width: 120).padding(.top, 10)
                TitleLargeText("Awesome App").padding(.bottom, 5).padding(.top, 10).padding(.bottom, 10)
                Spacer()
                LabelLargeText("Nearby Devices").frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 20)
                List(devices.map { $0.name ?? "Unknown name" }, id: \.self) { deviceName in
                    LabelMediumText(deviceName)
                }
                VStack {
                    HStack {
                        LabelMediumText("Powered By")
                        Link(destination: URL(string: "https://uynguyen.github.io")!, label: {
                            LabelMediumText("Uy Nguyen", underline: true)
                        })
                    }.padding(.top, 5)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            .background(Color.black).onContinueUserActivity(NSUserActivityTypeBrowsingWeb, perform: handleUserActivity)
            .navigationBarTitle("")
            .navigationBarHidden(true)
        }
    }

    func handleUserActivity(_ userActivity: NSUserActivity) {
        // Bạn có thể trích xuất params từ url, xác thực url có hợp lệ không, v.v.
        guard
            let incomingURL = userActivity.webpageURL,
            let components = URLComponents(url: incomingURL, resolvingAgainstBaseURL: true),
            let queryItems = components.queryItems
        else {
            return
        }

        // Mọi thứ ổn, hãy bắt đầu scanning
        BluetoothManager.shared.config { device, rssi in
            if !(devices.contains(where: { $0.identifier.uuidString == device.identifier.uuidString })) {
                devices.append(device)
            }
        }
    }
    ...
}
```

## Kiểm thử

### Mã QR & NFC
Apple hỗ trợ kiểm thử App Clip của bạn mà không cần phải publish nó bằng cách đăng ký `Local Experience`.
Để đăng ký local experience, vào `Settings` điện thoại và chọn `Developer`. Từ đó, bạn có thể truy cập menu `Local Experiences` và click vào `Register Local Experience`.
Sau khi bạn đã nhập URL prefix và Bundle ID, bạn sẽ có thể bắt đầu điền thông tin cho App Clip Card của mình. Đây là phần sẽ hiển thị cho người dùng khi họ click vào URL hoặc quét mã QR liên kết với App Clip của bạn.
Trong phần App Clip Card, bạn sẽ có thể cung cấp cho người dùng thông tin quan trọng về App Clip của mình, bao gồm tên, banner, và mô tả. Thông tin này nên rõ ràng và ngắn gọn để người dùng có thể nhanh chóng hiểu App Clip của bạn làm gì và nó có thể hữu ích với họ như thế nào.
Ngoài ra, bạn cũng cần chọn loại nút mà bạn muốn sử dụng cho App Clip của mình. Có ba loại nút khác nhau: `Open`, `View`, và `Play`.
Nút `Open` được sử dụng để khởi chạy App Clip và đưa người dùng trực tiếp đến giao diện chính của nó.
Nút `View` được sử dụng để hiển thị nội dung cụ thể trong App Clip, như một trang hoặc tính năng cụ thể.
Cuối cùng, nút `Play` được sử dụng để khởi chạy trình phát media trong App Clip, cho phép người dùng nghe nhạc hoặc xem video.
Bằng cách làm theo các bước đơn giản này và cung cấp cho người dùng App Clip Card rõ ràng và hấp dẫn, bạn có thể giúp đảm bảo rằng App Clip của mình thành công và được đón nhận tốt bởi đối tượng mục tiêu.

![](/Post-Resources/Appclip/local.png)

Trong video dưới đây, bạn có thể xem minh họa về cách quét mã QR liên kết với website của tôi, tự động khởi chạy App Clip và bắt đầu quy trình Bluetooth scanning cho các thiết bị gần đó. Đây là một ví dụ đơn giản về cách App Clips có thể cung cấp trải nghiệm người dùng tiện lợi, loại bỏ nhu cầu người dùng phải điều hướng qua nhiều màn hình hoặc tải xuống ứng dụng đầy đủ.

<div style="padding:75% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/823369045?h=325d507eb1&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;" title="testing_local"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

Lưu ý:
- Nếu bạn thấy mình không còn cần App Clip đã cài đặt trước đó trên thiết bị iOS, bạn có thể dễ dàng xóa nó bằng cách làm theo một vài bước đơn giản. Chỉ cần vào Settings và chọn option App Clips. Từ đó, bạn có thể chọn App Clip mà bạn muốn xóa và click vào option để delete nó.
- Nếu bạn đang gặp vấn đề với App Clip và nó không khởi chạy được mặc dù đã cấu hình đúng, điều đầu tiên bạn nên thử là invalidate cache và đăng ký lại local experience. Điều này có thể được thực hiện bằng cách vào `Settings` và chọn option `Developer`. Từ đó, bạn có thể truy cập menu `Local Experiences` và click vào option `Invalidate Cache`. Sau khi làm xong, bạn có thể đăng ký lại local experience và thử khởi chạy App Clip lại.

### Safari & iMessage
Ngoài việc khởi chạy App Clips qua mã QR, Apple cũng hỗ trợ khởi chạy App Clip của bạn khi người dùng chia sẻ link đến website của bạn qua ứng dụng Messages, hoặc xem URL trực tiếp trên Safari. Người nhận có thể tap vào link để ngay lập tức khởi chạy App Clip để truy cập chức năng của App Clip nhanh chóng và dễ dàng.

Điều quan trọng cần lưu ý là Smart App Banner của Safari và chia sẻ qua Messages chỉ khả dụng khi App Clip được publish trên App Store.
+ App Clip banner trên Safari: yêu cầu thiết bị người dùng chạy iOS 15+.
+ App Clip banner trên iMessage: yêu cầu thiết bị người dùng chạy iOS 14+, và có người gửi là contact trong ứng dụng Contacts.

Để bật hiển thị App Clip card trong Safari và iMessage, cấu hình các dòng sau trên website của bạn.
```
<meta name="apple-itunes-app" content="app-id=YOUR_APP_ID, app-clip-bundle-id=YOUR_APP_CLIP_ID, app-clip-display=card" />
<meta property="og:image" content="BANNER_URL" />
<meta property="og:title" content="Awesome App" />
<meta property="og:description" content="Awesome App description" />
```

![](/Post-Resources/Appclip/appclip_imessage.jpg "")

## Best practice
- Giữ đơn giản: Mục đích của App Clip là cung cấp phiên bản đơn giản hóa chức năng của ứng dụng. Tập trung vào việc chỉ cung cấp các tính năng chính mà người dùng có khả năng cần nhất trong bối cảnh họ đang sử dụng App Clip.
- Tối ưu hóa tốc độ: App Clips nên nhẹ và tải nhanh (**Apple yêu cầu kích thước App Clip phải nhỏ hơn 15MB, điều này để đảm bảo rằng App Clips có thể được tải xuống và khởi chạy nhanh chóng, ngay cả trên kết nối mạng chậm.**) để đảm bảo người dùng có thể nhanh chóng truy cập chức năng họ cần. Giảm thiểu lượng nội dung và asset được tải để đảm bảo App Clip tải nhanh và không tiêu tốn quá nhiều dữ liệu.
- Điều quan trọng là giữ số lượng parameter ở mức tối thiểu và đảm bảo chúng dễ hiểu. Parameter càng phức tạp, người dùng càng khó biết cách sử dụng chúng.
- Giới hạn độ dài parameter: Tốt nhất là giới hạn độ dài parameter không quá 50 ký tự. Điều này sẽ giúp đảm bảo người dùng có thể dễ dàng đọc và hiểu các parameter.
- Validate parameter: Đảm bảo rằng App Clip của bạn validate tất cả parameter được truyền vào. Điều này sẽ giúp đảm bảo App Clip hoạt động đúng cách và người dùng không thể khai thác bất kỳ lỗ hổng nào.
- Ngoài việc quét mã QR, hiển thị trên Safari, và chia sẻ qua iMessage, Apple cung cấp một số phương pháp khác để khởi chạy App Clips, như tap vào link trong ứng dụng Maps, gợi ý dựa trên vị trí từ Siri Suggestions, và thẻ NFC. Để đảm bảo người dùng có thể dễ dàng khám phá App Clip của bạn, điều quan trọng là tận dụng phương pháp khởi chạy phù hợp và tối ưu hóa khả năng khám phá. Bằng cách đó, bạn có thể tăng cơ hội người dùng tìm thấy và tương tác với App Clip của mình.

## Bước tiếp theo
Trong hướng dẫn sắp tới, tôi sẽ cung cấp cho bạn hướng dẫn chi tiết về cách publish App Clip và cấu hình nó để chạy trên Safari, Maps, và iMessage. Tuy nhiên, xin lưu ý rằng App Clips chỉ có thể được khởi chạy khi chúng được publish trên App Store. Do đó, tôi không thể minh họa quy trình cho đến khi App Clip của tôi vượt qua quy trình review của Apple. 😝

## Kết luận
Tóm lại, App Clips cung cấp cơ hội tuyệt vời để nâng cao trải nghiệm người dùng và đơn giản hóa quy trình tương tác với ứng dụng. Với App Clips, người dùng có thể nhanh chóng truy cập một tính năng cụ thể mà không cần tải xuống ứng dụng đầy đủ. Điều này có thể đặc biệt hữu ích cho người dùng muốn dùng thử ứng dụng của bạn hoặc có gói dữ liệu hoặc bộ nhớ hạn chế. Dù bạn là chủ nhà hàng, quản lý cửa hàng bán lẻ, hay bất kỳ loại hình kinh doanh nào khác, bạn có thể tận dụng App Clip để tạo trải nghiệm tổng thể tốt hơn cho người dùng của mình.
Vậy bạn còn chờ gì nữa? Hãy thử App Clips và xem sự khác biệt mà chúng có thể mang lại cho ứng dụng và doanh nghiệp của bạn.

## Tham khảo
- https://developer.apple.com/app-clips/

