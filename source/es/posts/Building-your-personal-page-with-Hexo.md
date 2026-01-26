---
title: Construyendo tu página personal con Hexo
date: 2020-04-27 20:56:51
tags: Hexo
layout: post
permalink: es/posts/Building-your-personal-page-with-Hexo/
lang: es
---
![](/Post-Resources/Hexo/Cover.png "Hexo")
Cuando construí este sitio personal, mi primer objetivo es disfrutar mi hobby de escribir. Escribo lo que aprendo durante mi trabajo diario, y lo comparto. Espero que lo que comparto ayude a alguien cuando lo necesite. A cambio, tendré una comprensión profunda de lo que escribo, y a veces, recibiré "una taza de café" (Buy me Coffee) de un amigo que nunca he conocido.
> **El poder se gana compartiendo conocimiento, no acaparándolo**

Algunos amigos vienen a mí preguntando cómo construir una página como la mía. Estoy feliz de compartir contigo cómo la construí.
Después de este tutorial, podrás construir tu propio sitio en 5 minutos.
¡Espero ver tu página lanzada pronto!

<!-- more -->
## Configurar herramientas

### [NodeJs para mac](https://nodejs.org/en/download/)
Navega a la página de NodeJS, descarga e instala el paquete de NodeJs para macOS.
Para aquellos que no saben qué es NodeJs, NodeJs es un entorno de ejecución de JavaScript de código abierto y multiplataforma (OS X, Window, Linux) para escribir código del lado del servidor en Javascript.
Al usar el modelo de I/O no bloqueante, NodeJS es una gran opción para aplicaciones en tiempo real, chat, streaming de datos, etc.
Con una gran comunidad, el ecosistema de paquetes de NodeJs es cada vez más variado y eficiente, haciendo que NodeJS se convierta en una de las mejores tendencias de desarrollo en los últimos años. Puedes encontrar más información de NodeJs en internet si te parece interesante.
### [Hexo](https://hexo.io)
Hexo es un framework de blog potenciado por NodeJs. Las características de simplicidad y rapidez de Hexo lo hacen dominar entre otros frameworks de blog como Hugo, Wordpress, Grav, etc.
Elegí Hexo para construir mi blog porque estoy familiarizado con los comandos de NodeJS. Además, Hexo proporciona muchos temas que puedes integrar fácilmente a tu blog con personalización completa.
Después de instalar NodeJs exitosamente, abre tu terminal y escribe las siguientes líneas
```bash
npm install hexo-cli -g [1]
hexo init blog [2]
cd blog [3]
npm install [4]
hexo server [5]
```
Aquí está el paso a paso:
1. Instalar la línea de comandos de hexo como un comando global.
2. Crear la carpeta de tu blog.
3. Moverte a la carpeta.
4. Instalar las dependencias de node.
5. Ejecutar tu servidor.

Hexo se ejecutará en `localhost:4000` por defecto. Ahora abre `http://localhost:4000` en tu navegador para ver el resultado.
![](/Post-Resources/Hexo/Blog.png "Blog")

## Personalizar tu sitio web
En la raíz de tu carpeta, hay un archivo `_config.yml` que contiene las configuraciones de tu página. Puedes modificar cosas como el título de la página, el autor de la página, el formato de los artículos, etc. Para más información, por favor consulta los documentos de Hexo.

## Empezar a escribir
Para crear un nuevo artículo, escribe
```bash
hexo new "My first blog"
```
Aquí, creas un post llamado "My first blog". Recarga tu navegador, verás el resultado.
![](/Post-Resources/Hexo/New_Post.png "New Post")

Ten en cuenta que Hexo usa [sintaxis Markdown](https://en.wikipedia.org/wiki/Markdown) para la edición, así que asegúrate de estar familiarizado con la sintaxis Markdown.

## Temas
La comunidad de Hexo proporciona muchos temas que puedes elegir según tu preferencia y personalizar este tema como tuyo. Te ahorra mucho tiempo gracias a la gran comunidad.
Navega a [Hexo themes](https://hexo.io/themes/) y encuentra el que te guste, sigue sus instrucciones para descargarlo a la carpeta de tu blog.
Luego, modifica el archivo `_config.yml`, busca y reemplaza la configuración `themes` con el nombre de tu nuevo tema.
```bash
theme: whatever
```

## Despliegue
Al usar la línea de comandos `hexo generate`, Hexo generará automáticamente todos tus archivos estáticos que puedes subir a tu servidor y distribuirlos a tus usuarios.
En caso de que no tengas un servidor propio, ¡no te preocupes! Hay muchos servidores de hosting gratuitos por ahí. Puede que hayas oído hablar de [Github page](https://pages.github.com). Básicamente, Github page proporciona hosting gratuito y dominio para tu página, como la mía "uynguyen.github.io". Si quieres usar Github page como tu host, por favor sigue las instrucciones para crear tu repositorio de github page.
Después de tener tu propio repositorio, instala `npm install hexo-deployer-git` que te permite desplegar tu sitio.
Luego, edita el archivo `_config.yml`, desde la sección "deploy" > agrega la información de tu objetivo de despliegue
```bash
deploy:
  type: git
  repo: <repository url>
  branch: [branch]
  message: [message]
```

A partir de ahora, una vez que termines de escribir, puedes publicar tus posts mediante el comando
```bash
hexo clean && hexo deploy
```

También puedes usar Heroku para el despliegue en lugar de usar github. Para más información, por favor consulta [Hexo deployment](https://hexo.io/docs/one-command-deployment.html)

## Conclusión
Si quieres una página personal simple para compartir tus ideas y contenidos, Hexo y Github page se convierten en una gran herramienta para ti. Con su simplicidad y su comunidad, es fácil de configurar, permitiéndote enfocarte en lo que importa: Tu compartir.
Espero que encuentres útil este post.
