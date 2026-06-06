---
title: 'Serie React Native y BLE: Parte 2 - Construyendo un framework BLE para Android'
date: 2022-02-13 10:57:24
tags: [BLE, Bluetooth, Android]
layout: post
lang: es
thumbnail: /Post-Resources/RN-BLE/cover2.png
---

Cuando se trata de tecnología móvil, iOS y Android son los dos sistemas operativos dominantes que impulsan la mayoría de smartphones y tablets en todo el mundo. Como desarrolladores, es esencial que tengamos el conocimiento y las herramientas para trabajar con ambas plataformas de manera efectiva. Esto es especialmente cierto cuando se trata de utilizar la tecnología Bluetooth, que es un componente crucial de muchas aplicaciones móviles modernas.
En la parte 1 de esta serie de tutoriales, creamos un framework BLE (Bluetooth Low Energy) que podía conectarse a la UI usando React Native. Sin embargo, este framework solo funcionaba en iOS, lo que significaba que necesitábamos desarrollar una solución separada para Android.
En la parte 2 de esta serie de tutoriales, nos enfocaremos en definir un nuevo SDK para Android y vincularlo a la UI, tal como hicimos en iOS. Esto nos permitirá soportar completamente ambos sistemas operativos y proporcionar una experiencia Bluetooth fluida para todos los usuarios, independientemente de su dispositivo de elección.
<!-- more -->

