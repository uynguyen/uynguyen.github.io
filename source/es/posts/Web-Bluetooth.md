---
title: Web Bluetooth
date: 2022-10-30 14:55:24
tags: [Web Bluetooth, Bluetooth]
layout: post
permalink: es/posts/Web-Bluetooth/
lang: es
---

![](/Post-Resources/WebBluetooth/banner.png "Banner")

¿Alguna vez has querido crear una aplicación web que permita a los usuarios comunicarse con tu dispositivo usando Bluetooth? Hasta la introducción de [Web Bluetooth](https://webbluetoothcg.github.io/web-bluetooth/), esto solo era posible a través de aplicaciones móviles nativas. Sin embargo, con la llegada de Web Bluetooth ahora puedes convertir tu idea en realidad.
Web Bluetooth es una tecnología revolucionaria que permite a los desarrolladores web conectar sus aplicaciones directamente a dispositivos Bluetooth, abriendo un amplio rango de posibilidades para IoT, wearables y otros dispositivos habilitados para Bluetooth. Al aprovechar el poder de Web Bluetooth, puedes crear aplicaciones web que pueden comunicarse con dispositivos sin la necesidad de una aplicación nativa separada.
Así que si has estado soñando con crear una aplicación web que pueda interactuar con dispositivos Bluetooth, ahora es el momento de explorar las posibilidades de Web Bluetooth y llevar tus habilidades de desarrollo al siguiente nivel.
<!-- more -->

### ¿Qué es Web Bluetooth?
Web Bluetooth es un conjunto de APIs que proporcionan la capacidad de conectar y realizar acciones como leer valores, escribir datos, escuchar notificaciones, etc. con periféricos BLE usando el Generic Attribute Profile (GATT). Esto puede habilitar un amplio rango de casos de uso, como controlar dispositivos IoT, sincronizar datos de fitness desde un smartwatch, o transferir datos entre un smartphone y una computadora.
Web Bluetooth es soportado por varios navegadores web principales, incluyendo Chrome, Firefox y Opera, y también incluye un conjunto de protocolos estándar de la industria para comunicación segura y eficiente. Sin embargo, es importante notar que no todos los dispositivos Bluetooth pueden ser compatibles con Web Bluetooth, ya que el soporte para la tecnología varía entre diferentes dispositivos y fabricantes.

### Ventajas de Web Bluetooth
- Multiplataforma: Web Bluetooth permite a los desarrolladores crear aplicaciones web que pueden comunicarse con dispositivos Bluetooth en múltiples plataformas, incluyendo dispositivos de escritorio y móviles.
- Facilidad de uso: Web Bluetooth simplifica el proceso de conexión a dispositivos Bluetooth, reduciendo la necesidad de aplicaciones nativas complejas o software.
- Accesibilidad: Web Bluetooth permite a los desarrolladores web crear aplicaciones que pueden comunicarse con dispositivos Bluetooth sin requerir que los usuarios instalen aplicaciones separadas o plugins.
- Flexibilidad: Web Bluetooth puede usarse para conectar con un amplio rango de dispositivos Bluetooth, incluyendo dispositivos IoT, wearables y dispositivos domésticos inteligentes.

### Desventajas de Web Bluetooth
- Soporte de navegadores: Mientras que la mayoría de los navegadores modernos soportan Web Bluetooth, algunos navegadores antiguos pueden no ser compatibles.
- Seguridad: Web Bluetooth puede presentar riesgos de seguridad si no se implementa correctamente. Por ejemplo, si una aplicación tiene acceso al dispositivo Bluetooth de un usuario, puede ser capaz de acceder a otra información sensible en el dispositivo.
- Funcionalidad limitada: Web Bluetooth puede no ofrecer el mismo nivel de funcionalidad que las aplicaciones Bluetooth nativas. Esto puede limitar los tipos de aplicaciones que se pueden desarrollar usando la tecnología.
- Duración de batería: Bluetooth puede ser una tecnología intensiva en energía, lo que puede agotar la vida de la batería de dispositivos móviles. Los desarrolladores deben ser conscientes de esto al diseñar aplicaciones que dependen de la conectividad Bluetooth.

### APIs soportadas
Las APIs soportadas por Web Bluetooth son similares a las disponibles en iOS y Android, lo que hace que sea sencillo trabajar con ellas para desarrolladores que ya están familiarizados con la tecnología Bluetooth en dispositivos móviles.
Puedes revisar el flujo para establecer una conexión a un periférico en [Play Central And Peripheral Roles With CoreBluetooth](/2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/)

- `navigator.bluetooth.requestDevice()`: Esta API se usa para solicitar acceso a un dispositivo BLE cercano. Cuando un usuario hace clic en un botón "Conectar" en tu aplicación web, esta API se llama para escanear dispositivos disponibles y presentar un cuadro de diálogo al usuario.
```bash
/**
// Discovery options match any devices advertising:
// . The standard heart rate service. OR
// . Service uuid0, and devices with name "ExampleName1", and devices with name starting with "Prefix1" OR
// . Both service uuid1 and uuid2. OR
// . Devices with name "ExampleName2". OR
// . Devices with name starting with "Prefix2". OR
//
// And enables access to the battery service if devices
// include it, even if devices do not advertise that service.
**/
const device = await navigator.bluetooth.requestDevice({
  acceptAllDevices: true,
  filters: [
    { services: ["heart_rate"] },
    { services: [uuid0], name: "ExampleName1", namePrefix: "Prefix1" },
    { services: [uuid1, uuid2] },
    { name: "ExampleName2" },
    { namePrefix: "Prefix2" }
  ],
  optionalServices: [
    "battery_service",
  ],
});
```

- `BluetoothDevice.gatt.connect()`: Esta API se usa para establecer una conexión con el servidor GATT en el dispositivo BLE seleccionado. Una vez que se establece una conexión, tu aplicación web puede interactuar con los servicios y características del dispositivo.
```bash
const server = await device.gatt.connect();
```

- `BluetoothDevice.gatt.disconnect()`: Esta API se usa para desconectar del dispositivo BLE una vez que la interacción se ha completado.
```bash
const server = await device.gatt.disconnect();
```

- Obtener servicios y características:
  `BluetoothDevice.gatt.getPrimaryService(serviceUuid)`: Esta API se usa para recuperar un servicio primario del servidor GATT en el dispositivo BLE seleccionado.
  `BluetoothRemoteGATTService.getCharacteristic(characteristicUuid)`: Esta API se usa para recuperar una característica específica de un servicio.
```bash
const services = await server.getPrimaryServices();
services.forEach(async (e) => {
  const chars = await e.getCharacteristics();
  // Doing your logic
});
```

- Leer y escribir valores:
  `BluetoothRemoteGATTCharacteristic.readValue()`: Esta API se usa para leer el valor de una característica.
  `BluetoothRemoteGATTCharacteristic.writeValue(value)`: Esta API se usa para escribir un valor a una característica.
```bash
await char.writeValue(
  fromHexString(value)
);
await char.readValue();
```

- Escuchar evento `disconnected`: Este listener de eventos se activa cuando el dispositivo se desconecta del servidor GATT.
```bash
device.addEventListener('gattserverdisconnected', () => {
  // Your callback
});
```

- Escuchar cambio de valor: Este listener de eventos se activa cuando el valor de una característica cambia. Esto puede usarse para recibir actualizaciones en tiempo real del dispositivo.
```bash
device.addEventListener('characteristicvaluechanged', () => {
  // Your callback
});
```

- Escuchar notificaciones
```bash
await char.stopNotifications();
await char.startNotifications();
```

![](/Post-Resources/PlayRolesInCoreBluetooth/Programming_Flow_BLE.png)

### Un ejemplo simple

En [Web Bluetooth example](https://uibluetooth.web.app/), he creado un sitio web simple que muestra un conjunto de APIs. Este sitio web de demostración proporciona a los desarrolladores una interfaz fácil de usar para probar y entender la funcionalidad de las APIs. Al acceder a este sitio web de demostración, los desarrolladores pueden obtener rápidamente información sobre cómo las APIs pueden integrarse en sus aplicaciones.

Por defecto, la web escanea todos los dispositivos cercanos.
![](/Post-Resources/WebBluetooth/example_scanning.png "Banner")

Para escanear dispositivos específicos con uuid predefinido, selecciona `Filters` e ingresa tu uuid de servicio en el cuadro de filtro.
![](/Post-Resources/WebBluetooth/example_filters.png "Banner")

Aquí está la UI después de que la conexión se ha establecido exitosamente.
![](/Post-Resources/WebBluetooth/example_connected.png "Banner")


### Más ejemplos
Puedes encontrar más ejemplos e ideas a través de este video
<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/303045191?h=18cde570de" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>
<p><a href="https://vimeo.com/303045191">WebBluetooth demos for Bluetooth.rocks</a> from <a href="https://vimeo.com/rakaz">Niels Leenheer</a> on <a href="https://vimeo.com">Vimeo</a>.</p>

### Limitaciones
- Por propósitos de seguridad, no podemos escanear y conectar automáticamente a un dispositivo específico. El usuario decide si la aplicación web tiene permiso para conectarse, y a qué dispositivo tiene permiso para conectarse.
- Conexión HTTPS: Web Bluetooth requiere una conexión HTTPS segura para funcionar correctamente. Esto significa que la aplicación web debe estar alojada en un servidor seguro con un certificado SSL válido. Si la aplicación no está alojada en un servidor seguro, el usuario no podrá conectarse a dispositivos Bluetooth.
- Plataformas: Web Bluetooth es soportado en Chrome en escritorio y móvil (Requiere Android 6+, no soporta iOS), Opera, y algunas versiones de Microsoft Edge. Es importante notar que Web Bluetooth puede no funcionar en navegadores antiguos u obsoletos.
- Personalización: Desafortunadamente, no es posible personalizar el diálogo de escaneo de Web Bluetooth para mostrar información adicional más allá de las opciones predeterminadas. La API de Web Bluetooth está diseñada para proporcionar una interfaz simple y consistente para desarrolladores, y el diálogo de escaneo se mantiene intencionalmente simple para mantener esta simplicidad.
- Rendimiento: Es ampliamente reconocido que la estabilidad de las conexiones Bluetooth en aplicaciones nativas de Android a menudo no es tan confiable como en iOS, y puede verse afectada por factores como el modelo del teléfono, el fabricante y la versión de Android que se está usando. Como resultado, es importante notar que Web Bluetooth no funciona tan bien como las aplicaciones nativas, especialmente en dispositivos Android.

### Consejos y mejores prácticas
Aquí hay algunos consejos y mejores prácticas para optimizar el rendimiento de las aplicaciones Web Bluetooth:
- Minimiza las transferencias de datos: La comunicación Bluetooth es lenta comparada con otros canales de comunicación. Por lo tanto, es importante minimizar la cantidad de datos que tu aplicación envía y recibe a través de Bluetooth. Por ejemplo, puedes reducir el número de operaciones de lectura y escritura y solo transferir los datos necesarios para tu aplicación.
- Usa notificaciones en lugar de polling: En lugar de consultar continuamente el valor de una característica, usa notificaciones para recibir actualizaciones cuando el valor cambie. Este enfoque puede reducir el número de operaciones de lectura y mejorar el rendimiento de tu aplicación.
- Desconéctate cuando no esté en uso: Desconéctate del servidor GATT cuando no estés comunicándote activamente con el dispositivo. Esto puede reducir el consumo de energía y mejorar la vida de la batería del dispositivo.
- Usa caché: El caché puede usarse para almacenar datos que son accedidos frecuentemente por tu aplicación. Esto puede reducir el número de operaciones de lectura y mejorar el rendimiento de tu aplicación.
- Optimiza el proceso de escaneo: Escanear dispositivos puede ser una operación intensiva en recursos. Por lo tanto, es importante optimizar el proceso de escaneo reduciendo el tiempo de escaneo y filtrando los resultados para incluir solo dispositivos relevantes.
- Prueba tu aplicación en diferentes dispositivos: Prueba tu aplicación en diferentes dispositivos para asegurar que funcione bien en diferentes plataformas y configuraciones de hardware.

### Reflexión final
A pesar de estas limitaciones, Web Bluetooth sigue siendo una tecnología prometedora con muchos casos de uso potenciales. Los desarrolladores que estén interesados en usar Web Bluetooth deben considerar cuidadosamente estas limitaciones y diseñar sus aplicaciones en consecuencia.

### Referencias
- https://www.smashingmagazine.com/2019/02/introduction-to-webbluetooth/
- https://googlechrome.github.io/samples/web-bluetooth/
