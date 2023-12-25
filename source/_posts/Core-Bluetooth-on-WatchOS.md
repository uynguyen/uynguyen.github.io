---
title: Core Bluetooth on WatchOS
tags: [WatchOS, BLE]
---

![](/Post-Resources/watchos/banner.png "WatchOS banner")
Ever thought about adding a Watch App to your product? Wondering how to make CoreBluetooth work on your Watch App? You're in the right place! This tutorial is your go-to guide. In this post, we'll take you step by step through the process of smoothly bringing in data from Bluetooth gadgets into your Apple Watch apps.

<!-- more -->

Learn how to tap into the power of Bluetooth devices to boost your Apple Watch user experience. We'll also share some tips on common hiccups you might face while handling Core Bluetooth on watchOS. Whether you're a seasoned pro or just starting out, this tutorial breaks it down for you. Let's make sure your Watch App not only does the trick but also impresses your users.

**_Environments: XCode 15.0.1, iOS 17.0.3, WatchOS 10.1.1, Swift 5._**

## Set up project
Start by going to your project settings, then select `File` > `New Target` > `Watch OS` > `App`, and fill in the required fields. Once done, Xcode will seamlessly integrate a new watch app project into your existing workspace.

## Bluetooth config
Essentially, all methods and Bluetooth events on WatchOS closely resemble those on iOS. If you already have a `BluetoothManager` class that handles various Bluetooth functions, such as initiating scanning or connecting to a peripheral, and manages Bluetooth delegates, you're in good shape.

```swift
class BluetoothManager : NSObject, CBCentralManagerDelegate {
    private var central: CBCentralManager!
    
    override init() {
        super.init()
        central = CBCentralManager(
            delegate: self,
            queue: nil,
            options: [:]
        )
    }
    
    func startScanning() {
        central.scanForPeripherals(withServices: nil, options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
    }
    
    func connect(periperal: CBPeripheral) {
        central.connect(periperal)
    }
    // The rest omitted
}
```

To save time and avoid duplicating code, you can easily share the file containing the `BluetoothManager` class with both your iOS and watch app targets. With this setup, you can seamlessly use the `BluetoothManager` class in your watch app just like you would in your iOS app.

```swift
struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hello, world!")
        }
        .padding()
        .onAppear(perform: {
            BluetoothManager.shared.startScanning()
        })
    }
}
```

## Important notes
- To test your project's Bluetooth functionality, it's essential to run it on a real Apple Watch since the simulator doesn't support Bluetooth.
- Keep in mind that the connection time on the Apple Watch can be influenced by the device's battery status, even if low power mode is not enabled.
- Ensure that you manually add the necessary capability to the Watch App plist file. This step is crucial; otherwise, your app won't be able to scan, connect, or execute any Bluetooth commands when it's in the background.

```
<key>UIBackgroundModes</key>
<array>
    <string>bluetooth-central</string>
</array>
```

- Unlike Bluetooth on iOS, where you can leverage State preservation and restoration to awaken the app if it has been terminated by the system due to Bluetooth events (see Best practice: [Best practice: How to deal with Bluetooth Low Energy in background](/2018/07/23/Best-practice-How-to-deal-with-Bluetooth-Low-Energy-in-background/)), it's important to note that there is no equivalent State preservation and restoration mechanism on watchOS.
![](/Post-Resources/watchos/state_preservation.png "State Preservation & Restoration")

## References

[1] [WWDC 2021](https://developer.apple.com/videos/play/wwdc2021/10005)
[2] [WWDC 2022](https://developer.apple.com/videos/play/wwdc2022/10135/)
[3] [Core Bluetooth in watchOS Tutorial](https://www.kodeco.com/336-core-bluetooth-in-watchos-tutorial)
