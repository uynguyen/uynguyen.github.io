---
title: Fallar temprano en Swift
date: 2019-01-19 11:59:38
tags: [iOS, Swift]
layout: post
lang: es
thumbnail: /Post-Resources/Crashing/crashing.png
---
Anoche, leí un capítulo de un libro que es uno de mis favoritos: `"The pragmatic programmer"` (De Andrew Hunt y David Thomas). Este capítulo discute cómo usar assertion para hacer el código más fácil de depurar. Todos sabemos que assertion es una herramienta esencial para escribir tests, pero hace más que eso. Vamos conmigo a conocer a este chico: *Assertion*.
<!-- more -->
## Fallar, no corromper
¿Alguna vez has tenido una de las siguientes conversaciones contigo mismo o con tus colegas en una discusión técnica?
- "Este caso nunca ocurrirá así que no necesitamos procesar este."
- "Esta clase debe ser "Dog", nunca puede ser "Cat", vamos a hacer force unwrap de este objeto."
- "Este error nunca ocurrirá, solo ignóralo."
- "¡Idiota! ¿por qué manejamos este caso cuando tu código nunca llega a esta línea?"

Pero, ¿y si "este caso" ocurre de alguna manera? ¿La aplicación aún responderá de la manera que esperamos? ¿Hay alguna posibilidad de que la situación inesperada dañe nuestra base de datos esencial?
Al principio de este capítulo, el autor introduce algunas situaciones en las que puedo verme en esos ejemplos: "Este código no se usará en 30 años, así que las fechas de dos dígitos están bien." "Esta aplicación nunca se usará en el extranjero, así que ¿por qué internacionalizarla?" "count no puede ser negativo." "Este printf no puede fallar."

```
SI NO PUEDE SUCEDER, USA ASSERTIONS PARA ASEGURARTE DE QUE NO SUCEDERÁ
```
Si creemos que algo no puede suceder, o algo es verdadero, ¡usa assertions para asegurarte de que tu creencia es verdadera! Si la condición de assertion no se cumple, inmediatamente hará crash a la aplicación. Es muy útil durante el *desarrollo* porque nos lleva exactamente a los problemas.

## Antes de continuar, hablemos de los niveles de optimización de Swift
Dependiendo de si la compilación está en modo Release o modo Debug, el compilador de Swift activará o desactivará las assertions (Las líneas con declaraciones assert se omiten), es bueno conocer los niveles de optimización de Swift antes de continuar.
Hay 3 tipos de nivel de optimización para una compilación en Xcode
- *None (Onone)*: El predeterminado para compilaciones de debug. Compila sin ninguna optimización.
- *Fast (O)*: El predeterminado para compilaciones de release. Compila con optimizaciones.
- *Unchecked (Ounchecked)*: Compila con optimizaciones y elimina las comprobaciones de seguridad en tiempo de ejecución, incluyendo la comprobación de array fuera de límites, desenvolver nil, precondition y preconditionFailure. Por eso no debemos usar el modo `Ounchecked` en compilación de release porque puede llevar a corrupciones de memoria y la aplicación podría comportarse inapropiadamente.

