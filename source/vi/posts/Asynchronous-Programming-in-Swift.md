---
title: Lập Trình Bất Đồng Bộ trong Swift
date: 2018-01-16 21:32:45
tags: [Swift, iOS]
layout: post
permalink: vi/posts/Asynchronous-Programming-in-Swift/
lang: vi
---
![](/Post-Resources/PromiseKIT/PromiseKIT.png "")
<center>Promise Kit, một trong những framework tốt nhất để xử lý lập trình bất đồng bộ trong Swift</center>

Trong bài viết này, tôi sẽ sử dụng các thư viện bên thứ ba sau để hoàn thành dự án:
* [Alamofire](https://github.com/Alamofire/Alamofire): Một framework HTTP networking trong Swift.
* [SwiftyJSON](https://github.com/SwiftyJSON/SwiftyJSON): Để xử lý dữ liệu JSON.
* [SwiftGifOrigin](https://github.com/bahlo/SwiftGif): Một extension UIImage để hiển thị file Gif.
* [Bolts-Swift](https://github.com/BoltsFramework/Bolts-Swift): Được thiết kế bởi Parse và Facebook, tôi sử dụng nó để tạo các phương thức bất đồng bộ.
* [PromiseKit](https://github.com/mxcl/PromiseKit): Một framework giúp chúng ta đơn giản hóa lập trình bất đồng bộ.<br />
* [API của Giphy](https://giphy.com) để tìm kiếm và tải ảnh gif.
<!-- more -->
## Bắt đầu

Các phương thức bất đồng bộ, (viết tắt là Async), là các phương thức không trả về kết quả ngay lập tức như hầu hết các phương thức, các phương thức async mất một thời gian để tạo ra kết quả.
Tôi thường sử dụng callback để xử lý các phương thức bất đồng bộ như quét thiết bị Bluetooth hoặc lấy một số tài nguyên từ internet. Thực tế, callback là một kỹ thuật lập trình không tốt. Callback sẽ làm code của chúng ta khó đọc, khó debug và tốn nhiều thời gian hơn để bảo trì sau này. Cuối cùng, code của chúng ta sẽ biến thành thứ mà chúng ta gọi là callback hell.
Trong bài viết này, tôi sẽ tạo một dự án sử dụng từng kỹ thuật một để giải thích tại sao tôi nói callback là không tốt.
Đầu tiên, hãy tiếp tục và tạo một dự án, đặt tên tùy ý, sau đó cài đặt các Pod framework này vào dự án của bạn. Bạn cũng cần chỉnh sửa key `NSAllowsArbitraryLoads` thành `YES` trong dictionary `NSAppTransportSecurity` trong file info.plist để chỉ định domain nào được miễn trừ khỏi các quy tắc bạn định nghĩa cho App Transport Security. Trong trường hợp của chúng ta, đây là domain giphy.

Cho phép request HTTP chỉ cho domain giphy
```bash
<key>NSAppTransportSecurity</key>
    <dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>api.giphy.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

Hoặc cho phép request HTTP cho tất cả domain, đây không phải là một ý tưởng tốt.
```bash
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

Hãy tạo một class có tên `ImageLoader`. Class này chứa hai phương thức giúp chúng ta tìm kiếm và tải ảnh gif từ server Giphy.
```swift
//
//  ImageLoader.swift
//

class ImageLoader {
    func fetchImage(keyword: String) {
        // Tìm kiếm ảnh khớp với keyword trên server Giphy
    }
    func downloadImage(url: URL) {
        // Tải ảnh tại url
    }
}
```

## Phiên bản đầu tiên: Sử dụng callback

Đầu tiên, chúng ta cần định nghĩa hai callback, sẽ được truyền vào các phương thức `fetchImage` và `downloadImage`.

```swift
public typealias FetchImageBlock = (URL?, Error?) -> Void
public typealias DownloadImageBlock = (URL?, Error?) -> Void
```

Sau đó, chúng ta triển khai hai phương thức này:
- `fetchImage` nhận keyword và callback làm tham số, gửi request đến server Giphy để truy vấn tất cả ảnh khớp với keyword, lấy cái đầu tiên và cuối cùng trả về url tải xuống qua callback.
- `downloadImage` nhận url và callback làm tham số, sau đó sử dụng framework `Alamofire` để tải ảnh. Cuối cùng, trả về url đích, nơi ảnh được lưu, qua callback.

```swift
func fetchImage(keyword: String, callback: @escaping FetchImageBlock) {
    let endPoint = "http://api.giphy.com/v1/gifs/search?q=\(keyword)&limit=1&api_key=q4N1oD5jw3xvH2hIOkFAyHXWTTrh0D30"
    let headers: HTTPHeaders = [
        "Content-Type": "application/json"
    ]
    Alamofire.request(endPoint, headers: headers).responseData { (response) in
        if let error = response.error {
            return callback(nil, error)
        }
        let jsonData = JSON.init(data: response.data!)
        let dataArray = jsonData["data"].array
        if let dataArray = dataArray, dataArray.count > 0 {
            let imagesList = dataArray[0]["images"]
            let downsized_large = imagesList["downsized_large"]["url"].stringValue
            return callback(URL.init(string: downsized_large), nil)
        }
        else {
            return callback(nil, nil)
        }
    }
}
```

```swift
func downloadImage(url: URL, callback: @escaping DownloadImageBlock) {
    let destination: DownloadRequest.DownloadFileDestination = { _, _ in
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let fileURL = documentsURL.appendingPathComponent(url.lastPathComponent)
        return (fileURL, [.removePreviousFile, .createIntermediateDirectories])
    }
    Alamofire.download(url, to: destination).downloadProgress(closure: { (progress) in
        print("\(progress)")
    }).responseData(completionHandler: { (response) in
        if let error = response.error {
            return callback(nil, error)
        }
        callback(response.destinationURL, nil)
    })
}
```

Bên trong view controller chính, hãy định nghĩa một phương thức gọi là `searchImageWithKeyword`. Phương thức này nhận keyword làm tham số, sau đó truyền tham số vào phương thức `fetchImage` của một instance của class `ImageLoader`. Chúng ta cũng cần truyền một callback để xử lý kết quả.
Bên trong callback `fetchImage`, hãy kiểm tra xem có lỗi nào không. Nếu có, chúng ta dừng gọi phương thức tiếp theo, `downloadImage`. Ngược lại, chúng ta gọi `downloadImage` của đối tượng `imageLoader`. Sau đó truyền url và callback làm tham số.
Bên trong callback `downloadImage`, hãy kiểm tra xem có lỗi nào không. Nếu có, chúng ta dừng gọi cái tiếp theo. Ngược lại, chúng ta cập nhật image view trên main view bằng cách gọi phương thức `updateImageAtURL`.

```swift
func searchImageWithKeyword(keyword: String) {
    let imageLoader = ImageLoader()
    imageLoader.fetchImage(keyword: keyword, callback: {downloadLink, error in
        if let error = error {
            print("Error \(error)")
        }
        else {
            if let downloadLink = downloadLink {
                imageLoader.downloadImage(url: downloadLink, callback: {downloadedURL, error in
                    if let error = error {
                        print("Error \(error)")
                    }
                    else {
                        if let downloadedURL = downloadedURL {
                            self.updateImageAtURL(url: downloadedURL)
                        }
                        else {
                            print("Error: downloadedURL is nil")
                        }
                    }
                })
            }
            else {
                print("Error: downloadLink is nil")
            }
        }
    })
}
```

```swift
func updateImageAtURL(url: URL) {
    guard Thread.isMainThread else {
        DispatchQueue.main.async {
            self.updateImageAtURL(url: url)
        }
        return
    }
    do {
        let data = try Data.init(contentsOf: url)
        self.imgImage.image = UIImage.gif(data: data)
    }
    catch {
        print("Error \(error)")
    }
}
```

Như bạn thấy, `searchImageWithKeyword` khá phức tạp với nhiều câu lệnh `if` và `else` bên trong phương thức. Chúng ta phải kiểm tra lỗi trong nhiều dòng code. Hãy tưởng tượng nó sẽ phức tạp như thế nào nếu chúng ta có nhiều hơn ba phương thức bên trong nó?

![](/Post-Resources/PromiseKIT/CallbackHell.png "")
<center>Một callback hell trong ngôn ngữ khác, Javascript</center>

Build và chạy dự án. Nhập keyword bạn muốn tìm kiếm trên server Giphy, nhấn nút tìm kiếm và bạn sẽ thấy kết quả đầu tiên.
<img src="/Post-Resources/PromiseKIT/PromiseKitDemo.gif" width="300">
<center>Dự án lập trình async</center>

## Giải pháp tốt hơn: Sử dụng Bolts
Bolts là một framework được thiết kế bởi Parse và Facebook, tôi sử dụng nó để tạo các phương thức bất đồng bộ, mà không sử dụng callback. Framework Bolts cho phép chúng ta viết code như một chuỗi các hành động dựa trên các sự kiện.

```swift
func fetchImage(keyword: String) -> Task<URL>! {
    let mainTask = TaskCompletionSource<URL>()
    let endPoint = "http://api.giphy.com/v1/gifs/search?q=\(keyword)&limit=1&api_key=q4N1oD5jw3xvH2hIOkFAyHXWTTrh0D30"
    let headers: HTTPHeaders = [
        "Content-Type": "application/json"
    ]
    Alamofire.request(endPoint, headers: headers).responseData { (response) in
        if let error = response.error {
            return mainTask.set(error: error)
        }

        let jsonData = JSON.init(data: response.data!)
        let dataArray = jsonData["data"].array
        if let dataArray = dataArray, dataArray.count > 0 {
            let imagesList = dataArray[0]["images"]
            let fixed_height_still = imagesList["downsized_large"]["url"].stringValue
            return mainTask.set(result: URL.init(string: fixed_height_still)!)
        }
        else {
            return mainTask.set(error: NSError.init(domain: "myDomain", code: 0, userInfo: nil))
        }
    }
    return mainTask.task
}
```

```swift
func downloadImage(url: URL) -> Task<URL>! {
    let mainTask = TaskCompletionSource<URL>()
    let destination: DownloadRequest.DownloadFileDestination = { _, _ in
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let fileURL = documentsURL.appendingPathComponent(url.lastPathComponent)
        return (fileURL, [.removePreviousFile, .createIntermediateDirectories])
    }

    Alamofire.download(url, to: destination).downloadProgress(closure: { (progress) in
        print("\(progress)")
    }).responseData(completionHandler: { (response) in
        if let error = response.error {
            return mainTask.set(error: error)
        }
        if let destinationURL = response.destinationURL {
            return mainTask.set(result: destinationURL)
        }
        else {
            return mainTask.set(error: NSError.init(domain: "myDomain", code: 0, userInfo: nil))
        }
    })
    return mainTask.task
}
```

Hãy xem `searchImageWithKeyword` sẽ đơn giản như thế nào khi sử dụng Bolts.

```swift
func searchImageWithKeyword(keyword: String) {
    let imageLoader = ImageLoader()
    imageLoader.fetchImage(keyword: keyword).continueOnSuccessWith { (linkDownload) -> Void in
        imageLoader.downloadImage(url: linkDownload).continueOnSuccessWith(continuation: { (downloadedURL) -> Void in
            self.updateImageAtURL(url: downloadedURL)
        })
    }.continueOnErrorWith { (error) in
        print("Error \(error)")
    }
}
```

Build và chạy dự án, không có gì thay đổi. Nhưng code dễ đọc hơn cái đầu tiên, phải không? Chúng ta tập hợp tất cả lỗi ở một nơi, cũng tách biệt việc xử lý lỗi và code thành công.

## Giải pháp tốt hơn nhiều: Sử dụng PromiseKit
Một điều tôi không thích về framework Bolts là thiếu tài liệu và dự án mẫu. Khi tôi lần đầu sử dụng framework Bolts, tôi rất khó làm quen với các API của đối tượng Task.
Tại [hội nghị Swift Summit 2017](https://uynguyen.github.io/2017/11/29/Swift-Summit-conference-in-San-Francisco-2017/), có một diễn giả đã giới thiệu một Framework để xử lý các phương thức async, PromiseKit. Sau hội nghị, tôi đã thay thế code sử dụng framework Bolts bằng PromiseKit trong các dự án của công ty tôi. Tôi nhận ra code của tôi bây giờ dễ đọc hơn. Tôi nghĩ cách viết của PromiseKit sẽ quen thuộc hơn với các developer so với cách viết của Bolts, đặc biệt là những người đã làm việc với Javascript như tôi.
Một phương thức async được tạo bằng PromiseKit trả về một Promise generic mới, đây là class chính được cung cấp bởi PromiseKit. Constructor của nó nhận một khối thực thi đơn giản với hai tham số:
* fulfill: Một hàm để gọi khi giá trị mong muốn sẵn sàng để hoàn thành promise.
* reject: Một hàm để gọi nếu có lỗi.

Hãy áp dụng PromiseKit vào dự án của chúng ta

```swift
    func fetchImage(keyword: String) -> Promise<URL>  {
        return Promise { fullfil, reject in
            let endPoint = "http://api.giphy.com/v1/gifs/search?q=\(keyword)&limit=1&api_key=q4N1oD5jw3xvH2hIOkFAyHXWTTrh0D30"
            let headers: HTTPHeaders = [
                "Content-Type": "application/json"
            ]
            Alamofire.request(endPoint, headers: headers).responseData { (response) in
                if let error = response.error {
                    return reject(error)
                }

                let jsonData = JSON.init(data: response.data!)
                let dataArray = jsonData["data"].array
                if let dataArray = dataArray, dataArray.count > 0 {
                    let imagesList = dataArray[0]["images"]
                    let fixed_height_still = imagesList["downsized_large"]["url"].stringValue
                    return fullfil(URL.init(string: fixed_height_still)!)
                }
                return reject(NSError.init(domain: "myDomain", code: 0, userInfo: nil))
            }
        }
    }
```

```swift
    func downloadImage(url: URL) -> Promise<URL> {
        return Promise { fullfil, reject in
            let destination: DownloadRequest.DownloadFileDestination = { _, _ in
                let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                let fileURL = documentsURL.appendingPathComponent(url.lastPathComponent)
                return (fileURL, [.removePreviousFile, .createIntermediateDirectories])
            }

            Alamofire.download(url, to: destination).downloadProgress(closure: { (progress) in
                print("\(progress)")
            }).responseData(completionHandler: { (response) in
                if let error = response.error {
                    return reject(error)
                }

                if let destinationURL = response.destinationURL {
                    return fullfil(destinationURL)
                }
                reject(NSError.init(domain: "myDomain", code: 0, userInfo: nil))
            })
        }
    }
```

Và kết quả cuối cùng, code đẹp làm sao! :))

```swift
func searchImageWithKeyword(keyword: String) {
    let imageLoader = ImageLoader()
    firstly {
        imageLoader.fetchImage(keyword: keyword)
    }.then {  downloadLink -> Promise<URL> in
        return imageLoader.downloadImage(url: downloadLink)
    }.then {downloadedURL -> Void in
        self.updateImageAtURL(url: downloadedURL)
    }.catch { error in
        print("Error \(error)")
    }
}
```

Một tính năng mà tôi thấy rất thú vị trong cả hai framework, Bolts và PromiseKit, là chúng cho phép code của chúng ta chạy trên một thread nhất định (Main thread hoặc background thread). Đây là một tính năng tuyệt vời vì hầu hết công việc được thực hiện trong view controller là để cập nhật UI. Đôi khi, các tác vụ chạy lâu được xử lý tốt nhất trên background thread, để không làm nghẽn UI. Để biết thêm chi tiết về tính năng Thread này, vui lòng tham khảo tài liệu của họ: *#Threading*

## Kết luận
Vì tôi đang làm việc với CoreBluetooth, tôi thường phải làm việc với các phương thức async. Quá nhiều callback làm dự án của tôi khó hiểu hơn và khó debug nếu có lỗi xảy ra. `Promise` làm code của tôi trở thành một cô gái đẹp hơn ;).
Bạn có thể tải dự án mẫu hoàn chỉnh [tại đây](https://github.com/uynguyen/Asynchronous-In-Swift).
Hãy để lại bình luận về bài viết của tôi.
