---
title: Web Bluetooth
date: 2022-10-30 14:55:24
tags: [Web Bluetooth, Bluetooth]
layout: post
lang: vi
thumbnail: /Post-Resources/WebBluetooth/banner.png
---

Bạn đã bao giờ muốn tạo một ứng dụng web cho phép người dùng giao tiếp với thiết bị của bạn bằng Bluetooth chưa? Cho đến khi [Web Bluetooth](https://webbluetoothcg.github.io/web-bluetooth/) được giới thiệu, điều này chỉ có thể thực hiện được thông qua các ứng dụng di động native. Tuy nhiên, với sự ra đời của Web Bluetooth, bạn giờ đây có thể biến ý tưởng của mình thành hiện thực.
Web Bluetooth là một công nghệ mang tính đột phá cho phép các nhà phát triển web kết nối ứng dụng của họ trực tiếp với các thiết bị Bluetooth, mở ra một loạt các khả năng cho IoT, thiết bị đeo, và các thiết bị hỗ trợ Bluetooth khác. Bằng cách tận dụng sức mạnh của Web Bluetooth, bạn có thể tạo các ứng dụng web có thể giao tiếp với thiết bị mà không cần một ứng dụng native riêng biệt.
Vì vậy, nếu bạn đã mơ ước tạo một ứng dụng web có thể tương tác với các thiết bị Bluetooth, bây giờ là lúc để khám phá các khả năng của Web Bluetooth và nâng cao kỹ năng phát triển của bạn lên tầm cao mới.
<!-- more -->

### Web Bluetooth là gì?
Web Bluetooth là một tập hợp các API cung cấp khả năng kết nối và thực hiện các hành động như đọc giá trị, ghi dữ liệu, lắng nghe notification, v.v. với các peripheral BLE sử dụng Generic Attribute Profile (GATT). Điều này có thể cho phép nhiều trường hợp sử dụng, chẳng hạn như điều khiển thiết bị IoT, đồng bộ dữ liệu thể dục từ đồng hồ thông minh, hoặc truyền dữ liệu giữa điện thoại thông minh và máy tính.
Web Bluetooth được hỗ trợ bởi một số trình duyệt web lớn, bao gồm Chrome, Firefox và Opera, và nó cũng bao gồm một tập hợp các giao thức tiêu chuẩn công nghiệp cho giao tiếp an toàn và hiệu quả. Tuy nhiên, điều quan trọng cần lưu ý là không phải tất cả các thiết bị Bluetooth đều tương thích với Web Bluetooth, vì sự hỗ trợ cho công nghệ này khác nhau giữa các thiết bị và nhà sản xuất khác nhau.

### Ưu điểm của Web Bluetooth
- Đa nền tảng: Web Bluetooth cho phép các nhà phát triển tạo các ứng dụng web có thể giao tiếp với các thiết bị Bluetooth trên nhiều nền tảng, bao gồm cả máy tính để bàn và thiết bị di động.
- Dễ sử dụng: Web Bluetooth đơn giản hóa quy trình kết nối với các thiết bị Bluetooth, giảm nhu cầu cho các ứng dụng native hoặc phần mềm phức tạp.
- Khả năng tiếp cận: Web Bluetooth cho phép các nhà phát triển web tạo các ứng dụng có thể giao tiếp với thiết bị Bluetooth mà không yêu cầu người dùng cài đặt các ứng dụng hoặc plugin riêng biệt.
- Linh hoạt: Web Bluetooth có thể được sử dụng để kết nối với nhiều loại thiết bị Bluetooth, bao gồm thiết bị IoT, thiết bị đeo và thiết bị nhà thông minh.

### Nhược điểm của Web Bluetooth
- Hỗ trợ trình duyệt: Trong khi hầu hết các trình duyệt hiện đại hỗ trợ Web Bluetooth, một số trình duyệt cũ hơn có thể không tương thích.
- Bảo mật: Web Bluetooth có thể gây ra rủi ro bảo mật nếu không được triển khai đúng cách. Ví dụ, nếu một ứng dụng có quyền truy cập vào thiết bị Bluetooth của người dùng, nó có thể truy cập các thông tin nhạy cảm khác trên thiết bị.
- Chức năng hạn chế: Web Bluetooth có thể không cung cấp cùng mức độ chức năng như các ứng dụng Bluetooth native. Điều này có thể hạn chế các loại ứng dụng có thể được phát triển bằng công nghệ này.
- Tuổi thọ pin: Bluetooth có thể là một công nghệ tiêu thụ năng lượng cao, có thể làm cạn tuổi thọ pin của thiết bị di động. Các nhà phát triển cần lưu ý điều này khi thiết kế các ứng dụng dựa vào kết nối Bluetooth.

### Các API được hỗ trợ
Các API được Web Bluetooth hỗ trợ tương tự như những API có sẵn trên iOS và Android, điều này làm cho việc làm việc trở nên đơn giản cho các nhà phát triển đã quen thuộc với công nghệ Bluetooth trên thiết bị di động.
Bạn có thể xem lại luồng để thiết lập kết nối với peripheral tại [Play Central And Peripheral Roles With CoreBluetooth](/2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/)

- `navigator.bluetooth.requestDevice()`: API này được sử dụng để yêu cầu quyền truy cập vào thiết bị BLE gần đó. Khi người dùng nhấp vào nút "Connect" trên ứng dụng web của bạn, API này được gọi để quét các thiết bị khả dụng và hiển thị hộp thoại cho người dùng.
```bash
/**
// Discovery options match any devices advertising:
// . The standard heart rate service. OR
// . Service uuid0, and devices with name "ExampleName1", and devices with name starting with "Prefix1" OR
// . Both service uuid1 and uuid2. OR
// . Devices with name "ExampleName2". OR
// . Devices with name starting with "Prefix2". OR
//
// And enables access to the battery service if devices
// include it, even if devices do not advertise that service.
**/
const device = await navigator.bluetooth.requestDevice({
  acceptAllDevices: true,
  filters: [
    { services: ["heart_rate"] },
    { services: [uuid0], name: "ExampleName1", namePrefix: "Prefix1" },
    { services: [uuid1, uuid2] },
    { name: "ExampleName2" },
    { namePrefix: "Prefix2" }
  ],
  optionalServices: [
    "battery_service",
  ],
});
```

- `BluetoothDevice.gatt.connect()`: API này được sử dụng để thiết lập kết nối với GATT server trên thiết bị BLE đã chọn. Khi kết nối được thiết lập, ứng dụng web của bạn có thể tương tác với các service và characteristic của thiết bị.
```bash
const server = await device.gatt.connect();
```

- `BluetoothDevice.gatt.disconnect()`: API này được sử dụng để ngắt kết nối khỏi thiết bị BLE khi tương tác hoàn tất.
```bash
const server = await device.gatt.disconnect();
```

- Lấy service & characteristic:
  `BluetoothDevice.gatt.getPrimaryService(serviceUuid)`: API này được sử dụng để lấy primary service từ GATT server trên thiết bị BLE đã chọn.
  `BluetoothRemoteGATTService.getCharacteristic(characteristicUuid)`: API này được sử dụng để lấy một characteristic cụ thể từ một service.
```bash
const services = await server.getPrimaryServices();
services.forEach(async (e) => {
  const chars = await e.getCharacteristics();
  // Doing your logic
});
```

- Đọc & ghi giá trị:
  `BluetoothRemoteGATTCharacteristic.readValue()`: API này được sử dụng để đọc giá trị của một characteristic.
  `BluetoothRemoteGATTCharacteristic.writeValue(value)`: API này được sử dụng để ghi một giá trị vào characteristic.
```bash
await char.writeValue(
  fromHexString(value)
);
await char.readValue();
```

- Lắng nghe sự kiện `disconnected`: Event listener này được kích hoạt khi thiết bị ngắt kết nối khỏi GATT server.
```bash
device.addEventListener('gattserverdisconnected', () => {
  // Your callback
});
```

- Lắng nghe thay đổi giá trị: Event listener này được kích hoạt khi giá trị của một characteristic thay đổi. Điều này có thể được sử dụng để nhận cập nhật thời gian thực từ thiết bị.
```bash
device.addEventListener('characteristicvaluechanged', () => {
  // Your callback
});
```

- Lắng nghe notification
```bash
await char.stopNotifications();
await char.startNotifications();
```

![](/Post-Resources/PlayRolesInCoreBluetooth/Programming_Flow_BLE.png)

### Một ví dụ đơn giản

Tại [Web Bluetooth example](https://uibluetooth.web.app/), tôi đã tạo một website đơn giản trình bày một tập hợp các API. Website demo này cung cấp cho các nhà phát triển một giao diện dễ sử dụng để kiểm tra và hiểu chức năng của các API. Bằng cách truy cập website demo này, các nhà phát triển có thể nhanh chóng có được cái nhìn sâu sắc về cách các API có thể được tích hợp vào ứng dụng của họ.

Theo mặc định, web quét tất cả các thiết bị gần đó.
![](/Post-Resources/WebBluetooth/example_scanning.png "Banner")

Để quét các thiết bị được chỉ định với uuid được định nghĩa trước, chọn `Filters` và nhập service uuid của bạn vào hộp filter.
![](/Post-Resources/WebBluetooth/example_filters.png "Banner")

Đây là giao diện sau khi kết nối đã được thiết lập thành công.
![](/Post-Resources/WebBluetooth/example_connected.png "Banner")


### Thêm các mẫu
Bạn có thể tìm thêm các ví dụ và ý tưởng qua video này
<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/303045191?h=18cde570de" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>
<p><a href="https://vimeo.com/303045191">WebBluetooth demos for Bluetooth.rocks</a> from <a href="https://vimeo.com/rakaz">Niels Leenheer</a> on <a href="https://vimeo.com">Vimeo</a>.</p>

### Hạn chế
- Vì mục đích bảo mật, chúng ta không thể tự động quét và kết nối với một thiết bị được chỉ định. Người dùng quyết định liệu ứng dụng web có được phép kết nối hay không, và được phép kết nối với thiết bị nào.
- Kết nối HTTPS: Web Bluetooth yêu cầu kết nối HTTPS an toàn để hoạt động đúng cách. Điều này có nghĩa là ứng dụng web phải được host trên một server an toàn với chứng chỉ SSL hợp lệ. Nếu ứng dụng không được host trên server an toàn, người dùng sẽ không thể kết nối với các thiết bị Bluetooth.
- Nền tảng: Web Bluetooth được hỗ trợ trong Chrome trên desktop và mobile (Yêu cầu Android 6+, không hỗ trợ iOS), Opera, và một số phiên bản Microsoft Edge. Điều quan trọng cần lưu ý là Web Bluetooth có thể không hoạt động trên các trình duyệt cũ hơn hoặc lỗi thời.
- Tùy chỉnh: Thật không may, không thể tùy chỉnh hộp thoại quét của Web Bluetooth để hiển thị thông tin bổ sung ngoài các tùy chọn mặc định. Web Bluetooth API được thiết kế để cung cấp một giao diện đơn giản và nhất quán cho các nhà phát triển, và hộp thoại quét được cố ý giữ đơn giản để duy trì sự đơn giản này.
- Hiệu suất: Người ta công nhận rộng rãi rằng sự ổn định của kết nối Bluetooth trên các ứng dụng Android native thường không đáng tin cậy như trên iOS, và có thể bị ảnh hưởng bởi các yếu tố như model điện thoại, nhà sản xuất, và phiên bản Android đang sử dụng. Do đó, điều quan trọng cần lưu ý là Web Bluetooth không hoạt động tốt như các ứng dụng native, đặc biệt trên các thiết bị Android.

### Mẹo & thực hành tốt nhất
Dưới đây là một số mẹo và thực hành tốt nhất để tối ưu hóa hiệu suất của các ứng dụng Web Bluetooth:
- Giảm thiểu truyền dữ liệu: Giao tiếp Bluetooth chậm so với các kênh giao tiếp khác. Do đó, điều quan trọng là giảm thiểu lượng dữ liệu mà ứng dụng của bạn gửi và nhận qua Bluetooth. Ví dụ, bạn có thể giảm số lượng thao tác đọc và ghi và chỉ truyền dữ liệu cần thiết cho ứng dụng của bạn.
- Sử dụng notification thay vì polling: Thay vì liên tục polling giá trị của một characteristic, hãy sử dụng notification để nhận cập nhật khi giá trị thay đổi. Cách tiếp cận này có thể giảm số lượng thao tác đọc và cải thiện hiệu suất của ứng dụng của bạn.
- Ngắt kết nối khi không sử dụng: Ngắt kết nối khỏi GATT server khi bạn không chủ động giao tiếp với thiết bị. Điều này có thể giảm tiêu thụ năng lượng và cải thiện tuổi thọ pin của thiết bị.
- Sử dụng caching: Caching có thể được sử dụng để lưu trữ dữ liệu thường xuyên được ứng dụng của bạn truy cập. Điều này có thể giảm số lượng thao tác đọc và cải thiện hiệu suất của ứng dụng của bạn.
- Tối ưu hóa quy trình quét: Quét thiết bị có thể là một thao tác tốn nhiều tài nguyên. Do đó, điều quan trọng là tối ưu hóa quy trình quét bằng cách giảm thời gian quét và lọc kết quả để chỉ bao gồm các thiết bị liên quan.
- Kiểm tra ứng dụng của bạn trên các thiết bị khác nhau: Kiểm tra ứng dụng của bạn trên các thiết bị khác nhau để đảm bảo rằng nó hoạt động tốt trên các nền tảng và cấu hình phần cứng khác nhau.

### Suy nghĩ cuối cùng
Bất chấp những hạn chế này, Web Bluetooth vẫn là một công nghệ đầy hứa hẹn với nhiều trường hợp sử dụng tiềm năng. Các nhà phát triển quan tâm đến việc sử dụng Web Bluetooth nên xem xét cẩn thận những hạn chế này và thiết kế ứng dụng của họ cho phù hợp.

### Tài liệu tham khảo
- https://www.smashingmagazine.com/2019/02/introduction-to-webbluetooth/
- https://googlechrome.github.io/samples/web-bluetooth/
