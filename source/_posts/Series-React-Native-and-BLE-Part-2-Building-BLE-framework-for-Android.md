---
title: 'Series React Native and BLE: Part 2 - Building BLE framework for Android'
date: 2022-02-13 10:57:24
tags: [BLE, Bluetooth, Android]
---

![](/Post-Resources/RN-BLE/cover2.png "")

When it comes to mobile technology, iOS and Android are the two dominant operating systems that power the majority of smartphones and tablets worldwide. As developers, it is essential that we have the knowledge and tools to work with both platforms effectively. This is especially true when it comes to utilizing Bluetooth technology, which is a crucial component of many modern mobile applications.
In part 1 of this tutorial series, we created a BLE (Bluetooth Low Energy) framework that could be connected to the UI using React Native. However, this framework only worked on iOS, which meant that we needed to develop a separate solution for Android.
In part 2 of this tutorial series, we will be focusing on defining a new SDK for Android and linking it to the UI, just as we did on iOS. This will allow us to fully support both operating systems and provide a seamless Bluetooth experience for all users, regardless of their device of choice.
<!-- more -->

## Create new Android SDK
The very first step is to create your own Bluetooth library. Normally, engineers tend to use an open-source library such as [RxAndroidBle](https://github.com/dariuszseweryn/RxAndroidBle) or [Android-BLE-Library powered by Nordic](https://github.com/NordicSemiconductor/Android-BLE-Library). However, the main goal of this tutorial is to guide you on how to create a new Android module and link it to React Native. This not only applies to Bluetooth but also to any library that you need to use in your app. The other goal is to gain foundational knowledge of Android BLE in case you need to modify something or create your own feature that has not been supported in the market.

By creating your own Bluetooth library, you have the freedom to customize and tailor the library to your specific needs. This can provide significant advantages over using pre-existing libraries, as you can optimize the library for your particular use case and avoid potential compatibility issues.

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
Since we use the same code for both Android and iOS in the React Native part, there is no need to modify the React Native code from the previous tutorial. As long as you follow to the protocol we defined, everything should function as intended.

By maintaining a consistent protocol across both platforms, we can ensure that the code is easily portable and that any changes made to one platform will not affect the other. This can significantly streamline the development process and reduce the risk of errors or compatibility issues.

![](/Post-Resources/RN-BLE/android_scan_result.png "")

## Conclusion
After spending countless hours researching and experimenting, we have finally learned how to create our own Bluetooth library and use it in our React Native project. With this newfound knowledge, the process of adding new features has become significantly easier and more efficient. We only need to implement the logic in Native Code instead of having to develop the UI part twice.

This has not only saved us a tremendous amount of time and effort but also allowed us to focus more on enhancing the functionality of our app. We can now dedicate more resources to developing new features, optimizing existing ones, and improving the overall user experience.

Moreover, our newfound ability to create custom libraries has opened up a whole new world of possibilities for our development team. We can now leverage our knowledge of React Native to create even more advanced and innovative features, all while maintaining a streamlined development process.

Happy coding!

## Refs
- [Android Native Modules](https://reactnative.dev/docs/native-modules-android).
- [Android Bluetooth permissions](https://developer.android.com/guide/topics/connectivity/bluetooth/permissions).
