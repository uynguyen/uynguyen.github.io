---
title: Grand Central Dispatch trong Swift
date: 2018-01-04 11:43:23
tags: ["iOS", "DispatchQueue"]
layout: post
lang: vi
thumbnail: /Post-Resources/GCD/Banner.png
---
*Grand Central Dispatch*, hay viết tắt là GCD, là một tập API C cấp thấp để quản lý các tác vụ đồng thời. Nó giúp chúng ta cải thiện hiệu suất ứng dụng bằng cách thực thi một khối code trên các thread phù hợp, như thực hiện các tác vụ tính toán nặng ở background. GCD cung cấp nhiều tùy chọn để chạy các tác vụ như đồng bộ, bất đồng bộ, sau một khoảng delay nhất định, v.v.
Trong bài viết này, tôi sẽ giải thích chi tiết hơn về GCD và cách nó hoạt động, cũng như cung cấp một số điểm thú vị khi làm việc với GCD. Hãy bắt đầu.
<!-- more -->
## Giới thiệu
Trung tâm của GCD là các dispatch queue - những pool của các thread được quản lý bởi GCD. Apple tạo ra GCD để các developer không cần quan tâm quá nhiều đến các queue này, họ chỉ đơn giản dispatch một khối code đến một queue nhất định mà không cần quan tâm thread nào được sử dụng.

## Các khái niệm GCD
### Concurrency
Concurrency đạt được khi có nhiều hơn hai tác vụ được thực thi cùng một lúc. Thực tế, từ "Concurrency" không chính xác có nghĩa là "cùng một lúc" hay "xảy ra song song". Bên trong, CPU cung cấp cho mỗi tác vụ một khoảng thời gian nhất định để thực hiện công việc. Ví dụ, nếu có 5 tác vụ cần được thực thi trong một giây, với cùng độ ưu tiên, hệ điều hành sẽ chia 1.000 mili giây cho 5 (tác vụ) và sẽ cung cấp cho mỗi tác vụ 200 mili giây thời gian CPU. Kết quả là, chúng sẽ có vẻ như được thực thi đồng thời.

### Serial queue và concurrent queue
Một serial queue sẽ thực thi các tác vụ theo kiểu first-in-first-out (FIFO). Điều này có nghĩa là chúng chỉ có thể thực thi một khối code tại một thời điểm. Chúng không chạy trên main thread, do đó, chúng không block UI.
![](/Post-Resources/GCD/SerialQueue.png "")
Ngược lại, một concurrent queue cho phép thực thi nhiều tác vụ song song. Điều này có nghĩa là các tác vụ có thể hoàn thành theo bất kỳ thứ tự nào và bạn sẽ không biết thời gian nó sẽ mất.
![](/Post-Resources/GCD/ConcurrentQueue.png "")

### Phương thức đồng bộ (sync) và bất đồng bộ (async)
Khi bạn dispatch một tác vụ đến một queue, bạn xác định xem khối đó chạy đồng bộ hay bất đồng bộ. Có một số khác biệt chính giữa hai kỹ thuật:
- Phương thức đồng bộ trả quyền điều khiển cho caller chỉ sau khi tác vụ hoàn thành trong khi phương thức bất đồng bộ trả quyền điều khiển cho caller ngay lập tức.
- Vì các phương thức bất đồng bộ trả quyền điều khiển ngay lập tức nên chúng không block thread hiện tại.
- Lưu ý rằng từ "đồng bộ" không có nghĩa là chương trình phải đợi code hoàn thành trước khi tiếp tục. Nó chỉ có nghĩa là concurrent queue sẽ đợi cho đến khi tác vụ hoàn thành trước khi nó thực thi khối code tiếp theo trên queue.
Code dưới đây minh họa cách sử dụng thực thi async và sync.
```swift
DispatchQueue.global().sync { [1]
    print("A")
    DispatchQueue.global().async {
        for i in 0...5 {
            print(i)
        }
    }
}

DispatchQueue.global().sync { [2]
    print("B")
    DispatchQueue.global().async {
        for i in 6...10 {
            print(i)
        }
    }
}
```
Nói chung, chúng ta không thể dự đoán output khi chạy code trên vì mỗi lần chạy chương trình, nhiều output khác nhau sẽ được in ra. Chúng ta chỉ có thể nói rằng "B" sẽ luôn được in sau "A" vì caller cần đợi khối [1] trả quyền điều khiển để có thể thực thi khối tiếp theo [2].
Nếu chúng ta sửa các khối bên trong thành `sync`, chúng ta đảm bảo rằng output sẽ luôn là `A 0 1 2 3 4 5 B 6 7 8 9 10`.
### Ba loại queue chính
Có ba loại queue chính trong GCD:
- Main queue: Các tác vụ được dispatch đến queue này sẽ được thực hiện trên main thread, nơi các công việc liên quan đến UI được gọi. *Main queue là một serial queue*.
*Lưu ý quan trọng*, phương thức sync không thể được gọi trên main thread vì nó sẽ block thread hoàn toàn và dẫn ứng dụng đến deadlock. Do đó, tất cả các tác vụ gửi đến main queue phải được gửi bất đồng bộ.
```swift
override func viewDidLoad() {
    super.viewDidLoad()
    let mainQueue = DispatchQueue.main
    mainQueue.sync { // -> Code này sẽ dẫn đến Deadlock
        print("Inner block called")
    }
}
```

