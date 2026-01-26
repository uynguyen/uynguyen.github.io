---
title: Trabajando con Thread Safe en iOS
date: 2018-06-05 21:03:32
tags: [iOS, Concurrency]
layout: post
permalink: es/posts/Working-In-Thread-Safe-on-iOS/
lang: es
---

![](/Post-Resources/ThreadSafe/cover.png "")
Como ya sabes, el termino "Thread safe" se refiere a un concepto de ciencias de la computacion en el contexto de programas multi-hilo. Un codigo se llama "Thread safe" si cualquier dato compartido es accedido por solo un hilo en cualquier momento dado. Ten en cuenta que estos datos compartidos se llaman secciones criticas en un sistema operativo.
El punto es que los tipos de coleccion de Swift como Array y Dictionary no son thread-safe cuando se declaran como mutables (con la palabra clave `var`).
En esta publicacion, discutiremos algunas tecnicas para hacer nuestro codigo thread safe en iOS.
<!-- more -->
## Caso de estudio
Digamos que tenemos un array que contiene datos cruciales. En la realidad, puede ser una cantidad de dinero en una tarjeta de credito, estados de transacciones, etc. Son realmente importantes, asi que si no protegemos estos valores con precision, enfrentaremos errores significativos en tiempo de ejecucion.
Para simular una condicion de carrera, voy a usar `DispatchQueue.concurrentPerform` para crear 10 hilos concurrentes ejecutandose al mismo tiempo.
```swift
class ViewController: UIViewController {

    var array = [Int]()

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // Do any additional setup after loading the view, typically from a nib.
        DispatchQueue.concurrentPerform(iterations: 10) { index in
            self.array.append(index)
        }
    }
    // The rest of code
}
```

El resultado del codigo anterior es impredecible. Caeras en 2 casos:

- La mayoria de las veces que ejecutes este codigo, obtendras un error en tiempo de ejecucion como este
![](/Post-Resources/ThreadSafe/crash.png "")
El problema fundamental es porque las colecciones de Swift como Array y Dictionary no son thread-safe pero dejamos que multiples hilos modifiquen el array al mismo tiempo. [Stackoverflow](https://stackoverflow.com/questions/47959397/concurrentperform-unsafemutablepointer-deinitialize-error-while-adding-value-to?noredirect=1&lq=1)

- Si tienes suerte de no obtener este error, los elementos del array se veran aleatorios como esto:
`Element count 5`
`Element count 9`
`Element count 10`
El punto es que no siempre obtenemos 10 elementos como se esperaba.

Como sucedio esto?
![](/Post-Resources/ThreadSafe/Race-Condition.png "")
No es seguro dejar que un hilo modifique el valor mientras otro lo esta leyendo.
## Soluciones
La forma de evitar condiciones de carrera es sincronizar los datos, o las secciones criticas. Sincronizar datos generalmente significa "bloquearlos" para que solo un hilo pueda acceder a esa parte del codigo a la vez.
Como Swift no soporta soluciones de concurrencia incorporadas, vamos a usar Grand Central Dispatch para implementar thread safe en su lugar.

### Usando cola serial
Aprovechando las colas seriales, podemos prevenir condiciones de carrera en un recurso. Como introduje como funciona una cola serial en una publicacion anterior, [Grand-Central-Dispatch-in-Swift](/2018/01/04/Grand-Central-Dispatch-in-Swift/), una cola serial permite que solo un proceso se ejecute a la vez, por lo que el array esta protegido de procesos concurrentes.

```Swift
class SafetyArray<T> {
        var array = [T]()
        let serialQueue = DispatchQueue(label: "com.uynguyen.queue")

        var last: T? {
            var result: T?
            self.serialQueue.sync {
                result = self.array.last
            }
            return result
        }

        func append(_ newElement: T) {
            self.serialQueue.async() {
                self.array.append(newElement)
            }
        }
    }
```

Aunque protegemos el array de ser accedido por multiples hilos, usar una cola serial no es la mejor solucion. Leer el ultimo valor no esta optimizado porque multiples solicitudes de lectura tienen que esperar unas a otras ya que estan en una cola serial. Las lecturas deberian poder ocurrir concurrentemente, siempre y cuando no hagamos una escritura al mismo tiempo.

### Usando cola concurrente con la bandera `barrier`
La idea principal de esta solucion es usar una cola concurrente en lugar de una cola serial.
Swift nos permite despachar un bloque de codigo a una cola concurrente con una bandera llamada `barrier`. La bandera *barrier* asegura que la cola concurrente no ejecute ninguna otra tarea mientras ejecuta el proceso `barrier`. Una vez que el proceso `barrier` termina, entonces la cola permite ejecutar otras tareas simultaneamente por implementacion predeterminada.
```swift
class SafeArray<T> {
        var array = [T]()
        let concurrentQueue = DispatchQueue(label: "com.uynguyen.queue", attributes: .concurrent)

        var last: T? {
            var result: T?
            self.concurrentQueue.sync {
                result = self.array.last
            }
            return result
        }

        func append(_ newElement: T) {
            self.concurrentQueue.async(flags: .barrier) {
                self.array.append(newElement)
            }
        }
    }
```
Continuamos usando el metodo sync para leer el ultimo elemento, pero todos los lectores se ejecutaran en paralelo esta vez ya que estamos usando una cola concurrente.
![](/Post-Resources/ThreadSafe/Barrier.png "")

## El compromiso
Trabajar con multiples hilos es una parte dificil de la programacion. Aunque tenemos que proteger las secciones criticas de accesos multiples, debemos tener en cuenta que *"Manten las secciones sincronizadas lo mas pequenas posible porque los bloqueos crean retrasos y agregan sobrecarga. Son costosos"*. [Clean code](/2017/10/20/Review-Book-Clean-Code/).
Algunos consejos para lidiar con la concurrencia:
- La concurrencia no siempre mejora el rendimiento. A veces incurre en algo de sobrecarga y los errores que vienen de ella no suelen ser repetibles.
- Limita el acceso de los datos que se comparten entre mas de dos hilos. Usa copias de datos si hay una oportunidad.
- El codigo multihilo se comporta diferente en diferentes entornos: Ejecuta pruebas en cada entorno de despliegue potencial.

## Pensamientos finales
Thread safe es uno de los conceptos mas importantes en ciencias de la computacion, especialmente en un sistema que permite acceder a datos simultaneamente. Entender como hacer el codigo thread safe nos permite evitar errores serios que ocurren en tiempo de ejecucion.
Feliz programacion.
