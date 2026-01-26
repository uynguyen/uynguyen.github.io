---
title: 'Thực hành tốt nhất: Cách xử lý Bluetooth Low Energy ở chế độ background'
date: 2018-07-23 18:26:27
tags: [iOS, BLE]
layout: post
permalink: vi/posts/Best-practice-How-to-deal-with-Bluetooth-Low-Energy-in-background/
lang: vi
---
## Lời mở đầu
Khi làm việc với CoreBluetooth, bạn đã bao giờ quan tâm rằng ứng dụng BLE trên iOS có thể tồn tại như thế nào khi nó bị hệ thống terminate? Làm thế nào chúng ta có thể đưa nó trở lại background? Có thứ gì giống như service trên Android có thể tồn tại mãi mãi không? Bạn có thể tìm thấy câu trả lời cho tất cả các câu hỏi này trong bài viết này. Hãy đọc tiếp!
![](/Post-Resources/BackgroundProcessing/Cover.png "")
<!-- more -->
## Vòng đời ứng dụng trên iOS
Trước khi hiểu sâu về cách chúng ta có thể giữ ứng dụng tồn tại ở background, tốt nhất là bắt đầu với vòng đời ứng dụng trên iOS.
Như bạn có thể biết, có năm trạng thái chính của mọi ứng dụng iOS.
![](/Post-Resources/BackgroundProcessing/iOS_App_LifeCycle.png "Vòng đời ứng dụng iOS")
*Not running* Ứng dụng chưa được khởi chạy hoặc đang chạy nhưng đã bị hệ thống hoặc người dùng terminate.
*Inactive* Đây là trạng thái ban đầu trước khi ứng dụng thực sự chuyển sang trạng thái khác.
*Active* Ứng dụng đang chạy ở foreground và nhận các event từ người dùng.
*Background* Ứng dụng ở background và không hiển thị với người dùng. Tuy nhiên, một ứng dụng yêu cầu thêm thời gian thực thi có thể duy trì ở trạng thái này trong một khoảng thời gian. Ngoài ra, ứng dụng sẽ chuyển sang trạng thái inactive trước khi vào chế độ background.
*Suspended* Ứng dụng ở background nhưng nó không được phép thực thi bất kỳ code nào. Ứng dụng được hệ thống tự động chuyển sang trạng thái này và nó sẽ không nhận được bất kỳ event nào trước khi hệ thống thực hiện điều đó. Khi các ứng dụng foreground cần thêm bộ nhớ, hệ thống có thể terminate các ứng dụng suspended để tạo thêm không gian cho các ứng dụng foreground. Lưu ý rằng chúng ta không thể dự đoán khi nào ứng dụng suspended sẽ bị hệ thống terminate. Sau khi bị terminate, ứng dụng trở về trạng thái not running.

<center>

![](/Post-Resources/BackgroundProcessing/AppCycle.gif "Ví dụ về vòng đời ứng dụng iOS")

</center>

## Các vấn đề BLE với vòng đời ứng dụng
Như đã đề cập, khi ứng dụng vào background, ứng dụng có thể bị hệ thống terminate nếu cần giải phóng tài nguyên cho các ứng dụng khác. Không giống như Android OS, sau khi bị hệ thống kill, chúng ta có thể khởi động lại một service để giữ cho ứng dụng của bạn sống. Trên iOS, một khi ứng dụng bị hệ thống terminate, không có cách nào để đưa nó trở lại background. Kết quả là, bất kỳ event Bluetooth nào dispatch từ thiết bị sẽ không bao giờ đến được ứng dụng. Điều này có nghĩa là ứng dụng của bạn có thể bỏ lỡ các indication được người dùng kích hoạt, chẳng hạn như phát một bản nhạc trên điện thoại của họ khi nhấn các nút vật lý từ thiết bị BLE.

