---
title: "Bảo mật Bluetooth: Pairing và Bonding"
date: 2024-08-31 10:38:32
tags: [CoreBluetooh, BLE]
layout: post
permalink: vi/posts/Bluetooth-security-Pairing-and-Bonding/
lang: vi
---

![](/Post-Resources/Bonding/cover.png "Bluetooth security")

Trong thời đại hiện đại, Bluetooth đóng vai trò quan trọng trong việc kết nối các thiết bị một cách liền mạch. Từ thiết bị theo dõi thể dục đến thiết bị nhà thông minh, Bluetooth Low Energy (BLE) cho phép các thiết bị giao tiếp hiệu quả trong khi giảm tiêu thụ năng lượng. Tuy nhiên, với sự gia tăng của truyền thông không dây, đảm bảo bảo mật đã trở thành mối quan tâm chính. Hai khái niệm cốt lõi của bảo mật Bluetooth là **Pairing** và **Bonding**, thường bị hiểu nhầm trong bối cảnh BLE.

<!-- more -->

Đảm bảo rằng các thiết bị pair và bond một cách an toàn là rất quan trọng để bảo vệ dữ liệu nhạy cảm. Việc triển khai không đúng các quy trình này có thể dẫn đến nhiều loại tấn công. Ví dụ, kẻ tấn công có thể chặn các giao tiếp và đánh cắp thông tin có giá trị.

Trong bài blog này, chúng ta sẽ khám phá pairing và bonding là gì, tại sao chúng quan trọng cho bảo mật, và cách chúng hoạt động trong thực tế, đặc biệt đối với các ứng dụng di động.

## Cấp thấp: Security Manager (SM)
Ở cốt lõi của bảo mật BLE là Security Manager (SM), một thành phần quan trọng quản lý các chức năng bảo mật khác nhau. SM xử lý việc trao đổi các khóa bảo mật và đảm bảo rằng tất cả dữ liệu truyền giữa các thiết bị được mã hóa và bảo vệ khỏi truy cập trái phép.

Các trách nhiệm chính của SM bao gồm quản lý pairing, bonding, mã hóa và xác thực, và quản lý khóa.

SM cung cấp các phương pháp xác thực khác nhau cho các mức độ bảo mật khác nhau:

- **Just Works**: Không có xác thực liên quan. Được sử dụng cho các ứng dụng bảo mật thấp.
- **Passkey Entry**: Một passkey (PIN) được nhập trên một hoặc cả hai thiết bị để xác thực.
- **Numeric Comparison**: Cả hai thiết bị hiển thị một số, và người dùng phải xác nhận rằng chúng khớp nhau.
- **Out-of-Band (OOB)**: Một công nghệ không dây khác, như NFC, được sử dụng để trao đổi thông tin, cung cấp bảo mật nâng cao.

![](/Post-Resources/Bonding/sm.png "Security Manager")

## Thiết lập trình tự pairing và bonding

**Pairing** là quá trình thiết lập một liên kết giao tiếp an toàn giữa hai thiết bị Bluetooth. Bước này rất cần thiết để đảm bảo rằng các thiết bị có thể chia sẻ dữ liệu một cách an toàn. Trong quá trình pairing, các thiết bị trao đổi thông tin, xác thực lẫn nhau, và tạo các khóa mã hóa để bảo vệ dữ liệu được truyền.

**Bonding** là bước tiếp theo sau pairing. Khi hai thiết bị pair thành công, chúng có thể lưu trữ các khóa mã hóa và thông tin bảo mật liên quan để sử dụng trong tương lai. Nó đảm bảo rằng các thiết bị không cần phải pair lại lần sau khi kết nối. Bằng cách lưu trữ các khóa này, các thiết bị có thể kết nối lại nhanh hơn và an toàn hơn trong tương lai.

Ở cấp độ cao, các bước trong quy trình pairing và bonding bao gồm:

*PAIRING*
- **Khởi tạo**: Một thiết bị gửi yêu cầu pairing đến thiết bị kia.
- **Trao đổi tham số bảo mật**: Các thiết bị chia sẻ khả năng của chúng, bao gồm các phương pháp xác thực có sẵn.
- **Xác thực**: Tùy thuộc vào các phương pháp có sẵn (Just Works, Passkey Entry, Numeric Comparison, hoặc Out-of-Band), các thiết bị tự xác thực.
- **Tạo khóa**: Các khóa mã hóa được tạo và sử dụng để bảo mật giao tiếp.
- **Thiết lập mã hóa**: Các thiết bị bắt đầu giao tiếp được mã hóa sau khi các khóa được trao đổi thành công.
*BONDING*
- **Lưu trữ thông tin bảo mật**: Sau khi pairing, cả hai thiết bị lưu các khóa mã hóa cho các kết nối trong tương lai.
- **Kết nối lại**: Trong các tương tác tương lai, các thiết bị có thể sử dụng các khóa đã lưu để thiết lập lại liên kết an toàn, được mã hóa mà không cần lặp lại quy trình pairing.

