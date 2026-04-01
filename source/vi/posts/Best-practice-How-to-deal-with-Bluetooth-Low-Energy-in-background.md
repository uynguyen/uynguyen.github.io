---
title: 'Thực hành tốt nhất: Cách xử lý Bluetooth Low Energy ở chế độ background'
date: 2018-07-23 18:26:27
tags: [iOS, BLE]
layout: post
ping: true
lang: vi
---
## Lời mở đầu
Khi làm việc với CoreBluetooth, bạn đã bao giờ tự hỏi ứng dụng BLE trên iOS có thể tồn tại như thế nào khi bị hệ thống terminate chưa? Làm thế nào để đưa nó trở lại background? Có thứ gì giống như Android service có thể chạy mãi mãi không? Bạn sẽ tìm thấy câu trả lời trong bài viết này. Hãy đọc tiếp!
![](/Post-Resources/BackgroundProcessing/Cover.png "")
<!-- more -->
## Vòng đời ứng dụng trên iOS
Trước khi hiểu sâu hơn về cách giữ ứng dụng sống trong background, hãy bắt đầu với vòng đời ứng dụng iOS.
Mỗi ứng dụng iOS có năm trạng thái chính.
![](/Post-Resources/BackgroundProcessing/iOS_App_LifeCycle.png "Vòng đời ứng dụng iOS")
*Not running* — Ứng dụng chưa được khởi chạy, hoặc đang chạy nhưng đã bị hệ thống hoặc người dùng terminate.
*Inactive* — Trạng thái chuyển tiếp trước khi ứng dụng chuyển sang trạng thái khác.
*Active* — Ứng dụng đang chạy ở foreground và nhận các event từ người dùng.
*Background* — Ứng dụng ở background và không hiển thị với người dùng. Ứng dụng yêu cầu thêm thời gian thực thi có thể ở trạng thái này trong một khoảng thời gian. Lưu ý ứng dụng sẽ đi qua trạng thái inactive trước khi vào background.
*Suspended* — Ứng dụng ở background và không được phép thực thi bất kỳ code nào. Hệ thống tự động chuyển ứng dụng sang trạng thái này, và ứng dụng sẽ không nhận event nào. Khi các ứng dụng foreground cần thêm bộ nhớ, hệ thống có thể terminate các ứng dụng suspended để giải phóng không gian. Chúng ta không thể dự đoán khi nào điều này xảy ra. Sau khi bị terminate, ứng dụng trở về trạng thái not running.

<center>

![](/Post-Resources/BackgroundProcessing/AppCycle.gif "Ví dụ vòng đời ứng dụng iOS")

</center>

## Các vấn đề BLE với vòng đời ứng dụng
Như đã đề cập, khi ứng dụng vào background, nó có thể bị hệ thống terminate nếu cần giải phóng tài nguyên cho các ứng dụng khác. Không giống Android — nơi có thể khởi động lại một service sau khi bị kill — trên iOS không có cách nào đưa ứng dụng trở lại sau khi bị hệ thống terminate. Kết quả là mọi Bluetooth event được dispatch từ thiết bị sẽ không bao giờ đến được ứng dụng. Điều này có nghĩa là ứng dụng có thể bỏ lỡ các indication do người dùng kích hoạt — ví dụ, phát một bản nhạc khi họ nhấn nút vật lý trên thiết bị BLE.

