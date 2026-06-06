---
title: 'Reseña del libro: Building Applications With iBeacon'
date: 2020-06-14 21:13:41
tags: [Books, Study, BLE, iBeacon]
layout: post
lang: es
thumbnail: /Post-Resources/ibeacons/ibeacon-cover.png
---
En [la publicación anterior](/2018/08/18/Best-practice-iBeacon/), básicamente te di un vistazo rápido a iBeacon - Un protocolo Bluetooth construido sobre BLE por Apple, e hice una demostración simple de cómo iBeacon puede despertar una aplicación después de ser terminada por el usuario. Sin embargo, no mencioné otros conceptos fundamentales en Beacon, tampoco te di una visión profunda de las ventajas y desventajas de esta poderosa tecnología.
Hoy, me gustaría presentarte un buen libro que proporciona un conocimiento sólido en el campo de Beacon, especialmente iBeacon: `Building Applications With iBeacon` publicado por O'Reilly.
Después de leer este libro, te aseguro que obtendrás un buen conocimiento en el campo de iBeacon y tu mente estará más abierta a las próximas ideas.
¡Empecemos!
<!-- more -->

## Contenido principal
El libro se enfoca principalmente en desarrolladores que buscan una forma eficiente de integrar el protocolo beacon a sus aplicaciones. Para usar el libro eficientemente, te recomiendo que tengas algún conocimiento previo de BLE ya que iBeacon está construido sobre BLE.
Al principio, el libro describe una breve historia de las tecnologías de *proximidad* en particular. También explica por qué y cuándo usarlas en algunas circunstancias específicas.
Las dos principales razones para usar iBeacon son, primero y ante todo, `las tecnologías GPS luchan por hacer mejor que unos pocos metros, y GPS frecuentemente está limitado en interiores. Los iBeacons pueden permitir una determinación dentro de centímetros`. La segunda es `los iBeacons ofrecen micro-localización de alta precisión, junto con la capacidad de actuar según lo que está cerca de un dispositivo móvil. Ninguna otra tecnología ofrece todavía esa combinación.`
Para convencer al lector, el libro compara GPS versus Beacon, en otras palabras ubicación versus proximidad; dando algunas limitaciones de la tecnología GPS actual, el escritor muestra algunas áreas en las que Beacon es muy superior a GPS.
A continuación, el libro explica cómo funciona el protocolo Beacon internamente; te presenta los términos fundamentales y cómo interactúan entre sí.
Finalmente, en algunos capítulos, el libro te guía sobre cómo configurar tus propios beacons en Mac OS, dispositivos móviles o computadoras pequeñas como Ras. Pi o Arduino.

## Conceptos clave
- La relación entre iBeacons, beacons genéricos, beacons BLE y dispositivos BLE se describe a continuación

<div style="text-align:center">

![](/Post-Resources/ibeacons/Beacon-RelationShip.png "Beacon Relationship")

</div>

> Los iBeacons son un subconjunto de la especificación de beacons BLE. Todos los iBeacons son beacons BLE, y todos los beacons BLE son dispositivos BLE. Sin embargo, hay beacons que no están basados en Bluetooth, y hay dispositivos BLE que no son beacons.


- Un iBeacon necesita ser configurado con su tupla numérica identificadora (UUID, número major y número minor).
Identificador de Beacon = UUID + Major + Minor.
- En Core Location, una región es un espacio en el que se recibe una combinación específica de UUID, número major y número minor.
- Core Location soporta tres tipos de filtrado de una región:
    + Solo UUID: cualquier iBeacon instalado que coincida con el uuid.
    + UUID más número major: Como la opción de solo UUID, es probable que coincida con varios iBeacons, muy probablemente instalados en una ubicación particular.
    + UUID más números major y minor: Esta opción coincidirá solo con un iBeacon específico.

![](/Post-Resources/ibeacons/Regions.png "Beacon Regions")

- El siguiente código ilustra cómo definir esas tres regiones en Swift, respectivamente.
```swift
let region1 = CLBeaconRegion(uuid: "uuid1", identifier: "Your region's name 1")
let region2 = CLBeaconRegion(proximityUUID: "uuid2", major: 1, identifier: "Your region's name 2")
let region3 = CLBeaconRegion(proximityUUID: "uuid3", major: 1, minor: 0, identifier: "Your region's name 3")
```

