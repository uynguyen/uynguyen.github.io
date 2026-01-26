---
title: "Serie React Native y BLE: Parte 1 - Construyendo un framework BLE para iOS"
date: 2021-12-25 18:16:08
tags:
layout: post
permalink: es/posts/Series-React-Native-and-BLE-Part-1-Building-BLE-framework-for-iOS/
lang: es
---

![](/Post-Resources/RN-BLE/cover1.png "")

He estado trabajando en desarrollo móvil tanto en proyectos nativos como en plataformas cruzadas (React Native, Flutter), y también tengo experiencia trabajando con BLE. A veces recibo correos electrónicos preguntando sobre la comunicación de RN/Flutter con BLE. Por eso, decidí introducir esta serie React Native y BLE para guiarte sobre cómo desarrollar un framework BLE nativo y conectarlo a React Native.
Por supuesto, habrá otra serie para Flutter y BLE después de terminar la serie de React Native.
En esta serie, te guiaré a través de un proceso completo desde el desarrollo hasta la distribución.

<!-- more -->

- Crear un framework iOS / Android.
- Script para construir y distribuir tu framework.
- Importar los frameworks a tu proyecto React Native.
- Usar tu framework nativo en React Native.
- Distribuir tu aplicación.
- Y otras cosas interesantes que quiero compartir contigo...

