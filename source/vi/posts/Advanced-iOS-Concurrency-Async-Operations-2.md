---
title: 'iOS Concurrency Nâng Cao: Async Operations [2]'
date: 2020-05-30 17:02:31
tags: [Concurrency, Operations, iOS]
layout: post
lang: vi
---

![](/Post-Resources/Operations_2/operations.png "Operations")

Trong bài viết trước, [iOS Concurrency Nâng Cao: Operations](/2020/05/16/iOS-Concurrency-Operations), chúng ta đã đi qua các khái niệm về Operation trên iOS và xây dựng một ứng dụng demo để tải một số bài viết của tôi. Sau khi tải các hình ảnh bìa, chúng sẽ được áp dụng một filter đơn giản, sau đó được hiển thị trong table view. Tuy nhiên, ứng dụng vẫn chưa hoàn thiện. Có điều gì đó không đúng với ứng dụng của chúng ta khiến nó không hiển thị đúng các hình ảnh đã tải. Trong hướng dẫn này, chúng ta sẽ tiếp tục từ nơi đã dừng lại.
Sẵn sàng nào!
<!-- more -->
## Vòng đời của Operation
Để tìm ra tại sao ứng dụng của chúng ta không hoạt động đúng, hãy xem lại mã nguồn hiện tại
```swift
class DownloadImageOperation: Operation {
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

Hình ảnh sau mô tả các thay đổi về trạng thái của operation.
![](/Post-Resources/Operations_2/Async_Operation_State.png "Async_Operation_State")

Khi phương thức `main` được gọi, nó sẽ thực thi tác vụ bất đồng bộ của chúng ta và sau đó thoát ngay lập tức khiến trạng thái của operation chuyển sang `isFinish`. Tại thời điểm đó, tác vụ bất đồng bộ của chúng ta thực sự chưa hoàn thành.
Hiện tại, chúng ta đang gọi tải hình ảnh bên trong phương thức `main` của Operation. Nguyên nhân gốc rễ liên quan đến chính Vòng đời của Operation. Do đó, để hỗ trợ các operation bất đồng bộ trong ứng dụng, chúng ta cần quản lý thủ công các trạng thái của operation.

## [Key-Value Observing](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/KeyValueObserving/KeyValueObserving.html)
Trước khi triển khai class Async Operation tùy chỉnh, chúng ta cần học một khái niệm mới trước: KVO. Tôi giả định rằng bạn chưa nghe về khái niệm này nên chúng ta sẽ có một cái nhìn nhanh về nó trước.
Key-Value Observing, hay KVO, là một trong những kỹ thuật để theo dõi sự thay đổi trạng thái của một đối tượng trong Objective-C và Swift. Bất cứ khi nào giá trị của các thuộc tính được theo dõi thay đổi, khối mã theo dõi sẽ được thực thi. Cốt lõi của KVO dựa trên Observer Pattern.
Các class Swift được kế thừa từ class `NSObject` có các phương thức cho phép các đối tượng khác theo dõi các thuộc tính của chúng.

> Key-value observing cung cấp một cơ chế cho phép các đối tượng được thông báo về sự thay đổi của các thuộc tính cụ thể của các đối tượng khác. Nó đặc biệt hữu ích cho việc giao tiếp giữa các lớp model và controller trong một ứng dụng.

Hãy tạo một Playground để kiểm tra.
```swift
class CreditCard: NSObject {
    @objc dynamic private(set) var number: Int = 1000

    func increaseNumber(by value: Int) {
        self.number += value
    }
}

class Person: NSObject {
    let cretdit: CreditCard
    var kvoToken: NSKeyValueObservation?

    init(cretdit: CreditCard) {
        self.cretdit = cretdit
        kvoToken = self.cretdit.observe(\.number, options: .new) { (credit, change) in
            guard let newNumber = change.newValue else { return }

            print("New number is \(newNumber)")
        }
    }

    deinit {
        kvoToken?.invalidate()
    }
}

