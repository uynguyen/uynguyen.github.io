---
title: Protobuf en la practica
date: 2024-01-12 16:07:40
tags:
layout: post
lang: es
---
![](/Post-Resources/protobuf/banner.png "banner")

He trabajado en productos Bluetooth, incluyendo dispositivos wearables y cerraduras inteligentes, durante muchos anos. Facilitar la transferencia de mensajes entre componentes del sistema es un aspecto crucial debido a las diferencias en los lenguajes de programacion, la necesidad de consistencia y las limitaciones en el tamano de transferencia de datos. Para abordar estos desafios, utilizamos [Protocol Buffers](https://github.com/protocolbuffers/protobuf).
Protocol Buffers, tambien conocido como Protobuf, es un formato de datos multiplataforma gratuito y de codigo abierto utilizado para serializar datos estructurados desarrollado por Google. Esta disenado para ser eficiente, extensible y facil de usar. En este tutorial, cubriremos los conceptos basicos de crear un mensaje simple de Protocol Buffers, definir un esquema y generar codigo en varios lenguajes de programacion.

<!-- more -->

## Instalacion
Para instalar el compilador de protobuf, sigue las instrucciones descritas en [protobuf-compiler-installation](https://github.com/protocolbuffers/protobuf#protobuf-compiler-installation).
El uso basico puede resumirse con la imagen a continuacion.

![](/Post-Resources/protobuf/flow.png "flow")

Pasos para configurar:
- Instala el compilador de protobuf. En Mac, usa brew: `brew install protobuf`
- Valida si la instalacion se completo exitosamente: `protoc --version`.
- Instalando el plugin del generador de codigo: Protobuf soporta varios lenguajes de programacion diferentes. Necesitas encontrar e instalar el generador de codigo para el lenguaje especifico dependiendo de que lenguajes de programacion se usen en tu proyecto. Por ejemplo, para Swift, usa `swift-protobuf`: `brew install swift-protobuf`. Para JavaScript, usa `npm install -g protoc-gen-js`.
- Define tus esquemas: Visita [Programming Guides](https://protobuf.dev/programming-guides/proto3/) para aprender como usar el lenguaje de protocol buffer para estructurar tus datos de protocol buffer
```bash example.proto
message Person {
  optional string name = 1;
  optional int32 id = 2;
  optional string email = 3;
}
```
- Compila archivos `.proto` para generar codigo para lenguajes especificos.
```bash
nguyenuy@192  ~/Desktop/protobuf  protoc --js_out=. example.proto
nguyenuy@192  ~/Desktop/protobuf  protoc --java_out=. example.proto
nguyenuy@192  ~/Desktop/protobuf  protoc --cpp_out=. example.proto
nguyenuy@192  ~/Desktop/protobuf  protoc --dart_out=. example.proto
```

- Distribuye (importa) los archivos generados a tus proyectos.
- Instala el plugin de runtime. Por ejemplo, en un proyecto iOS, incluye el framework `SwiftProtobuf` en el `Podfile`. Para proyectos Flutter, agrega `protobuf` al archivo `pubspec.yaml`. Para proyectos ReactJS, incluye `google-protobuf` en el archivo `package.json`.
- Implementa la serializacion y deserializacion:
Ejemplo en Python
```py
person = example_pb2.Person()

# Set values
person.name = "Uy Nguyen"
person.id = 1
person.email = "uynguyen.itus@gmail.com"

# Serialize the message to bytes
serialized_data = person.SerializeToString()

# Parse the bytes back into a message
new_person = example_pb2.Person()
new_person.ParseFromString(serialized_data)
```
Ejemplo en Java
```java
Person person = Person.newBuilder()
    .setName("Uy Nguyen")
    .setId(1)
    .setEmail("uynguyen@gmail.com")
    .build();

// Serialize the message to bytes
byte[] serializedData = person.toByteArray();

// Parse the bytes back into a message
Person newPerson = Person.parseFrom(serializedData);
```
Ejemplo en Swift
```swift
var p = Person()
p.id = 1
p.email = "uynguyen.itus@gmail.com"
p.name = "Uy Nguyen"

// Serialize the message to bytes
let data = try? p.serializedData()

// Parse the bytes back into a message
let converted = try? Person(serializedData: data!)
```

A continuacion se muestra como lucen los archivos generados en diferentes lenguajes.
![](/Post-Resources/protobuf/generated.png "generated")

## Ventajas
- **Formato binario**: `Protobuf` usa un formato binario para la serializacion, que es mas compacto que el formato basado en texto de `JSON`. Esto resulta en tamanos de mensaje mas pequenos, haciendolo mas eficiente en terminos de ancho de banda y almacenamiento.
- **Rendimiento**: Debido a su formato binario y codificacion eficiente, los procesos de serializacion y deserializacion de `Protobuf` son generalmente mas rapidos que `JSON`. Esto puede ser particularmente importante en escenarios con requisitos de alto rendimiento o baja latencia, como sistemas que aplican BLE.
- **Generacion de codigo**: `Protobuf` depende de la generacion de codigo para crear clases de datos en varios lenguajes de programacion basados en el esquema definido. Esto puede llevar a codigo con tipos seguros y eficiente, reduciendo las posibilidades de errores en tiempo de ejecucion relacionados con desajustes en la estructura de datos.
- **Soporte para multiples lenguajes**: Protobuf soporta la generacion de codigo en una variedad de lenguajes de programacion, haciendolo adecuado para proyectos con diferentes tecnologias. Esto permite que diferentes servicios escritos en diferentes lenguajes se comuniquen facilmente usando las mismas estructuras de datos.

## Desventajas
- **Legibilidad humana**: El formato binario de `Protobuf` no es legible por humanos, lo que puede hacer que la depuracion y solucion de problemas sea mas desafiante comparado con `JSON`. El formato de texto plano de `JSON` permite a los desarrolladores inspeccionar los datos facilmente.
- **Complejidad de depuracion**: Debido a la naturaleza binaria de `protobuf`, la depuracion puede ser mas compleja cuando se compara con `JSON`. A menudo se necesitan herramientas especializadas para inspeccionar el contenido de los mensajes codificados en `protobuf`.
- **Menos comun en tecnologias web**: `JSON` es mas prevalente en el desarrollo web y es soportado nativamente por muchas APIs web. Si la interoperabilidad con tecnologias web es una prioridad principal, `JSON` podria ser una opcion mas natural.
- **Complejidad en estructuras anidadas**: Tratar con estructuras anidadas en mensajes `protobuf` a veces puede ser menos intuitivo que en `JSON`. Se debe tener cuidado al disenar estructuras anidadas para evitar complejidad innecesaria.

## Resumen
En resumen, mientras `protobuf` ofrece ventajas significativas en terminos de eficiencia y rendimiento, su adopcion debe considerarse basandose en los requisitos y restricciones especificos del proyecto. Es esencial considerar las ventajas y desventajas y elegir el formato de serializacion que mejor se alinee con los objetivos y restricciones de tu proyecto.

## Referencias
- [Protocol Buffers Documentation](https://protobuf.dev/overview/)