*Actualizaciones*: Como puedes ver, ya no existe el modo `-Ounchecked` en Xcode10, en su lugar se introdujo una nueva opción `Optimize for Size`. La principal diferencia entre el modo `O` y el modo `Osize` es "Cuando se compila con -O, el compilador intenta transformar el código para que se ejecute con el máximo rendimiento. Sin embargo, esta mejora en el rendimiento en tiempo de ejecución a veces puede venir con un compromiso de mayor tamaño de código. Con el nuevo modo de optimización -Osize, el usuario tiene la opción de compilar para un tamaño de código mínimo en lugar de para la máxima velocidad" [(swift.org)](https://swift.org/blog/osize/)
![](/Post-Resources/Crashing/Xcode10-OptimizationLevels.png "Xcode10-OptimizationLevels")

## Aplicar Assertion a Swift
A decir verdad, antes de leer este capítulo del libro, pensaba que "Assertion" solo se usaba al escribir unit tests. El hecho es que los desarrolladores usan Assertion en el desarrollo para hacer el proceso de desarrollo más seguro y fácil para rastrear un error.
Swift proporciona 5 tipos de funciones de assertion que difieren entre sí en términos de cómo afectan el flujo del código:
- *assert() y assertionFailure()*: Úsalos cuando queramos verificar nuestro código, pero si realmente es un problema, no necesariamente saldría de la aplicación. El compilador ignorará las declaraciones assert() y assertionFailure() para una versión de release (En modo -O). Por ejemplo, uso assert para asegurar que no haya solicitudes inesperadas en mi flujo de negocio. Al hacerlo, garantizo que si aparece un "tipo extraño" en mi flujo, el flujo se romperá y la aplicación se terminará. Además, el depurador me llevará directamente al problema para que pueda identificar problemas de lógica y eliminar errores lo antes posible.
![](/Post-Resources/Crashing/Assert.png "Assert en la práctica")
- *precondition() y preconditionFailure()*: Usa estas funciones para detectar una condición que debe cumplirse antes de continuar procesando, incluso en versión de release (modo -O). Por ejemplo, digamos que necesitamos cargar un archivo de configuración cuando la aplicación se inicia. Si no hay archivo de configuración, entonces debemos detener la aplicación inmediatamente en lugar de continuar la ejecución.
```swift
guard let fileConfig = Bundle.main.path(forResource: "config", ofType: "json") else {
    preconditionFailure("Unable to load config file.")
}
```
- *fatalError()*: Lo mismo que las funciones precondition() y preconditionFailure(), excepto que fatalError() funciona para todos los niveles de optimización en todas las configuraciones, significa que tu aplicación SIEMPRE será terminada si se alcanza la línea de fatalError(). En el siguiente ejemplo, uso fatalError() para forzar a cada clase heredada a sobrescribir el `parseData(files:)` de su superclase.
![](/Post-Resources/Crashing/FatalError.png "FatalError en la práctica")

## Consejos destacados del autor
- `"Todos los errores te dan información. Podrías convencerte de que el error no puede suceder, y elegir ignorarlo. En cambio, los Programadores Pragmáticos se dicen a sí mismos que si hay un error, algo muy, muy malo ha sucedido."` Si ocurre un error, ¿podemos recuperarlo? Si no podemos manejar algunos problemas inesperados, entonces falla temprano para proteger nuestros datos vitales (Especialmente en aplicaciones bancarias que requieren alta seguridad para la base de datos).
- `"No pongas assertion en el código de manejo de errores real."` Es un malentendido si ponemos assertion en todas partes del código, particularmente en el código de manejo de errores real. Assertion no está destinado a usarse de esta manera. Si simplemente terminamos un programa en ejecución, afectará la experiencia del usuario, resultando en que los usuarios ya no abrirán tu aplicación. El principio más simple para verificar si debemos salir del programa cuando ocurren errores es `Cuando tu código descubre que algo que se suponía era imposible acaba de suceder, tu programa ya no es viable. Cualquier cosa que haga desde este punto en adelante se vuelve sospechosa, así que termínalo lo antes posible. Un programa muerto normalmente hace mucho menos daño que uno lisiado.`
- `"La condición pasada a un assertion no debería tener un efecto secundario"`. Es vergonzoso si ponemos un código para verificar errores que realmente causa otros errores. Para el siguiente ejemplo, el siguiente código (En Java) tiene agregado assert para asegurar que el siguiente elemento no es nil, pero en realidad crea un nuevo error. ¿Puedes encontrarlo?
```java
while (iter.hasmoreElements () {
    Test.ASSERT(iter.nextElements() != null);
    object obj = iter.nextElement();
    // ....
}
```

## Conclusión
En este artículo, revisamos estos cinco métodos para una salida temprana en Swift. En general, la forma correcta de elegir cuál usar depende del contexto del error: ¿El error puede ser recuperable o no? Si la respuesta es no, entonces fallar es lo mejor que podemos hacer para proteger nuestra aplicación de comportamientos impredecibles. A veces, la aplicación está en una situación donde sería demasiado peligroso continuar.
Espero que hayas encontrado útil esta publicación para que puedas aplicar esta idea a tu próximo proyecto.
¡Gracias por leer!
