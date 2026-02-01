---
title: 'Concurrencia Avanzada en iOS: Operaciones Asíncronas [2]'
date: 2020-05-30 17:02:31
tags: [Concurrency, Operations, iOS]
layout: post
lang: es
---

![](/Post-Resources/Operations_2/operations.png "Operations")

En la publicación anterior, [Concurrencia Avanzada en iOS: Operations](/2020/05/16/iOS-Concurrency-Operations), revisamos los conceptos de Operation en iOS e hicimos una aplicación de demostración que obtiene algunas de mis publicaciones. Después de descargar las imágenes de portada, se les aplicará un filtro simple y luego se mostrarán en una tabla. Sin embargo, la aplicación aún no está completa. Hay algo que salió mal con nuestra aplicación que hace que no muestre las imágenes descargadas correctamente. En este tutorial, continuaremos donde lo dejamos.
¡Prepárate!
<!-- more -->
## Ciclo de vida de Operation
Para descubrir por qué nuestra aplicación no funcionó correctamente, revisemos el código fuente actual
```swift
class DownloadImageOperation: Operation {
    override func main() {
        guard !isCancelled else { return }

        URLSession.shared.dataTask(with: self.url, completionHandler: { (data, res, error) in
            guard error == nil,
                let data = data else { return }

            self.outputImage = UIImage(data: data)
        }).resume()
    }
}
```

La siguiente imagen describe los cambios en los estados de las operaciones.
![](/Post-Resources/Operations_2/Async_Operation_State.png "Async_Operation_State")

Cuando se llama al método `main`, ejecutará nuestra tarea asíncrona y luego saldrá inmediatamente haciendo que el estado de la operación cambie a `isFinish`. En ese momento, nuestra tarea asíncrona en realidad aún no ha completado.
Actualmente, estamos llamando para descargar una imagen dentro del método `main` de la Operation. La causa raíz está relacionada con el Ciclo de Vida de Operation en sí. Por lo tanto, para soportar operaciones asíncronas en nuestra aplicación, necesitamos gestionar manualmente los estados de las operaciones.

## [Key-Value Observing](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/KeyValueObserving/KeyValueObserving.html)
Antes de implementar nuestra clase Async Operation personalizada, necesitamos aprender un nuevo concepto primero: KVO. Asumo que no has escuchado sobre este concepto, así que primero le daremos un vistazo rápido.
Key-Value Observing, también conocido como KVO, es una de las técnicas para observar los cambios de estado de un objeto en Objective-C y Swift. Cada vez que el valor de las propiedades observadas cambia, el bloque de código de observación se ejecutará. En el corazón de KVO, el concepto principal se basa en el Patrón Observer.
Las clases Swift que heredan de la clase `NSObject` tienen métodos para permitir que otros objetos observen sus propiedades.

> Key-value observing proporciona un mecanismo que permite que los objetos sean notificados de cambios en propiedades específicas de otros objetos. Es particularmente útil para la comunicación entre las capas de modelo y controlador en una aplicación.

Creemos un Playground para probarlo.
```swift
class CreditCard: NSObject {
    @objc dynamic private(set) var number: Int = 1000

    func increaseNumber(by value: Int) {
        self.number += value
    }
}

class Person: NSObject {
    let cretdit: CreditCard
    var kvoToken: NSKeyValueObservation?

    init(cretdit: CreditCard) {
        self.cretdit = cretdit
        kvoToken = self.cretdit.observe(\.number, options: .new) { (credit, change) in
            guard let newNumber = change.newValue else { return }

            print("New number is \(newNumber)")
        }
    }

    deinit {
        kvoToken?.invalidate()
    }
}

let credit = CreditCard()
let person = Person(cretdit: credit)
credit.increaseNumber(by: 500)
```

Aquí, defino dos clases: `CreditCard` y `Person`. Un objeto `Person` tiene un objeto `CreditCard` como propiedad. Lo que quiero es que cada vez que la propiedad `number` de la tarjeta de crédito cambie, la persona sea notificada. Aquí es donde entra KVO.
Ejecuta el código anterior en el playground, deberías ver el log `New number is \(newNumber)` impreso en tu consola.

