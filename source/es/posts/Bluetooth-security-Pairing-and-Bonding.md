---
title: "Seguridad Bluetooth: Emparejamiento y Vinculación"
date: 2024-08-31 10:38:32
tags: [CoreBluetooh, BLE]
layout: post
lang: es
thumbnail: /Post-Resources/Bonding/cover.png
---

En los tiempos modernos, Bluetooth juega un papel crucial en la conexión de dispositivos de manera fluida. Desde rastreadores de fitness hasta dispositivos domésticos inteligentes, Bluetooth Low Energy (BLE) permite que los dispositivos se comuniquen de manera eficiente mientras reducen el consumo de energía. Sin embargo, con el aumento de la comunicación inalámbrica, garantizar la seguridad se ha convertido en una preocupación clave. Dos conceptos fundamentales de la seguridad Bluetooth son el **Emparejamiento** y la **Vinculación**, que a menudo se malinterpretan en el contexto de BLE.

<!-- more -->

Garantizar que los dispositivos se emparejen y vinculen de manera segura es crítico para proteger datos sensibles. La implementación incorrecta de estos procesos puede llevar a varios tipos de ataques. Por ejemplo, los atacantes pueden interceptar comunicaciones y robar información valiosa.

En este blog, exploraremos qué son el emparejamiento y la vinculación, por qué son importantes para la seguridad y cómo funcionan en la práctica, particularmente para aplicaciones móviles.

## Nivel bajo: Security Manager (SM)
En el núcleo de la seguridad BLE está el Security Manager (SM), un componente crucial que gestiona varias funciones de seguridad. El SM maneja el intercambio de claves de seguridad y asegura que todos los datos transmitidos entre dispositivos estén cifrados y protegidos contra acceso no autorizado.

Las responsabilidades clave del SM incluyen la gestión del emparejamiento, vinculación, cifrado y autenticación, y la gestión de claves.

El SM proporciona diferentes métodos de autenticación para diferentes niveles de seguridad:

- **Just Works**: Sin autenticación involucrada. Usado para aplicaciones de baja seguridad.
- **Passkey Entry**: Se ingresa una clave (PIN) en uno o ambos dispositivos para autenticar.
- **Numeric Comparison**: Ambos dispositivos muestran un número, y el usuario debe confirmar que coinciden.
- **Out-of-Band (OOB)**: Se utiliza otra tecnología inalámbrica, como NFC, para intercambiar información, proporcionando seguridad mejorada.

![](/Post-Resources/Bonding/sm.png "Security Manager")

## Establecer la secuencia de emparejamiento y vinculación

El **Emparejamiento** es el proceso de establecer un enlace de comunicación seguro entre dos dispositivos Bluetooth. Este paso es esencial para asegurar que los dispositivos puedan compartir datos de manera segura. Durante el proceso de emparejamiento, los dispositivos intercambian información, se autentican mutuamente y crean claves de cifrado para proteger los datos que se transmiten.

La **Vinculación** es el siguiente paso después del emparejamiento. Una vez que dos dispositivos se emparejan exitosamente, pueden almacenar las claves de cifrado e información de seguridad relacionada para uso futuro. Esto asegura que los dispositivos no necesiten emparejarse nuevamente la próxima vez que se conecten. Al almacenar estas claves, los dispositivos pueden reconectarse más rápida y seguramente en el futuro.

A alto nivel, los pasos en el proceso de emparejamiento y vinculación incluyen:

*EMPAREJAMIENTO*
- **Iniciación**: Un dispositivo envía una solicitud de emparejamiento al otro.
- **Intercambio de Parámetros de Seguridad**: Los dispositivos comparten sus capacidades, incluyendo los métodos de autenticación disponibles.
- **Autenticación**: Dependiendo de los métodos disponibles (Just Works, Passkey Entry, Numeric Comparison u Out-of-Band), los dispositivos se autentican.
- **Generación de Claves**: Se generan claves de cifrado y se usan para asegurar la comunicación.
- **Establecimiento del Cifrado**: Los dispositivos comienzan la comunicación cifrada después de que las claves se intercambian exitosamente.
*VINCULACIÓN*
- **Almacenamiento de Información de Seguridad**: Después del emparejamiento, ambos dispositivos guardan las claves de cifrado para conexiones futuras.
- **Reconexión**: Durante interacciones futuras, los dispositivos pueden usar las claves guardadas para restablecer un enlace seguro y cifrado sin repetir el proceso de emparejamiento.

