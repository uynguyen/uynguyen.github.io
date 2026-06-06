---
title: 'iOS: Mix and Match'
date: 2020-01-30 17:33:16
tags:
layout: post
lang: vi
thumbnail: /Post-Resources/MixMatch/mix-match-banner.png
---
Khi Swift đã trở thành ngôn ngữ chủ lực cho phát triển iOS, hầu hết các project iOS mới ngày nay đều được xây dựng bằng Swift. Tuy nhiên, có nhiều thư viện hữu ích được phát triển bằng các ngôn ngữ lập trình cấp thấp khác như Objective-C và / hoặc C++ để tăng hiệu suất. Mặt khác, không phải tất cả các vị trí kỹ sư đều mở cho các project mới, hầu hết họ được tuyển để bảo trì và phát triển các tính năng mới dựa trên codebase hiện tại được xây dựng bằng Objective-C.
Có kiến thức để kết hợp hai ngôn ngữ trong một project duy nhất là tốt cho kỹ năng phát triển iOS của bạn vì bạn sẽ gặp nó một ngày nào đó trong sự nghiệp của mình. Trong bài viết này, tôi sẽ chỉ cho bạn không chỉ cách sử dụng Objective-C và Swift trong một project duy nhất mà còn cách sử dụng một tập hợp các ngôn ngữ lập trình trong một project, bao gồm C++/ Objective-C/ Swift và React Native. Hy vọng bạn sẽ thấy bài viết này thú vị.
Hãy bắt đầu.
<!-- more -->
## C++ <- Objective-C++
Đối với những ai chưa nghe về Objective-C++,
Objective-C++ thực sự là source code kết hợp các class Objective-C và class C++ trong một file duy nhất.
Bạn chỉ cần đổi file `.m` thành `.mm` để phép màu hoạt động.
Đầu tiên, tôi sẽ tạo một thư viện C++ sẽ được sử dụng bởi các class Objective-C++.
```swift
class CPlusPlusMath {
    public:
        int multiplyTwoNumbers(int a, int b);
};
```
Triển khai
```swift
int CPlusPlusMath::multiplyTwoNumbers(int a, int b) {
    return a * b;
}
```
Sau đó, bạn cần tạo một file bridging header cho project của bạn vì project mới của chúng ta đang sử dụng ngôn ngữ Swift.

![](/Post-Resources/MixMatch/bridging-header.png "")

Bridging header là nơi bạn định nghĩa tất cả các class Objective-C được expose cho Swift. Khi chúng ta thêm một class Objective-C mới vào project dựa trên Swift, XCode tự động đề nghị thêm file này vào project.
Tiếp theo, bạn đổi tên file `.m` thành `.mm` để chuyển nó từ code Objective-C sang Objective-C++.
Từ bây giờ, bạn có thể gọi đến thư viện C++ của chúng ta (hoặc các thư viện khác) bên trong file Objective-C++ này
```swift
#import "CPlusPlusMath.hpp"

@implementation ObjMath

- (long)multiplyTwoNumbers:(int) num1 num2:(int) num2 {
    CPlusPlusMath *a = new CPlusPlusMath();
    return a->multiplyTwoNumbers(num1, num2);
}

```

## Objective-C++ <-> Swift
Điều thú vị là chúng ta có thể gọi code Objective-C(++) từ code Swift và ngược lại.
Để sử dụng các class Objective-C từ Swift, chúng ta cần khai báo header của chúng trong file bridging header. Hãy tiến hành và include thư viện toán học của chúng ta vào file này.
```swift
//
//  Sử dụng file này để import các header public của target mà bạn muốn expose cho Swift.
//

#include "ObjMath.h"

```
Đó là tất cả những gì bạn cần làm để xây dựng đường dẫn đầu tiên từ Objective-C sang Swift.

```swift
func multiply(num1: Int, num2: Int) -> Int {
    let objMath = ObjMath()
    return objMath.multiplyTwoNumbers(Int32(num1), num2: Int32(num2))
}
```

Tiếp theo, chúng ta cần xây dựng đường dẫn khác từ Swift sang Objective-C.
Chúng ta sử dụng từ khóa `objc` trước bất kỳ class và method nào chúng ta muốn expose cho các class Objective-C. Một lưu ý nhỏ là các class được expose này cần được kế thừa từ class `NSObject`. Nếu không, chúng ta sẽ gặp lỗi compile `Only classes that inherit from NSObject can be declared @objc`.

```swift
@objc
class SwifthMath: NSObject {
    @objc
    func add(num1: Int, num2: Int) -> Int {
        return num1 + num2
    }

    // Phần còn lại được bỏ qua
}
```

## Swift <-> React Native
Vui lòng xem series của tôi tại [React Native và BLE](/2021/12/25/Series-React-Native-and-BLE-Part-1-Building-BLE-framework-for-iOS/)
## Hạn chế

- Các object Swift có thể có subclass của một class objective-c, như NSObject. Nhưng một class swift không thể là base class cho một class objective-c.

## Khắc phục sự cố

## Kết luận
Nhiều developer vẫn đang sử dụng Objective-C vì nhiều lý do, và họ chắc chắn sử dụng các thư viện C++ trong các project của họ, đặc biệt trong phát triển Game nơi C++ phát huy tối đa hiệu suất của nó.
Tôi hy vọng rằng bài viết này sẽ cho bạn một cái nhìn nhanh về cách Mix and Match nhiều ngôn ngữ trong một project duy nhất.
Bạn có thể tìm project demo tại [Github](https://github.com/uynguyen/iOS-Mix-Match)
Cảm ơn bạn đã đọc.
