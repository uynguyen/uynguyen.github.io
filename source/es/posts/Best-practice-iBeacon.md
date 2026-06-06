---
title: 'Mejores prácticas: iBeacon'
date: 2018-08-18 21:17:47
tags: [BLE, iOS, iBeacon]
layout: post
lang: es
thumbnail: /Post-Resources/ibeacon/ibeacon.png
---
Bienvenido a la siguiente parte de la serie de "[Cómo manejar BLE en segundo plano](/2018/07/23/Best-practice-How-to-deal-with-Bluetooth-Low-Energy-in-background/)".
En la parte anterior, te guié sobre cómo mantener tu aplicación viva el mayor tiempo posible cuando tu aplicación entra en modo de segundo plano usando la técnica *State Preservation and Restoration* soportada por Apple. Sin embargo, hay algunos casos de uso que esta técnica no puede manejar, como se describe a continuación (referencia al [documento de Apple: Conditions Under Which Bluetooth State Restoration Will Relaunch An App](https://developer.apple.com/library/archive/qa/qa1962/_index.html))
![](/Post-Resources/ibeacon/condition_relaunch.png "Condiciones bajo las cuales Bluetooth State Restoration relanzará una aplicación")
Como puedes ver, hay un caso común cuando los usuarios fuerzan el cierre de la aplicación desde la vista de tareas múltiples (Ya sea accidentalmente o intencionalmente), la técnica de Restoration no puede despertar tu aplicación. Imaginemos que tu aplicación tiene una función que permite a los usuarios presionar un botón en sus dispositivos conectados por BLE para encontrar dónde está su teléfono, pero si tu aplicación no se está ejecutando o no puede despertarse para manejar la señal BLE enviada desde tus dispositivos, esta función sería inútil.
En esta publicación, te mostraré una técnica usando iBeacon para lidiar con este caso, que le da a tu aplicación otra oportunidad de despertarse aunque haya sido terminada por los usuarios. ¡Vamos a sumergirnos!
<!-- more -->
## Bienvenido al mundo de iBeacon
[iBeacon](https://en.wikipedia.org/wiki/IBeacon) es un protocolo introducido por primera vez por Apple en la WWDC 2013. "iBeacon se basa en la detección de proximidad Bluetooth low energy transmitiendo un identificador universalmente único captado por una aplicación compatible o sistema operativo. El identificador y varios bytes enviados con él se pueden usar para determinar la ubicación física del dispositivo, rastrear clientes o activar una acción basada en la ubicación en el dispositivo, como un check-in en redes sociales o una notificación push" (Wiki).
La aplicación de iBeacon es muy diversa como servicios basados en ubicación, comercio móvil o publicidad, por nombrar algunos.
"The Automatic Museum Guide" (La Guía Automática del Museo) es un proyecto que me impresionó mucho, construido sobre la tecnología iBeacon. La aplicación permite a los visitantes explorar exhibiciones mostrando los contenidos apropiados rastreando su ubicación y su distancia con el beacon. ¡Esa es una idea brillante!
<center>
	<iframe width="100%" height="400" src="https://www.youtube.com/embed/LlNLAAUkcRs" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</center>

## Cómo funciona
Apple ha estandarizado el contenido de los datos de advertisement de iBeacon. Consiste en un UUID de 16 bytes, la versión major y minor. Estos tres factores son únicos para cada beacon. Un último campo en el paquete es TX power usado para determinar qué tan cerca estás del beacon.
Un beacon transmite este paquete en su rango, desde 20m hasta 300m, a intervalos regulares de tiempo. Estos paquetes son detectados automáticamente por teléfonos cercanos, luego la aplicación realizará una acción predefinida como mostrar una notificación o mostrar un código de promoción.

![](/Post-Resources/ibeacon/iBeacon_format.png "Formato de datos de iBeacon")
![](/Post-Resources/ibeacon/how_ibeacon_work.png "Formato de datos de iBeacon")

Aunque iBeacon está basado en la tecnología Bluetooth low energy, una de las principales diferencias entre los dos es que iBeacon es una tecnología de transmisión unidireccional, con lo que quiero decir que solo el teléfono puede recibir datos de dispositivos iBeacon.

## Integración con iOS: comenzar a hacer advertising como un iBeacon
Primero, necesitamos un beacon para poder hacer el siguiente paso. Voy a usar mi iPad para actuar como un beacon usando un objeto `CLBeaconRegion` en CoreBluetooth en iOS.
La UI principal simplemente contiene dos botones principales que iniciarán y detendrán el advertisement del iBeacon, respectivamente.
![](/Post-Resources/ibeacon/ibeacon_device.png "UI principal de iBeacon")

```swift
let region = CLBeaconRegion(proximityUUID: self.uuid!,
                                        major: self.major,
                                        minor: self.minor,
                                        identifier: self.identifier)
let peripheralData = region.peripheralData(withMeasuredPower: nil)
peripheral.startAdvertising(((peripheralData as NSDictionary) as! [String : Any]))
```

Luego, implementamos el delegado `peripheralManagerDidStartAdvertising(CBPeripheralManager, Error?)` para verificar si el beacon hace advertising exitosamente.
```swift
func peripheralManagerDidStartAdvertising(_ peripheral: CBPeripheralManager, error: Error?) {
    if error == nil {
        print("Successfully started advertising our beacon data.")
    } else {
        print("Failed to advertise our beacon. Error = \(String(describing: error))")
    }
}
```

Para detener el advertising
```swift
peripheralManager?.stopAdvertising()
```

## Aprovechar la tecnología iBeacon para hacer que nuestra aplicación dure para siempre
Primero, dentro del método `didFinishLaunchingWithOptions` de la clase `AppDelegate`, mostraré una notificación para ser notificado cada vez que nuestra aplicación sea relanzada.
```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    NotificationHandler.shared.showNotification(title: "App did launch", body: "")
    return true
}
```

Después de que aparece la vista principal, le digo al location manager que comience a monitorear la región dada y que comience a medir la distancia de los iBeacons dentro de esa región
```swift
func startMonitoring() {
    locationManager.startMonitoring(for: beaconRegion)
    locationManager.startRangingBeacons(in: beaconRegion)
}
```
Por defecto, el monitoreo te notifica cuando se entra o sale de la región independientemente de si tu aplicación está ejecutándose. El ranging, por otro lado, monitorea la proximidad de la región solo mientras tu aplicación está ejecutándose.

Eso es todo para la configuración. En la siguiente demostración, verás que abro la aplicación y luego la termino desde la vista de tareas múltiples. Después de eso, presiono el botón "Start advertising" en mi iPad (El beacon). Verás que la aplicación fue relanzada inmediatamente aunque había sido eliminada (La notificación "App did launch" apareció). Eso es increíble.
<center>
    <img src="/Post-Resources/ibeacon/ibeacon_relaunch.gif" width="300">
</center>

*Nota*: No esperes recibir un evento de inmediato, porque solo los cruces de límites generan un evento. En particular, si la ubicación del usuario ya está dentro de la región en el momento del registro, el location manager no genera automáticamente un evento. En su lugar, tu aplicación debe esperar a que el usuario cruce el límite de la región antes de que se genere un evento y se envíe al delegado.

## Conclusiones
Una de las cosas más interesantes de iBeacon es que las aplicaciones iBeacon pueden ser despertadas incluso si han sido terminadas por el usuario. Significa que las aplicaciones iBeacon pueden durar para siempre. Para descargar los proyectos completos, por favor haz clic en los siguientes enlaces de Github:
- Actuar como un iBeacon: https://github.com/uynguyen/iBeaconDevice
- Aplicación Central manager: https://github.com/uynguyen/CentralManager-iBeacon

No dudes en enviarme un correo electrónico si tienes alguna pregunta.

## Referencias
[1] [Region Monitoring and iBeacon](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/LocationAwarenessPG/RegionMonitoring/RegionMonitoring.html)

