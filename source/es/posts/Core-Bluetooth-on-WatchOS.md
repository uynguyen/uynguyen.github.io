---
title: Core Bluetooth en WatchOS
tags: [WatchOS, BLE]
layout: post
lang: es
---

![](/Post-Resources/watchos/banner.png "WatchOS banner")
¿Alguna vez pensaste en agregar una Watch App a tu producto? ¿Te preguntas cómo hacer que CoreBluetooth funcione en tu Watch App? ¡Estás en el lugar correcto! Este tutorial es tu guía definitiva. En esta publicación, te llevaremos paso a paso a través del proceso de integrar datos de dispositivos Bluetooth en tus aplicaciones de Apple Watch.

<!-- more -->

Descubre cómo aprovechar el potencial de los dispositivos Bluetooth para mejorar la experiencia del usuario de tu Apple Watch. También proporcionaremos información sobre cómo superar los desafíos comunes al trabajar con Core Bluetooth en watchOS. Ya seas un profesional experimentado o un principiante, este tutorial simplifica el proceso para ti.

**_Entornos: XCode 15.0.1, iOS 17.0.3, WatchOS 10.1.1, Swift 5._**

## Configurar proyecto

Comienza yendo a la configuración de tu proyecto, luego selecciona `File` > `New Target` > `Watch OS` > `App`, y completa los campos requeridos. Una vez hecho, Xcode integrará perfectamente un nuevo proyecto de watch app en tu workspace existente.

![](/Post-Resources/watchos/create_project.png "Create project")

## Configuración de Bluetooth

Esencialmente, todos los métodos y eventos de Bluetooth en WatchOS se parecen mucho a los de iOS. Si ya tienes una clase `BluetoothManager` que maneja varias funciones de Bluetooth, como iniciar el escaneo o conectarse a un peripheral, y gestiona los delegates de Bluetooth, estás en buena forma.

```swift
class BluetoothManager : NSObject, CBCentralManagerDelegate {
    private var central: CBCentralManager!

    override init() {
        super.init()
        central = CBCentralManager(
            delegate: self,
            queue: nil,
            options: [:]
        )
    }

    func startScanning() {
        central.scanForPeripherals(withServices: nil, options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
    }

    func connect(periperal: CBPeripheral) {
        central.connect(periperal)
    }
    // El resto omitido
}
```

Para ahorrar tiempo y evitar duplicar código, puedes compartir fácilmente el archivo que contiene la clase `BluetoothManager` con ambos targets de tu aplicación iOS y watch app. Con esta configuración, puedes usar la clase `BluetoothManager` en tu watch app de la misma manera que lo harías en tu aplicación iOS.

```swift
struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hello, world!")
        }
        .padding()
        .onAppear(perform: {
            BluetoothManager.shared.startScanning()
        })
    }
}
```

## Notas importantes

- Para probar la funcionalidad Bluetooth de tu proyecto, es esencial ejecutarlo en un Apple Watch real ya que el simulador no soporta Bluetooth.
- Ten en cuenta que el tiempo de conexión en el Apple Watch puede verse influenciado por el estado de la batería del dispositivo, incluso si el modo de bajo consumo no está habilitado.
- Asegúrate de agregar manualmente la capacidad necesaria al archivo plist de la Watch App. Este paso es crucial; de lo contrario, tu aplicación no podrá escanear, conectar o ejecutar ningún comando Bluetooth cuando esté en background.

```
<key>UIBackgroundModes</key>
<array>
    <string>bluetooth-central</string>
</array>
```

- A diferencia de Bluetooth en iOS, donde puedes aprovechar State preservation and restoration para despertar la aplicación si ha sido terminada por el sistema debido a eventos Bluetooth (ver Mejores prácticas: [Best practice: How to deal with Bluetooth Low Energy in background](/2018/07/23/Best-practice-How-to-deal-with-Bluetooth-Low-Energy-in-background/)), es importante notar que no existe un mecanismo equivalente de State preservation and restoration en watchOS.
  ![](/Post-Resources/watchos/state_preservation.png "State Preservation & Restoration")
- El tiempo de conexión en iOS y WatchOS es bastante igual. Medí la API de Connect realizando 200 llamadas (mismos dispositivos, mismo entorno de pruebas). El promedio en iOS es aproximadamente 0.69 segundos, mientras que en WatchOS es 0.78 segundos.
  ![](/Post-Resources/watchos/connection_report.png "Connection report")

## Conclusión

En resumen, al aprender cómo conectar tu Apple Watch a dispositivos Bluetooth, has potenciado las características de tu reloj. Este tutorial te ha guiado a través del uso de Core Bluetooth en watchOS, manejando problemas comunes en el camino. Ya seas un profesional o un principiante, lo hemos desglosado para ti. Ahora, tu Watch App no solo funciona bien sino que también impresiona a los usuarios. Mientras continúas creando aplicaciones, usa estas habilidades para crear experiencias geniales y fluidas. ¡Feliz codificación!

## Referencias

[1] [WWDC 2021](https://developer.apple.com/videos/play/wwdc2021/10005)
[2] [WWDC 2022](https://developer.apple.com/videos/play/wwdc2022/10135/)
[3] [Core Bluetooth in watchOS Tutorial](https://www.kodeco.com/336-core-bluetooth-in-watchos-tutorial)
