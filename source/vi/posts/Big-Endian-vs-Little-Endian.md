---
title: Big Endian vs Little Endian
date: 2018-04-30 10:51:30
tags: [Swift, Objective-C, iOS]
layout: post
lang: vi
thumbnail: /Post-Resources/Endian/cover.png
---
Trong khoa học máy tính, bit là đơn vị thông tin nhỏ nhất. Nó đại diện cho một chữ số của hệ thống số nhị phân. Một chuỗi 8 bit được gọi là một byte. Có hai cách để lưu trữ một chuỗi dữ liệu trong máy tính: Big Endian và Little Endian. Nếu công việc của bạn liên quan đến dữ liệu theo byte, bạn nên biết cách xử lý byte theo hai định dạng này. Trong bài viết này, tôi sẽ giải thích cách dữ liệu được lưu trữ trong máy tính, sự khác biệt chính giữa hai định dạng này, sau đó cung cấp một số code hữu ích để làm việc với byte trong Swift và Objective-C.
<!-- more -->
## Các khái niệm cơ bản
Để hiểu Big Endian và Little Endian, bạn cần biết *Least Significant Byte (LSB)* và *Most Significant Byte (MSB)* là gì. LSB là bit ngoài cùng bên phải trong một chuỗi, nó được gọi như vậy vì nó có ảnh hưởng ít nhất đến giá trị của số nhị phân. Ngược lại, byte ngoài cùng bên trái là MSB mang giá trị số lớn nhất.
Sau khi hiểu hai khái niệm này, việc phân biệt giữa Big Endian và Little Endian trở nên dễ dàng:
- Trong Big Endian, MSB của dữ liệu được đặt tại byte có địa chỉ thấp nhất.
- Trong Little Endian, LSB của dữ liệu được đặt tại byte có địa chỉ thấp nhất.

Đó là tất cả!
![](/Post-Resources/Endian/Endian-Overview.png "Endian overview")
<center></center>

## Ưu điểm của Big Endian và Little Endian trong kiến trúc máy tính
Theo [Wiki](https://en.wikipedia.org/wiki/Endianness), Big endian là "định dạng phổ biến nhất trong mạng dữ liệu", nhiều giao thức mạng như TCP, UPD, IPv4 và IPv6 đang sử dụng thứ tự Big endian để truyền dữ liệu. Little endian chủ yếu được sử dụng trên vi xử lý. Nhưng điểm quan trọng là tại sao họ làm như vậy?
Khi làm việc với byte order trên iOS, tôi cũng đặt câu hỏi cho bản thân và đồng nghiệp, "tại sao họ làm như vậy?", "Tại sao họ chọn Big Endian thay vì Little Endian?". Sau khi nghiên cứu trên internet và nhận được câu trả lời từ một kỹ sư firmware cao cấp trong văn phòng, tôi dần hiểu được ưu điểm của cả hai cách sắp xếp này.
Các ưu điểm của Little Endian là:
- Dễ dàng đọc giá trị với nhiều kích thước kiểu khác nhau. Ví dụ, biến `A = 0x13` ở giá trị 64-bit trong bộ nhớ tại địa chỉ B sẽ là `1300 0000 0000 0000`. A sẽ luôn được đọc là `19` bất kể sử dụng đọc 8, 16, 32, 64-bit. Ngược lại, trong Big Endian chúng ta phải biết kích thước mà giá trị đã được ghi để đọc nó chính xác.
- Dễ dàng ép kiểu giá trị sang một kiểu nhỏ hơn như từ int16_t sang int8_t vì int8_t là byte ở đầu của int16_t.
- Dễ dàng thực hiện các phép tính toán học "vì mối quan hệ 1:1 giữa offset địa chỉ và số byte (offset 0 là byte 0), các routine toán học đa độ chính xác tương ứng dễ viết."

Một số ưu điểm chính của Big Endian là
- Chúng ta luôn có thể kiểm tra số dương hay âm bằng cách nhìn vào byte tại offset zero, vì vậy dễ dàng thực hiện so sánh.
- Các số cũng được lưu trữ theo thứ tự in ra, vì vậy các routine chuyển đổi nhị phân sang thập phân đặc biệt hiệu quả.


## Byte order trên iOS

Cả Swift và Objective-C đều hỗ trợ các phương thức giúp chúng ta đọc và ghi dữ liệu theo hai cách Little Endian và Big Endian. Các phần sau đây trình bày cách chúng ta sử dụng các phương thức này để tương tác với dữ liệu trên bộ nhớ.

### Byte order trong Objective-C

```obj-c
NSString *strData = @"001E653A";
NSData *data = [NSData dataWithHexString:strData];
uint8_t *bytes = (uint8_t *)data.bytes;

/* Functions for loading little endian to host endianess. */
uint16_t firstInLittle = OSReadLittleInt16(bytes, 0); // 0x1E00 = 7680
uint16_t secondInLittle = OSReadLittleInt16(bytes, 2); // 0x3A65 = 14949

uint16_t firstInBig = OSReadBigInt16(bytes, 0); // 0x001E = 30
uint16_t secondInBig = OSReadBigInt16(bytes, 2); // 0x653A = 25914

/* Functions for storing host endianess to little endian. */
uint8_t byte16[2];
OSWriteLittleInt16(byte16, 0, firstInLittle); // byte16 = [0x00, 0x1E]
```

### Byte order trong Swift

```swift
let strData = "3A651E00"
if let data = strData.hexadecimal() {
    let bytesArr = [UInt8](data)

    /* Functions for loading native endian values. */
    let little = _OSReadInt16(bytesArr, 0) // 0x653A = 25914
    let big = first.bigEndian // 0x3A65 = 14949

    /* Functions for storing native endian values. */
    let bytes = [UInt8](repeating: 0, count: 2)
    _OSWriteInt16(UnsafeMutableRawPointer(mutating:bytes), 0, second) // bytes = [0x65, 0x3A]
}
```

## Kết luận
Trong bài viết này, tôi đã cho bạn thấy sự khác biệt giữa các định dạng endianness và cung cấp một số code hữu ích để làm việc với byte trên iOS. Nếu bạn có bất kỳ đề xuất nào, hãy cho tôi biết.
Chúc cuối tuần vui vẻ.
