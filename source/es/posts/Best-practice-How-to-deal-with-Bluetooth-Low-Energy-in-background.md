---
title: 'Mejores prácticas: Cómo manejar Bluetooth Low Energy en segundo plano'
date: 2018-07-23 18:26:27
tags: [iOS, BLE]
layout: post
ping: true
lang: es
---
## Prefacio
Cuando trabajas con CoreBluetooth, ¿alguna vez te has preguntado cómo puede sobrevivir una app BLE en iOS cuando el sistema la termina? ¿Cómo podemos traerla de vuelta al segundo plano? ¿Hay algo parecido a un servicio de Android que pueda ejecutarse indefinidamente? Puedes encontrar la respuesta a todas estas preguntas en este artículo. ¡Sigue leyendo!
![](/Post-Resources/BackgroundProcessing/Cover.png "")
<!-- more -->
## Ciclo de vida de la aplicación en iOS
Antes de profundizar en cómo mantener nuestra app activa en segundo plano, conviene repasar el ciclo de vida de las aplicaciones iOS.
Cada app iOS tiene cinco estados principales.
![](/Post-Resources/BackgroundProcessing/iOS_App_LifeCycle.png "Ciclo de vida de la aplicación iOS")
*Not running* — La app no ha sido lanzada, o estaba en ejecución pero fue terminada por el sistema o el usuario.
*Inactive* — El estado de transición antes de que la app pase a otro estado.
*Active* — La app se ejecuta en primer plano y recibe eventos del usuario.
*Background* — La app está en segundo plano e invisible para el usuario. Una app que solicita tiempo de ejecución adicional puede permanecer en este estado por un tiempo. La app pasa por el estado inactivo antes de entrar en modo de segundo plano.
*Suspended* — La app está en segundo plano y no puede ejecutar ningún código. El sistema la mueve a este estado automáticamente y la app no recibirá eventos. Cuando las apps en primer plano necesitan más memoria, el sistema puede terminar apps suspendidas para liberar espacio. No podemos predecir cuándo ocurrirá esto. Tras ser terminada, la app vuelve al estado not running.

<center>

![](/Post-Resources/BackgroundProcessing/AppCycle.gif "Ejemplo del ciclo de vida de una app iOS")

</center>

## Problemas de BLE con el ciclo de vida de la aplicación
Como se mencionó, cuando la app pasa al segundo plano puede ser terminada por el sistema si necesita liberar recursos para otras aplicaciones. A diferencia de Android — donde podemos reiniciar un servicio tras un kill del sistema — en iOS no hay forma de recuperar la app una vez que el sistema la ha terminado. Como resultado, cualquier evento Bluetooth enviado desde un dispositivo nunca llegará a la app. Esto significa que la app podría perder indicaciones activadas por el usuario — por ejemplo, reproducir una pista musical al presionar un botón físico en un dispositivo BLE.

