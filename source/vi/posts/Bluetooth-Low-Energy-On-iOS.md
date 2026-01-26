---
title: Bluetooth Low Energy Trên iOS
date: 2017-10-13 10:21:46
tags: [iOS, CoreBluetooh, BLE]
layout: post
permalink: vi/posts/Bluetooth-Low-Energy-On-iOS/
lang: vi
---
Core Bluetooth (CB) framework cho phép các ứng dụng iOS và MacOS giao tiếp với các thiết bị BLE. Ứng dụng của bạn có thể khám phá, tìm hiểu và điều khiển các thiết bị BLE, chẳng hạn như máy đo nhịp tim, thiết bị theo dõi hoặc đồng hồ thông minh.
![](/Post-Resources/BLE/Intro.jpg "Intro")
<center>Hình 1. Các thiết bị BLE (Nguồn từ Google)</center>
<!-- more -->
Trên MacOS 10.9 và iOS 6, các thiết bị Mac và iOS cũng có thể đóng vai trò là BLE peripheral để cung cấp dữ liệu cho các thiết bị khác, bao gồm cả các thiết bị Mac và iOS khác.
Trong bài hướng dẫn này, tôi sẽ giới thiệu các khái niệm chính của Core Bluetooth framework và cách sử dụng framework này để khám phá, kết nối và lấy dữ liệu từ các thiết bị tương thích. Hãy thoải mái để lại bình luận về bài viết của tôi.
## Tổng quan

