---
title: Enviando tu aplicación iOS a la Store
date: 2018-12-13 17:34:08
tags:
layout: post
lang: es
---
![](/Post-Resources/Delivery/delivery.png "Delivery")

Enviar tu aplicación a la Apple Store no es tan simple como presionar un botón "mágico" que hace todo, pero tampoco es tan complicado como piensas. Quizás es tu primera vez lanzando tu primera aplicación, y no has tenido la oportunidad de familiarizarte con el proceso de envío antes. Este tutorial paso a paso te mostrará el flujo principal para enviar aplicaciones desde cero hasta ser un experto. Ten en cuenta que necesitas tener una Cuenta de Desarrollador de Pago para completarlo.
¡Comencemos!
<!-- more -->
## Certificados, app Ids y perfiles de aprovisionamiento
Para enviar tu aplicación a la App Store, necesitas entender qué son los certificados, app IDs y perfiles de aprovisionamiento. Básicamente, un certificado de distribución identifica a tu equipo/organización dentro de un perfil de aprovisionamiento de distribución y te permite enviar tu aplicación a la Apple App Store. La siguiente imagen describe la relación entre ellos.

<div style="text-align:center">
<img src="/Post-Resources/Delivery/Certificates.png" />
</div>

### Crear un Certificado de Distribución
1. En tu Mac, abre la aplicación **Key Chain Access**.
2. Ve a Certificate Assistant > Request a Certificate From a Certificate Authority.

![](/Post-Resources/Delivery/Generate_P12_1.png "Create CSR")

3. Ingresa tu correo electrónico en el campo de email.

![](/Post-Resources/Delivery/Generate_P12_3.png "Create CSR")

El Keychain Access creará una clave privada, que se almacena en el keychain, y un archivo `.certSigningRequest` que se subirá a Apple. Apple emitirá un certificado para ti basado en el `.certSigningRequest`. El Certificado contiene la clave pública. Después de eso, puedes descargar el archivo y abrirlo. La clave pública se agregará al Keychain y se emparejará con la clave privada para crear la "Code Signing Identity".

Para que sepas qué es CSR
>*Un CSR o Certificate Signing Request es un bloque de texto codificado que se entrega a una Autoridad de Certificación cuando se solicita un Certificado SSL. Generalmente se genera en el servidor donde se instalará el certificado y contiene información que se incluirá en el certificado, como el nombre de la organización, nombre común (nombre de dominio), localidad y país. También contiene la clave pública que se incluirá en el certificado. Una clave privada generalmente se crea al mismo tiempo que se crea el CSR, formando un par de claves.*

