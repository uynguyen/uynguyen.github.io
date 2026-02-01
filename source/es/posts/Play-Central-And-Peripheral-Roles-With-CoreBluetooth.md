---
title: Desempeñar Roles de Central y Periférico con CoreBluetooth
date: 2018-02-21 21:01:26
tags: [iOS, CoreBluetooh, BLE]
layout: post
lang: es
---
## Introducción
![](/Post-Resources/PlayRolesInCoreBluetooth/Banner.jpg "I love CoreBluetooth")
Como mencioné en [la publicación anterior](/2017/10/13/Bluetooth-Low-Energy-On-iOS/), CoreBluetooth nos permite crear aplicaciones que pueden comunicarse con dispositivos BLE como monitores de frecuencia cardíaca, sensores corporales, rastreadores o dispositivos híbridos.
Hay dos roles a desempeñar en los conceptos de CoreBluetooth: Central y periférico.
- Central: Obtener datos de los periféricos.
- Periférico: Publicar datos para ser accedidos por un central. Podemos hacer que un dispositivo Bluetooth actúe como periférico desde el lado del firmware o del software.

En esta publicación, te mostraré cómo crear un periférico usando nuestros propios identificadores. También usaremos otro dispositivo, como central, para conectar y explorar nuestros servicios. Comencemos.
<!-- more -->
## Configurar un Periférico
Para crear un servicio, necesitas tener un identificador único llamado UUID. Un servicio estándar tiene un UUID de 16 bits y un servicio personalizado tiene un UUID de 128 bits. Adelante, escribe el siguiente comando para generar un uuid único desde tu terminal.

```bash
$ uuidgen
```
![](/Post-Resources/PlayRolesInCoreBluetooth/UUIDGen.png "")

Como puedes ver, el comando devuelve un uuid en formato hexadecimal (128 bit): `A56E51F3-AFFE-4E14-87A2-54927B22354C`. Usaremos esta cadena para configurar nuestro propio servicio.

```swift
class ViewController: UIViewController, CBPeripheralManagerDelegate {
    let kServiceUUID = "A56E51F3-AFFE-4E14-87A2-54927B22354C"

    // Other properties
    ...

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        peripheralManager = CBPeripheralManager(delegate: self, queue: nil)  [1]
    }

    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        print("peripheralManagerDidUpdateState \(peripheral.state.rawValue)")

        if peripheral.state == .poweredOn {
            let serviceUUID = CBUUID(string: kServiceUUID) [2]
            self.service = CBMutableService(type: serviceUUID, primary: true) [3]
        }
        // Other code
    }
}
```

Esto es lo que hacen estos métodos:
- [1] Creas una instancia de la clase `PeripheralManager`, que actuará como periférico en nuestro ejemplo. Ten en cuenta que hay un parámetro `queue` en el constructor. Los eventos del rol de periférico se despacharán en la cola proporcionada. Si pasamos `nil`, se usará la cola principal.
- [2] Para configurar un servicio, necesitamos crear una instancia de la clase `CBUUID`. El constructor recibe un uuid único como parámetro, que diferencia nuestro servicio de otros.
- [3] Creamos una instancia de la clase `CBMutableService`. El constructor recibe dos parámetros: El primero es nuestro uuid único, que se definió en [2]; el segundo parámetro indica si nuestro servicio es primario o no. Si no lo es, nuestro servicio no será encontrado cuando la aplicación esté en segundo plano.

Ten en cuenta que puedes agregar tantos servicios como quieras. Para simplificar, solo creo un servicio en esta publicación.
OK, pasemos al siguiente paso. Definiremos características para nuestro servicio usando el siguiente código.

```swift
let characteristic = CBMutableCharacteristic.init(
    type: CBUUID(string: kCharacteristicUUID), [1]
    properties: [.read, .write, .notify], [2]
    value: nil, [3]
    permissions: [CBAttributePermissions.readable, CBAttributePermissions.writeable]) [4]
```

