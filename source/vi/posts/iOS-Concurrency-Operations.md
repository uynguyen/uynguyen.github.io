---
title: 'iOS Concurrency Nâng cao: Operations [1]'
date: 2020-05-16 20:54:36
tags: [iOS, Concurrency, Operations]
layout: post
lang: vi
thumbnail: /Post-Resources/Operations/operations.png
---

Có hai kỹ thuật để xử lý Concurrency trong iOS: GCD - Grand Central Dispatch và Operations. Hầu hết thời gian, GCD cung cấp hầu hết các khả năng concurrency mà bạn cần. Tuy nhiên, đôi khi bạn sẽ muốn một số tùy chỉnh nâng cao bổ sung. Đó là lúc để sử dụng Operations. Tutorial này sẽ giới thiệu Operations trong Swift, cũng như giải thích khi nào và tại sao chúng ta sử dụng Operation thay vì GCD.
Hãy chuyển số!
> Có một khoảng cách lớn giữa việc biết con đường và đi qua con đường.
<!-- more -->
## Giới thiệu Operations
Operation là một class cho phép bạn submit một khối code sẽ được chạy trên một thread khác, nó được xây dựng trên nền tảng GCD. Về cơ bản, cả GCD và operation đều có vai trò tương tự. Tuy nhiên, operation có những lợi ích khác cho chúng ta nhiều quyền kiểm soát hơn đối với tác vụ.
- **Thiết kế OOP**: vì operation là một class Swift, bạn có thể subclass nó và override các method của nó nếu cần. Nó sẽ dễ sử dụng và tái sử dụng trong tương lai.
- **Quản lý trạng thái**: Một Operation có state machine riêng được thay đổi trong suốt lifecycle của nó. Bản thân operation xử lý các thay đổi trạng thái của nó. Chúng ta không thể sửa đổi các trạng thái này của một object.
- **Dependency giữa các operation**: Nếu bạn muốn bắt đầu một tác vụ sau khi các tác vụ khác đã hoàn thành thực thi, thì operation nên là lựa chọn của bạn. Một operation sẽ không bắt đầu thực thi cho đến khi tất cả các operation mà nó phụ thuộc đã hoàn thành thành công công việc của chúng.
- **Hủy tác vụ đã submit**: Bằng cách sử dụng operation, chúng ta có khả năng hủy một operation đang chạy. Điều này rất hữu ích trong trường hợp chúng ta muốn dừng các operation không còn liên quan tại một thời điểm nhất định. Ví dụ, để hủy tải dữ liệu khi người dùng scroll table làm cho một số cell biến mất.

Dependency và khả năng hủy làm cho operation có thể kiểm soát được nhiều hơn so với GCD.

## Thực hành
Giả sử rằng chúng ta đang xây dựng một ứng dụng sẽ fetch một số bài viết của tôi. Sau khi tải các hình ảnh cover, chúng sẽ được áp dụng một filter đơn giản, sau đó hiển thị trong một table view.
Tiến hành và tạo một project. Project chỉ đơn giản chứa một màn hình chính với một table view hiển thị các bài viết với tiêu đề và hình ảnh cover. Để đơn giản hóa nguồn dữ liệu, tôi đã tạo một file JSON chứa 100 dòng mô tả một bài viết với key là tiêu đề và value là url liên kết đến hình ảnh cover.
```js
[
    // input.json
    {"Building your personal page with Hexo": "https://uynguyen.github.io/Post-Resources/Hexo/Cover.png"},
    {"Beta Test and TestFlight": "https://uynguyen.github.io/Post-Resources/TestFlight/Cover.png"},
    {"iOS: Mix and Match": "https://uynguyen.github.io/Post-Resources/MixMatch/mix-match-banner.png"},
    {"Best practice: Core Data Concurrency": "https://uynguyen.github.io/Post-Resources/CoreDataConcurrency/banner.png"},
    {"Two weeks at Fossil Group in the US": "https://uynguyen.github.io/Post-Resources/Fossil_Group/Fossil_Group.jpg"},
    ...
]
```

Bên trong MainViewController, hãy đọc file input
```swift
class ViewController: UIViewController {
    @IBOutlet weak var tbPosts: UITableView!

    var urls = [(title: String, url: String)]()

    override func viewDidLoad() {
        super.viewDidLoad()
        self.setup()
        // ...
    }

    func setup() {
        let inputUrl = Bundle.main.url(forResource: "input", withExtension: "json")!
        do {
            let data = try Data(contentsOf: inputUrl)
            if let jsonDict = try JSONSerialization.jsonObject(with: data) as? [[String: String]] {
                self.urls = jsonDict.map { ($0.first!.key, $0.first!.value) }
            }
        } catch {

        }
    }
```

