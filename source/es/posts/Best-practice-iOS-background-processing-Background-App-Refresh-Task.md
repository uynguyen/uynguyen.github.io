---
title: 'Mejores prácticas: procesamiento en segundo plano en iOS - Background App Refresh Task'
date: 2020-09-26 21:53:32
tags:
layout: post
permalink: es/posts/Best-practice-iOS-background-processing-Background-App-Refresh-Task/
lang: es
---

![](/Post-Resources/RefreshInBg/RefreshAppBg.png "Cover")

A diferencia de Android, iOS tiene restricciones para el uso del procesamiento en segundo plano en un intento de mejorar la duración de la batería y la experiencia del usuario. Cuando tus aplicaciones entran en modo de segundo plano, es el momento en que los desarrolladores pierden el control de su aplicación. Cómo y cuándo tu aplicación tiene la oportunidad de ejecutar tu tarea depende totalmente del sistema. En el corazón de iOS, Apple usa su propio algoritmo internamente complejo para determinar qué aplicaciones pueden ejecutarse en segundo plano, basándose en varios factores como el patrón de actividad del usuario, el estado actual de la batería, etc.
En este tutorial, aprenderemos cómo solicitar tiempo de ejecución periódica en iOS. Después de entender cómo funciona, aplicaremos esta técnica a una aplicación basada en BLE en algunos casos específicos en el próximo tutorial.
¡Comencemos!

<!-- more -->

