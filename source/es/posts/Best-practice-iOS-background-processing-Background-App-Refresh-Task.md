---
title: 'Mejores prácticas: procesamiento en segundo plano en iOS - Background App Refresh Task'
date: 2020-09-26 21:53:32
tags: [iOS, BLE]
ping: true
layout: post
lang: es
thumbnail: /Post-Resources/RefreshInBg/RefreshAppBg.png
---

A diferencia de Android, iOS restringe el procesamiento en segundo plano para mejorar la duración de la batería y la experiencia del usuario. Cuando una app entra en modo de segundo plano, los desarrolladores pierden el control directo sobre ella. Cómo y cuándo la app puede ejecutar una tarea depende completamente del sistema. En esencia, iOS usa un algoritmo complejo para determinar qué apps pueden ejecutarse en segundo plano, basándose en factores como los patrones de actividad del usuario, el estado de la batería y más.

En este tutorial aprenderemos cómo solicitar tiempo de ejecución en segundo plano en iOS. Una vez comprendido el funcionamiento, aplicaremos esta técnica a una app basada en BLE en el siguiente tutorial.

¡Comencemos!

<!-- more -->

## Conocimiento fundamental
Antes de entrar en la práctica, conviene entender cómo iOS gestiona los estados de la aplicación. Apple presentó en WWDC un video que describe los principales factores que afectan la ejecución en segundo plano ([WWDC 2020 - Background execution demystified](https://developer.apple.com/videos/play/wwdc2020/10063/?fbclid=IwAR1_oejf0JY9B8yV4d9riMAH4MQsLasO86iVjhwqmAruw2v64_utbuGZIEc)). Apple diseñó iOS para equilibrar dos objetivos en competencia: mantener el contenido de la app actualizado, mientras se adapta a sus metas fundamentales:

- **Duración de la batería**: permitir la ejecución en segundo plano manteniendo la batería para todo el día.
- **Rendimiento**: garantizar que la ejecución en segundo plano no afecte negativamente el uso activo.
- **Privacidad**: los usuarios deben ser conscientes de las tareas en segundo plano según sus patrones de uso.
- **Respetar la intención del usuario**: si el usuario realiza una acción, el sistema debe responder correctamente.

Los 7 factores principales que influyen en cómo el sistema programa la ejecución en segundo plano son:

- **Batería críticamente baja**: cuando el teléfono está a punto de quedarse sin batería (< 20%), el sistema pausará la ejecución en segundo plano para conservar energía.
- **Modo de bajo consumo**: cuando el usuario activa este modo, indica explícitamente al sistema que preserve la batería solo para tareas críticas.
- **Configuración de Background App Refresh**: el usuario puede activar o desactivar esta opción para permitir o no que una app específica ejecute tareas en segundo plano.
![](/Post-Resources/RefreshInBg/app_refresh_setting.png "App refresh setting")
- **Uso de la app**: los recursos del teléfono son limitados, por lo que el sistema debe priorizar las apps que el usuario usa más. Apple introdujo además un "motor predictivo en el dispositivo" que aprende qué apps usa el usuario y cuándo, para priorizar la ejecución en segundo plano.
- **App Switcher**: solo las apps visibles en el App Switcher tienen oportunidad de ejecutar tareas en segundo plano.
- **Presupuesto del sistema**: para evitar que las actividades en segundo plano agoten la batería y los datos, existe un límite diario de tiempo de ejecución y uso de datos en segundo plano.
- **Rate limiting**: el sistema aplica cierta limitación de frecuencia por lanzamiento.

Otros factores incluyen: modo avión, temperatura del dispositivo, estado de la pantalla, estado de bloqueo del dispositivo, entre otros.

![](/Post-Resources/RefreshInBg/factors.png "Factors")

## Capacidades
Asegúrate de que tu app tenga habilitadas las siguientes capacidades.

![](/Post-Resources/RefreshInBg/BG-Capabilities.png "Capability")

## Antes de iOS 13
Configurar un background fetch antes de iOS 13 es sencillo.
Dentro del método `application(_:didFinishLaunchingWithOptions)`, agrega la siguiente línea.
```swift
UIApplication.shared.setMinimumBackgroundFetchInterval(UIApplication.backgroundFetchIntervalMinimum)
```
`setMinimumBackgroundFetchInterval` especifica el tiempo mínimo que debe transcurrir entre ejecuciones de background fetch. El momento exacto depende del sistema. En la mayoría de los casos, `UIApplicationBackgroundFetchIntervalMinimum` es un valor predeterminado razonable.

Una vez que la app tiene oportunidad de ejecutar tareas en segundo plano, se activará el evento `application(_:performFetchWithCompletionHandler)`.
```swift
func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    Logger.shared.debug("\(Date().toString()) perfom bg fetch")
    completionHandler(.newData)
}
```

**Siempre llama al callback `completionHandler`. Si no lo haces, el sistema no sabrá que la tarea terminó, lo que limitará la frecuencia con la que la app se despierta en el futuro.**

Para simular un background fetch, ve a la barra de pestañas > Debug > Simulate Background Fetch. Ten en cuenta que esto solo funciona en dispositivos reales.

![](/Post-Resources/RefreshInBg/simulate_bg_fetch.png "Simulate background fetch")

<iframe width="100%" height="415" src="https://www.youtube.com/embed/oOysGc_f0pA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## iOS 13+, Procesamiento en segundo plano avanzado — WWDC 2019 y WWDC 2020
[En WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/707/), Apple introdujo un nuevo framework para programar trabajo en segundo plano: `BackgroundTasks`. Este framework ofrece mejor soporte para tareas que necesitan ejecutarse en segundo plano. Admite dos tipos de tareas: `BGAppRefreshTaskRequest` y `BGProcessingTaskRequest`. Con este framework, Apple marcó como obsoleta la API de background fetch anterior desde iOS 13 y eliminó su soporte en macOS.

Primero, registra los identificadores de tus tareas en segundo plano en `info.plist`.
```bash
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
    <string>YOUR_REFRESH_TASK_ID</string>
    <string>YOUR_PROCESSING_TASK_ID</string>
</array>
```

Omitir este paso causará un crash en tiempo de ejecución:
```swift
2020-10-11 08:24:40.648838+0700 TestBgTask[275:5188] *** Terminating app due to uncaught exception 'NSInternalInconsistencyException', reason: 'No launch handler registered for task with identifier com.example.bgRefresh'
```

Usa `BGAppRefreshTaskRequest` para tareas en segundo plano cortas — por ejemplo, obtener el feed de redes sociales, nuevos correos o los últimos precios de acciones. El sistema concede hasta **30 segundos** de ejecución por lanzamiento.

Un `BGProcessingTaskRequest` otorga varios minutos de tiempo de ejecución para trabajo más pesado, como entrenamiento de Core ML en el dispositivo.

Para registrar las tareas en segundo plano, agrega lo siguiente dentro de `application(_:didFinishLaunchingWithOptions)`.

```swift
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        if #available(iOS 13, *) {
            BGTaskScheduler.shared.register(forTaskWithIdentifier: appRefreshTaskId, using: nil) { task in
                Logger.shared.info("[BGTASK] Perform bg fetch \(appRefreshTaskId)")
                task.setTaskCompleted(success: true)
                self.scheduleAppRefresh()
            }

            BGTaskScheduler.shared.register(forTaskWithIdentifier: appProcessingTaskId, using: nil) { task in
                Logger.shared.info("[BGTASK] Perform bg processing \(appProcessingTaskId)")
                task.setTaskCompleted(success: true)
                self.scheduleBackgroundProcessing()
            }
        }
    }

    @available(iOS 13.0, *)
    func scheduleAppRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: "YOUR_REFRESH_TASK_ID")

        request.earliestBeginDate = Date(timeIntervalSinceNow: 5 * 60) // Refresh after 5 minutes.

        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            print("Could not schedule app refresh task \(error.localizedDescription)")
        }
    }

     @available(iOS 13.0, *)
    func scheduleBackgroundProcessing() {
        let request = BGProcessingTaskRequest(identifier: appProcessingTaskId)
        request.requiresNetworkConnectivity = true // Need to true if your task need to network process. Defaults to false.
        request.requiresExternalPower = true // Need to true if your task requires a device connected to power source. Defaults to false.

        request.earliestBeginDate = Date(timeIntervalSinceNow: 5 * 60) // Process after 5 minutes.

        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            print("Could not schedule image fetch: (error)")
        }
    }
}
```

Cuando la app entra en segundo plano, programa ambas tareas para que el sistema sepa que debe ejecutarlas más adelante.

```swift
func applicationDidEnterBackground(_ application: UIApplication) {
    Logger.shared.info("App did enter background")
    if #available(iOS 13, *) {
        self.scheduleAppRefresh()
        self.scheduleBackgroundProcessing()
    }
}
```

**Siempre llama a `task.setTaskCompleted(success: true)` lo antes posible.**
Ten en cuenta que después de llamarlo, debes volver a llamar a `self.scheduleAppRefresh()` y `self.scheduleBackgroundProcessing()` para reprogramar las tareas en el siguiente ciclo.

### Simular background task y background processing
Apple ofrece una forma de activar la ejecución en segundo plano durante el desarrollo.
Después de enviar la tarea al sistema, pausa la app en cualquier breakpoint. Luego ingresa el siguiente comando en la consola de Xcode.
```bash
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"YOUR_REFRESH_TASK_ID || YOUR_PROCESSING_TASK_ID"]
```
La salida debería verse así:
```swift
2020-10-11 08:53:58.628667+0700 TestBgTask[381:17115] 💚-2020-10-11 08:53:58.628 +0700 Start schedule app refresh
(lldb) e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"com.example.bgRefresh"]
2020-10-11 08:54:01.927263+0700 TestBgTask[381:16973] Simulating launch for task with identifier com.example.bgRefresh
2020-10-11 08:54:03.669153+0700 TestBgTask[381:17095] Starting simulated task: <decode: missing data>
2020-10-11 08:54:07.560697+0700 TestBgTask[381:17095] Marking simulated task complete: <BGAppRefreshTask: com.example.bgRefresh>
2020-10-11 08:54:07.560750+0700 TestBgTask[381:17012] 💙-2020-10-11 08:54:06.045 +0700 [BGTASK] Perform bg fetch com.example.bgRefresh
2020-10-11 08:54:07.563846+0700 TestBgTask[381:17012] 💚-2020-10-11 08:54:07.562 +0700 Start schedule app refresh
```

<iframe width="100%" height="415" src="https://www.youtube.com/embed/e6KFwzZKmns" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


## Expectativa vs Realidad
Podrías esperar que la ejecución en segundo plano se distribuyera uniformemente a lo largo del día.
![](/Post-Resources/RefreshInBg/Expectation.png "Expectation")

Sin embargo, esto es lo que observamos en la práctica. Gracias a los 7 factores mencionados, el motor predictivo aprende los patrones del usuario — por ejemplo, que suele abrir la app por la mañana, al mediodía y por la noche. Por eso el sistema programa las tareas en segundo plano para ejecutarse justo antes de que el usuario lleve la app al primer plano. Otros factores que influyen son si el usuario activó el Modo de bajo consumo o si el teléfono alcanzó un nivel de batería críticamente bajo.
![](/Post-Resources/RefreshInBg/Reality.png "Reality")

## Mejores prácticas
- Las tareas en segundo plano no se ejecutarán hasta el primer desbloqueo del dispositivo tras un reinicio.
- Puedes comprobar si el usuario tiene activado el Modo de bajo consumo:
```swift
ProcessInfo.processInfo.isLowPowerModeEnabled
NSProcessInfoPowerStateDidChange
```
- También puedes comprobar el estado del Background App Refresh:
```swift
UIApplication.shared.backgroundRefreshStatus
UIApplication.backgroundStatusDidChangeNotification
```
- Minimiza el uso de datos: usa miniaturas en lugar de imágenes completas y descarga solo lo estrictamente necesario.
- Minimiza el consumo de energía: evita el uso innecesario de hardware como GPS o el acelerómetro. Completa la tarea lo antes posible.
- Usa `BackgroundURLSession` para delegar el trabajo de red del sistema operativo.

## Resumen
En este artículo exploramos los factores que influyen en la ejecución en segundo plano y las diferencias clave entre `BGAppRefreshTaskRequest` y `BGProcessingTaskRequest`. También recorrimos un proyecto demo para ver cómo funciona en la práctica.

Ahora puedes elegir el tipo de solicitud adecuado para tu tarea y responder de forma adecuada a la intención del usuario.
Existe otra técnica para despertar una app — las notificaciones silenciosas. La veremos en el próximo tutorial.

¡Buen fin de semana!

## Referencias
1. [Background execution demystified WWDC 2020](https://developer.apple.com/videos/play/wwdc2020/10063)
2. [Advances in App Background Execution WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/707/)
