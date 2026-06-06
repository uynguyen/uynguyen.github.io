---
title: 'Mejores prácticas: Proceso avanzado de escaneo BLE en iOS'
date: 2020-08-23 09:51:43
tags: [iOS, BLE]
layout: post
lang: es
thumbnail: /Post-Resources/ScanningInBG/cover.png
---

Los desarrolladores de iOS están creando aplicaciones que desempeñan ambos roles, Peripheral y Central, para intercambiar datos con otras copias de aplicaciones. Los datos pueden intercambiarse como pequeña información a través de paquetes BLE o el valor del indicador de intensidad de señal (RSSI) de uno a otro. Sin embargo, mantener la aplicación para siempre en primer plano es imposible. Tarde o temprano, la aplicación entrará en modo background por el usuario y finalmente será suspendida por el sistema dependiendo de la RAM disponible, el consumo de energía y otros factores. Por lo tanto, comprender el procedimiento de advertising y scanning en dispositivos iOS te ayuda a construir buenas aplicaciones que cumplan tus expectativas.
Al final de este tutorial, construiremos una aplicación simple que actúa tanto como scanner como advertiser. Cuando dos aplicaciones se encuentren entre sí, escribirán un registro de log para análisis. Dependiendo de los resultados, descubriremos qué tan efectiva es nuestra aplicación usando Core Bluetooth.
¡Vamos a ponernos en marcha!

<!-- more -->

## Conocimiento fundamental

Según el libro `Getting Started With Bluetooth Low Energy`, los dos propósitos principales de los paquetes de advertising son:
- Transmitir datos para aplicaciones.
- Descubrir slaves y conectarlos.

El tamaño máximo del payload de cada paquete de advertising es de **31 bytes**, junto con la información del header. Cada intervalo transcurrido, que varía de 20ms a 10.24s, los paquetes de advertising se transmiten ciegamente para notificar su presencia a otros dispositivos o aplicaciones. Hay dos tipos de enfoques de scanning:
- **Passive Scanning**: Los scanners simplemente reciben paquetes de advertising sin ninguna acción adicional.
- **Active Scanning**: Después de recibir un paquete de advertising, el scanner realiza un paquete de Scanning Request al advertiser. Después de recibir el Scanning Request, el advertiser responde con un paquete de Scanning Response que permite a los advertisers enviar datos extra (31 bytes adicionales) al scanner.

![](/Post-Resources/ScanningInBG/ScanningProcedures.png "Scanning Procedures")

Para clasificar los tipos de paquetes de advertising, nos basamos en tres propiedades: `connectability`, `scannability` y `directability`

Tipo de paquete Adv             |  Connectability: Determina si un scanner puede hacer una conexión o no | Scannability: Determina si un scanner puede emitir un scan request o no | Directability: Determina si este paquete está dirigido a algún scanner en particular o no.
:-------------------------:|:-------------------------|:-------------------------:|:-------------------------:
ADV_IND | Sí | Sí | No
ADV_DIRECT_IND | Sí | No | Sí
ADV_NONCONN_IND | No | No | No
ADV_SCAN_IND | No | Sí | No

Hay muchos más temas avanzados que se describen con más detalle en el libro `Getting Started With Bluetooth Low Energy`, como cómo se organizan los datos en dispositivos BLE y cómo comunicarse con hardware existente, etc. Si quieres saber más, consulta el libro.
Debido al alcance de esta publicación, entender el proceso de advertising es suficiente para que pasemos a la siguiente sección.

## Scanning y advertising en iOS

### Configurando el advertiser - Peripheral

Vamos a reutilizar mi repositorio anterior que permite que un teléfono iOS haga advertising como peripheral usando Core Bluetooth.
Primero, generaré 5 UUIDs como los services del advertiser (Peripheral).

```swift
let kServiceUUID1 = "1FA2FD8A-17E0-4D3B-AF45-305DA6130E39"
...
let kServiceUUID4 = "4FA2FD8A-17E0-4D3B-AF45-305DA6130E39"
let kServiceUUID5 = "5FA2FD8A-17E0-4D3B-AF45-305DA6130E39"
```

A continuación, crearé una lista de `CBMutableService` y luego los agregaré al objeto `CBPeripheralManager`.

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

Finalmente, comenzamos el advertising del peripheral cuando su estado está listo.

```swift
self.peripheralManager.startAdvertising([CBAdvertisementDataLocalNameKey: "uynguyen",
                                        CBAdvertisementDataServiceUUIDsKey: self.cbServices.map { $0.uuid }])
```

