---
title: Grand Central Dispatch en Swift
date: 2018-01-04 11:43:23
tags: ["iOS", "DispatchQueue"]
layout: post
lang: es
thumbnail: /Post-Resources/GCD/Banner.png
---
*Grand Central Dispatch*, o GCD para abreviar, es una API de bajo nivel en C para gestionar tareas concurrentes. Nos ayuda a mejorar el rendimiento de nuestra aplicacion ejecutando un bloque de codigo en hilos apropiados, como realizar tareas computacionalmente costosas en segundo plano. GCD proporciona varias opciones para ejecutar tareas como sincronicamente, asincronicamente, despues de un cierto retraso, etc.
En esta publicacion explicare mas detalles sobre GCD y como funciona, tambien proporcionare algunos puntos interesantes cuando trabajamos con GCD. Comencemos.
<!-- more -->
## Introduccion
En el corazon de GCD estan las colas de despacho (dispatch queues) que son grupos de hilos gestionados por GCD. Apple creo GCD para que los desarrolladores no necesiten preocuparse demasiado por estas colas, simplemente despachan un bloque de codigo a una cola dada sin preocuparse por cual hilo se usa.

## Conceptos de GCD
### Concurrencia
La concurrencia se logra cuando mas de dos tareas se ejecutan al mismo tiempo. De hecho, la palabra "Concurrencia" no significa exactamente "al mismo tiempo" o "ocurrir en paralelo". Internamente, la CPU le da a cada tarea una cierta porcion de tiempo para hacer su trabajo. Por ejemplo, si hay 5 tareas para ejecutar en un segundo, con la misma prioridad, el sistema operativo dividira 1,000 milisegundos entre 5 (tareas) y dara a cada tarea 200 milisegundos de tiempo de CPU. Como resultado, pareceran haberse ejecutado concurrentemente.

### Cola serial y cola concurrente
Una cola serial ejecutara sus tareas en forma primero en entrar, primero en salir (FIFO). Esto significa que solo pueden ejecutar un bloque de codigo a la vez. No se ejecutan en el hilo principal, por lo tanto, no bloquean la interfaz de usuario.
![](/Post-Resources/GCD/SerialQueue.png "")
En contraste, una cola concurrente permite ejecutar multiples tareas en paralelo. Significa que las tareas pueden terminar en cualquier orden y no sabras el tiempo que tomara.
![](/Post-Resources/GCD/ConcurrentQueue.png "")

### Metodos sincronos (sync) y asincronos (async)
Cuando despachas una tarea a una cola, determinas si el bloque se ejecuta sincronicamente o asincronicamente. Hay algunas diferencias principales entre las dos tecnicas:
- Un metodo sincrono devuelve el control al llamador solo despues de que la tarea se completa, mientras que un metodo asincrono devuelve el control al llamador inmediatamente.
- Como los metodos asincronos devuelven el control inmediatamente, no bloquean el hilo actual.
- Ten en cuenta que la palabra "sincrono" no significa que el programa tenga que esperar a que el codigo termine antes de continuar. Solo significa que la cola concurrente esperara hasta que la tarea haya terminado antes de ejecutar el siguiente bloque de codigo en la cola.
El codigo a continuacion demuestra como usar ejecuciones async y sync.
```swift
DispatchQueue.global().sync { [1]
    print("A")
    DispatchQueue.global().async {
        for i in 0...5 {
            print(i)
        }
    }
}

DispatchQueue.global().sync { [2]
    print("B")
    DispatchQueue.global().async {
        for i in 6...10 {
            print(i)
        }
    }
}
```
Generalmente, no podemos predecir la salida cuando ejecutamos el codigo anterior porque cada vez que ejecutamos el programa, se imprimiran numerosas salidas diferentes. Solo podemos decir que "B" siempre se imprimira despues de "A" ya que el llamador necesita esperar a que el bloque [1] devuelva el control para poder ejecutar el siguiente bloque [2].
Si editamos estos bloques internos a `sync`, garantizamos que la salida siempre sera `A 0 1 2 3 4 5 B 6 7 8 9 10`.
### Tres tipos principales de colas
Hay tres tipos principales de colas en GCD:
- Cola principal (Main queue): Las tareas despachadas a esta cola se ejecutaran en el hilo principal, donde se llaman los trabajos relacionados con la interfaz de usuario. *La cola principal es una cola serial*.
*Nota importante*, el metodo sync no puede ser llamado en el hilo principal porque bloqueara el hilo completamente y llevara a la aplicacion a un deadlock. Por lo tanto, todas las tareas enviadas a la cola principal deben ser enviadas asincronicamente.
```swift
override func viewDidLoad() {
    super.viewDidLoad()
    let mainQueue = DispatchQueue.main
    mainQueue.sync { // -> Este codigo llevara a un Deadlock
        print("Inner block called")
    }
}
```