## Conocimiento fundamental
Antes de sumergirnos profundamente en la práctica, es bueno entender cómo iOS gestiona los estados de la aplicación. Es la primera vez que Apple anuncia oficialmente un video que describe los principales factores que contribuyen a los tiempos de lanzamiento de la aplicación en WWDC ([WWDC 2020 - Background execution demystified](https://developer.apple.com/videos/play/wwdc2020/10063/?fbclid=IwAR1_oejf0JY9B8yV4d9riMAH4MQsLasO86iVjhwqmAruw2v64_utbuGZIEc)). Para resumir, Apple diseña iOS de una manera que permite a las aplicaciones mantener su contenido actualizado por un lado. Por otro lado, iOS debe adaptarse a sus objetivos principales:
- **Duración de la batería**: permitir la ejecución en segundo plano mientras se mantiene la batería durante todo el día.
- **Rendimiento**: asegurar que la ejecución en segundo plano no tenga ningún efecto negativo en el uso activo.
- **Privacidad**: Los usuarios deben estar al tanto de las tareas en segundo plano basándose en sus patrones de uso particulares.
- **Respetar la intención del usuario**: si un usuario realiza cierta acción, asegurarse de que el sistema responda correctamente.

Con estos objetivos en mente, aquí están los 7 principales factores que juegan un papel en la programación del sistema de la ejecución en segundo plano.

- **Batería críticamente baja**: Cuando el teléfono está a punto de quedarse sin batería (< 20%), la ejecución en segundo plano será pausada por el sistema para evitar el uso de batería.
- **Modo de bajo consumo**: Cuando los usuarios cambian el teléfono a modo de bajo consumo, el usuario indica explícitamente que el sistema debe preservar la batería solo para tareas críticas.
- **Configuración de Background App Refresh**: El usuario puede alternar la configuración para permitir o no que una aplicación específica ejecute tareas en segundo plano.
![](/Post-Resources/RefreshInBg/app_refresh_setting.png "App refresh setting")
- **Uso de la aplicación**: Hay un límite de recursos en el teléfono, por lo que el sistema debe priorizar a qué aplicaciones debe asignar recursos. Típicamente, las aplicaciones que el usuario usa más. Apple también mencionó el "motor predictivo en el dispositivo" que aprende qué aplicaciones usa frecuentemente el usuario y cuándo. El motor predictivo en el dispositivo se basará en esta información para priorizar la ejecución en segundo plano.
- **App switcher**: Solo las aplicaciones visibles en el App Switcher tienen oportunidades de ejecutar tareas en segundo plano.
- **Presupuesto del sistema**: Para asegurar que las actividades en segundo plano no agoten la batería y los planes de datos, hay un límite de batería y datos de ejecución en segundo plano a lo largo del día.
- **Límite de tasa**: El sistema realiza algún límite de tasa por lanzamiento.

y algunos otros factores: Modo avión, temperatura del dispositivo, pantalla, estado de bloqueo del dispositivo, etc.

![](/Post-Resources/RefreshInBg/factors.png "Factors")

## Capacidades
Asegúrate de que tu aplicación haya agregado las siguientes capacidades

![](/Post-Resources/RefreshInBg/BG-Capabilities.png "Capability")

## Antes de iOS 13
Es bastante simple configurar un background fetch antes de iOS 13.
Dentro del método `application(_:didFinishLaunchingWithOptions)`, debemos agregar el siguiente comando.
```swift
UIApplication.shared.setMinimumBackgroundFetchInterval(UIApplication.backgroundFetchIntervalMinimum)
```
El `setMinimumBackgroundFetchInterval` especifica la cantidad mínima de tiempo que debe transcurrir entre las ejecuciones de background fetch. Sin embargo, el momento exacto del evento depende del sistema. Generalmente, `UIApplicationBackgroundFetchIntervalMinimum` es un buen valor predeterminado para usar.

Una vez que tu aplicación tiene la oportunidad de realizar tareas en segundo plano, se activará el evento `application(_:,performFetchWithCompletionHandler)`.
```swift
func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    Logger.shared.debug("\(Date().toString()) perfom bg fetch")
    completionHandler(.newData)
}
```

**No olvides llamar al callback `completionHandler`. Si no llamas a este callback, el sistema no sabe que tu tarea ha sido completada, lo que lleva a limitar que tu aplicación se despierte en los próximos eventos**

Para simular background fetch, desde la barra de pestañas > Debug > Simulate background fetch. Ten en cuenta que solo funciona cuando se ejecuta en dispositivos reales.

![](/Post-Resources/RefreshInBg/simulate_bg_fetch.png "Simulate background fetch")

<iframe width="100%" height="415" src="https://www.youtube.com/embed/oOysGc_f0pA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## iOS 13+, Procesamiento en segundo plano avanzado - WWDC 2019 y Background execution demystified - WWDC 2020
[En WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/707/), Apple introdujo un nuevo framework para programar trabajo en segundo plano: `BackgroundTasks`. Este nuevo framework ofrece mejor soporte para tareas que necesitan hacerse en segundo plano. Hay dos tipos de tareas soportadas por el framework `BackgroundTasks`: `BGAppRefreshTaskRequest` y `BGProcessingTaskRequest`. Con la presencia del nuevo framework, Apple marcó como obsoleto el antiguo desde iOS 13, y ya no lo soporta en MacOS.
Primero, debemos registrar los identificadores de las tareas en segundo plano ejecutadas en nuestra aplicación. Abre el archivo `info.plist`, y agrega la siguiente información.
```bash
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
    <string>YOUR_REFRESH_TASK_ID</string>
    <string>YOUR_PROCESSING_TASK_ID</string>
</array>
```

Olvidar el paso anterior lleva a un crash en tiempo de ejecución.
```swift
2020-10-11 08:24:40.648838+0700 TestBgTask[275:5188] *** Terminating app due to uncaught exception 'NSInternalInconsistencyException', reason: 'No launch handler registered for task with identifier com.example.bgRefresh'
```

`BGAppRefreshTaskRequest` se usa cuando necesitas ejecutar una tarea en segundo plano en poco tiempo.
Tareas de actualización como obtener el feed de redes sociales, nuevos correos electrónicos, últimos precios de acciones, etc. son apropiadas para programar con `BGAppRefreshTaskRequest`. 30s es el tiempo que el sistema permite que tu tarea se ejecute por lanzamiento.

Varios minutos de tiempo de ejecución para terminar tu trabajo cuando registras un `BGProcessingTaskRequest`. Tareas como entrenamiento de Core ML en el dispositivo deben registrarse con un `BGProcessingTaskRequest`.

Para registrar tareas en segundo plano, dentro del método `application(_:didFinishLaunchingWithOptions)`, debemos agregar el siguiente comando.

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

Una cosa más que necesita hacerse. Cuando la aplicación entra en segundo plano, comenzaremos a programar las tareas en segundo plano.

```swift
func applicationDidEnterBackground(_ application: UIApplication) {
    Logger.shared.info("App did enter background")
    if #available(iOS 13, *) {
        self.scheduleAppRefresh()
        self.scheduleBackgroundProcessing()
    }
}
```

**Como siempre, es importante llamar a `task.setTaskCompleted(success: true)` lo más rápido posible**.
Podrías notar que después de llamar a `task.setTaskCompleted(success: true)`, necesitamos llamar a `self.scheduleAppRefresh()` y `self.scheduleBackgroundProcessing()` nuevamente para reprogramar estas tareas en el sistema.

### Simular background task y background processing
Afortunadamente, Apple soporta una forma de activar la ejecución en segundo plano.
Después de enviar tu tarea al sistema, pausa la aplicación con cualquier breakpoint. Luego, ingresa el siguiente comando en la consola de Xcode.
```bash
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"YOUR_REFRESH_TASK_ID || YOUR_PROCESSING_TASK_ID"]
```
La salida debería ser
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

Sin embargo, esto es lo que observamos en la realidad. Debido a los 7 factores que introduje al principio de este tutorial, el "motor predictivo en el dispositivo" aprende el patrón de uso del usuario y entiende que el usuario típicamente abre la aplicación en la mañana, a la hora del almuerzo y en la noche. Por eso el sistema permitirá que tus tareas en segundo plano se lancen justo antes de que el usuario ponga la aplicación en primer plano. Otros factores que afectan el resultado son si el usuario activó el "Modo de bajo consumo", o si el teléfono cayó en estado de batería críticamente baja.
![](/Post-Resources/RefreshInBg/Reality.png "Reality")

## Mejores consejos
- Las tareas en segundo plano no se ejecutarán hasta el primer desbloqueo del dispositivo después del reinicio.
- Podemos verificar si el usuario está en modo de bajo consumo:
```swift
ProcessInfo.processInfo.isLowPowerModeEnabled
NSProcessInfoPowerStateDidChange
```
- También podemos verificar el estado de la "configuración de background refresh".
```swift
UIApplication.shared.backgroundRefreshStatus
UIApplication.backgroundStatusDidChangeNotification
```
- Minimizar el uso de datos: Usar miniaturas en lugar de imágenes completas, y solo descargar lo que realmente es necesario.
- Minimizar el consumo de energía: evitar el uso innecesario de hardware como GPS, acelerómetro, etc. También, asegúrate de completar la tarea lo antes posible.
- Usar `BackgroundURLSession` para descargar el trabajo de la aplicación al sistema.

## Resumen
En esta publicación, profundizamos en qué factores contribuyen a tus ejecuciones en segundo plano, y entendemos las diferencias clave entre `BGAppRefreshTaskRequest` y `BGProcessingTaskRequest`. También tomamos un proyecto demo para ver cómo funciona realmente en la práctica.
La próxima vez, puedes elegir qué tipo de solicitud es más apropiada para tus tareas, y cómo puedes responder graciosamente a la intención de tu usuario.
Esperamos que la información que trae esta publicación te ayude a construir mejores aplicaciones: frescura y optimización.
Hay otra técnica para despertar tu aplicación, la notificación silenciosa. Hablaremos de ello en el próximo tutorial.
¡Feliz fin de semana!

## Referencias
1. [Background execution demystified WWDC 2020](https://developer.apple.com/videos/play/wwdc2020/10063)
2. [Advances in App Background Execution WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/707/)