Cuando se ejecuta el código anterior, veremos que se imprimen los siguientes logs.

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

### Configurando el scanner - Central
El siguiente paso es configurar nuestro Central Manager - el scanner. Como podrías saber de mi tutorial anterior, el código para escanear dispositivos cercanos es bastante simple.
```swift
private func startScanning() {
    self.centralManager?.scanForPeripherals(withServices: nil,
                                            options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
}
```

- El valor `nil` que pasamos al parámetro `withServices` indica que escanearemos todos los dispositivos cercanos sin especificar service uuids.
- La opción `CBCentralManagerScanOptionAllowDuplicatesKey` especifica que el escaneo debe ejecutarse sin filtrado de duplicados.

Una vez que el central descubre un peripheral, imprimiremos su información incluyendo el local name y el valor de `CBAdvertisementDataServiceUUIDsKey` en el paquete de advertising.

```swift
public func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
    print("Did found per \(peripheral.name)")
    print("CBAdvertisementDataServiceUUIDsKey adv value " + advertisementData[CBAdvertisementDataServiceUUIDsKey])
// ...
}
```

Vamos a compilar y ejecutar el proyecto,

```bash
Did found peripheral name: Optional("Uy Nguyen iPad")
CBAdvertisementDataServiceUUIDsKey adv value:
Optional(<__NSArrayM 0x282a79350>(
    1FA2FD8A-17E0-4D3B-AF45-305DA6130E39
))
```

Mirando el log, ¿puedes detectar qué está mal? Hay un problema con el paquete de advertising: el valor de `CBAdvertisementDataServiceUUIDsKey` contiene solo 1 service, ¿dónde están los otros services del 2 al 5?

Imprimamos el paquete de advertising completo para ver qué contiene.

```bash
["kCBAdvDataServiceUUIDs": <__NSArrayM 0x283460630>(
1FA2FD8A-17E0-4D3B-AF45-305DA6130E39
)
, "kCBAdvDataLocalName": uynguyen, "kCBAdvDataTimestamp": 620013184.4512661, "kCBAdvDataRxPrimaryPHY": 0, "kCBAdvDataIsConnectable": 1, "kCBAdvDataRxSecondaryPHY": 0]
```

Sin suerte, no podemos encontrar los otros services desde `"2FA2FD8A-17E0-4D3B-AF45-305DA6130E39"` hasta `"5FA2FD8A-17E0-4D3B-AF45-305DA6130E39"`.

### Encontrando problemas
Resulta que el paquete de advertising que el Central recibe depende de cómo llamamos al método `scanForPeripherals`.
Si cambiamos el parámetro `withServices` a un array de nuestros services desde `"1FA2FD8A-17E0-4D3B-AF45-305DA6130E39"` hasta `"5FA2FD8A-17E0-4D3B-AF45-305DA6130E39"` explícitamente, veremos las diferencias.
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

Aquí está el log que resulta.

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

Ahora, podemos ver el nuevo valor contenido dentro del paquete de advertising, el `kCBAdvDataHashedServiceUUIDs`. Pero ¿qué es?
Volvamos al lado del Peripheral, si miras más de cerca la definición del método de advertising del objeto Peripheral, podrías saber qué es realmente.

![](/Post-Resources/ScanningInBG/advertising_method.png "Advetising definition")

En resumen, cuando haces que un iPhone haga advertising como peripheral, si no hay espacio para ningún service UUID contenido en el valor de `CBAdvertisementDataServiceUUIDsKey`, estos services se moverán a otro espacio llamado `overflow area`.

Otro término, T_T ¿Qué significa exactamente el `overflow area`?
Básicamente, el `overflow area` se coloca en el paquete de scan response. Estos service uuids son hasheados por el algoritmo de Apple y son descubiertos solo por un dispositivo iOS que escanea explícitamente por ellos. En nuestro caso, porque pasamos nuestros service uuids del 1F al 5F cuando comenzamos a escanear, obtendremos este valor `kCBAdvDataHashedServiceUUIDs` en los paquetes de advertising.

