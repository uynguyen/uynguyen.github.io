---
title: "Best Practice: Bluetooth Low Energy in Different Platforms"
date: 2026-03-14 10:00:00
tags: [BLE, iOS, Flutter, React Native, Cross Platform]
thumbnail: /Post-Resources/BLE-CrossPlatform/cover.png
---

Bluetooth Low Energy (BLE) is a core technology behind fitness trackers, smart home devices, medical equipment, and many other IoT products. When building a BLE-enabled app, you often face a choice: native iOS, Flutter, or React Native?

Rather than relying on third-party BLE libraries for Flutter or React Native, the approach I recommend — and practice — is to write all BLE logic in native Swift using CoreBluetooth, then expose it to each cross-platform framework via its native bridge mechanism. For React Native, that means Native Modules. For Flutter, that means Platform Channels.

This gives you full control of the BLE stack, consistent behavior across all your projects, and zero dependency on external BLE packages that may lag behind iOS SDK updates.

<!-- more -->

> This post focuses on the iOS (CoreBluetooth) side. For Android BLE and its comparison with iOS, see [Best practice: iOS vs Android Bluetooth](/2024/06/30/Best-practice-iOS-vs-Android-Bluetooth/).

---

## The Architecture

The idea is simple: keep CoreBluetooth as the single source of truth for BLE, and treat React Native / Flutter as the UI layer that communicates with it.

```
┌──────────────────────────────┐
│  Flutter / React Native (UI) │
└────────────┬─────────────────┘
             │ Platform Channel / Native Module
┌────────────▼─────────────────┐
│   Native BLE Layer (Swift)   │
│       CoreBluetooth          │
└──────────────────────────────┘
```

The native layer handles scanning, connecting, discovering services, reading and writing characteristics. The cross-platform layer only needs to call a method or listen to an event stream.

---

## 1. The Native BLE Layer (CoreBluetooth)

This code is shared and reused across all platforms. A clean `BLEManager` class encapsulates all CoreBluetooth logic.

### Setup & Permissions

Add to `Info.plist`:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>This app uses Bluetooth to connect to your device.</string>
```

For background scanning, also add to `Info.plist` and enable the capability in Xcode:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>bluetooth-central</string>
</array>
```

### BLEManager

```swift
import CoreBluetooth

protocol BLEManagerDelegate: AnyObject {
    func didUpdateState(_ state: CBManagerState)
    func didDiscoverDevice(name: String, uuid: String, rssi: Int)
    func didConnect(uuid: String)
    func didDisconnect(uuid: String, error: Error?)
    func didReceiveData(_ data: Data, characteristicUUID: String)
}

class BLEManager: NSObject {
    static let shared = BLEManager()
    weak var delegate: BLEManagerDelegate?

    private var centralManager: CBCentralManager!
    private var connectedPeripheral: CBPeripheral?
    private var characteristics: [String: CBCharacteristic] = [:]

    private override init() {
        super.init()
        centralManager = CBCentralManager(
            delegate: self,
            queue: nil,
            options: [CBCentralManagerOptionRestoreIdentifierKey: "app.ble.central"]
        )
    }

    func startScan(serviceUUIDs: [String]? = nil) {
        guard centralManager.state == .poweredOn else { return }
        let uuids = serviceUUIDs?.map { CBUUID(string: $0) }
        centralManager.scanForPeripherals(
            withServices: uuids,
            options: [CBCentralManagerScanOptionAllowDuplicatesKey: false]
        )
    }

    func stopScan() {
        centralManager.stopScan()
    }

    func connect(uuid: String) {
        guard let peripheral = retrievePeripheral(uuid: uuid) else { return }
        centralManager.connect(peripheral, options: nil)
    }

    func disconnect() {
        guard let peripheral = connectedPeripheral else { return }
        centralManager.cancelPeripheralConnection(peripheral)
    }

    func write(data: Data, characteristicUUID: String, withResponse: Bool) {
        guard let characteristic = characteristics[characteristicUUID.uppercased()],
              let peripheral = connectedPeripheral else { return }
        let type: CBCharacteristicWriteType = withResponse ? .withResponse : .withoutResponse
        peripheral.writeValue(data, for: characteristic, type: type)
    }

    private func retrievePeripheral(uuid: String) -> CBPeripheral? {
        let knownUUIDs = [UUID(uuidString: uuid)].compactMap { $0 }
        return centralManager.retrievePeripherals(withIdentifiers: knownUUIDs).first
    }
}
```