## Crear nuevo SDK de Android
El primer paso es crear tu propia biblioteca Bluetooth. Normalmente, los ingenieros tienden a usar una biblioteca de código abierto como [RxAndroidBle](https://github.com/dariuszseweryn/RxAndroidBle) o [Android-BLE-Library powered by Nordic](https://github.com/NordicSemiconductor/Android-BLE-Library). Sin embargo, el objetivo principal de este tutorial es guiarte sobre cómo crear un nuevo módulo Android y vincularlo a React Native. Esto no solo aplica a Bluetooth sino también a cualquier biblioteca que necesites usar en tu aplicación. El otro objetivo es obtener conocimiento fundamental de Android BLE en caso de que necesites modificar algo o crear tu propia característica que no ha sido soportada en el mercado.

Al crear tu propia biblioteca Bluetooth, tienes la libertad de personalizar y adaptar la biblioteca a tus necesidades específicas. Esto puede proporcionar ventajas significativas sobre usar bibliotecas preexistentes, ya que puedes optimizar la biblioteca para tu caso de uso particular y evitar posibles problemas de compatibilidad.

Desde tu proyecto, ve a `File > New > New Module > Completa la información`.
Se agregará una nueva biblioteca a tu proyecto.

![](/Post-Resources/RN-BLE/android_import_module.png "")
![](/Post-Resources/RN-BLE/android_new_module.png "")

Una cosa muy diferente de Android e iOS es que desde Android 6.0, Google requiere que el `Location Permission` esté habilitado para el escaneo Bluetooth Low Energy (Ver más [Android 6.0 Changes](https://developer.android.com/about/versions/marshmallow/android-6.0-changes.html#behavior-hardware-id)).

A continuación, agrega los siguientes permisos a tu `AndroidManifest.xml` en `android/app/src/main/AndroidManifest.xml`

```java
   <uses-permission android:name="android.permission.BLUETOOTH" />
   <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

``` Important note:
Android 12 update:
From Android 12 (API level 31+):
- Google requires new permission for scanning nearby devices:
   + If your app looks for Bluetooth devices, such as BLE peripherals, declare the BLUETOOTH_SCAN permission.
   + If your app communicates with already-paired Bluetooth devices, declare the BLUETOOTH_CONNECT permission.
- If your app does not use Bluetooth scan results for physical location, you can skip declaring location permission by adding `android:usesPermissionFlags`
```

Para propósitos de demostración, el SDK expone solo 2 APIs simples `startScan` para comenzar a escanear dispositivos cercanos e `isBluetoothOn` para verificar si el Bluetooth está encendido.
```
/*
Start scanning nearby devices.
Accept `callback` as param and return found devices via `callback`
*/
fun startScan(callback: (device: Device) -> Unit)
```

```
/*
Check if BLE is ready for scanning
*/
fun isBluetoothOn() : Boolean
```

Para solicitar permisos en React Native, vamos a usar este módulo https://github.com/zoontek/react-native-permissions para obtener los permisos que la aplicación necesita.

## Construir y lanzar módulo SDK de Android
A continuación, distribuyamos el módulo para que otras aplicaciones puedan usarlo.
Desde la carpeta raíz, ejecuta `./gradlew kTrackingSDK:assembleRelease` para generar un archivo .aar.
El archivo de salida estará ubicado en `./KTrackingSDK/build/outputs/aar`, luego puedes importar el archivo .aar al proyecto `android`.

## Conectar a la parte de React Native
Ahora, ya tenemos la biblioteca Bluetooth. El siguiente paso es vincular el módulo a la parte de React Native.

Primero, la parte de React Native necesita entender el módulo Nativo. Agrega la siguiente configuración a tu `/src/main/java`
```java
class BLEManager(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
   init {
      Log.d("BLEManager", "Init package")
      BLEManagerLib.shared.config(context)
   }

   override fun getName(): String {
        return "BLEManager"
   }

   @ReactMethod
   fun isBluetoothOn(promise: Promise) {
      promise.resolve(BLEManagerLib.shared.isBluetoothOn())
   }

   @ReactMethod
   fun startScanning() {
      Log.d("BLEManager", "Start scanning")
      BLEManagerLib.shared.startScan {
         val params: WritableMap = Arguments.createMap()
         params.putString("name", it.name)
         params.putInt("rssi", it.rssi)
         params.putString("address", it.address)
         this.reactApplicationContext
                  .getJSModule(RCTDeviceEventEmitter::class.java)
                  .emit("didFoundDevice", params)
      }
   }
}
```

Creando un nuevo archivo para definir el `BLEManagerPackage`

```java
class BLEManagerPackage: ReactPackage {
   override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> {
      val modules = ArrayList<NativeModule>()
      modules.add(BLEManager(reactContext))
      return modules
   }

   override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<ViewManager<View, ReactShadowNode<*>>> {
      return ArrayList()
   }
}
```

A continuación, agrégalo a la lista de paquetes en `MainApplication.java`
```java
public class MainApplication extends Application implements ReactApplication {
   ...
   @Override
   protected List<ReactPackage> getPackages() {
      Log.d("BLEManager", "Running");
      @SuppressWarnings("UnnecessaryLocalVariable")
      List<ReactPackage> packages = new PackageList(this).getPackages();

      /* Add your custom modules here */
      packages.add(new BLEManagerPackage());
      /* */

      return packages;
   }
   ...
}

Finalmente, la aplicación necesita pedir a los usuarios que otorguen permisos.

```js
// somewhere in your code
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

checkPermission = () => {
   check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
   .then((result) => {
      if (result !== RESULTS.GRANTED) {
         requestLocation(() => {
            // On granted
         }, () => {
            // On denied
         });
      }
   })
   .catch((error) => {
      // …
   });
}

requestLocation = (grantedCallback, deniedCallback) => {
   request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(result => {
   switch (result) {
      case RESULTS.DENIED:
         console.log('User denied permission',);
         deniedCallback();
         break;
      case RESULTS.GRANTED:
         console.log('The permission is granted');
         grantedCallback();
         break;
   }
   });
}
```

## Resultado
Dado que usamos el mismo código para Android e iOS en la parte de React Native, no hay necesidad de modificar el código de React Native del tutorial anterior. Mientras sigas el protocolo que definimos, todo debería funcionar según lo previsto.

Al mantener un protocolo consistente en ambas plataformas, podemos asegurar que el código sea fácilmente portable y que cualquier cambio realizado en una plataforma no afecte a la otra. Esto puede simplificar significativamente el proceso de desarrollo y reducir el riesgo de errores o problemas de compatibilidad.

![](/Post-Resources/RN-BLE/android_scan_result.png "")

## Conclusión
Después de pasar incontables horas investigando y experimentando, finalmente hemos aprendido cómo crear nuestra propia biblioteca Bluetooth y usarla en nuestro proyecto React Native. Con este nuevo conocimiento, el proceso de agregar nuevas características se ha vuelto significativamente más fácil y eficiente. Solo necesitamos implementar la lógica en Código Nativo en lugar de tener que desarrollar la parte de UI dos veces.

Esto no solo nos ha ahorrado una tremenda cantidad de tiempo y esfuerzo, sino que también nos ha permitido enfocarnos más en mejorar la funcionalidad de nuestra aplicación. Ahora podemos dedicar más recursos a desarrollar nuevas características, optimizar las existentes y mejorar la experiencia general del usuario.

Además, nuestra nueva capacidad de crear bibliotecas personalizadas ha abierto un mundo completamente nuevo de posibilidades para nuestro equipo de desarrollo. Ahora podemos aprovechar nuestro conocimiento de React Native para crear características aún más avanzadas e innovadoras, todo mientras mantenemos un proceso de desarrollo simplificado.

¡Feliz codificación!

## Referencias
- [Android Native Modules](https://reactnative.dev/docs/native-modules-android).
- [Android Bluetooth permissions](https://developer.android.com/guide/topics/connectivity/bluetooth/permissions).
