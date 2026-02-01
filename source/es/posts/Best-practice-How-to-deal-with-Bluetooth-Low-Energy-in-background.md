---
title: 'Mejores prácticas: Cómo manejar Bluetooth Low Energy en segundo plano'
date: 2018-07-23 18:26:27
tags: [iOS, BLE]
layout: post
lang: es
---
## Prefacio
Cuando trabajas con CoreBluetooth, ¿alguna vez te has preguntado cómo la aplicación BLE en iOS puede sobrevivir cuando es terminada por el sistema? ¿Cómo podemos traerla de vuelta al segundo plano? ¿Hay algo como un servicio en Android que pueda durar para siempre? Puedes encontrar la respuesta a todas estas preguntas en esta publicación. ¡Sigue leyendo!
![](/Post-Resources/BackgroundProcessing/Cover.png "")
<!-- more -->
## Ciclo de vida de la aplicación en iOS
Antes de obtener una comprensión profunda de cómo podemos mantener nuestra aplicación en segundo plano, es bueno comenzar con el ciclo de vida de la aplicación en iOS.
Como ya sabrás, hay cinco estados principales de cada aplicación iOS.
![](/Post-Resources/BackgroundProcessing/iOS_App_LifeCycle.png "Ciclo de vida de la aplicación iOS")
*Not running* La aplicación no ha sido lanzada o estaba ejecutándose pero fue terminada por el sistema o el usuario.
*Inactive* Es el estado inicial antes de que la aplicación realmente haga la transición a un estado diferente.
*Active* La aplicación se está ejecutando en primer plano y recibiendo eventos del usuario.
*Background* La aplicación está en segundo plano y es invisible para el usuario. Sin embargo, una aplicación que solicita tiempo de ejecución adicional puede permanecer en este estado por un período de tiempo. Además, la aplicación hará la transición al estado inactivo antes de entrar en el modo de segundo plano.
*Suspended* La aplicación está en segundo plano pero no se le permite ejecutar ningún código. La aplicación es movida a este estado automáticamente por el sistema y no recibirá ningún evento antes de que el sistema lo haga. Cuando las aplicaciones en primer plano necesitan más memoria, el sistema puede terminar las aplicaciones suspendidas para hacer más espacio para las aplicaciones en primer plano. Ten en cuenta que no podemos predecir cuándo la aplicación suspendida será terminada por el sistema. Después de ser terminada, la aplicación regresa al estado not running.

<center>

![](/Post-Resources/BackgroundProcessing/AppCycle.gif "Ejemplo de ciclo de vida de aplicación iOS")

</center>

## Problemas de BLE con el ciclo de vida de la aplicación
Como se mencionó, cuando la aplicación entra en segundo plano, la aplicación podría ser terminada por el sistema si necesita liberar recursos para otras aplicaciones. A diferencia del SO Android, después de ser eliminada por el sistema, podemos reiniciar un servicio para mantener tu aplicación viva. En iOS, una vez que la aplicación es terminada por el sistema, no hay forma de traerla de vuelta al segundo plano. Como resultado, cualquier evento Bluetooth que se despache desde el dispositivo nunca llegará a la aplicación. Significa que tu aplicación podría perder las indicaciones que son activadas por los usuarios, como reproducir una pista de música en su teléfono al presionar botones físicos desde un dispositivo BLE.