Apple mô tả vấn đề này qua ví dụ ["Smart door"](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/CoreBluetoothBackgroundProcessingForIOSApps/PerformingTasksWhileYourAppIsInTheBackground.html#//apple_ref/doc/uid/TP40013257-CH7-SW10). Ý tưởng là một ứng dụng tự động khóa và mở khóa cửa khi người dùng ra/vào nhà. Thách thức cốt lõi là duy trì kết nối giữa điện thoại và khóa cửa trong khi người dùng dùng điện thoại — mở/đóng ứng dụng, bật/tắt Bluetooth, vào chế độ máy bay, khởi động lại điện thoại, v.v. Bất kỳ hành động nào trong số này đều có thể khiến ứng dụng bị hệ thống kill vĩnh viễn. Khi đó ứng dụng sẽ không thể kết nối lại với khóa khi người dùng trở về nhà.

<center>

![](/Post-Resources/BackgroundProcessing/SmartDoor.jpg "Smart door")

</center>

Để giải quyết vấn đề này, Apple cung cấp *State Preservation and Restoration* (CoreBluetooth background processing). Tính năng này được tích hợp sẵn trong CoreBluetooth, cho phép ứng dụng được khởi chạy lại vào background khi bị hệ thống terminate.

Về bản chất, iOS chụp snapshot của tất cả các đối tượng liên quan đến Bluetooth đang hoạt động trong ứng dụng. Nếu sau đó có Bluetooth event liên quan đến các đối tượng đó đến điện thoại, hệ thống sẽ đánh thức ứng dụng từ trạng thái bị terminate. Đây là một khả năng rất mạnh mẽ.

## Triển khai State Preservation and Restoration

Để minh họa kỹ thuật này, tôi sẽ tái sử dụng mã nguồn từ bài trước [Đóng Vai Trò Central Và Peripheral Với CoreBluetooth](/2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/) và thêm code cần thiết để bật background restoration.

Đầu tiên, tôi cấu hình iPad hoạt động như một Peripheral với UUID "1FA2FD8A-17E0-4D3B-AF45-305DA6130E39", được tạo bằng lệnh `uuidgen` trên Mac. Tôi cho nó bắt đầu advertising với local name "iPad". Khi central manager thiết lập kết nối, các log in/out được in ra để xác nhận kết nối thành công.

<center>

![](/Post-Resources/BackgroundProcessing/Peripheral.gif "iPad hoạt động như một peripheral")

</center>

Khi nhấn nút "Send Notify", ứng dụng sẽ notify chuỗi dữ liệu "Say something cool!" qua characteristic "463FED21-DA93-45E7-B00F-B5CD99775150" — được định nghĩa là một encrypted notifiable characteristic — đến central manager đã kết nối.

Tiếp theo, trong ứng dụng Central Manager, tạo Restore Identifier cho đối tượng `CBCentralManager` — tôi dùng chuỗi "YourUniqueIdentifierKey". Điều này báo cho CoreBluetooth biết cần bảo tồn manager này khi ứng dụng bị terminate. Sau đó triển khai delegate `willRestoreState`:

```swift
public func centralManager(_ central: CBCentralManager, willRestoreState dict: [String : Any]) {
    LocalNotification.shared.showNotification(id: "willrestorestate", title: "Manager will restore state", body: "", timeInterval: 1.0)
        
    let systemSoundID: SystemSoundID = 1321
    AudioServicesPlaySystemSound (systemSoundID)

    if let peripherals = dict[CBCentralManagerRestoredStatePeripheralsKey] as? [CBPeripheral] {
        peripherals.forEach { (awakedPeripheral) in
            print("\(Date.now). - Awaked peripheral \(String(describing: awakedPeripheral.name))")
            guard let localName = awakedPeripheral.name,
            localName == "iPad" else {
                return
            }
            
            self.connectedDevice = Device.init(peripheral: awakedPeripheral)
        }
    }
}
```
Khi `centralManager(_:willRestoreState:)` được gọi, tôi phát âm thanh và hiển thị local notification với tên peripheral được khôi phục, xác nhận ứng dụng đã được hệ thống đánh thức. Tham số `dict` chứa toàn bộ snapshot trạng thái Bluetooth. Dùng key `CBCentralManagerRestoredStatePeripheralsKey`, chúng ta lấy được mảng `CBPeripheral` — tất cả các peripheral đã kết nối hoặc đang chờ kết nối lúc ứng dụng bị terminate. Tôi duyệt qua mảng, tìm peripheral quan tâm, và khôi phục nó vào biến `connectedDevice` để tiếp tục nhận cập nhật.

Tôi cũng thêm local notification tại `appDidFinishLaunching` và `peripheral(_:didUpdateValueFor:characteristic:)` để kiểm tra:

```swift
func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
    if let data = characteristic.value {
        let str = String.init(data: data, encoding: .utf8) ?? ""
        LocalNotification.shared.showNotification(id: "DidUpdateValue", title: "Peripheral did update value from grave!", body: "\(str)", timeInterval: 1.0)
    }
}
```

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
    let _ = BluetoothManager.sharedInstance
    let _ = LocalNotification.shared
    
    LocalNotification.shared.showNotification(id: "didfinishlaunch", title: "App did finish launching", body: "Options: \(launchOptions?[UIApplicationLaunchOptionsKey.bluetoothCentrals] ?? "nil")", timeInterval: 1.0)

    return true
}
```
Đến lúc chạy thử nghiệm. Tôi dùng hai phương pháp để giả lập hệ thống terminate ứng dụng.

**Phương pháp 1 — dùng Xcode:**
- Chạy ứng dụng từ Xcode.
- Dừng bằng nút "Stop".
- Khởi động lại từ Xcode.

**Phương pháp 2 — dùng phần cứng:**
- Nhấn nút Home để đưa ứng dụng vào background.
- Nhấn giữ nút nguồn cho đến khi thấy "slide to power off".
- Thả nút nguồn, sau đó nhấn giữ nút Home khoảng 5 giây cho đến khi màn hình home xuất hiện lại.

Trong demo dưới đây, tôi dùng cả hai phương pháp. Hãy xem điều kỳ diệu xảy ra!

<center>

![](/Post-Resources/BackgroundProcessing/Restoration.gif "Demo")

</center>

Đây là log in ra từ Xcode.

```bash
2018-08-18 19:46:35.6560 App did finish lauching with option nil
2018-08-18 19:46:35.6620 Manager will restore state
2018-08-18 19:46:35.6650. - Awaked peripheral Optional("iPad")
2018-08-18 19:46:35.6660 Manager did update state 5
2018-08-18 19:46:35.6950 App did become active
2018-08-18 19:46:35.7080 Found iPad
2018-08-18 19:46:35.7100 Did connect.
2018-08-18 19:46:51.5170 App will resign active
2018-08-18 19:46:52.1100 App did enter background
Message from debugger: Terminated due to signal 9
```

Tôi kết nối với iPad, rồi giả lập terminate bằng Xcode, và xác nhận `centralManager(_:willRestoreState:)` được kích hoạt qua popup. Sau đó tôi dùng Phương pháp 2 — khi màn hình home xuất hiện, chắc chắn ứng dụng đã bị terminate. Tôi nhấn "Send Notify" từ iPad (đóng vai Peripheral) để gửi BLE event. Ngay lập tức, `centralManager(_:willRestoreState:)` được gọi — một local notification hiện lên, rồi một cái khác hiển thị dữ liệu BLE nhận được từ peripheral — chuỗi "Say something cool!". Nó hoạt động. Ứng dụng có thể sống sót qua quá trình terminate.

Có một quan sát thú vị: với Phương pháp 1 (Xcode restart), tham số `launchOptions` trong `application(_:didFinishLaunchingWithOptions:)` luôn là nil. Với Phương pháp 2, chúng ta có thể trích xuất `UIApplicationLaunchOptionsKey.bluetoothCentrals` từ nó (giá trị trả về "YourUniqueIdentifierKey"). Phương pháp 2 là simulation chính xác hơn vì nó khớp với tài liệu Apple: *"Khi ứng dụng được hệ thống khởi chạy lại, bạn có thể lấy tất cả restoration identifier cho các đối tượng central manager mà hệ thống đang bảo tồn cho ứng dụng."*

Trong `application(_:didFinishLaunchingWithOptions:)`, dùng `UIApplicationLaunchOptionsBluetoothCentralsKey` để lấy mảng UUID đại diện cho tất cả `CBCentralManager` mà Core Bluetooth đang bảo tồn. Duyệt qua chúng và tìm cái khớp với Restoration Identifier của bạn để khởi tạo lại manager.

## Hạn chế
### Khi người dùng force-quit ứng dụng từ app switcher
Nếu người dùng force-quit ứng dụng từ app switcher, ứng dụng sẽ không có cơ hội được đánh thức qua state restoration. Tuy nhiên, có một công nghệ khác có thể đưa ứng dụng trở lại background: **iBeacon**. Bài tiếp theo sẽ hướng dẫn cách triển khai.

### Khi người dùng khởi động lại điện thoại
Nếu người dùng khởi động lại điện thoại, ứng dụng sẽ bị terminate vĩnh viễn. Chúng ta có thể giải quyết điều này bằng CoreLocation. Tôi sẽ trình bày ở phần tiếp theo.

## Suy nghĩ cuối

Trong bài này, chúng ta đã đi qua vòng đời ứng dụng iOS và khám phá cách giữ ứng dụng BLE sống ngay cả sau khi bị hệ thống terminate. Nội dung bài viết đến từ kinh nghiệm làm việc thực tế.

Hy vọng bạn thấy bài viết này hữu ích.