let credit = CreditCard()
let person = Person(cretdit: credit)
credit.increaseNumber(by: 500)
```

Ở đây, tôi định nghĩa hai class: `CreditCard` và `Person`. Một đối tượng `Person` giữ một đối tượng `CreditCard` như một thuộc tính. Điều tôi muốn là bất cứ khi nào thuộc tính `number` của thẻ tín dụng thay đổi, người đó sẽ được thông báo. Đây là lúc KVO xuất hiện.
Chạy đoạn code trên trong playground, bạn sẽ thấy log `New number is \(newNumber)` được in ra console.

Tại sao chúng ta cần biết về KVO? Câu trả lời là vì class Operation sử dụng thông báo KVO. Bất cứ khi nào trạng thái của Operation thay đổi, một thông báo KVO sẽ được gửi đi.
Không có thông báo KVO, OperationQueue sẽ không thể theo dõi trạng thái của các operation để cập nhật chính xác. Do đó, khi chúng ta tự quản lý trạng thái của operation, chúng ta phải đảm bảo các thông báo KVO đó được gửi đúng cách.

## Async Operation
Hãy tạo class `AsyncOperation` kế thừa từ class `Operation`.
```swift
class AsyncOperation: Operation {
    enum State: String {
        case ready, executing, finished

        var keyPath: String {
            return "is\(rawValue.capitalized)"
        }
    }
    // Phần còn lại của code
}
```

Tiếp theo, chúng ta khai báo một thuộc tính để theo dõi trạng thái của đối tượng.

```swift
var state = State.ready {
    willSet {
        willChangeValue(forKey: newValue.keyPath)
        willChangeValue(forKey: state.keyPath)
    }
    didSet {
        didChangeValue(forKey: oldValue.keyPath)
        didChangeValue(forKey: state.keyPath)
    }
}
```
Class cơ sở `Operation` cần biết sự thay đổi của cả trạng thái cũ và mới.
Lấy một trường hợp cụ thể làm ví dụ, trạng thái hiện tại là `ready`, sau đó chúng ta đặt trạng thái thành `executing`. Có 4 thông báo KVO nên được gửi:
- Đầu tiên, thông báo willChangeValue cho `isReady`.
- Sau đó, thông báo willChangeValue cho `executing`.
- Tiếp theo, thông báo willChange cho `isReady`.
- Cuối cùng, thông báo willChange cho `executing`.

Sau đó, chúng ta override các thuộc tính của trạng thái.
```swift
override var isReady: Bool {
    return super.isReady && state == .ready
}

override var isExecuting: Bool {
    return state == .executing
}

override var isFinished: Bool {
    return state == .finished
}

override var isAsynchronous: Bool {
    return true
}
```
Đó là tất cả để quản lý trạng thái của class Async Operation.

Khi thêm một operation vào operation queue, phương thức `start` là thứ được gọi đầu tiên. sau đó nó sẽ gọi phương thức `main` của operation để thực thi khối code chính mà bạn đã gán cho operation.
```swift
override func start() {
    main()
    state = .executing
}
```

Bạn còn nhớ khi tôi đề cập rằng Operation có các tính năng tuyệt vời khiến nó vượt trội hơn GCD? Tính năng đầu tiên là dependencies và tính năng còn lại là khả năng hủy một operation đang chạy. Nó rất hữu ích trong trường hợp chúng ta muốn dừng các operation không còn liên quan tại một thời điểm nhất định. Ví dụ, hủy tải dữ liệu khi người dùng cuộn table khiến một số cell biến mất.
Hãy thêm tính năng này vào class Async Operation của chúng ta.
Đầu tiên, chúng ta cần sửa đổi phương thức `start` để kiểm tra thuộc tính `isCancelled` trước khi thực sự gọi phương thức `main`.
```swift
override func start() {
    if isCancelled {
        state = .finished
        return
    }

    main()
    state = .executing
}
```

Và sau đó override phương thức `cancel` để cập nhật trạng thái thành `finished`
```swift
override func cancel() {
    state = .finished
}
```

Tại thời điểm này, chúng ta đã hoàn thành việc triển khai class `Async Operation`. Đã đến lúc kết hợp mọi thứ lại với nhau trong ứng dụng.

## Kết hợp tất cả lại với nhau
Vì class `DownloadImageOperation` thực thi bất đồng bộ, chúng ta không thể đặt class `Operation` làm class cơ sở của nó, giờ chúng ta đặt `AsyncOperation` thay thế. Xin lưu ý rằng để hỗ trợ việc hủy trong class `DownloadImageOperation`, chúng ta sẽ giữ giá trị trả về của việc tạo data task như một thuộc tính của class này để có thể hủy `URLSessionDataTask` này sau.
Class `DownloadImageOperation` sẽ trông như dưới đây.
```swift
class DownloadImageOperation: AsyncOperation {
    let url: URL
    var outputImage: UIImage?
    private var task: URLSessionDataTask?

