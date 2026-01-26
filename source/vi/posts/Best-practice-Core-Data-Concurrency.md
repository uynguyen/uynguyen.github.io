---
title: 'Best practice: Core Data Concurrency'
date: 2019-09-01 10:13:01
tags: [Core Data, iOS, Concurrency]
layout: post
permalink: vi/posts/Best-practice-Core-Data-Concurrency/
lang: vi
---

![](/Post-Resources/CoreDataConcurrency/banner.png "Core data stack")
Một số ứng dụng có thể tồn tại mà không cần bất kỳ bộ lưu trữ dữ liệu nào. Tuy nhiên, hầu hết các ứng dụng hữu ích khác đều lưu một số trạng thái như cấu hình người dùng, hồ sơ người dùng, mục tiêu, v.v. Trên iOS, Apple cung cấp Core Data như một framework để lưu trữ dữ liệu quý giá của bạn. Một điều cần lưu ý là mặc dù CoreData có thể lưu trữ dữ liệu trong cơ sở dữ liệu quan hệ nhưng thực tế nó không phải là một database engine.
Trong bài hướng dẫn này, tôi sẽ chia sẻ với bạn một trải nghiệm tồi tệ tôi gặp phải khi làm việc với Core Data. Hy vọng rằng sau khi đọc chia sẻ của tôi, bạn sẽ tránh được vấn đề tương tự trong các dự án của mình.
Hãy bắt đầu.
<!-- more -->
# Ba thành phần chính của core data stack
Trước hết, tôi sẽ liệt kê ba thành phần chính của core data stack, bạn có thể hoặc không quen thuộc với các thuật ngữ này nhưng tốt hơn hết là hiểu sâu về core data stack trước khi đào sâu hơn.
Core Data API, còn được gọi là stack, bao gồm ba thành phần chính:
- *NSManagedObjectModel*: Data model mô tả một entity (đối tượng).
- *NSManagedObjectContext*: Các object khi được fetch từ persistent storage được đặt trong managed object context. Nó thực hiện các validation và theo dõi các thay đổi được thực hiện trên các thuộc tính của object để các thao tác undo và redo có thể được áp dụng cho nó, nếu cần. Trong một context nhất định, một managed object cung cấp một đại diện của một record trong persistent store. Tùy thuộc vào tình huống, có thể có nhiều context, mỗi context chứa một managed object riêng biệt đại diện cho record đó. Tất cả các managed object được đăng ký với một managed object context.
- *NSPersistentStoreCoordinator*: `NSManagedObjectContext` không làm việc trực tiếp với `NSPersistentStore` để lưu trữ và truy xuất dữ liệu, mà NSPersistentStoreCoordinator sẽ làm điều đó. Vai trò chính của `NSPersistentStoreCoordinator` là quản lý trạng thái của managed object context và serialize các lệnh gọi đến `NSPersistenStore` để tránh sự dư thừa.

Bạn có thể tìm thấy các vai trò chính của mỗi thành phần qua hình ảnh sau
![](/Post-Resources/CoreDataConcurrency/CoreDataStack.png "Core data stack")

Chúng ta đã có đủ kiến thức về Core Data và các thành phần khác nhau của nó. Bây giờ, hãy chuyển sang phần chính.

# Core data hỗ trợ concurrency
Core Data hỗ trợ multi-threading trong một ứng dụng, có nghĩa là nhiều hơn một thread có thể được thực thi song song để tăng hiệu suất. Thậm chí một số tác vụ có thể được thực hiện ở chế độ nền bằng cách sử dụng một thread riêng biệt.
Như bạn có thể biết, khi làm việc với CoreData, có hai cách để định nghĩa một managed object context: `NSMainQueueConcurrencyType` và `NSPrivateQueueConcurrencyType`. Tùy thuộc vào chúng ta để quyết định loại MOC nào nên tạo trong các ứng dụng của mình. Chủ yếu chúng ta sẽ làm việc trên main queue, nhưng để tránh xử lý dữ liệu trên main queue, vì nó có thể ảnh hưởng đến trải nghiệm người dùng khi thực hiện các tác vụ nặng trên main thread, đôi khi chúng ta cần tạo một private queue context và thực hiện các tác vụ nặng đó trên private context này.
Concurrency chắc chắn làm cho ứng dụng hiệu quả hơn vì các tác vụ bây giờ có thể thực hiện song song, nhưng có một số quy tắc nghiêm ngặt được Apple định nghĩa mà chúng ta phải tuân theo nếu không sẽ gặp một số hành vi không mong đợi, bao gồm crash và mất dữ liệu.
- *Quy tắc 1*: Managed object context gắn liền với thread mà chúng được liên kết khi khai báo. Quy tắc đầu tiên nói rằng không sử dụng main queue context trong một background thread. Hầu hết thời gian, hoàn toàn không có lỗi nếu chúng ta vi phạm quy tắc. Tuy nhiên, khi đưa vào production, bạn sẽ sớm gặp crash trên dashboard giám sát của mình, dẫn đến trải nghiệm người dùng tồi và quan trọng hơn là mất dữ liệu.
- *Quy tắc 2*: Các managed object được truy xuất từ một context gắn liền với cùng queue mà context được liên kết. Điều đó có nghĩa là không truyền bất kỳ object nào được truy xuất từ main context sang private context và ngược lại. Vi phạm quy tắc này sẽ dẫn đến kết quả tương tự như quy tắc 1.

