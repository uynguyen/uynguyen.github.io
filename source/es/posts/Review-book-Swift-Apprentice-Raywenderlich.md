---
title: 'Reseña del libro: Swift Apprentice - Raywenderlich'
date: 2020-02-26 22:05:30
tags:
layout: post
permalink: es/posts/Review-book-Swift-Apprentice-Raywenderlich/
lang: es
---
![](/Post-Resources/SwiftApprentice/banner.png "SwiftApprentice")
Mientras buscaba un libro para mejorar mis habilidades de desarrollo iOS, encontré este libro Swift Apprentice en la tienda de libros de Raywenderlich. Después de echar un vistazo rápido al contenido del libro, decidí agregarlo a mi biblioteca.
En general, si tu nivel de iOS es intermedio o senior, y estás muy seguro de tu dominio de habilidades de programación, este libro no es para ti. Pero si estás buscando un libro para fortalecer tu conocimiento, o solo quieres asegurarte de que todo lo que entiendes sobre el lenguaje Swift es correcto - como fue mi propósito, entonces lleva este libro contigo.
Aprenderás sobre cosas muy básicas como funciones, métodos, constantes, sentencias de control, etc. También tendrás la oportunidad de obtener conocimiento profundo sobre la asignación de Stack/Heap, programación orientada a protocolos y programación genérica, lo cual hace tu trabajo diario más conveniente, y te encontrarás como un maestro en el lenguaje Swift.
¡Empecemos!
<!-- more -->
<div style="text-align:center">
<img src="/Post-Resources/SwiftApprentice/LikeABoss.jpg" />
</div>

