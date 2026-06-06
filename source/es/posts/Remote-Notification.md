---
title: Notificaciones Remotas
date: 2021-04-08 18:22:07
tags: [iOS, Notification]
layout: post
lang: es
thumbnail: /Post-Resources/Remote_Notification/remote_notification.png
---

Las notificaciones push permiten que tu aplicación llegue a los usuarios con más frecuencia, y también pueden realizar algunas tareas. En este tutorial, aprenderemos cómo configurar aplicaciones para recibir notificaciones remotas, mostrar contenido y luego realizar algunas acciones cuando el usuario presiona sobre ellas.
Comencemos.

<!-- more -->
### APNs

APNs, que significa Apple Push Notification service, es un servicio que entrega mensajes a tus aplicaciones. La información de notificación enviada puede incluir badges, sonidos, contenido personalizado o alertas de texto personalizadas. Ten en cuenta que necesitas una cuenta de desarrollador de pago para poder configurar tu aplicación con la capacidad de Push Notification. También necesitas un dispositivo físico para probar si quieres lanzar notificaciones remotas ya que las notificaciones push no están disponibles en el simulador. Solo puedes simular notificaciones en simuladores.

### Configuración
Primero, necesitas agregar el entitlement de notificaciones push a tu proyecto,
Dirígete a Project Setting > Signing Capabilities > + Capability > Agrega `Push Notification`

![](/Post-Resources/Remote_Notification/add_noti.png "")

Si quieres enviar notificaciones a dispositivos reales, necesitas hacer algunos pasos extra para tener una clave de notificación:

1. Inicia sesión en [Apple developer](https://developer.apple.com/account/resources/certificates/list)
2. En la sección `Keys` > Agregar nuevas claves > Ingresa el nombre de tu clave > Selecciona `Apple Push Notifications service (APNs)` > Continuar.
![](/Post-Resources/Remote_Notification/create_key.png "")
3. Descarga la clave y guárdala en cualquier ubicación donde quieras guardar esta clave. Nota que el nombre del archivo de la clave tiene un patrón `AuthKey_[Key ID].p8`

### Solicitar permisos del usuario
A continuación, la aplicación necesita pedir al usuario permiso para mostrar notificaciones.
Abre el archivo `AppDelegate.swift` y agrega el siguiente código

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // The rest omitted
    self.registerPushNotifications()
    ...
}

func registerPushNotifications() {
    UNUserNotificationCenter.current()
        .requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            guard granted else { return }
            // If the user allows showing notification, then register the device to receive a push notification
            self.registerForRemoteNotification()
    }
}

func registerForRemoteNotification() {
    UNUserNotificationCenter.current().getNotificationSettings { settings in
        guard settings.authorizationStatus == .authorized else { return }

        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
}

```

Si el proceso se completa exitosamente, se llamará al callback `didRegisterForRemoteNotificationsWithDeviceToken:` incluyendo tu token de dispositivo (Un valor único para identificar tu dispositivo, nota que es diferente cada vez que reinstalas la aplicación).
Si ocurre un error, se activará `didFailToRegisterForRemoteNotificationsWithError:`.

```swift
func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    print("Did register remote notification successfully \(deviceToken.hexadecimalString)")
}