### CBCentralManagerDelegate

```swift
extension BLEManager: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        delegate?.didUpdateState(central.state)
    }

    func centralManager(_ central: CBCentralManager,
                        didDiscover peripheral: CBPeripheral,
                        advertisementData: [String: Any],
                        rssi RSSI: NSNumber) {
        delegate?.didDiscoverDevice(
            name: peripheral.name ?? "Unknown",
            uuid: peripheral.identifier.uuidString,
            rssi: RSSI.intValue
        )
    }

    func centralManager(_ central: CBCentralManager,
                        didConnect peripheral: CBPeripheral) {
        connectedPeripheral = peripheral
        peripheral.delegate = self
        peripheral.discoverServices(nil)
        delegate?.didConnect(uuid: peripheral.identifier.uuidString)
    }

    func centralManager(_ central: CBCentralManager,
                        didDisconnectPeripheral peripheral: CBPeripheral,
                        error: Error?) {
        connectedPeripheral = nil
        characteristics.removeAll()
        delegate?.didDisconnect(uuid: peripheral.identifier.uuidString, error: error)
    }

    func centralManager(_ central: CBCentralManager,
                        willRestoreState dict: [String: Any]) {
        if let peripherals = dict[CBCentralManagerRestoredStatePeripheralsKey]
            as? [CBPeripheral] {
            connectedPeripheral = peripherals.first
            connectedPeripheral?.delegate = self
        }
    }
}
```

### CBPeripheralDelegate

```swift
extension BLEManager: CBPeripheralDelegate {
    func peripheral(_ peripheral: CBPeripheral,
                    didDiscoverServices error: Error?) {
        guard let services = peripheral.services else { return }
        for service in services {
            peripheral.discoverCharacteristics(nil, for: service)
        }
    }

    func peripheral(_ peripheral: CBPeripheral,
                    didDiscoverCharacteristicsFor service: CBService,
                    error: Error?) {
        guard let chars = service.characteristics else { return }
        for characteristic in chars {
            characteristics[characteristic.uuid.uuidString.uppercased()] = characteristic
            if characteristic.properties.contains(.notify)
                || characteristic.properties.contains(.indicate) {
                peripheral.setNotifyValue(true, for: characteristic)
            }
        }
    }

    func peripheral(_ peripheral: CBPeripheral,
                    didUpdateValueFor characteristic: CBCharacteristic,
                    error: Error?) {
        guard let data = characteristic.value else { return }
        delegate?.didReceiveData(data, characteristicUUID: characteristic.uuid.uuidString)
    }

    // Large payload: wait for this before sending the next chunk
    func peripheralIsReady(toSendWriteWithoutResponse peripheral: CBPeripheral) {
        // Resume chunked write
    }
}
```

This `BLEManager` is the foundation. Now let's expose it to each platform.

---

## 2. Bridging to React Native

React Native communicates with native code via **Native Modules**. You create a Swift class that:
- Inherits from `RCTEventEmitter` to push events (scan results, data) to JavaScript.
- Exposes methods via `@objc` and an Objective-C `.m` bridge file.

### BLEModule.swift