![](/Post-Resources/GCD/Deadlock_On_Main_Queue.png "")
- Colas globales (Global queues): Son colas concurrentes y son compartidas por el sistema. Usamos colas globales para cualquier tarea que no involucre la interfaz de usuario. Por ejemplo, descargar una imagen de internet y luego mostrarla al usuario despues de que se descargue, obtener datos de un servidor, etc.
Cuando trabajamos con colas globales, no especificamos la prioridad sino que usamos una *Calidad de Servicio* (QoS) para ayudar a GCD a determinar la prioridad de las tareas. Es importante tener en cuenta que las aplicaciones usan varios recursos como CPU, memoria, interfaz de red, etc. Por lo tanto, debemos elegir el QoS correcto de la cola para mantener la capacidad de respuesta y eficiencia de la aplicacion. El sistema operativo se basara en el QoS dado para tomar decisiones inteligentes sobre cuando y donde ejecutarlas.
Hay cuatro tipos de QoS:
-- *User-interactive*: Esto indica que las tareas necesitan ejecutarse inmediatamente para mantener la capacidad de respuesta en la interfaz de usuario. Lo usamos para actualizaciones de UI o realizar animaciones.
-- *User-initiated*: Trabajo que el usuario ha iniciado y requiere resultados inmediatos (en unos segundos o menos). Lo usamos para realizar una accion cuando los usuarios hacen clic en algo en la UI.
-- *Utility*: Las tareas pueden tomar algun tiempo para completarse y no requieren un resultado inmediato (toma desde unos segundos hasta unos minutos) como descargar datos.
-- *Background*: Esto representa tareas de las cuales el usuario no esta directamente consciente. Normalmente, lo usamos para obtener datos o cualquier tarea que no requiera interaccion del usuario.
- Colas personalizadas (Custom queues): Cuando creas una cola personalizada, puedes especificar que tipo de cola es (Serial o concurrente). Por defecto, son colas seriales.

## Deadlock
La palabra `Deadlock` se refiere a una situacion en la que un conjunto de diferentes hilos que comparten el mismo recurso estan esperando que los demas liberen el recurso para terminar sus tareas.
![](/Post-Resources/GCD/Deadlock.png "")
Cuando trabajamos con GCD, si no entendemos completamente los conceptos de GCD, podemos crear un deadlock en nuestro codigo. Por ejemplo, el codigo a continuacion esta creando un deadlock.
```swift
func deadLock() {
	let myQueue = DispatchQueue(label: "myLabel")
	myQueue.async {
	    myQueue.sync {
	        print("Inner block called")
	    }
	    print("Outer block called")
	}
}
```
Primero, creamos una cola personalizada con una etiqueta dada. Luego despachamos asincronicamente un bloque de codigo que llama a otro bloque de codigo sincronicamente. Esta claro que los bloques interno y externo se estan ejecutando en la misma cola. Por defecto, una cola personalizada es serial, por lo que el bloque interno no comenzara antes de que el bloque externo termine. Por otro lado, el bloque externo no puede terminar porque el bloque interno esta manteniendo el control del hilo actual (sincronicamente). Por lo tanto, ocurre un deadlock.
Hay dos formas de solucionar el problema. La primera es cambiar el tipo de la cola a `concurrent`. Al hacerlo de esta manera, aseguramos que el bloque interno no tenga que esperar a que el bloque externo haya terminado para poder comenzar.
```swift
let myQueue = DispatchQueue(label: "myLabel", attributes: .concurrent)
```
La segunda es cambiar el bloque interno a `async`. Esta vez, el bloque externo no esperara a que el bloque interno se complete para poder comenzar.
```swift
myQueue.async {
    myQueue.async {
        print("Inner block called")
    }
    print("outer block called")
}
```
Hay una recomendacion en el documento de Apple sobre Deadlock en el [capitulo de Dispatch queues y seguridad de hilos](https://developer.apple.com/library/content/documentation/General/Conceptual/ConcurrencyProgrammingGuide/OperationQueues/OperationQueues.html#//apple_ref/doc/uid/TP40008091-CH102-SW28)
`"No llames a la funcion dispatch_sync desde una tarea que se esta ejecutando en la misma cola que pasas a tu llamada de funcion. Hacerlo causara un deadlock en la cola.
Si necesitas despachar a la cola actual, hazlo asincronicamente usando la funcion dispatch_async."`
## Livelock
Hay otro concepto de bloqueo ademas del deadlock llamado `Livelock`. A diferencia del deadlock, el livelock no bloquea el hilo actual. Simplemente no pueden avanzar mas. O mas precisamente, livelock es "una situacion en la que dos o mas procesos cambian continuamente sus estados en respuesta a cambios en los otros procesos sin hacer ningun trabajo util".
Hay un buen ejemplo humano de livelock en [StackOverflow](https://stackoverflow.com/questions/1036364/good-example-of-livelock)
`Un esposo y una esposa estan tratando de comer sopa, pero solo tienen una cuchara entre ellos. Cada conyuge es demasiado educado y pasara la cuchara si el otro aun no ha comido.`
Hay otros tipos de bloqueos cuando trabajamos con concurrencia como recursos limitados, exclusion mutua, inanicion. Debido al alcance de esta publicacion, no explicare todos ellos aqui. Por favor consulta otras fuentes para mas detalles.
## Notas importantes
- En iPhones, las operaciones discrecionales y de fondo, incluyendo redes, se pausan cuando el Modo de Bajo Consumo esta habilitado.
- Cuando usas Xcode 9 con iOS 11, se emitira una advertencia cuando se accede a un objeto de interfaz de usuario desde un hilo que no es el principal.
- La prioridad user interactive deberia ser rara en tu programa. Si todo es de alta prioridad, nada lo es.

## Conclusion
En esta publicacion, te mostre algunos puntos interesantes sobre GCD en Swift. En la proxima publicacion, discutiremos mas sobre otros conceptos avanzados de programacion concurrente como DispatchGroup, Operation Queue, Group Tasks, etc. Luego implementaremos un pequeno proyecto para mezclarlos todos juntos.
Si tienes algun comentario, no dudes en contactarme.

## Referencias
[1] [Documentacion de Apple: Guia de Programacion de Concurrencia](https://developer.apple.com/library/content/documentation/General/Conceptual/ConcurrencyProgrammingGuide/Introduction/Introduction.html)
[2] iOS 8 Swift Programming Cookbook por O'Reilly, Cap.7: Concurrencia y Multitarea.


