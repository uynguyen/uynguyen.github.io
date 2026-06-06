---
title: 'Mejores practicas: Concurrencia en Core Data'
date: 2019-09-01 10:13:01
tags: [Core Data, iOS, Concurrency]
layout: post
lang: es
thumbnail: /Post-Resources/CoreDataConcurrency/banner.png
---

Algunas aplicaciones pueden sobrevivir sin ningun almacenamiento de datos. La mayoria de las otras aplicaciones utiles, sin embargo, guardan algun estado como configuraciones de usuario, perfil de usuario, objetivos, etc. En iOS, Apple proporciona Core Data como un framework para persistir tus datos valiosos. Una cosa a tener en cuenta es que aunque CoreData puede almacenar datos en una base de datos relacional, en realidad no es un motor de base de datos.
En este tutorial, compartire contigo una mala experiencia que enfrente cuando trabaje con Core Data. Esperemos que despues de leer lo que comparto, evites enfrentar el mismo problema en tus proyectos.
Comencemos.
<!-- more -->
# Tres componentes principales del stack de Core Data
Primero que nada, listare los tres componentes principales del stack de Core Data, puede que estes o no familiarizado con estos terminos pero es mejor obtener un entendimiento profundo del stack de Core Data antes de profundizar mas.
La API de Core Data, tambien llamada el stack, consiste en tres componentes principales:
- *NSManagedObjectModel*: El modelo de datos describe una entidad (objeto).
- *NSManagedObjectContext*: Los objetos cuando se obtienen del almacenamiento persistente se colocan en el contexto de objeto administrado. Realiza validaciones y mantiene un seguimiento de los cambios realizados a los atributos del objeto para que las operaciones de deshacer y rehacer puedan aplicarse, si es necesario. En un contexto dado, un objeto administrado proporciona una representacion de un registro en un almacen persistente. Dependiendo de la situacion, puede haber multiples contextos, cada uno conteniendo un objeto administrado separado representando ese registro. Todos los objetos administrados estan registrados con un contexto de objeto administrado.
- *NSPersistentStoreCoordinator*: `NSManagedObjectContext` no trabaja directamente con `NSPersistentStore` para almacenar y recuperar datos, sino que NSPersistentStoreCoordinator lo hara. Los roles principales de `NSPersistentStoreCoordinator` son gestionar el estado del contexto de objeto administrado y serializar llamadas a `NSPersistentStore` para evitar redundancia.

Puedes encontrar los roles principales de cada componente en la siguiente imagen
![](/Post-Resources/CoreDataConcurrency/CoreDataStack.png "Core data stack")

Tenemos suficiente conocimiento de Core Data y sus diferentes componentes. Ahora, avancemos a la seccion principal.

# Core Data soporta concurrencia
Core Data soporta multi-threading en una aplicacion, lo que significa que mas de un hilo puede ejecutarse en paralelo para aumentar el rendimiento. Incluso algunas tareas pueden realizarse en segundo plano usando un hilo separado.
Como podrias saber, cuando trabajas con CoreData, hay dos formas de definir un contexto de objeto administrado: `NSMainQueueConcurrencyType` y `NSPrivateQueueConcurrencyType`. Depende de nosotros decidir que tipo de MOC debemos crear en nuestras aplicaciones. Principalmente trabajaremos en el principal, pero para evitar hacer procesamiento de datos en la cola principal, ya que podria afectar la experiencia del usuario al hacer tareas pesadas en el hilo principal, a veces necesitamos crear un contexto de cola privada y realizar esas tareas pesadas en este contexto privado.
La concurrencia absolutamente hace la aplicacion mas efectiva ya que las tareas ahora pueden hacerse en paralelo, pero hay algunas reglas estrictas definidas por Apple que debemos seguir, de lo contrario enfrentaremos algunos comportamientos inesperados, incluyendo crashes y perdida de datos.
- *Regla 1*: Los contextos de objetos administrados estan vinculados al hilo con el que estan asociados en la declaracion. La primera regla establece que no uses el contexto de cola principal en un hilo en segundo plano. La mayoria del tiempo, no hay falla en absoluto si violamos la regla. Sin embargo, cuando llega a produccion, pronto enfrentaras crashes en tu dashboard, resultando en malas experiencias de usuario y mas importante aun, llevando a perdida de datos.
- *Regla 2*: Los objetos administrados recuperados de un contexto estan vinculados a la misma cola con la que el contexto esta asociado. Eso significa no pasar ninguno de los objetos recuperados del contexto principal al privado y viceversa. Violar esta regla llevara al mismo resultado que la regla 1.

