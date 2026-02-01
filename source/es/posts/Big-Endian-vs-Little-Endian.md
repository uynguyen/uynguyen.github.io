---
title: Big Endian vs Little Endian
date: 2018-04-30 10:51:30
tags: [Swift, Objective-C, iOS]
layout: post
lang: es
---
![](/Post-Resources/Endian/cover.png "Endian cover")
En ciencias de la computacion, un bit es la pieza de informacion mas pequena. Representa un digito del sistema numeral binario. Una cadena de 8 bits se llama un byte. Hay dos formas de almacenar una cadena de datos en computadoras: Big Endian y Little Endian. Si tus tareas trabajan con datos en piezas de bytes, debes saber como tratar con bytes en estos dos formatos. En este articulo, explicare como se almacenan los datos en las computadoras, cuales son las principales diferencias entre estos dos, y luego proporcionare algo de codigo util para trabajar con bytes en Swift y Objective-C.
<!-- more -->
## Conceptos basicos
Para entender Big Endian y Little Endian, necesitas saber que son el *Byte Menos Significativo (LSB)* y el *Byte Mas Significativo (MSB)*. El LSB es el bit mas a la derecha en una cadena, se llama asi porque tiene el menor efecto en el valor del numero binario. En contraste, el byte mas a la izquierda es el MSB que lleva el mayor valor numerico.
Despues de entender estos dos, es facil distinguir entre Big Endian y Little Endian:
- En Big Endian, el MSB de los datos se coloca en el byte con la direccion mas baja.
- En Little Endian, el LSB de los datos se coloca en el byte con la direccion mas baja.

Eso es todo!
![](/Post-Resources/Endian/Endian-Overview.png "Endian overview")
<center></center>

## Las ventajas de Big Endian y Little Endian en una arquitectura de computadora
Segun [Wiki](https://en.wikipedia.org/wiki/Endianness), Big Endian es "el formato mas comun en redes de datos", muchos protocolos de red como TCP, UDP, IPv4 e IPv6 estan usando el orden Big Endian para transmitir datos. Little Endian se usa principalmente en microprocesadores. Pero el punto es por que hacen eso?
Bueno, cuando trabajaba con el orden de bytes en iOS, tambien me hice la pregunta a mi mismo y a mis colegas, "por que hacen eso?", "Por que eligen Big Endian en lugar de Little Endian?". Despues de investigar en internet, y obtener respuestas de un ingeniero senior de firmware en mi oficina, gradualmente entendi las ventajas de ambas formas de orden.
Las ventajas de Little Endian son:
- Es facil leer el valor en una variedad de tamanos de tipo. Por ejemplo, la variable `A = 0x13` en valor de 64 bits en memoria en la direccion B sera `1300 0000 0000 0000`. A siempre se leera como `19` independientemente de usar lecturas de 8, 16, 32, 64 bits. Por el contrario, en Big Endian tenemos que saber en que tamano hemos escrito el valor para leerlo correctamente.
- Es facil convertir el valor a un tipo mas pequeno como de int16_t a int8_t ya que int8_t es el byte al principio de int16_t.
- Es facil hacer calculos matematicos "debido a la relacion 1:1 entre el desplazamiento de direccion y el numero de byte (desplazamiento 0 es byte 0), las rutinas matematicas de precision multiple son correspondientemente faciles de escribir."

Algunas ventajas principales de Big Endian son
- Siempre podemos probar si el numero es positivo o negativo mirando el byte en el desplazamiento cero, por lo que es facil hacer una comparacion.
- Los numeros tambien se almacenan en el orden en que se imprimen, por lo que las rutinas de binario a decimal son particularmente eficientes.


## Orden de bytes en iOS

Tanto Swift como Objective-C soportan metodos que nos ayudan a leer y escribir datos en las dos formas Little Endian y Big Endian. Las siguientes secciones demuestran como usamos estos metodos para interactuar con datos en memoria.

### Orden de bytes en Objective-C

```obj-c
NSString *strData = @"001E653A";
NSData *data = [NSData dataWithHexString:strData];
uint8_t *bytes = (uint8_t *)data.bytes;

/* Functions for loading little endian to host endianess. */
uint16_t firstInLittle = OSReadLittleInt16(bytes, 0); // 0x1E00 = 7680
uint16_t secondInLittle = OSReadLittleInt16(bytes, 2); // 0x3A65 = 14949

uint16_t firstInBig = OSReadBigInt16(bytes, 0); // 0x001E = 30
uint16_t secondInBig = OSReadBigInt16(bytes, 2); // 0x653A = 25914

/* Functions for storing host endianess to little endian. */
uint8_t byte16[2];
OSWriteLittleInt16(byte16, 0, firstInLittle); // byte16 = [0x00, 0x1E]
```

### Orden de bytes en Swift

```swift
let strData = "3A651E00"
if let data = strData.hexadecimal() {
    let bytesArr = [UInt8](data)

    /* Functions for loading native endian values. */
    let little = _OSReadInt16(bytesArr, 0) // 0x653A = 25914
    let big = first.bigEndian // 0x3A65 = 14949

    /* Functions for storing native endian values. */
    let bytes = [UInt8](repeating: 0, count: 2)
    _OSWriteInt16(UnsafeMutableRawPointer(mutating:bytes), 0, second) // bytes = [0x65, 0x3A]
}
```

## Pensamientos finales
En este articulo, te mostre las diferencias entre los formatos de endianness y proporcione algo de codigo util para trabajar con bytes en iOS. Si tienes alguna sugerencia, solo hazmelo saber.
Feliz fin de semana.
