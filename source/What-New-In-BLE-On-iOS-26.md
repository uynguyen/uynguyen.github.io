---
title: 'What New in BLE on iOS 26?'
date: 2026-01-30 10:00:00
tags: [iOS, BLE, WWDC26]
---

![](/Post-Resources/BLEiOS26/cover.png "Banner")

Apple continues to enhance Bluetooth Low Energy capabilities in iOS 26, bringing new features and improvements for developers building connected experiences. In this post, we'll explore the latest additions to Core Bluetooth and how they can benefit your applications.

<!-- more -->

## Overview

iOS 26 introduces several significant updates to the Core Bluetooth framework:

- **Channel Sounding Support**: High-precision distance measurement using Bluetooth 6.0 Channel Sounding
- **Enhanced Background Scanning**: New background modes with intelligent scheduling
- **Connection Subrating**: Dynamic connection parameter adjustment for better power efficiency
- **Improved Privacy Controls**: New authorization APIs and user consent flows
- **LE Audio Enhancements**: Better integration with Bluetooth LE Audio features

Let's dive into each of these exciting updates!

## Channel Sounding Support

One of the most anticipated features in iOS 26 is the support for **Bluetooth 6.0 Channel Sounding**. This technology enables centimeter-level distance measurement between devices, a significant improvement over RSSI-based ranging.

### What is Channel Sounding?

Channel Sounding (formerly known as High Accuracy Distance Measurement or HADM) uses phase-based and round-trip time measurements to calculate precise distances between two Bluetooth devices. Unlike RSSI, which can be affected by environmental factors, Channel Sounding provides consistent accuracy regardless of obstacles or reflections.

### New APIs

iOS 26 introduces the `CBChannelSounding` class and related APIs:

```swift
import CoreBluetooth

class RangingManager: NSObject, CBCentralManagerDelegate, CBChannelSoundingDelegate {
    var centralManager: CBCentralManager!
    var channelSounding: CBChannelSounding?

    func startRanging(with peripheral: CBPeripheral) {
        // Check if Channel Sounding is supported
        guard CBChannelSounding.isSupported else {
            print("Channel Sounding not supported on this device")
            return
        }

        // Create Channel Sounding session
        let config = CBChannelSoundingConfiguration()
        config.mode = .roundTripTime  // or .phaseBasedRanging
        config.updateInterval = 0.1   // 100ms updates

        channelSounding = CBChannelSounding(
            peripheral: peripheral,
            configuration: config,
            delegate: self
        )

        channelSounding?.startRanging()
    }

    // MARK: - CBChannelSoundingDelegate

    func channelSounding(_ channelSounding: CBChannelSounding,
                         didUpdateDistance distance: CBDistance) {
        print("Distance: \(distance.meters) meters")
        print("Confidence: \(distance.confidence)")
        print("Azimuth: \(distance.azimuth ?? 0) degrees")
    }

    func channelSounding(_ channelSounding: CBChannelSounding,
                         didFailWithError error: Error) {
        print("Ranging failed: \(error.localizedDescription)")
    }
}
```

### Use Cases

Channel Sounding opens up new possibilities for iOS apps:

- **Precise indoor navigation**: Guide users with centimeter-level accuracy
- **Asset tracking**: Locate items with unprecedented precision
- **Proximity-based automation**: Trigger actions based on exact distances
- **Spatial audio**: Position audio sources accurately in 3D space

## Enhanced Background Scanning

iOS 26 introduces a new background scanning mode that balances discovery efficiency with battery life.

### Intelligent Scan Scheduling

The new `CBScanSchedule` API allows developers to define smart scanning patterns:

```swift
class BackgroundScanner: NSObject, CBCentralManagerDelegate {
    var centralManager: CBCentralManager!

    func configureBackgroundScanning() {
        // Create a scan schedule for background operation
        let schedule = CBScanSchedule()

        // Scan for 2 seconds every 30 seconds
        schedule.scanDuration = 2.0
        schedule.scanInterval = 30.0

        // Increase frequency when devices were recently seen
        schedule.adaptiveMode = .recentActivity

        // Define time-based rules
        schedule.addTimeRule(
            CBScanTimeRule(
                startHour: 8,
                endHour: 18,
                scanInterval: 15.0  // More frequent during work hours
            )
        )

        // Apply the schedule
        let options: [String: Any] = [
            CBCentralManagerScanOptionAllowDuplicatesKey: false,
            CBCentralManagerScanOptionScheduleKey: schedule
        ]

        centralManager.scanForPeripherals(
            withServices: [targetServiceUUID],
            options: options
        )
    }
}
```

