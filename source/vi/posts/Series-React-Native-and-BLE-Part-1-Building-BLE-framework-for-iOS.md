---
title: "Chuỗi bài React Native và BLE: Phần 1 - Xây dựng BLE framework cho iOS"
date: 2021-12-25 18:16:08
tags:
layout: post
lang: vi
---

![](/Post-Resources/RN-BLE/cover1.png "")

Tôi đã làm việc trong lĩnh vực phát triển di động trên cả các dự án native và cross platform (React Native, Flutter), và tôi cũng có kinh nghiệm làm việc với BLE. Đôi khi tôi nhận được email hỏi về việc giao tiếp giữa RN/Flutter và BLE. Vì vậy, tôi quyết định giới thiệu chuỗi bài React Native và BLE này để hướng dẫn bạn cách phát triển một BLE framework native và kết nối nó với React Native.
Tất nhiên, sẽ có một chuỗi bài khác cho Flutter và BLE sau khi hoàn thành chuỗi bài React Native.
Trong chuỗi bài này, tôi sẽ hướng dẫn bạn qua một quy trình hoàn chỉnh từ phát triển đến phân phối.

<!-- more -->

- Tạo iOS / Android framework.
- Script để build và phân phối framework của bạn.
- Import các framework vào dự án React Native của bạn.
- Sử dụng framework native của bạn trong React Native.
- Phân phối ứng dụng của bạn.
- Và những điều thú vị khác tôi muốn chia sẻ với bạn ...