Apple đưa ra một ví dụ gọi là ["Smart door"](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/CoreBluetoothBackgroundProcessingForIOSApps/PerformingTasksWhileYourAppIsInTheBackground.html#//apple_ref/doc/uid/TP40013257-CH7-SW10). Ý tưởng chính của ví dụ này là có một tương tác tự động giữa ứng dụng và khóa cửa. Hãy tưởng tượng chúng ta đang phát triển một ứng dụng có thể tự động khóa và mở khóa cửa khi người dùng đi vào và ra khỏi nhà của họ. Tuy nhiên, vấn đề chính của việc triển khai này là giữ kết nối giữa hai thiết bị, điện thoại và khóa cửa. Trong khi sử dụng điện thoại, người dùng thực hiện nhiều hành động khác nhau trên điện thoại: mở / đóng ứng dụng, bật / tắt cài đặt Bluetooth, vào chế độ máy bay, khởi động lại điện thoại, v.v. Các tương tác này có thể dẫn đến việc ứng dụng của chúng ta bị hệ thống kill, mãi mãi. Trong trường hợp này, ứng dụng sẽ không thể kết nối lại với khóa khi người dùng trở về nhà, và người dùng có thể không thể mở khóa cửa.

<center>

![](/Post-Resources/BackgroundProcessing/SmartDoor.jpg "Smart door")

</center>

Để giải quyết vấn đề này, Apple cung cấp một phương pháp gọi là *State Preservation and Restoration* (CoreBluetooth background processing). *State Preservation and Restoration* được tích hợp sẵn trong CoreBluetooth cho phép ứng dụng của chúng ta có thể được khởi chạy lại vào background khi nó bị hệ thống terminate.
Về cơ bản, iOS chụp snapshot của tất cả các đối tượng liên quan đến Bluetooth đang hoạt động trong ứng dụng của chúng ta. Sau đó, nếu có bất kỳ event Bluetooth nào liên quan đến các đối tượng Bluetooth mà ứng dụng của chúng ta đang tương tác đến điện thoại, ứng dụng của chúng ta sẽ được đánh thức từ cõi chết. Thật tuyệt vời!

## Triển khai State Preservation and Restoration

Để minh họa kỹ thuật State Preservation and Restoration trên iOS, tôi sẽ tái sử dụng mã nguồn từ bài viết trước [Đóng Vai Trò Central Và Peripheral Với CoreBluetooth](/2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/) nhưng chúng ta sẽ thêm một số code nữa vào các project để làm cho nó trở nên kỳ diệu.
Đầu tiên, tôi đặt iPad của mình hoạt động như một Peripheral với uuid "1FA2FD8A-17E0-4D3B-AF45-305DA6130E39", được tạo bằng lệnh `uuidgen` trên Mac. Sau đó, làm cho nó bắt đầu advertising với local name "iPad". Nếu có một kết nối được thiết lập bởi central manager, các log in/out sẽ được in ra để chúng ta biết liệu kết nối có được thực hiện thành công hay không.

<center>

![](/Post-Resources/BackgroundProcessing/Peripheral.gif "iPad hoạt động như một peripheral")

</center>

Khi nút "Send Notify" được chạm vào, ứng dụng sẽ notify một chuỗi dữ liệu "Say something cool!" thông qua "463FED21-DA93-45E7-B00F-B5CD99775150" được định nghĩa là một encrypted notifiable characteristic của ứng dụng đến central manager đã kết nối.

Điều tiếp theo chúng ta cần làm là quay lại ứng dụng Central Manager và tạo một Restore Identifier cho các đối tượng CBCentralManager để được hệ điều hành tiếp quản khi ứng dụng bị terminate, tôi chọn chuỗi "YourUniqueIdentifierKey". Tiếp theo, chúng ta sẽ triển khai `willRestoreState` được Apple cung cấp.
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
Ở đây, khi `centralManager(_:, willRestoreState)` được gọi, tôi sẽ phát một soundtrack và hiển thị một pop-up với tên của peripheral được đánh thức để thông báo rằng ứng dụng thực sự được hệ thống đánh thức. Bên trong method, chúng ta cũng có thể lấy một dictionary chứa đầy thông tin trạng thái. Khi chúng ta lấy với key CBCentralManagerRestoredStatePeripheralsKey, nó chứa các thứ như một mảng CBPeripheral, chứa tất cả các peripheral đã kết nối hoặc đang chờ kết nối tại thời điểm ứng dụng bị hệ thống terminate. Ở đây, tôi lặp qua mảng các peripheral, kiểm tra xem có peripheral mà tôi quan tâm không, sau đó khởi tạo một `Device` và đặt nó trở lại biến `connectedDevice` để tôi có thể nhận các giá trị cập nhật từ peripheral.

Tôi cũng thêm code sẽ popup một local notification tại delegate `appDidFinishLaunching` và tại method `peripheral(:didUpdateValueFor:chacracteristic)` để test.

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
Đã đến lúc chạy thử nghiệm của chúng ta! Tôi sẽ sử dụng hai phương pháp để mô phỏng việc hệ thống terminate ứng dụng ở background.
Phương pháp đầu tiên là sử dụng XCode.
- Chạy ứng dụng từ Xcode.
- Dừng ứng dụng bằng cách nhấn nút "Stop" từ Xcode.
- Khởi động lại ứng dụng từ Xcode.

Phương pháp thứ hai là thực hiện các bước sau:
- Nhấn nút home để đưa ứng dụng vào background.
- Nhấn giữ nút nguồn cho đến khi bạn thấy "slide to power off".
- Thả nút nguồn và nhấn giữ nút home khoảng 5 giây (cho đến khi bạn thấy màn hình home xuất hiện lại).

Trong phần demo bên dưới, bạn sẽ thấy tôi sử dụng cả hai để test. Hãy xem điều gì tuyệt vời xảy ra!

<center>

![](/Post-Resources/BackgroundProcessing/Restoration.gif "Demo")

</center>

Đây là log được in từ Xcode.

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

Đầu tiên, tôi kết nối với thiết bị iPad, sau đó mô phỏng việc terminate bằng Xcode (Khởi chạy lại ứng dụng từ Xcode), sau đó bạn thấy delegate `centralManager(_:, willRestoreState)` được kích hoạt bởi popup. Sau đó, tôi mô phỏng việc terminate bằng phương pháp thứ hai, khi màn hình home xuất hiện lại, chắc chắn rằng ứng dụng đã bị terminate. Tiếp theo, tôi nhấn nút "Send notify" từ iPad (Đang đóng vai trò Peripheral) để gửi một event BLE đến ứng dụng. Đáng ngạc nhiên, `centralManager(_:, willRestoreState)` được gọi ngay lập tức như chúng ta có thể thấy một local notification hiện lên, sau đó một cái khác hiển thị dữ liệu BLE nhận được từ peripheral (Chuỗi "Say something cool!"). Nó thực sự hoạt động! Ứng dụng bây giờ có thể tồn tại mãi mãi! Nhưng khoan đã, nó không đơn giản như vậy. Cách tiếp cận này vẫn có một số hạn chế mà chúng ta sẽ thảo luận sau trong bài viết này.

Như bạn có thể nhận thấy rằng có sự khác biệt giữa hai cách tôi sử dụng để mô phỏng việc terminate background, khi ứng dụng được khởi chạy lại từ cách đầu tiên, giá trị option của delegate `application(application:didFinishLaunchingWithOptions:)` luôn là nil, trong khi chúng ta có thể trích xuất `[UIApplicationLaunchOptionsKey.bluetoothCentrals` bằng cách sử dụng cách thứ hai (Giá trị của `launchOptions?[UIApplicationLaunchOptionsKey.bluetoothCentrals]` sẽ trả về chuỗi "YourUniqueIdentifierKey"). Tôi không biết lý do tại sao nó xảy ra. Nhưng có một điều chắc chắn rằng cách tiếp cận thứ hai tốt hơn cách đầu tiên vì nó khớp với tài liệu Apple. *"Khi ứng dụng của bạn được hệ thống khởi chạy lại, bạn có thể lấy tất cả các restoration identifier cho các đối tượng central manager mà hệ thống đang bảo tồn cho ứng dụng của bạn".*

Vì vậy, trong `application(application:didFinishLaunchingWithOptions:)`, chúng ta có thể lấy danh sách UUID đại diện cho tất cả các đối tượng CBCentralManager đang hoạt động khi ứng dụng bị terminate và Core Bluetooth cùng iOS đã tiếp quản trong khi bạn bị terminate. Sử dụng UIApplicationLaunchOptionsBluetoothCentralsKey để lấy bất kỳ central nào chúng ta có thể đã khởi tạo trước khi bị zap. Lặp qua mảng centralManagerUUID và tìm cái khớp với Restoration Identifier mà chúng ta quan tâm.

## Hạn chế
### Khi người dùng force kill ứng dụng từ multiple task view
Nếu người dùng force quit ứng dụng từ multiple task view, không có cơ hội nào để ứng dụng có thể thức dậy từ restoration event. Nhưng may mắn thay, có một công nghệ khác chúng ta có thể tận dụng để đưa ứng dụng trở lại background có tên là "iBeacon". Trong bài viết tiếp theo, tôi sẽ hướng dẫn bạn cách triển khai công nghệ thú vị này vào ứng dụng của chúng ta.

### Khi người dùng khởi động lại điện thoại
Nếu người dùng reset điện thoại, ứng dụng sẽ bị kill mãi mãi. Bằng cách tận dụng CoreLocation, chúng ta có thể giải quyết vấn đề. Trong phần tiếp theo, tôi sẽ hướng dẫn bạn cách làm điều đó.

## Suy nghĩ cuối cùng

Trong bài viết này, chúng ta đã đi qua vòng đời ứng dụng iOS, tôi cũng đã hướng dẫn bạn cách giữ cho ứng dụng tồn tại ngay cả khi nó bị hệ thống terminate. Nội dung của bài viết này thực sự thú vị và chúng được hình thành từ các thí nghiệm làm việc thực tế của tôi.
Hy vọng bạn sẽ thấy bài viết này hữu ích.
