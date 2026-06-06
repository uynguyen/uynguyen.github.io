---
title: Fork y publicar tu biblioteca personalizada en npm - React Native Wheel Picker
date: 2022-03-26 10:00:26
tags:
layout: post
lang: es
thumbnail: /Post-Resources/npm/cover.png
---


Cuando desarrollamos una nueva característica de nuestro software, tendemos a buscar si hay una biblioteca o framework "similar" disponible en la comunidad para reutilizarla. A nadie le gusta reinventar la rueda, ¿verdad? Sin embargo, la biblioteca que más se ajusta a nuestros requisitos a veces no soporta una característica que necesitas o solo una propiedad personalizada. Puedes abrir un pull request al repositorio original, pero puede tomar tiempo y depende del autor si aprueba tus cambios o no. En ese caso, puedes crear tu propia biblioteca desde la original, lo llamamos proceso "Fork".
En este post, resumiré brevemente los pasos para publicar una biblioteca en `npm`, y te contaré sobre una situación que enfrenté al usar la `biblioteca React Native Wheel Picker`.

<!-- more -->

Es bastante simple publicar una biblioteca en `npm`. Solo necesitas hacer los siguientes pasos:
1. Asegúrate de tener una cuenta de `npm`. Ve a `https://www.npmjs.com` para registrar una cuenta si no tienes una.
2. Después, inicia sesión en tu cuenta en tu computadora a través de la línea de comandos `npm login`.
![](/Post-Resources/npm/signin.png "")
3. Para verificar qué usuario ha iniciado sesión, usa `npm whoami`.
4. [La biblioteca](https://www.npmjs.com/package/@gregfrench/react-native-wheel-picker) que uso para mi proyecto soporta un componente `Wheel Picker`, pero ha sido deprecada, y no soporta establecer el color del elemento seleccionado en Android. Además, quiero crear mi propia biblioteca para poder agregar más características fácilmente después. Así que decidí hacer fork y personalizar mi propio wheel picker. Para hacer fork de una biblioteca, ve al repositorio de la biblioteca que quieres modificar, luego presiona el botón `fork` en la esquina superior derecha.
![](/Post-Resources/npm/fork.png "")

5. Después de hacer fork exitosamente, deberías ver el repositorio en tu dashboard. Luego, clona el código a tu computadora, y agrega tus nuevas características.
En mi caso, necesito agregar una nueva característica que soporte establecer el color para el elemento seleccionado (Consulta [este PR](https://github.com/GregFrench/react-native-wheel-picker/pull/7/commits/b8bf478f3e4ffb7fb5be4e2f524e730678775e50))
![](/Post-Resources/npm/fork-repo.png "")

6. Cuando termines tu modificación, haz commit de tus cambios.
7. Actualiza la información del repositorio en el archivo `package.json` si es necesario (Autor, versión, descripción, etc.).
8. Finalmente, ejecuta `npm publish --access public` para entregar tu increíble biblioteca.
![](/Post-Resources/npm/publish.png "")

Es hora de probar la nueva biblioteca. Si instalas la nueva biblioteca `@uynguyen505/react-native-wheel-picker` e intentas usarla, deberías ver el resultado como se muestra abajo.

![](/Post-Resources/npm/result.png "")

¡Feliz fin de semana!

## Referencias
1. [Creating and publishing scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
2. [Forking, Modifying, and Publishing NPM Packages — For those almost-perfect packages](https://brandontle.com/writing/forking-modifying-and-publishing-npm-packages/)