Si te gusta lo que hago, considera apoyarme en [buy a coffee for Uy Nguyen](https://ko-fi.com/uynguyen) :)
Vamos.

> Xcode 13, iOS 15, Swift 5, React 17.0.1, React Native 0.64.1.

### Preparar el framework iOS

El primer paso es crear un framework BLE. Tampoco tienes que crear un framework, puedes incluir tu código fuente dentro del proyecto iOS directamente si lo deseas.
Sin embargo, la razón por la que recomiendo mover toda la lógica BLE a un framework es que es reutilizable, puedes compartir tu framework con otros proyectos como Flutter o proyectos Nativos sin tener que duplicar la lógica.
Otra razón es que mejorará el tiempo de compilación de Xcode, dividir tu aplicación en varios frameworks puede acelerar los tiempos de construcción. Esto es porque el sistema de construcción de Xcode no tiene que recompilar frameworks para los cuales los archivos Swift no han cambiado.

Desde la barra superior izquierda de Xcode, selecciona `File > New > Project > Desde la sección "Framework & Library", selecciona "Framework" > Ingresa el nombre de tu framework (yo uso "BLEFramework")`

![](/Post-Resources/RN-BLE/ios_create_project.png "")

Ahora, puedes desarrollar tu lógica BLE en el proyecto que acabas de crear. No voy a detallar la implementación de todos los métodos individuales del framework ya que depende de tu lógica de negocio y tu arquitectura. Puedes encontrar mis tutoriales anteriores para tener una idea de cómo implementar un framework BLE. [Bluetooth Low Energy OniOS](/2017/10/13/Bluetooth-Low-Energy-On-iOS/), [Play Central And Peripheral Roles With CoreBluetooth](/2018/02/21/Play-Central-And-Peripheral-Roles-With-CoreBluetooth/)
Tomaré un método simple en mi framework BLE como ejemplo: el método `startScanning`.

```swift
/**
Class: CentralManager
*/

/**
* @discussion Start scanning nearby peripherals and returns to the `ScanningDelegate`
*/
public func startScanningFor(delegate: ScanningDelegate, filter: DeviceFilter = DeviceFilter()) throws {
    //... BLE implementation.
}
```

OK ahora tenemos un framework BLE, pasemos al siguiente paso: Construir y distribuir tu framework.

### Construir y distribuir

Hay muchas formas de distribuir un framework como usar [CocoaPod](/2017/09/25/Create-and-Distribute-Private-Libraries-with-Cocoapods), o manualmente enviando un archivo compilado, etc. En esta publicación, te proporcionaré un script para convertir tu framework en un framework universal que oculta toda tu lógica, y puede usarse tanto para dispositivos físicos como simuladores.

Asegúrate de activar la bandera "Build Libraries for Distribution" en "Build Settings" a `YES`. La bandera indica que el compilador debe generar una de las interfaces estables para que el framework pueda usarse cuando se lancen versiones más nuevas de Xcode o el compilador Swift.

![](/Post-Resources/RN-BLE/ios_build_distribution.png "")

A continuación, crea un archivo bash, ponlo en la raíz de la carpeta ios, y copia los siguientes comandos al archivo. Luego ejecuta el script.

```bash
### SCRIPT TO BUILD A SWIFT UNIVERSAL FRAMEWORK

PRODUCT_NAME="REPLACE_BY_YOUR_TARGET_NAME"
BUILD_CONFIGURATION="Release"
DERIVED_DATA_PATH="$(pwd)/build"
RELEASE_DIR="$(pwd)/RELEASE"
BUILD_SCHEME="${PRODUCT_NAME}"
FRAMEWORK_NAME="${PRODUCT_NAME}.framework"

RELEASE_DEVICE_PATH="${RELEASE_DIR}/device/${FRAMEWORK_NAME}"
RELEASE_SIMULATOR_PATH="${RELEASE_DIR}/simulator/${FRAMEWORK_NAME}"

rm -rf "${DERIVED_DATA_PATH}"
rm -rf "${RELEASE_DIR}"

mkdir -p "${DERIVED_DATA_PATH}"
mkdir -p "${RELEASE_DIR}"
mkdir -p "${RELEASE_DIR}/simulator"
mkdir -p "${RELEASE_DIR}/device"

# Build library for simulator
fastlane ios build  scheme:"${BUILD_SCHEME}" \
					configuration:"${BUILD_CONFIGURATION}" \
					sdk:iphonesimulator \
					build_dir:"${DERIVED_DATA_PATH}" \
					--verbose

SIMULATOR_FRAMEWORK_PATH="${DERIVED_DATA_PATH}/Build/Products/${BUILD_CONFIGURATION}-iphonesimulator/${FRAMEWORK_NAME}"
mv "${SIMULATOR_FRAMEWORK_PATH}" "${RELEASE_SIMULATOR_PATH}"

# Build library for iphoneos
fastlane ios build  scheme:"${BUILD_SCHEME}" \
					configuration:"${BUILD_CONFIGURATION}" \
					sdk:iphoneos \
					build_dir:"$DERIVED_DATA_PATH" \
					--verbose

DEVICE_FRAMEWORK_PATH="${DERIVED_DATA_PATH}/Build/Products/${BUILD_CONFIGURATION}-iphoneos/${FRAMEWORK_NAME}"
mv "${DEVICE_FRAMEWORK_PATH}" "${RELEASE_DEVICE_PATH}"

# Merge SDKs
xcodebuild -create-xcframework -output "${RELEASE_DIR}/${PRODUCT_NAME}.xcframework" \
  -framework "${RELEASE_DEVICE_PATH}" \
  -framework "${RELEASE_SIMULATOR_PATH}"

open "${RELEASE_DIR}"
```

Una vez que ejecutes el script exitosamente, deberías ver el resultado como se muestra a continuación

![](/Post-Resources/RN-BLE/ios_build_result.png "")

Donde:

- `YOUR_TARGET_NAME.xcframework`: El framework universal que puede usarse tanto para dispositivos físicos como simuladores.
- carpeta device: contiene `YOUR_TARGET_NAME.framework` que solo puede usarse en dispositivos físicos.
- carpeta simulator: contiene `YOUR_TARGET_NAME.framework` que solo puede usarse en simuladores.

Ahora tenemos un framework BLE para nuestra aplicación, pasemos al siguiente paso - Crear un nuevo proyecto React Native.

### Inicializar proyecto React Native

Para crear un proyecto React Native sin usar Expo (recomiendo no usar Expo porque vamos a agregar mucho código Nativo para Android e iOS a nuestro proyecto, para más detalles puedes consultar [what is the difference between expo and react native](https://stackoverflow.com/questions/39170622/what-is-the-difference-between-expo-and-react-native)), abre el terminal y escribe

```
react-native init projectName
```

Espera un momento para configurar tu proyecto. Después de ejecutar exitosamente, deberías ver la estructura de carpetas como se muestra a continuación:

```
|---projectName
    |---ios
        |---projectName.xcworkspace
    |---android
    |---...Other files, folders
```

Abre el archivo `projectName.xcworkspace`, configuraremos el código nativo en el siguiente paso.

### Conectándolos
Primero, arrastra y suelta el `YOUR_TARGET_NAME.xcframework` a tu espacio de trabajo de Xcode.
Como mi SDK está construido en Swift, voy a crear una clase Swift como puente para que podamos comunicarnos desde el SDK a React Native.
Desde el proyecto Xcode, selecciona `File > New > File > Swift File > Ingresa el nombre de tu archivo (ej. BLEManager) > Add`. Aparecerá un diálogo preguntando si quieres crear un bridging header, selecciona sí.

> Para aquellos que no saben para qué se usa el bridging header, el bridging header es donde defines todas las clases Objective-C que están expuestas a Swift.

![](/Post-Resources/RN-BLE/bridging-header.png "")

Para usar clases RCT, asegúrate de hacer `#import` de todos los headers relacionados a tu `...-Bridging-Header.h`. De lo contrario, obtendrás errores de compilación.

```swift
#import <React/RCTBridgeModule.h>
#import "React/RCTEventEmitter.h"
#import "React/RCTViewManager.h"
#import <React/RCTLog.h>
```

A continuación, agrega la interfaz `RCTEventEmitter` a la clase `BLEManager` que acabamos de crear en el paso anterior.

```swift
@objc(BLEManager) <--- Remember to add this [1]
public class BLEManager: RCTEventEmitter, ScanningDelegate {
  static let didFoundDeviceEvent = "didFoundDevice"

  @objc <--- Remember to add this
  public static let shared = BLEManager()

  override init() {
    super.init()
    _ = BLEWrapper.shared
  }

  @objc(startScanning) <--- Remember to add this
  func startScanning() {
    BLEWrapper.shared.startScanning(self)
  }

  public func managerDidFoundDevice(_ manager: CentralManager, device: Device, rssi: Int) {
    self.sendEvent(withName: Self.didFoundDeviceEvent, body: ["name": device.localName, "rssi": rssi]) [2]
  }

  public override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override public func supportedEvents() -> [String]! {
    return [Self.didFoundDeviceEvent] [3]
  }
}
```

[1] Asegúrate de decorar tu clase y funciones con la palabra clave `@objc` para asegurar que la clase y funciones se exporten correctamente al runtime de Objective-C.
[2] Una vez que se descubre un periférico, envía un evento a Javascript.
[3] Registra el soporte de eventos del módulo nativo.

Finalmente, para exponer los métodos de tu módulo nativo, crea un nuevo archivo `BLEManager.m` y agrega el siguiente código.

```swift
@interface RCT_EXTERN_MODULE(BLEManager, RCTViewManager)

RCT_EXTERN_METHOD(startScanning)

@end
```

Eso es todo. Javascript ahora puede invocar la función `startScanning` y escuchar el evento `didFoundDeviceEvent`.

### Pruebas
Es hora de probar nuestra implementación, React Native proporciona instancias `NativeEventEmitter` y `NativeModules` que te permiten trabajar con módulos nativos.
Desde la carpeta raíz, abre `App.js` e importa las cosas necesarias.

```swift
import {
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
const {BLEManager} = NativeModules; <-- You can then access the BLEManager native module
```

En el método `componentDidMount`, agrega lo siguiente

```swift
componentDidMount() {
    let beaconManagerEmitter = new NativeEventEmitter(BLEManager); [1]
    this.didFoundDevice = beaconManagerEmitter.addListener( [2]
        'didFoundDevice',
        data => {
        console.log(data);
        },
    );
    setTimeout(() => {
        BLEManager.startScanning(); [3]
    }, 3000); // Just to make sure the Bluetooth is on, we will improve it later
}
```

[1] Crea una nueva instancia de NativeEventEmitter y escucha el evento `didFoundDevice` [2]
[3] Porque aún no soportamos el evento de cambios de estado de Bluetooth, temporalmente retrasamos 3s antes de llamar al escaneo solo para asegurar que el Bluetooth está encendido. Lo mejoraremos más tarde soportando más eventos y métodos.

OK, vamos a construir y ejecutar tu proyecto. Si ves tu consola de log imprimiendo los resultados del proceso de escaneo, felicitaciones, ¡lo hiciste bien!
![](/Post-Resources/RN-BLE/Scan-Result.png "")

### Siguiente paso
En esta publicación, te mostré cómo crear un framework BLE y cómo usar un módulo nativo BLE en un proyecto React Native como invocar un método desde Javascript a Swift y manejar un evento desde Swift a Javascript. En el siguiente tutorial, haremos lo mismo en la plataforma Android.
Si enfrentas algún problema, no dudes en contactarme. Me encantaría ayudar.
Felices fiestas.

### Referencias
[1] [React Native - Native module ios](https://reactnative.dev/docs/native-modules-ios)
