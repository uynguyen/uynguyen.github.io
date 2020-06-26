---
title: 'Review book: Building Applications With iBeacon'
date: 2020-06-14 21:13:41
tags:
---
![](/Post-Resources/ibeacons/ibeacon-cover.png "SwiftApprentice")

In [the previous post](/2018/08/18/Best-practice-iBeacon/), I basically give you a quick look at iBeacon - A Bluetooth protocol built on top of BLE by Apple, and made a simple demo of how iBeacon can wake up an application after being terminated by the user. However, I did not mention other foundation concepts in Beacon, it also did not give you a deep look at the advantages and disadvantages of this powerful technology.
Today, I would like to introduce you to a good book giving a solid knowledge in Beacon field, especially iBeacon: `Building Applications With iBeacon` written by O'Reilly.
After reading this book, I ensure that you have no double in iBeacon field and your mind will be more open to the next coming up ideas.
Let's drive-in!
<!-- more --> 

## Main content
The book mainly focuses on developers who are looking for an efficient way to integrate beacon protocol to their applications. To use the book efficiently, I recommend you should have some BLE background knowledge as iBeacon is built on top of BLE.
In the beginning, the book describes a brief history of *proximity* technologies in particular. It also explains why and when to use in some specified circumstances.
The two key main why using iBeacon are, first and foremost, `GPS technologies struggle to do better than a few meters, and GPS is often limited indoors. iBeacons can enable a determination within centimeters`. The second one is `iBeacons offer high precision micro-location, along with the ability to act on what a mobile device is near. No other technology yet offers that combination.`
To convince the reader, the book compares GPS versus Beacon, in other word location versus proximity; giving some limitations of current GPS technology, the writer makes some area in which Beacon is far superior to GPS.
Next, the book explains how Beacon protocol works under the hook; introduces you to the foundational terms, and how they interact with each other.
In some chapters, the book guides you on how to set up your own beacons on Mac OS, mobile devices, or tiny computers such as Ras. Pi or Arduino.

## Key concepts
- The relationship between iBeacons, generic beacons, BLE beacons, and BLE devices is described as below

<div style="text-align:center">

![](/Post-Resources/ibeacons/Beacon-RelationShip.png "Beacon Relationship")

</div>

> iBeacons are a subset of the BLE beacon specification, All iBeacons are BLE beacons, and all BLE beacons are BLE devices. However, there are beacons that are not Bluetooth-based, and there are BLE devices that do not beacon.


- An iBeacon needs to be configured with its identifying numerical tuple (UUID, major number, and minor number).
Beacon identifier = UUID + Major + Minor.
- In Core Location, a region is a space in which a specified combination of UUID, major number, and minor number are received.
- Core Location supports three types of filtering a region:
    + UUID only: any installed iBeacon that matches the uuid.
    + UUID plus major number: Like the UUID-only option, it is likely to match several iBeacons, most likely installed at one particular location.
    + UUID plus major and minor numbers: This option will match only one specific iBeacon.

![](/Post-Resources/ibeacons/Regions.png "Beacon Regions")

- The following code illustrates how to define those three regions in Swift, respectively.
```swift
let region1 = CLBeaconRegion(uuid: "uuid1", identifier: "Your region's name 1")
let region2 = CLBeaconRegion(proximityUUID: "uuid2", major: 1, identifier: "Your region's name 2")
let region3 = CLBeaconRegion(proximityUUID: "uuid3", major: 1, minor: 0, identifier: "Your region's name 3")
```

### iOS and iBeacon: Apple provides two main actions when working with iBeacon
#### **Monitoring**
Monitoring provides a capability of subscription on the appearance of a region, which is combined with one or more beacons.
An event `in` and `out` will be fired when a device enters or exits a region, respectively.

- Performed in both the foreground and the background on iOS, is used to determine when a device has entered or left an iBeacon’s coverage area. One of the most benefits of using beacon is regions are tracked by the operating system, not the application. Even when applications are not running (terminated by the OS or force stop by the user), the OS can relaunch the app to handle the events. After bringing back to the background, the app has a few seconds to execute its tasks (Around 10s).
- The location manager defines a method for `didEnterRegion`, which is called when a device crosses the boundary to enter a region
- The location manager defines a method for `didExitRegion`, which is called when a device crosses the boundary to leave a region.

Monitoring limitation
- iOS can only monitor for up to 20 regions in one single app as describes in Apple documentation
> Regions are a shared system resource, and the total number of regions available system-wide is limited. For this reason, Core Location limits to 20 the number of regions that may be simultaneously monitored by a single app” [Apple doc](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/LocationAwarenessPG/RegionMonitoring/RegionMonitoring.html). 
- The system also takes some time to trigger the exit event, in practice it is around 30 ~ 40s.

#### **Ranging**
Uses its transmissions to estimate the distance from a mobile device to a beacon. A common use of ranging operations is to determine which iBeacon is closest to this area.
The location manager will trigger the `didRangeBeacons` method after ranging successfully, a list of iBeacons that have ranging data will be passed to the delegated method, along with the region in which they were detected. It also provides the received signal strength indicator (RSSI) to estimate a range in meters (It is a property of the CLBeacon object).

Ranging limitation: 
- One main downside of ranging operations requires much more activity in the Bluetooth hardware and consume significant power, because the Bluetooth interface is much more active when ranging

## What I like
- I never thought iBeacon topic would be written as a whole book but O'Reilly did it very well: The book describes iBeacon in a deep explanation.
- Make clear of foundational terms that are commonly used in beacon technology.
- Analyses the pros and cons of iBeacon with examples.
- Introduce other applications of beacon that I never thought about before, which opens my mind a lot:
    + Indoor Location and Proximity: Map replacement, transit assistance, indoor direction finding, where is my car?, museum guides, retail store enhancement.
    + Proximity-Triggered Actions: Mobile advertisements, ticket validation, treasure hunt, patient information integration.
    + Queue management: Queue measurement, restaurant table pager, transaction completion in retail.
- Easy to understand: the content is well-organized, it’s easy to follow the content flow.

## What I dislike
There is nothing to complain about the book, from content to form.

## Generally
Many technologies exist to help phones interact with the world around them. This book introduces you to iBeacons, a Bluetooth technology that allows a device to discover nearby subjects with relatively high accuracy. There is no doubt that the applications of beacon are increasingly widely applied in many fields, especially in marketing and advertising. 
From my point of view, you should read the book so that you can unlock your mind about iBeacon. Maybe your next startup is built on top of Beacon, who knows?
In the next tutorial, I will take you into practice with iBeacon on iOS, also will introduce you to some techniques to deal with iBeacon in deep analysis.
If you have any questions or comments on this post, feel free to contact me!