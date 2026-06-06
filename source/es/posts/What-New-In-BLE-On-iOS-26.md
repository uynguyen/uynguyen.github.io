---
title: '¿Qué hay de nuevo en BLE en iOS 26?'
date: 2026-01-30 10:00:00
tags: [iOS, BLE, WWDC26]
lang: es
layout: post
thumbnail: /Post-Resources/BLEiOS26/cover.png
---

Apple continúa mejorando las capacidades de Bluetooth Low Energy en iOS 26, trayendo nuevas características y mejoras para los desarrolladores que construyen experiencias conectadas. En este artículo, exploraremos las últimas adiciones a Core Bluetooth y cómo pueden beneficiar a tus aplicaciones.

<!-- more -->

## Descripción general

iOS 26 introduce varias actualizaciones significativas al framework Core Bluetooth:

- **Soporte para Channel Sounding**: Medición de distancia de alta precisión usando Bluetooth 6.0 Channel Sounding
- **Escaneo en segundo plano mejorado**: Nuevos modos en segundo plano con programación inteligente
- **Connection Subrating**: Ajuste dinámico de parámetros de conexión para mejor eficiencia energética
- **Controles de privacidad mejorados**: Nuevas APIs de autorización y flujos de consentimiento del usuario
- **Mejoras en LE Audio**: Mejor integración con las características de Bluetooth LE Audio

¡Vamos a profundizar en cada una de estas emocionantes actualizaciones!

## Soporte para Channel Sounding

Una de las características más anticipadas en iOS 26 es el soporte para **Bluetooth 6.0 Channel Sounding**. Esta tecnología permite la medición de distancia a nivel de centímetros entre dispositivos, una mejora significativa sobre la medición basada en RSSI.

### ¿Qué es Channel Sounding?

Channel Sounding (anteriormente conocido como High Accuracy Distance Measurement o HADM) utiliza mediciones basadas en fase y tiempo de ida y vuelta para calcular distancias precisas entre dos dispositivos Bluetooth. A diferencia de RSSI, que puede verse afectado por factores ambientales, Channel Sounding proporciona precisión consistente independientemente de obstáculos o reflexiones.

### Nuevas APIs

iOS 26 introduce la clase `CBChannelSounding` y APIs relacionadas:

```swift
import CoreBluetooth

class RangingManager: NSObject, CBCentralManagerDelegate, CBChannelSoundingDelegate {
    var centralManager: CBCentralManager!
    var channelSounding: CBChannelSounding?

    func startRanging(with peripheral: CBPeripheral) {
        // Verificar si Channel Sounding es compatible
        guard CBChannelSounding.isSupported else {
            print("Channel Sounding no es compatible en este dispositivo")
            return
        }

        // Crear sesión de Channel Sounding
        let config = CBChannelSoundingConfiguration()
        config.mode = .roundTripTime  // o .phaseBasedRanging
        config.updateInterval = 0.1   // actualizaciones cada 100ms

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
        print("Distancia: \(distance.meters) metros")
        print("Confianza: \(distance.confidence)")
        print("Azimut: \(distance.azimuth ?? 0) grados")
    }

    func channelSounding(_ channelSounding: CBChannelSounding,
                         didFailWithError error: Error) {
        print("La medición falló: \(error.localizedDescription)")
    }
}
```

### Casos de uso

Channel Sounding abre nuevas posibilidades para las aplicaciones iOS:

- **Navegación interior precisa**: Guiar a los usuarios con precisión a nivel de centímetros
- **Seguimiento de activos**: Localizar objetos con precisión sin precedentes
- **Automatización basada en proximidad**: Activar acciones basadas en distancias exactas
- **Audio espacial**: Posicionar fuentes de audio con precisión en espacio 3D

## Escaneo en segundo plano mejorado

iOS 26 introduce un nuevo modo de escaneo en segundo plano que equilibra la eficiencia de descubrimiento con la duración de la batería.

### Programación de escaneo inteligente

La nueva API `CBScanSchedule` permite a los desarrolladores definir patrones de escaneo inteligentes:

