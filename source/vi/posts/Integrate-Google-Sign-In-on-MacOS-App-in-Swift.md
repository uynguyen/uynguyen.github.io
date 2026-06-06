---
title: Tích hợp Google Sign In trên ứng dụng MacOS bằng Swift
date: 2019-12-11 21:28:10
tags: [macOS, Swift, Cocoa]
layout: post
lang: vi
thumbnail: /Post-Resources/GGSignIn-Mac/gg_banner.jpg
---
Là một iOS developer, bạn có thể có cơ hội viết ứng dụng trên Mac OS. Và đôi khi, ứng dụng của bạn yêu cầu người dùng xác thực trước khi họ có thể sử dụng ứng dụng của bạn. Việc bật Google Sign in giúp bạn tiết kiệm rất nhiều thời gian để triển khai luồng xác thực. Đáng tiếc, thiếu tài liệu về cách tích hợp Google Sign in trên ứng dụng MacOS, đặc biệt là trong Swift. Tôi đã từng có cơ hội triển khai tính năng này cho ứng dụng của mình. Bây giờ tôi muốn chia sẻ với bạn cách chúng ta có thể làm điều đó. Hãy bắt đầu.
<!-- more -->
## Thiết lập
Trước tiên hãy tạo ứng dụng Mac OS của bạn, đặt tên tùy thích. Sau đó, chạy lệnh `pod init` để khởi tạo Pod workspace.
Tiếp theo, thêm các dòng sau vào Pod file của bạn.
```bash
use_frameworks!
pod 'GTMAppAuth'    # GTMAppAuth is an alternative authorizer to GTMOAuth2, supports for authorizing requests with AppAuth.
pod 'SwiftyJSON'    # JSON parser
pod 'PromiseKit'    # Make async requests
pod 'Kingfisher'    # Cached image
pod 'SnapKit'       # Autolayout
```
Sau đó chạy `pod install` để tải xuống tất cả các dependency này.