### Background Delivery Improvements

iOS 26 also improves how scan results are delivered to backgrounded apps:

```swift
func centralManager(_ central: CBCentralManager,
                    didDiscover peripheral: CBPeripheral,
                    advertisementData: [String: Any],
                    rssi RSSI: NSNumber) {
    // New: Access delivery context
    if let context = advertisementData[CBAdvertisementDataDeliveryContextKey] as? CBDeliveryContext {
        print("Discovered in: \(context.mode)")  // .foreground, .background, .suspended
        print("Time since scan: \(context.latency) seconds")
        print("Batch size: \(context.batchCount)")
    }
}
```

## Connection Subrating

Connection Subrating is a Bluetooth 5.3 feature that iOS 26 now fully exposes to developers. It allows dynamic adjustment of connection parameters without the overhead of a full parameter update.

### How It Works

Instead of negotiating new connection parameters (which requires multiple packet exchanges), Connection Subrating lets you switch between predefined "subrates" instantly:

```swift
class ConnectionManager: NSObject, CBPeripheralDelegate {

    func configureConnectionSubrating(for peripheral: CBPeripheral) {
        // Define subrating parameters
        let subrateConfig = CBConnectionSubrateConfiguration()

        // Base connection interval: 15ms
        subrateConfig.baseInterval = 0.015

        // Define subrate factors (multipliers of base interval)
        subrateConfig.subrateFactor = 4      // 60ms when idle
        subrateConfig.subrateLatency = 10    // Can skip up to 10 events

        // Transition timing
        subrateConfig.continuationNumber = 2  // Events before subrate kicks in

        peripheral.setConnectionSubrate(subrateConfig) { error in
            if let error = error {
                print("Failed to set subrating: \(error)")
            } else {
                print("Connection subrating configured")
            }
        }
    }

    // Request immediate low-latency mode for time-sensitive operations
    func requestLowLatency(for peripheral: CBPeripheral) {
        peripheral.requestSubrateChange(factor: 1) { error in
            // Now operating at base interval (15ms)
            self.performTimeSensitiveOperation()
        }
    }

    // Return to power-saving mode
    func returnToLowPower(for peripheral: CBPeripheral) {
        peripheral.requestSubrateChange(factor: 4) { error in
            // Back to 60ms interval
        }
    }
}
```

### Benefits

- **Faster transitions**: Switch between power modes in microseconds instead of milliseconds
- **Better battery life**: Automatically reduce connection frequency when idle
- **Lower latency**: Quickly ramp up for time-sensitive operations

## Improved Privacy Controls

iOS 26 introduces new privacy APIs that give users more control over Bluetooth access while providing developers with clearer authorization flows.

### Granular Permissions

Apps can now request specific Bluetooth capabilities:

```swift
class PrivacyAwareManager {

    func requestPermissions() async throws {
        // Request only the capabilities you need
        let status = try await CBCentralManager.requestAuthorization(
            for: [
                .scanning,           // Discover nearby devices
                .connecting,         // Connect to peripherals
                .backgroundScanning  // Scan while backgrounded
            ]
        )

        switch status {
        case .authorized:
            print("Full access granted")
        case .partiallyAuthorized(let granted):
            print("Granted capabilities: \(granted)")
        case .denied:
            print("Access denied")
        @unknown default:
            break
        }
    }
}
```

### Privacy Manifest Requirements

iOS 26 requires apps to declare Bluetooth usage in the Privacy Manifest:

```xml
<!-- PrivacyInfo.xcprivacy -->
<dict>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryBluetooth</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>BLE.device-communication</string>
                <string>BLE.proximity-detection</string>
            </array>
        </dict>
    </array>
</dict>
```

### Device Identity Protection

New APIs help protect device identities while still enabling necessary functionality:

```swift
func centralManager(_ central: CBCentralManager,
                    didDiscover peripheral: CBPeripheral,
                    advertisementData: [String: Any],
                    rssi RSSI: NSNumber) {
    // New: Anonymized identifier that changes periodically
    let anonymousID = peripheral.anonymousIdentifier

    // Check if this is a device the user has previously interacted with
    if peripheral.hasUserRelationship {
        // Can access stable identifier
        let stableID = peripheral.identifier
    }
}
```

