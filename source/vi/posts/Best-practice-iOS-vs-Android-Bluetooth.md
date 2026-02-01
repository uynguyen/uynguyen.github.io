---
title: "Best practice: iOS vs Android Bluetooth"
date: 2024-06-30 10:48:09
tags: [BLE, iOS, Android]
layout: post
lang: vi
---

![](/Post-Resources/IOSAndroid/ios_android.png "Cover")

Công nghệ Bluetooth đã trở thành một phần không thể thiếu của các ứng dụng di động hiện đại, cho phép giao tiếp không dây liền mạch giữa các thiết bị. Dù là để kết nối với tai nghe không dây, truyền file, hay tương tác với các thiết bị smart home, Bluetooth đóng vai trò quan trọng trong việc nâng cao trải nghiệm người dùng.

Đối với các nhà phát triển di động, việc hiểu cách triển khai chức năng Bluetooth là điều cần thiết. Trong bài viết này, chúng ta sẽ đi sâu vào so sánh chi tiết các framework phát triển Bluetooth cho iOS và Android.

<!-- more -->

Chúng ta sẽ khám phá những điểm khác biệt và tương đồng chính giữa hai nền tảng này, bao gồm mọi thứ từ thiết lập ban đầu đến truyền dữ liệu và xử lý lỗi. Đến cuối bài so sánh này, bạn sẽ có hiểu biết rõ ràng về cách tận dụng công nghệ Bluetooth trong các ứng dụng di động của mình, bất kể bạn đang phát triển cho iOS hay Android.

Để có cái nhìn trực quan hơn, tôi đã tạo hình ảnh bên dưới để tóm tắt quy trình thiết lập kết nối trên Android và iOS

![](/Post-Resources/IOSAndroid/flow.png "Quy trình iOS & Android")

Thoạt nhìn, hai quy trình có vẻ khá giống nhau. Tuy nhiên, quy trình Android bao gồm các bước bổ sung. Mặc dù quy trình kết nối phức tạp hơn trên Android so với iOS, nhưng nó cung cấp quyền kiểm soát lớn hơn đối với dữ liệu trả về. Hãy chia quy trình thành ba bước chính để thảo luận: `Scanning`, `Getting Ready`, `Interacting`, và `Closing`. Mỗi bước này bao gồm các hành động và cân nhắc cụ thể đóng góp vào chức năng và hiệu quả tổng thể của quy trình kết nối.

## Scanning
Trong giai đoạn scanning, các quy trình khá giống nhau giữa Android và iOS, từ việc bắt đầu scan đến tạo kết nối.

Sự khác biệt chính là có nhiều thông tin hơn về peripheral trong kết quả scan trên Android so với iOS. Giá trị thú vị nhất là địa chỉ MAC của thiết bị. iOS không expose giá trị này và thay vào đó cung cấp một UUID ngẫu nhiên.
UUID trên iOS được tạo theo từng ứng dụng và từng cặp thiết bị, và vòng đời của chúng gắn liền với session hoặc cho đến khi thiết bị bị quên, vì vậy đừng dựa vào nó để nhận dạng hoặc kết nối lại với thiết bị của bạn. iOS không expose địa chỉ MAC vì nhiều lý do, chủ yếu liên quan đến quyền riêng tư và bảo mật. Bằng cách ẩn địa chỉ MAC, Apple đảm bảo rằng các ứng dụng và bên thứ ba không thể lạm dụng thông tin này để theo dõi hoặc tạo profile người dùng và cũng giúp ngăn chặn các hoạt động bất hợp pháp của kẻ tấn công.

Một giải pháp khả thi để vượt qua hạn chế này là bao gồm định danh duy nhất của riêng bạn trong gói tin advertising, sẽ có sẵn trên tất cả các nền tảng.

Một lưu ý quan trọng khác là hệ điều hành Android ngăn chặn việc start-stop scan quá khoảng 5 lần trong 30 giây (xin lưu ý rằng giá trị này thay đổi từ thiết bị này sang thiết bị khác). Gọi method `startScan` quá thường xuyên trong thời gian ngắn sẽ dẫn đến không có thiết bị nào được phát hiện.

Giá trị chung cuối cùng là giá trị cường độ tín hiệu, `RSSI (Received Signal Strength Indicator)`, cho biết thiết bị cách điện thoại bao xa. Phạm vi từ -30 đến -99; giá trị càng gần -30, thiết bị càng gần.

## Getting Ready
Khi thiết bị của bạn đã được phát hiện, bước tiếp theo là làm cho nó sẵn sàng để bạn có thể thực hiện các hành động read và write. Có hai cách tiếp cận khác nhau để làm cho thiết bị "sẵn sàng."