Bằng cách sử dụng một hàm đơn giản của CoreImage, method `grayScale(input:)` sẽ chuyển đổi một UIImage thành hình ảnh đen trắng với filter Tonal
```swift
func grayScale(input: UIImage) -> UIImage? {
    let context = CIContext(options: nil)
    var inputImage = CIImage(image: input)

    let filters = inputImage!.autoAdjustmentFilters()

    for filter: CIFilter in filters {
        filter.setValue(inputImage, forKey: kCIInputImageKey)
        inputImage =  filter.outputImage
    }

    let cgImage = context.createCGImage(inputImage!, from: inputImage!.extent)
    let currentFilter = CIFilter(name: "CIPhotoEffectTonal")
    currentFilter!.setValue(CIImage(image: UIImage(cgImage: cgImage!)), forKey: kCIInputImageKey)

    let output = currentFilter!.outputImage
    let cgimg = context.createCGImage(output!, from: output!.extent)
    return UIImage(cgImage: cgimg!)
}
```

Đã đến lúc thiết lập table view, chúng ta sử dụng URLSession để tải hình ảnh từ url input, sau đó hiển thị lên cell sau khi tải thành công.
```swift
extension ViewController: UITableViewDataSource {
    // Phần còn lại được bỏ qua
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "CellId", for: indexPath) as! PostTableViewCell
        let input = urls[indexPath.row]

        URLSession.shared.dataTask(with: URL(string: input.url)!, completionHandler: { (data, res, error) in
            guard error == nil,
                let data = data,
                let image = UIImage(data: data) else { return }

            DispatchQueue.main.async {
                cell.lblPostTitle.text = input.title
                cell.imgPostImage.image = self.grayScale(input: image)
            }
        }).resume()

        return cell
    }
}
```
Build và chạy project, bạn sẽ thấy các hình ảnh xuất hiện trên danh sách. Hãy thử scroll table. Bạn có cảm thấy giật lag không?
Bạn có thể nhận thấy vấn đề đến từ đâu. Để thiết lập một cell, chúng ta đầu tiên tải hình ảnh từ internet, sau đó áp dụng filter Tonal cho hình ảnh. Hai hành động này đang thực hiện trên main thread, tạo quá nhiều áp lực lên thread chỉ nên được sử dụng cho tương tác người dùng.

<div style="text-align:center">

![](/Post-Resources/Operations/lagy.gif "Lagy")

</div>

## Sử dụng GCD
Chúng ta có thể dispatch code tải và filter hình ảnh sang một queue riêng biệt khác
```swift
DispatchQueue.global(qos: .background).async {
    URLSession.shared.dataTask(with: URL(string: input.url)!, completionHandler: { (data, res, error) in
        guard error == nil,
            let data = data,
            let image = UIImage(data: data) else { return }

        let filteredImage = self.grayScale(input: image)
        DispatchQueue.main.async {
            cell.lblPostTitle.text = input.title
            cell.imgPostImage.image = filteredImage
        }
    }).resume()
}
```

Bằng cách thực thi code trên một background queue, chúng ta giảm tải công việc cho main queue và làm cho UI phản hồi nhanh hơn nhiều.
Rebuild project, bạn sẽ thấy sự khác biệt.
Ngay cả khi chúng ta giải quyết vấn đề tương tác người dùng, hiệu suất của ứng dụng vẫn chưa được tối ưu.
Có thể làm gì để cải thiện điều này?
Khi người dùng scroll table, các cell đến và đi. Không có ý nghĩa gì trong việc tiếp tục tải và xử lý một hình ảnh của một cell không hiển thị. Tốt hơn là hủy khối code để cải thiện hiệu suất và giảm mức tiêu thụ pin của ứng dụng. Nhưng làm thế nào chúng ta có thể hủy một tác vụ đang chạy trong GCD?
Đây là lúc Operation xuất hiện.

## Chuyển số sang Operation
Hãy chia tác vụ thiết lập một table view cell thành hai tác vụ: một là tải hình ảnh và một là áp dụng filter.
```swift
class DownloadImageOperation: Operation {
    let url: URL
    var outputImage: UIImage?

    init(url: URL) {
        self.url = url
    }

    override func main() {
        guard !isCancelled else { return }

        URLSession.shared.dataTask(with: self.url, completionHandler: { (data, res, error) in
            guard error == nil,
                let data = data else { return }

            self.outputImage = UIImage(data: data)
        }).resume()
    }
}
```

