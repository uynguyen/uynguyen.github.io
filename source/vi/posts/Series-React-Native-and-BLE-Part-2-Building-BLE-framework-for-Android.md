---
title: 'Chuỗi bài React Native và BLE: Phần 2 - Xây dựng BLE framework cho Android'
date: 2022-02-13 10:57:24
tags: [BLE, Bluetooth, Android]
layout: post
lang: vi
---

![](/Post-Resources/RN-BLE/cover2.png "")

Khi nói đến công nghệ di động, iOS và Android là hai hệ điều hành thống trị cung cấp năng lượng cho phần lớn điện thoại thông minh và máy tính bảng trên toàn thế giới. Là các nhà phát triển, điều cần thiết là chúng ta phải có kiến thức và công cụ để làm việc hiệu quả với cả hai nền tảng. Điều này đặc biệt đúng khi nói đến việc sử dụng công nghệ Bluetooth, là một thành phần quan trọng của nhiều ứng dụng di động hiện đại.
Trong phần 1 của chuỗi bài tutorial này, chúng ta đã tạo một BLE (Bluetooth Low Energy) framework có thể được kết nối với UI sử dụng React Native. Tuy nhiên, framework này chỉ hoạt động trên iOS, điều đó có nghĩa là chúng ta cần phát triển một giải pháp riêng cho Android.
Trong phần 2 của chuỗi bài tutorial này, chúng ta sẽ tập trung vào việc định nghĩa một SDK mới cho Android và liên kết nó với UI, giống như chúng ta đã làm trên iOS. Điều này sẽ cho phép chúng ta hỗ trợ đầy đủ cả hai hệ điều hành và cung cấp trải nghiệm Bluetooth liền mạch cho tất cả người dùng, bất kể thiết bị họ chọn.
<!-- more -->

