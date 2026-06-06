---
title: 'Integración de Bluetooth con App Clips: Una Guía Práctica'
date: 2023-03-25 10:14:11
tags: [Bluetooth, Appclip, iOS]
layout: post
lang: es
thumbnail: /Post-Resources/Appclip/banner.png
---
Hoy en día, los usuarios demandan acceso rápido y fácil a los servicios que necesitan, sin descargar la versión completa de una aplicación. App Clips - una característica introducida por Apple en iOS 14 - ofrece una solución a esta demanda al permitir a los usuarios acceder a una pequeña parte de una aplicación. Al integrar tu aplicación habilitada para Bluetooth con App Clip, puedes llevar la experiencia del usuario al siguiente nivel. Esto abre nuevas posibilidades, como permitir a los usuarios conectarse a dispositivos cercanos, realizar una función específica y más. En este tutorial, te guiaré a través de la integración de Bluetooth en tu App Clip. Ya seas un desarrollador experimentado o un principiante, encontrarás todo lo que necesitas para comenzar. ¡Así que, vamos a sumergirnos!
<!-- more -->

## App Clips
["Un App Clip es una pequeña parte de tu aplicación que es descubrible en el momento que se necesita y permite a las personas completar una tarea rápida de tu aplicación — incluso antes de instalar tu aplicación completa."](https://developer.apple.com/app-clips/). Los App Clips están diseñados para ser ligeros y rápidos, proporcionando acceso rápido a las características y servicios principales de tu aplicación.
Hay muchos beneficios de usar App Clips. Primero, ofrece una parte ligera de tu aplicación para que los usuarios prueben una característica de la aplicación sin comprometerse a una descarga completa. Segundo, los App Clips pueden ser lanzados a través de varios canales como etiquetas NFC, códigos QR, enlaces desde Safari o Messages.
Aquí hay algunos casos de uso y aplicaciones de ejemplo que usan App Clips:
- Tickets: App Clip puede usarse para comprar y acceder rápidamente a tickets para eventos como conciertos, películas o eventos deportivos.
- Solicitud de viajes: App Clip puede usarse para hacer fácilmente una solicitud de servicio de viaje. Ej. Lyft.
- Retail: Los App Clips pueden usarse para acceder rápidamente a información del producto, hacer una compra o canjear un cupón en una tienda minorista
- Pedidos de comida: los usuarios pueden acceder rápidamente al menú del restaurante y hacer un pedido. Ej: Panera Bread.
- Estacionamiento: Los usuarios pueden simplemente escanear un código QR o tocar una etiqueta NFC para lanzar el App Clip y pagar por su lugar de estacionamiento.

**Por favor ten en cuenta que se requiere una cuenta de pago de Apple para desarrollar un App Clip.**
![](/Post-Resources/Appclip/bread.png "")
![](/Post-Resources/Appclip/parking.jpg "")

## Configuración
### Abrir un hosting
Antes de lanzar el App Clip, el sistema asegura que el App Clip incluya su firma de código en tu sitio web. Si tienes tu propio sitio web puedes agregar las siguientes líneas a tu Apple App Site Association (AASA) en tu servidor e ir al siguiente paso.
```
{
    "appclips": {
        "apps": [
            "[YOUR_TEAM_ID].[YOUR_APP_CLIP_BUNDLE_ID]"
        ]
    }
}
```
[Firebase Hosting](https://firebase.google.com/docs/hosting) puede ser una gran opción para aquellos que no tienen su propio servidor. Con Firebase Hosting, puedes configurar fácilmente tu sitio sin ningún costo ya que proporciona un nivel gratuito para hosting.
1. Instala la herramienta de línea de comandos de Firebase mediante el siguiente comando `sudo npm install -g firebase-tools`
2. Luego, inicia sesión en tu cuenta de Firebase `firebase login`
![](/Post-Resources/Appclip/firebase_login_success.png "")
3. Después de iniciar sesión exitosamente, navega al directorio que contiene el archivo que quieres subir, y luego ejecuta `firebase init` para seleccionar la opción `hosting`.
4. Agrega las siguientes líneas al archivo `firebase.json`.
```
    ...
    "headers": [
      {
        "source": "/.well-known/apple-app-site-association",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ]
      }
    ],
    "appAssociation": "NONE",
    ...
```
5. A continuación, crea el archivo `public/.well-known/apple-app-site-association`.
```
{
    "appclips": {
        "apps": [
            "[YOUR_TEAM_ID].[YOUR_APP_CLIP_BUNDLE_ID]"
        ]
    }
}
```

6. Finalmente, sube los archivos a firebase `firebase deploy`
![](/Post-Resources/Appclip/firebase_deploy_completed.png "")

Una vez que el despliegue sea exitoso, se te proporcionará la URL de tu sitio web. Esta URL se usará para configurar el lanzamiento de tu App Clip.

### Agregar target de App Clip
Primero, abre tu proyecto de Xcode y navega al menú File. Desde ahí, selecciona New y luego Target. Esto abrirá un cuadro de diálogo que te permite elegir el tipo de target que quieres crear.

A continuación, selecciona la opción para `App Clip` y haz clic en `Next`. Esto te llevará a una pantalla donde puedes configurar varios ajustes para tu App Clip, como su nombre, identificador y target de despliegue.

Una vez que hayas configurado estos ajustes, haz clic en `Finish` para crear el nuevo target de App Clip. Esto agregará los archivos y recursos necesarios a tu proyecto y te permitirá comenzar a desarrollar tu App Clip.

![](/Post-Resources/Appclip/add_target.png "")

Para configurar tu App Clip para que se lance correctamente, necesitarás seguir unos simples pasos.
Primero, selecciona tu target de App Clip desde Xcode, luego navega a `Signing & Capabilities` y selecciona `Associated Domains`. Desde ahí, puedes agregar tu URL de hosting a la lista de dominios con los que tu App Clip está asociado.

Por ejemplo, digamos que tu URL de hosting es `awesomeapp-54431.web.app`. En este caso, agregarías `appclips:awesomeapp-54431.web.app` a la lista de dominios.

Una vez que hayas completado estos pasos, todo debería estar configurado correctamente y puedes comenzar a implementar las funciones de tu App Clip. Esto puede involucrar escribir código para interactuar con varias APIs, diseñar interfaces de usuario y más. Los detalles exactos dependerán de los requisitos específicos de tu App Clip y las características que quieras incluir.

## Implementación
Desarrollaré una aplicación muy simple que permite escanear dispositivos Bluetooth cercanos y mostrarlos en una lista al lanzar el App Clip para demostrar cómo utilizar Bluetooth en App Clip. Puedes modificar la aplicación para que se ajuste a tus necesidades, como identificar automáticamente un dispositivo pre-seleccionado por dirección y conectarse automáticamente al dispositivo para ejecutar una tarea específica.

```swift
struct ContentView: View {
    // El resto está omitido
    ...
    var body: some View {
        NavigationView {
            VStack {
                Image("logo").resizable()
                    .scaledToFit()
                    .frame(width: 120).padding(.top, 10)
                TitleLargeText("Awesome App").padding(.bottom, 5).padding(.top, 10).padding(.bottom, 10)
                Spacer()
                LabelLargeText("Nearby Devices").frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 20)
                List(devices.map { $0.name ?? "Unknown name" }, id: \.self) { deviceName in
                    LabelMediumText(deviceName)
                }
                VStack {
                    HStack {
                        LabelMediumText("Powered By")
                        Link(destination: URL(string: "https://uynguyen.github.io")!, label: {
                            LabelMediumText("Uy Nguyen", underline: true)
                        })
                    }.padding(.top, 5)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            .background(Color.black).onContinueUserActivity(NSUserActivityTypeBrowsingWeb, perform: handleUserActivity)
            .navigationBarTitle("")
            .navigationBarHidden(true)
        }
    }

    func handleUserActivity(_ userActivity: NSUserActivity) {
        // Puedes extraer parámetros de la url, validar si la url es válida, etc.
        guard
            let incomingURL = userActivity.webpageURL,
            let components = URLComponents(url: incomingURL, resolvingAgainstBaseURL: true),
            let queryItems = components.queryItems
        else {
            return
        }

        // Todo está bien, comencemos a escanear
        BluetoothManager.shared.config { device, rssi in
            if !(devices.contains(where: { $0.identifier.uuidString == device.identifier.uuidString })) {
                devices.append(device)
            }
        }
    }
    ...
}
```

## Pruebas

### Código QR y NFC
Apple soporta probar tu App Clip sin tener que publicarlo mediante el registro de una `Local Experience`.
Para registrar una experiencia local, ve a la configuración del teléfono `Settings` y selecciona `Developer`. Desde ahí, puedes acceder al menú `Local Experiences` y hacer clic en `Register Local Experience`.
Una vez que hayas ingresado tu prefijo de URL y Bundle ID, podrás comenzar a completar la información para tu App Clip Card. Esta es la sección que se mostrará a los usuarios cuando hagan clic en la URL o escaneen el código QR asociado con tu App Clip.
En la sección de App Clip Card, podrás proporcionar a los usuarios información importante sobre tu App Clip, incluyendo su nombre, banner y descripción. Esta información debe ser clara y concisa para que los usuarios puedan entender rápidamente qué hace tu App Clip y cómo puede serles útil.
Además de esto, también necesitarás seleccionar el tipo de botón que quieres usar para tu App Clip. Hay tres tipos diferentes de botones disponibles: `Open`, `View` y `Play`.
El botón `Open` se usa para lanzar el App Clip y llevar a los usuarios directamente a su interfaz principal.
El botón `View` se usa para mostrar contenido específico dentro del App Clip, como una página o característica particular.
Finalmente, el botón `Play` se usa para lanzar un reproductor multimedia dentro del App Clip, permitiendo a los usuarios escuchar música o ver videos.
Siguiendo estos simples pasos y proporcionando a los usuarios un App Clip Card claro y atractivo, puedes ayudar a asegurar que tu App Clip sea exitoso y bien recibido por tu audiencia objetivo.

![](/Post-Resources/Appclip/local.png)

En el video a continuación, puedes ver una demostración de cómo escanear el código QR asociado con mi sitio web, lanza automáticamente el App Clip e inicia el proceso de escaneo Bluetooth para dispositivos cercanos. Este es un ejemplo simple de cómo los App Clips pueden ofrecer una experiencia de usuario conveniente que elimina la necesidad de que los usuarios naveguen a través de múltiples pantallas o descarguen la aplicación completa.

<div style="padding:75% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/823369045?h=325d507eb1&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;" title="testing_local"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

Notas:
- Si encuentras que ya no necesitas un App Clip que hayas instalado previamente en tu dispositivo iOS, puedes eliminarlo fácilmente siguiendo unos simples pasos. Simplemente ve a Settings y selecciona la opción App Clips. Desde ahí, puedes seleccionar el App Clip que quieres eliminar y hacer clic en la opción para borrarlo.
- Si estás experimentando problemas con tu App Clip y no se lanza a pesar de estar configurado correctamente, lo primero que deberías intentar es invalidar el caché y re-registrar tus experiencias locales. Esto puede hacerse yendo a `Settings` y seleccionando la opción `Developer`. Desde ahí, puedes acceder al menú `Local Experiences` y hacer clic en la opción `Invalidate Cache`. Una vez que hayas hecho esto, puedes re-registrar tus experiencias locales e intentar lanzar tu App Clip de nuevo.

### Safari y iMessage
Además de lanzar App Clips mediante códigos QR, Apple también ofrece soporte para lanzar tu App Clip cuando un usuario comparte un enlace a tu sitio web a través de la aplicación Messages, o ve la URL en Safari directamente. El destinatario puede tocar el enlace para lanzar instantáneamente tu App Clip y acceder a la funcionalidad de tu App Clip rápida y fácilmente.

Es importante notar que el Smart App Banner de Safari y compartir vía Messages solo están disponibles cuando el App Clip está publicado en el App Store.
+ Banner de App Clip en Safari: requiere que el dispositivo del usuario tenga iOS 15+.
+ Banner de App Clip en iMessage: requiere que el dispositivo del usuario tenga iOS 14+, y que contenga al remitente como contacto en la aplicación Contacts.

Para habilitar mostrar la tarjeta de App Clip en Safari e iMessage, configura las siguientes líneas en tu sitio web.
```
<meta name="apple-itunes-app" content="app-id=YOUR_APP_ID, app-clip-bundle-id=YOUR_APP_CLIP_ID, app-clip-display=card" />
<meta property="og:image" content="BANNER_URL" />
<meta property="og:title" content="Awesome App" />
<meta property="og:description" content="Awesome App description" />
```

![](/Post-Resources/Appclip/appclip_imessage.jpg "")

## Mejores prácticas
- Mantenlo simple: El propósito de un App Clip es proporcionar una versión simplificada de la funcionalidad de tu aplicación. Enfócate en proporcionar solo las características clave que los usuarios más probablemente necesiten en el contexto donde están usando el App Clip.
- Optimiza para velocidad: Los App Clips deben ser ligeros y de carga rápida (**Apple requiere que el tamaño del App Clip sea menor de 15MB, esto es para asegurar que los App Clips puedan ser descargados y lanzados rápidamente, incluso en conexiones de red más lentas.**) para asegurar que los usuarios puedan acceder rápidamente a la funcionalidad que necesitan. Minimiza la cantidad de contenido y assets que se cargan para asegurar que el App Clip cargue rápidamente y no consuma demasiados datos.
- Es importante mantener el número de parámetros al mínimo y asegurarse de que sean fáciles de entender. Cuanto más complejos sean los parámetros, más difícil será para los usuarios saber cómo usarlos.
- Limita la longitud de los parámetros: Es mejor limitar la longitud de los parámetros a no más de 50 caracteres. Esto ayudará a asegurar que los usuarios puedan leer y entender fácilmente los parámetros.
- Valida los parámetros: Asegúrate de que tu App Clip valide todos los parámetros que se le pasan. Esto ayudará a asegurar que tu App Clip funcione correctamente y que los usuarios no puedan explotar ninguna vulnerabilidad.
- Además de escanear códigos QR, mostrar en Safari y compartir vía iMessage, Apple ofrece varios otros métodos para lanzar App Clips, como tocar un enlace en la aplicación Maps, sugerencias basadas en ubicación de Siri Suggestions y etiquetas NFC. Para asegurar que los usuarios puedan descubrir fácilmente tu App Clip, es importante aprovechar el método de lanzamiento apropiado y optimizar para descubribilidad. Al hacerlo, puedes aumentar las posibilidades de que los usuarios encuentren e interactúen con tu App Clip.

## Siguiente paso
En el próximo tutorial, te proporcionaré instrucciones detalladas sobre cómo publicar tu App Clip y configurarlo para que se ejecute en Safari, Maps e iMessage. Sin embargo, ten en cuenta que los App Clips solo pueden ser lanzados cuando están publicados en el App Store. Por lo tanto, no puedo demostrar el proceso hasta que mi App Clip pase el proceso de revisión de Apple. :P

## Conclusión
En conclusión, los App Clips ofrecen una gran oportunidad para mejorar la experiencia del usuario y simplificar el proceso de interacción con la aplicación. Con App Clips, los usuarios pueden acceder rápidamente a una función específica sin necesidad de descargar la aplicación completa. Esto puede ser particularmente útil para usuarios que quieren probar tu aplicación o tienen planes de datos o almacenamiento limitados. Ya seas propietario de un restaurante, gerente de tienda minorista o cualquier otro tipo de negocio, puedes aprovechar App Clip para crear una mejor experiencia general para tus usuarios.
Entonces, ¿qué estás esperando? Dale una oportunidad a los App Clips y ve la diferencia que pueden hacer para tu aplicación y tu negocio.

## Referencias
- https://developer.apple.com/app-clips/