![](/Post-Resources/GCD/Deadlock_On_Main_Queue.png "")
- Global queues: Chúng là các concurrent queue và được chia sẻ bởi hệ thống. Chúng ta sử dụng global queue cho bất kỳ tác vụ nào không liên quan đến UI. Ví dụ, tải một hình ảnh từ internet sau đó hiển thị nó cho người dùng sau khi tải xong, lấy database từ server, v.v.
Khi làm việc với global queue, chúng ta không chỉ định độ ưu tiên mà sử dụng *Quality of Service* (QoS) để giúp GCD xác định độ ưu tiên của các tác vụ. Điều quan trọng cần lưu ý là các ứng dụng sử dụng nhiều tài nguyên khác nhau như CPU, bộ nhớ, giao diện mạng, v.v. Do đó, chúng ta nên chọn QoS phù hợp của queue để duy trì khả năng phản hồi và hiệu quả của ứng dụng. Hệ điều hành sẽ dựa trên QoS đã cho để đưa ra quyết định thông minh về thời điểm và nơi thực thi chúng.
Có bốn loại QoS:
-- *User-interactive*: Điều này chỉ ra rằng các tác vụ cần được thực thi ngay lập tức để duy trì khả năng phản hồi trên UI. Chúng ta sử dụng nó cho cập nhật UI hoặc thực hiện animation.
-- *User-initiated*: Công việc mà người dùng đã khởi tạo và yêu cầu kết quả ngay lập tức (Trong vài giây hoặc ít hơn). Chúng ta sử dụng nó để thực hiện một hành động khi người dùng click vào thứ gì đó trong UI.
-- *Utility*: Các tác vụ có thể mất một thời gian để hoàn thành và không yêu cầu kết quả ngay lập tức (Mất vài giây đến vài phút) như tải dữ liệu.
-- *Background*: Điều này đại diện cho các tác vụ mà người dùng không trực tiếp nhận biết. Thông thường, chúng ta sử dụng nó để lấy dữ liệu hoặc bất kỳ tác vụ nào không yêu cầu tương tác người dùng.
- Custom queues: Khi bạn tạo một custom queue, bạn có thể chỉ định loại queue đó là gì (Serial hoặc concurrent). Mặc định, chúng là serial queue.

