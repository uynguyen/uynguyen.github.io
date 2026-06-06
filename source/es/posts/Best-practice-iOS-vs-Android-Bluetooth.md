---
title: "Mejores prácticas: iOS vs Android Bluetooth"
date: 2024-06-30 10:48:09
tags: [BLE, iOS, Android]
layout: post
lang: es
thumbnail: /Post-Resources/IOSAndroid/ios_android.png
---

La tecnología Bluetooth se ha convertido en una parte integral de las aplicaciones móviles modernas, permitiendo una comunicación inalámbrica fluida entre dispositivos. Ya sea para conectarse a unos auriculares inalámbricos, transferir archivos o interactuar con dispositivos del hogar inteligente, Bluetooth juega un papel crucial en mejorar la experiencia del usuario.

Para los desarrolladores móviles, entender cómo implementar la funcionalidad Bluetooth es esencial. En esta publicación, profundizaremos en una comparación detallada de los frameworks de desarrollo Bluetooth para iOS y Android.

<!-- more -->

Exploraremos las diferencias clave y similitudes entre estas dos plataformas, cubriendo todo desde la configuración inicial hasta la transferencia de datos y el manejo de errores. Al final de esta comparación, tendrás una comprensión clara de cómo aprovechar la tecnología Bluetooth en tus aplicaciones móviles, independientemente de si estás desarrollando para iOS o Android.

Para tener una mejor visualización, hice una imagen a continuación para resumir el flujo para establecer una conexión en Android e iOS

![](/Post-Resources/IOSAndroid/flow.png "iOS & Android flow")

A primera vista, los dos flujos parecen bastante similares. Sin embargo, el flujo de Android incluye pasos adicionales. Aunque el proceso de conexión es más complejo en Android comparado con iOS, proporciona mayor control sobre los datos devueltos. Desglosemos el flujo en tres pasos principales para discusión: `Scanning`, `Getting Ready`, `Interacting` y `Closing`. Cada uno de estos pasos involucra acciones específicas y consideraciones que contribuyen a la funcionalidad general y eficiencia del proceso de conexión.

## Scanning
En la fase de scanning, los procesos son bastante similares entre Android e iOS, desde iniciar un escaneo hasta crear una conexión.

La principal diferencia es que hay más información sobre el peripheral en el resultado del escaneo en Android que en iOS. El valor más interesante es la dirección MAC del dispositivo. iOS no expone este valor y en su lugar proporciona un UUID aleatorio.
Los UUIDs en iOS se generan por aplicación y por emparejamiento de dispositivo, y su vida útil está ligada a la sesión o hasta que el dispositivo sea olvidado, así que no confíes en él para identificar o reconectarte a tus dispositivos. iOS no expone la dirección MAC por varias razones, principalmente relacionadas con privacidad y seguridad. Al ocultar la dirección MAC, Apple asegura que las aplicaciones y terceros no puedan usar mal esta información para rastrear o perfilar usuarios y también ayuda a prevenir actividades ilegales por parte de atacantes.

Una posible solución para superar esta limitación es incluir tu propio identificador único en el paquete de advertising, que estará disponible en todas las plataformas.

Otra nota importante es que el sistema operativo Android previene iniciar-detener escaneos más de aproximadamente 5 veces en 30 segundos (por favor nota que este valor varía de dispositivo a dispositivo). Llamar al método `startScan` muy frecuentemente en un corto tiempo llevará a que no se descubran dispositivos.

El último valor común es el valor de intensidad de señal, `RSSI (Received Signal Strength Indicator)`, que indica qué tan lejos está el dispositivo del teléfono. El rango es de -30 a -99; cuanto más cercano esté el valor a -30, más cerca está el dispositivo.

## Getting Ready
Una vez que tu dispositivo ha sido descubierto, el siguiente paso es prepararlo para que puedas realizar acciones de lectura y escritura. Hay dos enfoques diferentes para hacer que un dispositivo esté "listo".