```swift
class ImageFilterOperation: Operation {
    let context = CIContext(options: nil)
    var processedImage: UIImage?

    func grayScale(input: UIImage) -> UIImage? {
        var inputImage = CIImage(image: input)

        let filters = inputImage!.autoAdjustmentFilters()

        for filter: CIFilter in filters {
            filter.setValue(inputImage, forKey: kCIInputImageKey)
            inputImage =  filter.outputImage
        }

        let cgImage = context.createCGImage(inputImage!, from: inputImage!.extent)
        let currentFilter = CIFilter(name: "CIPhotoEffectTonal")
        currentFilter!.setValue(CIImage(image: UIImage(cgImage: cgImage!)), forKey: kCIInputImageKey)

        let output = currentFilter!.outputImage
        let cgimg = context.createCGImage(output!, from: output!.extent)
        return UIImage(cgImage: cgimg!)
    }

    override func main() {
        guard !isCancelled else { return }

        let dependencyImage = self.dependencies
            .compactMap { $0 as? DownloadImageOperation }
            .first

        if let image = dependencyImage?.outputImage {
            guard !isCancelled else { return }
            self.processedImage = self.grayScale(input: image)
        }
    }
}
```

Để sử dụng Operation, chúng ta chỉ đơn giản subclass class Operation và override method `main` nơi tác vụ của chúng ta được đặt. Mặc định, các operation chạy ở background, vì vậy không cần lo lắng về việc block main thread.
Quay lại tác vụ thiết lập table view cell, bạn có thể nhận thấy rằng có một dependency giữa hai tác vụ này, chúng ta chỉ thực hiện quá trình filter sau khi tải hình ảnh. Nói cách khác, operation `ImageFilterOperation` phụ thuộc vào operation `DownloadImageOperation`. Operation Dependencies là một trong những "tính năng sát thủ" của Operation cùng với khả năng hủy một operation đang chạy. Bằng cách liên kết hai operation, chúng ta đảm bảo rằng operation phụ thuộc không bắt đầu trước khi operation tiên quyết đã hoàn thành. Ngoài ra, việc liên kết tạo ra một cách sạch sẽ để truyền dữ liệu từ operation đầu tiên sang operation thứ hai.

```swift
e.g
let dependencyImage = self.dependencies
    .compactMap { $0 as? DownloadImageOperation }
    .first
```

Đã đến lúc thực hiện cải tiến.
Đầu tiên hãy định nghĩa một `OperationQueue` cho ViewController. Class `OperationQueue` là thứ chúng ta sử dụng để quản lý các Operation.

```swift
class ViewController: UIViewController {
    private let queue = OperationQueue()
    // Phần còn lại được bỏ qua
    // ...
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "CellId", for: indexPath) as! PostTableViewCell
        let input = urls[indexPath.row]
        let downloadOpt = DownloadImageOperation(url: URL(string: input.url)!)
        let grayScaleOpt = ImageFilterOperation()

        grayScaleOpt.addDependency(downloadOpt)
        grayScaleOpt.completionBlock = {
            DispatchQueue.main.async {
                cell.lblPostTitle.text = input.title
                cell.imgPostImage.contentMode = .scaleToFill
                cell.imgPostImage.image = grayScaleOpt.processedImage
            }
        }
        self.queue.addOperation(downloadOpt)
        self.queue.addOperation(grayScaleOpt)

        return cell
    }
}
```
Ở đây, chúng ta khởi tạo hai instance mới của class `DownloadImageOperation` và `ImageFilterOperation`. Sau đó, chúng ta đặt operation `grayScaleOpt` phụ thuộc vào `downloadOpt` điều này sẽ đảm bảo `grayScaleOpt` chỉ được thực thi sau khi `downloadOpt` đã hoàn thành. Cuối cùng, chúng ta thêm hai operation này vào `OperationQueue`. Một khi operation được thêm vào queue, operation sẽ được lên lịch. Nếu queue tìm thấy một thread khả dụng để chạy operation, công việc sẽ được thực thi cho đến khi nó hoàn thành hoặc bị hủy. Khi operation hoàn thành, `completionBlock` được gọi.

> "Các Operation có ảnh hưởng quan trọng đến hiệu suất ứng dụng của bạn. Ví dụ, nếu bạn muốn tải nhiều nội dung từ Internet, bạn có thể muốn làm như vậy chỉ khi thực sự cần thiết. Ngoài ra, bạn có thể quyết định đảm bảo rằng chỉ một số lượng operation cụ thể có thể chạy cùng một lúc. Nếu bạn quyết định giới hạn số lượng operation đồng thời trong một queue, bạn có thể thay đổi thuộc tính maxConcurrentOperationCount của operation queue của bạn. Đây là một thuộc tính integer cho phép bạn chỉ định tối đa bao nhiêu operation có thể chạy trong một queue tại một thời điểm nhất định." (iOS 8 Swift Programming Cookbook)

Học các lý thuyết trên là đủ, bây giờ re-build project để xem kết quả.

![](/Post-Resources/Operations/EmptyList.jpeg "EmptyList")

Ops! Không có gì xuất hiện, hình ảnh không được tải! Có gì đó sai ???
Trong tutorial tiếp theo, chúng ta sẽ tìm hiểu điều gì đã xảy ra với code của chúng ta và tại sao Operation không hoạt động đúng như mong đợi.
Cảm ơn bạn đã đọc.