# Crash, crash, crash!
Ha sido la primera vez que uso CoreData para almacenar datos valiosos de usuarios en nuestra aplicacion. Por un lado, no tome la concurrencia de Core Data en serio en ese momento. Por otro lado, no sabia que hay algunas reglas estrictas cuando se trabaja con concurrencia en Core Data. Como resultado, cuando la aplicacion llego a produccion, el numero de crashes habia sido reportado al dashboard de monitoreo.
![](/Post-Resources/CoreDataConcurrency/CoreDataCrash_01.png "Core data crash")

![](/Post-Resources/CoreDataConcurrency/CoreDataCrash_02.png "Core data crash")

En ese momento, no tenia idea de como venian. No podia reproducir estos problemas para encontrar la causa raiz. Adicionalmente, el crash reportado por Firebase no tenia suficiente informacion para una investigacion. Intente revisar el flujo de mi aplicacion, buscando en StackOverflow y luego leyendo profundamente el documento de Apple de Core Data. Finalmente, la causa raiz viene de acceder a Core Data desde multiples hilos.

Como estoy trabajando con Core Bluetooth, el punto clave es que Core Bluetooth despacha eventos de Bluetooth en el hilo principal por defecto. Sin embargo, configure la cola de Bluetooth a una cola en segundo plano para evitar bloquear la cola de UI. Aqui vienen los crashes ya que Core Data no permite acceder a `NSManagedObject` entre diferentes colas estrictamente.

Para simular este problema, cree un bucle sin parar para ejecutar acciones de insercion y eliminacion en una cola en segundo plano continuamente. El siguiente codigo ilustra como realice la prueba.

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    // Do any additional setup after loading the view.

    self.doSomething()
}

