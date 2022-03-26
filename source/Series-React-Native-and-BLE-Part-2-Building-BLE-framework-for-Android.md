---
title: 'Series React Native and BLE: Part 2 - Building BLE framework for Android'
date: 2022-02-13 10:57:24
tags:
---

![](/Post-Resources/RN-BLE/cover2.png "")

In part 1 of this series, we created a BLE framework and connected it to the UI - React Native part. In this tutorial, part 2, we will a new SDK for Android and link it to the UI as iOS.
<!-- more -->

One major different thing from Android and iOS is that from Android 6.0, Google requires Location Permission to be enabled for Bluetooth Low Energy Scanning [Android 6.0 Changes](https://developer.android.com/about/versions/marshmallow/android-6.0-changes.html#behavior-hardware-id)

Add the following permissions to your `AndroidManifest.xml` at `android/app/src/main/AndroidManifest.xml`

```java
   <uses-permission android:name="android.permission.BLUETOOTH" />
   <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

We're going to use this module https://github.com/zoontek/react-native-permissions to request location permission on Android.


## BUILD
From the root folder, run `./gradlew kTrackingSDK:assembleRelease` to generate an .aar file.
The output file will be located at `./KTrackingSDK/build/outputs/aar`

Define the module

```js
// somewhere in your code
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

checkPermission = () => {
   check(PERMISSIONS.IOS.LOCATION_ALWAYS)
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

MainApplication.java
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
```


Refs
- Android Native Modules https://reactnative.dev/docs/native-modules-android