```swift
import Foundation

@objc(BLEModule)
class BLEModule: RCTEventEmitter, BLEManagerDelegate {

    override init() {
        super.init()
        BLEManager.shared.delegate = self
    }

    override static func requiresMainQueueSetup() -> Bool { true }

    override func supportedEvents() -> [String]! {
        return ["onStateChange", "onDeviceFound", "onConnect", "onDisconnect", "onDataReceived"]
    }

    // MARK: - Exposed to JS

    @objc func startScan(_ serviceUUIDs: [String]?) {
        BLEManager.shared.startScan(serviceUUIDs: serviceUUIDs)
    }

    @objc func stopScan() {
        BLEManager.shared.stopScan()
    }

    @objc func connect(_ uuid: String) {
        BLEManager.shared.connect(uuid: uuid)
    }

    @objc func disconnect() {
        BLEManager.shared.disconnect()
    }

    @objc func writeData(_ base64: String,
                         characteristicUUID: String,
                         withResponse: Bool) {
        guard let data = Data(base64Encoded: base64) else { return }
        BLEManager.shared.write(data: data,
                                characteristicUUID: characteristicUUID,
                                withResponse: withResponse)
    }

    // MARK: - BLEManagerDelegate → send events to JS

    func didUpdateState(_ state: CBManagerState) {
        sendEvent(withName: "onStateChange", body: ["state": state.rawValue])
    }

    func didDiscoverDevice(name: String, uuid: String, rssi: Int) {
        sendEvent(withName: "onDeviceFound",
                  body: ["name": name, "uuid": uuid, "rssi": rssi])
    }

    func didConnect(uuid: String) {
        sendEvent(withName: "onConnect", body: ["uuid": uuid])
    }

    func didDisconnect(uuid: String, error: Error?) {
        sendEvent(withName: "onDisconnect",
                  body: ["uuid": uuid, "error": error?.localizedDescription as Any])
    }

    func didReceiveData(_ data: Data, characteristicUUID: String) {
        sendEvent(withName: "onDataReceived",
                  body: ["uuid": characteristicUUID, "value": data.base64EncodedString()])
    }
}
```

### BLEModule.m (Objective-C bridge)

```objc
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(BLEModule, RCTEventEmitter)
RCT_EXTERN_METHOD(startScan:(NSArray *)serviceUUIDs)
RCT_EXTERN_METHOD(stopScan)
RCT_EXTERN_METHOD(connect:(NSString *)uuid)
RCT_EXTERN_METHOD(disconnect)
RCT_EXTERN_METHOD(writeData:(NSString *)base64
                  characteristicUUID:(NSString *)characteristicUUID
                  withResponse:(BOOL)withResponse)
@end
```

### Usage in JavaScript / TypeScript

```typescript
import { NativeModules, NativeEventEmitter } from 'react-native';

const { BLEModule } = NativeModules;
const bleEmitter = new NativeEventEmitter(BLEModule);

// Listen to events
bleEmitter.addListener('onDeviceFound', (device) => {
    console.log(`Found: ${device.name} (${device.uuid}) RSSI: ${device.rssi}`);
});

bleEmitter.addListener('onDataReceived', ({ uuid, value }) => {
    const bytes = Uint8Array.from(atob(value), c => c.charCodeAt(0));
    console.log('Received from', uuid, bytes);
});

// Call native methods
BLEModule.startScan(['YOUR-SERVICE-UUID']);
BLEModule.connect('PERIPHERAL-UUID');
BLEModule.writeData(btoa(String.fromCharCode(0x01, 0x02)), 'CHAR-UUID', true);
```

---

## 3. Bridging to Flutter

Flutter communicates with native code via **Platform Channels**. Two channel types are relevant for BLE:

- `MethodChannel`: for invoking native methods from Dart (scan, connect, write).
- `EventChannel`: for streaming native events to Dart (scan results, data received).

### AppDelegate.swift — Register Channels

```swift
import Flutter

@main
class AppDelegate: FlutterAppDelegate {
    private let methodChannelName = "app.ble/methods"
    private let eventChannelName  = "app.ble/events"

    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let controller = window?.rootViewController as! FlutterViewController
        let messenger  = controller.binaryMessenger

        // Method channel: Dart → Native calls
        let methodChannel = FlutterMethodChannel(name: methodChannelName,
                                                 binaryMessenger: messenger)
        methodChannel.setMethodCallHandler(handleMethodCall)

        // Event channel: Native → Dart stream
        let eventChannel = FlutterEventChannel(name: eventChannelName,
                                               binaryMessenger: messenger)
        eventChannel.setStreamHandler(BLEEventHandler.shared)

        BLEManager.shared.delegate = BLEEventHandler.shared

        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }

    private func handleMethodCall(_ call: FlutterMethodCall,
                                  result: @escaping FlutterResult) {
        switch call.method {
        case "startScan":
            let args = call.arguments as? [String: Any]
            let uuids = args?["serviceUUIDs"] as? [String]
            BLEManager.shared.startScan(serviceUUIDs: uuids)
            result(nil)

        case "stopScan":
            BLEManager.shared.stopScan()
            result(nil)

        case "connect":
            if let uuid = (call.arguments as? [String: Any])?["uuid"] as? String {
                BLEManager.shared.connect(uuid: uuid)
            }
            result(nil)

        case "disconnect":
            BLEManager.shared.disconnect()
            result(nil)

        case "writeData":
            if let args    = call.arguments as? [String: Any],
               let base64  = args["value"] as? String,
               let data    = Data(base64Encoded: base64),
               let charUUID = args["characteristicUUID"] as? String,
               let withResponse = args["withResponse"] as? Bool {
                BLEManager.shared.write(data: data,
                                        characteristicUUID: charUUID,
                                        withResponse: withResponse)
            }
            result(nil)

        default:
            result(FlutterMethodNotImplemented)
        }
    }
}
```