Esto es lo que está pasando:
- [1] Como un servicio, una característica también necesita un uuid único para diferenciarse de otras.
- [2] Configuramos las propiedades para la característica. Hay una variedad de permisos de características, pero a menudo uso algunos de ellos:
    - *Read*: Usado para características que no cambian muy a menudo, ej. número de versión.
    - *Write*: Modificar el valor de la característica.
    - *Indicate y notify*: El periférico notifica continuamente el valor actualizado de la característica al central. El central no tiene que preguntar constantemente por él.
    - *IndicateEncryptionRequired*: Solo los dispositivos de confianza pueden habilitar indicaciones del valor de la característica.
Para otras propiedades, consulta el [documento de Apple](https://developer.apple.com/documentation/corebluetooth/cbcharacteristicproperties)
- [3] El valor de la característica.
*Nota importante:* Si proporcionas un valor para una característica, la característica debe ser de solo lectura. De lo contrario, obtendrás una excepción en tiempo de ejecución como esta.
`2018-03-03 12:48:32.938615+0700 Peripheral[4238:3046876] *** Terminating app due to uncaught exception 'NSInternalInconsistencyException', reason: 'Characteristics with cached values must be read-only'`
Por lo tanto, debes especificar el valor como nil si esperas que el valor cambie durante el tiempo de vida del servicio publicado (write).
- [4] Todas las características deben incluir el permiso "readable" para que los centrales puedan leer su valor. Si queremos que un central pueda enviar comandos a los periféricos, necesitamos establecer el permiso "writeable" a la característica.

Ahora tenemos un servicio y una característica. Vamos a publicarlo.
```swift
self.service?.characteristics = []
self.service?.characteristics?.append(characteristic)

self.peripheralManager.add(self.service!)
```

Después de agregar un servicio al peripheral manager, se llamará al método delegado `peripheralManager(_ peripheral: CBPeripheralManager, didAdd service: CBService, error: Error?)`.

```swift
func peripheralManager(_ peripheral: CBPeripheralManager, didAdd service: CBService, error: Error?) {
     if let error = error {
        print("Add service failed: \(error.localizedDescription)")
        return
    }
    print("Add service succeeded")
}

```

Ya casi terminamos, solo un paso más: Comenzar a hacer advertising del periférico para que pueda ser encontrado por otros centrales.

```swift
peripheralManager.startAdvertising([CBAdvertisementDataLocalNameKey: "TiTan",
                                    CBAdvertisementDataServiceUUIDsKey : [self.service!.uuid]])
```

Después del advertising, se activará el método delegado `peripheralManagerDidStartAdvertising` para indicar si el periférico hizo advertising exitosamente o no.

```swift
func peripheralManagerDidStartAdvertising(_ peripheral: CBPeripheralManager, error: Error?) {
    if let error = error {
        print("Start advertising failed: \(error.localizedDescription)")
        return
    }
    print("Start advertising succeeded")
}
```

En este punto, ya hemos definido y publicado nuestro(s) servicio(s). A partir de ahora, el periférico puede ser descubierto por centrales a través de CoreBluetooth.

![](/Post-Resources/PlayRolesInCoreBluetooth/Peripheral_Result.png "")

## Configurar un Central
Primero, necesitamos crear una instancia de la clase `CBCentralManager`.
```swift
class ViewController: UIViewController, CBCentralManagerDelegate, UITableViewDelegate, UITableViewDataSource, CBPeripheralDelegate {
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        centralManager = CBCentralManager(delegate: self, queue: nil)
        ...
    }
}
```
Como un peripheral manager, hay un parámetro `queue` en el constructor. Los eventos del rol central se despacharán en la cola proporcionada. Si pasamos `nil`, se usará la cola principal.
Necesitamos esperar a que el central manager esté listo, luego comenzaremos a escanear dispositivos cercanos.
```swift
func centralManagerDidUpdateState(_ central: CBCentralManager) {
    print("peripheralManagerDidUpdateState \(central.state.rawValue)")

    if central.state == .poweredOn {
        self.centralManager.scanForPeripherals(withServices: nil, options: nil)
    }
}
```
Si encuentra un periférico, se llamará al método delegado `func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber)`.
```swift
func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
    if let name = peripheral.name {
        if (!checkIfExisted(name)) {
            let tupleDeviceInfo = (device: peripheral, rssi: RSSI)
            self.scannedDevices.append(tupleDeviceInfo)
        }

        DispatchQueue.main.async {
            self.tbvScannedDevices.reloadData()
        }
    }
}
```
Dentro del método, verificaremos si el periférico es válido, después lo agregaremos a la lista actual, luego recargaremos la table view. Ten en cuenta que el valor RSSI representa la intensidad de la señal de transmisión. Podemos estimar la distancia actual entre el central y el periférico basándonos en el valor. Cuanto mayor sea el valor, más cerca está el dispositivo.
Compila y ejecuta el proyecto, verás la lista de dispositivos descubiertos así.

<img src="/Post-Resources/PlayRolesInCoreBluetooth/Scan_Devices.png" height="500" />

Ahora, conectémonos a nuestro periférico (El dispositivo "Titan") haciendo clic en la fila correspondiente.
Una vez que se realiza una conexión exitosamente, se llamará al método delegado `func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral)`. De lo contrario, se activará el método `centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?)`.

```swift
func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
    self.centralManager.stopScan()
    peripheral.delegate = self
    self.peripheral = peripheral
    self.peripheral?.discoverServices(nil) [1]
}
```

```swift
centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
    // Fail to connect peripheral
}
```
Ten en cuenta que después de conectarse al periférico, necesitamos descubrir los servicios del periférico para usarlo ([1]).
El método delegado `func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?)` se llamará después de descubrir los servicios.

```swift
func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
    if let err = error {
        print("didDiscoverServices fail \(err.localizedDescription)")
        return
    }

    // [1] Start discovering all chars
    for service in (peripheral.services)! {
        peripheral.discoverCharacteristics(nil, for: service)
    }
}
```

Aún no hemos terminado =.= Después de descubrir los servicios, también necesitamos descubrir todas las características de los servicios en [1].
Como otros, el método `func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) ` se llamará después de descubrir las características de un servicio.

```swift
func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
    if let error = error {
        print("didDiscoverCharacteristicsFor Error \(error.localizedDescription)")
        return
    }
    for char in service.characteristics! {
        if char.properties.contains(.notify) {
            peripheral.setNotifyValue(true, for: char) [1]
        }
        ...
    }
}
```

Como puedes ver, necesitamos establecer notify a la característica que contiene la propiedad `notify` para recibir actualizaciones de ella. [1]
Finalmente, hemos terminado de configurar una conexión entre el periférico y el central. Ahora exploremos los datos.

## Leer y escribir datos desde el periférico
Tienes que especificar qué característica quieres leer.
```swift
self.peripheral?.readValue(for: discovererChars[kCharacteristicUUID]!)
```
Desde el lado del periférico, recibirás una solicitud de lectura dentro del método
```swift
func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveRead request: CBATTRequest) {
    print("Read request")
    request.value = myValue.data(using: .utf8)
    peripheral.respond(to: request, withResult: .success)
}
```
Después de que el periférico responde a las solicitudes de lectura, se llamará al método delegado `func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?)` desde el lado del central.
```swift
 func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
    let value = String.init(data: characteristic.value!, encoding: .utf8)!
    ...
}
```
Si el valor se recupera exitosamente, puedes acceder a él a través de la propiedad value de la característica, como arriba.
A veces queremos escribir el valor de una característica, que es escribible. Podemos escribir el valor llamando al método `writeValue` del periférico así.
```swift
self.peripheral?.writeValue(data, for: discovererChars[kCharacteristicUUID]!, type: .withResponse)
```
Hay un argumento llamado `type`, especificas qué tipo de escritura quieres realizar. En el ejemplo anterior, el tipo de escritura es .withResponse, que instruye al periférico a informar a tu aplicación si la escritura tiene éxito o no.
Desde el lado del periférico, recibirás una solicitud de escritura dentro del método
```swift
func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveWrite requests: [CBATTRequest]) {
    print("Write request")
    peripheral.respond(to: requests[0], withResult: .success)
}
```
Después de que la solicitud de escritura recibe la respuesta, se llamará al método `peripheral(_ peripheral: CBPeripheral, didWriteValueFor characteristic: CBCharacteristic, error: Error?)`.
```swift
func peripheral(_ peripheral: CBPeripheral, didWriteValueFor characteristic: CBCharacteristic, error: Error?) {
    if let err = error {
        print("Did write value with error \(err.localizedDescription)")
    }
}
```
## Valores de características encriptados
A veces queremos asegurar datos sensibles. Podemos configurar las propiedades y permisos de características apropiados. Algo como esto

```swift
let encryptedChar = CBMutableCharacteristic.init(
                type: CBUUID(string: kCharacteristicUUID),
                properties: [.read, .notify, .notifyEncryptionRequired],
                value: nil,
                permissions: [.readable])
```

De esta manera, aseguramos que solo los dispositivos de confianza tengan permisos para acceder a estos datos.
En mi ejemplo, una vez que se realiza una conexión, CoreBluetooth intenta emparejar el periférico (iPad) con el central (iPhone) para crear una conexión segura. Ambos dispositivos recibirán una alerta indicando que el otro dispositivo desea emparejarse. Después del emparejamiento, el central puede acceder a los valores de características encriptados del periférico.

<img src="/Post-Resources/PlayRolesInCoreBluetooth/Paring_Request.png" height="200" />

## Algunas notas importantes
- El modelo cliente-servidor de BLE se llama *modelo de publicar y suscribir*.
- El periférico solo consume energía cuando está haciendo advertising de sus servicios, o recibiendo o respondiendo a la solicitud de un central.
- Puedes pasar una lista de UUIDs de servicios dentro del método `scanForPeripherals`. Cuando especificas una lista de UUIDs de servicios, el central manager devuelve solo periféricos que hacen advertising de esos servicios, permitiéndote escanear solo dispositivos que te puedan interesar.
- Necesitas otorgar permisos para permitir que tu aplicación use accesorios Bluetooth LE, y actúe como un accesorio Bluetooth LE para los lados del periférico. (Ve a proyecto -> Capabilities para configurar).
- También necesitas agregar una propiedad de información más a tu info.plist, agreguemos una entrada con la clave `Privacy - Bluetooth Peripheral Usage Description` y el valor `App communicates using CoreBluetooth` (O lo que quieras describir).

## Un vistazo rápido a mi aplicación
Probemos un ejercicio ligero de mi ejemplo.
<img src="/Post-Resources/PlayRolesInCoreBluetooth/Demo.gif" height="500" />

## Resumir el flujo de programación para BLE
Para resumir el flujo de trabajo general de programación de CoreBluetooth en iOS, por favor mira la imagen a continuación.

![](/Post-Resources/PlayRolesInCoreBluetooth/Programming_Flow_BLE.png)

## Reflexiones finales
En esta publicación, te guié sobre cómo usar CoreBluetooth para crear un periférico, así como cómo crear un central para conectar y obtener datos de un periférico. En el futuro, podemos ver que todos los dispositivos a nuestro alrededor están conectados entre sí a través de Bluetooth, hacia el mundo IoT.
Puedes descargar el proyecto completo del central [aquí](https://github.com/uynguyen/CoreBluetooth_CentralManager) o el del periférico [aquí](https://github.com/uynguyen/Blog_CoreBluetooth_Peripheral).
Si tienes alguna pregunta o comentario, no dudes en dejarlo en mi publicación. Cualquier comentario es bienvenido.

## Referencias
[1] [Core Bluetooth Programming Guide de Apple](https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html#//apple_ref/doc/uid/TP40013257-CH1-SW1)


