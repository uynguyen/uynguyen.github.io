---
title: Programación Asíncrona en Swift
date: 2018-01-16 21:32:45
tags: [Swift, iOS]
layout: post
lang: es
thumbnail: /Post-Resources/PromiseKIT/PromiseKIT.png
---
<center>Promise Kit, uno de los mejores frameworks para manejar programación asíncrona en Swift</center>

En esta publicación, usaré las siguientes librerías de terceros para completar el proyecto:
* [Alamofire](https://github.com/Alamofire/Alamofire): Un framework de redes HTTP en Swift.
* [SwiftyJSON](https://github.com/SwiftyJSON/SwiftyJSON): Para procesar datos JSON.
* [SwiftGifOrigin](https://github.com/bahlo/SwiftGif): Una extensión de UIImage para mostrar archivos Gif.
* [Bolts-Swift](https://github.com/BoltsFramework/Bolts-Swift): Fue diseñado por Parse y Facebook, lo uso para crear métodos asíncronos.
* [PromiseKit](https://github.com/mxcl/PromiseKit): Un framework que nos ayuda a simplificar la programación asíncrona.<br />
* [APIs de Giphy](https://giphy.com) para buscar y descargar imágenes gif.
<!-- more -->
## Comenzando

Los métodos asíncronos, (Async para abreviar), son métodos que no retornan resultados inmediatamente como la mayoría de los métodos, los métodos async toman algo de tiempo para producir resultados.
A menudo uso callbacks para manejar métodos asíncronos como escanear dispositivos Bluetooth o recuperar algunos recursos de internet. De hecho, callback es una técnica de programación mala. Callback hará que nuestro código sea difícil de leer, difícil de depurar y tome mucho más tiempo para mantener después. Al final, nuestro código se convertirá en algo que llamamos el infierno de callbacks.
En esta publicación, crearé un proyecto usando una técnica a la vez para explicar por qué dije que callback es malo.
Primero, ve y crea un proyecto, nómbralo como quieras, luego instala estos frameworks de Pod en tu proyecto. También necesitas editar la clave `NSAllowsArbitraryLoads` a `YES` en el diccionario `NSAppTransportSecurity` en el archivo info.plist para especificar qué dominios están exceptuados de las reglas que defines para App Transport Security. En nuestro caso, este es el dominio de giphy.

Permitir solicitudes HTTP solo para el dominio de giphy
```bash
<key>NSAppTransportSecurity</key>
    <dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>api.giphy.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

O permitir solicitudes HTTP para todos los dominios, no es una buena idea.
```bash
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

Creemos una clase llamada `ImageLoader`. Esta clase contiene dos métodos que nos ayudan a buscar y descargar imágenes gif del servidor de Giphy.
```swift
//
//  ImageLoader.swift
//

class ImageLoader {
    func fetchImage(keyword: String) {
        // Buscando imágenes que coincidan con la palabra clave en el servidor de Giphy
    }
    func downloadImage(url: URL) {
        // Descargar la imagen en la url
    }
}
```

## La primera versión: Usando callback

Primero, necesitamos definir dos callbacks, que se pasarán a los métodos `fetchImage` y `downloadImage`.

```swift
public typealias FetchImageBlock = (URL?, Error?) -> Void
public typealias DownloadImageBlock = (URL?, Error?) -> Void
```

Luego, implementamos estos dos métodos:
- `fetchImage` toma una palabra clave y un callback como parámetros, envía una solicitud al servidor de Giphy para consultar todas las imágenes que coinciden con la palabra clave, obtiene la primera y finalmente retorna la url de descarga a través del callback.
- `downloadImage` toma una url y un callback como parámetros, luego usa el framework `Alamofire` para descargar la imagen. Finalmente, retorna la url de destino, donde se guarda la imagen, a través del callback.

```swift
func fetchImage(keyword: String, callback: @escaping FetchImageBlock) {
    let endPoint = "http://api.giphy.com/v1/gifs/search?q=\(keyword)&limit=1&api_key=q4N1oD5jw3xvH2hIOkFAyHXWTTrh0D30"
    let headers: HTTPHeaders = [
        "Content-Type": "application/json"
    ]
    Alamofire.request(endPoint, headers: headers).responseData { (response) in
        if let error = response.error {
            return callback(nil, error)
        }
        let jsonData = JSON.init(data: response.data!)
        let dataArray = jsonData["data"].array
        if let dataArray = dataArray, dataArray.count > 0 {
            let imagesList = dataArray[0]["images"]
            let downsized_large = imagesList["downsized_large"]["url"].stringValue
            return callback(URL.init(string: downsized_large), nil)
        }
        else {
            return callback(nil, nil)
        }
    }
}
```

```swift
func downloadImage(url: URL, callback: @escaping DownloadImageBlock) {
    let destination: DownloadRequest.DownloadFileDestination = { _, _ in
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let fileURL = documentsURL.appendingPathComponent(url.lastPathComponent)
        return (fileURL, [.removePreviousFile, .createIntermediateDirectories])
    }
    Alamofire.download(url, to: destination).downloadProgress(closure: { (progress) in
        print("\(progress)")
    }).responseData(completionHandler: { (response) in
        if let error = response.error {
            return callback(nil, error)
        }
        callback(response.destinationURL, nil)
    })
}
```

Dentro del controlador de vista principal, definamos un método llamado `searchImageWithKeyword`. Este método toma una palabra clave como parámetro, luego pasa el parámetro al método `fetchImage` de una instancia de la clase `ImageLoader`. También necesitamos pasar un callback para manejar los resultados.
Dentro del callback de `fetchImage`, verifiquemos si hay algún error. Si lo hay, entonces dejamos de llamar al siguiente método, `downloadImage`. De lo contrario, llamamos al `downloadImage` del objeto `imageLoader`. Luego pasamos la url y un callback como parámetros.
Dentro del callback de `downloadImage`, verifiquemos si hay algún error. Si lo hay, entonces dejamos de llamar al siguiente. De lo contrario, actualizamos la vista de imagen en la vista principal llamando al método `updateImageAtURL`.

```swift
func searchImageWithKeyword(keyword: String) {
    let imageLoader = ImageLoader()
    imageLoader.fetchImage(keyword: keyword, callback: {downloadLink, error in
        if let error = error {
            print("Error \(error)")
        }
        else {
            if let downloadLink = downloadLink {
                imageLoader.downloadImage(url: downloadLink, callback: {downloadedURL, error in
                    if let error = error {
                        print("Error \(error)")
                    }
                    else {
                        if let downloadedURL = downloadedURL {
                            self.updateImageAtURL(url: downloadedURL)
                        }
                        else {
                            print("Error: downloadedURL is nil")
                        }
                    }
                })
            }
            else {
                print("Error: downloadLink is nil")
            }
        }
    })
}
```

```swift
func updateImageAtURL(url: URL) {
    guard Thread.isMainThread else {
        DispatchQueue.main.async {
            self.updateImageAtURL(url: url)
        }
        return
    }
    do {
        let data = try Data.init(contentsOf: url)
        self.imgImage.image = UIImage.gif(data: data)
    }
    catch {
        print("Error \(error)")
    }
}
```

Como puedes ver, el `searchImageWithKeyword` es bastante complejo con muchas declaraciones `if` y `else` dentro del método. Tenemos que verificar errores en muchas líneas de código. ¿Imaginas cuán complejo sería si tuviéramos más de tres métodos dentro de sí mismo?

![](/Post-Resources/PromiseKIT/CallbackHell.png "")
<center>Un infierno de callbacks en otro lenguaje, Javascript</center>

Compila y ejecuta el proyecto. Ingresa una palabra clave que quieras buscar en el servidor de Giphy, presiona el botón de búsqueda y verás el primer resultado.
<img src="/Post-Resources/PromiseKIT/PromiseKitDemo.gif" width="300">
<center>El proyecto de programación async</center>

## Una mejor solución: Usando Bolts
Bolts es un framework que fue diseñado por Parse y Facebook, lo uso para crear métodos asíncronos, sin usar callback. El framework Bolts nos permite escribir código como una serie de acciones basadas en eventos.

```swift
func fetchImage(keyword: String) -> Task<URL>! {
    let mainTask = TaskCompletionSource<URL>()
    let endPoint = "http://api.giphy.com/v1/gifs/search?q=\(keyword)&limit=1&api_key=q4N1oD5jw3xvH2hIOkFAyHXWTTrh0D30"
    let headers: HTTPHeaders = [
        "Content-Type": "application/json"
    ]
    Alamofire.request(endPoint, headers: headers).responseData { (response) in
        if let error = response.error {
            return mainTask.set(error: error)
        }

        let jsonData = JSON.init(data: response.data!)
        let dataArray = jsonData["data"].array
        if let dataArray = dataArray, dataArray.count > 0 {
            let imagesList = dataArray[0]["images"]
            let fixed_height_still = imagesList["downsized_large"]["url"].stringValue
            return mainTask.set(result: URL.init(string: fixed_height_still)!)
        }
        else {
            return mainTask.set(error: NSError.init(domain: "myDomain", code: 0, userInfo: nil))
        }
    }
    return mainTask.task
}
```

```swift
func downloadImage(url: URL) -> Task<URL>! {
    let mainTask = TaskCompletionSource<URL>()
    let destination: DownloadRequest.DownloadFileDestination = { _, _ in
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let fileURL = documentsURL.appendingPathComponent(url.lastPathComponent)
        return (fileURL, [.removePreviousFile, .createIntermediateDirectories])
    }

    Alamofire.download(url, to: destination).downloadProgress(closure: { (progress) in
        print("\(progress)")
    }).responseData(completionHandler: { (response) in
        if let error = response.error {
            return mainTask.set(error: error)
        }
        if let destinationURL = response.destinationURL {
            return mainTask.set(result: destinationURL)
        }
        else {
            return mainTask.set(error: NSError.init(domain: "myDomain", code: 0, userInfo: nil))
        }
    })
    return mainTask.task
}
```

Veamos cuán simple sería el `searchImageWithKeyword` usando Bolts.

```swift
func searchImageWithKeyword(keyword: String) {
    let imageLoader = ImageLoader()
    imageLoader.fetchImage(keyword: keyword).continueOnSuccessWith { (linkDownload) -> Void in
        imageLoader.downloadImage(url: linkDownload).continueOnSuccessWith(continuation: { (downloadedURL) -> Void in
            self.updateImageAtURL(url: downloadedURL)
        })
    }.continueOnErrorWith { (error) in
        print("Error \(error)")
    }
}
```

Compila y ejecuta el proyecto, nada cambió. Pero el código es más legible que el primero, ¿no? Reunimos todos los errores en un solo lugar, también separamos el manejo de errores y el código de éxito.

## Una solución mucho mejor: Usando PromiseKit
Una cosa que no me gusta del framework Bolts es la falta de documentación y proyectos de ejemplo. Cuando usé por primera vez el framework Bolts, fue muy difícil acostumbrarme a las APIs del objeto Task.
En la [conferencia Swift Summit 2017](https://uynguyen.github.io/2017/11/29/Swift-Summit-conference-in-San-Francisco-2017/), hubo un ponente que presentó un Framework para manejar métodos async, PromiseKit. Después de la conferencia, reemplacé el código que usaba el framework Bolts por PromiseKit en los proyectos de mi empresa. Me di cuenta de que mi código ahora es más legible. Creo que la escritura de PromiseKit será más familiar para los desarrolladores que la escritura de Bolts, especialmente para aquellos que han trabajado con Javascript como yo.
Un método async creado usando PromiseKit retorna una nueva Promise genérica, que es la clase principal proporcionada por PromiseKit. Su constructor toma un bloque de ejecución simple con dos parámetros:
* fulfill: Una función a llamar cuando el valor deseado está listo para cumplir la promesa.
* reject: Una función a llamar si hay un error.

Apliquemos PromiseKit a nuestro proyecto

```swift
    func fetchImage(keyword: String) -> Promise<URL>  {
        return Promise { fullfil, reject in
            let endPoint = "http://api.giphy.com/v1/gifs/search?q=\(keyword)&limit=1&api_key=q4N1oD5jw3xvH2hIOkFAyHXWTTrh0D30"
            let headers: HTTPHeaders = [
                "Content-Type": "application/json"
            ]
            Alamofire.request(endPoint, headers: headers).responseData { (response) in
                if let error = response.error {
                    return reject(error)
                }

                let jsonData = JSON.init(data: response.data!)
                let dataArray = jsonData["data"].array
                if let dataArray = dataArray, dataArray.count > 0 {
                    let imagesList = dataArray[0]["images"]
                    let fixed_height_still = imagesList["downsized_large"]["url"].stringValue
                    return fullfil(URL.init(string: fixed_height_still)!)
                }
                return reject(NSError.init(domain: "myDomain", code: 0, userInfo: nil))
            }
        }
    }
```

```swift
    func downloadImage(url: URL) -> Promise<URL> {
        return Promise { fullfil, reject in
            let destination: DownloadRequest.DownloadFileDestination = { _, _ in
                let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                let fileURL = documentsURL.appendingPathComponent(url.lastPathComponent)
                return (fileURL, [.removePreviousFile, .createIntermediateDirectories])
            }

            Alamofire.download(url, to: destination).downloadProgress(closure: { (progress) in
                print("\(progress)")
            }).responseData(completionHandler: { (response) in
                if let error = response.error {
                    return reject(error)
                }

                if let destinationURL = response.destinationURL {
                    return fullfil(destinationURL)
                }
                reject(NSError.init(domain: "myDomain", code: 0, userInfo: nil))
            })
        }
    }
```

Y el resultado final, ¡qué código tan hermoso! :))

```swift
func searchImageWithKeyword(keyword: String) {
    let imageLoader = ImageLoader()
    firstly {
        imageLoader.fetchImage(keyword: keyword)
    }.then {  downloadLink -> Promise<URL> in
        return imageLoader.downloadImage(url: downloadLink)
    }.then {downloadedURL -> Void in
        self.updateImageAtURL(url: downloadedURL)
    }.catch { error in
        print("Error \(error)")
    }
}
```

Una característica que encuentro muy interesante en ambos frameworks, Bolts y PromiseKit, es que permiten que nuestro código se ejecute en un hilo dado (hilo principal o hilo de fondo). Esta es una gran característica ya que la mayor parte del trabajo realizado en el controlador de vista ha sido para actualizar la UI. A veces, las tareas de larga duración se manejan mejor en un hilo de fondo, para no bloquear la UI. Para más detalles sobre esta característica de Thread, por favor consulta sus documentos: *#Threading*

## Conclusión
Ya que estoy trabajando en CoreBluetooth, a menudo tengo que trabajar con métodos async. Demasiados callbacks hacen que mi proyecto sea más difícil de entender y difícil de depurar si ocurren errores. `Promise` hace que mi código se convierta en una chica más hermosa ;).
Puedes descargar el proyecto de ejemplo completamente terminado [aquí](https://github.com/uynguyen/Asynchronous-In-Swift).
Siéntete libre de dejar tus comentarios en mi publicación.