func doSomething() {
    self.managedContext?.insert(person: self.person)
    self.managedContext?.delete(person: self.person)
    DispatchQueue.global(qos: .background).asyncAfter(deadline: .now() + 0.1, execute: {
        self.doSomething()
    })
}
```

Tarde o temprano, el crash llegara a nosotros.
```swift
2019-10-13 12:31:55.497690+0700 CoreData-Concurrency[90636:1151728] [error] error: Serious application error.  Exception was caught during Core Data change processing. This is usually a bug within an observer of NSManagedObjectContextObjectsDidChangeNotification.  -[__NSCFSet addObject:]: attempt to insert nil with userInfo (null)
CoreData: error: Serious application error.  Exception was caught during Core Data change processing.  This is usually a bug within an observer of NSManagedObjectContextObjectsDidChangeNotification.  -[__NSCFSet addObject:]: attempt to insert nil with userInfo (null)
2019-10-13 12:31:55.569306+0700 CoreData-Concurrency[90636:1151728] *** Terminating app due to uncaught exception 'NSInvalidArgumentException', reason: '-[__NSCFSet addObject:]: attempt to insert nil'
```

![](/Post-Resources/CoreDataConcurrency/Simulate_Crash.png "Core data crash")

Aqui hay algunas respuestas de la comunidad que puedes encontrar en Stackoverflow:
https://stackoverflow.com/questions/36402366/core-data-crash-attempt-to-insert-nil-with-userinfo-null
https://stackoverflow.com/questions/55517083/ios-core-data-serious-application-error-attempt-to-insert-nil-in-less-than

# Evitar crashes

Para evitar el crash, hay dos tecnicas que podemos aplicar, ambas aseguran que no violemos las reglas de confinamiento de concurrencia.
## #1
La primera es asegurar que el `managedObjectContext` se ejecute en la cola con la que esta asociado en la inicializacion, que es la cola principal en este caso.
```swift
func doSomething() {
    self.managedContext?.insert(person: self.person)
    self.managedContext?.delete(person: self.person)
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1, execute: { // Dispatch to main queue
        self.doSomething()
    })
}
```
En caso de que por alguna razon, no podamos ejecutar las acciones en la cola principal (por ejemplo, importar datos enormes al disco) podemos crear multiples contextos para resolver este problema. Ve a #2.

## #2
Usando la tecnica de `Core Data multiple context`.
Un contexto de objeto administrado (MOC) hijo no mantiene una referencia al coordinador de almacen persistente (PSC). En cambio, mantiene una referencia a otro (MOC) como su padre. Cada vez que un hijo realiza `saveContext`, los cambios seran enviados a su padre, y seguiran enviandose a otros padres (si los hay). Solo cuando el MOC padre raiz realiza `saveContext`, los cambios se guardan en el PSC.

![](/Post-Resources/CoreDataConcurrency/CoreData-MultipleContext.png "Core data multiple context")

Creemos un MOC privado dentro de nuestra clase `PersonManagedObject`.
```swift
private let privateMOC = NSManagedObjectContext(concurrencyType: .privateQueueConcurrencyType)
```

Luego establece su padre como el MOC principal.
```swift
init?() {
    ...

    privateMOC.parent = self.managedObjectContext
}
```

De ahora en adelante, todas las acciones se realizaran en este `privateMOC`. El metodo `performAndWait` bloquea al llamador de retornar hasta que el bloque se ejecute.
`
El metodo perform(_:) retorna inmediatamente y el contexto ejecuta los metodos del bloque en su propio hilo. Con el metodo performAndWait(_:), el contexto todavia ejecuta los metodos del bloque en su propio hilo, pero el metodo no retorna hasta que el bloque se ejecute.
`

```swift
func insert(person: Person) {
    ...
    // Some code are obmitted
    self.privateMOC.performAndWait {
        self.privateMOC.insert(object)
        synchronize()
    }
}
```

No olvides llamar al metodo `saveContext` del contexto padre para guardar los cambios en el PSC.
```swift
private func synchronize() {
    do {
        try self.privateMOC.save() // We call save on the private context, which moves all of the changes into the main queue context without blocking the main queue.
        self.managedObjectContext.performAndWait {
            do {
                try self.managedObjectContext.save()
            } catch {
                print("Could not synchonize data. \(error), \(error.localizedDescription)")
            }
        }
    } catch {
        print("Could not synchonize data. \(error), \(error.localizedDescription)")
    }
}
```

Despues de modificar el codigo usando #1 o #2, ejecute el programa de nuevo por un largo tiempo pero no hubo mas crashes!

# Conclusion
Core Data es un framework muy util y ciertamente es indispensable en la mayoria de las aplicaciones moviles hoy en dia. Para evitar las mismas malas situaciones por las que acabo de pasar, asegurate de profundizar en sus componentes antes de comenzar tu codigo, especialmente la concurrencia de Core Data.
Puedes encontrar mi proyecto completado en [Github - Core Data Concurrency](https://github.com/uynguyen/Core_Data_Concurrency)
Gracias por leer.
# Referencias
[1] B.M. Harwani - Core Data iOS Essentials-Packt Publishing (2011)
[2] [Core Data, Multithreading, and the Main Thread](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreData/Concurrency.html)
[3] [Multiple context CoreData] https://www.cocoanetics.com/2012/07/multi-context-coredata/