### BLEEventHandler.swift — EventChannel Stream Handler

```swift
import Flutter

class BLEEventHandler: NSObject, FlutterStreamHandler, BLEManagerDelegate {
    static let shared = BLEEventHandler()
    private var eventSink: FlutterEventSink?

    func onListen(withArguments arguments: Any?,
                  eventSink: @escaping FlutterEventSink) -> FlutterError? {
        self.eventSink = eventSink
        return nil
    }

    func onCancel(withArguments arguments: Any?) -> FlutterError? {
        eventSink = nil
        return nil
    }

    private func send(_ event: [String: Any]) {
        DispatchQueue.main.async { self.eventSink?(event) }
    }

    // MARK: - BLEManagerDelegate

    func didUpdateState(_ state: CBManagerState) {
        send(["type": "stateChange", "state": state.rawValue])
    }

    func didDiscoverDevice(name: String, uuid: String, rssi: Int) {
        send(["type": "deviceFound", "name": name, "uuid": uuid, "rssi": rssi])
    }

    func didConnect(uuid: String) {
        send(["type": "connect", "uuid": uuid])
    }

    func didDisconnect(uuid: String, error: Error?) {
        send(["type": "disconnect", "uuid": uuid,
              "error": error?.localizedDescription as Any])
    }

    func didReceiveData(_ data: Data, characteristicUUID: String) {
        send(["type": "dataReceived",
              "uuid": characteristicUUID,
              "value": data.base64EncodedString()])
    }
}
```

### Usage in Dart

```dart
import 'dart:convert';
import 'package:flutter/services.dart';

class BLEService {
    static const _methods = MethodChannel('app.ble/methods');
    static const _events  = EventChannel('app.ble/events');

    Stream<Map<String, dynamic>> get eventStream =>
        _events.receiveBroadcastStream().map((e) => Map<String, dynamic>.from(e));

    Future<void> startScan({List<String>? serviceUUIDs}) =>
        _methods.invokeMethod('startScan', {'serviceUUIDs': serviceUUIDs});

    Future<void> stopScan() => _methods.invokeMethod('stopScan');

    Future<void> connect(String uuid) =>
        _methods.invokeMethod('connect', {'uuid': uuid});

    Future<void> disconnect() => _methods.invokeMethod('disconnect');

    Future<void> writeData(Uint8List bytes, String characteristicUUID,
                           {bool withResponse = true}) =>
        _methods.invokeMethod('writeData', {
            'value': base64.encode(bytes),
            'characteristicUUID': characteristicUUID,
            'withResponse': withResponse,
        });
}

// Example usage
final ble = BLEService();

ble.eventStream.listen((event) {
    switch (event['type']) {
        case 'deviceFound':
            print('Found: ${event['name']} RSSI: ${event['rssi']}');
            break;
        case 'dataReceived':
            final bytes = base64.decode(event['value']);
            print('Data from ${event['uuid']}: $bytes');
            break;
    }
});

await ble.startScan(serviceUUIDs: ['YOUR-SERVICE-UUID']);
await ble.connect('PERIPHERAL-UUID');
await ble.writeData(Uint8List.fromList([0x01, 0x02]), 'CHAR-UUID');
```

---

## 4. Platform Comparison