### iOS e iBeacon: Apple proporciona dos acciones principales cuando se trabaja con iBeacon
#### **Monitoreo**
El monitoreo proporciona una capacidad de suscripción a la aparición de una región, que se combina con uno o más beacons.
Un evento `in` y `out` se disparará cuando un dispositivo entre o salga de una región, respectivamente.

- Se realiza tanto en primer plano como en segundo plano en iOS, se usa para determinar cuándo un dispositivo ha entrado o salido del área de cobertura de un iBeacon. Uno de los mayores beneficios de usar beacon es que las regiones son rastreadas por el sistema operativo, no por la aplicación. Incluso cuando las aplicaciones no están ejecutándose (terminadas por el SO o forzadas a cerrar por el usuario), el SO puede relanzar la app para manejar los eventos. Después de volver al segundo plano, la app tiene unos segundos para ejecutar sus tareas (Alrededor de 10s).
- El administrador de ubicación define un método para `didEnterRegion`, que se llama cuando un dispositivo cruza el límite para entrar a una región
- El administrador de ubicación define un método para `didExitRegion`, que se llama cuando un dispositivo cruza el límite para salir de una región.

Limitaciones del monitoreo
- iOS solo puede monitorear hasta 20 regiones en una sola aplicación como se describe en la documentación de Apple
> Las regiones son un recurso del sistema compartido, y el número total de regiones disponibles en todo el sistema es limitado. Por esta razón, Core Location limita a 20 el número de regiones que pueden ser monitoreadas simultáneamente por una sola app" [Apple doc](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/LocationAwarenessPG/RegionMonitoring/RegionMonitoring.html).
- El sistema también tarda algún tiempo en disparar el evento de salida, en la práctica es alrededor de 30 ~ 40s.

#### **Ranging**
Usa sus transmisiones para estimar la distancia desde un dispositivo móvil hasta un beacon. Un uso común de las operaciones de ranging es determinar qué iBeacon está más cerca de esta área.
El administrador de ubicación disparará el método `didRangeBeacons` después de hacer ranging exitosamente, una lista de iBeacons que tienen datos de ranging se pasará al método delegado, junto con la región en la que fueron detectados. También proporciona el indicador de intensidad de señal recibida (RSSI) para estimar un rango en metros (Es una propiedad del objeto CLBeacon).

Limitación del ranging:
- Una desventaja principal de las operaciones de ranging es que requiere mucha más actividad en el hardware Bluetooth y consume energía significativa, porque la interfaz Bluetooth está mucho más activa cuando hace ranging

## Lo que me gusta
- Nunca pensé que el tema de iBeacon sería escrito como un libro completo pero el autor lo hizo muy bien: El libro describe iBeacon con una explicación profunda.
- Clarifica los términos fundamentales que se usan comúnmente en la tecnología beacon.
- Analiza los pros y contras de iBeacon con ejemplos.
- Presenta otras aplicaciones de beacon en las que nunca había pensado antes, lo cual abre mucho mi mente:
    + Ubicación en interiores y proximidad: Reemplazo de mapas, asistencia de tránsito, búsqueda de direcciones en interiores, ¿dónde está mi carro?, guías de museo, mejora de tiendas minoristas.
    + Acciones activadas por proximidad: Anuncios móviles, validación de boletos, búsqueda del tesoro, integración de información del paciente.
    + Gestión de colas: Medición de colas, paginador de mesas de restaurante, completar transacciones en retail.
- Fácil de entender: el contenido está bien organizado, es fácil seguir el flujo del contenido.

## Lo que no me gusta
No hay nada de qué quejarse del libro, desde el contenido hasta la forma.

## En general
Existen muchas tecnologías para ayudar a los teléfonos a interactuar con el mundo que los rodea. Este libro te presenta iBeacons, una tecnología Bluetooth que permite a un dispositivo descubrir sujetos cercanos con una precisión relativamente alta. No hay duda de que las aplicaciones de beacon se aplican cada vez más ampliamente en muchos campos, especialmente en marketing y publicidad.
Desde mi punto de vista, deberías leer el libro para que puedas abrir tu mente sobre iBeacon. Tal vez tu próxima startup se construya sobre Beacon, ¿quién sabe?
En el próximo tutorial, te llevaré a la práctica con iBeacon en iOS, también te presentaré algunas técnicas para tratar con iBeacon en un análisis profundo.
Si tienes alguna pregunta o comentario sobre esta publicación, ¡no dudes en contactarme!