Cách tiếp cận đầu tiên là `action on-demand`, bao gồm việc không làm gì cho đến khi cần thiết. Điều này có nghĩa là bạn không cần discover service/characteristic hoặc set notification cho đến khi ứng dụng của bạn thực hiện lệnh read hoặc write. Ưu điểm là giai đoạn kết nối ngắn hơn, vì ứng dụng của bạn không cần discover tất cả service và characteristic, set notification, hoặc xử lý lỗi nếu có bất kỳ lỗi nào xảy ra. Nhược điểm là thao tác read hoặc write đầu tiên sẽ mất nhiều thời gian hơn.

Cách tiếp cận thứ hai bao gồm việc discover tất cả Bluetooth profile trước và làm cho thiết bị sẵn sàng cho bất kỳ lệnh nào. Nhược điểm và ưu điểm ngược lại với cách tiếp cận đầu tiên. Không có gì đúng hay sai với mỗi cách tiếp cận; đó chỉ là vấn đề sở thích. Vì vậy, hãy chọn cách phù hợp với bạn nhất. Đối với tôi, tôi thích đi với cách tiếp cận thứ hai, như được mô tả trong hình.

Giai đoạn setup trên iOS khá đơn giản. Ứng dụng của bạn chỉ cần discover tất cả service. Với mỗi service, sau đó bạn gọi để discover tất cả characteristic của nó. Cuối cùng, set notification nếu characteristic hỗ trợ thay đổi giá trị. Bạn có thể muốn giữ reference đến mỗi item characteristic (`CBPeripheral`) để có thể thực hiện các thao tác read và write.

Mặt khác, quy trình "make ready" khá phức tạp cho Android. Nếu bạn là nhà phát triển iOS, bạn có thể không tương tác nhiều với `GATT Descriptor` trong ứng dụng của mình. Đầu tiên, bạn cần làm quen với các khái niệm `GATT Descriptor` và `MTU (Maximum Transmission Unit)`.

`GATT Descriptor` cung cấp thông tin bổ sung về characteristic mà chúng được liên kết. Ví dụ, khi bạn đọc giá trị nhiệt độ từ nhiệt kế BLE, characteristic có thể có descriptor chỉ ra đơn vị đo lường bằng Celsius hoặc Fahrenheit. GATT Descriptor phổ biến nhất là `Client Characteristic Configuration Descriptor (CCCD)`, mà bạn sẽ sử dụng để enable/disable notification/indicator cho characteristic.
Sự khác biệt chính giữa loại `notification` và `indication` là độ tin cậy. Notification được gửi bởi peripheral mà không yêu cầu acknowledgment từ central device. Ngược lại, indication yêu cầu acknowledgment từ central device.

Việc set notification trên iOS rất đơn giản bằng cách gọi `CBCharacteristic.setNotify()` và hệ thống sẽ làm phần còn lại cho bạn. Nó sẽ tự động xác định loại notification và set giá trị đúng. Trên Android, bạn phải tự gọi nó. Code mẫu sau minh họa cách bạn có thể set notification cho characteristic trên Android:

```java
final UUID CCCD_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
if (!gattServer.setCharacteristicNotification(characteristic, true)) {
    return false;
}

final boolean canNotify = (characteristic.getProperties()
    & BluetoothGattCharacteristic.PROPERTY_NOTIFY) > 0;
final boolean canIndicate = (characteristic.getProperties()
    & BluetoothGattCharacteristic.PROPERTY_INDICATE) > 0;

if (!canNotify && !canIndicate) {
    // Không hỗ trợ notification/indication, không làm gì
    return true;
}

final BluetoothGattDescriptor cccDescriptor = characteristic.getDescriptor(CCCD_UUID);
if (cccDescriptor == null) {
    // Không tìm thấy descriptor trên characteristic?
    return false;
}
if (cccDescriptor.setValue(canNotify
        ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
        : BluetoothGattDescriptor.ENABLE_INDICATION_VALUE)) {
    gattServer.writeDescriptor(cccDescriptor);
    return true;
}

return false;
```

Bước cuối cùng là tùy chọn: yêu cầu thay đổi giá trị MTU.
`MTU (Maximum Transmission Unit)` đề cập đến lượng dữ liệu lớn nhất có thể được gửi trong một gói tin Bluetooth. Mặc định, giá trị MTU trong BLE là 23 bytes, nói cách khác, cho một lệnh read và write đơn lẻ, số byte tối đa mà ứng dụng/thiết bị của bạn có thể truyền là 23 bytes (với header 3-byte), nhưng nó có thể được thương lượng giữa central và peripheral device lên đến 517 bytes.

