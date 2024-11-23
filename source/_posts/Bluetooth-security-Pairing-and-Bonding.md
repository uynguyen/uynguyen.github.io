---
title: "Bluetooth security: Pairing and Bonding"
date: 2024-08-31 10:38:32
tags: [CoreBluetooh, BLE]
---

![](/Post-Resources/Bonding/cover.png "Bluetooth security")

In modern times, Bluetooth plays a crucial role in connecting devices seamlessly. From fitness trackers to smart home devices, Bluetooth Low Energy (BLE) allows devices to communicate efficiently while reducing power consumption. However, with the rise of wireless communication, ensuring security has become a key concern. Two core concepts of Bluetooth security are **Pairing** and **Bonding**, which are often misunderstood in the context of BLE.

<!-- more -->

Ensuring that devices pair and bond securely is critical for protecting sensitive data. Improper implementation of these processes can lead to several types of attacks. For example, attackers can intercept communications and steal valuable information.

In this blog, we'll explore what pairing and bonding are, why they are important for security, and how they work in practice, particularly for mobile applications.

## Low level: Security Manager (SM)
At the core of BLE security is the Security Manager (SM), a crucial component that manages various security functions. The SM handles the exchange of security keys and ensures that all data transmitted between devices is encrypted and protected from unauthorized access.

Key responsibilities of the SM include managing pairing, bonding, encryption and authentication, and key management.

The SM provides different authentication methods for different levels of security:

- **Just Works**: No authentication involved. Used for low-security applications.
- **Passkey Entry**: A passkey (PIN) is entered on one or both devices to authenticate.
- **Numeric Comparison**: Both devices display a number, and the user must confirm that they match.
- **Out-of-Band (OOB)**: Another wireless technology, like NFC, is used to exchange information, providing enhanced security.

![](/Post-Resources/Bonding/sm.png "Security Manager")

## Establish pairing and bonding sequence

**Pairing** is the process of establishing a secure communication link between two Bluetooth devices. This step is essential to ensure that the devices can share data securely. During the pairing process, the devices exchange information, authenticate each other, and create encryption keys to protect the data being transmitted.

**Bonding** is the next step after pairing. Once two devices successfully pair, they can store the encryption keys and related security information for future use. It ensures that devices don't need to pair again the next time they connect. By storing these keys, devices can reconnect more quickly and securely in the future.

In a high level, steps in the pairing and bonding process include:

*PAIRING*
- **Initiating**: One device sends a pairing request to the other.
- **Exchanging Security Parameters**: Devices share their capabilities, including available authentication methods.
- **Authentication**: Depending on the available methods (Just Works, Passkey Entry, Numeric Comparison, or Out-of-Band), the devices authenticate themselves.
- **Key Generation**: Encryption keys are generated and used to secure the communication.
- **Establishing Encryption**: Devices begin encrypted communication after the keys are successfully exchanged.
*BONDING*
- **Storing Security Information**: After pairing, both devices save encryption keys for future connections.
- **Reconnection**: During future interactions, devices can use the saved keys to re-establish a secure, encrypted link without repeating the pairing process.

Below is a summary of the flow in the example of a mobile device (central) and a peripheral (e.g., smartwatches, monitors, etc.).
![](/Post-Resources/Bonding/bonding_sequence.png "Establish pairing and bonding sequence")

## Mobile application side
iOS does not provide an explicit bonding API. However, the bonding process occurs transparently when you connect to a BLE device that requires it, and the OS will prompt the user for necessary authentication. The pairing request is usually triggered by accessing secured characteristics.

In contrast, you have more control over the pairing and bonding proces in Android.
```java
BluetoothDevice device = bluetoothAdapter.getRemoteDevice(deviceAddress);

// Checking bond state
int bondState = device.getBondState();
if (bondState == BluetoothDevice.BOND_BONDED) {
    // Already bonded
} else {
    // Create bond
    device.createBond();
}

...
// Moniroting updates
BroadcastReceiver receiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
        final String action = intent.getAction();
        if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action)) {
            int bondState = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.ERROR);
            if (bondState == BluetoothDevice.BOND_BONDED) {
                // Device is bonded
            } else if (bondState == BluetoothDevice.BOND_BONDING) {
                // Bonding in progress
            } else if (bondState == BluetoothDevice.BOND_NONE) {
                // Bonding failed
            }
        }
    }
};
```

On Android, there is no public API to programmatically remove a bonded device. However, there is a private API method available that can be accessed using reflection to remove a bond. Kindly note that, because this is a private API, it is unsupported by Google, and using it in production code may result in unpredictable behavior on certain devices or your application being rejected during Google's review process.

```java
public static boolean removeBond(BluetoothDevice device) {
    try {
        Method removeBondMethod = BluetoothDevice.class.getMethod("removeBond");
        return (boolean) removeBondMethod.invoke(device);
    } catch (Exception e) {
        e.printStackTrace();
    }
    return false;
}
```

## Best practice

While working with devices that need encrypted data, I ran into some issues. Below are the key points I’ve learned, which might help save you time:

- To support auto-connect from the iOS system, the device must contain either the HID profile or be subscribed to the ANCS profile of the phone.
- On Android, the OS does not auto-reconnect to the device when bonding; it’s the job of your services.
- The iOS system automatically shows the pairing pop-up **immediately** after successfully calling `connect` to the device if it contains the HID profile.
- Removing all encrypted characteristics of the HID profile from your device prevents the system from automatically showing the pairing pop-up.
- When reading a custom encrypted characteristic of the GATT profile, the pairing request pop-up will appear.
- The OS will still auto-connect to the device after pairing it with our encrypted characteristic, even if the HID device is unencrypted.
- Use Strong Authentication Methods: Prefer Numeric Comparison or Passkey Entry over Just Works.
- Update Encryption Protocols: Ensure that your devices use modern, strong encryption protocols.

## Conclusion

Bluetooth pairing and bonding are foundational processes that enable secure communication between devices. By understanding these mechanisms, developers can significantly enhance the security of their Bluetooth connections. As the number of connected devices grows, ensuring strong Bluetooth security will continue to be a priority for safeguarding personal-sensity data.

## Refs

- Kevin Townsend, Carles Cufí, Akiba, Robert Davidson - Getting Started with Bluetooth Low Energy\_ Tools and Techniques for Low-Power Networking-O'Reilly Media (2014)
- [How iOS and Android Handle Connections with BLE Human Interface Devices, Punch Through](https://punchthrough.com/ble-human-interface-device-connections-on-ios-and-android)
- [BLE Pairing and Bonding](https://technotes.kynetics.com/2018/BLE_Pairing_and_bonding/)