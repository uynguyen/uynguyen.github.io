---
title: 'Series React Native and BLE: Part 2 - Building BLE framework for Android'
date: 2022-02-13 10:57:24
tags: [BLE, Bluetooth, Android]
---

![](/Post-Resources/RN-BLE/cover2.png "")

iOS and Android are the two primary mobile technology OS (operating systems). When working with Bluetooth, we need support for both platforms. We created a BLE framework in part 1 of this series and connected it to the UI - React Native part. In this tutorial, part 2, we will define a new SDK for Android and link it to the UI as we did on iOS.
<!-- more -->

## Create new Android SDK
The very first step is creating your own Bluetooth library. Normally, engineers tend to use an open-source such as [RxAndroidBle](https://github.com/dariuszseweryn/RxAndroidBle) or [Android-BLE-Library powered by Nordic](https://github.com/NordicSemiconductor/Android-BLE-Library). However, the main goal of this tutorial is to guide you on how to create a new Android module and link it to React Native. It not only applies to Bluetooth but also to any library you need to use in your app. The other goal is to have a foundation knowledge of Android BLE in case you need to modify something or create your own feature which has not been supported in the market.

From your project, go to `File > New > New Module > Fill in the information`. 
A new library will be added to your project.

![](/Post-Resources/RN-BLE/android_import_module.png "")
![](/Post-Resources/RN-BLE/android_new_module.png "")

One major different thing from Android and iOS is that from Android 6.0, Google requires the `Location Permission` to be enabled for Bluetooth Low Energy Scanning (See more [Android 6.0 Changes](https://developer.android.com/about/versions/marshmallow/android-6.0-changes.html#behavior-hardware-id)).

Next, add the following permissions to your `AndroidManifest.xml` at `android/app/src/main/AndroidManifest.xml`

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

For demo purposes, the SDK exposes only 2 simple APIs `startScan` to start scanning nearby devices and `isBluetoothOn` to check if the Bluetooth is turned on.
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

To request permission on React Native, we're going to use this module https://github.com/zoontek/react-native-permissions to get the permissions the app needs.

## Build and release Android SDK module
Next, let's distribute the module so that other applications can use it.
From the root folder, run `./gradlew kTrackingSDK:assembleRelease` to generate an .aar file.
The output file will be located at `./KTrackingSDK/build/outputs/aar`, then you can import the .aar file to the `android` project.

## Connect to React Native part
Now, we've already had the Bluetooth lib. The next step is to link the module to the React Native part.

Firstly, React Native part needs to understand the Native module. Add the following config to your `/src/main/java`
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

Creating new file to define the `BLEManagerPackage`

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

Next, add it to the package list in `MainApplication.java`
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

Finally, the app needs to ask users to grant permission.

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

## Result
As we use the same code for Android and iOS from React Native part, so we don't need to modify the React Native part from the previous tutorial. As long as you follow the same protocol we defined, everything should work as expected.
![](/Post-Resources/RN-BLE/android_scan_result.png "")

## Conclusion
We finally learned how to create your own Bluetooth library and use it on your React Native project. From now on, when adding new features, we only need to implement the logic in Native Code, and no longer have to develop the UI part twice. Is this nice? :)
Happy coding.

## Refs
- [Android Native Modules](https://reactnative.dev/docs/native-modules-android).
- [Android Bluetooth permissions](https://developer.android.com/guide/topics/connectivity/bluetooth/permissions).
