---
title: Beta Test y TestFlight
date: 2020-04-14 21:25:25
tags:
layout: post
permalink: es/posts/Beta-Test-and-TestFlight/
lang: es
---
![](/Post-Resources/TestFlight/Cover.png "TestFlight")
Como desarrollador iOS, probablemente hayas escuchado sobre TestFlight - un producto de Apple que te permite distribuir tus aplicaciones a usuarios beta. Entonces, ¿qué podemos hacer con él? ¿Es útil?
En este tutorial, recorreremos los pasos para subir un build a TestFlight e invitar usuarios a probar tu aplicación.
También necesitas referirte a la publicación anterior [Enviando tu aplicación a la Store](/2018/12/13/Shipping-your-iOS-app-to-Store/) para completar este tutorial.
¡Divirtámonos!
<!-- more -->
## ¿Qué es TestFlight?
TestFlight es un producto de Apple que permite a los desarrolladores distribuir sus aplicaciones a usuarios beta antes de pasar a producción. Con la última actualización de la aplicación TestFlight en iOS 13, los testers pueden dar retroalimentación directamente desde la aplicación con capturas de pantalla, crashes y otra información útil proporcionada. Usar TestFlight es una excelente manera de ayudar a probar tus aplicaciones y mejorar el rendimiento antes de que salgan en vivo.
TestFlight proporciona dos tipos de testers:
- Tester Interno: Permite hasta 25 miembros de tu equipo que hayan sido asignados a un rol específico para probar tu aplicación. Cada miembro puede probar en hasta 30 dispositivos. Una vez que un build beta se envía a App Store Connect y está disponible para pruebas, los testers internos serán notificados para que puedan actualizar la aplicación.
- Tester Externo: Puedes invitar hasta 10,000 testers usando solo su dirección de correo electrónico o compartiendo un enlace público.

La principal diferencia entre los dos es que para permitir que un Tester Externo pruebe tu aplicación, debes enviar tu aplicación a Apple para revisión. El proceso de revisión es el mismo que un envío oficial pero generalmente es más rápido que las revisiones normales de aplicaciones. Por contrato, probar tu aplicación con testers internos no requiere revisión por parte de Apple.

## Seleccionar build para pruebas
Después de completar el paso final en [Enviando tu aplicación a la Store](/2018/12/13/Shipping-your-iOS-app-to-Store/), tu aplicación se ha enviado exitosamente a App Store Connect. Ahora, navega a tu [página de desarrolladores de Apple](https://developer.apple.com) e inicia sesión con tu Apple Id, luego selecciona "My Apps" para ver todas las aplicaciones disponibles > Selecciona una aplicación específica > Desde la barra de herramientas superior > Selecciona TestFlight > Verás todos los builds que están disponibles para pruebas.
La siguiente imagen te da una vista rápida del panel de TestFlight

![](/Post-Resources/TestFlight/TestFlight_Board.png "TestFlight_Board")

Desde la ventana principal, puedes ver todas las versiones disponibles de tu aplicación; cuándo expiran; cuántas invitaciones se enviaron; cuántas instalaciones tuvieron éxito. etc.
Para agregar nuevos usuarios, haz clic en "App Store Connect Users" en la barra lateral izquierda > Presiona el botón "+" > Luego completa la información de tu tester incluyendo su App Id. Después de eso, puedes agregar tu tester a tu build.

## Aplicación TestFlight
Los testers necesitan instalar la aplicación TestFlight en su dispositivo. Esta aplicación es gratuita y está disponible en la App Store.
<div style="text-align:center">
<img src="/Post-Resources/TestFlight/TestFlight.jpeg"/>
</div>

Después de agregar tus testers al build, los testers usarán su correo electrónico de invitación o un enlace público para inscribirse en las pruebas.
Abre la aplicación TestFlight, el tester necesita iniciar sesión con su App Id. Después de eso, verán todas las aplicaciones disponibles que pueden instalar, que es igual que en la App Store. Una pequeña nota es que verás un pequeño punto naranja cerca del nombre de la aplicación para indicar que este build se instaló desde TestFlight. Fácil, ¿no?
<div style="text-align:center">
<img src="/Post-Resources/TestFlight/TestFlightApp.jpeg"/>
</div>

Desde ahora en adelante, cuando un build de esta aplicación esté disponible, tu tester recibirá una notificación y un correo electrónico de TestFlight. Luego pueden actualizar esta aplicación a través de TestFlight y disfrutar de la última versión.

## Después de las pruebas
Cuando hayas terminado las pruebas, puedes detener la aplicación de las pruebas, y luego ir a publicar una aplicación para el proceso de enviar tu aplicación a la App Store. Tu build beta dejará de estar disponible en TestFlight después de 90 días por defecto.
En esta publicación, tuvimos una vista rápida de TestFlight y cómo distribuir tu prueba beta a tus testers. En la práctica, las pruebas beta son un término común en el proceso de desarrollo de software. Tener conocimiento de cómo distribuir tu aplicación será útil en algunas situaciones.
¡¡¡Feliz programación!!!