Apple da un ejemplo llamado ["Smart door"](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/CoreBluetoothBackgroundProcessingForIOSApps/PerformingTasksWhileYourAppIsInTheBackground.html#//apple_ref/doc/uid/TP40013257-CH7-SW10) (Puerta inteligente). La idea principal de este ejemplo es tener una interacción automática entre la aplicación y la cerradura de la puerta. Imagina que estamos desarrollando una aplicación que puede bloquear y desbloquear automáticamente la puerta cuando el usuario entra y sale de su casa, respectivamente. Sin embargo, el principal problema de esta implementación es mantener la conexión entre los dos, el teléfono y la cerradura de la puerta. Mientras usan su teléfono, los usuarios hacen una variedad de acciones en el teléfono: abrir / cerrar aplicaciones, alternar la configuración de Bluetooth, entrar en modo avión, reiniciar el teléfono, etc. Estas interacciones pueden llevar a que nuestra aplicación sea eliminada por el sistema, para siempre. En este caso, la aplicación no podrá reconectarse a la cerradura cuando el usuario regrese a casa, y el usuario podría no poder abrir la puerta.

<center>

![](/Post-Resources/BackgroundProcessing/SmartDoor.jpg "Puerta inteligente")

</center>

Para lidiar con este problema, Apple proporciona un método llamado *State Preservation and Restoration* (Preservación y Restauración de Estado) (procesamiento en segundo plano de CoreBluetooth). *State Preservation and Restoration* está integrado en CoreBluetooth y permite que nuestra aplicación pueda ser relanzada en segundo plano cuando es terminada por el sistema.
En resumen, iOS toma una instantánea de todos los objetos relacionados con Bluetooth que estaban en marcha en nuestra aplicación. Posteriormente, si hay algún evento Bluetooth relacionado con los objetos Bluetooth con los que nuestra aplicación estaba interactuando llega al teléfono, nuestra aplicación será despertada de la tumba. ¡Eso es increíble!

## Implementar State Preservation and Restoration

Para demostrar la técnica de State Preservation and Restoration en iOS, voy a reutilizar el código fuente de la publicación anterior [Desempeñar Roles de Central y Periférico con CoreBluetooth](/2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/) pero agregaremos más código a los proyectos para hacerlo mágico.
Primero, configuro mi iPad para actuar como un Periférico con un uuid "1FA2FD8A-17E0-4D3B-AF45-305DA6130E39", que se genera a través del comando `uuidgen` en Mac. Luego, hago que comience a hacer advertising con el nombre local "iPad". Si hay una conexión establecida por un central manager, los logs de entrada/salida se imprimirán para saber si la conexión se realizó exitosamente.

<center>

![](/Post-Resources/BackgroundProcessing/Peripheral.gif "iPad actuando como periférico")

</center>

Cuando se toca el botón "Send Notify", la aplicación notificará una cadena de datos "Say something cool!" a través del "463FED21-DA93-45E7-B00F-B5CD99775150" que está definido como una característica notificable encriptada de la aplicación al central manager conectado.

Lo siguiente que necesitamos hacer es volver a la aplicación Central Manager y crear un Restore Identifier para los objetos CBCentralManager que serán tomados por el sistema operativo cuando la aplicación sea terminada, elegí la cadena "YourUniqueIdentifierKey". A continuación, implementaremos el `willRestoreState` proporcionado por Apple.
```swift
public func centralManager(_ central: CBCentralManager, willRestoreState dict: [String : Any]) {
    LocalNotification.shared.showNotification(id: "willrestorestate", title: "Manager will restore state", body: "", timeInterval: 1.0)

    let systemSoundID: SystemSoundID = 1321
    AudioServicesPlaySystemSound (systemSoundID)

    if let peripherals = dict[CBCentralManagerRestoredStatePeripheralsKey] as? [CBPeripheral] {
        peripherals.forEach { (awakedPeripheral) in
            print("\(Date.now). - Awaked peripheral \(String(describing: awakedPeripheral.name))")
            guard let localName = awakedPeripheral.name,
            localName == "iPad" else {
                return
            }

            self.connectedDevice = Device.init(peripheral: awakedPeripheral)
        }
    }
}
```
Aquí, cuando se llama a `centralManager(_:, willRestoreState)`, reproduciré una pista de sonido y mostraré una ventana emergente con el nombre del periférico despertado para informar que la aplicación realmente fue despertada por el sistema. Dentro del método, también podemos obtener un diccionario lleno de información de estado. Cuando lo recuperamos con la clave CBCentralManagerRestoredStatePeripheralsKey, esto contiene cosas como un array de CBPeripheral, que contiene todos los periféricos que estaban conectados o pendientes de conexión en el momento en que la aplicación fue terminada por el sistema. Aquí, itero a través del array de periféricos, verifico si está mi periférico de interés, luego inicializo un `Device` y lo establezco de nuevo en la variable `connectedDevice` para poder recibir valores actualizados del periférico.

También agrego el código que mostrará una notificación local en el delegado `appDidFinishLaunching` y en el método `peripheral(:didUpdateValueFor:chacracteristic)` para pruebas.

```swift
func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
    if let data = characteristic.value {
        let str = String.init(data: data, encoding: .utf8) ?? ""
        LocalNotification.shared.showNotification(id: "DidUpdateValue", title: "Peripheral did update value from grave!", body: "\(str)", timeInterval: 1.0)
    }
}
```

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
    let _ = BluetoothManager.sharedInstance
    let _ = LocalNotification.shared

    LocalNotification.shared.showNotification(id: "didfinishlaunch", title: "App did finish launching", body: "Options: \(launchOptions?[UIApplicationLaunchOptionsKey.bluetoothCentrals] ?? "nil")", timeInterval: 1.0)

    return true
}
```
¡Es hora de ejecutar nuestro experimento! Voy a usar dos métodos para simular la terminación de la aplicación en segundo plano por el sistema.
El primero es usando XCode.
- Ejecuta la aplicación desde Xcode.
- Detén la aplicación presionando el botón "Stop" desde Xcode.
- Reinicia la aplicación desde Xcode.

El segundo es haciendo los siguientes pasos:
- Presiona el botón home para hacer que la aplicación entre en segundo plano.
- Mantén presionado el botón de encendido hasta que veas "deslizar para apagar".
- Suelta el botón de encendido y mantén presionado el botón home por aproximadamente 5s (hasta que veas que tu pantalla de inicio reapareció).

En la siguiente demostración, verás que uso ambos para probar. ¡Veamos algo genial suceder!

<center>

![](/Post-Resources/BackgroundProcessing/Restoration.gif "Demo")

</center>

Aquí está el log impreso desde Xcode.

```bash
2018-08-18 19:46:35.6560 App did finish lauching with option nil
2018-08-18 19:46:35.6620 Manager will restore state
2018-08-18 19:46:35.6650. - Awaked peripheral Optional("iPad")
2018-08-18 19:46:35.6660 Manager did update state 5
2018-08-18 19:46:35.6950 App did become active
2018-08-18 19:46:35.7080 Found iPad
2018-08-18 19:46:35.7100 Did connect.
2018-08-18 19:46:51.5170 App will resign active
2018-08-18 19:46:52.1100 App did enter background
Message from debugger: Terminated due to signal 9
```

Primero, me conecté al dispositivo iPad, luego simulé la terminación por Xcode (Relanzar la aplicación desde Xcode), después de eso ves que el delegado `centralManager(_:, willRestoreState)` fue activado por la ventana emergente. Más tarde, simulé la terminación usando el segundo método, cuando la pantalla de inicio reapareció, una cosa es segura: la aplicación fue terminada. A continuación, presioné el botón "Send notify" desde el iPad (Que estaba actuando como Periférico) para enviar un evento BLE a la aplicación. Sorprendentemente, `centralManager(_:, willRestoreState)` fue llamado inmediatamente como podemos ver que apareció una notificación local, luego otra mostró los datos BLE recibidos del periférico (La cadena "Say something cool!"). ¡Realmente funcionó! ¡La aplicación ahora puede durar para siempre! Pero espera un minuto, no es tan simple. Este enfoque todavía tiene algunas limitaciones que discutiremos más adelante en esta publicación.

Como habrás notado, hay una diferencia entre las dos formas que usé para simular la terminación en segundo plano, cuando la aplicación fue relanzada desde la primera forma, el valor de option del delegado `application(application:didFinishLaunchingWithOptions:)` siempre es nil, mientras que podíamos extraer el `[UIApplicationLaunchOptionsKey.bluetoothCentrals` usando la segunda forma (El valor de `launchOptions?[UIApplicationLaunchOptionsKey.bluetoothCentrals]` devolverá la cadena "YourUniqueIdentifierKey"). No sé la razón por la que sucedió. Pero una cosa es segura: el segundo enfoque es mejor que el primero ya que coincide con el documento de Apple. *"Cuando tu aplicación es relanzada por el sistema, puedes recuperar todos los identificadores de restauración para los objetos central manager que el sistema estaba preservando para tu aplicación".*

Entonces, en `application(application:didFinishLaunchingWithOptions:)`, podemos obtener una lista de UUID que representan todos los objetos CBCentralManager que estaban activos cuando la aplicación fue terminada y que Core Bluetooth e iOS tomaron mientras estabas terminado. Usa UIApplicationLaunchOptionsBluetoothCentralsKey para obtener cualquier central que hayamos instanciado antes de ser eliminados. Recorre el array de centralManagerUUID y encuentra el que coincida con el Restoration Identifier que nos interesa.

## Limitaciones
### Cuando el usuario fuerza el cierre de la aplicación desde la vista de tareas múltiples
Si el usuario fuerza el cierre de la aplicación desde la vista de tareas múltiples, no hay oportunidad para que la aplicación se despierte del evento de restauración. Pero afortunadamente, hay otra tecnología que podemos aprovechar para poner la aplicación de nuevo en segundo plano llamada "iBeacon". En la próxima publicación, te guiaré sobre cómo implementar esta interesante tecnología en nuestra aplicación.

### Cuando el usuario reinicia el teléfono
Si el usuario reinicia el teléfono, la aplicación será eliminada para siempre. Aprovechando CoreLocation, podemos resolver el problema. En la próxima parte, te mostraré cómo hacerlo.

## Reflexiones finales

En esta publicación, recorrimos el ciclo de vida de la aplicación iOS, también te mostré cómo mantener la aplicación viva incluso cuando fue terminada por el sistema. Los contenidos de esta publicación son realmente interesantes y se forman a partir de mis experimentos de trabajo reales.
Espero que encuentres útil esta publicación.
