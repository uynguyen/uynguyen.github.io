---
title: "Best practice: iOS vs Android Bluetooth"
date: 2024-06-30 10:48:09
tags: [BLE, iOS, Android]
---

![](/Post-Resources/IOSAndroid/ios_android.png "Cover")

Bluetooth technology has become an integral part of modern mobile applications, enabling seamless wireless communication between devices. Whether it's for connecting to a wireless headset, transferring files, or interacting with smart home devices, Bluetooth plays a crucial role in enhancing user experience.

For mobile developers, understanding how to implement Bluetooth functionality is essential. In this post, we'll dive into a detailed comparison of the Bluetooth development frameworks for iOS and Android.

<!-- more -->

We'll explore the key differences and similarities between these two platforms, covering everything from initial setup to data transfer and error handling. By the end of this comparison, you'll have a clear understanding of how to leverage Bluetooth technology in your mobile applications, regardless of whether you're developing for iOS or Android.

To have a better visualization, I made an image below to summarize of the flow to establish a connection on Android and iOS

![](/Post-Resources/IOSAndroid/flow.png "iOS & Android flow")

At first glance, the two flows appear quite similar. However, the Android flow includes extra steps. Although the connection process is more complex on Android compared to iOS, it provides greater control over the returned data. Let’s break down the flow into three major steps for discussion: `Discovery`, `Preparation`, `Interaction`, and `Termination`. Each of these steps involves specific actions and considerations that contribute to the overall functionality and efficiency of the connection process.

## Discovery
In the discovery phase, the processes are quite similar between Android and iOS, from initiating a scan to creating a connection.

The main difference is that there is more information about the peripheral in the scan result on Android than on iOS. The most interesting value is the MAC address of the device. iOS does not expose this value and instead provides a random UUID.
UUIDs on iOS are generated per application and per device pairing, and their lifespan is tied to the session or until the device is forgotten, so do not rely on it to identify or reconnect to your devices. iOS does not expose the MAC address for several reasons, primarily related to privacy and security. By hiding the MAC address, Apple ensures that apps and third parties cannot misuse this information for tracking or profiling users and also helps prevent illegal activities by attackers.

One possible solution to overcome this limitation is to include your own unique identifier in the advertising packet, which will be available on all platforms.

Another important note is that the Android OS prevents scan start-stops more than approximately five times in 30 seconds (please note that this value varies from device to device). Calling the startScan method too frequently in a short time will lead to no devices being discovered.

The last common value is the signal strength value, `RSSI (Received Signal Strength Indicator)`, which indicates how far the device is from the phone. The range is from -30 to -99; the closer the value is to -30, the closer the device.

## Preparation
Once your device has been discovered, the next step is to make it ready so you can perform read and write actions. There are two different approaches to making a device “ready.”

The first approach is `action on-demand`, which involves doing nothing until necessary. This means you don’t need to discover services/characteristics or set notifications until your application performs read or write commands. The advantage is a shorter connection phase, as your application doesn’t need to discover all services and characteristics, set notifications, or handle errors if any fail. The disadvantage is that the first read or write operation will take more time.

The second approach involves discovering all Bluetooth profiles upfront and making the device ready for any command. The downsides and upsides are the opposite of the first approach. There is nothing right or wrong with each approach; it’s just a matter of preference. So choose the one that suits you best. For me, I prefer to go with the second approach, as described in the image.

The setup phase on iOS is quite simple. Your application just needs to discover all services. For each service, you then call to discover all its characteristics. Finally, set notifications if the characteristics support value changes. You might want to keep a reference to each characteristic item (`CBPeripheral`) so you can perform read and write operations.

On the other hand, the "make ready" flow is quite complicated for Android. If you’re an iOS developer, you might not interact much with the `GATT Descriptor` in your application. First, you need to get familiar with the `GATT Descriptor` and `MTU (Maximum Transmission Unit)` concepts.

`GATT Descriptor` provides extra information about the characteristic they are associated with. For example, when you read a temperature value from a BLE thermometer, the characteristic might have a descriptor indicating the unit of measurement in Celsius or Fahrenheit. The most common GATT Descriptor is the `Client Characteristic Configuration Descriptor (CCCD)`, which you will use to enable/disable notifications/indicators for a characteristic.
The main difference in `notification` and `indication` types is the reliability. Notifications are sent by the peripheral without requiring an acknowledgment from the central device. In contrast, indications require an acknowledgment from the central device.

