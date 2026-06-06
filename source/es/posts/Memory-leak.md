---
title: Fuga de memoria
date: 2018-09-12 11:09:15
tags: [iOS, Memory management]
layout: post
lang: es
thumbnail: /Post-Resources/MemoryLeak/Cover.png
---
Como Ingeniero de Software, definitivamente has escuchado sobre el concepto de fuga de memoria. La fuga de memoria es una situación donde los bloques de memoria están ubicados por el programa y permanecen en la memoria a pesar de que ya no están referenciados. Las fugas desperdician espacio llenando páginas de memoria con datos inaccesibles. Como resultado, el tamaño de memoria usado en tus aplicaciones sigue aumentando, afectando la experiencia del usuario y el rendimiento de tu aplicación. Peor aún, tu aplicación se cerrará aleatoriamente porque un proceso será terminado por el sistema si consume demasiada memoria.
En este tema, discutiremos cómo se gestiona la memoria en iOS y cómo usar la memoria eficientemente. Continúa leyendo.
<!-- more -->
## Conteo Automático de Referencias
### ARC
La mayoría de los lenguajes de programación modernos (como Java, C#, Go, etc.) tienen un proceso incorporado que automáticamente encuentra objetos no utilizados y los elimina para liberar memoria. El propósito principal de esta tecnología es reducir las fugas de memoria y dejar que los programadores se enfoquen en su lógica de negocio sin preocuparse demasiado por la gestión de memoria.
Como lenguaje de programación de alto nivel, Swift también tiene Conteo Automático de Referencias (ARC) para gestionar la memoria usada en nuestras aplicaciones.
### Cómo funciona ARC
Cada vez que creamos una nueva instancia de una clase, ARC asignará un espacio de memoria para almacenar información sobre esa instancia. Esta memoria guarda información sobre el tipo de la instancia, cualquier propiedad almacenada asociada con esa instancia. Especialmente, esta memoria guarda la información de cuántas propiedades, constantes y variables están actualmente refiriendo a esa instancia. ARC nunca desasignará esa instancia mientras exista al menos una referencia activa a esa instancia.
Una vez que el número de objetos que refieren a esa instancia llega a cero, ARC desasignará esa instancia y liberará la memoria retenida por esa instancia.
Al aplicar esta técnica, Apple asegura que las instancias de clase no sigan ocupando espacio en memoria cuando ya no son necesarias, generalmente evitando el problema de fugas de memoria.

## Fuga de memoria
En la mayoría de los casos, ARC hace bien su trabajo. Usualmente no nos preocupamos por la gestión de memoria. Sin embargo, las fugas aún ocurren en iOS por accidente. Esto es cuando dos objetos mantienen referencias fuertes entre sí de manera que cada objeto evita que el otro sea desasignado.

Tomemos un ejemplo, hay dos clases llamadas `Person` y `Car`.
```swift
class Person {
    let name: String
    var car: Car?

    lazy var greeting: () -> String = {
        return "Hello, my name is \(self.name). I have \(self.car?.name ?? "no cars")"
    }

    init(name: String) {
        self.name = name
    }

    deinit {
        print("Person \(self.name) is being destroyed.")
    }
}

class Car {
    let name: String
    var owner: Person?

    init(name: String) {
        self.name = name
    }

    deinit {
        print("car \(self.name) is being destroyed.")
    }
}
```
Cada instancia de `Person` tiene una propiedad `name` de tipo `String` y una propiedad opcional `Car` que inicialmente es nil porque una persona puede no siempre tener un auto.
De manera similar, cada instancia de `Car` tiene una propiedad `name` de tipo `String` y una propiedad opcional `Person` que inicialmente es nil porque un auto puede no siempre tener un dueño.
A continuación, definamos dos variables llamadas `Foo` y `BMW` de las clases `Person` y `Car`, respectivamente. Ahora, enlazamos las dos instancias juntas para que la persona tenga un auto, y el auto tenga un dueño.
```swift
# Bloque principal
var foo: Person? = Person(name: "Foo")
var car: Car? = Car(name: "BMW")
foo!.car = car
seat!.owner = foo
print(foo!.greeting())
```
El siguiente fragmento de código liberará estas dos instancias estableciéndolas a nil.
```swift
foo = nil
seat = nil
```
Como podrías saber, una vez que establecemos una variable a nil, significa que no hay referencias a esta instancia de clase, ARC desasignará el espacio de este objeto para liberar memoria. Como expectativa, deberíamos ver que los métodos `deinit` de `Student` y `Car` son llamados. Sin embargo, esos dos métodos nunca son llamados, no hay ningún mensaje, indicando que los objetos son liberados, impreso en la consola. Esto significa que `foo` y `car` nunca son desinicializados.
![](/Post-Resources/MemoryLeak/Strong_Reference.png "")
La razón por la que estos dos objetos no son liberados es porque estos dos objetos mantienen referencias fuertes entre sí de manera que cada objeto evita que el otro sea desasignado, resultando en que nunca son desinicializados. Esta situación se llama *ciclo de referencia fuerte* en programación.

## Romper ciclos de referencia fuerte
Hay dos formas de romper ciclos de referencia fuerte en Swift. Dependiendo de qué situación estemos enfrentando, elegiremos un enfoque sensato para resolver el problema. Ambos métodos permiten que una instancia referencie a otra sin mantener un agarre fuerte sobre ella.

### Referencia débil
Las referencias débiles deben usarse cuando el objeto al que se refiere podría volverse nil en el futuro. Como tal, los objetos capturados son tipos opcionales.
En el ejemplo anterior, es apropiado para un auto poder no tener dueño en algún punto de su vida, y así una referencia débil es una forma apropiada de romper el ciclo de referencia en este caso.
![](/Post-Resources/MemoryLeak/Weak_Reference.png "")
Hagamos algunos cambios para que la magia suceda
```swift
class Car {
    let name: String
    weak var owner: Person?

    init(name: String) {
        self.name = name
    }

    deinit {
        print("Car \(self.name) is being destroyed.")
    }
}
```
Ejecutemos el código, todavía no hay mensajes impresos en la consola, significa que los dos objetos no son liberados. ¡Qué demonios!
Rastreemos nuestro código para verificar qué está mal.
¿Lo ves? Hay otro problema con el código: El closure.

### Referencia unowned
En el ejemplo anterior, la clase `Person` no solo crea un ciclo de referencia fuerte con la clase `Car` sino también entre sí misma y el closure `greeting`. Así es como se ve el ciclo:
![](/Post-Resources/MemoryLeak/Strong_Unowned_Reference.png "")
Para resolver este problema, usaremos "Referencia unowned". Las referencias unowned deben usarse cuando el closure y el objeto al que se refiere siempre tendrán el mismo tiempo de vida el uno con el otro. Esto significa que los dos objetos serán desasignados al mismo tiempo. Como resultado, una referencia unowned nunca puede volverse nil.
Hagamos algunos cambios para que la magia suceda (De nuevo).
```swift
class Person {
    let name: String
    var car: Car?

    lazy var greeting: () -> String = { [unowned self] in
        return "Hello, my name is \(self.name). I have \(self.car?.name ?? "no cars")"
    }

    init(name: String) {
        self.name = name
    }

    deinit {
        print("Person \(self.name) is being destroyed.")
    }
}
```
Ejecutemos el código, deberías ver los siguientes mensajes impresos en la consola.
```bash
Hello, my name is Foo. I have BMW
Person Foo is being destroyed.
Car BMW is being destroyed.
```
Los dos objetos `foo` y `car` han sido liberados y la fuga ha sido resuelta.
Así es como se ve el ciclo hasta ahora:
![](/Post-Resources/MemoryLeak/Unowned_Reference.png "")

## Herramientas para detectar ciclos de referencia fuerte
Encontrar fugas de memoria usualmente es una pesadilla para un desarrollador iOS porque es demasiado difícil descubrir la causa raíz. Afortunadamente, tenemos múltiples herramientas soportadas por Apple para rastrear fugas de memoria.
### Instrumento de Allocations y Leaks
Desde la barra de herramientas de XCode, elige Product > Profile > Allocations para iniciar un nuevo perfil de instrumento para rastrear asignaciones de memoria. El instrumento Allocations rastrea todos los objetos que la aplicación asigna durante su tiempo de vida.
Ahora, presiona el botón rojo en la parte superior izquierda del panel para comenzar a grabar.
![](/Post-Resources/MemoryLeak/Instrument.png "")
Hay mucha información relacionada con el mapeo de memoria mostrada en la herramienta. Para identificar fugas de memoria, solo necesitamos enfocarnos en dos columnas principales: #Persident y #Transident.
- Columna Persident: mantiene un conteo del número de objetos de cada tipo que actualmente existen en memoria.
- Columna Transident: muestra el número de objetos que han existido pero desde entonces han sido desasignados.

Como puedes ver, la columna #Persident sigue aumentando cada vez que presionas el botón "Create a leak" para ejecutar el bloque principal. Cuando ves algo así suceder a tu aplicación, es hora de revisar tus clases para descubrir dónde está la fuga.
![](/Post-Resources/MemoryLeak/Create_Leak_Instrument.png "")
### Debug Memory Graph
Debug Memory Graph es una herramienta introducida por primera vez en Xcode 8. Es capaz de capturar fugas como ciclos de retención.
Desde el navegador de depuración, haz clic en modo debug > View Memory Graph Hierarchy para visualizar el mapeo de memoria
![](/Post-Resources/MemoryLeak/Visual_Strong_Reference_Cycle_1.png "")
Deberías ver algo como esto.
![](/Post-Resources/MemoryLeak/Visual_Strong_Reference_Cycle_2.png "")
Desde la visualización, podemos ver que hay dos ciclos de referencia fuerte que vienen de la relación `Person`-`Car` y de dentro de `Person` en sí.

## Conclusión
Todo desarrollador iOS debería tener un entendimiento profundo de cómo funciona ARC para evitar fugas de memoria. Innegablemente, una buena gestión de memoria contribuye al rendimiento de la aplicación y a la experiencia del usuario. Esperanzadamente, todos los conceptos que revisamos en este artículo te ayudarán a construir aplicaciones que tengan el mejor rendimiento. Siéntete libre de dejar tus comentarios aquí.
## Referencias
[1] The Swift Programming Language (Swift 4.0.3), App Inc., capítulo de Automatic Reference Counting.
