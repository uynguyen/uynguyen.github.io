---
title: Crash Sớm trong Swift
date: 2019-01-19 11:59:38
tags: [iOS, Swift]
layout: post
lang: vi
thumbnail: /Post-Resources/Crashing/crashing.png
---
Tối qua, tôi đọc một chương của một cuốn sách là một trong những cuốn sách yêu thích của tôi: `"The pragmatic programmer"` (Của Andrew Hunt và David Thomas). Chương này thảo luận về cách sử dụng assertion để làm code dễ debug hơn. Chúng ta đều biết rằng assertion là một công cụ thiết yếu để viết test, nhưng nó làm được nhiều hơn thế. Hãy cùng tôi gặp gỡ anh chàng này: *Assertion*.
<!-- more -->
## Crash, đừng phá hỏng
Bạn có bao giờ tự nói với mình hoặc với đồng nghiệp trong một cuộc thảo luận kỹ thuật những điều sau không?
- "Trường hợp này sẽ không bao giờ xảy ra nên chúng ta không cần xử lý cái này."
- "Class này phải là "Dog", nó không bao giờ có thể là "Cat", hãy force unwrap đối tượng này."
- "Lỗi này sẽ không bao giờ xảy ra, cứ bỏ qua nó."
- "Đồ ngốc! tại sao chúng ta xử lý trường hợp này khi code của bạn không bao giờ đến được dòng này?"

Nhưng nếu "trường hợp này" xảy ra bằng cách nào đó thì sao? Ứng dụng có còn phản hồi theo cách chúng ta mong đợi không? Có khả năng nào tình huống không mong đợi sẽ làm hỏng database quan trọng của chúng ta không?
Ngay từ đầu chương này, tác giả giới thiệu một số tình huống mà tôi có thể thấy mình trong những ví dụ đó: "Code này sẽ không được sử dụng 30 năm nữa, nên ngày hai chữ số là ổn." "Ứng dụng này sẽ không bao giờ được sử dụng ở nước ngoài, vậy tại sao phải quốc tế hóa nó?" "count không thể âm." "printf này không thể thất bại."

```
NẾU NÓ KHÔNG THỂ XẢY RA, SỬ DỤNG ASSERTION ĐỂ ĐẢM BẢO RẰNG NÓ SẼ KHÔNG
```
Nếu chúng ta tin rằng điều gì đó không thể xảy ra, hoặc điều gì đó đúng, hãy sử dụng assertion để đảm bảo niềm tin của bạn là đúng! Nếu điều kiện của assertion không được đáp ứng, nó sẽ ngay lập tức crash ứng dụng. Nó rất hữu ích trong quá trình *phát triển* vì nó dẫn chúng ta trực tiếp đến vấn đề.

## Trước khi tiếp tục, hãy nói về các mức tối ưu hóa của Swift
Tùy thuộc vào việc build ở chế độ Release hay Debug, trình biên dịch Swift sẽ bật hoặc tắt các assertion (Các dòng có câu lệnh assert được bỏ qua), tốt để biết các mức tối ưu hóa của Swift trước khi chúng ta tiếp tục.
Có 3 loại mức tối ưu hóa cho một build trong Xcode
- *None (Onone)*: Mặc định cho debug build. Biên dịch mà không có tối ưu hóa nào.
- *Fast (O)*: Mặc định cho release build. Biên dịch với các tối ưu hóa.
- *Unchecked (Ounchecked)*: Biên dịch với các tối ưu hóa và loại bỏ các kiểm tra an toàn runtime, bao gồm kiểm tra mảng vượt giới hạn, unwrap nil, precondition và preconditionFailure. Đó là lý do tại sao chúng ta không nên sử dụng chế độ `Ounchecked` trong release build vì nó có thể dẫn đến hỏng bộ nhớ và ứng dụng có thể hoạt động không đúng.

