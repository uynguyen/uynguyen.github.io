---
title: 'Best practice: Advanced BLE scanning process on iOS'
date: 2020-08-23 09:51:43
tags: [iOS, BLE]
---

![](/Post-Resources/ScanningInBG/cover.png "Banner")

iOS developers are building applications that play both roles Peripheral and Central to exchange data with other copies apps. The data can be exchange a small of information via BLE packets or the signal strength indicator (RSSI) value from one to the others. However, keeping the app last forever in the foreground is impossible. Sooner or later, the app will enter to background mode by the user and finally will be suspended by the system depending on RAM available, power consumption and other factors. Thus, understanding the procedure of advertising and scanning on iOS devices helps you to build good applications that fit your expectations.
At the end of this tutorial, we will build a simple application that acts as both a scanner and an advertiser. When two applications find each other, they will write a log record for analysis. Depending on the results, we will find out how effective our application is using Core Bluetooth.
Let’s switch the gear!

<!-- more -->

It's coming!
<!-- 
## Foundational knowledge

According to the `Getting Started With Bluetooth Low Energy` book, the two main purposes of advertising packets are:
- To broadcast data for applications.
- To discover slaves and to connect them.

The maximum size of payload each advertising packet is **31 bytes**, along with the header information. Every eslapsed interval, which range from 20ms to 10.24s, advertising packets are broastcasted blindly to notify its presence to other devices or applications. There are two types of scanning approaches:
- **Passive Scanning**: Scanners simply recieves advertising packets witout any futher actions.
- **Active Scanning**: After recieving an advertising packet, the scanner perform a Scanning Request packet to the advertiser. After recieving the Scanning Request, the advertiser responds with a Scanning Response packet which allows the advertises to send an extra data (Extra 31 bytes) to the scanner.

![](/Post-Resources/ScanningInBG/ScanningProcedures.png "Scanning Procedures")

To classify advertising packet types, we rely on three properties: `connectability`, `scannability`, and `directability`

Adv packet type             |  Connectability: Determintes if a scanner can make a connection or not | Scannability: Determines if a scanner can issue a scan request or not | Directability: Determines if this packet is targeted at any particular scannners or not.
:-------------------------:|:-------------------------|:-------------------------:|:-------------------------:
ADV_IND | Yes | Yes | No
ADV_DIRECT_IND | Yes | No | Yes
ADV_NONCONN_IND | No | No | No
ADV_SCAN_IND | No | Yes | No

There are a lot more advanced topic are bring on the table in the `Getting Started With Bluetooth Low Energy` book such as how data is organized in BLE devices and how to communicate with existing hardware, etc. If you want to know more, please refer to the book.
Because of the scope of this post, understanding of advertising process is good enough for us to move to the next section.

## Scanning and advertising on iOS

### Setting up the advertiser - Peripheral

We're going to reuse my previous repo allowing an ios phone advertises as a peripheral using Core Bluetooth. 
First, I will generate 5 UUIDs as the services of the advertiser (Peripheral).

```swift
let kServiceUUID1 = "1FA2FD8A-17E0-4D3B-AF45-305DA6130E39"
...
let kServiceUUID4 = "4FA2FD8A-17E0-4D3B-AF45-305DA6130E39"
let kServiceUUID5 = "5FA2FD8A-17E0-4D3B-AF45-305DA6130E39"
```

Next, I will create a list of `CBMutableService` and then add them to the `CBPeripheralManager` object.

```swift
services.forEach { (each) in
    let cbService = CBMutableService(type: each.uuid.cbUUID, primary: true)
    var charArr = [CBMutableCharacteristic]()
    
    each.characteristics.forEach { (char) in
        charArr.append(CBMutableCharacteristic.init(
            type: char.uuid.cbUUID,
        properties: [.read, .write, .notify],
        value: nil,
        permissions: CBAttributePermissions(char.permissions.map { $0.cbAttributePermission } )))
    }
    
    cbService.characteristics = charArr

    self.peripheralManager.add(cbService)
}
```

Finally, we start advertising the peripheral when its state get ready.

```swift
self.peripheralManager.startAdvertising([CBAdvertisementDataLocalNameKey: "uynguyen",
                                        CBAdvertisementDataServiceUUIDsKey: self.cbServices.map { $0.uuid }])
```

As the above code get executed, we will see the following log are printed.

```bash
Add service 1FA2FD8A-17E0-4D3B-AF45-305DA6130E39 Succeeded
---> Chars [<CBMutableCharacteristic: 0x2802d4070 UUID = 463FED20-DA93-45E7-B00F-B5CD99775150, Value = (null), Properties = 0x1A, Permissions = 0x3, Descriptors = (null), SubscribedCentrals = (
)>, <CBMutableCharacteristic: 0x2802d4380 UUID = 463FED21-DA93-45E7-B00F-B5CD99775150, Value = (null), Properties = 0x112, Permissions = 0x1, Descriptors = (null), SubscribedCentrals = (
)>, <CBMutableCharacteristic: 0x2802d4620 UUID = 463FED22-DA93-45E7-B00F-B5CD99775150, Value = {length = 6, bytes = 0x486168616861}, Properties = 0x2, Permissions = 0x1, Descriptors = (null), SubscribedCentrals = (
)>]

...

Add service 5FA2FD8A-17E0-4D3B-AF45-305DA6130E39 Succeeded
---> Chars []

===> Start advertising Succeeded
```