| Concern | Native iOS | React Native | Flutter |
|---|---|---|---|
| Bridge mechanism | — | Native Module + `RCTEventEmitter` | `MethodChannel` + `EventChannel` |
| Method call direction | — | JS → `@objc` method | Dart → `setMethodCallHandler` |
| Event/stream direction | — | `sendEvent(withName:body:)` | `FlutterEventSink` |
| Data encoding | `Data` | Base64 string | Base64 string (via `Uint8List`) |
| Background BLE | Full support | Requires `bluetooth-central` background mode + state restore key | Same as native iOS — must be configured natively |
| State restoration | `CBCentralManagerOptionRestoreIdentifierKey` | Same — pass to `BLEManager` | Same — handled in native layer |
| Boilerplate effort | Low | Medium (`.m` bridge file needed) | Medium (channel setup in `AppDelegate`) |
| BLE logic location | Swift | Swift (bridged) | Swift (bridged) |

The key insight: **BLE logic is identical across all three**. Only the bridge layer differs.

---

## 5. Best Practices

### General
- **Always filter by service UUID** when scanning. An unfiltered scan returns every visible device and drains the battery.
- **Stop scanning** as soon as you've found your target device.
- **Hold a strong reference** to `CBPeripheral`. If it is deallocated, the connection silently drops.
- **Cache characteristics** after discovery. Never rediscover on every read/write.
- **Test on a real device** — CoreBluetooth does not work in the iOS Simulator.

### Writing Data
- Use `.withResponse` for commands that require acknowledgment.
- Use `.withoutResponse` for streaming/high-throughput writes, but always wait for `peripheralIsReady(toSendWriteWithoutResponse:)` before the next chunk.
- Check `peripheral.maximumWriteValueLength(for:)` before sending and chunk your data accordingly.

```swift
func send(data: Data, to peripheral: CBPeripheral, char: CBCharacteristic) {
    let mtu = peripheral.maximumWriteValueLength(for: .withoutResponse)
    var offset = 0
    while offset < data.count {
        let end = min(offset + mtu, data.count)
        peripheral.writeValue(data[offset..<end], for: char, type: .withoutResponse)
        offset = end
    }
}
```

### Background BLE
- Add `bluetooth-central` to `UIBackgroundModes`.
- Always use a `CBCentralManagerOptionRestoreIdentifierKey` so iOS can re-launch your app and restore state after it was terminated in the background.
- Implement `centralManager(_:willRestoreState:)` to re-attach to previously connected peripherals.
- Keep background delegate callbacks short — long tasks will get your app killed.

### React Native Specific
- Always `removeAllListeners` for BLE events when the component unmounts to avoid memory leaks.

```typescript
useEffect(() => {
    const sub = bleEmitter.addListener('onDataReceived', handler);
    return () => sub.remove();
}, []);
```

### Flutter Specific
- Use a broadcast stream (`receiveBroadcastStream`) so multiple widgets can listen to the same event channel.
- Always call `stopScan()` or `disconnect()` in `dispose()` to avoid orphaned native state.

```dart
@override
void dispose() {
    ble.stopScan();
    super.dispose();
}
```

---

## Conclusion

Rather than depending on third-party BLE libraries that abstract away CoreBluetooth, building a thin native Swift layer and bridging it gives you:

- **Full access** to every CoreBluetooth feature (state restoration, background modes, MTU control, etc.)
- **Consistency** — the same BLE logic serves your native iOS, React Native, and Flutter apps
- **Stability** — you're not blocked by an unmaintained third-party package when a new iOS version ships

The bridge overhead is small: a `.m` file and some `@objc` decorators for React Native, and a `MethodChannel` + `EventChannel` setup for Flutter. In exchange, you get a BLE layer you fully own and understand.

## References

[1] [Apple CoreBluetooth Documentation](https://developer.apple.com/documentation/corebluetooth)
[2] [React Native Native Modules (iOS)](https://reactnative.dev/docs/native-modules-ios)
[3] [Flutter Platform Channels](https://docs.flutter.dev/platform-integration/platform-channels)
[4] [Best practice: iOS vs Android Bluetooth](/2024/06/30/Best-practice-iOS-vs-Android-Bluetooth/)
[5] [Best practice: How to deal with BLE in Background](/2020/03/08/Best-practice-How-to-deal-with-Bluetooth-Low-Energy-in-background/)
[6] [Series: React Native and BLE Part 1](/2021/12/25/Series-React-Native-and-BLE-Part-1-Building-BLE-framework-for-iOS/)