```swift
class BackgroundScanner: NSObject, CBCentralManagerDelegate {
    var centralManager: CBCentralManager!

    func configureBackgroundScanning() {
        // Crear un horario de escaneo para operación en segundo plano
        let schedule = CBScanSchedule()

        // Escanear durante 2 segundos cada 30 segundos
        schedule.scanDuration = 2.0
        schedule.scanInterval = 30.0

        // Aumentar la frecuencia cuando se han visto dispositivos recientemente
        schedule.adaptiveMode = .recentActivity

        // Definir reglas basadas en tiempo
        schedule.addTimeRule(
            CBScanTimeRule(
                startHour: 8,
                endHour: 18,
                scanInterval: 15.0  // Más frecuente durante horas de trabajo
            )
        )

        // Aplicar el horario
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

### Mejoras en la entrega en segundo plano

iOS 26 también mejora cómo se entregan los resultados de escaneo a las aplicaciones en segundo plano:

```swift
func centralManager(_ central: CBCentralManager,
                    didDiscover peripheral: CBPeripheral,
                    advertisementData: [String: Any],
                    rssi RSSI: NSNumber) {
    // Nuevo: Acceder al contexto de entrega
    if let context = advertisementData[CBAdvertisementDataDeliveryContextKey] as? CBDeliveryContext {
        print("Descubierto en: \(context.mode)")  // .foreground, .background, .suspended
        print("Tiempo desde el escaneo: \(context.latency) segundos")
        print("Tamaño del lote: \(context.batchCount)")
    }
}
```

## Connection Subrating

Connection Subrating es una característica de Bluetooth 5.3 que iOS 26 ahora expone completamente a los desarrolladores. Permite el ajuste dinámico de los parámetros de conexión sin la sobrecarga de una actualización completa de parámetros.

### Cómo funciona

En lugar de negociar nuevos parámetros de conexión (lo que requiere múltiples intercambios de paquetes), Connection Subrating te permite cambiar entre "subrates" predefinidos instantáneamente:

```swift
class ConnectionManager: NSObject, CBPeripheralDelegate {

    func configureConnectionSubrating(for peripheral: CBPeripheral) {
        // Definir parámetros de subrating
        let subrateConfig = CBConnectionSubrateConfiguration()

        // Intervalo de conexión base: 15ms
        subrateConfig.baseInterval = 0.015

        // Definir factores de subrate (multiplicadores del intervalo base)
        subrateConfig.subrateFactor = 4      // 60ms cuando está inactivo
        subrateConfig.subrateLatency = 10    // Puede omitir hasta 10 eventos

        // Tiempo de transición
        subrateConfig.continuationNumber = 2  // Eventos antes de que se active el subrate

        peripheral.setConnectionSubrate(subrateConfig) { error in
            if let error = error {
                print("Error al establecer subrating: \(error)")
            } else {
                print("Connection subrating configurado")
            }
        }
    }

    // Solicitar modo de baja latencia inmediata para operaciones sensibles al tiempo
    func requestLowLatency(for peripheral: CBPeripheral) {
        peripheral.requestSubrateChange(factor: 1) { error in
            // Ahora operando en intervalo base (15ms)
            self.performTimeSensitiveOperation()
        }
    }

    // Volver al modo de bajo consumo
    func returnToLowPower(for peripheral: CBPeripheral) {
        peripheral.requestSubrateChange(factor: 4) { error in
            // De vuelta a intervalo de 60ms
        }
    }
}
```

### Beneficios

- **Transiciones más rápidas**: Cambiar entre modos de energía en microsegundos en lugar de milisegundos
- **Mejor duración de batería**: Reducir automáticamente la frecuencia de conexión cuando está inactivo
- **Menor latencia**: Aumentar rápidamente para operaciones sensibles al tiempo

## Controles de privacidad mejorados

iOS 26 introduce nuevas APIs de privacidad que dan a los usuarios más control sobre el acceso a Bluetooth mientras proporcionan a los desarrolladores flujos de autorización más claros.

### Permisos granulares

Las aplicaciones ahora pueden solicitar capacidades específicas de Bluetooth:

```swift
class PrivacyAwareManager {

    func requestPermissions() async throws {
        // Solicitar solo las capacidades que necesitas
        let status = try await CBCentralManager.requestAuthorization(
            for: [
                .scanning,           // Descubrir dispositivos cercanos
                .connecting,         // Conectar a periféricos
                .backgroundScanning  // Escanear mientras está en segundo plano
            ]
        )

        switch status {
        case .authorized:
            print("Acceso completo otorgado")
        case .partiallyAuthorized(let granted):
            print("Capacidades otorgadas: \(granted)")
        case .denied:
            print("Acceso denegado")
        @unknown default:
            break
        }
    }
}
```

### Requisitos del Privacy Manifest

iOS 26 requiere que las aplicaciones declaren el uso de Bluetooth en el Privacy Manifest:

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

### Protección de identidad del dispositivo

Las nuevas APIs ayudan a proteger las identidades de los dispositivos mientras permiten la funcionalidad necesaria:

```swift
func centralManager(_ central: CBCentralManager,
                    didDiscover peripheral: CBPeripheral,
                    advertisementData: [String: Any],
                    rssi RSSI: NSNumber) {
    // Nuevo: Identificador anónimo que cambia periódicamente
    let anonymousID = peripheral.anonymousIdentifier

    // Verificar si este es un dispositivo con el que el usuario ha interactuado previamente
    if peripheral.hasUserRelationship {
        // Puede acceder al identificador estable
        let stableID = peripheral.identifier
    }
}
```

## Mejoras en LE Audio

iOS 26 mejora la integración entre Core Bluetooth y las características de Bluetooth LE Audio.

### Escaneo de Audio Broadcast

Las aplicaciones ahora pueden descubrir e interactuar con transmisiones de Bluetooth LE Audio:

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
        print("Transmisión encontrada: \(broadcast.broadcastName ?? "Desconocido")")
        print("Info del programa: \(broadcast.programInfo ?? "N/A")")
        print("ID de transmisión: \(broadcast.broadcastID)")

        // Verificar configuración de audio
        for subgroup in broadcast.subgroups {
            print("Codec: \(subgroup.codecConfiguration)")
            print("Idioma: \(subgroup.language ?? "Desconocido")")
        }
    }
}
```