### Setting the scanner - Central
The next step is to set up our Central Manage - the scanner. As you might know from my previous tutorial, the code to scan nearby devices is quite simple. 
```swift
private func startScanning() {
    self.centralManager?.scanForPeripherals(withServices: nil,
                                            options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
}
```

- The `nil` value we pass to `withServices` param indicates tha we will scan all nearby devices without specifing service uuids.
- The `CBCentralManagerScanOptionAllowDuplicatesKey` option specifies the scan should run without duplicate filtering.

Once the central discover a peripheral, we will print its info including the local name and the `CBAdvertisementDataServiceUUIDsKey` value in the advertising packet.

```swift
public func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
    print("Did found per \(peripheral.name)")
    print("CBAdvertisementDataServiceUUIDsKey adv value " + advertisementData[CBAdvertisementDataServiceUUIDsKey])
// ...
}
```

Let's build and run the project, 

```bash
Did found peripheral name: Optional("Uy Nguyen iPad")
CBAdvertisementDataServiceUUIDsKey adv value:
Optional(<__NSArrayM 0x282a79350>(
    1FA2FD8A-17E0-4D3B-AF45-305DA6130E39
))
```

Looking at the log, can you spot what's going wrong? There are two problems you might notice

1. The first one is the printed Local name does not match with the one we set up in the peripheral, "Uy Nguyen iPad" vs "uynguyen", respectively.
2. The `CBAdvertisementDataServiceUUIDsKey` value contains only 1 service, what happended to the other services from 2 to 5?

Let's print out full advertising packet to see what it contains.

```bash
["kCBAdvDataServiceUUIDs": <__NSArrayM 0x283460630>(
1FA2FD8A-17E0-4D3B-AF45-305DA6130E39
)
, "kCBAdvDataLocalName": uynguyen, "kCBAdvDataTimestamp": 620013184.4512661, "kCBAdvDataRxPrimaryPHY": 0, "kCBAdvDataIsConnectable": 1, "kCBAdvDataRxSecondaryPHY": 0]
```

### Finding problems

```swift
private func startScanning() {
    self.centralManager?.scanForPeripherals(withServices: [CBUUID(string: "1FA2FD8A-17E0-4D3B-AF45-305DA6130E39"), 
                                                            CBUUID(string: "2FA2FD8A-17E0-4D3B-AF45-305DA6130E39"), 
                                                            CBUUID(string: "3FA2FD8A-17E0-4D3B-AF45-305DA6130E39"), 
                                                            CBUUID(string: "4FA2FD8A-17E0-4D3B-AF45-305DA6130E39"), 
                                                            CBUUID(string: "5FA2FD8A-17E0-4D3B-AF45-305DA6130E39")],
                                                            options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
}
```

```bash
["kCBAdvDataIsConnectable": 1, "kCBAdvDataServiceUUIDs": <__NSArrayM 0x280708750>(
1FA2FD8A-17E0-4D3B-AF45-305DA6130E39
)
, "kCBAdvDataLocalName": uynguyen, "kCBAdvDataRxSecondaryPHY": 0, "kCBAdvDataHashedServiceUUIDs": <__NSArrayM 0x280708720>(
2FA2FD8A-17E0-4D3B-AF45-305DA6130E39,
3FA2FD8A-17E0-4D3B-AF45-305DA6130E39,
4FA2FD8A-17E0-4D3B-AF45-305DA6130E39,
5FA2FD8A-17E0-4D3B-AF45-305DA6130E39
)
, "kCBAdvDataRxPrimaryPHY": 0, "kCBAdvDataTimestamp": 620013608.239601]
```

![](/Post-Resources/ScanningInBG/advertising_method.png "Advetising definition")

![](/Post-Resources/ScanningInBG/Adv_Packets.png "Advetising packets")


Data: 02 01 1A 11 06 39 0E 13 A6 5D 30 45 AF 3B 4D E0 17 8A FD A2 1F 09 09 75 79 6E 67 75 79 65 6E 

1F A2 FD 8A 17 E0 4D 3B AF 45 30 5D A6 13 0E 39

39 0E 13 A6 5D 30 45 AF 3B 4D E0 17 8A FD A2 1F

75 79 6E 67 75 79 65 6E > "uynguyen"


1. Local name?
2. Why CBAdvertisementDataServiceUUIDsKey does not contains full customed services?
3. What the "overflow" area means?


Please keep in mind that advertising while the app is in background performs differently then when it is in foreground. In defails:
- `CBAdvertisementDataLocalNameKey` is ignored.
- The frenquency of advertising packets to be sent may decrease. That's why the Scanner found nearby peripheral is slower compared to when the advertisers are in foreground.
- All service UUIDs contained in the value of the CBAdvertisementDataServiceUUIDsKey advertisement key are placed in a special "overflow" area; they can be discovered only by an iOS device that is explicitly scanning for them

## Analysis The Results

The table below summarizes what we have investigated

  
   \                |  Peripheral Background          | Peripheral Foreground
:------------------:|:-------------------:|:-------------------------:
**Central Background**          | Yes                 | Yes
**Central Foreground**          | Yes                 | No


## Conclusion

Cogratulation! We walked through a tutorial to get a deeper view on how CoreBluetooth on iOS work in both Central and Peripheral modes. Hope you find this post interested! If you have any comments, feel free to send me an email to uynguyen.itus@gmail.com or leave your questions on the comment box.
Made with love.  -->