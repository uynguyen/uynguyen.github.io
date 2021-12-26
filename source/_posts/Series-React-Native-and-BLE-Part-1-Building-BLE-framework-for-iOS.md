---
title: "Series React Native and BLE: Part 1 - Building BLE framework for iOS"
date: 2021-12-25 18:16:08
tags:
---

![](/Post-Resources/RN-BLE/cover1.png "")

I have been working in mobile development on both native projects and cross platforms (React Native, Flutter), and I also have experience working on BLE. Sometimes I get emails asking about the communication of RN/Flutter to BLE. Thus, I decided to introduce this series React Native and BLE to guide you on how to develop a native BLE framework and connect it to React Native.
Of course, there will be another series for Flutter and BLE after finishing the series of React Native.
In this series, I will guide you through a completed process from development to distribution.

<!-- more -->

- Create an iOS / Android framework.
- Script to build and distribute your framework.
- Import the frameworks to your React Native project.
- Use your native framework in React Native.
- Distribute your app.
- And other cool stuff I want to share with you ...

If you love what I do, consider supporting me at [buy a coffee for Uy Nguyen](https://ko-fi.com/uynguyen) :)
Let's go.

> Xcode 13, iOS 15, Swift 5, React 17.0.1, React Native 0.64.1.

### Prepare iOS framework

The first step is creating a BLE framework. You definitely don't have to create a framework, you can include your source code inside the iOS project directly if you want to.
However, the reason why I recommend moving all BLE logic to a framework is that it’s reusable, you can share your framework to other projects such as Flutter or Native projects without having to duplicate the logic.
Another reason is that it will improve the compile time of Xcode, breaking your app into several frameworks can speed up the build times. This is because the Xcode build system doesn’t have to recompile frameworks for which Swift files have not changed.

From the top left bar of Xcode, select `File > New > Project > From the "Framework & Library" section, select "Framework" > Enter your framework name (I use "BLEFramework")`

![](/Post-Resources/RN-BLE/ios_create_project.png "")

Now, you can develop your BLE logic in the project you just created. I'm not going to detail implementing all single methods of the framework as it depends on your business logic and your architecture. You can find my previous tutorials to have an idea of how to implement a BLE framework. [Bluetooth Low Energy OniOS](/2017/10/13/Bluetooth-Low-Energy-On-iOS/), [Play Central And Peripheral Roles With CoreBluetooth](2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/)
I will take a simple method in my BLE framework as an example: the `startScanning` method.

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

OK now we have a BLE framework, let move to the next step: Building and distributing your framework.

### Building and distributing

There are many ways to distribute a framework like using [CocoaPod](/2017/09/25/Create-and-Distribute-Private-Libraries-with-Cocoapods), or manually by sending a complied file, etc. In this post, I will provide you with a script to turn your framework into a universal framework that hides all your logic, and can be used for both physical devices and simulators.

Make sure you turn "Build Libraries for Distribution" flag in the "Build Settings" to `YES`. The flag indicates that the compiler should generate one of the stable interfaces so the framework can be used when newer versions of Xcode or the Swift compiler are released.

![](/Post-Resources/RN-BLE/ios_build_distribution.png "")

Next, create a bash file, put it in the root of the ios folder, and copy the following commands to the file. Then execute the script.

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

Once you run the script successfully, you should see the result as below

![](/Post-Resources/RN-BLE/ios_build_result.png "")

In which:

- `YOUR_TARGET_NAME.xcframework`: The universal framework can be used for both physical devices and simulators.
- device folder: contains `YOUR_TARGET_NAME.framework` which can be used only on physical devices.
- simulator folder: contains `YOUR_TARGET_NAME.framework` which can be used only on simulators.

Now we have a BLE framework for our application, let's move to the next step - Create a new React Native project.

### Init React Native project

To create a React Native project without using Expo (I recommend to not using Expo because we're going to add a lot of Native code for Android and iOS to our project, for more details you can refer to [what is the difference between expo and react native](https://stackoverflow.com/questions/39170622/what-is-the-difference-between-expo-and-react-native)), open terminal and type

```
react-native init projectName
```

Wait a while to set up your project. After running successfully, you should see the folder structure as below:

```
|---projectName
    |---ios
        |---projectName.xcworkspace
    |---android
    |---...Other files, folders
```

Open the `projectName.xcworkspace` file, we will config the native code in the next step.

### Wire them together
First, drag and drop the `YOUR_TARGET_NAME.xcframework` to your Xcode workspace.
As my SDK is built in Swift, I'm going to create a Swift class as a bridge so that we can communicate from the SDK to React Native.
From Xcode project, select `File > New > File > Swift File > Enter your file name (e.g BLEManager) > Add`. A dialog will pop up to ask if you want to create a bridging header, select yes.

> For those who don't know what the bridging header is used for, the bridging header is where you define all the Objective-C classes that are exposed to Swift.

![](/Post-Resources/RN-BLE/bridging-header.png "")

To use RCT classes, make sure you `#import` all related headers to your `...-Bridging-Header.h`. Otherwise, you will get complied errors.

```swift
#import <React/RCTBridgeModule.h>
#import "React/RCTEventEmitter.h"
#import "React/RCTViewManager.h"
#import <React/RCTLog.h>
```

Next, add the interface `RCTEventEmitter` to the class `BLEManager` we just created in the previous step.

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

[1]. make sure you decorate your class and functions by the `@objc` keyword to ensure the class and functions are exported properly to the Objective-C runtime.
[2]. Once a peripheral is discovered, send an event to Javascript.
[3]. Register supported the event from the native module.

Finally, to expose the methods of your native module, create a new file `BLEManager.m` and add the following code.

```swift
@interface RCT_EXTERN_MODULE(BLEManager, RCTViewManager)

RCT_EXTERN_METHOD(startScanning)

@end
```

That's all. Javacsript now can invoke the `startScanning` function and listen to the `didFoundDeviceEvent` event.

### Testing
It's time to test our implementation, React Native provides `NativeEventEmitter` and `NativeModules` instances that allow you to work with native modules.
from the root folder, open `App.js` and import the necessary things. 

```swift
import {
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
const {BLEManager} = NativeModules; <-- You can then access the BLEManager native module 
```

In `componentDidMount` method, add the following to it

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

[1] Create a new NativeEventEmitter instance and listen to the `didFoundDevice` event [2]
[3] Because we do not support the Bluetooth state changes event, so we temporarily delay 3s before calling scanning just to make sure the Bluetooth is on. We will improve it later by supporting more events and methods.

OK, let's build and run your project. If you see your console log print the results from the scanning process, congratulation, you make it right!
![](/Post-Resources/RN-BLE/Scan-Result.png "")

### Next step
In this post, I showed you how to create a BLE framework and how to use a BLE native module in a React Native project such as invoking a method from Javascript to Swift and handling an event from Swift to Javascript. In the next tutorial, we will do the same on Android platform.
If you face any troubles, feel free to contact me. I would love to help.
Happy holiday.

### Refs
[1] [React Native - Native module ios](https://reactnative.dev/docs/native-modules-ios)