### Integración con Auracast

iOS 26 proporciona APIs para descubrir y conectarse a transmisiones Auracast en lugares públicos:

```swift
class AuracastManager {

    func discoverNearbyAuracast() async -> [CBLEAudioBroadcast] {
        // Descubrir transmisiones Auracast con contexto de ubicación
        let broadcasts = try await CBLEAudioBroadcast.discover(
            timeout: 10.0,
            includeLocationContext: true
        )

        return broadcasts.filter { $0.isAuracast }
    }

    func joinBroadcast(_ broadcast: CBLEAudioBroadcast) async throws {
        // Solicitar permiso del usuario para unirse al audio público
        guard await broadcast.requestUserPermission() else {
            throw AuracastError.permissionDenied
        }

        // Sincronizar con la transmisión
        try await broadcast.synchronize()

        // Enrutar audio a la salida del sistema
        try await broadcast.startReceiving()
    }
}
```

## Guía de migración

Si estás actualizando desde iOS 25, estos son los cambios clave a tener en cuenta:

### APIs obsoletas

```swift
// Obsoleto en iOS 26
centralManager.scanForPeripherals(withServices: nil, options: nil)

// Usar en su lugar - configuración de escaneo explícita
let config = CBScanConfiguration()
config.services = nil  // Escanear todos los servicios
config.allowDuplicates = false
centralManager.scanForPeripherals(with: config)
```

### Nuevas capacidades requeridas

Agregar a tu `Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>bluetooth-central</string>
    <string>bluetooth-peripheral</string>
    <!-- Nuevo en iOS 26 -->
    <string>bluetooth-ranging</string>
</array>
```

### Cambios importantes

1. **Inicialización de CBPeripheralManager**: Ahora requiere especificación explícita de queue
2. **Restauración en segundo plano**: Nuevo protocolo delegado de restauración `CBRestorationDelegate`
3. **Negociación de MTU**: El aumento automático de MTU ahora es opcional a través de opciones de conexión

### Lista de verificación de adopción

- [ ] Actualizar a Xcode 18 con iOS 26 SDK
- [ ] Agregar entradas del Privacy Manifest para uso de Bluetooth
- [ ] Revisar y actualizar la lógica de escaneo en segundo plano
- [ ] Probar Channel Sounding en hardware compatible
- [ ] Migrar llamadas a APIs obsoletas
- [ ] Actualizar el manejo de parámetros de conexión para soporte de subrating

## Conclusión

iOS 26 trae mejoras significativas al desarrollo de Bluetooth Low Energy. Channel Sounding permite la medición precisa de distancia, el escaneo en segundo plano mejorado mejora la duración de la batería, y Connection Subrating proporciona optimización dinámica de energía. Combinado con controles de privacidad mejorados y soporte para LE Audio, estas actualizaciones facilitan la construcción de aplicaciones conectadas confiables, eficientes en energía y respetuosas de la privacidad.

El ecosistema BLE continúa evolucionando, y el compromiso de Apple de adoptar los últimos estándares de Bluetooth asegura que los desarrolladores de iOS tengan acceso a capacidades de vanguardia. ¡Comienza a experimentar con estas nuevas APIs hoy y prepara tus aplicaciones para la próxima generación de experiencias conectadas!

## Referencias

- [Documentación de Apple Core Bluetooth](https://developer.apple.com/documentation/corebluetooth)
- [Sesión WWDC26: Novedades en Core Bluetooth](https://developer.apple.com/videos/)
- [Especificación de Channel Sounding de Bluetooth SIG](https://www.bluetooth.com/specifications/)
- [Especificación Core de Bluetooth 6.0](https://www.bluetooth.com/specifications/specs/core-specification-6-0/)
- [Auracast Broadcast Audio](https://www.bluetooth.com/auracast/)
