---
title: Bluetooth Low Energy On iOS
date: 2017-10-13 10:21:46
tags: [iOS, CoreBluetooh, BLE]
---
The Core Bluetooth (CB) framework allows iOS and MacOS apps communicate with BLE devices. Your apps can discover, explore, and control the BLE devices, such as heart rate monitors, trackers or hybrid watches.
![](/Post-Resources/BLE/Intro.jpg "Intro")
<center>Image 1. BLE devices (Source from Google)</center>
<!-- more --> 
On MacOS 10.9 and iOS 6, Mac and iOS devices also play the roles of BLE peripherals to serve data to other devices, including other Mac and iOS devices.
In this tutorial, I will introduce the key concepts of the Core Bluetooth framework and how to use the framework to discover, connect, and retrieve data from compatible devices. Feel free to leave out your comments on my post.
## At a glance

BLE was introduced in early 2010 and based on [Bluetooth 4.0 specification](https://www.bluetooth.com/specifications). BLE uses the same 2.4 GHz radio frequency as classical Bluetooth. In theory and in ideal conditions (Without obstacles), BLE's range get over 100m but in fact, the maximum distance is 10m. 

![](/Post-Resources/BLE/BLE.png "BLE")
<center>Image 2. BLE in reality (Source from Google)</center>


This technology is *power-friendly* because it uses less power than other wireless technologies. Thanks to its low power consumption, BLE is used to integrate into electrical devices that required less power consumption such as heart rate monitors, trackers, watches, shoes to make them smarter.
So, what are the cons of BLE technology? It's data transfer rate. In order to decrease power consumption, BLE chips only transmit data in some time called *interval* (Whereas Classical Bluetooth can transfer data at any time they want), and the amount of transferred data in an interval is also limited in a few dozen of bytes. Some more information about maximum throughput on iOS and MacOS (Provided by [PunchThrough](https://punchthrough.com/blog/posts/maximizing-ble-throughput-on-ios-and-android))
- iPhone 6, 6+, 6S, 6S+: 
```
Normal Connection Interval of 30mSecs: 2,667 bytes/sec
Connection Interval for HID Over GATT is Present 11.25mSecs: 7,111 bytes/sec
```
- MacBook Pro - OS X (Varies on models): 
```
Maximum Connection Interval range of (11.25 - 15mSecs): 7,111 bytes/sec - 5334 bytes/sec
```

To get more technical details about Bluetooth technology, please refer to [Bluetooth Special Interest Group (SIG)](https://www.bluetooth.com/).

## Basic Concepts
### 1. The players
There are two major roles involved in all BLE communication: *The Central* and *The Peripheral*:
- *Peripheral*: are devices having data that is needed by other devices.
- *Central*: typically use the information served up by a peripheral to accomplish some tasks. For examples, reading heart rate or temperature information from monitors (A peripheral).
![](/Post-Resources/BLE/Central-And-Peripheral.png "Central-And-Peripheral")
<center>Image 3. The Central and the Peripheral (Source from [Apple doc](https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html))</center>

### 2. The connection parameters
The connection parameters for a BLE connection is a set of parameters that determine when and how the Central and a Peripheral perform data transferring. The Central will actively set the connection parameters used, but the Peripheral can send another parameter that the Central can then accept or reject. Both sides will continue to request connection parameters until they find a reasonable number that they accept.
There are 3 different parameters:
- *Connection interval*: This value determines how often the Central and the Peripheral transfer data to each other.
- *Slave latency (Latency, shortly)*: If we set a non-zero latency value, the Peripheral can skip requests from the Central when the Central asks for data up to the slave latency number of times. However, if the Peripheral want to transmit data to the Central, it can send data at any time. This allows a peripheral to stay sleeping for a longer time to decrease power consumption.
- *Connection supervision timeout*: This value determines the timeout from the last package exchange until the transference is considered lost. The Central will not start trying to reconnect before the timeout has passed.

For example, if you set {interval, latency, timeout} = {15, 0, 720} as connection params for the peripheral:
- In every 15 (ms), the peripheral will be wake-up and listen to requests from the central, also transmit data if needed.
- Latency equal 0, it means that the Peripheral have to answer the Central at any time the Central requests in an interval (15 ms).
- After 720 (ms) from the last packet was sent, if the Central still does not receive the packet, the Central will determine that the packet was lost and requests the Peripheral re-send the last packet.

### 3. Bluetooth Low Energy Protocol Stack

CoreBluetooth hides many of the low-level details of the specification from developers, making it much easier to develop apps that interact with BLE devices.


#### Advertising and General Advertising Profile (GAP)

BLE devices let other devices know that they exist by advertising using the GAP. Advertising packets contain some basic information such as device name, serial number, or RSSI value, and also a list of the services it provides. The limited size of advertising packets is 128 bit.
*RSSI* stands for Received Signal Strength Indicator. RSSI value represents the strength of the transmitting signal. We can estimate the current distance between the central and the peripheral based on the value. The greater the value, the closer the device is.
![](/Post-Resources/BLE/Advertising-And-Discovery.png "Advertising-And-Discovery")
<center>Image 4. Advertising and discovery in BLE</center>

#### General Attribute Profile (GATT)

GATT is the layer that defines services and characteristics which is used to transmit data between the Central and the Peripheral, also enables read, write, notify operations on them.
In most case, the Peripheral is also called GATT server since it provides the services and the characteristics whereas the Central is the GATT client.

#### Services

Services are identified by unique numbers known as UUIDs. Standard services like [Device Information Service](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.device_information.xml&u=org.bluetooth.service.device_information.xml) (0x180A), which exposes manufacturer and basic information about the device (Firmware version, serial number, model number), have a 16-bit UUID and custom services have a 128-bit UUID. (E.g: 0x3dda0000957f7d4a34a674696673696d, etc.)

#### Characteristics

A characteristic contains a characteristic declaration, characteristic properties (ReadWrite, ReadOnly, Notify, WriteWithoutResponse and so on), and a value. Characteristics allow us to access the value and the information that they contain. A service can have more than one characteristic.
The following picture shows the relationship between Profile, Services, Characteristics.
![](/Post-Resources/BLE/Profile-Service-Char.png "Profile-Service-Char")
<center>Image 5. Relationship between Profile, Services, Characteristics</center>

### 4. Bluetooth Concepts and CoreBluetooth on iOS

In the CoreBluetooth framework
- A Central is represented by the *CBCentralManager* class and is used to discover, establish a connection and control the peripheral.
- A peripheral is represented by the *CBPeripheral* class, the services relating to a specific peripheral are represented by the *CBService* class and characteristics of a peripheral's service are represented by the *CBPeripheral* class.

The following image shows the structure of a Services and its Characteristics on iOS:

![](/Post-Resources/BLE/CBPeripheral-CBService-CBCharacteristic.png "CBPeripheral-CBService-CBCharacteristic")
<center>Image 6. Relationship between CBPeripheral, CBService and CBCharacteristic objects on iOS</center>

## Summary

BLE is a revolutionary technology of Classical Bluetooth. In reality, BLE is used to integrate into small devices like lockers, trackers, watches, shoes and some kind of jewelry (rings) to make them smarter, towards IoT environment. 
In the [next section](/2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/), I will guide you how to use CoreBluetooth to create your own services on an iOS device, also use CoreBluetooth on another device to discover, connect and control your BLE services. If you liked this post and would like to see more in the future, please let me know.

## References

[1] [Bluetooth Special Interest Group](https://www.bluetooth.com/)
[2] [Apple document: Core Bluetooth Concepts](https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html)
[3] [Maximizing BLE Throughput on iOS and Android](https://punchthrough.com/blog/posts/maximizing-ble-throughput-on-ios-and-android)