A continuación se muestra un resumen del flujo en el ejemplo de un dispositivo móvil (central) y un periférico (por ejemplo, relojes inteligentes, monitores, etc.).
![](/Post-Resources/Bonding/bonding_sequence.png "Establecer secuencia de emparejamiento y vinculación")

## Lado de la aplicación móvil
iOS no proporciona una API de vinculación explícita. Sin embargo, el proceso de vinculación ocurre de manera transparente cuando te conectas a un dispositivo BLE que lo requiere, y el sistema operativo solicitará al usuario la autenticación necesaria. La solicitud de emparejamiento generalmente se activa al acceder a características seguras.

En contraste, tienes más control sobre el proceso de emparejamiento y vinculación en Android.
```java
BluetoothDevice device = bluetoothAdapter.getRemoteDevice(deviceAddress);

// Checking bond state
int bondState = device.getBondState();
if (bondState == BluetoothDevice.BOND_BONDED) {
    // Already bonded
} else {
    // Create bond
    device.createBond();
}

...
// Moniroting updates
BroadcastReceiver receiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
        final String action = intent.getAction();
        if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action)) {
            int bondState = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.ERROR);
            if (bondState == BluetoothDevice.BOND_BONDED) {
                // Device is bonded
            } else if (bondState == BluetoothDevice.BOND_BONDING) {
                // Bonding in progress
            } else if (bondState == BluetoothDevice.BOND_NONE) {
                // Bonding failed
            }
        }
    }
};
```

En Android, no hay una API pública para eliminar programáticamente un dispositivo vinculado. Sin embargo, hay un método de API privada disponible que se puede acceder usando reflexión para eliminar una vinculación. Ten en cuenta que, debido a que esta es una API privada, no está soportada por Google, y usarla en código de producción puede resultar en comportamiento impredecible en ciertos dispositivos o que tu aplicación sea rechazada durante el proceso de revisión de Google.

```java
public static boolean removeBond(BluetoothDevice device) {
    try {
        Method removeBondMethod = BluetoothDevice.class.getMethod("removeBond");
        return (boolean) removeBondMethod.invoke(device);
    } catch (Exception e) {
        e.printStackTrace();
    }
    return false;
}
```

## Mejores prácticas

Mientras trabajaba con dispositivos que necesitan datos cifrados, encontré algunos problemas. A continuación están los puntos clave que he aprendido, que podrían ayudarte a ahorrar tiempo:

- Para soportar auto-conexión desde el sistema iOS, el dispositivo debe contener el perfil HID o estar suscrito al perfil ANCS del teléfono.
- En Android, el sistema operativo no se reconecta automáticamente al dispositivo cuando está vinculado; es trabajo de tus servicios.
- El sistema iOS muestra automáticamente el popup de emparejamiento **inmediatamente** después de llamar exitosamente a `connect` con el dispositivo si contiene el perfil HID.
- Eliminar todas las características cifradas del perfil HID de tu dispositivo evita que el sistema muestre automáticamente el popup de emparejamiento.
- Al leer una característica cifrada personalizada del perfil GATT, aparecerá el popup de solicitud de emparejamiento.
- El sistema operativo aún se conectará automáticamente al dispositivo después de emparejarlo con nuestra característica cifrada, incluso si el dispositivo HID no está cifrado.
- Usa Métodos de Autenticación Fuertes: Prefiere Numeric Comparison o Passkey Entry sobre Just Works.
- Actualiza los Protocolos de Cifrado: Asegúrate de que tus dispositivos usen protocolos de cifrado modernos y fuertes.

## Conclusión

El emparejamiento y vinculación Bluetooth son procesos fundamentales que permiten la comunicación segura entre dispositivos. Al entender estos mecanismos, los desarrolladores pueden mejorar significativamente la seguridad de sus conexiones Bluetooth. A medida que crece el número de dispositivos conectados, garantizar una fuerte seguridad Bluetooth seguirá siendo una prioridad para salvaguardar datos personales sensibles.

## Referencias

- Kevin Townsend, Carles Cufí, Akiba, Robert Davidson - Getting Started with Bluetooth Low Energy\_ Tools and Techniques for Low-Power Networking-O'Reilly Media (2014)
- [How iOS and Android Handle Connections with BLE Human Interface Devices, Punch Through](https://punchthrough.com/ble-human-interface-device-connections-on-ios-and-android)
- [BLE Pairing and Bonding](https://technotes.kynetics.com/2018/BLE_Pairing_and_bonding/)