Trên iOS, bạn không trực tiếp yêu cầu kích thước MTU; thay vào đó, MTU được tự động thương lượng giữa central và peripheral device trong quá trình kết nối. Trên Android, sử dụng `BluetoothGatt.requestMtu()` để yêu cầu kích thước MTU cụ thể và xử lý response trong `BluetoothGattCallback.onMtuChanged()`. Một lỗi phổ biến là quên tăng MTU trong khi thiết bị của bạn đang gửi hơn 20 bytes mỗi request, dẫn đến thiếu dữ liệu trong gói tin.

Một nhận xét quan trọng liên quan đến việc thiết lập kết nối là có số lượng thiết bị tối đa có thể kết nối đồng thời. Không có tài liệu chính thức cho con số này, nhưng nhiều nhà phát triển đã phát hiện rằng trên iOS khoảng 7 - 10 thiết bị, trong khi trên Android khoảng 10 - 20 tùy thuộc vào model điện thoại và phiên bản Android.

```java
private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
    @Override
    public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
        if (status == BluetoothGatt.GATT_SUCCESS) {
            // Thay đổi kích thước MTU thành công
            Log.d("MTU", "MTU changed to " + mtu);
        } else {
            // Thay đổi kích thước MTU thất bại
            Log.d("MTU", "MTU change failed with status " + status);
        }
    }
};
```

## Interacting
Sau khi hoàn thành thành công tất cả các bước trên, thiết bị của bạn giờ đã sẵn sàng sử dụng. Bạn có thể đọc giá trị từ characteristic, truyền dữ liệu đến một characteristic cụ thể, hoặc đọc giá trị RSSI để xác định khoảng cách. Đảm bảo bạn xử lý các thay đổi giá trị đúng cách bằng cách kiểm tra giá trị đến từ characteristic nào.

Đáng lưu ý rằng trên iOS, nếu ứng dụng của bạn truyền một lượng lớn dữ liệu đến thiết bị (ví dụ: truyền file), bạn nên đợi sự kiện `peripheralIsReady` tiếp theo được trigger trước khi gửi gói tin tiếp theo. Việc liên tục gửi nhiều gói tin mà không đợi sự kiện này có thể gây áp lực lên buffer hàng đợi, dẫn đến mất gói tin.

```swift
func peripheralIsReady(toSendWriteWithoutResponse peripheral: CBPeripheral) {
    // Sẵn sàng gửi gói tin tiếp theo
}
```

## Closing
Một lần nữa, bước ngắt kết nối trên iOS rất đơn giản. Bạn chỉ cần gọi method `cancelPeripheralConnection`.

Trên Android, bạn cần làm nhiều hơn một thao tác: `disconnect` thiết bị và `close` Bluetooth GATT. Hãy nhớ rằng việc gọi `disconnect` chỉ hủy kết nối với peripheral, nó không giải phóng tất cả resource (ví dụ: các slot khả dụng trong Bluetooth stack) cho đến khi bạn gọi `close`. Bạn sử dụng `disconnect` khi bạn muốn tạm thời kết thúc kết nối nhưng có thể kết nối lại với thiết bị sau mà không cần reset hoàn toàn cấu hình GATT. Bạn sử dụng `close` khi bạn hoàn toàn xong với kết nối Bluetooth và muốn đảm bảo tất cả resource được dọn dẹp.

## Kết luận
Trong bài viết này, chúng ta đã khám phá các điểm quan trọng của việc triển khai chức năng Bluetooth trong các ứng dụng di động cho iOS và Android. Thông qua so sánh chi tiết, một số điểm chính đã xuất hiện làm nổi bật cả điểm tương đồng và khác biệt giữa hai nền tảng này.

iOS Core Bluetooth cung cấp một framework mạnh mẽ và đơn giản tích hợp liền mạch với hệ sinh thái iOS. Nó cung cấp API sạch và nhất quán.

Android Bluetooth, mặt khác, cung cấp tính linh hoạt, khả năng mở rộng và hỗ trợ nhiều chức năng Bluetooth. Mặc dù việc setup và triển khai có thể phức tạp hơn một chút so với iOS, API Bluetooth của Android cung cấp các công cụ mạnh mẽ để xử lý các tương tác Bluetooth một cách hiệu quả.

## Tham khảo
[The Ultimate Guide to Android Bluetooth Low Energy](https://punchthrough.com/android-ble-guide/)
[The Ultimate Guide to Apple's Core Bluetooth](https://punchthrough.com/core-bluetooth-basics/)