func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("Did failed register remote notification \(error.localizedDescription)")
    // e.g Did failed register remote notification no valid "aps-environment" entitlement string found for application
}
```

Nota que `Alert`, `sound` y `badge` es la combinación común al solicitar autorización.
Hay otras opciones que puedes encontrar en la [documentación de Apple](https://developer.apple.com/documentation/usernotifications/unauthorizationoptions).
Otra advertencia es que si ejecutas tu aplicación en un simulador, obtendrás el evento `didFailToRegisterForRemoteNotificationsWithError` ya que las notificaciones remotas no son soportadas en simuladores.
### Manejar notificaciones mientras la aplicación está en primer plano
Después de registrarte para notificaciones remotas exitosamente, si quieres manejar notificaciones mientras tu aplicación está en primer plano, necesitas implementar `userNotificationCenter:willPresent:withCompletionHandler` en tu clase.

```swift
public func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    ...
    completionHandler([.alert, .sound, .badge])
}
```

**Si no implementas esta función, las notificaciones no se mostrarán si tu aplicación está en primer plano.**
### Es hora de enviar notificaciones
Hay 2 formas de probar tu implementación. Si no tienes un dispositivo físico, no te preocupes, aún puedes simular notificaciones de una manera simple, o puedes enviar notificaciones reales a dispositivos reales.
#### Simular APNs
Crea un archivo con extensión `.apns`. ej. SimulateNoti.apns, luego copia tu contenido a este archivo
```bash
{
    "Simulator Target Bundle": "YOUR_APP_BUNDLE_ID", <--- CAMBIA A TU APP BUNDLE ID
    "aps": {
        "alert": {
            "title" : "Your title",
            "subtitle" : "Your subtitle",
            "body" : "Your body"
        },
        "sound": "default"
    }
}
```

Arrastrar y soltar esto en el simulador objetivo presentará la notificación

<div style="text-align:center">

![](/Post-Resources/Remote_Notification/simulate_notification.gif "Simulation")

</div>


#### Enviar a dispositivos reales
Primero, necesitas una herramienta cliente de notificaciones remotas que te ayude a enviar una notificación. Una gran herramienta para probar es [Push notification tester](https://github.com/onmyway133/PushNotifications). Navega a este sitio web para descargar y lanzar la aplicación.

Después de lanzar la aplicación exitosamente,
1. Cambia a la pestaña `TOKEN` en la sección `Authentication`.
2. Presiona `SELECT P8` y selecciona tu archivo P8 que descargaste del paso anterior, luego completa el resto de la información `KEY ID`, `TEAM ID`. El `KEY ID` es parte del nombre del archivo P8 `AuthKey_[Key ID].p8`. Para el `TEAM ID`, puedes encontrarlo en tu página de membresía.
![](/Post-Resources/Remote_Notification/membership.png "")

3. En la sección `Body`, completa tu bundle Id de la aplicación (ej. com.example.yourapp) y tu token de dispositivo que se generó del callback `didRegisterForRemoteNotificationsWithDeviceToken:`.
4. Compón tu contenido. Aquí hay un cuerpo común para notificaciones push.
ej.
```bash
{
    "aps": {
        "alert": {
            "title" : "Your title",
            "subtitle" : "Your subtitle",
            "body" : "Your body"
        },
        "sound": "default"
    }
}
```

Para todas las opciones disponibles en una notificación, por favor consulta la [documentación de Apple: generating_a_remote_notification](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification)

![](/Post-Resources/Remote_Notification/testing.png "")

5. Presiona el botón `Send` para entregar tu notificación al dispositivo seleccionado. Aparecerá un mensaje en la parte superior del botón para mostrar el resultado.
<center>
<img src="/Post-Resources/Remote_Notification/notification.jpeg" alt="" style="width:300px;"/>
</center>

### Notificación silenciosa
Desde mi perspectiva, la característica más interesante de las notificaciones Push es la "Notificación silenciosa", **que puede despertar tu aplicación para realizar algunas tareas mientras tu aplicación está en segundo plano**, incluso si tu aplicación fue terminada por el usuario. Muchos ingenieros están buscando una manera de mantener su aplicación viva en segundo plano tanto como puedan. Hay varias formas de lograrlo usando restauración y preservación, core location, iBeacon. La notificación push silenciosa es una de ellas.

Tendré [otra publicación](/2021/08/06/Silent-notification) hablando sobre notificación silenciosa y mi experimento para que tengamos más detalles e información.

Para enviar una notificación silenciosa, simplemente cambia el contenido JSON a

```bash
{
  "aps": {
    "content-available": 1
  }
}
```

Después de presionar el botón `Send`, no hay notificación mostrándose en tu aplicación.
### Reflexión final
Al usar notificaciones push sabiamente, puedes involucrar a los usuarios para que vuelvan a tu aplicación nuevamente. Sin embargo, si abusas de las notificaciones, puede llevar a efectos negativos como que los usuarios desactiven los permisos de tu aplicación o califiquen tu aplicación con 1* con quejas en la tienda (Igual que nuestra historia en el pasado :)).
Las notificaciones no solo ayudan a entregar tus mensajes a los usuarios sino que también pueden usarse para otros propósitos avanzados como despertar tu aplicación usando notificaciones silenciosas. En la próxima publicación, tendremos una mirada profunda a esta increíble característica.
Si tienes alguna duda o comentario, házmelo saber.
¡Feliz de compartir!
### Referencias
1. [Apple doc: Generating a remote notification](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification)
2. [Raywenderlich: Push notification tutorial](https://www.raywenderlich.com/11395893-push-notifications-tutorial-getting-started)