## Tạo Android SDK mới
Bước đầu tiên là tạo thư viện Bluetooth của riêng bạn. Thông thường, các kỹ sư có xu hướng sử dụng thư viện mã nguồn mở như [RxAndroidBle](https://github.com/dariuszseweryn/RxAndroidBle) hoặc [Android-BLE-Library powered by Nordic](https://github.com/NordicSemiconductor/Android-BLE-Library). Tuy nhiên, mục tiêu chính của tutorial này là hướng dẫn bạn cách tạo một Android module mới và liên kết nó với React Native. Điều này không chỉ áp dụng cho Bluetooth mà còn cho bất kỳ thư viện nào bạn cần sử dụng trong ứng dụng của mình. Mục tiêu khác là đạt được kiến thức nền tảng về Android BLE trong trường hợp bạn cần sửa đổi điều gì đó hoặc tạo tính năng riêng chưa được hỗ trợ trên thị trường.

Bằng cách tạo thư viện Bluetooth của riêng mình, bạn có tự do tùy chỉnh và điều chỉnh thư viện theo nhu cầu cụ thể của bạn. Điều này có thể mang lại lợi thế đáng kể so với việc sử dụng các thư viện có sẵn, vì bạn có thể tối ưu hóa thư viện cho trường hợp sử dụng cụ thể của mình và tránh các vấn đề tương thích tiềm ẩn.

Từ dự án của bạn, đi đến `File > New > New Module > Fill in the information`.
Một thư viện mới sẽ được thêm vào dự án của bạn.

![](/Post-Resources/RN-BLE/android_import_module.png "")
![](/Post-Resources/RN-BLE/android_new_module.png "")

Một điều khác biệt lớn giữa Android và iOS là từ Android 6.0, Google yêu cầu `Location Permission` phải được bật để quét Bluetooth Low Energy (Xem thêm [Android 6.0 Changes](https://developer.android.com/about/versions/marshmallow/android-6.0-changes.html#behavior-hardware-id)).

Tiếp theo, thêm các permission sau vào `AndroidManifest.xml` của bạn tại `android/app/src/main/AndroidManifest.xml`

```java
   <uses-permission android:name="android.permission.BLUETOOTH" />
   <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

``` Important note:
Android 12 update:
From Android 12 (API level 31+):
- Google requires new permission for scanning nearby devices:
   + If your app looks for Bluetooth devices, such as BLE peripherals, declare the BLUETOOTH_SCAN permission.
   + If your app communicates with already-paired Bluetooth devices, declare the BLUETOOTH_CONNECT permission.
- If your app does not use Bluetooth scan results for physical location, you can skip declaring location permission by adding `android:usesPermissionFlags`
```

Với mục đích demo, SDK chỉ expose 2 API đơn giản `startScan` để bắt đầu quét các thiết bị gần đó và `isBluetoothOn` để kiểm tra xem Bluetooth có được bật không.
```
/*
Start scanning nearby devices.
Accept `callback` as param and return found devices via `callback`
*/
fun startScan(callback: (device: Device) -> Unit)
```

```
/*
Check if BLE is ready for scanning
*/
fun isBluetoothOn() : Boolean
```

Để yêu cầu permission trên React Native, chúng ta sẽ sử dụng module này https://github.com/zoontek/react-native-permissions để lấy các permission mà ứng dụng cần.

## Build và release Android SDK module
Tiếp theo, hãy phân phối module để các ứng dụng khác có thể sử dụng nó.
Từ thư mục root, chạy `./gradlew kTrackingSDK:assembleRelease` để tạo file .aar.
File output sẽ nằm tại `./KTrackingSDK/build/outputs/aar`, sau đó bạn có thể import file .aar vào dự án `android`.

## Kết nối với phần React Native
Bây giờ, chúng ta đã có thư viện Bluetooth. Bước tiếp theo là liên kết module với phần React Native.

Đầu tiên, phần React Native cần hiểu Native module. Thêm cấu hình sau vào `/src/main/java` của bạn
```java
class BLEManager(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
   init {
      Log.d("BLEManager", "Init package")
      BLEManagerLib.shared.config(context)
   }

   override fun getName(): String {
        return "BLEManager"
   }

   @ReactMethod
   fun isBluetoothOn(promise: Promise) {
      promise.resolve(BLEManagerLib.shared.isBluetoothOn())
   }

   @ReactMethod
   fun startScanning() {
      Log.d("BLEManager", "Start scanning")
      BLEManagerLib.shared.startScan {
         val params: WritableMap = Arguments.createMap()
         params.putString("name", it.name)
         params.putInt("rssi", it.rssi)
         params.putString("address", it.address)
         this.reactApplicationContext
                  .getJSModule(RCTDeviceEventEmitter::class.java)
                  .emit("didFoundDevice", params)
      }
   }
}
```

Tạo file mới để định nghĩa `BLEManagerPackage`

```java
class BLEManagerPackage: ReactPackage {
   override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> {
      val modules = ArrayList<NativeModule>()
      modules.add(BLEManager(reactContext))
      return modules
   }

   override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<ViewManager<View, ReactShadowNode<*>>> {
      return ArrayList()
   }
}
```

Tiếp theo, thêm nó vào danh sách package trong `MainApplication.java`
```java
public class MainApplication extends Application implements ReactApplication {
   ...
   @Override
   protected List<ReactPackage> getPackages() {
      Log.d("BLEManager", "Running");
      @SuppressWarnings("UnnecessaryLocalVariable")
      List<ReactPackage> packages = new PackageList(this).getPackages();

      /* Add your custom modules here */
      packages.add(new BLEManagerPackage());
      /* */

      return packages;
   }
   ...
}

Cuối cùng, ứng dụng cần yêu cầu người dùng cấp permission.

```js
// somewhere in your code
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

checkPermission = () => {
   check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
   .then((result) => {
      if (result !== RESULTS.GRANTED) {
         requestLocation(() => {
            // On granted
         }, () => {
            // On denied
         });
      }
   })
   .catch((error) => {
      // …
   });
}

requestLocation = (grantedCallback, deniedCallback) => {
   request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(result => {
   switch (result) {
      case RESULTS.DENIED:
         console.log('User denied permission',);
         deniedCallback();
         break;
      case RESULTS.GRANTED:
         console.log('The permission is granted');
         grantedCallback();
         break;
   }
   });
}
```

## Kết quả
Vì chúng ta sử dụng cùng code cho cả Android và iOS trong phần React Native, không cần sửa đổi code React Native từ tutorial trước. Miễn là bạn tuân theo protocol chúng ta đã định nghĩa, mọi thứ sẽ hoạt động như dự định.

Bằng cách duy trì một protocol nhất quán trên cả hai nền tảng, chúng ta có thể đảm bảo rằng code dễ dàng portable và bất kỳ thay đổi nào được thực hiện trên một nền tảng sẽ không ảnh hưởng đến nền tảng kia. Điều này có thể đơn giản hóa đáng kể quá trình phát triển và giảm rủi ro lỗi hoặc vấn đề tương thích.

![](/Post-Resources/RN-BLE/android_scan_result.png "")

## Kết luận
Sau khi dành vô số giờ nghiên cứu và thử nghiệm, chúng ta cuối cùng đã học được cách tạo thư viện Bluetooth của riêng mình và sử dụng nó trong dự án React Native. Với kiến thức mới này, quá trình thêm các tính năng mới đã trở nên dễ dàng và hiệu quả hơn đáng kể. Chúng ta chỉ cần triển khai logic trong Native Code thay vì phải phát triển phần UI hai lần.

Điều này không chỉ tiết kiệm cho chúng ta một lượng lớn thời gian và công sức mà còn cho phép chúng ta tập trung hơn vào việc nâng cao chức năng của ứng dụng. Giờ đây chúng ta có thể dành nhiều tài nguyên hơn cho việc phát triển các tính năng mới, tối ưu hóa các tính năng hiện có, và cải thiện trải nghiệm người dùng tổng thể.

Hơn nữa, khả năng mới của chúng ta trong việc tạo các thư viện tùy chỉnh đã mở ra một thế giới hoàn toàn mới về khả năng cho đội ngũ phát triển của chúng ta. Giờ đây chúng ta có thể tận dụng kiến thức về React Native để tạo ra các tính năng tiên tiến và sáng tạo hơn nữa, trong khi vẫn duy trì quy trình phát triển được đơn giản hóa.

Chúc viết code vui vẻ!

## Tài liệu tham khảo
- [Android Native Modules](https://reactnative.dev/docs/native-modules-android).
- [Android Bluetooth permissions](https://developer.android.com/guide/topics/connectivity/bluetooth/permissions).
