---
title: 'Dark Hat - v1.0 ha sido lanzado'
date: 2021-07-25 19:35:30
tags:
layout: post
lang: es
---

![](/Post-Resources/Darkhat/darkhat.png "")

Después de años trabajando en tecnología BLE, descubrí que a pesar de que hay muchas aplicaciones que ayudan a probar dispositivos BLE, ninguna de ellas cumple bien su función. Por eso decidí implementar una aplicación BLE por mi cuenta - [Dark Hat](https://apps.apple.com/az/app/dark-hat/id1576175854?ign-mpt=uo%3D2). El objetivo principal de esta aplicación es compartir una mejor herramienta contigo, un ingeniero que trabaja en el campo de BLE.
<!-- more -->
## Características Principales
`Descubre dispositivos cercanos` con `múltiples filtros soportados` para mostrar solo los dispositivos que importan al usuario.
- Filtrar por RSSI.
- Filtrar por nombre del dispositivo.
- Filtrar por UUID de servicio: Solo recupera y escanea dispositivos que tengan tu UUID de servicio.
<center>
<img src="/Post-Resources/Darkhat/scanning.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/filters.jpg" alt="" style="width:200px;"/>
</center>

Soporta muchas opciones en la configuración que permiten a los usuarios personalizar la aplicación para cumplir con sus requisitos.
- `Gestión de estado`: Reconexión automática cuando se pierde la conexión.
- `Preservación y Restauración`: El usuario ahora puede optar por probar "Preservación y Restauración". Para más detalles sobre esta técnica, consulta [Mejores prácticas: Cómo manejar Bluetooth Low Energy en segundo plano](/2018/07/23/Best-practice-How-to-deal-with-Bluetooth-Low-Energy-in-background/)
- Los pasos en el flujo de conexión ahora son `controlados por el usuario`: tiempo de espera de conexión, establecer estado de notificación y más.

<center>
<img src="/Post-Resources/Darkhat/setting.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/state_management.jpg" alt="" style="width:200px;"/>
</center>

La pantalla principal muestra `toda la información y servicios` que realmente te importan.
`La vista de registro en línea` te ayuda a tener una mejor observación de lo que está sucediendo en tu dispositivo.
La aplicación también ofrece una opción que permite al usuario establecer su propio nombre para las características para una mejor visualización, activar | desactivar notificaciones, copiar UUID al portapapeles, y más.
<center>
<img src="/Post-Resources/Darkhat/inline_log.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/channel_option.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/channel_options.jpg" alt="" style="width:200px;"/>
</center>

La aplicación soporta `un editor inteligente` que sugiere automáticamente todos los comandos recientes - una pequeña mejora pero que ayuda a reducir tu tiempo de pruebas.
La pantalla de detalle de características ahora ofrece una opción que permite `mostrar todas las respuestas de múltiples características` lo que te ayuda a captar todo el flujo durante las pruebas.

<center>
<img src="/Post-Resources/Darkhat/channel.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/sugesstion.jpg" alt="" style="width:200px;"/>
</center>

<br />

`Fácil de compartir`: Comparte tu resultado con solo 1 clic.

<center>
<img src="/Post-Resources/Darkhat/response.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/sharing.jpg" alt="" style="width:200px;"/>
</center>

## Arquitectura

En el corazón de esta aplicación hay un SDK llamado `BLEFramework` - implementado por mí - que envuelve toda la lógica de trabajo con el framework BLE de Apple y proporciona interfaces simples para las capas de alto nivel - la aplicación. Al hacerlo de esta manera, podemos separar la lógica compleja de la aplicación de UI, facilitando el desarrollo y mantenimiento.
Además, planeo mover todas las vistas de UI a una tecnología multiplataforma (quizás React Native) para soportar Android en una capa de vista única y unificada. Todo lo que necesito hacer es crear otro SDK que soporte la plataforma Android.

![](/Post-Resources/Darkhat/arch.png "")

## Próximos pasos
Tengo una hoja de ruta para agregar más características increíbles a la aplicación, por nombrar algunas: transmisión de datos en tiempo real, medición de velocidad, conexiones múltiples, control por script, iBeacons.
No puedo esperar para entregar todas estas características geniales a los usuarios.
Si tienes alguna idea o comentario, no dudes en enviar un correo electrónico a uynguyen.itus@gmail.com o dark.hat.ble@gmail.com, me encantaría saber de ti.