*Cập nhật*: Như bạn thấy không còn chế độ `-Ounchecked` trong Xcode10, thay vào đó một tùy chọn mới được giới thiệu `Optimize for Size`. Sự khác biệt chính giữa chế độ `O` và chế độ `Osize` là "Khi biên dịch với -O, trình biên dịch cố gắng chuyển đổi code để nó thực thi với hiệu suất tối đa. Tuy nhiên, sự cải thiện hiệu suất runtime này đôi khi có thể đi kèm với sự đánh đổi về kích thước code tăng lên. Với chế độ tối ưu hóa -Osize mới, người dùng có thể chọn biên dịch cho kích thước code tối thiểu thay vì tốc độ tối đa" [(swift.org)](https://swift.org/blog/osize/)
![](/Post-Resources/Crashing/Xcode10-OptimizationLevels.png "Xcode10-OptimizationLevels")

## Áp dụng Assertion vào Swift
Thành thật mà nói, trước khi đọc chương này của cuốn sách, tôi nghĩ "Assertion" chỉ được sử dụng khi viết unit test. Thực tế là các developer sử dụng Assertion trong phát triển để làm quá trình phát triển an toàn hơn và dễ dàng hơn để truy vết bug.
Swift cung cấp 5 loại hàm assertion khác nhau về cách chúng ảnh hưởng đến luồng code:
- *assert() & assertionFailure()*: Sử dụng chúng khi chúng ta muốn xác minh code, nhưng nếu nó thực sự là một vấn đề, nó không nhất thiết phải thoát ứng dụng. Trình biên dịch sẽ bỏ qua các câu lệnh assert() và assertionFailure() cho phiên bản release (Trong chế độ -O). Ví dụ, tôi sử dụng assert để đảm bảo không có request không mong đợi trong luồng nghiệp vụ của tôi. Bằng cách đó, tôi đảm bảo rằng nếu có "kẻ lạ" xuất hiện trong luồng của tôi, luồng sẽ bị phá vỡ và ứng dụng sẽ bị kết thúc. Ngoài ra, debugger sẽ dẫn tôi trực tiếp đến vấn đề để tôi có thể xác định vấn đề logic và loại bỏ bug càng sớm càng tốt.
![](/Post-Resources/Crashing/Assert.png "Assert trong thực tế")
- *precondition() & preconditionFailure()*: Sử dụng các hàm này để phát hiện điều kiện phải được đáp ứng trước khi tiếp tục xử lý, ngay cả trong phiên bản release (chế độ -O). Ví dụ, giả sử chúng ta cần tải file config khi ứng dụng khởi chạy. Nếu không có file config, thì chúng ta nên dừng ứng dụng ngay lập tức thay vì tiếp tục thực thi.
```swift
guard let fileConfig = Bundle.main.path(forResource: "config", ofType: "json") else {
    preconditionFailure("Unable to load config file.")
}
```
- *fatalError()*: Giống như các hàm precondition() và preconditionFailure(), ngoại trừ fatalError() hoạt động cho tất cả các mức tối ưu hóa trong tất cả các cấu hình, có nghĩa là ứng dụng của bạn LUÔN bị kết thúc nếu đạt đến dòng fatalError. Trong ví dụ sau, tôi sử dụng fatalError() để buộc mọi class kế thừa phải override `parseData(files:)` từ class cha của nó.
![](/Post-Resources/Crashing/FatalError.png "FatalError trong thực tế")

## Lời khuyên nổi bật từ tác giả
- `"Tất cả các lỗi đều cung cấp thông tin cho bạn. Bạn có thể tự thuyết phục mình rằng lỗi không thể xảy ra, và chọn bỏ qua nó. Thay vào đó, Pragmatic Programmer tự nói với mình rằng nếu có lỗi, điều gì đó rất, rất tệ đã xảy ra."` Nếu lỗi xảy ra, chúng ta có thể khôi phục nó không? Nếu chúng ta không thể xử lý một số vấn đề không mong đợi, thì hãy crash sớm để bảo vệ dữ liệu quan trọng của chúng ta (Đặc biệt trong các ứng dụng ngân hàng yêu cầu bảo mật cao cho database).
- `"Đừng đặt assertion trong code xử lý lỗi thực sự."` Đây là một sự hiểu lầm nếu chúng ta đặt assertion ở khắp nơi trong code, đặc biệt trong code xử lý lỗi thực sự. Assertion không được sử dụng theo cách này. Nếu chúng ta chỉ đơn giản kết thúc một chương trình đang chạy, nó sẽ ảnh hưởng đến trải nghiệm người dùng, dẫn đến người dùng sẽ không còn mở ứng dụng của bạn nữa. Nguyên tắc đơn giản nhất để kiểm tra xem chúng ta có nên thoát chương trình khi có lỗi xảy ra là `Khi code của bạn phát hiện ra điều gì đó được cho là không thể xảy ra vừa xảy ra, chương trình của bạn không còn khả thi. Bất cứ điều gì nó làm từ thời điểm này trở đi đều trở nên đáng ngờ, vì vậy hãy kết thúc nó càng sớm càng tốt. Một chương trình chết thường gây ít thiệt hại hơn một chương trình tàn tật.`
- `"Điều kiện được truyền vào assertion không nên có tác dụng phụ"`. Sẽ thật xấu hổ nếu chúng ta đặt code để kiểm tra lỗi mà thực sự gây ra lỗi khác. Ví dụ, đoạn code sau (Trong Java) được thêm assert để đảm bảo phần tử tiếp theo không phải nil, nhưng nó thực sự tạo ra lỗi mới. Bạn có thể tìm ra nó không?
```java
while (iter.hasmoreElements () {
    Test.ASSERT(iter.nextElements() != null);
    object obj = iter.nextElement();
    // ....
}
```

## Kết luận
Trong bài viết này, chúng ta đã đi qua năm phương thức để thoát sớm trong Swift. Nói chung, cách đúng để chọn cái nào sử dụng phụ thuộc vào ngữ cảnh của lỗi: Liệu lỗi có thể khôi phục được hay không? Nếu câu trả lời là không, thì crash là cách tốt nhất chúng ta có thể làm để bảo vệ ứng dụng khỏi các hành vi không thể đoán trước. Đôi khi, ứng dụng ở trong tình huống sẽ quá nguy hiểm để tiếp tục.
Hy vọng bạn thấy bài viết này hữu ích và có thể áp dụng ý tưởng này vào dự án tiếp theo của bạn.
Cảm ơn bạn đã đọc!