4. Después de tener el archivo `.certSigningRequest`, ve a la [página de desarrolladores de Apple](https://developer.apple.com), inicia sesión con tu Cuenta de Apple > Certificates, Identifiers & Profiles > Presiona el botón "+" para crear una nueva certificación > Recuerda seleccionar la opción "iOS Distribution (App Store and Ad Hoc)".

![](/Post-Resources/Delivery/Create_Certificate_1.png "Create Certificate")

5. A continuación, selecciona para subir tu archivo `.certSigningRequest` que acabas de crear en el paso 3.

![](/Post-Resources/Delivery/Create_Certificate_2.png "Create Certificate")

6. Finalmente, ahora puedes descargar el archivo del Certificado a tu Mac, ábrelo y la clave se agregará al keychain automáticamente.

![](/Post-Resources/Delivery/Create_Certificate_3.png "Create Certificate")

Eso es todo para crear un Certificado de Distribución, pasemos al siguiente paso, crear tu app id.

### Crear App Id
1. Presiona el botón "+" en la página "All Identifiers"
![](/Post-Resources/Delivery/Create_App_Id_1.png "Create App Id")

2. Completa la información de tu aplicación, incluyendo tu bundle Id. Ten en cuenta que este bundle id debe coincidir con tu bundle id en XCode. También puedes usar el patrón wildcard para definir bundle Id para más de un app Id.
![](/Post-Resources/Delivery/Create_App_Id_3.png "Create App Id")

### Crear Perfil de Aprovisionamiento
1. Presiona el botón "+" en la página "Profiles", luego selecciona la opción "App Store".
![](/Post-Resources/Delivery/Provisioning_Profile_1.png "Create Provisioning Profile")

2. Selecciona tu app Id que acabas de crear en el paso anterior, Crear App Id.
![](/Post-Resources/Delivery/Provisioning_Profile_2.png "Create Provisioning Profile")

3. Selecciona tu Certificado que acabas de crear en el paso anterior, Crear un Certificado de Distribución
![](/Post-Resources/Delivery/Provisioning_Profile_3.png "Create Provisioning Profile")

Ahora tienes un perfil que vincula tu Certificado y tus app Ids. Descarga este archivo y ábrelo. Los Perfiles de Aprovisionamiento se agregarán a XCode automáticamente.

### Subiendo
Es hora de subir tu aplicación a la Store.
Regresa a tu proyecto, desde la Barra de Herramientas Superior > Product > Archive, XCode reconstruirá tu proyecto. Después de eso, el XCode Organizer se iniciará y mostrará todos los archives que has creado en el pasado.
Selecciona el build actual, luego haz clic en "Distribute App" en el panel de la derecha.

![](/Post-Resources/Delivery/Uploading_1.png "Uploading")

La siguiente ventana te permite seleccionar tus credenciales incluyendo el Certificado de Distribución y los Perfiles de Aprovisionamiento que creaste en la primera sección. Finalmente, presiona el botón de subir, XCode hará el resto por ti.

![](/Post-Resources/Delivery/Uploading_2.png "Uploading")

Se te enviará un correo electrónico para notificarte justo después de que Apple complete el proceso de procesamiento, generalmente toma algunos minutos.
Tu aplicación ha sido subida exitosamente a tu Perfil de iTunes, vamos al paso final.

### Enviando
Navega a [App Store Connect](https://appstoreconnect.apple.com), selecciona "My Apps". verás tu aplicación aparecer en la página.

![](/Post-Resources/Delivery/Submission.png "Submission")

Necesitas preparar la siguiente información para completar en estas páginas:
- Nombre de la Aplicación, URL de Política de Privacidad, Clasificación de Edad, Categoría.
- Capturas de pantalla en diferentes tamaños: Esto podría tomarte la mayor parte del tiempo, tus capturas de pantalla necesitan cumplir con los requisitos de Apple en [Screenshot specifications](https://help.apple.com/app-store-connect/#/devd274dd925). Ten en cuenta que los usuarios verán estas capturas de pantalla relacionadas con sus dispositivos actuales, así que asegúrate de que tus fotos sean atractivas y llamativas tanto como puedas. Fastlane también soporta tomar capturas de pantalla automáticamente, puedes encontrar la [documentación](https://docs.fastlane.tools/getting-started/ios/screenshots/) si estás interesado. ¡Las herramientas de Fastlane pueden automatizar este proceso haciéndolo rápido y consistente mientras te dan hermosos resultados!
- Descripción de la versión, palabras clave, URL de soporte.
- **Si tu aplicación requiere inicio de sesión, completa la información de cuenta con nombre de usuario y contraseña.**
- Notas de la aplicación: Algunas notas importantes que quieres enviar al revisor para asegurar que funcione correctamente. (ej. recomendamos encarecidamente usar el servicio con conexión Wifi para mejor calidad)
- Adjunto: Es mejor tener una demostración corta de tu aplicación.
- Información de contacto: Si hay algún problema, Apple te contactará a través de esta información.

Has terminado. Ahora presiona el botón "Submit" para iniciar el proceso de revisión.

## Proceso de revisión
Tu proceso de revisión toma algo de tiempo para completarse, puede ser un par de días a un par de semanas dependiendo de la categoría de tu aplicación, características, y... el revisor.
Si tu aplicación viola las reglas de Apple como usar APIs privadas no aprobadas, falta de descripción de permisos, fallas o bajo rendimiento, será rechazada. Al final, tenemos que aceptar que Apple tiene la última palabra para permitir cualquier cosa en la App Store. Solo porque pienses que tu aplicación es genial no significa que Apple la permitirá en la App Store. Yo mismo experimenté este proceso estricto-aleatorio-emocional al enviar mi aplicación. El primer envío fue sin problemas. El segundo, que actualizaba algo de UI, fue rechazado porque Apple piensa que mi aplicación contiene una característica que no está permitida en la App Store. Con muchos correos electrónicos y llamadas telefónicas, finalmente tuve que eliminar esta característica de mi aplicación. (?!)

## Palabras finales
En esta publicación, te guié sobre cómo enviar tu aplicación a la Store en un paso muy detallado. Espero que esta publicación ahorre tu tiempo al entregar tus increíbles aplicaciones a los usuarios. No puedo esperar.
En la próxima publicación, te mostraré los pasos para subir tu aplicación a Google Play.
¡Feliz programación!