El primer enfoque es `action on-demand`, que involucra no hacer nada hasta que sea necesario. Esto significa que no necesitas descubrir services/characteristics o establecer notificaciones hasta que tu aplicación realice comandos de lectura o escritura. La ventaja es una fase de conexión más corta, ya que tu aplicación no necesita descubrir todos los services y characteristics, establecer notificaciones o manejar errores si alguno falla. La desventaja es que la primera operación de lectura o escritura tomará más tiempo.

El segundo enfoque involucra descubrir todos los perfiles Bluetooth por adelantado y hacer que el dispositivo esté listo para cualquier comando. Las desventajas y ventajas son opuestas al primer enfoque. No hay nada correcto o incorrecto con cada enfoque; es solo una cuestión de preferencia. Así que elige el que mejor te convenga. Para mí, prefiero ir con el segundo enfoque, como se describe en la imagen.

La fase de configuración en iOS es bastante simple. Tu aplicación solo necesita descubrir todos los services. Para cada service, luego llamas a descubrir todas sus characteristics. Finalmente, establece notificaciones si las characteristics soportan cambios de valor. Podrías querer mantener una referencia a cada item de characteristic (`CBPeripheral`) para que puedas realizar operaciones de lectura y escritura.

Por otro lado, el flujo de "preparar" es bastante complicado para Android. Si eres un desarrollador de iOS, podrías no interactuar mucho con el `GATT Descriptor` en tu aplicación. Primero, necesitas familiarizarte con los conceptos de `GATT Descriptor` y `MTU (Maximum Transmission Unit)`.

`GATT Descriptor` proporciona información extra sobre la characteristic con la que están asociados. Por ejemplo, cuando lees un valor de temperatura de un termómetro BLE, la characteristic podría tener un descriptor indicando la unidad de medida en Celsius o Fahrenheit. El GATT Descriptor más común es el `Client Characteristic Configuration Descriptor (CCCD)`, que usarás para habilitar/deshabilitar notificaciones/indicaciones para una characteristic.
La principal diferencia entre los tipos `notification` e `indication` es la confiabilidad. Las notificaciones son enviadas por el peripheral sin requerir un acknowledgment del dispositivo central. En contraste, las indicaciones requieren un acknowledgment del dispositivo central.

Es simple establecer una notificación en iOS llamando a `CBCharacteristic.setNotify()` y el sistema hará el resto por ti. Identificará automáticamente el tipo de notificación y establecerá el valor correcto. En Android, debes llamarlo tú mismo. El siguiente código de ejemplo demuestra cómo puedes establecer una notificación para tu characteristic en Android:

```java
final UUID CCCD_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
if (!gattServer.setCharacteristicNotification(characteristic, true)) {
    return false;
}

final boolean canNotify = (characteristic.getProperties()
    & BluetoothGattCharacteristic.PROPERTY_NOTIFY) > 0;
final boolean canIndicate = (characteristic.getProperties()
    & BluetoothGattCharacteristic.PROPERTY_INDICATE) > 0;

if (!canNotify && !canIndicate) {
    // No soporta notification/indication, no hacemos nada
    return true;
}

final BluetoothGattDescriptor cccDescriptor = characteristic.getDescriptor(CCCD_UUID);
if (cccDescriptor == null) {
    // ¿No se puede encontrar el descriptor en la characteristic?
    return false;
}
if (cccDescriptor.setValue(canNotify
        ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
        : BluetoothGattDescriptor.ENABLE_INDICATION_VALUE)) {
    gattServer.writeDescriptor(cccDescriptor);
    return true;
}

return false;
```

El paso final es opcional: solicitar cambiar el valor de MTU.
`MTU (Maximum Transmission Unit)` se refiere a la mayor cantidad de datos que pueden enviarse en un solo paquete Bluetooth. Por defecto, el valor de MTU en BLE es 23 bytes, en otras palabras, para un solo comando de lectura y escritura, el máximo de bytes que tu aplicación/dispositivo puede entregar es 23 bytes (con un header de 3 bytes), pero puede negociarse entre los dispositivos central y peripheral hasta 517 bytes.