¿Por qué necesitamos saber sobre KVO? La respuesta es porque la clase Operation usa notificaciones KVO. Cada vez que el estado de Operation cambia, se enviará una notificación KVO.
Sin las notificaciones KVO, el OperationQueue no podrá observar el estado de nuestras operaciones por lo que no puede actualizarse correctamente. Por lo tanto, cuando gestionamos el estado de la operación por nosotros mismos, debemos asegurarnos de que esas notificaciones KVO se envíen correctamente.

## Async Operation
Creemos la clase `AsyncOperation` heredada de la clase `Operation`.
```swift
class AsyncOperation: Operation {
    enum State: String {
        case ready, executing, finished

        var keyPath: String {
            return "is\(rawValue.capitalized)"
        }
    }
    // El resto del código
}
```

A continuación, declaramos una propiedad para rastrear el estado del objeto.

```swift
var state = State.ready {
    willSet {
        willChangeValue(forKey: newValue.keyPath)
        willChangeValue(forKey: state.keyPath)
    }
    didSet {
        didChangeValue(forKey: oldValue.keyPath)
        didChangeValue(forKey: state.keyPath)
    }
}
```
La clase base `Operation` necesita conocer los cambios tanto del estado antiguo como del nuevo estado.
Tomemos un caso específico como ejemplo, el estado actualmente es `ready`, luego establecemos el estado a `executing`. Hay 4 notificaciones KVO que deben enviarse:
- Primero, notificar el willChangeValue para `isReady`.
- Luego, notificar el willChangeValue para `executing`.
- Después de eso, notificar el willChange para `isReady`.
- Finalmente, notificar el willChange para `executing`.

Después de eso, sobrescribimos las propiedades de estados.
```swift
override var isReady: Bool {
    return super.isReady && state == .ready
}

override var isExecuting: Bool {
    return state == .executing
}

override var isFinished: Bool {
    return state == .finished
}

override var isAsynchronous: Bool {
    return true
}
```
Eso es todo para gestionar el estado de la clase Async Operation.

Cuando se agrega una operación a una cola de operaciones, el método `start` es lo que se llama primero, luego llamará al método `main` de la operación ejecutando el bloque principal de código que has asignado a la operación.
```swift
override func start() {
    main()
    state = .executing
}
```

¿Recuerdas cuando mencioné que Operation tiene características extraordinarias que lo hacen superar a GDC? La primera son las dependencias y la otra es la capacidad de cancelar una operación en ejecución. Es muy útil en un caso donde queremos detener operaciones que son irrelevantes en un momento determinado. Por ejemplo, cancelar la descarga de datos cuando el usuario hace scroll en la tabla haciendo que algunas celdas desaparezcan.
Agreguemos esta característica a nuestra clase Async Operation.
Primero, necesitamos modificar el método `start` para verificar la propiedad `isCancelled` antes de llamar realmente al método `main`.
```swift
override func start() {
    if isCancelled {
        state = .finished
        return
    }

    main()
    state = .executing
}
```

Y luego sobrescribir el método `cancel` para actualizar el estado a `finished`
```swift
override func cancel() {
    state = .finished
}
```

En este punto, hemos terminado de implementar nuestra clase `Async Operation`. Es hora de mezclar todo junto en nuestra aplicación.

