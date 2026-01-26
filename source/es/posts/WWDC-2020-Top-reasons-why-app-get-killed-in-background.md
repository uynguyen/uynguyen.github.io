---
title: 'WWDC 2020 - Principales razones por las que una aplicacion es terminada en segundo plano'
date: 2021-02-25 19:03:28
tags:
layout: post
permalink: es/posts/WWDC-2020-Top-reasons-why-app-get-killed-in-background/
lang: es
---
![](/Post-Resources/AppGetKilled/AppGetKilled.png "AppGetKilled")

Alguna vez te has preguntado por que tu aplicacion es terminada por el sistema cuando entra en segundo plano? Este articulo va a resumir las principales razones introducidas por Apple en WWDC 2020, y lo que puedes hacer para evitar que tu aplicacion sea terminada en segundo plano. Al aplicar estos consejos, podemos mejorar la experiencia de nuestra aplicacion porque no tendra que reiniciarse desde cero.
Comencemos!

<!-- more -->

## Principales razones
A continuacion se describen las 6 principales razones por las que tu aplicacion es terminada mientras esta en segundo plano:

- Crashes: Fallo de segmentacion, instrucciones ilegales, asserts y excepciones no capturadas.

- Watchdog:
Un bloqueo prolongado durante las transiciones de la aplicacion como deadlock, bucle infinito o tareas sincronas interminables en el hilo principal. En aproximadamente 20 segundos, tu aplicacion debe transicionar de un estado a otro. De lo contrario, sera terminada.
```swift
    + application(_:didFinishLaunchingWithOptions)
    + applicationDidEnterBackground(_:)
    + applicationWillEnterForeground(_:)
```

- Uso excesivo de CPU:
Alta carga de CPU sostenida en segundo plano. Si tu aplicacion realmente necesita hacer trabajos pesados en segundo plano, deberias considerar mover la tarea a una tarea de procesamiento en segundo plano que le da a tu aplicacion **varios minutos de ejecucion** mientras se carga sin limites de recursos de CPU.

- Limite de memoria excedido:
Tu aplicacion esta usando demasiada memoria (igual en segundo plano y primer plano). Recuerda que la limitacion difiere de dispositivo a dispositivo. Antes del iPhone6s, 200M es la limitacion de memoria (Cuanto mas antiguo, mas pequeno).

- Salida por presion de memoria (tambien conocido como Jetsam):
Ocurre cuando el sistema necesita liberar memoria de aplicaciones en segundo plano para las aplicaciones en primer plano (y otras aplicaciones en ejecucion como musica o aplicacion de navegacion). Para prevenir esto, intenta reducir la memoria lo mas pequena posible, menos de **50M** (por ejemplo, limpiar vistas de imagenes). Sin embargo, no podemos eliminar el riesgo de jetsam por completo. El mejor consejo para superarlo es aprovechar la `State Restoration` de UI incorporada para restaurar el estado de la aplicacion justo antes de que fuera terminada en segundo plano.

    El siguiente video describe como ocurre Jetsam en dispositivos iOS. Digamos que abrimos la aplicacion de Amazon para comprar, luego seleccionamos un articulo favorito para ver su detalle. Digamos que tenemos que dejar la aplicacion en segundo plano por un momento, luego comenzamos a abrir otras aplicaciones (Google Maps, Musica, Fotos, Spotify, etc.). En algun momento, abrimos la aplicacion de Amazon de nuevo. Como notamos, la aplicacion se inicia desde cero. Esto es porque la aplicacion fue terminada por el sistema.
    Obviamente, la aplicacion de Amazon no hizo nada mal, es solo porque el sistema necesita liberar memoria para otras aplicaciones que estan ejecutandose en primer plano.

<center>
<iframe width="100%" height="500" src="https://www.youtube.com/embed/JVPvaeoNNsk" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</center>

- Tiempo de espera de tarea en segundo plano:
La ultima razon comun es usar tareas en segundo plano incorrectamente.
```swift
UIApplication.beginBackgroundTask(exprirationHandler:)
UIApplication.endBackgroundTask(_:)
```

    Cuando tu aplicacion pasa de primer plano a segundo plano, y quieres completar algunas tareas importantes, iOS te proporciona algo de tiempo de ejecucion extra (`solo unos segundos`) llamando al metodo `UIApplication.beginBackgroundTask`. Cuando la tarea esta terminada, recuerda llamar a `UIApplication.endBackgroundTask` para notificar al sistema que la tarea esta hecha. Si olvidas llamar a `endBackgroundTask` explicitamente, el tiempo de espera se activara 30 segundos despues de suspender la aplicacion, y ocurrira la terminacion. Por lo tanto, debes manejar cuidadosamente las tareas en segundo plano y no iniciar ningun trabajo costoso adicional cuando tu aplicacion entre en modo de segundo plano porque solo tenemos unos segundos de tiempo de ejecucion.

    Mientras depuras, XCode generara un mensaje de log para notificar si hay una tarea que se ha mantenido demasiado tiempo sin terminar. Cuando veas este mensaje, debes hacer una auditoria para ver que salio mal con las llamadas de tareas en segundo plano.

```bash

Background task still not ended after expiration handlers were called: <_UIBackgroundTaskInfo: 0x28190d140>: taskID = 8, taskName = Called by AppGetKilled,
from $s12AppGetKilled13SceneDelegateC23sceneDidEnterBackgroundyySo7UISceneCF, creationTime = 70784 (elapsed = 26).
This app will likely be terminated by the system. Call UIApplication.endBackgroundTask(_:) to avoid this.
Background Task 5 ("Called by AppGetKilled, from $s12AppGetKilled13SceneDelegateC23sceneDidEnterBackgroundyySo7UISceneCF"),
was created over 30 seconds ago.
In applications running in the background, this creates a risk of termination.
Remember to call UIApplication.endBackgroundTask(_:) for your task in a timely manner to avoid this.

```

## Conclusion
En este articulo, resumi las 6 principales razones por las que una aplicacion puede ser terminada en segundo plano, como podemos hacer para prevenir los problemas, y como recuperar la aplicacion elegantemente de problemas impredecibles como Jetsam.
Puedes encontrar el documento completo y video en [WWDC 2020 - Why is my app getting killed](https://developer.apple.com/videos/play/wwdc2020/10078/)