# Crash, crash, crash!
Đây là lần đầu tiên tôi sử dụng CoreData để lưu trữ dữ liệu có giá trị của người dùng trong ứng dụng của chúng tôi. Một mặt, tôi đã không coi trọng core data concurrency vào thời điểm đó. Mặt khác, tôi không biết có một số quy tắc nghiêm ngặt khi làm việc với concurrency trong Core Data. Kết quả là, khi ứng dụng đưa vào production, số lượng crash đã được báo cáo lên dashboard giám sát.
![](/Post-Resources/CoreDataConcurrency/CoreDataCrash_01.png "Core data crash")

![](/Post-Resources/CoreDataConcurrency/CoreDataCrash_02.png "Core data crash")

Lúc đó, tôi không biết chúng đến từ đâu. Tôi không thể tái tạo các vấn đề này để tìm ra nguyên nhân gốc rễ. Ngoài ra, crash được Firebase báo cáo không có đủ thông tin để điều tra. Tôi đã cố gắng xem xét luồng của ứng dụng, tìm kiếm trên StackOverFlow và sau đó đọc kỹ tài liệu của Apple về Core Data. Cuối cùng, nguyên nhân gốc rễ đến từ việc truy cập Core Data từ nhiều thread.

Vì tôi đang làm việc với Core Bluetooth, điểm mấu chốt là Core Bluetooth dispatch các sự kiện Bluetooth trên main thread theo mặc định. Tuy nhiên, tôi đã cấu hình Bluetooth queue thành một background queue để tránh khóa UI queue. Và crash đến vì Core Data không cho phép truy cập `NSManagedObject` giữa các queue khác nhau một cách nghiêm ngặt.

Để mô phỏng vấn đề này, tôi đã tạo một vòng lặp liên tục để chạy các hành động insert và delete trong một background queue liên tục. Code sau đây minh họa cách tôi thực hiện kiểm tra.

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    // Do any additional setup after loading the view.

    self.doSomething()
}

