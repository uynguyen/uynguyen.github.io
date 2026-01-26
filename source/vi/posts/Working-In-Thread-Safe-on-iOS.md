---
title: Làm việc với Thread Safe trên iOS
date: 2018-06-05 21:03:32
tags: [iOS, Concurrency]
layout: post
permalink: vi/posts/Working-In-Thread-Safe-on-iOS/
lang: vi
---

![](/Post-Resources/ThreadSafe/cover.png "")
Như bạn có thể biết, từ "Thread safe" đề cập đến một khái niệm khoa học máy tính trong ngữ cảnh của các chương trình đa luồng. Một đoạn code được gọi là "Thread safe" nếu bất kỳ dữ liệu chia sẻ nào chỉ được truy cập bởi một thread tại bất kỳ thời điểm nào. Lưu ý rằng các dữ liệu chia sẻ này được gọi là critical section trong hệ điều hành.
Điểm quan trọng là các kiểu collection trong Swift như Array và Dictionary không phải thread-safe khi được khai báo mutable (với từ khóa `var`).
Trong bài viết này, chúng ta sẽ thảo luận một số kỹ thuật để làm cho code của chúng ta thread safe trong iOS.
<!-- more -->
## Nghiên cứu tình huống
Giả sử chúng ta có một array chứa dữ liệu quan trọng. Trong thực tế, nó có thể là số tiền trong thẻ tín dụng, trạng thái giao dịch, v.v. Chúng thực sự quan trọng nên nếu chúng ta không bảo vệ các giá trị này một cách chính xác, chúng ta sẽ gặp phải các lỗi nghiêm trọng khi runtime.
Để mô phỏng một race condition, tôi sẽ sử dụng `DispatchQueue.concurrentPerform` để tạo 10 thread đồng thời chạy cùng một lúc.
```swift
class ViewController: UIViewController {

    var array = [Int]()

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // Thực hiện bất kỳ thiết lập bổ sung nào sau khi load view, thường từ nib.
        DispatchQueue.concurrentPerform(iterations: 10) { index in
            self.array.append(index)
        }
    }
    // Phần còn lại của code
}
```

Kết quả của code trên là không thể dự đoán được. Bạn sẽ rơi vào 2 trường hợp:

- Hầu hết các lần bạn chạy code này, bạn sẽ gặp crash runtime như thế này
![](/Post-Resources/ThreadSafe/crash.png "")
Vấn đề cơ bản là vì các collection trong Swift như Array và Dictionary không phải thread-safe nhưng chúng ta cho phép nhiều thread sửa đổi array cùng một lúc. [Stackoverflow](https://stackoverflow.com/questions/47959397/concurrentperform-unsafemutablepointer-deinitialize-error-while-adding-value-to?noredirect=1&lq=1)

- Nếu bạn may mắn không gặp crash này, các phần tử của array sẽ trông ngẫu nhiên như thế này:
`Element count 5`
`Element count 9`
`Element count 10`
Điểm quan trọng là chúng ta không phải lúc nào cũng nhận được 10 phần tử như mong đợi.

Nó xảy ra như thế nào?
![](/Post-Resources/ThreadSafe/Race-Condition.png "")
Không an toàn khi để một thread sửa đổi giá trị trong khi thread khác đang đọc nó.
## Giải pháp
Cách để tránh race condition là đồng bộ hóa dữ liệu, hoặc các critical section. Đồng bộ hóa dữ liệu thường có nghĩa là "khóa" nó để chỉ một thread có thể truy cập phần code đó tại một thời điểm.
Vì Swift không hỗ trợ các giải pháp concurrency tích hợp sẵn, chúng ta sẽ sử dụng Grand Central Dispatch để triển khai thread safe thay thế.

### Sử dụng serial queue
Bằng cách tận dụng serial queue, chúng ta có thể ngăn chặn race condition trên một tài nguyên. Như tôi đã giới thiệu cách serial queue hoạt động trong bài viết trước, [Grand-Central-Dispatch-in-Swift](/2018/01/04/Grand-Central-Dispatch-in-Swift/), một serial queue chỉ cho phép một process chạy tại một thời điểm nên array an toàn khỏi các process đồng thời.

```Swift
class SafetyArray<T> {
        var array = [T]()
        let serialQueue = DispatchQueue(label: "com.uynguyen.queue")

        var last: T? {
            var result: T?
            self.serialQueue.sync {
                result = self.array.last
            }
            return result
        }

        func append(_ newElement: T) {
            self.serialQueue.async() {
                self.array.append(newElement)
            }
        }
    }
```

Mặc dù chúng ta bảo vệ array khỏi việc bị truy cập bởi nhiều thread, việc sử dụng serial queue không phải là giải pháp tốt nhất. Đọc giá trị cuối cùng không được tối ưu vì nhiều yêu cầu đọc phải đợi lẫn nhau vì nó nằm trong một serial queue. Các thao tác đọc nên có thể xảy ra đồng thời, miễn là chúng ta không thực hiện ghi cùng một lúc.

### Sử dụng concurrent queue với cờ `barrier`
Ý tưởng chính của giải pháp này là sử dụng một concurrent queue thay vì serial queue.
Swift hỗ trợ chúng ta dispatch một khối code đến một concurrent queue với một cờ gọi là `barrier`. Cờ *barrier* đảm bảo rằng concurrent queue không thực thi bất kỳ tác vụ nào khác trong khi thực thi process `barrier`. Một khi process `barrier` hoàn thành, queue sẽ cho phép chạy các tác vụ khác đồng thời theo triển khai mặc định.
```swift
class SafeArray<T> {
        var array = [T]()
        let concurrentQueue = DispatchQueue(label: "com.uynguyen.queue", attributes: .concurrent)

        var last: T? {
            var result: T?
            self.concurrentQueue.sync {
                result = self.array.last
            }
            return result
        }

        func append(_ newElement: T) {
            self.concurrentQueue.async(flags: .barrier) {
                self.array.append(newElement)
            }
        }
    }
```
Chúng ta tiếp tục sử dụng phương thức sync để đọc phần tử cuối cùng, nhưng tất cả các reader sẽ chạy song song lần này vì chúng ta đang sử dụng concurrent queue.
![](/Post-Resources/ThreadSafe/Barrier.png "")

## Sự đánh đổi
Làm việc với nhiều thread là phần khó của việc code. Mặc dù chúng ta phải bảo vệ các critical section khỏi nhiều truy cập, chúng ta nên ghi nhớ rằng *"Giữ các phần đồng bộ hóa càng nhỏ càng tốt vì Lock tạo ra độ trễ và thêm overhead. Chúng tốn kém"*. [Clean code](/2017/10/20/Review-Book-Clean-Code/).
Một số mẹo để xử lý concurrency:
- Concurrency không phải lúc nào cũng cải thiện hiệu suất. Đôi khi nó phát sinh một số overhead và các bug từ nó thường không lặp lại được.
- Giới hạn quyền truy cập của dữ liệu được chia sẻ giữa nhiều hơn hai thread. Sử dụng bản sao của dữ liệu nếu có cơ hội.
- Code đa luồng hoạt động khác nhau trong các môi trường khác nhau: Chạy test trong mọi môi trường triển khai tiềm năng.

## Suy nghĩ cuối cùng
Thread safe là một trong những khái niệm quan trọng nhất trong khoa học máy tính, đặc biệt trong một hệ thống cho phép truy cập dữ liệu đồng thời. Hiểu cách làm cho code thread safe, chúng ta có thể tránh các lỗi nghiêm trọng xảy ra khi runtime.
Happy coding.