## Lấy OAuth client ID
Trước khi bắt đầu ví dụ, trước tiên hãy truy cập [Google Console](https://console.developers.google.com) và tạo một project mới. Sau đó nhấn "Create credentials" > "OAuth client ID" > loại ứng dụng "Other" > Làm theo hướng dẫn để lấy credentials của bạn.
Sau khi bạn tạo OAuth client ID, hãy ghi lại client ID và client secret, bạn sẽ cần chúng để cấu hình Google Sign-in trong ứng dụng của bạn. Bạn có thể tùy chọn tải xuống file cấu hình chứa thông tin project của bạn để tham khảo sau này.

![](/Post-Resources/GGSignIn-Mac/google-credential.jpg "")

## Cấu hình project
Đảm bảo rằng bạn cấu hình ứng dụng của mình để cho phép network vào và ra bằng cách vào Signing & Capabilities > App Sandbox > Check cả Incoming Connections & Outcoming Connections. Nếu bạn không làm điều đó, bạn sẽ gặp lỗi sau vì ứng dụng của bạn không có quyền thực hiện request.
```bash
2019-12-11 22:22:49.472046+0700 GoogleSignInDemo[3955:65750] Metal API Validation Enabled
2019-12-11 22:22:51.444494+0700 GoogleSignInDemo[3955:66166] dnssd_clientstub ConnectToServer: connect() failed path:/var/run/mDNSResponder Socket:11 Err:-1 Errno:1 Operation not permitted
```
Tiếp theo, mở `Info.plist` và thêm một giá trị mới cho `CFBundleURLTypes`, đó là dạng reverse DNS notation của client ID của bạn. Safari sẽ sử dụng DNS notation này để mở ứng dụng của bạn sau khi quá trình xác thực được thực hiện thành công.
```javascript
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.REPLACE_BY_YOUR_CLIENT_ID</string>
        </array>
    </dict>
</array>
```
## Thực hiện authorization
Trước tiên hãy tạo service object của chúng ta, class `GoogleSignInService`, xử lý tất cả các request liên quan đến Google Sign in. Nó cũng chứa tất cả các credentials của project của bạn.
```swift
class GoogleSignInService: NSObject, OIDExternalUserAgent {
    static let kYourClientNumer = "REPLACE_BY_YOUR_CLIENT_ID"
    static let kIssuer = "https://accounts.google.com"
    static let kClientID = "\(Self.kYourClientNumer).apps.googleusercontent.com"
    static let kClientSecret = "REPLACE_BY_YOUR_CLIENT_SECRET"
    static let kRedirectURI = "com.googleusercontent.apps.\(Self.kYourClientNumer):/oauthredirect"
    static let kExampleAuthorizerKey = "REPLACE_BY_YOUR_AUTHORIZATION_KEY"
    // The rest omitted
}
```
Discover endpoint của dịch vụ Google và định nghĩa một request.
```swift
OIDAuthorizationService.discoverConfiguration(forIssuer: URL(string: Self.kIssuer)!) {
    // The rest omitted
    let request = OIDAuthorizationRequest(configuration: config,
                                            clientId: Self.kClientID,
                                            clientSecret: Self.kClientSecret,
                                            scopes: [OIDScopeOpenID, OIDScopeProfile, OIDScopeEmail],
                                            redirectURL: URL(string: Self.kRedirectURI)!,
                                            responseType: OIDResponseTypeCode,
                                            additionalParameters: nil)
    // The rest omitted
}
```
Hãy xem param `scopes`, param này định nghĩa thông tin nào của người dùng mà ứng dụng của bạn có thể truy cập. Google Sign In cung cấp 5 scope khác nhau, bao gồm:
- NSString *const OIDScopeOpenID = @"openid";
- NSString *const OIDScopeProfile = @"profile";
- NSString *const OIDScopeEmail = @"email";
- NSString *const OIDScopeAddress = @"address";
- NSString *const OIDScopePhone = @"phone";

Bạn có thể chọn những scope phù hợp với yêu cầu của ứng dụng.
Cuối cùng, bắt đầu quá trình xác thực.
```swift
OIDAuthState.authState(byPresenting: request, externalUserAgent: self, callback: { (state, error) in
    guard error == nil else {
        seal.reject(error!)
        return
    }
    // You got the OIDAuthState object here
})
```
Sau khi quá trình xác thực thực hiện thành công, bạn sẽ nhận được một object `OIDAuthState` sẽ được sử dụng như một param để khởi tạo object `GTMAppAuthFetcherAuthorization`.
Thông thường, bạn nên lưu object `GTMAppAuthFetcherAuthorization` này vào keychain và tái sử dụng nó cho các REST API call tiếp theo.
```swift
private func saveState() {
    // The rest omitted
    if auth.canAuthorize() {
        GTMAppAuthFetcherAuthorization.save(auth, toKeychainForName: Self.kExampleAuthorizerKey)
    }
}
```
## Thực hiện request
Sau khi lưu service object vào keychain, bây giờ bạn có thể lấy nó để thực hiện bất kỳ request nào. Tôi sẽ thực hiện một request để lấy thông tin profile người dùng hiện tại.
```swift
func loadProfile() -> Promise<GoogleSignInProfile> {
    return Promise { (seal) in
        // The rest omitted
        if let url = URL(string: "https://www.googleapis.com/oauth2/v3/userinfo") {
            let service = GTMSessionFetcherService()
            service.authorizer = auth
            service.fetcher(with: url).beginFetch { (data, error) in
                // Process the data here
                // data = ["locale", "family_name", "given_name", "picture", "sub", "name", emai]
            }
        }
    }
}
```

## Xử lý sự cố
- Sau khi đăng nhập, nếu Safari của bạn không thể redirect về ứng dụng của bạn. Chỉ cần clean project của bạn (Shift + Cmd + K) sau đó chạy lại.
![](/Post-Resources/GGSignIn-Mac/safari_can_not_open.jpg "")
- Các trình duyệt web khác (Chrome, Firefox, v.v.) không thể mở ứng dụng của bạn vì vậy hãy đảm bảo bạn khởi chạy trang đăng nhập trên Safari.
```swift
NSWorkspace.shared.open([url], withAppBundleIdentifier: "com.apple.Safari", options: .default, additionalEventParamDescriptor: nil, launchIdentifiers: nil) {
```
## Suy nghĩ cuối cùng
Bạn có thể tìm thấy demo hoàn chỉnh ở đây
![](/Post-Resources/GGSignIn-Mac/demo.gif "")
Bây giờ bạn có thể sử dụng Google Sign in bên trong macOS của mình để giảm công sức cho việc xác thực. Để lấy full source code, vui lòng tải xuống qua [link Github](https://github.com/uynguyen/GoogleSignIn-MacOS).
Trong trường hợp bạn có bất kỳ vấn đề gì, đừng ngần ngại liên hệ với tôi.