Apple ilustra este problema con el ejemplo de la ["Smart door"](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/CoreBluetoothBackgroundProcessingForIOSApps/PerformingTasksWhileYourAppIsInTheBackground.html#//apple_ref/doc/uid/TP40013257-CH7-SW10) (puerta inteligente). La idea es una app que bloquea y desbloquea automáticamente la puerta cuando el usuario sale y regresa a casa. El reto central es mantener la conexión entre el teléfono y la cerradura mientras el usuario usa el móvil — abriendo y cerrando apps, activando o desactivando Bluetooth, entrando en modo avión, reiniciando el teléfono, etc. Cualquiera de estas acciones puede provocar que el sistema mate nuestra app de forma permanente. En ese caso, la app no podrá reconectarse a la cerradura cuando el usuario llegue a casa.

<center>

![](/Post-Resources/BackgroundProcessing/SmartDoor.jpg "Puerta inteligente")

</center>

Para resolver esto, Apple proporciona *State Preservation and Restoration* (procesamiento en segundo plano de CoreBluetooth). Esta funcionalidad está integrada en CoreBluetooth y permite que nuestra app sea relanzada en segundo plano cuando el sistema la termina.

En esencia, iOS toma una instantánea de todos los objetos relacionados con Bluetooth que estaban activos en la app. Si posteriormente llega al teléfono un evento Bluetooth relacionado con esos objetos, el sistema despertará la app desde su estado terminado. Es una capacidad muy poderosa.

## Implementar State Preservation and Restoration

Para demostrar esta técnica, reutilizaré el código fuente del artículo anterior [Desempeñar Roles de Central y Periférico con CoreBluetooth](/2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/) y añadiré el código necesario para habilitar la restauración en segundo plano.

Primero, configuro mi iPad para actuar como Periférico con UUID "1FA2FD8A-17E0-4D3B-AF45-305DA6130E39", generado con el comando `uuidgen` en Mac. Lo hago empezar a hacer advertising con el nombre local "iPad". Cuando un central manager establece una conexión, se imprimen logs de entrada/salida para confirmar que la conexión fue exitosa.

<center>

![](/Post-Resources/BackgroundProcessing/Peripheral.gif "iPad actuando como periférico")

</center>

Al tocar el botón "Send Notify", la app notifica la cadena "Say something cool!" a través de la característica "463FED21-DA93-45E7-B00F-B5CD99775150" — definida como una característica notificable encriptada — al central manager conectado.

A continuación, en la app Central Manager, crea un Restore Identifier para el objeto `CBCentralManager` — yo usé la cadena "YourUniqueIdentifierKey". Esto indica a CoreBluetooth que preserve este manager cuando la app sea terminada. Luego implementa el delegado `willRestoreState`:

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
Cuando se llama a `centralManager(_:willRestoreState:)`, reproduzco un sonido y muestro una notificación local con el nombre del periférico restaurado, confirmando que el sistema despertó la app. El parámetro `dict` contiene una instantánea completa del estado Bluetooth. Con la clave `CBCentralManagerRestoredStatePeripheralsKey` obtenemos un array de `CBPeripheral` — todos los periféricos que estaban conectados o pendientes de conexión cuando la app fue terminada. Itero sobre ellos, encuentro el periférico que me interesa y lo restauro en la variable `connectedDevice` para seguir recibiendo actualizaciones.

También añado notificaciones locales en `appDidFinishLaunching` y en `peripheral(_:didUpdateValueFor:characteristic:)` para las pruebas:

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
Es hora de ejecutar el experimento. Uso dos métodos para simular la terminación en segundo plano por parte del sistema.

**Método 1 — usando Xcode:**
- Ejecuta la app desde Xcode.
- Detén la app pulsando el botón "Stop".
- Reinicia la app desde Xcode.

**Método 2 — usando el hardware:**
- Pulsa el botón Home para mover la app al segundo plano.
- Mantén pulsado el botón de encendido hasta que aparezca "deslizar para apagar".
- Suelta el botón de encendido y mantén pulsado el botón Home unos 5 segundos hasta que reaparezca la pantalla de inicio.

En la demo siguiente uso ambos métodos. ¡Mira lo que ocurre!

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

Me conecté al iPad, simulé la terminación con Xcode y confirmé que `centralManager(_:willRestoreState:)` fue activado mediante el popup. Luego usé el Método 2 — al reaparecer la pantalla de inicio, la app estaba definitivamente terminada. Pulsé "Send Notify" en el iPad (actuando como Periférico) para enviar un evento BLE. De inmediato, `centralManager(_:willRestoreState:)` fue llamado — apareció una notificación local y luego otra mostrando los datos BLE recibidos del periférico — la cadena "Say something cool!". Funcionó. La app puede sobrevivir a la terminación.

Hay una observación interesante: con el Método 1 (reinicio desde Xcode), el parámetro `launchOptions` en `application(_:didFinishLaunchingWithOptions:)` siempre es nil. Con el Método 2 podemos extraer `UIApplicationLaunchOptionsKey.bluetoothCentrals` (el valor devuelve "YourUniqueIdentifierKey"). El Método 2 es la simulación más precisa porque se ajusta a la documentación de Apple: *"Cuando el sistema relanza tu app, puedes recuperar todos los identificadores de restauración de los objetos central manager que el sistema preservaba para tu app."*

En `application(_:didFinishLaunchingWithOptions:)`, usa `UIApplicationLaunchOptionsBluetoothCentralsKey` para obtener un array de UUIDs que representan todos los `CBCentralManager` que Core Bluetooth estaba preservando. Recorre el array y encuentra el que coincida con tu Restoration Identifier para reinicializar el manager.

## Limitaciones
### Cuando el usuario cierra la app por la fuerza desde el selector de apps
Si el usuario cierra la app por la fuerza desde el selector de apps, no hay posibilidad de que la app sea despertada mediante state restoration. Sin embargo, existe otra tecnología que podemos aprovechar para volver al segundo plano: **iBeacon**. En el próximo artículo veremos cómo implementarla.

### Cuando el usuario reinicia el teléfono
Si el usuario reinicia el teléfono, la app será terminada de forma permanente. Podemos resolver esto mediante CoreLocation, lo cual cubriremos en la siguiente parte.

## Reflexiones finales

En este artículo repasamos el ciclo de vida de la aplicación iOS y exploramos cómo mantener una app BLE activa incluso después de que el sistema la termine. El contenido proviene directamente de experiencia real de trabajo.

Espero que este artículo te resulte útil.
