---
title: Protobuf trong thực tế
date: 2024-01-12 16:07:40
tags:
layout: post
lang: vi
thumbnail: /Post-Resources/protobuf/banner.png
---
Tôi đã làm việc với các sản phẩm Bluetooth, bao gồm thiết bị đeo và khóa thông minh, trong nhiều năm. Việc tạo điều kiện cho việc truyền message giữa các thành phần hệ thống là một khía cạnh quan trọng do sự khác biệt về ngôn ngữ lập trình, yêu cầu về tính nhất quán và giới hạn về kích thước truyền dữ liệu. Để giải quyết những thách thức này, chúng tôi sử dụng [Protocol Buffers](https://github.com/protocolbuffers/protobuf).
Protocol Buffers, còn được gọi là Protobuf, là một định dạng dữ liệu đa nền tảng mã nguồn mở và miễn phí được sử dụng để serialize dữ liệu có cấu trúc, được phát triển bởi Google. Nó được thiết kế để hiệu quả, có thể mở rộng và thân thiện với người dùng. Trong bài hướng dẫn này, chúng ta sẽ tìm hiểu những kiến thức cơ bản về việc tạo một Protocol Buffers message đơn giản, định nghĩa schema và generate code trong các ngôn ngữ lập trình khác nhau.

<!-- more -->

## Cài đặt
Để cài đặt protobuf compiler, hãy làm theo hướng dẫn được nêu trong [protobuf-compiler-installation](https://github.com/protocolbuffers/protobuf#protobuf-compiler-installation).
Cách sử dụng cơ bản có thể được tóm tắt bằng hình ảnh dưới đây.

![](/Post-Resources/protobuf/flow.png "flow")

Các bước để thiết lập:
- Cài đặt protobuf compiler. Trên Mac, sử dụng brew: `brew install protobuf`
- Xác nhận việc cài đặt đã hoàn tất thành công: `protoc --version`.
- Cài đặt Code Generator Plugin: Protobuf hỗ trợ nhiều ngôn ngữ lập trình khác nhau. Bạn cần tìm và cài đặt code generator cho ngôn ngữ cụ thể tùy thuộc vào ngôn ngữ lập trình nào được sử dụng trong dự án của bạn. Ví dụ, cho Swift, sử dụng `swift-protobuf`: `brew install swift-protobuf`. Cho JavaScript, sử dụng `npm install -g protoc-gen-js`.
- Định nghĩa các scheme của bạn: Truy cập [Programming Guides](https://protobuf.dev/programming-guides/proto3/) để tìm hiểu cách sử dụng ngôn ngữ protocol buffer để cấu trúc dữ liệu protocol buffer của bạn
```bash example.proto
message Person {
  optional string name = 1;
  optional int32 id = 2;
  optional string email = 3;
}
```
- Compile các file `.proto` để generate code cho các ngôn ngữ cụ thể.
```bash
nguyenuy@192  ~/Desktop/protobuf  protoc --js_out=. example.proto
nguyenuy@192  ~/Desktop/protobuf  protoc --java_out=. example.proto
nguyenuy@192  ~/Desktop/protobuf  protoc --cpp_out=. example.proto
nguyenuy@192  ~/Desktop/protobuf  protoc --dart_out=. example.proto
```

- Phân phối (import) các file đã generate vào các dự án của bạn.
- Cài đặt runtime plugin. Ví dụ, trong dự án iOS, include framework `SwiftProtobuf` trong `Podfile`. Cho các dự án Flutter, thêm `protobuf` vào file `pubspec.yaml`. Cho các dự án ReactJS, include `google-protobuf` trong file `package.json`.
- Triển khai serialization và deserialization:
Ví dụ trong Python
```py
person = example_pb2.Person()

# Set values
person.name = "Uy Nguyen"
person.id = 1
person.email = "uynguyen.itus@gmail.com"

# Serialize the message to bytes
serialized_data = person.SerializeToString()

# Parse the bytes back into a message
new_person = example_pb2.Person()
new_person.ParseFromString(serialized_data)
```
Ví dụ trong Java
```java
Person person = Person.newBuilder()
    .setName("Uy Nguyen")
    .setId(1)
    .setEmail("uynguyen@gmail.com")
    .build();

// Serialize the message to bytes
byte[] serializedData = person.toByteArray();

// Parse the bytes back into a message
Person newPerson = Person.parseFrom(serializedData);
```
Ví dụ trong Swift
```swift
var p = Person()
p.id = 1
p.email = "uynguyen.itus@gmail.com"
p.name = "Uy Nguyen"

// Serialize the message to bytes
let data = try? p.serializedData()

// Parse the bytes back into a message
let converted = try? Person(serializedData: data!)
```

Dưới đây là cách các file được generate trông như thế nào trong các ngôn ngữ khác nhau.
![](/Post-Resources/protobuf/generated.png "generated")

## Ưu điểm
- **Định dạng nhị phân**: `Protobuf` sử dụng định dạng nhị phân để serialization, nhỏ gọn hơn so với định dạng dựa trên văn bản của `JSON`. Điều này dẫn đến kích thước message nhỏ hơn, làm cho nó hiệu quả hơn về cả băng thông và lưu trữ.
- **Hiệu suất**: Do định dạng nhị phân và encoding hiệu quả, quá trình serialization và deserialization của `Protobuf` thường nhanh hơn `JSON`. Điều này có thể đặc biệt quan trọng trong các tình huống yêu cầu throughput cao hoặc độ trễ thấp, chẳng hạn như các hệ thống sử dụng BLE.
- **Code Generation**: `Protobuf` dựa vào code generation để tạo các data class trong các ngôn ngữ lập trình khác nhau dựa trên schema đã định nghĩa. Điều này có thể dẫn đến code type-safe và hiệu quả, giảm khả năng xảy ra lỗi runtime liên quan đến sự không khớp cấu trúc dữ liệu.
- **Hỗ trợ nhiều ngôn ngữ**: Protobuf hỗ trợ code generation trong nhiều ngôn ngữ lập trình, phù hợp cho các dự án với các công nghệ khác nhau. Điều này cho phép các service khác nhau được viết bằng các ngôn ngữ khác nhau dễ dàng giao tiếp bằng cách sử dụng cùng các cấu trúc dữ liệu.

## Nhược điểm
- **Khả năng đọc**: Định dạng nhị phân của `Protobuf` không thể đọc được bởi con người, điều này có thể làm cho việc debug và khắc phục sự cố khó khăn hơn so với `JSON`. Định dạng văn bản thuần túy của `JSON` cho phép các nhà phát triển dễ dàng kiểm tra dữ liệu.
- **Độ phức tạp khi debug**: Do tính chất nhị phân của `protobuf`, việc debug có thể phức tạp hơn khi so sánh với `JSON`. Thường cần các công cụ chuyên dụng để kiểm tra nội dung của các message được encode bằng `protobuf`.
- **Ít phổ biến trong công nghệ Web**: `JSON` phổ biến hơn trong phát triển web và được hỗ trợ natively bởi nhiều web API. Nếu khả năng tương tác với các công nghệ web là ưu tiên hàng đầu, `JSON` có thể là một lựa chọn tự nhiên hơn.
- **Phức tạp với cấu trúc lồng nhau**: Việc xử lý các cấu trúc lồng nhau trong `protobuf` message đôi khi có thể ít trực quan hơn so với trong `JSON`. Cần chú ý khi thiết kế các cấu trúc lồng nhau để tránh sự phức tạp không cần thiết.

## Tổng kết
Tóm lại, trong khi `protobuf` mang lại những lợi thế đáng kể về hiệu quả và hiệu suất, việc áp dụng nó nên được xem xét dựa trên các yêu cầu và ràng buộc cụ thể của dự án. Điều cần thiết là xem xét các ưu và nhược điểm và chọn định dạng serialization phù hợp nhất với mục tiêu và ràng buộc của dự án.

## Tài liệu tham khảo
- [Protocol Buffers Documentation](https://protobuf.dev/overview/)