En iOS, no solicitas directamente un tamaño de MTU; en su lugar, el MTU se negocia automáticamente entre los dispositivos central y peripheral durante el proceso de conexión. En Android, usa `BluetoothGatt.requestMtu()` para solicitar un tamaño de MTU específico y maneja la respuesta en `BluetoothGattCallback.onMtuChanged()`. Es un error común olvidar aumentar el MTU mientras tu dispositivo está enviando más de 20 bytes por solicitud, lo que lleva a datos faltantes en el paquete.

Un comentario importante respecto a establecer conexiones es que hay un número máximo de dispositivos que pueden conectarse simultáneamente. No hay documentos oficiales para este número, pero muchos desarrolladores han encontrado que en iOS es alrededor de 7 - 10 dispositivos, mientras que en Android es alrededor de 10 - 20 dependiendo del modelo de teléfono y versión de Android.

```java
private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
    @Override
    public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
        if (status == BluetoothGatt.GATT_SUCCESS) {
            // Cambio de tamaño de MTU exitoso
            Log.d("MTU", "MTU changed to " + mtu);
        } else {
            // Cambio de tamaño de MTU fallido
            Log.d("MTU", "MTU change failed with status " + status);
        }
    }
};
```

## Interacting
Al completar todos los pasos anteriores exitosamente, tu dispositivo está ahora listo para usar. Puedes leer valores de una characteristic, transferir datos a una específica, o leer el valor RSSI para determinar la distancia. Asegúrate de manejar los cambios de valor correctamente verificando de qué characteristic viene el valor.

Vale la pena mencionar que en iOS, si tu aplicación transfiere una gran cantidad de datos al dispositivo (por ejemplo, transfiriendo un archivo), deberías esperar a que el siguiente evento `peripheralIsReady` se dispare antes de enviar el siguiente paquete. Enviar continuamente múltiples paquetes sin esperar este evento podría poner presión en los buffers de cola, llevando a paquetes perdidos.

```swift
func peripheralIsReady(toSendWriteWithoutResponse peripheral: CBPeripheral) {
    // Listo para enviar el siguiente paquete
}
```

## Closing
Una vez más, el paso de desconexión en iOS es muy simple. Solo necesitas llamar al método `cancelPeripheralConnection`.

En Android, necesitas hacer más de una operación: `disconnect` el dispositivo y `close` el Bluetooth GATT. Recuerda que llamar `disconnect` solo cancela la conexión con el peripheral, no libera todos los recursos (por ejemplo, slots disponibles en el stack Bluetooth) hasta que llames `close`. Usas `disconnect` cuando quieres terminar temporalmente la conexión pero podrías reconectarte al dispositivo más tarde sin necesidad de restablecer completamente la configuración GATT. Usas `close` cuando has terminado completamente con la conexión Bluetooth y quieres asegurar que todos los recursos se limpien.

## Conclusión
En esta publicación, exploramos los puntos importantes de implementar funcionalidad Bluetooth en aplicaciones móviles para iOS y Android. A través de nuestra comparación detallada, surgieron varios puntos clave que destacan tanto las similitudes como las diferencias entre estas dos plataformas.

iOS Core Bluetooth ofrece un framework robusto y directo que se integra perfectamente con el ecosistema iOS. Proporciona una API limpia y consistente.

Android Bluetooth, por otro lado, ofrece flexibilidad, capacidades extensas y soporta una amplia gama de funcionalidades Bluetooth. Aunque la configuración e implementación podría ser ligeramente más compleja comparada con iOS, la API Bluetooth de Android proporciona herramientas poderosas para manejar interacciones Bluetooth efectivamente.

## Referencias
[The Ultimate Guide to Android Bluetooth Low Energy](https://punchthrough.com/android-ble-guide/)
[The Ultimate Guide to Apple's Core Bluetooth](https://punchthrough.com/core-bluetooth-basics/)