Para verificar esta declaración, uso una herramienta introducida por Apple para depuración BLE - ([A New Way to Debug iOS Bluetooth Applications](https://www.bluetooth.com/blog/a-new-way-to-debug-iosbluetooth-applications/)), para capturar el paquete de advertising de nuestro Peripheral para análisis.
Y aquí está el resultado

![](/Post-Resources/ScanningInBG/Adv_Packets.png "Advetising packets")

- Tipo de paquete de Advertising: `ADV_IND`, lo que significa que el scanner puede hacer una conexión con él; y un scanner puede emitir un scan request; y sus paquetes no están dirigidos a ningún scanner en particular.
- El cuadro amarillo son los datos de advertising: (Data: 02 01 1A 11 06 39 0E 13 A6 5D 30 45 AF 3B 4D E0 17 8A FD A2 1F 09 09 75 79 6E 67 75 79 65 6E), longitud = 31 bytes; contiene `CBAdvertisementDataLocalName` (75 79 6E 67 75 79 65 6E > "uynguyen") y nuestro primer service uuid 1F A2 FD 8A 17 E0 4D 3B AF 45 30 5D A6 13 0E 39 (39 0E 13 A6 5D 30 45 AF 3B 4D E0 17 8A FD A2 1F).
- El paquete de scan response (SCAN_RSP) contiene la otra información que el paquete de advertising no tiene suficiente longitud para transportar. En nuestro caso, contiene los otros services del 2F al 5F. Entender este paquete es bastante complejo para ponerlo en este tutorial, así que omitiré explicarlo por ahora. Tengo otro tutorial trabajando en este paquete más adelante.

En conclusión, lo que hemos encontrado aquí es: El Advertising, mientras la aplicación está en background, funciona de manera diferente que cuando está en foreground.
- `CBAdvertisementDataLocalNameKey` es ignorado.
- Todos los service UUIDs contenidos en el valor de la clave de advertisement CBAdvertisementDataServiceUUIDsKey se colocan en un área especial de "overflow"; solo pueden ser descubiertos por un dispositivo iOS que escanee explícitamente por ellos.

## Pruebas

La tabla a continuación resume lo que hemos investigado.
```bash
* SÍ significa que el Central puede encontrar al Peripheral.
```

#### Caso 1 - Las pantallas de ambos Peripheral y Central están encendidas

   \                |  Peripheral Background          | Peripheral Foreground
:------------------:|:-------------------:|:-------------------------:
**Central Background**          | Sí                 | Sí
**Central Foreground**          | Sí                 | Sí

#### Caso 2 - Pantalla del Peripheral apagada (bloqueada), pantalla del Central encendida

   \                |  Peripheral Background          | Peripheral Foreground
:------------------:|:-------------------:|:-------------------------:
**Central Background**          | Sí                 | Sí
**Central Foreground**          | Sí                 | Sí

#### Caso 3 - Pantalla del Central apagada (bloqueada), pantalla del Peripheral encendida

   \                |  Peripheral Background          | Peripheral Foreground
:------------------:|:-------------------:|:-------------------------:
**Central Background**          | No                 | No
**Central Foreground**          | No                 | No

#### Caso 4 - Las pantallas de ambos Peripheral y Central están apagadas (bloqueadas)

   \                |  Peripheral Background          | Peripheral Foreground
:------------------:|:-------------------:|:-------------------------:
**Central Background**          | No                 | No
**Central Foreground**          | No                 | No

De los experimentos anteriores, independientemente del estado del dispositivo que juega el rol de Peripheral, la pantalla del dispositivo que juega el modo Central debe estar encendida para que pueda escanear peripherals cercanos. En otras palabras, si estamos construyendo una aplicación que permite que un dispositivo iOS descubra otros dispositivos iOS cercanos, `tenemos que ejecutar ambos modos Central y Peripheral en cada dispositivo Y lo más importante, si dos dispositivos quieren encontrarse, cualquiera de las pantallas debe estar encendida.`
Hay una técnica (Es más bien un truco) para superar este problema, que es programar periódicamente el envío de notificaciones push a tus dispositivos iOS, lo cual inmediatamente enciende la pantalla para que el Central pueda descubrir Peripherals cercanos.
Mientras la aplicación está en background, funciona de manera diferente que cuando está en foreground. Una de ellas es que la frecuencia de los paquetes de advertising que se envían puede disminuir. Como resultado, un Scanner en background encuentra peripherals cercanos más lento comparado con cuando está en foreground.

## Conclusión

¡Felicitaciones! Recorrimos un tutorial para obtener una visión más profunda de cómo funciona CoreBluetooth en iOS tanto en modos Central como Peripheral. ¡Espero que encuentres interesante esta publicación!
Si tienes algún comentario, siéntete libre de enviarme un correo electrónico a uynguyen.itus@gmail.com o deja tus preguntas en el cuadro de comentarios.

`Hecho con amor.`