BLE được giới thiệu vào đầu năm 2010 và dựa trên [đặc tả Bluetooth 4.0](https://www.bluetooth.com/specifications). BLE sử dụng cùng tần số vô tuyến 2.4 GHz như Bluetooth cổ điển. Về lý thuyết và trong điều kiện lý tưởng (không có vật cản), phạm vi của BLE có thể đạt trên 100m nhưng thực tế, khoảng cách tối đa là 10m.

![](/Post-Resources/BLE/BLE.png "BLE")
<center>Hình 2. BLE trong thực tế (Nguồn từ Google)</center>


Công nghệ này *tiết kiệm năng lượng* vì nó sử dụng ít năng lượng hơn các công nghệ không dây khác. Nhờ mức tiêu thụ năng lượng thấp, BLE được sử dụng để tích hợp vào các thiết bị điện tử yêu cầu tiêu thụ năng lượng thấp như máy đo nhịp tim, thiết bị theo dõi, đồng hồ, giày để làm cho chúng thông minh hơn.
Vậy, nhược điểm của công nghệ BLE là gì? Đó là tốc độ truyền dữ liệu. Để giảm tiêu thụ năng lượng, chip BLE chỉ truyền dữ liệu trong một khoảng thời gian gọi là *interval* (Trong khi Bluetooth cổ điển có thể truyền dữ liệu bất cứ lúc nào), và lượng dữ liệu được truyền trong một interval cũng bị giới hạn trong vài chục byte. Một số thông tin về throughput tối đa trên iOS và MacOS (Được cung cấp bởi [PunchThrough](https://punchthrough.com/blog/posts/maximizing-ble-throughput-on-ios-and-android))
- iPhone 6, 6+, 6S, 6S+:
```
Normal Connection Interval of 30mSecs: 2,667 bytes/sec
Connection Interval for HID Over GATT is Present 11.25mSecs: 7,111 bytes/sec
```
- MacBook Pro - OS X (Thay đổi theo model):
```
Maximum Connection Interval range of (11.25 - 15mSecs): 7,111 bytes/sec - 5334 bytes/sec
```

Để biết thêm chi tiết kỹ thuật về công nghệ Bluetooth, vui lòng tham khảo [Bluetooth Special Interest Group (SIG)](https://www.bluetooth.com/).

## Các khái niệm cơ bản
### 1. Các thành phần chính
Có hai vai trò chính tham gia vào tất cả giao tiếp BLE: *Central* và *Peripheral*:
- *Peripheral*: là các thiết bị có dữ liệu mà các thiết bị khác cần.
- *Central*: thường sử dụng thông tin được cung cấp bởi peripheral để thực hiện một số tác vụ. Ví dụ, đọc thông tin nhịp tim hoặc nhiệt độ từ các máy đo (một peripheral).
![](/Post-Resources/BLE/Central-And-Peripheral.png "Central-And-Peripheral")
<center>Hình 3. Central và Peripheral (Nguồn từ [Apple doc](https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html))</center>

### 2. Các tham số kết nối
Các tham số kết nối cho một kết nối BLE là một tập hợp các tham số xác định khi nào và cách Central và Peripheral thực hiện truyền dữ liệu với nhau. Central sẽ chủ động thiết lập các tham số kết nối được sử dụng, nhưng Peripheral có thể gửi tham số khác mà Central sau đó có thể chấp nhận hoặc từ chối. Cả hai bên sẽ tiếp tục yêu cầu các tham số kết nối cho đến khi họ tìm thấy một con số hợp lý mà cả hai đều chấp nhận.
Có 3 tham số khác nhau:
- *Connection interval*: Giá trị này xác định tần suất Central và Peripheral truyền dữ liệu cho nhau.
- *Slave latency (Latency, viết tắt)*: Nếu chúng ta đặt giá trị latency khác không, Peripheral có thể bỏ qua các yêu cầu từ Central khi Central yêu cầu dữ liệu lên đến số lần slave latency. Tuy nhiên, nếu Peripheral muốn truyền dữ liệu đến Central, nó có thể gửi dữ liệu bất cứ lúc nào. Điều này cho phép peripheral ngủ lâu hơn để giảm tiêu thụ năng lượng.
- *Connection supervision timeout*: Giá trị này xác định thời gian chờ từ lần trao đổi gói tin cuối cùng cho đến khi việc truyền được coi là bị mất. Central sẽ không bắt đầu cố gắng kết nối lại trước khi hết thời gian chờ.

Ví dụ, nếu bạn đặt {interval, latency, timeout} = {15, 0, 720} làm tham số kết nối cho peripheral:
- Cứ mỗi 15 (ms), peripheral sẽ được đánh thức và lắng nghe các yêu cầu từ central, đồng thời truyền dữ liệu nếu cần.
- Latency bằng 0, có nghĩa là Peripheral phải trả lời Central bất cứ lúc nào Central yêu cầu trong một interval (15 ms).
- Sau 720 (ms) kể từ khi gói tin cuối cùng được gửi, nếu Central vẫn không nhận được gói tin, Central sẽ xác định rằng gói tin đã bị mất và yêu cầu Peripheral gửi lại gói tin cuối cùng.

### 3. Bluetooth Low Energy Protocol Stack

CoreBluetooth ẩn nhiều chi tiết cấp thấp của đặc tả khỏi các nhà phát triển, giúp việc phát triển các ứng dụng tương tác với thiết bị BLE trở nên dễ dàng hơn nhiều.


#### Advertising và General Advertising Profile (GAP)

Các thiết bị BLE cho các thiết bị khác biết rằng chúng tồn tại bằng cách advertising sử dụng GAP. Các gói advertising chứa một số thông tin cơ bản như tên thiết bị, số serial hoặc giá trị RSSI, và cũng là danh sách các service mà nó cung cấp. Kích thước giới hạn của các gói advertising là 128 bit.
*RSSI* là viết tắt của Received Signal Strength Indicator. Giá trị RSSI đại diện cho cường độ của tín hiệu truyền. Chúng ta có thể ước tính khoảng cách hiện tại giữa central và peripheral dựa trên giá trị này. Giá trị càng lớn, thiết bị càng gần.
![](/Post-Resources/BLE/Advertising-And-Discovery.png "Advertising-And-Discovery")
<center>Hình 4. Advertising và discovery trong BLE</center>

#### General Attribute Profile (GATT)

GATT là lớp định nghĩa các service và characteristic được sử dụng để truyền dữ liệu giữa Central và Peripheral, cũng cho phép các thao tác read, write, notify trên chúng.
Trong hầu hết các trường hợp, Peripheral cũng được gọi là GATT server vì nó cung cấp các service và characteristic trong khi Central là GATT client.

#### Services

Các service được xác định bởi các số duy nhất được gọi là UUID. Các service tiêu chuẩn như [Device Information Service](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.device_information.xml&u=org.bluetooth.service.device_information.xml) (0x180A), cung cấp thông tin nhà sản xuất và thông tin cơ bản về thiết bị (Phiên bản Firmware, số serial, số model), có UUID 16-bit và các service tùy chỉnh có UUID 128-bit. (Ví dụ: 0x3dda0000957f7d4a34a674696673696d, v.v.)

#### Characteristics

Một characteristic chứa khai báo characteristic, thuộc tính characteristic (ReadWrite, ReadOnly, Notify, WriteWithoutResponse, v.v.), và một giá trị. Characteristic cho phép chúng ta truy cập giá trị và thông tin mà chúng chứa. Một service có thể có nhiều hơn một characteristic.
Hình ảnh sau đây cho thấy mối quan hệ giữa Profile, Services, Characteristics.
![](/Post-Resources/BLE/Profile-Service-Char.png "Profile-Service-Char")
<center>Hình 5. Mối quan hệ giữa Profile, Services, Characteristics</center>

### 4. Các khái niệm Bluetooth và CoreBluetooth trên iOS

Trong CoreBluetooth framework
- Một Central được đại diện bởi class *CBCentralManager* và được sử dụng để khám phá, thiết lập kết nối và điều khiển peripheral.
- Một peripheral được đại diện bởi class *CBPeripheral*, các service liên quan đến một peripheral cụ thể được đại diện bởi class *CBService* và các characteristic của service của peripheral được đại diện bởi class *CBPeripheral*.

Hình ảnh sau đây cho thấy cấu trúc của Services và Characteristics của nó trên iOS:

![](/Post-Resources/BLE/CBPeripheral-CBService-CBCharacteristic.png "CBPeripheral-CBService-CBCharacteristic")
<center>Hình 6. Mối quan hệ giữa các đối tượng CBPeripheral, CBService và CBCharacteristic trên iOS</center>

## Tổng kết

BLE là một công nghệ cách mạng của Bluetooth cổ điển. Trong thực tế, BLE được sử dụng để tích hợp vào các thiết bị nhỏ như khóa, thiết bị theo dõi, đồng hồ, giày và một số loại trang sức (nhẫn) để làm cho chúng thông minh hơn, hướng tới môi trường IoT.
Trong [phần tiếp theo](/2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/), tôi sẽ hướng dẫn bạn cách sử dụng CoreBluetooth để tạo các service của riêng bạn trên thiết bị iOS, cũng như sử dụng CoreBluetooth trên một thiết bị khác để khám phá, kết nối và điều khiển các BLE service của bạn. Nếu bạn thích bài viết này và muốn xem thêm trong tương lai, hãy cho tôi biết.

## Tài liệu tham khảo

[1] [Bluetooth Special Interest Group](https://www.bluetooth.com/)
[2] [Apple document: Core Bluetooth Concepts](https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html)
[3] [Maximizing BLE Throughput on iOS and Android](https://punchthrough.com/blog/posts/maximizing-ble-throughput-on-ios-and-android)
