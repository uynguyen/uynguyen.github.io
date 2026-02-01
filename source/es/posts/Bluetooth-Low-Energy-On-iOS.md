---
title: Bluetooth Low Energy en iOS
date: 2017-10-13 10:21:46
tags: [iOS, CoreBluetooh, BLE]
layout: post
lang: es
---
El framework Core Bluetooth (CB) permite que las aplicaciones de iOS y MacOS se comuniquen con dispositivos BLE. Tus aplicaciones pueden descubrir, explorar y controlar dispositivos BLE, como monitores de frecuencia cardíaca, rastreadores o relojes híbridos.
![](/Post-Resources/BLE/Intro.jpg "Intro")
<center>Imagen 1. Dispositivos BLE (Fuente de Google)</center>
<!-- more -->
En MacOS 10.9 e iOS 6, los dispositivos Mac e iOS también pueden desempeñar los roles de periféricos BLE para servir datos a otros dispositivos, incluyendo otros dispositivos Mac e iOS.
En este tutorial, presentaré los conceptos clave del framework Core Bluetooth y cómo usar el framework para descubrir, conectar y recuperar datos de dispositivos compatibles. No dudes en dejar tus comentarios en mi publicación.
## De un vistazo

BLE fue introducido a principios de 2010 y está basado en la [especificación Bluetooth 4.0](https://www.bluetooth.com/specifications). BLE utiliza la misma frecuencia de radio de 2.4 GHz que el Bluetooth clásico. En teoría y en condiciones ideales (sin obstáculos), el alcance de BLE supera los 100m, pero en realidad, la distancia máxima es de 10m.

![](/Post-Resources/BLE/BLE.png "BLE")
<center>Imagen 2. BLE en la realidad (Fuente de Google)</center>


Esta tecnología es *amigable con la energía* porque utiliza menos energía que otras tecnologías inalámbricas. Gracias a su bajo consumo de energía, BLE se utiliza para integrarse en dispositivos eléctricos que requieren bajo consumo de energía como monitores de frecuencia cardíaca, rastreadores, relojes, zapatos para hacerlos más inteligentes.
Entonces, ¿cuáles son las desventajas de la tecnología BLE? Es la tasa de transferencia de datos. Para disminuir el consumo de energía, los chips BLE solo transmiten datos en algunos momentos llamados *intervalos* (mientras que el Bluetooth Clásico puede transferir datos en cualquier momento que deseen), y la cantidad de datos transferidos en un intervalo también está limitada a unas pocas docenas de bytes. Más información sobre el rendimiento máximo en iOS y MacOS (Proporcionado por [PunchThrough](https://punchthrough.com/blog/posts/maximizing-ble-throughput-on-ios-and-android))
- iPhone 6, 6+, 6S, 6S+:
```
Normal Connection Interval of 30mSecs: 2,667 bytes/sec
Connection Interval for HID Over GATT is Present 11.25mSecs: 7,111 bytes/sec
```
- MacBook Pro - OS X (Varía según los modelos):
```
Maximum Connection Interval range of (11.25 - 15mSecs): 7,111 bytes/sec - 5334 bytes/sec
```

Para obtener más detalles técnicos sobre la tecnología Bluetooth, consulta el [Bluetooth Special Interest Group (SIG)](https://www.bluetooth.com/).

## Conceptos Básicos
### 1. Los participantes
Hay dos roles principales involucrados en toda comunicación BLE: *El Central* y *El Periférico*:
- *Periférico*: son dispositivos que tienen datos que otros dispositivos necesitan.
- *Central*: típicamente usan la información proporcionada por un periférico para realizar alguna tarea. Por ejemplo, leer información de frecuencia cardíaca o temperatura de monitores (un periférico).
![](/Post-Resources/BLE/Central-And-Peripheral.png "Central-And-Peripheral")
<center>Imagen 3. El Central y el Periférico (Fuente de [documentación de Apple](https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html))</center>

### 2. Los parámetros de conexión
Los parámetros de conexión para una conexión BLE son un conjunto de parámetros que determinan cuándo y cómo el Central y un Periférico realizan la transferencia de datos. El Central establecerá activamente los parámetros de conexión utilizados, pero el Periférico puede enviar otro parámetro que el Central puede aceptar o rechazar. Ambos lados continuarán solicitando parámetros de conexión hasta que encuentren un número razonable que ambos acepten.
Hay 3 parámetros diferentes:
- *Intervalo de conexión*: Este valor determina con qué frecuencia el Central y el Periférico se transfieren datos entre sí.
- *Latencia del esclavo (Latencia, abreviado)*: Si establecemos un valor de latencia distinto de cero, el Periférico puede omitir solicitudes del Central cuando el Central solicita datos hasta el número de veces de latencia del esclavo. Sin embargo, si el Periférico quiere transmitir datos al Central, puede enviar datos en cualquier momento. Esto permite que un periférico permanezca dormido por más tiempo para disminuir el consumo de energía.
- *Tiempo de espera de supervisión de conexión*: Este valor determina el tiempo de espera desde el último intercambio de paquetes hasta que la transferencia se considera perdida. El Central no comenzará a intentar reconectarse antes de que haya pasado el tiempo de espera.

Por ejemplo, si estableces {intervalo, latencia, tiempo_espera} = {15, 0, 720} como parámetros de conexión para el periférico:
- Cada 15 (ms), el periférico se despertará y escuchará solicitudes del central, también transmitirá datos si es necesario.
- Latencia igual a 0, significa que el Periférico tiene que responder al Central en cualquier momento que el Central solicite en un intervalo (15 ms).
- Después de 720 (ms) desde que se envió el último paquete, si el Central aún no recibe el paquete, el Central determinará que el paquete se perdió y solicitará al Periférico que reenvíe el último paquete.

### 3. Pila de Protocolos Bluetooth Low Energy

CoreBluetooth oculta muchos de los detalles de bajo nivel de la especificación a los desarrolladores, haciendo mucho más fácil desarrollar aplicaciones que interactúen con dispositivos BLE.


#### Advertising y General Advertising Profile (GAP)

Los dispositivos BLE permiten que otros dispositivos sepan que existen mediante advertising usando el GAP. Los paquetes de advertising contienen información básica como el nombre del dispositivo, número de serie o valor RSSI, y también una lista de los servicios que proporciona. El tamaño limitado de los paquetes de advertising es de 128 bit.
*RSSI* significa Received Signal Strength Indicator (Indicador de Intensidad de Señal Recibida). El valor RSSI representa la intensidad de la señal de transmisión. Podemos estimar la distancia actual entre el central y el periférico basándonos en el valor. Cuanto mayor sea el valor, más cerca está el dispositivo.
![](/Post-Resources/BLE/Advertising-And-Discovery.png "Advertising-And-Discovery")
<center>Imagen 4. Advertising y descubrimiento en BLE</center>

#### General Attribute Profile (GATT)

GATT es la capa que define servicios y características que se utilizan para transmitir datos entre el Central y el Periférico, también habilita operaciones de lectura, escritura y notificación en ellos.
En la mayoría de los casos, el Periférico también se llama servidor GATT ya que proporciona los servicios y las características, mientras que el Central es el cliente GATT.

#### Servicios

Los servicios se identifican por números únicos conocidos como UUIDs. Los servicios estándar como [Device Information Service](https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.device_information.xml&u=org.bluetooth.service.device_information.xml) (0x180A), que expone información del fabricante e información básica sobre el dispositivo (versión de Firmware, número de serie, número de modelo), tienen un UUID de 16 bits y los servicios personalizados tienen un UUID de 128 bits. (Ej: 0x3dda0000957f7d4a34a674696673696d, etc.)

#### Características

Una característica contiene una declaración de característica, propiedades de característica (ReadWrite, ReadOnly, Notify, WriteWithoutResponse, etc.), y un valor. Las características nos permiten acceder al valor y a la información que contienen. Un servicio puede tener más de una característica.
La siguiente imagen muestra la relación entre Profile, Services, Characteristics.
![](/Post-Resources/BLE/Profile-Service-Char.png "Profile-Service-Char")
<center>Imagen 5. Relación entre Profile, Services, Characteristics</center>

### 4. Conceptos de Bluetooth y CoreBluetooth en iOS

En el framework CoreBluetooth
- Un Central está representado por la clase *CBCentralManager* y se usa para descubrir, establecer una conexión y controlar el periférico.
- Un periférico está representado por la clase *CBPeripheral*, los servicios relacionados con un periférico específico están representados por la clase *CBService* y las características del servicio de un periférico están representadas por la clase *CBPeripheral*.

La siguiente imagen muestra la estructura de un Service y sus Characteristics en iOS:

![](/Post-Resources/BLE/CBPeripheral-CBService-CBCharacteristic.png "CBPeripheral-CBService-CBCharacteristic")
<center>Imagen 6. Relación entre objetos CBPeripheral, CBService y CBCharacteristic en iOS</center>

## Resumen

BLE es una tecnología revolucionaria del Bluetooth Clásico. En realidad, BLE se utiliza para integrarse en dispositivos pequeños como cerraduras, rastreadores, relojes, zapatos y algunos tipos de joyería (anillos) para hacerlos más inteligentes, hacia el entorno IoT.
En la [siguiente sección](/2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/), te guiaré sobre cómo usar CoreBluetooth para crear tus propios servicios en un dispositivo iOS, también usar CoreBluetooth en otro dispositivo para descubrir, conectar y controlar tus servicios BLE. Si te gustó esta publicación y te gustaría ver más en el futuro, házmelo saber.

## Referencias

[1] [Bluetooth Special Interest Group](https://www.bluetooth.com/)
[2] [Documento de Apple: Core Bluetooth Concepts](https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html)
[3] [Maximizing BLE Throughput on iOS and Android](https://punchthrough.com/blog/posts/maximizing-ble-throughput-on-ios-and-android)
