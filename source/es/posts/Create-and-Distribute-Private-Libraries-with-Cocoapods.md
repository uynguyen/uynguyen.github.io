---
title: Crear y Distribuir Bibliotecas Privadas con Cocoapods
date: 2017-09-25 11:38:40
tags: iOS
layout: post
lang: es
thumbnail: /Post-Resources/PrivatePod/PrivatePod.png
---

[CocoaPods](https://cocoapods.org/) es un gestor de dependencias para proyectos Swift y Objective-C. Esta herramienta no solo nos permite integrar fácilmente esas dependencias, sino que también nos permite crear nuestras propias bibliotecas. En esta publicación voy a guiarte sobre cómo crear una biblioteca privada y distribuirla a tu equipo privado sin publicar la biblioteca.
<!-- more -->
# Inicializar repositorios
Ve a [Github](https://github.com/) o [Bitbutket](https://bitbucket.org/), luego crea dos repositorios. Uno para nuestro código fuente que se comparte entre nuestro equipo, el otro para Podspec, que define toda la información sobre ese Pod.

![](/Post-Resources/PrivatePod/InitGit-Source.png "")
<center>Imagen 1. Crear repositorio Github para almacenar nuestro código fuente</center>

![](/Post-Resources/PrivatePod/InitGit-Spec.png "")
<center>Imagen 2. Crear repositorio Github para almacenar nuestros archivos Podspec</center>

Siguiendo las instrucciones en la página de Github, te guía sobre cómo agregar tu proyecto a estos repositorios.

```bash
$ echo "# MyAwesomeKit-Spec" >> README.md
$ git init
$ git add README.md
$ git commit -m "first commit"
$ git remote add origin git@github.com:uynguyen/MyAwesomeKit-Spec.git
$ git push -u origin master
```

# Crear nuestra propia biblioteca
Abre XCode y crea un nuevo Cocoa Touch Framework llamado `MyAwesomeKit`. Después de eso, crea una clase simple llamada `HaHaHaManager`, esta clase define nuestros métodos públicos para los clientes. Para hacerlo más fácil, defino un método simple, que toma 2 números como argumentos y luego retorna su suma:

```obj-c
public class HaHaHaManager {
    public init() { }
    public func awesomeFunction(a: Int, b: Int) -> Int {
        return a + b
    }
}
```

*Nota: Dado que estamos creando un Framework público, tenemos que sobrescribir el constructor por defecto de la clase `HaHaHaManager`, haciéndolo público. De lo contrario, nuestros clientes que usen este Framework no podrán crear una instancia de esta clase porque el alcance por defecto de las clases en Swift es internal.*

Después, envía nuestro código al repositorio que creamos en el primer paso. Asegúrate de agregar un tag como versión para este commit.

```bash
$ git add .
$ git commit -m "Our first commit"
$ git tag MyAwesomeKit_1.0.0
$ git push -u origin master --tags
```

# Agregar tu Repositorio Privado a tu Instalación de CocoaPods
Usa el siguiente comando para crear tu nuevo repositorio privado en tu CocoaPods
```bash
$ pod repo add REPO_NAME SOURCE_URL
```

```bash
$ pod repo add MyAwesomeKit https://github.com/uynguyen/MyAwesomeKit
```

Asegúrate de tener los derechos de acceso correctos al repositorio. Puedes configurar ssh para acceder al repositorio a través de clave ssh. Ver también: [Generating a new SSH key and adding it to the ssh-agent](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)
Para verificar si tu instalación fue exitosa, usa los siguientes comandos:
```bash
$ cd ~/.cocoapods/repos/MyAwesomeKit
$ pod spec lint . --allow-warnings
```
Este comando se usa para validar especificaciones. El flag `--allow-warnings` indica que omitimos todas las advertencias al validar el archivo Pod. (Faltan algunas opciones como licencia, autor o descripción).

# Generar nuestro archivo Podspec

Escribe el comando para generar nuestro archivo Podspec. Este archivo contiene toda la información sobre nuestro código, incluyendo el repositorio git, la versión de la biblioteca, dependencias, etc.

```bash
$ pod spec create MyAwesomeKit
```

Verás algo como esto

```bash
Pod::Spec.new do |s|
  s.name             	= "MyAwesomeKit"
  s.version          	= "1.0.0"
  s.summary          	= "An awesome KIT can do anything for you"
  s.homepage         	= "https://github.com/uynguyen/MyAwesomeKit"
  s.author           	= { "Uy Nguyen" => "uynguyen.itus@gmail.com" }
  s.source           	= { :git => "git@github.com:uynguyen/MyAwesomeKit.git", :tag => "MyAwesomeKit_#{s.version}" }
  s.platform     		= :ios, '8.0'
  s.requires_arc 		= true
  s.dependency 'AFNetworking', '~> 3.1.0' [1]
  s.source_files 		= "MyAwesomeKit/**/*.{swift}" [2]
  s.frameworks 			= 'UIKit', 'CoreText' [3]
  s.library 			= 'z', 'c++'
  s.module_name 		= 'MyAwesomeKit'
end
```

Esto es lo que está pasando:
* 1: Las dependencias de tus otros Podspecs. Para más de una dependencia, agrega una nueva línea para definirla.
* 2: Los archivos fuente que se incluirán. (Reemplázalo por .m, .mm, .c o .cpp si lo necesitas)
* 3: Los frameworks que están vinculados con tu biblioteca.

Para otras opciones, por favor consulta [Podspec Syntax Reference](https://guides.cocoapods.org/syntax/podspec.html)


Enviar al Repositorio Spec

```bash
$ pod repo push MyAwesomeKit MyAwesomeKit.podspec  --allow-warnings
```

La estructura de tu carpeta será así

```bash
.
├── MyAwesomeKit-Spec
    └── MyAwesomeKit
        └── 1.0.0
            └── MyAwesomeKit.podspec
```

Cada vez que actualices la biblioteca, tienes que ejecutar el comando de actualización para actualizar tus repositorios Pod
```bash
$ pod repo update
```

# Usar nuestro increíble Kit

Es hora de usar nuestro poderoso Kit. Abre XCode y crea un nuevo proyecto llamado `MyAwesomeApp`. Después de eso, escribe el siguiente comando para inicializar el archivo Pod
```bash
$ Pod init
```
Abre el archivo Pod, agrega el siguiente código para instalar nuestra biblioteca.

```bash
# Uncomment the next line to define a global platform for your project
source 'git@github.com:uynguyen/MyAwesomeKit-Spec.git'
source 'https://github.com/CocoaPods/Specs.git'
platform :ios, :deployment_target => '8.0'
target 'MyAwesomeApp' do
  # Comment the next line if you're not using Swift and don't want to use dynamic frameworks
  use_frameworks!
  pod 'MyAwesomeKit', '1.0.0'
  # Pods for MyAwesomeApp
  target 'MyAwesomeAppTests' do
    inherit! :search_paths
    # Pods for testing
  end
  target 'MyAwesomeAppUITests' do
    inherit! :search_paths
    # Pods for testing
  end
end
```
Veamos nuestros resultados (Recemos y esperemos que funcione bien)
![](/Post-Resources/PrivatePod/Result.png "")

# Conclusión
Acabamos de publicar nuestro primer Pod privado para nuestro equipo. Desde ahora, nuestro equipo puede usar esta biblioteca de forma privada. Además, es fácil actualizar y distribuir la biblioteca cuando se actualiza. ¡Gracias a CocoaPod!
Si tienes alguna pregunta o comentario sobre la publicación, no dudes en enviarme un correo electrónico.
# Referencias

[1] [Private Pods](https://guides.cocoapods.org/making/private-cocoapods.html)