## Deadlock
Từ `Deadlock` đề cập đến một tình huống trong đó một tập các thread khác nhau chia sẻ cùng một tài nguyên đang đợi nhau giải phóng tài nguyên để hoàn thành các tác vụ của mình.
![](/Post-Resources/GCD/Deadlock.png "")
Khi làm việc với GCD, nếu chúng ta không hiểu đầy đủ các khái niệm của GCD, chúng ta có thể tạo ra deadlock trong code. Ví dụ, code dưới đây đang tạo ra một deadlock.
```swift
func deadLock() {
	let myQueue = DispatchQueue(label: "myLabel")
	myQueue.async {
	    myQueue.sync {
	        print("Inner block called")
	    }
	    print("Outer block called")
	}
}
```
Đầu tiên, chúng ta tạo một custom queue với một label nhất định. Sau đó, chúng ta dispatch bất đồng bộ một khối code gọi một khối code khác đồng bộ. Rõ ràng là khối bên trong và khối bên ngoài đang thực thi trên cùng một queue. Mặc định, một custom queue là serial nên khối bên trong sẽ không bắt đầu trước khi khối bên ngoài hoàn thành. Mặt khác, khối bên ngoài không thể hoàn thành vì khối bên trong đang giữ quyền điều khiển của thread hiện tại (Đồng bộ). Do đó, deadlock xảy ra.
Có hai cách để khắc phục vấn đề. Cách thứ nhất là thay đổi loại queue thành `concurrent`. Bằng cách này, chúng ta đảm bảo rằng khối bên trong không phải đợi khối bên ngoài hoàn thành để có thể bắt đầu.
```swift
let myQueue = DispatchQueue(label: "myLabel", attributes: .concurrent)
```
Cách thứ hai là thay đổi khối bên trong thành `async`. Lần này, khối bên ngoài sẽ không đợi khối bên trong hoàn thành để có thể bắt đầu.
```swift
myQueue.async {
    myQueue.async {
        print("Inner block called")
    }
    print("outer block called")
}
```
Có một khuyến nghị trên tài liệu Apple về Deadlock tại [chương Dispatch queues and thread safety](https://developer.apple.com/library/content/documentation/General/Conceptual/ConcurrencyProgrammingGuide/OperationQueues/OperationQueues.html#//apple_ref/doc/uid/TP40008091-CH102-SW28)
`"Không gọi hàm dispatch_sync từ một tác vụ đang thực thi trên cùng queue mà bạn truyền vào lời gọi hàm của bạn. Làm như vậy sẽ gây deadlock cho queue.
Nếu bạn cần dispatch đến queue hiện tại, hãy làm như vậy bất đồng bộ bằng cách sử dụng hàm dispatch_async."`
## Livelock
Có một khái niệm lock khác ngoài deadlock gọi là `Livelock`. Không giống như deadlock, livelock không block thread hiện tại. Chúng chỉ không thể tiến triển thêm. Hoặc chính xác hơn, livelock là "một tình huống trong đó hai hoặc nhiều process liên tục thay đổi trạng thái của chúng để phản hồi các thay đổi trong (các) process khác mà không thực hiện bất kỳ công việc hữu ích nào".
Có một ví dụ thực tế hay về livelock trên [StackOverflow](https://stackoverflow.com/questions/1036364/good-example-of-livelock)
`Một cặp vợ chồng đang cố ăn súp, nhưng chỉ có một chiếc thìa giữa họ. Mỗi người đều quá lịch sự, và sẽ đưa thìa nếu người kia chưa ăn.`
Có các loại lock khác khi chúng ta làm việc với concurrency như bound resources, mutual exclusion, starvation. Vì phạm vi của bài viết này, tôi sẽ không giải thích tất cả ở đây. Vui lòng tham khảo các nguồn khác để biết thêm chi tiết.
## Lưu ý quan trọng
- Trên iPhone, các hoạt động discretionary và background, bao gồm networking, bị tạm dừng khi bật Low Power Mode.
- Khi sử dụng Xcode 9 với iOS 11, một cảnh báo sẽ được phát ra khi một đối tượng giao diện người dùng được truy cập từ một thread không phải main.
- Độ ưu tiên user interactive nên hiếm trong chương trình của bạn. Nếu mọi thứ đều có độ ưu tiên cao, thì không có gì là cao cả.

## Kết luận
Trong bài viết này, tôi đã cho bạn thấy một số điểm thú vị về GCD trong Swift. Trong bài viết tiếp theo, chúng ta sẽ thảo luận thêm về các khái niệm nâng cao khác của lập trình đồng thời như DispatchGroup, Operation Queue, Group Tasks, v.v. Sau đó chúng ta sẽ triển khai một dự án nhỏ để kết hợp chúng lại với nhau.
Nếu bạn có bất kỳ ý kiến nào, đừng ngần ngại liên hệ với tôi.

## Tài liệu tham khảo
[1] [Tài liệu Apple: Concurrency Programming Guide](https://developer.apple.com/library/content/documentation/General/Conceptual/ConcurrencyProgrammingGuide/Introduction/Introduction.html)
[2] iOS 8 Swift Programming Cookbook của O'Reilly, Chương 7: Concurrency and Multitasking.


