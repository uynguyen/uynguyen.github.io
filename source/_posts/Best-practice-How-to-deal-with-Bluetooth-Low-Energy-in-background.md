---
title: 'Best practice: How to deal with Bluetooth Low Energy in background'
date: 2018-07-23 18:26:27
tags: [iOS, BLE]
---
## Preface
When working with CoreBluetooth, have you ever concerned that how the BLE app on iOS can survive when it is terminated by the system? How can we bring it back to the background? Is there anything like a service on Android that can last forever? You can find the answer to all these questions in this post. Read on!
![](/Post-Resources/BackgroundProcessing/Cover.png "")
<!-- more --> 
## Application life cycle on iOS
Before getting a deep understanding of how we can survive our app in the background, it’s good to start with the application life-cycle on iOS.
As you might know, there are five main states of every iOS app.
![](/Post-Resources/BackgroundProcessing/iOS_App_LifeCycle.png "iOS app life cycle")
*Not running* The app either has not been launched or was running but was terminated by the system or the user.
*Inactive* It is the initial state before the app actually transitions to a different state.
*Active* The app is running in the foreground and receiving events from the user.
*Background* The app is in the background and be invisible to the user. However, an app that requests extra execution time may remain in this state for a period of time. In addition, the app will transit into the inactive state before entering into the background mode.
*Suspended* The app is in the background but it does not allow to execute any code. The app is moved to this state automatically by the system and it will not receive any events before the system does so. When the foreground apps need more memory, the system may terminate the suspended apps to make more space for the foreground apps. Note that we can not predict when the suspended app will be terminated by the system. After being terminated, the app returns to the not running state.
![](/Post-Resources/BackgroundProcessing/AppCycle.gif "iOS app life cycle eaxmple")

## BLE issues with the application life cycle
As mentioned, when the app enters to the background, the app might be terminated by the system if it need evict resources for other applications. Unlike Android OS, after being killed by the system, we can re-start a service to keep your app alive. On iOS, once the app is terminated by the system, there is no way to bring it back to the background. As a result, any Bluetooth events that dispatch from the device will never come to the app. It means your app might miss the indications that are triggered by users, such as play a track of music on their phone when pressing physical buttons from a BLE device.

