---
title: 'Best practice: iBeacon'
date: 2018-08-18 21:17:47
tags: [BLE, iOS, iBeacon]
---
![](/Post-Resources/ibeacon/ibeacon.png "Delivery")
Welcome to the next part of the series of "[How to deal with BLE in the background](/2018/07/23/Best-practice-How-to-deal-with-Bluetooth-Low-Energy-in-background/)".
In the previous part, I guided you how to keep your app alive as long as possible when your app enters to background mode by using *State Preservation and Restoration* technique supported by Apple. However, there are some usecases this technique can not handle, as described below (refer to [Apple document: Conditions Under Which Bluetooth State Restoration Will Relaunch An App](https://developer.apple.com/library/archive/qa/qa1962/_index.html))
![](/Post-Resources/ibeacon/condition_relaunch.png "Conditions Under Which Bluetooth State Restoration Will Relaunch An App")
As you can see, there is a common case when users force quit the app from the multiple task view (Whether accidentally or intentionally), the Restoration technique can not awake your app. Let's imagine that your app has a feature allows users to press a button on your BLE-connected devices to find where their phone is, but if your app is not running or is not able to wake up to handle the BLE signal sent from your devices, this feature would be useless.
In this post, I will show you a technique using iBeacon to deal with this case, which makes your app another chance to wake up despite it is terminated by users. Let's drive-in!
<!-- more --> 
## Welcome to the world of iBeacon
[iBeacon](https://en.wikipedia.org/wiki/IBeacon) is a protocol first introduced by Apple in WWDC 2013. "iBeacon is based on Bluetooth low energy proximity sensing by transmitting a universally unique identifier picked up by a compatible app or operating system. The identifier and several bytes sent with it can be used to determine the device's physical location, track customers, or trigger a location-based action on the device such as a check-in on social media or a push notification" (Wiki).
iBeacon application is very diverse like location-based services, mobile commerce or advertising, to name a few.
"The Automatic Museum Guide" is a project that is very impressed me built on iBeacon technology. The app allows visitors to explore exhibits by showing the appropriate contents by tracking their location and their distance with the beacon. That's a brilliant idea!
<center>
	<iframe width="100%" height="400" src="https://www.youtube.com/embed/LlNLAAUkcRs" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</center>

## How it works
Apple has standardized the content of iBeacon advertisement data. It consists of a 16 byte UUID, the major and minor version. These three factors are unique for each beacon. A last field in the packet is TX power used to determine how close you are to the beacon.
A beacon broadcasts this packet in its range, far from 20m to 300m, at regular intervals of time. These packets are automatically detected by nearby phones, then the app will perform a pre-defined action like showing a notification or pop-up a promotion code.

![](/Post-Resources/ibeacon/iBeacon_format.png "iBeacon data format")
![](/Post-Resources/ibeacon/how_ibeacon_work.png "iBeacon data format")

Although iBeacon is based on Bluetooth low energy technology, one of the main differences between the two is iBeacon is one-way transmit technology, by which I mean only the phone can receive data from iBeacon devices. 

## iOS integration: start advertising as an iBeacon
Firstly, we need a beacon so that we can do the next step. I'm going to use my iPad to act as a beacon by using a `CLBeaconRegion` object in CoreBluetooth on iOS.
The main UI just simply contains two main buttons that will start and stop the advertisement of the iBeacon, respectively.
![](/Post-Resources/ibeacon/ibeacon_device.png "iBeacon main UI")

```swift
let region = CLBeaconRegion(proximityUUID: self.uuid!,
                                        major: self.major,
                                        minor: self.minor,
                                        identifier: self.identifier)
let peripheralData = region.peripheralData(withMeasuredPower: nil)
peripheral.startAdvertising(((peripheralData as NSDictionary) as! [String : Any]))
```

Then, we implement the `peripheralManagerDidStartAdvertising(CBPeripheralManager, Error?)` delegate to check if the beacon advertises successfully.
```swift
func peripheralManagerDidStartAdvertising(_ peripheral: CBPeripheralManager, error: Error?) {
    if error == nil {
        print("Successfully started advertising our beacon data.")
    } else {
        print("Failed to advertise our beacon. Error = \(String(describing: error))")
    }
}
```

To stop advertising
```swift
peripheralManager?.stopAdvertising()
```

## Leverate iBeacon technology to make our app last forever
Firstly, Inside the `didFinishLaunchingWithOptions` method of `AppDelegate` class, I will show a notification to get notified whenever our app is relaunched.
```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    NotificationHandler.shared.showNotification(title: "App did launch", body: "")
    return true
}
```

After the main view appears, I then tell the location manager to start monitoring the given region and to start ranging iBeacons within that region
```swift
func startMonitoring() {
    locationManager.startMonitoring(for: beaconRegion)
    locationManager.startRangingBeacons(in: beaconRegion)
}
```
By default, monitoring notifies you when the region is entered or exited regardless of whether your app is running. Ranging, on the other hand, monitors the proximity of the region only while your app is running.

That's all for setting up. In the following demonstration, you will see I open the app then terminate it from the multiple task view. After that, I press the "Start advertising" button on my iPad (The beacon). You will see the app was relaunched immediately even it had been killed (The "App did launch" notification showed up). That's amazing.
<center>
    <img src="/Post-Resources/ibeacon/ibeacon_relaunch.gif" width="300">
</center>

*Note*: Don’t expect to receive an event right away, because only boundary crossings generate an event. In particular, if the user’s location is already inside the region at registration time, the location manager doesn’t automatically generate an event. Instead, your app must wait for the user to cross the region boundary before an event is generated and sent to the delegate.

## Conclusions
One of the most interesting things of iBeacon is iBeacon applications can be waked up event it has been terminated by the user. It means iBeacon applications can last forever. To download the completed projects, please click to the following Github links:
- Act as an iBeacon: https://github.com/uynguyen/iBeaconDevice
- Central manager app: https://github.com/uynguyen/CentralManager-iBeacon

Feel free to shot me an email if you have any questions.

## References
[1] [Region Monitoring and iBeacon](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/LocationAwarenessPG/RegionMonitoring/RegionMonitoring.html)

