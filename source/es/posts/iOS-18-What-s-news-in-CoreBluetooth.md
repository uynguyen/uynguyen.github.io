---
title: "iOS 18: ¿Qué hay de nuevo en CoreBluetooth?"
date: 2024-11-03 10:33:53
tags:
layout: post
permalink: es/posts/iOS-18-What-s-news-in-CoreBluetooth/
lang: es
---

![](/Post-Resources/AccessorySetupKit/cover.png "AccessorySetupKit")

`AccessorySetupKit`, introducido en iOS 18, revoluciona la forma en que los accesorios Bluetooth y Wi-Fi de terceros se integran con dispositivos iOS. Este framework ofrece una experiencia de configuración fluida, mejorando la comodidad para los usuarios y expandiendo las capacidades para los desarrolladores.
Mientras que `AccessorySetupKit` soporta el descubrimiento de dispositivos Bluetooth, Wi-Fi y de Red Local, esta publicación se enfocará específicamente en BLE (Bluetooth Low Energy). El proceso de configuración para dispositivos Wi-Fi y de Red Local sigue un enfoque similar.

<!-- more -->

## Características principales
A continuación, exploraremos las funcionalidades clave que hacen de `AccessorySetupKit` un cambio importante para la gestión de accesorios.
- **Proceso de Emparejamiento Simplificado**: Los usuarios ahora pueden emparejar o desemparejar accesorios y activar Bluetooth directamente dentro de la aplicación, eliminando la necesidad de ir a la configuración del sistema. Este enfoque simplificado mejora la experiencia del usuario y reduce el tiempo de configuración.
- **Gestión de Acceso Unificada**: Una vez que un accesorio está emparejado, aparece en la nueva sección "Accesorios" dentro de la configuración de Privacidad. Aquí, los usuarios pueden gestionar permisos y ver dispositivos conectados, proporcionando una ubicación centralizada para la gestión de accesorios.
- **Control Mejorado para Desarrolladores**: Los desarrolladores pueden definir filtros de escaneo y proporcionar imágenes y nombres personalizados para dispositivos, asegurando una experiencia de configuración con marca.

## Flujo de configuración
Puedes encontrar el proyecto de ejemplo proporcionado por Apple en [WWWDC24](https://developer.apple.com/videos/play/wwdc2024/10203/).
Para simular los accesorios, usé CoreBluetooth y definí mi perfil Bluetooth con dos UUIDs diferentes: `1FA2FD8A-17E0-4D3B-AF45-305DA6130E39` y `1FA2FD8A-17E0-4D3B-AF45-305DA6130E38`, luego comencé a anunciarlos.
A continuación, necesitas modificar el servicio UUID de escaneo en tu archivo Info.plist para que coincida con tus perfiles Bluetooth. Esto informa al sistema sobre los tipos de accesorios que tu aplicación soporta.
Apple soporta diferentes tipos de filtros, como:

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

A continuación, crea una `ASAccessorySession`. Esta sesión es esencial para gestionar el proceso de configuración de accesorios, permitiéndote presentar el selector de accesorios a los usuarios y manejar varios eventos relacionados con accesorios de manera eficiente.

```js
private var session = ASAccessorySession()
```

Luego, presenta el `Accessory Picker`. Esto te permite mostrar la interfaz del selector, permitiendo a los usuarios seleccionar y emparejar fácilmente sus accesorios con la aplicación.

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

El usuario ahora verá una lista de dispositivos descubiertos y puede seleccionar uno para comenzar el proceso de emparejamiento, siguiendo el flujo estándar.

```js
private func handleSessionEvent(event: ASAccessoryEvent) {
    switch event.eventType {
        case .accessoryAdded, .accessoryChanged:
            guard let device = event.accessory else { return }
            # Save your device
        case .activated:
            guard let device = session.accessories.first else { return }
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

## ¿Qué es importante?

`AccessorySetupKit` simplifica el proceso de configuración para los usuarios, haciéndolo más intuitivo y eficiente mientras elimina la complejidad frecuentemente asociada con la conexión de accesorios de terceros.
Para los desarrolladores, proporciona un framework de integración estandarizado, asegurando experiencias de usuario consistentes y bases de código simplificadas. Al adoptar `AccessorySetupKit`, los desarrolladores pueden ofrecer una experiencia fluida y cohesiva que alinea los accesorios de terceros con los altos estándares que los usuarios asocian con los productos Apple.


## Referencias
[Meet AccessorySetupKit, WWWDC 2024](https://developer.apple.com/videos/play/wwdc2024/10203/)
[iOS 18 AccessorySetupKit: Everything BLE Developers Need To Know](https://punchthrough.com/ios18-accessorysetupkit-everything-ble-developers-need-to-know/)