func doSomething() {
    self.managedContext?.insert(person: self.person)
    self.managedContext?.delete(person: self.person)
    DispatchQueue.global(qos: .background).asyncAfter(deadline: .now() + 0.1, execute: {
        self.doSomething()
    })
}
```

Sớm hay muộn, crash sẽ đến với chúng ta.
```swift
2019-10-13 12:31:55.497690+0700 CoreData-Concurrency[90636:1151728] [error] error: Serious application error.  Exception was caught during Core Data change processing. This is usually a bug within an observer of NSManagedObjectContextObjectsDidChangeNotification.  -[__NSCFSet addObject:]: attempt to insert nil with userInfo (null)
CoreData: error: Serious application error.  Exception was caught during Core Data change processing.  This is usually a bug within an observer of NSManagedObjectContextObjectsDidChangeNotification.  -[__NSCFSet addObject:]: attempt to insert nil with userInfo (null)
2019-10-13 12:31:55.569306+0700 CoreData-Concurrency[90636:1151728] *** Terminating app due to uncaught exception 'NSInvalidArgumentException', reason: '-[__NSCFSet addObject:]: attempt to insert nil'
```

![](/Post-Resources/CoreDataConcurrency/Simulate_Crash.png "Core data crash")

Dưới đây là một số câu trả lời từ cộng đồng bạn có thể tìm thấy trên Stackoverflow:
https://stackoverflow.com/questions/36402366/core-data-crash-attempt-to-insert-nil-with-userinfo-null
https://stackoverflow.com/questions/55517083/ios-core-data-serious-application-error-attempt-to-insert-nil-in-less-than

# Tránh crash

Để tránh crash, có hai kỹ thuật chúng ta có thể áp dụng, cả hai đều đảm bảo rằng chúng ta không vi phạm các quy tắc concurrent-confinement.
## #1
Kỹ thuật đầu tiên là đảm bảo rằng `managedObjectContext` được thực hiện trên queue mà nó được liên kết khi khởi tạo, trong trường hợp này là main queue.
```swift
func doSomething() {
    self.managedContext?.insert(person: self.person)
    self.managedContext?.delete(person: self.person)
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1, execute: { // Dispatch to main queue
        self.doSomething()
    })
}
```
Trong trường hợp vì lý do nào đó, chúng ta không thể thực thi các hành động trên main queue (ví dụ: import dữ liệu lớn vào disk) chúng ta có thể tạo nhiều context để giải quyết vấn đề này. Chuyển sang #2.

## #2
Sử dụng kỹ thuật `Core data multiple context`.
Một child managed object context (MOC) không giữ tham chiếu đến persistent store coordinator (PSC). Thay vào đó, nó giữ tham chiếu đến một (MOC) khác làm parent của nó. Bất cứ khi nào một child thực hiện `saveContext`, các thay đổi sẽ được đẩy lên parent của nó, và tiếp tục đẩy lên các parent khác (nếu có). Chỉ khi root parent MOC thực hiện `saveContext`, các thay đổi mới được lưu vào PSC.

![](/Post-Resources/CoreDataConcurrency/CoreData-MultipleContext.png "Core data multiple context")

Hãy tạo một private MOC bên trong class `PersonManagedObject` của chúng ta.
```swift
private let privateMOC = NSManagedObjectContext(concurrencyType: .privateQueueConcurrencyType)
```

Sau đó đặt parent của nó là main MOC.
```swift
init?() {
    ...

    privateMOC.parent = self.managedObjectContext
}
```

Từ bây giờ, tất cả hành động sẽ được thực hiện trên `privateMOC` này. Phương thức `performAndWait` chặn caller không return cho đến khi block được thực thi.
`
Phương thức perform(_:) return ngay lập tức và context thực thi các phương thức block trên thread của riêng nó. Với phương thức performAndWait(_:), context vẫn thực thi các phương thức block trên thread của riêng nó, nhưng phương thức không return cho đến khi block được thực thi.
`

```swift
func insert(person: Person) {
    ...
    // Some code are obmitted
    self.privateMOC.performAndWait {
        self.privateMOC.insert(object)
        synchronize()
    }
}
```

Đừng quên gọi phương thức `saveContext` của parent context để lưu các thay đổi vào PSC.
```swift
private func synchronize() {
    do {
        try self.privateMOC.save() // We call save on the private context, which moves all of the changes into the main queue context without blocking the main queue.
        self.managedObjectContext.performAndWait {
            do {
                try self.managedObjectContext.save()
            } catch {
                print("Could not synchonize data. \(error), \(error.localizedDescription)")
            }
        }
    } catch {
        print("Could not synchonize data. \(error), \(error.localizedDescription)")
    }
}
```

Sau khi sửa đổi code bằng cách sử dụng #1 hoặc #2, tôi đã chạy chương trình một thời gian dài nhưng không còn crash nữa!

# Kết luận
Core data là một framework rất hữu ích và chắc chắn là không thể thiếu trong hầu hết các ứng dụng di động ngày nay. Để tránh các tình huống tồi tệ tương tự như tôi vừa trải qua, hãy đảm bảo bạn tìm hiểu sâu về các thành phần của nó trước khi bắt đầu code, đặc biệt là core data concurrency.
Bạn có thể tìm thấy dự án hoàn chỉnh của tôi tại [Github - Core Data Concurrency](https://github.com/uynguyen/Core_Data_Concurrency)
Cảm ơn bạn đã đọc.
# Tài liệu tham khảo
[1] B.M. Harwani - Core Data iOS Essentials-Packt Publishing (2011)
[2] [Core Data, Multithreading, and the Main Thread](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreData/Concurrency.html)
[3] [Multiple context CoreData] https://www.cocoanetics.com/2012/07/multi-context-coredata/
