---
title: Memory Leak
date: 2018-09-12 11:09:15
tags: [iOS, Memory management]
layout: post
lang: vi
---
![](/Post-Resources/MemoryLeak/Cover.png "")
Là một Software Engineer, bạn chắc chắn đã nghe về khái niệm Memory leak. Memory leak là tình huống các khối bộ nhớ được cấp phát bởi chương trình vẫn còn trong bộ nhớ mặc dù chúng không còn được tham chiếu nữa. Leak lãng phí không gian bằng cách lấp đầy các trang bộ nhớ với dữ liệu không thể truy cập. Kết quả là, kích thước bộ nhớ sử dụng trong ứng dụng của bạn tiếp tục tăng, ảnh hưởng đến trải nghiệm người dùng và hiệu suất của ứng dụng. Tệ hơn nữa, ứng dụng của bạn sẽ bị crash ngẫu nhiên vì một tiến trình sẽ bị hệ thống kết thúc nếu nó tiêu thụ quá nhiều bộ nhớ.
Trong chủ đề này, chúng ta sẽ thảo luận cách bộ nhớ được quản lý trong iOS và cách sử dụng bộ nhớ hiệu quả. Đọc tiếp nào.
<!-- more -->
## Automatic Reference Counting
### ARC
Hầu hết các ngôn ngữ lập trình hiện đại (như Java, C#, Go, v.v.) đều có một quy trình tích hợp tự động tìm các đối tượng không sử dụng và xóa chúng để giải phóng bộ nhớ. Mục đích chính của công nghệ này là giảm memory leak và cho phép lập trình viên tập trung vào logic nghiệp vụ mà không phải lo lắng quá nhiều về quản lý bộ nhớ.
Là một ngôn ngữ lập trình cấp cao, Swift cũng có Automatic Reference Counting (ARC) để quản lý bộ nhớ sử dụng trong ứng dụng của chúng ta.
### Cách ARC hoạt động
Bất cứ khi nào chúng ta tạo một instance mới của một class, ARC sẽ cấp phát một không gian bộ nhớ để lưu trữ thông tin về instance đó. Bộ nhớ này chứa thông tin về kiểu của instance, bất kỳ thuộc tính lưu trữ nào liên kết với instance đó. Đặc biệt, bộ nhớ này chứa thông tin về có bao nhiêu thuộc tính, hằng số và biến đang tham chiếu đến instance đó. ARC sẽ không bao giờ giải phóng instance đó miễn là còn ít nhất một tham chiếu hoạt động đến instance đó còn tồn tại.
Khi số lượng đối tượng tham chiếu đến instance đó về không, ARC sẽ giải phóng instance đó và giải phóng bộ nhớ được giữ bởi instance đó.
Bằng cách áp dụng kỹ thuật này, Apple đảm bảo rằng các instance của class không tiếp tục chiếm không gian trong bộ nhớ khi chúng không còn cần thiết, nói chung tránh được vấn đề memory leak.

## Memory leak
Trong hầu hết các trường hợp, ARC làm tốt công việc của mình. Chúng ta thường không lo lắng về quản lý bộ nhớ. Tuy nhiên, leak vẫn xảy ra trong iOS do vô tình. Đây là khi hai đối tượng giữ tham chiếu mạnh đến nhau khiến mỗi đối tượng giữ đối tượng kia không bị giải phóng.

Hãy lấy một ví dụ, có hai class tên là `Person` và `Car`.
```swift
class Person {
    let name: String
    var car: Car?

    lazy var greeting: () -> String = {
        return "Hello, my name is \(self.name). I have \(self.car?.name ?? "no cars")"
    }

    init(name: String) {
        self.name = name
    }

    deinit {
        print("Person \(self.name) is being destroyed.")
    }
}

class Car {
    let name: String
    var owner: Person?

    init(name: String) {
        self.name = name
    }

    deinit {
        print("car \(self.name) is being destroyed.")
    }
}
```
Mỗi instance `Person` có thuộc tính `name` kiểu `String` và thuộc tính `Car` optional ban đầu là nil vì một người có thể không phải lúc nào cũng có xe.
Tương tự, mỗi instance `Car` có thuộc tính `name` kiểu `String` và thuộc tính `Person` optional ban đầu là nil vì một chiếc xe có thể không phải lúc nào cũng có chủ.
Tiếp theo, hãy định nghĩa hai biến gọi là `Foo` và `BMW` của class `Person` và `Car`, tương ứng. Bây giờ, chúng ta liên kết hai instance với nhau để người có xe, và xe có chủ.
```swift
# Khối chính
var foo: Person? = Person(name: "Foo")
var car: Car? = Car(name: "BMW")
foo!.car = car
seat!.owner = foo
print(foo!.greeting())
```
Đoạn code tiếp theo sẽ giải phóng hai instance này bằng cách đặt chúng thành nil.
```swift
foo = nil
seat = nil
```
Như bạn có thể biết, khi đặt một biến thành nil, có nghĩa là không còn tham chiếu đến instance class này, ARC sẽ giải phóng không gian của đối tượng này để giải phóng bộ nhớ. Như mong đợi, chúng ta nên thấy các phương thức `deinit` của `Student` và `Car` được gọi. Tuy nhiên, hai phương thức đó không bao giờ được gọi, không có thông báo nào, chỉ ra đối tượng được giải phóng, được in ra console. Điều này có nghĩa là `foo` và `car` không bao giờ được giải phóng.
![](/Post-Resources/MemoryLeak/Strong_Reference.png "")
Lý do tại sao hai đối tượng này không được giải phóng là vì hai đối tượng này giữ tham chiếu mạnh đến nhau khiến mỗi đối tượng giữ đối tượng kia không bị giải phóng, dẫn đến chúng không bao giờ được giải phóng. Tình huống này được gọi là *strong reference cycle* trong lập trình.

## Phá vỡ strong reference cycle
Có hai cách để phá vỡ strong reference cycle trong Swift. Tùy thuộc vào tình huống chúng ta đang gặp, chúng ta sẽ chọn cách tiếp cận hợp lý để giải quyết vấn đề. Cả hai phương pháp đều cho phép một instance tham chiếu đến instance khác mà không giữ chặt nó.

### Weak reference
Weak reference nên được sử dụng khi đối tượng nó tham chiếu có thể trở thành nil trong tương lai. Do đó, các đối tượng được capture là kiểu optional.
Trong ví dụ trên, việc một chiếc xe không có chủ tại một thời điểm nào đó trong vòng đời của nó là phù hợp, vì vậy weak reference là cách thích hợp để phá vỡ reference cycle trong trường hợp này.
![](/Post-Resources/MemoryLeak/Weak_Reference.png "")
Hãy thực hiện một số thay đổi để điều kỳ diệu xảy ra
```swift
class Car {
    let name: String
    weak var owner: Person?

    init(name: String) {
        self.name = name
    }

    deinit {
        print("Car \(self.name) is being destroyed.")
    }
}
```
Hãy chạy code, vẫn không có thông báo nào được in ra console, có nghĩa là hai đối tượng không được giải phóng. Cái quái gì vậy!
Hãy truy ngược lại code của chúng ta để kiểm tra có gì sai với nó.
Bạn có thấy không? Có một vấn đề khác với code: Closure.

### Unowned reference
Trong ví dụ trên, class `Person` không chỉ tạo strong reference cycle với class `Car` mà còn giữa chính nó và closure `greeting`. Đây là cách cycle trông như thế:
![](/Post-Resources/MemoryLeak/Strong_Unowned_Reference.png "")
Để giải quyết vấn đề này, chúng ta sẽ sử dụng "Unowned reference". Unowned reference nên được sử dụng khi closure và đối tượng nó tham chiếu sẽ luôn có cùng thời gian sống với nhau. Điều này có nghĩa là hai đối tượng sẽ được giải phóng cùng một lúc. Kết quả là, unowned reference không bao giờ có thể trở thành nil.
Hãy thực hiện một số thay đổi để điều kỳ diệu xảy ra (Một lần nữa).
```swift
class Person {
    let name: String
    var car: Car?

    lazy var greeting: () -> String = { [unowned self] in
        return "Hello, my name is \(self.name). I have \(self.car?.name ?? "no cars")"
    }

    init(name: String) {
        self.name = name
    }

    deinit {
        print("Person \(self.name) is being destroyed.")
    }
}
```
Hãy chạy code, bạn sẽ thấy các thông báo sau được in ra console.
```bash
Hello, my name is Foo. I have BMW
Person Foo is being destroyed.
Car BMW is being destroyed.
```
Hai đối tượng `foo` và `car` đã được giải phóng và leak đã được giải quyết.
Đây là cách cycle trông như thế cho đến nay:
![](/Post-Resources/MemoryLeak/Unowned_Reference.png "")

## Công cụ để phát hiện strong reference cycle
Gặp phải memory leak thường là cơn ác mộng đối với iOS developer vì quá khó để tìm ra nguyên nhân gốc rễ. May mắn thay, chúng ta có nhiều công cụ được Apple hỗ trợ để theo dõi memory leak.
### Allocations và Leaks Instrument
Từ thanh công cụ của XCode, chọn Product > Profile > Allocations để bắt đầu một profile instrument mới để theo dõi cấp phát bộ nhớ. Allocations instrument theo dõi tất cả các đối tượng mà ứng dụng cấp phát trong suốt vòng đời của nó.
Bây giờ, nhấn nút đỏ ở phía trên bên trái trong panel để bắt đầu ghi.
![](/Post-Resources/MemoryLeak/Instrument.png "")
Có rất nhiều thông tin liên quan đến memory mapping được hiển thị trong công cụ. Để xác định memory leak, chúng ta chỉ cần tập trung vào hai cột chính: #Persident và #Transident.
- Cột Persident: giữ số lượng đối tượng của mỗi kiểu hiện đang tồn tại trong bộ nhớ.
- Cột Transident: hiển thị số lượng đối tượng đã tồn tại nhưng đã được giải phóng.

Như bạn thấy, cột #Persident tiếp tục tăng bất cứ khi nào bạn nhấn nút "Create a leak" để thực thi khối chính. Khi bạn thấy điều gì đó như thế này xảy ra với ứng dụng của bạn, đã đến lúc xem xét lại các class của bạn để tìm ra leak ở đâu.
![](/Post-Resources/MemoryLeak/Create_Leak_Instrument.png "")
### Debug Memory Graph
Debug Memory Graph là một công cụ lần đầu được giới thiệu trong Xcode 8. Nó có thể bắt được các leak như retain cycle.
Từ debug navigator, click debug mode > View Memory Graph Hierarchy để trực quan hóa memory mapping
![](/Post-Resources/MemoryLeak/Visual_Strong_Reference_Cycle_1.png "")
Bạn sẽ thấy một cái gì đó như thế này.
![](/Post-Resources/MemoryLeak/Visual_Strong_Reference_Cycle_2.png "")
Từ hình trực quan, chúng ta có thể thấy có hai strong reference cycle đến từ mối quan hệ `Person`-`Car` và từ bên trong chính `Person`.

## Kết luận
Mỗi iOS developer nên có hiểu biết sâu sắc về cách ARC hoạt động để tránh memory leak. Không thể phủ nhận, quản lý bộ nhớ tốt góp phần vào hiệu suất ứng dụng và trải nghiệm người dùng. Hy vọng, tất cả các khái niệm chúng ta đi qua trong bài viết này sẽ giúp bạn xây dựng các ứng dụng có hiệu suất tốt nhất. Hãy để lại bình luận của bạn ở đây.
## Tài liệu tham khảo
[1] The Swift Programming Language (Swift 4.0.3), App Inc., chương Automatic Reference Counting.
