---
title: 'Reseña del Libro: Clean Code'
date: 2017-10-20 04:09:39
tags: [books, study]
layout: post
lang: es
---
Este es un libro que me regaló hace mucho tiempo un antiguo colega, que también es uno de mis amigos cercanos. Este es uno de los libros de software que más me gustan pero que no tuve oportunidad de comprar cuando era estudiante.
![](/Post-Resources/CleanCode/CleanCode.jpg "Clean code")
<!-- more -->
# Introducción
Sobre el autor, Robert C. Martin, es considerado uno de los ingenieros más veteranos en la industria del software. Tiene muchos años de experiencia trabajando en el campo del software en diversas posiciones, desde desarrollador, gerente, hasta CEO. Es conocido principalmente por escribir guías de software que describen principios de software, patrones de software y prácticas de software. Ha publicado muchos libros como Clean Coder, Clean Code, Clean Architecture, etc. Clean Code es uno de los libros de software que muchos ingenieros de software en el mundo recomiendan leer.
El autor dijo que *"Con el tiempo, el desorden se vuelve tan grande, tan profundo y tan alto, que no pueden limpiarlo"*. Necesitamos leer y pensar mucho antes de escribir código. Debemos evitar escribir código con prisa. Apresurarse a escribir código malo llevará a gastar más tiempo después en mantenimiento. Clean Code se enfoca en los aspectos técnicos: instruye al programador sobre cómo organizar el código y escribir código limpio. No aprenderás ningún framework nuevo, pero te proporcionará un conjunto fundamental de reglas de estilo de codificación. Vale la pena leer el libro.

# El contenido del libro
El contenido del libro se divide en tres partes: Los primeros capítulos explicarán los principios, patrones y prácticas para escribir código limpio. La segunda parte consiste en muchos casos de estudio, cada caso de estudio es un ejercicio de transformación de código que tiene algunos problemas en código que tiene menos problemas. La última parte es el desenlace.

## ¿Por qué código limpio?
Bjarne Stroustrup (Inventor de C++): `Elegante`, `Eficiente`.
Grady Booch (Autor de Object Oriented Analysis): `Legibilidad`.
David Thomas (Fundador de OTI): `Fácil de mejorar por otras personas`.
Warn Cunningham (Inventor de Wiki): `Hacer que el lenguaje parezca simple`.
Yo: `Para poder recordar lo que escribiste hace un mes`.

## Criterios de evaluación de código limpio

### General
- No te repitas: La duplicación puede ser la raíz de todo mal en el software. Muchos principios y prácticas han sido creados con el propósito de controlarla o eliminarla. A veces podemos usar el patrón `Template method` para eliminar la duplicación de nivel superior.

### Nombrado de variables, métodos, argumentos, clases, archivos
- El nombre de una variable, función o clase debe responder la pregunta de por qué existe, qué hace y cómo se usa.
- Usa nombres que se puedan buscar.
- Las clases y objetos deben tener nombres de sustantivos o frases nominales. Los métodos deben ser un verbo o frase verbal.
- Inconsistencia: Ten cuidado con las convenciones que elijas, y una vez elegidas, continúa siguiéndolas.

### Comentarios
- Los comentarios deben decir cosas que el código no puede decir por sí mismo: Explica la idea en el código, si no se puede, entonces escribe comentarios.
- Los comentarios deben reservarse para notas técnicas sobre el código y el diseño.
- Usa gramática y puntuación correctas.
- No comentes código, elimínalo.

### Funciones
- Las funciones deben ser pequeñas: Menos de 100 líneas. Esto hace que la función sea más fácil de leer y entender.
- Las funciones deben hacer solo una cosa.
- Las funciones deben tener un número pequeño de argumentos (Menos de 4 argumentos).
- No pases valores booleanos como argumentos.
- Las funciones que nunca se llaman deben eliminarse.
- Separa el procesamiento de errores del procesamiento normal.
- Encapsula los condicionales.

### Manejo de errores
- El manejo de errores es importante, pero si oscurece la lógica, está mal.
- No retornes `Null`: Considera lanzar una excepción o retornar un objeto `SPECIAL CASE` en su lugar. Si codificas de esta manera, minimizarás la posibilidad de `NullPointerException` y tu código será más limpio.
- No pases `Null` como argumentos.

### Límites
- Envolviendo APIs de terceros: Minimiza tu dependencia de ellas.
- Cuando hay nuevas versiones del paquete de terceros, debemos ejecutar las pruebas para ver si hay diferencias de comportamiento.
- Evita que demasiado de tu código conozca los detalles particulares de terceros: Usa un `Adapter` para manejarlo.

### Clases
- Una clase debe ser pequeña: La medimos por responsabilidades. (Lo conocemos como el principio SRP)
- El código debe colocarse donde un lector naturalmente esperaría encontrarlo. (¿Dónde debería ir la constante `PI`? ¿Debería estar en la clase `Math`? ¿O quizás en la clase `Circle`?).
- Ten cuidado al crear métodos estáticos. Un método estático no opera en una sola instancia. Todos los datos que el método usa provienen de sus argumentos, y no de ninguna instancia de esta clase. Además, asegúrate de que no haya posibilidad de que quieras que se comporte polimórficamente.

### Concurrencia
- Hay algunas definiciones básicas que debemos conocer cuando hablamos de concurrencia y hilos: Recursos limitados, exclusión mutua, inanición, deadlock y livelock.
- La concurrencia no siempre mejora el rendimiento. A veces incurre en cierta sobrecarga y los errores que provienen de ella usualmente no son repetibles.
- Limita el acceso a los datos que se comparten entre más de dos hilos. Usa copias de datos si hay oportunidad.
- Mantén las secciones sincronizadas lo más pequeñas posible porque los bloqueos crean retrasos y agregan sobrecarga. Son costosos.
- El código multihilo se comporta de manera diferente en diferentes entornos: Ejecuta las pruebas en cada entorno de despliegue potencial.

# Lo que me gusta
- El conocimiento en este libro es útil. Totalmente puede aplicarse a la realidad. Después de leer el libro, mi estilo de codificación ha cambiado mucho.
- El libro es fácil de entender y seguir. Leerás mucho código, tendrás desafíos para pensar qué está bien de ese código y qué está mal.
- Después de cada capítulo, el autor resume las ideas principales. Me ayuda a recordar los puntos principales por más tiempo.

# Lo que no me gusta
- El autor usa código Java como ejemplos en el libro. A veces para entender las ideas del autor tenemos que investigar más sobre conceptos de Java. (Spring framework, JUnit framework, tipos de excepciones, etc.)
- Las ideas del autor están duplicadas en algunos capítulos.

# En general
Por supuesto, en el alcance del artículo, no puedo describir completamente las ideas del autor. Este es un buen libro que recomiendo, especialmente para desarrolladores junior que se graduaron recientemente. Ya que en la escuela, los profesores pueden no enseñarnos cómo se llama código limpio, tus estilos de codificación no son evaluados. De hecho, tu código puede funcionar correctamente pero no ser limpio.
Si puedes permitirte comprar este libro para que puedas consultarlo cuando lo necesites, será muy útil.
"Estás leyendo este libro por dos razones. Primero, eres un programador. Segundo, quieres ser un mejor programador."

![](/Post-Resources/CleanCode/Introduction.JPG "Clean code")