Nếu bạn thích những gì tôi làm, hãy cân nhắc ủng hộ tôi tại [buy a coffee for Uy Nguyen](https://ko-fi.com/uynguyen) :)
Bắt đầu thôi.

> Xcode 13, iOS 15, Swift 5, React 17.0.1, React Native 0.64.1.

### Chuẩn bị iOS framework

Bước đầu tiên là tạo một BLE framework. Bạn cũng không nhất thiết phải tạo framework, bạn có thể include source code của mình trực tiếp bên trong dự án iOS nếu bạn muốn.
Tuy nhiên, lý do tại sao tôi khuyên nên chuyển tất cả logic BLE vào một framework là vì nó có thể tái sử dụng, bạn có thể chia sẻ framework của mình cho các dự án khác như Flutter hoặc các dự án Native mà không cần phải duplicate logic.
Một lý do khác là nó sẽ cải thiện thời gian compile của Xcode, chia ứng dụng của bạn thành nhiều framework có thể tăng tốc thời gian build. Điều này là do hệ thống build Xcode không cần phải recompile các framework mà các file Swift không thay đổi.

Từ thanh trên cùng bên trái của Xcode, chọn `File > New > Project > From the "Framework & Library" section, select "Framework" > Enter your framework name (I use "BLEFramework")`

![](/Post-Resources/RN-BLE/ios_create_project.png "")

Bây giờ, bạn có thể phát triển logic BLE của mình trong dự án bạn vừa tạo. Tôi sẽ không chi tiết việc triển khai tất cả các method đơn lẻ của framework vì nó phụ thuộc vào logic kinh doanh và kiến trúc của bạn. Bạn có thể tìm các tutorial trước đây của tôi để có ý tưởng về cách triển khai BLE framework. [Bluetooth Low Energy OniOS](/2017/10/13/Bluetooth-Low-Energy-On-iOS/), [Play Central And Peripheral Roles With CoreBluetooth](/2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/)
Tôi sẽ lấy một method đơn giản trong BLE framework của tôi làm ví dụ: method `startScanning`.

```swift
/**
Class: CentralManager
*/

/**
* @discussion Start scanning nearby peripherals and returns to the `ScanningDelegate`
*/
public func startScanningFor(delegate: ScanningDelegate, filter: DeviceFilter = DeviceFilter()) throws {
    //... BLE implementation.
}
```

OK bây giờ chúng ta có một BLE framework, hãy chuyển sang bước tiếp theo: Build và phân phối framework của bạn.

### Build và phân phối

Có nhiều cách để phân phối framework như sử dụng [CocoaPod](/2017/09/25/Create-and-Distribute-Private-Libraries-with-Cocoapods), hoặc thủ công bằng cách gửi file đã compiled, v.v. Trong bài viết này, tôi sẽ cung cấp cho bạn một script để biến framework của bạn thành một universal framework ẩn tất cả logic của bạn, và có thể được sử dụng cho cả thiết bị vật lý và simulator.

Đảm bảo bạn bật cờ "Build Libraries for Distribution" trong "Build Settings" thành `YES`. Cờ này chỉ ra rằng compiler nên tạo một trong những interface ổn định để framework có thể được sử dụng khi các phiên bản mới hơn của Xcode hoặc Swift compiler được phát hành.

![](/Post-Resources/RN-BLE/ios_build_distribution.png "")

Tiếp theo, tạo một file bash, đặt nó ở root của thư mục ios, và copy các lệnh sau vào file. Sau đó thực thi script.

```bash
### SCRIPT TO BUILD A SWIFT UNIVERSAL FRAMEWORK

PRODUCT_NAME="REPLACE_BY_YOUR_TARGET_NAME"
BUILD_CONFIGURATION="Release"
DERIVED_DATA_PATH="$(pwd)/build"
RELEASE_DIR="$(pwd)/RELEASE"
BUILD_SCHEME="${PRODUCT_NAME}"
FRAMEWORK_NAME="${PRODUCT_NAME}.framework"

RELEASE_DEVICE_PATH="${RELEASE_DIR}/device/${FRAMEWORK_NAME}"
RELEASE_SIMULATOR_PATH="${RELEASE_DIR}/simulator/${FRAMEWORK_NAME}"

rm -rf "${DERIVED_DATA_PATH}"
rm -rf "${RELEASE_DIR}"

mkdir -p "${DERIVED_DATA_PATH}"
mkdir -p "${RELEASE_DIR}"
mkdir -p "${RELEASE_DIR}/simulator"
mkdir -p "${RELEASE_DIR}/device"

# Build library for simulator
fastlane ios build  scheme:"${BUILD_SCHEME}" \
					configuration:"${BUILD_CONFIGURATION}" \
					sdk:iphonesimulator \
					build_dir:"${DERIVED_DATA_PATH}" \
					--verbose

SIMULATOR_FRAMEWORK_PATH="${DERIVED_DATA_PATH}/Build/Products/${BUILD_CONFIGURATION}-iphonesimulator/${FRAMEWORK_NAME}"
mv "${SIMULATOR_FRAMEWORK_PATH}" "${RELEASE_SIMULATOR_PATH}"

# Build library for iphoneos
fastlane ios build  scheme:"${BUILD_SCHEME}" \
					configuration:"${BUILD_CONFIGURATION}" \
					sdk:iphoneos \
					build_dir:"$DERIVED_DATA_PATH" \
					--verbose

DEVICE_FRAMEWORK_PATH="${DERIVED_DATA_PATH}/Build/Products/${BUILD_CONFIGURATION}-iphoneos/${FRAMEWORK_NAME}"
mv "${DEVICE_FRAMEWORK_PATH}" "${RELEASE_DEVICE_PATH}"

# Merge SDKs
xcodebuild -create-xcframework -output "${RELEASE_DIR}/${PRODUCT_NAME}.xcframework" \
  -framework "${RELEASE_DEVICE_PATH}" \
  -framework "${RELEASE_SIMULATOR_PATH}"

open "${RELEASE_DIR}"
```

Khi bạn chạy script thành công, bạn sẽ thấy kết quả như bên dưới

![](/Post-Resources/RN-BLE/ios_build_result.png "")

Trong đó:

- `YOUR_TARGET_NAME.xcframework`: Universal framework có thể được sử dụng cho cả thiết bị vật lý và simulator.
- thư mục device: chứa `YOUR_TARGET_NAME.framework` chỉ có thể được sử dụng trên thiết bị vật lý.
- thư mục simulator: chứa `YOUR_TARGET_NAME.framework` chỉ có thể được sử dụng trên simulator.

Bây giờ chúng ta có một BLE framework cho ứng dụng của mình, hãy chuyển sang bước tiếp theo - Tạo một dự án React Native mới.

### Khởi tạo dự án React Native

Để tạo một dự án React Native mà không sử dụng Expo (tôi khuyên không nên sử dụng Expo vì chúng ta sẽ thêm nhiều Native code cho Android và iOS vào dự án của mình, để biết thêm chi tiết bạn có thể tham khảo [what is the difference between expo and react native](https://stackoverflow.com/questions/39170622/what-is-the-difference-between-expo-and-react-native)), mở terminal và gõ

```
react-native init projectName
```

Đợi một lúc để thiết lập dự án của bạn. Sau khi chạy thành công, bạn sẽ thấy cấu trúc thư mục như bên dưới:

```
|---projectName
    |---ios
        |---projectName.xcworkspace
    |---android
    |---...Other files, folders
```

Mở file `projectName.xcworkspace`, chúng ta sẽ cấu hình native code trong bước tiếp theo.

### Kết nối chúng lại với nhau
Đầu tiên, kéo và thả `YOUR_TARGET_NAME.xcframework` vào Xcode workspace của bạn.
Vì SDK của tôi được build bằng Swift, tôi sẽ tạo một class Swift làm cầu nối để chúng ta có thể giao tiếp từ SDK đến React Native.
Từ dự án Xcode, chọn `File > New > File > Swift File > Enter your file name (e.g BLEManager) > Add`. Một hộp thoại sẽ xuất hiện hỏi bạn có muốn tạo bridging header không, chọn yes.

> Đối với những ai không biết bridging header được sử dụng để làm gì, bridging header là nơi bạn định nghĩa tất cả các class Objective-C được expose cho Swift.

![](/Post-Resources/RN-BLE/bridging-header.png "")

Để sử dụng các class RCT, đảm bảo bạn `#import` tất cả các header liên quan vào `...-Bridging-Header.h` của bạn. Nếu không, bạn sẽ gặp lỗi compile.

```swift
#import <React/RCTBridgeModule.h>
#import "React/RCTEventEmitter.h"
#import "React/RCTViewManager.h"
#import <React/RCTLog.h>
```

Tiếp theo, thêm interface `RCTEventEmitter` vào class `BLEManager` chúng ta vừa tạo ở bước trước.

```swift
@objc(BLEManager) <--- Remember to add this [1]
public class BLEManager: RCTEventEmitter, ScanningDelegate {
  static let didFoundDeviceEvent = "didFoundDevice"

  @objc <--- Remember to add this
  public static let shared = BLEManager()

  override init() {
    super.init()
    _ = BLEWrapper.shared
  }

  @objc(startScanning) <--- Remember to add this
  func startScanning() {
    BLEWrapper.shared.startScanning(self)
  }

  public func managerDidFoundDevice(_ manager: CentralManager, device: Device, rssi: Int) {
    self.sendEvent(withName: Self.didFoundDeviceEvent, body: ["name": device.localName, "rssi": rssi]) [2]
  }

  public override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override public func supportedEvents() -> [String]! {
    return [Self.didFoundDeviceEvent] [3]
  }
}
```

[1] Đảm bảo bạn decorate class và function của mình bằng keyword `@objc` để đảm bảo class và function được export đúng cách sang Objective-C runtime.
[2] Khi một peripheral được phát hiện, gửi một event đến Javascript.
[3] Đăng ký hỗ trợ event từ native module.

Cuối cùng, để expose các method của native module của bạn, tạo một file mới `BLEManager.m` và thêm code sau.

```swift
@interface RCT_EXTERN_MODULE(BLEManager, RCTViewManager)

RCT_EXTERN_METHOD(startScanning)

@end
```

Vậy là xong. Javascript bây giờ có thể gọi function `startScanning` và lắng nghe event `didFoundDeviceEvent`.

### Kiểm thử
Đã đến lúc kiểm tra triển khai của chúng ta, React Native cung cấp các instance `NativeEventEmitter` và `NativeModules` cho phép bạn làm việc với các native module.
từ thư mục root, mở `App.js` và import các thứ cần thiết.

```swift
import {
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
const {BLEManager} = NativeModules; <-- You can then access the BLEManager native module
```

Trong method `componentDidMount`, thêm code sau vào đó

```swift
componentDidMount() {
    let beaconManagerEmitter = new NativeEventEmitter(BLEManager); [1]
    this.didFoundDevice = beaconManagerEmitter.addListener( [2]
        'didFoundDevice',
        data => {
        console.log(data);
        },
    );
    setTimeout(() => {
        BLEManager.startScanning(); [3]
    }, 3000); // Just to make sure the Bluetooth is on, we will improve it later
}
```

[1] Tạo một instance NativeEventEmitter mới và lắng nghe event `didFoundDevice` [2]
[3] Vì chúng ta chưa hỗ trợ event thay đổi trạng thái Bluetooth, nên chúng ta tạm thời delay 3s trước khi gọi scanning chỉ để đảm bảo Bluetooth đang bật. Chúng ta sẽ cải thiện nó sau bằng cách hỗ trợ thêm các event và method.

OK, hãy build và chạy dự án của bạn. Nếu bạn thấy console log in ra kết quả từ quá trình scanning, xin chúc mừng, bạn đã làm đúng!
![](/Post-Resources/RN-BLE/Scan-Result.png "")

### Bước tiếp theo
Trong bài viết này, tôi đã chỉ cho bạn cách tạo một BLE framework và cách sử dụng một BLE native module trong dự án React Native như gọi một method từ Javascript đến Swift và xử lý một event từ Swift đến Javascript. Trong tutorial tiếp theo, chúng ta sẽ làm điều tương tự trên nền tảng Android.
Nếu bạn gặp bất kỳ khó khăn nào, hãy liên hệ với tôi. Tôi rất vui lòng giúp đỡ.
Chúc ngày nghỉ vui vẻ.

### Tài liệu tham khảo
[1] [React Native - Native module ios](https://reactnative.dev/docs/native-modules-ios)