Dưới đây là tóm tắt của luồng trong ví dụ về thiết bị di động (central) và peripheral (ví dụ: đồng hồ thông minh, màn hình theo dõi, v.v.).
![](/Post-Resources/Bonding/bonding_sequence.png "Establish pairing and bonding sequence")

## Phía ứng dụng di động
iOS không cung cấp API bonding rõ ràng. Tuy nhiên, quy trình bonding xảy ra một cách trong suốt khi bạn kết nối với thiết bị BLE yêu cầu nó, và hệ điều hành sẽ nhắc người dùng xác thực cần thiết. Yêu cầu pairing thường được kích hoạt bằng cách truy cập các characteristic được bảo mật.

Ngược lại, bạn có nhiều quyền kiểm soát hơn đối với quy trình pairing và bonding trên Android.
```java
BluetoothDevice device = bluetoothAdapter.getRemoteDevice(deviceAddress);

// Checking bond state
int bondState = device.getBondState();
if (bondState == BluetoothDevice.BOND_BONDED) {
    // Already bonded
} else {
    // Create bond
    device.createBond();
}

...
// Moniroting updates
BroadcastReceiver receiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
        final String action = intent.getAction();
        if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action)) {
            int bondState = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.ERROR);
            if (bondState == BluetoothDevice.BOND_BONDED) {
                // Device is bonded
            } else if (bondState == BluetoothDevice.BOND_BONDING) {
                // Bonding in progress
            } else if (bondState == BluetoothDevice.BOND_NONE) {
                // Bonding failed
            }
        }
    }
};
```

Trên Android, không có API công khai để xóa thiết bị đã bond theo chương trình. Tuy nhiên, có một phương thức API riêng có sẵn có thể được truy cập bằng reflection để xóa bond. Xin lưu ý rằng, vì đây là API riêng, nó không được Google hỗ trợ, và việc sử dụng nó trong mã production có thể dẫn đến hành vi không thể đoán trước trên một số thiết bị hoặc ứng dụng của bạn có thể bị từ chối trong quá trình đánh giá của Google.

```java
public static boolean removeBond(BluetoothDevice device) {
    try {
        Method removeBondMethod = BluetoothDevice.class.getMethod("removeBond");
        return (boolean) removeBondMethod.invoke(device);
    } catch (Exception e) {
        e.printStackTrace();
    }
    return false;
}
```

## Thực hành tốt nhất

Khi làm việc với các thiết bị cần dữ liệu được mã hóa, tôi đã gặp một số vấn đề. Dưới đây là những điểm chính tôi đã học được, có thể giúp bạn tiết kiệm thời gian:

- Để hỗ trợ tự động kết nối từ hệ thống iOS, thiết bị phải chứa HID profile hoặc được đăng ký vào ANCS profile của điện thoại.
- Trên Android, hệ điều hành không tự động kết nối lại với thiết bị khi bonding; đó là công việc của các service của bạn.
- Hệ thống iOS tự động hiển thị popup pairing **ngay lập tức** sau khi gọi `connect` thành công với thiết bị nếu nó chứa HID profile.
- Việc xóa tất cả các characteristic được mã hóa của HID profile khỏi thiết bị của bạn ngăn hệ thống tự động hiển thị popup pairing.
- Khi đọc một characteristic được mã hóa tùy chỉnh của GATT profile, popup yêu cầu pairing sẽ xuất hiện.
- Hệ điều hành vẫn sẽ tự động kết nối với thiết bị sau khi pair nó với characteristic được mã hóa của chúng ta, ngay cả khi thiết bị HID không được mã hóa.
- Sử dụng các phương pháp xác thực mạnh: Ưu tiên Numeric Comparison hoặc Passkey Entry hơn Just Works.
- Cập nhật các giao thức mã hóa: Đảm bảo rằng các thiết bị của bạn sử dụng các giao thức mã hóa hiện đại, mạnh mẽ.

## Kết luận

Bluetooth pairing và bonding là các quy trình nền tảng cho phép giao tiếp an toàn giữa các thiết bị. Bằng cách hiểu các cơ chế này, các nhà phát triển có thể tăng cường đáng kể bảo mật cho các kết nối Bluetooth của họ. Khi số lượng thiết bị được kết nối tăng lên, việc đảm bảo bảo mật Bluetooth mạnh mẽ sẽ tiếp tục là ưu tiên để bảo vệ dữ liệu nhạy cảm cá nhân.

## Tài liệu tham khảo

- Kevin Townsend, Carles Cufí, Akiba, Robert Davidson - Getting Started with Bluetooth Low Energy\_ Tools and Techniques for Low-Power Networking-O'Reilly Media (2014)
- [How iOS and Android Handle Connections with BLE Human Interface Devices, Punch Through](https://punchthrough.com/ble-human-interface-device-connections-on-ios-and-android)
- [BLE Pairing and Bonding](https://technotes.kynetics.com/2018/BLE_Pairing_and_bonding/)