## Juntando todo
Debido a que la clase `DownloadImageOperation` se ejecuta de forma asíncrona, no podemos establecer la clase `Operation` como su clase base, ahora establecemos `AsyncOperation` en su lugar. Ten en cuenta que para soportar la cancelación en la clase `DownloadImageOperation`, mantendremos el valor de retorno de crear una tarea de datos como una propiedad de esta clase para que podamos cancelar este `URLSessionDataTask` más tarde.
La clase `DownloadImageOperation` se verá así.
```swift
class DownloadImageOperation: AsyncOperation {
    let url: URL
    var outputImage: UIImage?
    private var task: URLSessionDataTask?

    init(url: URL) {
        self.url = url
    }

    override func main() {
        self.task = URLSession.shared.dataTask(with: self.url, completionHandler: { [weak self] (data, res, error) in
            guard let `self` = self else { return }

            defer { self.state = .finished }

            guard !self.isCancelled else { return }

            guard error == nil,
                let data = data else { return }

            self.outputImage = UIImage(data: data)
        })
        task?.resume()
    }

    override func cancel() {
        super.cancel()
        task?.cancel()
    }
}
```
Volvamos a nuestro `ViewController` principal. Para cancelar las operaciones en ejecución, primero agregamos un nuevo diccionario como propiedad de `ViewController` que rastrea todas las operaciones en ejecución para cada celda de la tabla en un index path correspondiente.
```swift
private var operations: [IndexPath: [Operation]] = [:]
```

Dentro del delegado `func tableView(_ tableView:cellForRowAt indexPath:)`, después de agregar dos operaciones a la cola de operaciones, también las agregaremos al diccionario `operations` para rastrearlas. Además, si hay una operación para este index path, la cancelamos antes de mantener la nueva.
```swift
if let existingOperations = operations[indexPath] {
    for operation in existingOperations {
        operation.cancel()
    }
}
operations[indexPath] = [grayScaleOpt, downloadOpt]
```

Cuando el usuario hace scroll en la tabla, algunas celdas desaparecen y se llama al delegado `func tableView(_ tableView:didEndDisplaying cell:indexPath:)`. En ese momento, también cancelaremos las operaciones en ejecución para esa celda asegurándonos de que solo las operaciones de las celdas visibles se estén ejecutando.
```swift
func tableView(_ tableView: UITableView, didEndDisplaying cell: UITableViewCell, forRowAt indexPath: IndexPath) {
    if let operations = operations[indexPath] {
        for operation in operations {
            operation.cancel()
        }
    }
}
```

<div style="text-align:center">

![](/Post-Resources/Operations_2/final.gif "Final app")

</div>

Ahora, deberías ver que la aplicación funciona correctamente. Además, al iniciar y cancelar las operaciones de manera inteligente, estamos ahorrando tráfico de red así como reduciendo el consumo de batería. Esas cosas pueden hacer que nuestra aplicación funcione más rápido.

## Conclusión
Hay algunos beneficios de `Operation` sobre GCD que mantienen nuestro código fuente mantenible y reutilizable.
Por último mencionar, por favor ten cuidado al usar Operation o GCD porque la concurrencia a veces introduce errores que no siempre son transparentes de encontrar y corregir. [En el libro Clean Code](http://localhost:4000/2017/10/20/Review-Book-Clean-Code/), Robert C. Martin establece algunos puntos importantes cuando se trabaja con múltiples hilos
> Hay algunas definiciones básicas que debemos conocer cuando hablamos de concurrencia e hilos: Recursos limitados, exclusión mutua, inanición, deadlock y livelock.

> La concurrencia no siempre mejora el rendimiento. A veces incurre en algún overhead y los errores que provienen de ella no suelen ser repetibles.

> Limita el acceso a los datos que se comparten entre más de dos hilos. Usa copias de datos si hay una posibilidad.

> Mantén las secciones sincronizadas lo más pequeñas posible porque los Locks crean retrasos y agregan overhead. Son costosos.

> El código multihilo se comporta de manera diferente en diferentes entornos: Ejecuta pruebas en cada entorno de despliegue potencial.

Puedes encontrar el proyecto final a través del [enlace](https://github.com/uynguyen/iOS-Operations)
Gracias por leer.

## Referencias
- Capítulo 6: Operations, Concurrency By Tutorials - Multithreading in Swift with GCD and Operations, Raywenderlich,
- Capítulo 7: Concurrency and Multitasking, iOS 8 Swift Programming Cookbook, O'Reilly.
