---
title: 'Best practice: How to deal with Bluetooth Low Energy in background'
date: 2018-07-23 18:26:27
tags: [iOS, BLE]
ping: true
---
## Preface
When working with CoreBluetooth, have you ever wondered how a BLE app on iOS can survive when it is terminated by the system? How can we bring it back to the background? Is there anything like an Android service that can run indefinitely? You can find the answer to all these questions in this post. Read on!
![](/Post-Resources/BackgroundProcessing/Cover.png "")
<!-- more --> 
## Application life cycle on iOS
Before gaining a deeper understanding of how we can keep our app alive in the background, it helps to start with the iOS application life cycle.
As you may know, every iOS app has five main states.
![](/Post-Resources/BackgroundProcessing/iOS_App_LifeCycle.png "iOS app life cycle")
*Not running* — The app has not been launched, or was running but was terminated by the system or the user.
*Inactive* — The transitional state the app enters before moving to another state.
*Active* — The app is running in the foreground and receiving user events.
*Background* — The app is in the background and invisible to the user. An app that requests extra execution time may remain in this state for a period of time. Note that an app transitions through the inactive state before entering background mode.
*Suspended* — The app is in the background and is not allowed to execute any code. The system moves the app to this state automatically, and the app will not receive any events. When foreground apps need more memory, the system may terminate suspended apps to free up space. We cannot predict when a suspended app will be terminated. After termination, the app returns to the not running state.

<center>

![](/Post-Resources/BackgroundProcessing/AppCycle.gif "iOS app life cycle example")

</center>

## BLE issues with the application life cycle
As mentioned, when the app enters the background, it may be terminated by the system if it needs to reclaim resources for other applications. Unlike Android, where we can restart a service to keep the app alive after a system kill, on iOS there is no way to bring the app back once the system has terminated it. As a result, any Bluetooth events dispatched from a device will never reach the app. This means your app could miss indications triggered by users — for example, playing a music track when they press a physical button on a BLE device.

Apple describes this problem with an example called the ["Smart door"](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/CoreBluetoothBackgroundProcessingForIOSApps/PerformingTasksWhileYourAppIsInTheBackground.html#//apple_ref/doc/uid/TP40013257-CH7-SW10). The idea is an app that automatically locks and unlocks a door as the user leaves and returns home. The core challenge is maintaining the connection between the phone and the door lock while the user goes about their day — opening and closing apps, toggling Bluetooth, entering Airplane Mode, rebooting the phone, and so on. Any of these actions can cause our app to be killed by the system permanently. If that happens, the app will not be able to reconnect to the lock when the user comes home.

<center>

![](/Post-Resources/BackgroundProcessing/SmartDoor.jpg "Smart door")

</center>

To address this, Apple provides *State Preservation and Restoration* (CoreBluetooth background processing). This is built into CoreBluetooth and allows our app to be relaunched into the background when it is terminated by the system.

In essence, iOS takes a snapshot of all the Bluetooth-related objects that were active in our app. If a Bluetooth event related to those objects subsequently arrives at the phone, the system will wake our app from a terminated state. That is a powerful capability.

## Implement State Preservation and Restoration

To demonstrate this technique, I will reuse the source code from the previous post [Play Central And Peripheral Roles With CoreBluetooth](/2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/) and add the code needed to enable background restoration.

First, I set my iPad to act as a Peripheral with UUID "1FA2FD8A-17E0-4D3B-AF45-305DA6130E39", generated via the `uuidgen` command on Mac. I make it start advertising with the local name "iPad". When a connection is established by a central manager, in/out logs are printed so we can confirm the connection succeeded.

<center>

![](/Post-Resources/BackgroundProcessing/Peripheral.gif "iPad acts as a peripheral")

</center>

When the "Send Notify" button is tapped, the app notifies a data string "Say something cool!" via characteristic "463FED21-DA93-45E7-B00F-B5CD99775150", which is defined as an encrypted notifiable characteristic, to the connected central manager.

Next, go back to the Central Manager app and set a Restore Identifier for the `CBCentralManager` object — I used the string "YourUniqueIdentifierKey". This tells CoreBluetooth to preserve this manager when the app is terminated. Then implement the `willRestoreState` delegate:

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
When `centralManager(_:willRestoreState:)` is called, I play a sound and show a local notification with the name of the restored peripheral, confirming the app was woken by the system. The `dict` parameter contains a full snapshot of the Bluetooth state. Using the `CBCentralManagerRestoredStatePeripheralsKey` key, we get an array of `CBPeripheral` objects that were connected or pending connection when the app was terminated. I iterate through them, find the peripheral I care about, and restore it to the `connectedDevice` variable so I can receive updates from it again.

I also add local notifications at `appDidFinishLaunching` and `peripheral(_:didUpdateValueFor:characteristic:)` for testing:

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
Time to run the experiment. I use two methods to simulate background termination by the system.

**Method 1 — using Xcode:**
- Run the app from Xcode.
- Stop it by pressing the "Stop" button.
- Restart it from Xcode.

**Method 2 — using the hardware:**
- Press the Home button to move the app to the background.
- Long-press the power button until "slide to power off" appears.
- Release the power button, then long-press the Home button for about 5 seconds until the home screen reappears.

In the demo below, I use both methods. Watch what happens!

<center>

![](/Post-Resources/BackgroundProcessing/Restoration.gif "Demo")

</center>

Here is the log printed from Xcode.

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

I connected to the iPad, then simulated termination via Xcode (relaunching from Xcode), and confirmed that `centralManager(_:willRestoreState:)` was triggered as shown by the popup. Then I simulated termination using Method 2 — once the home screen appeared, the app was definitely gone. I then pressed "Send Notify" on the iPad (acting as Peripheral) to send a BLE event. Immediately, `centralManager(_:willRestoreState:)` was called, a local notification appeared, and then a second one showed the BLE data received from the peripheral — the "Say something cool!" string. It works. The app can survive termination.

There is one interesting observation: with Method 1 (Xcode restart), the `launchOptions` parameter in `application(_:didFinishLaunchingWithOptions:)` is always nil. With Method 2, we can extract `UIApplicationLaunchOptionsKey.bluetoothCentrals` from it (the value returns "YourUniqueIdentifierKey"). Method 2 is the more accurate simulation because it matches the Apple documentation: *"When your app is relaunched by the system, you can retrieve all the restoration identifiers for the central manager objects the system was preserving for your app."*

In `application(_:didFinishLaunchingWithOptions:)`, use `UIApplicationLaunchOptionsBluetoothCentralsKey` to retrieve an array of UUIDs representing all `CBCentralManager` objects that Core Bluetooth was preserving. Loop through them and find the one that matches your Restoration Identifier to reinitialize your manager.

## Limitations
### When the user force-quits the app from the app switcher
If the user force-quits the app from the app switcher, there is no chance for the app to be woken up via state restoration. However, there is another technology we can use to bring the app back to the background: **iBeacon**. In the next post, I will walk through how to implement it.

### When the user reboots the phone
If the user reboots the phone, the app will be terminated permanently. We can address this by leveraging CoreLocation. I will cover that in the next part.

## Final thoughts

In this post, we walked through the iOS app life cycle and explored how to keep a BLE app alive even after it has been terminated by the system. The content here comes directly from real working experience.

Hope you find this post useful.