    init(url: URL) {
        self.url = url
    }

    override func main() {
        self.task = URLSession.shared.dataTask(with: self.url, completionHandler: { [weak self] (data, res, error) in
            guard let `self` = self else { return }

            defer { self.state = .finished }

            guard !self.isCancelled else { return }

            guard error == nil,
                let data = data else { return }

            self.outputImage = UIImage(data: data)
        })
        task?.resume()
    }

    override func cancel() {
        super.cancel()
        task?.cancel()
    }
}
```
Hãy quay lại `ViewController` chính của chúng ta. Để hủy các operation đang chạy, trước tiên chúng ta thêm dictionary mới như một thuộc tính của `ViewController` để theo dõi tất cả các operation đang chạy cho mỗi cell của table view tại index path tương ứng.
```swift
private var operations: [IndexPath: [Operation]] = [:]
```

Bên trong delegate `func tableView(_ tableView:cellForRowAt indexPath:)`, sau khi thêm hai operation vào operation queue, chúng ta cũng sẽ thêm chúng vào dictionary `operations` để theo dõi. Ngoài ra, nếu có operation cho index path này, hủy nó trước khi giữ cái mới.
```swift
if let existingOperations = operations[indexPath] {
    for operation in existingOperations {
        operation.cancel()
    }
}
operations[indexPath] = [grayScaleOpt, downloadOpt]
```

Khi người dùng cuộn table, một số cell biến mất và delegate `func tableView(_ tableView:didEndDisplaying cell:indexPath:)` được gọi. Tại thời điểm đó, chúng ta cũng sẽ hủy các operation đang chạy cho cell đó để đảm bảo rằng chỉ các operation của các cell hiển thị mới đang thực thi.
```swift
func tableView(_ tableView: UITableView, didEndDisplaying cell: UITableViewCell, forRowAt indexPath: IndexPath) {
    if let operations = operations[indexPath] {
        for operation in operations {
            operation.cancel()
        }
    }
}
```

<div style="text-align:center">

![](/Post-Resources/Operations_2/final.gif "Final app")

</div>

Bây giờ, bạn sẽ thấy ứng dụng hoạt động đúng. Ngoài ra, bằng cách bắt đầu và hủy các operation một cách thông minh, chúng ta đang tiết kiệm lưu lượng mạng cũng như giảm tiêu thụ pin. Những điều này có thể giúp ứng dụng của chúng ta chạy nhanh hơn.

## Kết luận
Có một số lợi ích của `Operation` so với GCD giúp mã nguồn của chúng ta dễ bảo trì và tái sử dụng.
Cuối cùng cần đề cập, hãy cẩn thận khi sử dụng Operation hoặc GCD vì Concurrency đôi khi tạo ra các bug không phải lúc nào cũng rõ ràng để tìm và sửa. [Trong Clean Code Book](http://localhost:4000/2017/10/20/Review-Book-Clean-Code/), Robert C. Martin nêu ra một số điểm quan trọng khi làm việc với nhiều thread
> Có một số định nghĩa cơ bản chúng ta nên biết khi nói về concurrency và thread: Bound resources, mutual exclusion, starvation, deadlock, và livelock.

> Concurrency không phải lúc nào cũng cải thiện hiệu suất. Đôi khi nó tạo ra một số overhead và các bug từ nó thường không lặp lại được.

> Hạn chế việc truy cập dữ liệu được chia sẻ giữa nhiều hơn hai thread. Sử dụng bản sao của dữ liệu nếu có thể.

> Giữ các phần synchronized càng nhỏ càng tốt vì Lock tạo ra độ trễ và thêm overhead. Chúng rất tốn kém.

> Code đa luồng hoạt động khác nhau trong các môi trường khác nhau: Chạy test trong mọi môi trường triển khai tiềm năng.

Bạn có thể tìm thấy dự án hoàn chỉnh qua [link](https://github.com/uynguyen/iOS-Operations)
Cảm ơn bạn đã đọc.

## Tài liệu tham khảo
- Chapter 6: Operations, Concurrency By Tutorials - Multithreading in Swift with GCD and Operations, Raywenderlich,
- Chapter 7: Concurrency and Multitasking, iOS 8 Swift Programming Cookbook, O'Reilly.
