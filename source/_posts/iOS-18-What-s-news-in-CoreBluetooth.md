---
title: "iOS 18: What's news in CoreBluetooth?"
date: 2024-11-03 10:33:53
tags:
---

![](/Post-Resources/AccessorySetupKit/cover.png "AccessorySetupKit")

`AccessorySetupKit`, introduced in iOS 18, revolutionizes how third-party Bluetooth and Wi-Fi accessories integrate with iOS devices. This framework delivers a seamless setup experience, enhancing convenience for users and expanding capabilities for developers.  
While `AccessorySetupKit` supports discovery for Bluetooth, Wi-Fi, and Local Network devices, this post will focus specifically on BLE (Bluetooth Low Energy). The setup process for Wi-Fi and Local Network devices follows a similar approach.

<!-- more -->

## Key Features
Below, we’ll explore the key functionalities that make `AccessorySetupKit` a major change for accessory management.
- **Streamlined Pairing Process**: Users can now pair or unpair accessories and toggle Bluetooth directly within the app, eliminating the need to go through system settings. This streamlined approach enhances the user experience and reduces setup time.
- **Unified Access Management**: Once an accessory is paired, it appears in the new "Accessories" section within the Privacy settings. Here, users can manage permissions and view connected devices, providing a centralized location for accessory management.
- **Enhanced Developer Control**: Developers can define scanning filters and provide custom images and names for devices, ensuring branded setup experience.

## Setup flow
You can find the example project provided by Apple on [WWWDC24](https://developer.apple.com/videos/play/wwdc2024/10203/).
To simulate the accessories, I used CoreBluetooth and defined my Bluetooth profile with two different UUIDs: `1FA2FD8A-17E0-4D3B-AF45-305DA6130E39` and `1FA2FD8A-17E0-4D3B-AF45-305DA6130E38`, then started advertising them.
Next, you need to modify the scanning UUID service in your Info.plist file to match your Bluetooth profiles. This informs the system of the accessory types your app supports.
Apple supports different filter types, such as:

```js
<dict>
    <key>NSAccessorySetupBluetoothCompanyIdentifiers</key>
    <array>
        #Matches the key of an advertised manufacturing data field
    </array>
    <key>NSAccessorySetupBluetoothServices</key>
    <array>
        #Matches either an advertised service UUID field or the key (service UUID) of an advertised service data field
    </array>
    <key>NSAccessorySetupBluetoothNames</key>
    <array>
        #Match any substring within the advertised name
    </array>
    <key>NSAccessorySetupKitSupports</key>
    <array>
        <string>Bluetooth</string>
    </array>
</dict>
```

Next, create an `ASAccessorySession`. This session is essential for managing the accessory setup process, enabling you to present the accessory picker to users and handle various accessory-related events efficiently.

```js
private var session = ASAccessorySession()
```

Then, present the `Accessory Picker`. This allows you to display the picker interface, enabling users to easily select and pair their accessories with the app.

```js
let pickerDevice1: ASPickerDisplayItem = {
    let descriptor = ASDiscoveryDescriptor()
    descriptor.bluetoothServiceUUID = ###

    return ASPickerDisplayItem(
        name: ###,
        productImage: UIImage(named: ###)!,
        descriptor: descriptor
    )
}()

let pickerDevice2: ASPickerDisplayItem = {
    let descriptor = ASDiscoveryDescriptor()
    descriptor.bluetoothServiceUUID = ###

    return ASPickerDisplayItem(
        name: ###,
        productImage: UIImage(named: ###)!,
        descriptor: descriptor
    )
}()

session.showPicker(for: [pickerDevice1, pickerDevice2]) { error in
    if let error {
        print("Failed to show picker due to: \(error.localizedDescription)")
    }
}
```

The user will now see a list of discovered devices and can select one to begin the pairing process, following the standard flow.

```js
private func handleSessionEvent(event: ASAccessoryEvent) {
    switch event.eventType {
        case .accessoryAdded, .accessoryChanged:
            guard let dice = event.accessory else { return }
            # Save your device
        case .activated:
            guard let dice = session.accessories.first else { return }
            # Save your device
        case .accessoryRemoved:
            # Clean up
        case .pickerDidPresent:
            # Your logic
        case .pickerDidDismiss:
            # Your logic
        default: ###
    }
}
```

![](/Post-Resources/AccessorySetupKit/flow.png "AccessorySetupKit")

## What's importants?

`AccessorySetupKit` streamlines the setup process for users, making it more intuitive and efficient while eliminating the complexity often associated with connecting third-party accessories. 
For developers, it provides a standardized integration framework, ensuring consistent user experiences and simplified codebases. By adopting `AccessorySetupKit`, developers can deliver a seamless and cohesive experience that aligns third-party accessories with the high standards users associate with Apple products.


## Refs
[Meet AccessorySetupKit, WWWDC 2024](https://developer.apple.com/videos/play/wwdc2024/10203/)
[iOS 18 AccessorySetupKit: Everything BLE Developers Need To Know](https://punchthrough.com/ios18-accessorysetupkit-everything-ble-developers-need-to-know/)