## LE Audio Enhancements

iOS 26 improves the integration between Core Bluetooth and Bluetooth LE Audio features.

### Broadcast Audio Scanning

Apps can now discover and interact with Bluetooth LE Audio broadcasts:

```swift
class LEAudioScanner: NSObject, CBCentralManagerDelegate {
    var centralManager: CBCentralManager!

    func scanForBroadcasts() {
        let options: [String: Any] = [
            CBCentralManagerScanOptionScanTypeKey: CBScanType.leAudioBroadcast
        ]

        centralManager.scanForPeripherals(
            withServices: nil,
            options: options
        )
    }

    func centralManager(_ central: CBCentralManager,
                        didDiscoverBroadcast broadcast: CBLEAudioBroadcast) {
        print("Found broadcast: \(broadcast.broadcastName ?? "Unknown")")
        print("Program info: \(broadcast.programInfo ?? "N/A")")
        print("Broadcast ID: \(broadcast.broadcastID)")

        // Check audio configuration
        for subgroup in broadcast.subgroups {
            print("Codec: \(subgroup.codecConfiguration)")
            print("Language: \(subgroup.language ?? "Unknown")")
        }
    }
}
```

### Auracast Integration

iOS 26 provides APIs for discovering and connecting to Auracast broadcasts in public venues:

```swift
class AuracastManager {

    func discoverNearbyAuracast() async -> [CBLEAudioBroadcast] {
        // Discover Auracast broadcasts with location context
        let broadcasts = try await CBLEAudioBroadcast.discover(
            timeout: 10.0,
            includeLocationContext: true
        )

        return broadcasts.filter { $0.isAuracast }
    }

    func joinBroadcast(_ broadcast: CBLEAudioBroadcast) async throws {
        // Request user permission to join public audio
        guard await broadcast.requestUserPermission() else {
            throw AuracastError.permissionDenied
        }

        // Sync to the broadcast
        try await broadcast.synchronize()

        // Route audio to system output
        try await broadcast.startReceiving()
    }
}
```

## Migration Guide

If you're updating from iOS 25, here are the key changes to be aware of:

### Deprecated APIs

```swift
// Deprecated in iOS 26
centralManager.scanForPeripherals(withServices: nil, options: nil)

// Use instead - explicit scan configuration
let config = CBScanConfiguration()
config.services = nil  // Scan for all services
config.allowDuplicates = false
centralManager.scanForPeripherals(with: config)
```

### New Required Capabilities

Add to your `Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>bluetooth-central</string>
    <string>bluetooth-peripheral</string>
    <!-- New in iOS 26 -->
    <string>bluetooth-ranging</string>
</array>
```

### Breaking Changes

1. **CBPeripheralManager initialization**: Now requires explicit queue specification
2. **Background restoration**: New restoration delegate protocol `CBRestorationDelegate`
3. **MTU negotiation**: Automatic MTU increase is now opt-in via connection options

### Adoption Checklist

- [ ] Update to Xcode 18 with iOS 26 SDK
- [ ] Add Privacy Manifest entries for Bluetooth usage
- [ ] Review and update background scanning logic
- [ ] Test Channel Sounding on supported hardware
- [ ] Migrate deprecated API calls
- [ ] Update connection parameter handling for subrating support

## Conclusion

iOS 26 brings meaningful improvements to Bluetooth Low Energy development. Channel Sounding enables precise distance measurement, enhanced background scanning improves battery life, and Connection Subrating provides dynamic power optimization. Combined with improved privacy controls and LE Audio support, these updates make it easier to build reliable, power-efficient, and privacy-respecting connected applications.

The BLE ecosystem continues to evolve, and Apple's commitment to adopting the latest Bluetooth standards ensures iOS developers have access to cutting-edge capabilities. Start experimenting with these new APIs today and prepare your apps for the next generation of connected experiences!

## References

- [Apple Core Bluetooth Documentation](https://developer.apple.com/documentation/corebluetooth)
- [WWDC26 Session: What's New in Core Bluetooth](https://developer.apple.com/videos/)
- [Bluetooth SIG Channel Sounding Specification](https://www.bluetooth.com/specifications/)
- [Bluetooth 6.0 Core Specification](https://www.bluetooth.com/specifications/specs/core-specification-6-0/)
- [Auracast Broadcast Audio](https://www.bluetooth.com/auracast/)
