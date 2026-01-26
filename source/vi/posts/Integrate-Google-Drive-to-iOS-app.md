---
title: Tích hợp Google Drive vào ứng dụng iOS
date: 2019-02-15 20:00:50
tags:
layout: post
permalink: vi/posts/Integrate-Google-Drive-to-iOS-app/
lang: vi
---
![](/Post-Resources/GoogleDrive/GoogleDrive.png "Cover")
Tại Fossil, tôi đã có cơ hội thử nghiệm tích hợp Google Drive như một nền tảng lưu trữ đám mây. Ưu điểm chính của việc sử dụng Google Drive là dễ dàng chia sẻ với các thành viên khác, với giao diện web tốt để chỉnh sửa nội dung các thư mục, và nó miễn phí. Tuy nhiên, tôi đã gặp khó khăn khi cố gắng làm cho Google Drive hoạt động do thiếu tài liệu và bài viết liên quan đến Google Drive APIs, đặc biệt là trong Swift. Ngoài ra, code và ví dụ trên trang web của Google đã lỗi thời. Do đó, tôi quyết định viết bài viết này với hy vọng tiết kiệm thời gian của bạn khi bạn muốn tích hợp Google Drive vào ứng dụng của mình. Hãy bắt đầu.
<!-- more -->
## Tạo ứng dụng và quyền truy cập Google API
Để sử dụng Google APIs, trước tiên chúng ta phải vào Google Console Dashboard để tạo một project. Vì vậy hãy truy cập [Google cloud console](https://console.cloud.google.com), nhấp vào menu dropdown để tạo một project mới.
![](/Post-Resources/GoogleDrive/Create_new_project.png "Create new project")
Google Drive API của bạn bị tắt theo mặc định khi bạn tạo project mới. Để bật Google Drive API thủ công, nhấp vào mục "APIs & Services" ở thanh bên trái, nó sẽ đưa bạn đến một trang khác nơi bạn có thể bật các dịch vụ Google cho ứng dụng của mình.
Nhấp vào nút "Enable APIs and services", sau đó gõ để tìm kiếm "Google drive", tiếp theo chọn Google Drive từ kết quả, cuối cùng nhấp "Enable" để kích hoạt ứng dụng.
![](/Post-Resources/GoogleDrive/GoogleDriveSearching.png "Search Google Drive")
![](/Post-Resources/GoogleDrive/EnableGoogleDrive.png "Enable Google Drive")
Đó là tất cả những gì bạn cần để tạo một ứng dụng sử dụng Google API.
## Thêm credential cho ứng dụng iOS của bạn
Credentials cho phép ứng dụng iOS của bạn truy cập các API đã được bật. Nhấp vào nút "Credentials" ở thanh bên trái để thêm ứng dụng iOS của bạn. Tiếp theo, nhập thông tin ứng dụng của bạn bao gồm tên ứng dụng và bundle id, xin lưu ý rằng bạn cần nhập chính xác bundle id, nếu không nó sẽ không hoạt động.
![](/Post-Resources/GoogleDrive/AddCredentials.png "AddCredentials")
Sau khi tạo credential mới thành công, bạn sẽ có thể tải xuống file plist chứa các key cần thiết để thiết lập project Xcode của bạn. Giữ file này ở nơi an toàn, chúng ta sẽ sử dụng nó ở bước tiếp theo.
```swift
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CLIENT_ID</key>
	<string>YOUR_CLIENT_ID</string>
	<key>REVERSED_CLIENT_ID</key>
	<string>YOUR_REVERSED_CLIENT_ID</string>
	<key>PLIST_VERSION</key>
	<string>1</string>
	<key>BUNDLE_ID</key>
	<string>com.example</string>
</dict>
</plist>
```
## Cấu hình Project
[Google APIs Client Library](https://github.com/google/google-api-objectivec-client-for-rest) là một thư viện được Google viết để truy cập Google APIs. Hãy thêm thư viện sau vào Pod file của bạn.
```bash
pod 'GoogleAPIClientForREST/Drive', '~> 1.2.1'
pod 'GoogleSignIn', '~> 4.1.1'
```
Bạn sẽ tìm thấy `YOUR_REVERSED_CLIENT_ID` và `YOUR_CLIENT_ID` trong file plist cấu hình client mà bạn đã tải xuống trước đó. Chọn target project của bạn, vào tab "Info", thêm một mục mới tại phần "URL Types", sau đó nhập `YOUR_REVERSED_CLIENT_ID` vào ô "URL Schemes".
![](/Post-Resources/GoogleDrive/ConfigYOUR_REVERSED_CLIENT_ID.png "YOUR_REVERSED_CLIENT_ID")
Trong trường hợp bạn không biết URL Schemes dùng để làm gì, mỗi mục trong phần URL Schemes cho phép bạn định nghĩa một custom URL scheme cho ứng dụng của mình. Ví dụ, ứng dụng của bạn có thể cho phép người dùng chạm vào một custom URL trong email để khởi chạy ứng dụng của bạn trong một ngữ cảnh cụ thể. Theo mặc định, Apple hỗ trợ các scheme phổ biến liên kết với các ứng dụng hệ thống như mail, sms, facetime, v.v. Để biết thêm thông tin, vui lòng tham khảo [Defining a Custom URL Scheme for Your App](https://developer.apple.com/documentation/uikit/core_app/allowing_apps_and_websites_to_link_to_your_content/defining_a_custom_url_scheme_for_your_app)
Nếu bạn không thêm `YOUR_REVERSED_CLIENT_ID` làm custom URL scheme, ứng dụng của bạn sẽ bị crash khi cố gắng xác thực với Google API. Vì vậy hãy đảm bảo bạn không bỏ lỡ bước quan trọng này.
![](/Post-Resources/GoogleDrive/Crash-01.png "Missing Custom URL scheme")
Tiếp theo, mở file `AppDelegate.swift`, thêm client id của bạn vào instance Google Sign In.
```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    GIDSignIn.sharedInstance().clientID = "YOUR_CLIENT_ID"
    return true
}
```
Sau đó, mở ViewController nơi bạn cho phép người dùng đăng nhập bằng tài khoản Google của họ và triển khai hai delegate `GIDSignInUIDelegate` và `GIDSignInDelegate` từ Google Sign in.
```swift
extension ViewController: GIDSignInDelegate {
    func sign(_ signIn: GIDSignIn!, didSignInFor user: GIDGoogleUser!, withError error: Error!) {
        if let _ = error {

        } else {
            print("Authenticate successfully")
        }
    }

    func sign(_ signIn: GIDSignIn!, didDisconnectWith user: GIDGoogleUser!, withError error: Error!) {
        print("Did disconnect to user")
    }
}

extension ViewController: GIDSignInUIDelegate {}
```
Cuối cùng, gán delegate Google sign in cho view controller của bạn.
```swift
private func setupGoogleSignIn() {
    GIDSignIn.sharedInstance().delegate = self
    GIDSignIn.sharedInstance().uiDelegate = self
    GIDSignIn.sharedInstance().scopes = [kGTLRAuthScopeDrive]
    GIDSignIn.sharedInstance()?.signInSilently()
}
```
Bạn có thể nhận thấy dòng code `GIDSignIn.sharedInstance().scopes`. Dòng code này định nghĩa những quyền mà người dùng cấp cho ứng dụng của bạn để truy cập dữ liệu của họ khi xác thực. Trong trường hợp này, chúng ta sử dụng scope `kGTLRAuthScopeDrive` cho phép ứng dụng của chúng ta xem và quản lý tất cả các file trong Google Drive của người dùng, *bao gồm cả team drive*. Phương thức `signInSilently` sẽ cố gắng đăng nhập một cách im lặng cho người dùng đã được xác thực trước đó.

Nếu bạn thực hiện đúng tất cả các bước trên, bạn sẽ có thể xác thực ứng dụng của mình với Google API.
<div style="height: 450px; margin-top: -50px;">
<div style="float: left; width: 50%; padding: 20px;">
![](/Post-Resources/GoogleDrive/GoogleSignIn.png "Google Sign in")
</div>
<div style="float: left; width: 50%; padding: 20px;">
![](/Post-Resources/GoogleDrive/GrantPermission.png "Grant permission")
</div>
</div>

## Các API phổ biến
### Làm việc với "My Drive"
#### Tìm kiếm
```swift
public func search(_ name: String, onCompleted: @escaping (GTLRDrive_File?, Error?) -> ()) {
    let query = GTLRDriveQuery_FilesList.query()
    query.pageSize = 1
    query.q = "name contains '\(name)'"
    self.service.executeQuery(query) { (ticket, results, error) in
        onCompleted((results as? GTLRDrive_FileList)?.files?.first, error)
    }
}
```
#### Liệt kê
```swift
 public func listFiles(_ folderID: String, onCompleted: @escaping (GTLRDrive_FileList?, Error?) -> ()) {
    let query = GTLRDriveQuery_FilesList.query()
    query.pageSize = 100
    query.q = "'\(folderID)' in parents and mimeType != 'application/vnd.google-apps.folder'"
    self.service.executeQuery(query) { (ticket, result, error) in
        onCompleted(result as? GTLRDrive_FileList, error)
    }
}
```
#### Tải lên
```swift
private func upload(_ folderID: String, fileName: String, data: Data, MIMEType: String, onCompleted: ((String?, Error?) -> ())?) {
    let file = GTLRDrive_File()
    file.name = fileName
    file.parents = [folderID]

    let params = GTLRUploadParameters(data: data, mimeType: MIMEType)
    params.shouldUploadWithSingleRequest = true

    let query = GTLRDriveQuery_FilesCreate.query(withObject: file, uploadParameters: params)
    query.fields = "id"

    self.service.executeQuery(query, completionHandler: { (ticket, file, error) in
        onCompleted?((file as? GTLRDrive_File)?.identifier, error)
    })
}
```
#### Tải xuống
```swift
public func download(_ fileItem: GTLRDrive_File, onCompleted: @escaping (Data?, Error?) -> ()) {
    guard let fileID = fileItem.identifier else {
        return onCompleted(nil, nil)
    }

    self.service.executeQuery(GTLRDriveQuery_FilesGet.queryForMedia(withFileId: fileID)) { (ticket, file, error) in
        guard let data = (file as? GTLRDataObject)?.data else {
            return onCompleted(nil, nil)
        }

        onCompleted(data, nil)
    }
}
```
#### Xóa
```swift
public func delete(_ fileItem: GTLRDrive_File, onCompleted: @escaping ((Error?) -> ())) {
    guard let fileID = fileItem.identifier else {
        return onCompleted(nil)
    }

    self.service.executeQuery(GTLRDriveQuery_FilesDelete.query(withFileId: fileID)) { (ticket, nilFile, error) in
        onCompleted(error)
    }
}
```
### Làm việc với "Team Drive"
Điều duy nhất chúng ta cần làm để làm việc với "Team Drive" là đặt param `corpora` của query thành `teamDrive`. Theo mặc định, corpora `user` được áp dụng. Điều đó có nghĩa là query chỉ áp dụng cho các thư mục thuộc sở hữu của người dùng. Bằng cách đặt thành `teamDrive`, chúng ta chỉ ra rằng query sẽ ảnh hưởng đến team drive của người dùng. Chúng ta có thể kết hợp nhiều corpora trong một query duy nhất nếu bạn cần làm như vậy.
## Suy nghĩ cuối cùng
Google Drive là một nơi lưu trữ lý tưởng để tích hợp với các ứng dụng của chúng ta. Trong bài viết này, chúng ta đã đề cập đến cách cấu hình Google Drive API và cách thực thi các API phổ biến. Tôi hy vọng bạn đã học được điều gì đó hôm nay.
Bạn có thể tìm thấy tất cả source code demo trên [Github](https://github.com/uynguyen/MyGoogleDrive) của tôi.
## Tài liệu tham khảo
[1] Google Developer https://developers.google.com/drive/api/v3/about-sdk