Apple gives out an example called ["Smart door"](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/CoreBluetoothBackgroundProcessingForIOSApps/PerformingTasksWhileYourAppIsInTheBackground.html#//apple_ref/doc/uid/TP40013257-CH7-SW10). The main idea of this example is to have an automatic interaction between the app and the lock of the door. Imagine we’re developing an application that can automatically lock and unlock the door when the user goes in and go out their home, respectively. However, the main problem of this implementation is to keep the connection between the two, the phone and the lock of the door. While using their phone, users do a variety of actions on the phone: open / close applications, toggle the Bluetooth setting, enter the airplane mode, reboot the phone, etc. These interactions can lead to our app is killed by the system, forever. In this case, the app will not be able to reconnect to the lock when the user returns home, and the user may not be able to unlock the door.

![](/Post-Resources/BackgroundProcessing/SmartDoor.jpg "Smart door")

To deal with this issue, Apple provides a method called *State Preservation and Restoration* (CoreBluetooth background processing). *State Preservation and Restoration* is built-in to CoreBluetooth that allows our app can be relaunched into the background when it's terminated by the system.
At the bottom line, iOS takes a snapshot of all the Bluetooth-related objects that were going on in our app. Subsequently, if there is any Bluetooth event which related to the Bluetooth-related objects our app were interacting with comes to the phone, our app will be waked up from the grave. That's amazing!

## Implement State Preservation and Restoration

To demonstrate State Preservation and Restoration technique on iOS, I'm going to reuse the source code from the previous post [Play Central And Peripheral Roles With CoreBluetooth](/2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/) but we'll add some more code to the projects to make it become magical.
First, I set my iPad act as a Peripheral with a uuid "1FA2FD8A-17E0-4D3B-AF45-305DA6130E39", which is generated via `uuidgen` command on Mac. Then, make it start advertising with local name "iPad". If there is a connection established by a central manager, the in/out logs will print so we know whether the connection is made successfully.
![](/Post-Resources/BackgroundProcessing/Peripheral.gif "iPad acts as a peripheral")

When the "Send Notify" button is touched, the app will notify a data string "Say something cool!" via the "463FED21-DA93-45E7-B00F-B5CD99775150" that is defined as an encrypted notifiable characteristic of the app to the connected central manager.

The next thing we need to do is go back to the Central Manager app and create a Restore Identifier for the CBCentralManager objects to be taken over by the operating system when the application is terminated, I chose "YourUniqueIdentifierKey" string. Next, we will implement the `willRestoreState` provided by Apple.
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
Here, when the `centralManager(_:, willRestoreState)` is called, I will play a soundtrack and show a pop-up with the name of awaked peripheral to inform that the app is actually awaked by the system. Inside the method, we also can get a dictionary full of state information. When we retrieved with the CBCentralManagerRestoredStatePeripheralsKey key, this holds things like an array of CBPeripheral, containing all peripherals that were connected or pending connection at the time the application was terminated by the system. Here, I iterate through the array of peripherals, check if there is my interested peripheral, then initialize a `Device` and set it back to the `connectedDevice` variable so that I can receive updated values from the peripheral.

I also add the code that will popup a local notification at the `appDidFinishLaunching` delegate and at `peripheral(:didUpdateValueFor:chacracteristic)` method for testing. 

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
It's time to run our experiment! I'm going to use two methods to simulate background app termination by the system.
The first one is using XCode. 
- Run the app from Xcode.
- Stop the app by pressing the "Stop" button from Xcode.
- Restart the app from Xcode.

The second one is doing the following steps:
- Press the home button to enter the app to background.
- Long press the power button until you see “slide to power off”.
- Release the power button and long press the home button for about 5s (until you see your home screen reappeared).

In the below demonstration, you will see I use both of them for testing. Let's see something cool happens!

![](/Post-Resources/BackgroundProcessing/Restoration.gif "Demo")

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

First, I connected to the iPad device, then simulated the termination by Xcode (Relaunch the app from Xcode), after that you see the `centralManager(_:, willRestoreState)` delegate is triggered by the popup. Later, I simulated the termination by using the second method, when the home screen reappeared, one thing for sure that the app was terminated. Next, I pressed the "Send notify" button from the iPad (Which was playing as a Peripheral) to send a BLE event to the app. Surprisingly, the `centralManager(_:, willRestoreState)` was called immediately as we can see a local notification showed up, then another one showed the BLE data received from the peripheral (The "Say something cool!" string). It really worked! The app now can last forever! But wait a minute, it's not so simple as so. This approach still has some limitations that we will discuss later on this post.

As you may notice that there is a difference between the two ways I used to simulate background termination, when the app was relaunched from the first way, the option value of the delegate `application(application:didFinishLaunchingWithOptions:)` always nil, while we could extract the `[UIApplicationLaunchOptionsKey.bluetoothCentrals` by using the second way (The value of `launchOptions?[UIApplicationLaunchOptionsKey.bluetoothCentrals]` will return "YourUniqueIdentifierKey" string). I don't know the reason why it happened. But one thing for sure that the second approach is better than the first one since it matches with the Apple doc. *"When your app is relaunched by system, you can retrieve all the restoration identifiers for the central manager objects the system was preserving for your app".* 

So, in `application(application:didFinishLaunchingWithOptions:)`, we're able to get a list of UUID that represent all of the CBCentralManager objects that were active when application was terminated and that Core Bluetooth and iOS took over while you were terminated. Use UIApplicationLaunchOptionsBluetoothCentralsKey to get any central we may have instantiated before being zapped. Loop through the array  of centralManagerUUID and find the one matched the Restoration Identifier we’re interested in.  

## Limitations
### When the user force kill the app from the multiple task view
If the user force quit the app from the multiple task view, there is no chance so that the app can wake up from the restoration event. But luckily, there is another technology we can leverage to put the app back into the background named "iBeacon". In the next post, I will guide you how to implement this interesting technology into our app.

### When the user reboots phone
If the user resets the phone, the app will be killed forever. By leveraging the CoreLocation, we can solve the problem. In the next part, I will show you how to do that.

## Final thoughts

In this post, we walked through the iOS app life cycle, also I showed you how to keep the app survive even it was terminated by the system. The contents of this post are really interesting and they are formed from my real working experiments. 
Hope you will find this post useful.