It’s simple to set a notification on iOS by calling `CBCharacteristic.setNotify()` and the system will do the rest for you. It will automatically identify the notification type and set the correct value. On Android, you must call it yourself. The following sample code demonstrates how you can set a notification for your characteristic on Android:

```java
final UUID CCCD_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
if (!gattServer.setCharacteristicNotification(characteristic, true)) {
    return false;
}

final boolean canNotify = (characteristic.getProperties() 
    & BluetoothGattCharacteristic.PROPERTY_NOTIFY) > 0;
final boolean canIndicate = (characteristic.getProperties() 
    & BluetoothGattCharacteristic.PROPERTY_INDICATE) > 0;

if (!canNotify && !canIndicate) {
    // Do not support notification/indication, doing nothing
    return true;
}

final BluetoothGattDescriptor cccDescriptor = characteristic.getDescriptor(CCCD_UUID);
if (cccDescriptor == null) {
    // Can't find the descriptor on the characteristic?
    return false;
}
if (cccDescriptor.setValue(canNotify 
        ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE 
        : BluetoothGattDescriptor.ENABLE_INDICATION_VALUE)) {
    gattServer.writeDescriptor(cccDescriptor);
    return true;
}

return false;
```

The final step is optional: request to change the MTU value.
`MTU (Maximum Transmission Unit)` refers to the largest amount of data that can be sent in a single Bluetooth packet. By default, the MTU value in BLE is 23 bytes, in other words, for a single read and write command, the maximum bytes your application/device can deliver is 23 bytes (with a 3-byte header), but it can be negotiated between the central and peripheral devices up to 517 bytes.

In iOS, you don’t directly request an MTU size; instead, the MTU is automatically negotiated between the central and peripheral devices during the connection process. On Android, use `BluetoothGatt.requestMtu()` to request a specific MTU size and handle the response in `BluetoothGattCallback.onMtuChanged()`. It’s a common mistake to forget to increase the MTU while your device is sending more than 20 bytes per request, leading to missing data in the packet.

One important comment regarding establishing connections is that there is a maximum number of devices that can connect simultaneously. There are no offical documents for this number, but many developers have found that on iOS around 7 - 10 devices, while on Android it around 10 - 20 depends on phone model and Android version.

```java
private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
    @Override
    public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
        if (status == BluetoothGatt.GATT_SUCCESS) {
            // MTU size change successful
            Log.d("MTU", "MTU changed to " + mtu);
        } else {
            // MTU size change failed
            Log.d("MTU", "MTU change failed with status " + status);
        }
    }
};
```

## Interaction
Upon completing all the steps above successfully, your device is now ready to use. You can read values from a characteristic, transfer data to a specific one, or read the RSSI value to determine the distance. Make sure you handle the value changes properly by checking from which characteristic the value comes.

It is worth mentioning that on iOS, if your application transfers a large amount of data to the device (e.g., transferring a file), you should wait for the next `peripheralIsReady` event to be triggered before sending the next packet. Continuously sending multiple packets without waiting for this event might put pressure on the queueing buffers, leading to missing packet.

```swift
func peripheralIsReady(toSendWriteWithoutResponse peripheral: CBPeripheral) {
    // Ready to send next packet
}
```

## Termination
Once again, the disconnection step on iOS is very simple. You just need to call the `cancelPeripheralConnection` method.

On Android, you need to do more than one operation: `disconnect` the device and `close` the Bluetooth GATT. Remember that calling `disconnect` only cancels the connection with the peripheral, it does not release all the resources (e.g., available slots in the Bluetooth stack) until you call `close`. You use `disconnect` when you want to temporarily end the connection but might reconnect to the device later without needing to fully reset the GATT configuration. You use `close` when you are done with the Bluetooth connection entirely and want to ensure all resources are cleaned up.

## Conclusion
In this post, we explored the important points of implementing Bluetooth functionality in mobile applications for iOS and Android. Through our detailed comparison, several key points emerged that highlight both the similarities and differences between these two platforms.

iOS Core Bluetooth offers a robust and straightforward framework that integrates seamlessly with the iOS ecosystem. It provides a clean and consistent API.

The Android Bluetooth, on the other hand, offers flexibility, extensive capabilities and it supports a wide range of Bluetooth functionalities. While the setup and implementation might be slightly more complex compared to iOS, Android’s Bluetooth API provides powerful tools for handling Bluetooth interactions effectively.

## Refs
[The Ultimate Guide to Android Bluetooth Low Energy](https://punchthrough.com/android-ble-guide/)
[The Ultimate Guide to Apple’s Core Bluetooth](https://punchthrough.com/core-bluetooth-basics/)