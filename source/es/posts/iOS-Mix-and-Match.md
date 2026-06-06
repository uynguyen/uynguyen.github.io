---
title: 'iOS: Mix and Match'
date: 2020-01-30 17:33:16
tags:
layout: post
lang: es
thumbnail: /Post-Resources/MixMatch/mix-match-banner.png
---
A medida que Swift se ha convertido en un lenguaje insignia para el desarrollo iOS, la mayoria de los nuevos proyectos iOS hoy en dia se construyen en Swift. Sin embargo, hay muchas bibliotecas utiles que estan desarrolladas en otros lenguajes de programacion de bajo nivel como Objective-C y/o C++ para impulsar el rendimiento. Por otro lado, no todas las posiciones de ingenieria estan abiertas a nuevos proyectos, la mayoria de ellos son contratados para mantener y desarrollar nuevas caracteristicas basadas en el codigo base actual que esta construido en Objective-C.
Tener el conocimiento para mezclar los dos lenguajes dentro de un solo proyecto es bueno para tus habilidades de desarrollo iOS ya que lo enfrentaras algun dia en tu trayectoria profesional. En esta publicacion, te mostrare no solo como usar Objective-C y Swift en un solo proyecto sino tambien como usar un conjunto de lenguajes de programacion en uno solo, incluyendo C++/ Objective-C/ Swift y React Native. Espero que encuentres esta publicacion interesante.
Entremos en materia.
<!-- more -->
## C++ <- Objective-C++
Para aquellos que no han oido hablar de Objective-C++,
Objective-C++ es en realidad un codigo fuente que mezcla clases de Objective-C y clases de C++ en un solo archivo.
Solo necesitas cambiar tu archivo `.m` a `.mm` para que la magia funcione.
Primero, creare una biblioteca de C++ que sera usada por clases de Objective-C++.
```swift
class CPlusPlusMath {
    public:
        int multiplyTwoNumbers(int a, int b);
};
```
La implementacion
```swift
int CPlusPlusMath::multiplyTwoNumbers(int a, int b) {
    return a * b;
}
```
Luego, necesitas crear un archivo bridging header para tu proyecto porque nuestro nuevo proyecto esta en lenguaje Swift.

![](/Post-Resources/MixMatch/bridging-header.png "")

El bridging header es donde defines todas las clases de Objective-C que estan expuestas a Swift. Cuando agregamos una nueva clase de Objective-C al proyecto basado en codigo Swift, XCode automaticamente ofrece agregar este archivo al proyecto.
A continuacion, renombras el archivo `.m` a `.mm` para cambiarlo de codigo Objective-C a Objective-C++.
De ahora en adelante, puedes llamar a nuestra biblioteca de C++ (u otras) dentro de este archivo Objective-C++
```swift
#import "CPlusPlusMath.hpp"

@implementation ObjMath

- (long)multiplyTwoNumbers:(int) num1 num2:(int) num2 {
    CPlusPlusMath *a = new CPlusPlusMath();
    return a->multiplyTwoNumbers(num1, num2);
}

```

## Objective-C++ <-> Swift
Lo interesante es que podemos llamar codigo Objective-C(++) desde codigo Swift y viceversa.
Para usar clases de Objective-C desde Swift, necesitamos declarar sus headers en el archivo bridging header. Adelante e incluyamos nuestra biblioteca matematica en este archivo.
```swift
//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//

#include "ObjMath.h"

```
Eso es todo lo que necesitas hacer para construir la primera linea desde Objective-C a Swift.

```swift
func multiply(num1: Int, num2: Int) -> Int {
    let objMath = ObjMath()
    return objMath.multiplyTwoNumbers(Int32(num1), num2: Int32(num2))
}
```

A continuacion, necesitamos construir la otra linea desde Swift a Objective-C.
Usamos la palabra clave `objc` antes de cualquier clase y metodo que queramos exponer a clases de Objective-C. Una pequena nota es que estas clases expuestas necesitan heredar de la clase `NSObject`. De lo contrario, obtendremos el error de compilacion `Only classes that inherit from NSObject can be declared @objc`.

```swift
@objc
class SwifthMath: NSObject {
    @objc
    func add(num1: Int, num2: Int) -> Int {
        return num1 + num2
    }

    // The rest omited
}
```

## Swift <-> React Native
Por favor encuentra mi serie en [React Native y BLE](/2021/12/25/Series-React-Native-and-BLE-Part-1-Building-BLE-framework-for-iOS/)
## Limitaciones

- Los objetos Swift pueden tener una subclase de una clase de Objective-C, como NSObject. Pero una clase de Swift no puede ser una clase base para una clase de Objective-C.

## Solucion de problemas

## Conclusiones
Muchos desarrolladores todavia usan Objective-C por muchas razones, y definitivamente usan bibliotecas de C++ en sus proyectos, especialmente en el desarrollo de juegos donde C++ alcanza todo su rendimiento.
Espero que esta publicacion te de una vision rapida de como mezclar y combinar multiples lenguajes en un solo proyecto.
Puedes encontrar el proyecto de demostracion en [Github](https://github.com/uynguyen/iOS-Mix-Match)
Gracias por leer.