# Sobre el autor
Para aquellos que no saben quién es Raywenderlich, es un sitio comunitario enfocado en crear tutoriales y libros de programación (principalmente enfocado en desarrollo móvil en Android e iOS). Su contenido cubre todos los niveles desde temas para principiantes hasta avanzados.
A menudo accedo al sitio de [Raywenderlich](https://www.raywenderlich.com/about) para obtener código de ejemplo y para mantener mi conocimiento actualizado. Sus tutoriales son extremadamente geniales, técnicamente precisos y están actualizados a las tecnologías más nuevas.
Swift Apprentice es uno de su colección de programación iOS.
![](/Post-Resources/SwiftApprentice/books.png "Library")

# Puntos clave
- Propiedad lazy: Si tienes una propiedad que podría tomar algo de tiempo calcular, no quieres ralentizar las cosas hasta que realmente necesites la propiedad, usa la propiedad almacenada lazy. Es útil para cosas como descargar la foto de perfil de un usuario o hacer un cálculo serio.
- El heap vs. el stack:
El Stack se usa para almacenar cualquier cosa en el hilo de ejecución inmediato; está administrado y optimizado por la CPU. Cuando una función crea una variable, el stack almacena esa variable y luego la destruye cuando la función termina. Como el stack está tan estrictamente organizado, es muy eficiente, y por lo tanto bastante rápido.
El heap, por otro lado, se usa para almacenar instancias de tipos de referencia. El heap es generalmente un gran conjunto de memoria del cual el sistema puede solicitar y asignar dinámicamente bloques de memoria. El tiempo de vida es flexible y dinámico. No destruye automáticamente sus datos (el stack sí lo hace). Se requiere trabajo adicional para liberar la memoria en el Heap, lo que hace que crear y eliminar datos en el heap sea un proceso más lento, comparado con el stack.
Cuando se crea una instancia de una clase, tu código solicita un bloque de memoria en el heap para almacenar la instancia misma.
Cuando se crea una instancia de un struct (que no es parte de una instancia de una clase), la instancia misma se almacena en el stack, y el heap nunca está involucrado.
- Cuándo usar una clase versus un struct:
*Valores vs. objetos*: Usa estructuras como valores y clases como objetos con identidad. Para hacerlo simple, solo ten en cuenta que no hay dos objetos que se consideren iguales simplemente porque tienen el mismo estado. En contraste, las instancias de tipos de valor, que son valores, se consideran iguales si son el mismo valor. Por ejemplo, no se consideran iguales dos estudiantes, incluso si tienen el mismo nombre; Dos puntos (x, y) son iguales si x1 e y1 son iguales a x2 e y2, respectivamente, así que implementamos Point como un struct.
*Velocidad*: Si estas instancias solo existirán en memoria por un corto tiempo — ve hacia usar un struct. Si tu instancia tendrá un ciclo de vida más largo en memoria, piensa en una clase.
`Otro enfoque es usar solo lo que necesitas. Si tus datos nunca cambiarán o necesitas un almacén de datos simple, entonces usa estructuras. Si necesitas actualizar tus datos y necesitas que contengan lógica para actualizar su propio estado, entonces usa clases. A menudo, es mejor empezar con un struct. Si necesitas las capacidades adicionales de una clase en algún momento posterior, entonces simplemente convierte el struct en una clase.`
![](/Post-Resources/SwiftApprentice/StructVsClass.png "Library")
- Inicialización en dos fases:
• Fase uno: Inicializa todas las propiedades almacenadas en la instancia de la clase, desde el fondo hasta la cima de la jerarquía de clases. Si usas propiedades y métodos antes de que la fase uno esté completa, el compilador lanzará errores.
• Fase dos: Ya podemos usar propiedades y métodos del objeto.
- Protocolos en la Biblioteca Estándar: Equatable, Comparable, Hashable, CustomStringConvertible.
- Parámetros de función genéricos:
```swift
func swapped<T, U>(_ x: T, _ y: U) -> (U, T) {
    (y, x)
}
```
- Patrón wildcard:
```swift
if case (_, 0, 0) = coordinate {
    // x puede ser cualquier valor. y y z deben ser exactamente 0.
    print("On the x-axis") // Printed!
}
```
- Patrón de vinculación de valores:
```swift
if case let (x, y, 0) = coordinate {
    print("On the x-y plane at (\(x), \(y))") // Printed: 1, 0
}
```
- Patrón de type-casting "Is":
```swift
switch element {
    case is String:
        print("Found a string")
    default: break
}
```
- Rethrows: Al usar rethrows en lugar de throws, las funciones indican que solo relanzarán errores lanzados por las funciones llamadas dentro de sí mismas pero nunca errores propios.
- Beneficios de la orientación a protocolos:
Al usar protocolos en lugar de implementaciones, nos enfocamos en lo que el objeto puede hacer en lugar de cómo lo hace, lo que hace la aplicación más extensible y testeable.
Herencia múltiple: Uno de los verdaderos beneficios de los protocolos es que permiten una forma de herencia múltiple.
- Swift es un lenguaje orientado a protocolos.

# Lo que me gusta
- *Bien organizado*.
- *Ejemplos reales*: Hay ejemplos para cada tema para asegurar que los lectores entiendan profundamente lo que acaban de mencionar.
- *Fácil de entender*: Como el contenido está bien organizado, es fácil seguir el flujo del contenido.
- *Detente y piensa*: Hay ejercicios cortos y desafíos a lo largo del libro para darte algo de práctica de programación y probar tu conocimiento en el camino.
- *Puntos clave*: Resumen los puntos clave al final de cada capítulo.

# Lo que no me gusta
Intenté revisar el libro varias veces para encontrar algo que no me guste pero no hay nada de qué quejarse, desde el contenido hasta la forma.

# En general
Swift es divertido y está lleno de paradigmas de programación. Después de leer este libro, espero que ahora te sientas lo suficientemente cómodo con el lenguaje para pasar a construir cosas más grandes. Con los fundamentos del lenguaje que hemos ganado, estamos listos para explorar frameworks avanzados como Animation, UIKit, etc. para construir apps iOS, apps macOS y más.
Espero que encuentres este libro interesante.
¡Feliz fin de semana!
