---
title: React Native en Mi Mundo Real
date: 2017-12-01 11:46:47
tags: [ReactNative, CrossPlatform]
layout: post
lang: es
---
![](/Post-Resources/ReactNative/Banner.jpg "Banner")
React Native fue presentado en enero de 2015 en React.js Con: La primera vista previa pública. En marzo de 2015, React Native se abre y está disponible en Github. Después de su lanzamiento, React Native rápidamente se volvió popular y es constantemente actualizado por miles de desarrolladores en el mundo. Actualmente, React Native es uno de los [repositorios con más estrellas](https://github.com/search?p=2&q=stars%3A%3E1&s=stars&type=Repositories) en Github.
<!-- more -->
# Threads

# Rendimiento

# Módulos nativos

```bash
$ react-native run-ios --simulator 'iPad Pro (9.7 inch)'
$ react-native run-ios --device 'qa'
$ react-native run-ios --configuration Release --device 'qa'
```

```swift
#import <React/RCTBridgeModule.h>
@interface RCT_EXTERN_MODULE(SDKWrapper, NSObject)
RCT_EXTERN_METHOD(supportedEvents)
RCT_EXTERN_METHOD(startScanning)
RCT_EXTERN_METHOD(stopScanning)
RCT_EXTERN_METHOD(playAnimation)
RCT_EXTERN_METHOD(connectToDevice:(NSString *)serialNumber:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject) //Promise
RCT_EXTERN_METHOD(disConnectToDevice:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject) //Promise
@end
```


```java
public class SDKWrapper extends ReactContextBaseJavaModule
{
	public SDKWrapper(ReactApplicationContext reactContext)
	{
		super(reactContext);
	}
	@Override public String getName()
	{
		return "SDKWrapper";
	}
	@ReactMethod public void startScanning() {. . .}
}
```


```javascript
import {NativeModules} from 'react-native';
const {SDKWrapper} = NativeModules;
....
SDKWrapper.doSomething();
SDKWrapper.saySomething();
....
```

![](/Post-Resources/ReactNative/Native_Module_Work_Flow.png "El flujo de trabajo de los módulos nativos")


# Ventajas y desventajas

## Ventajas

* Rendimiento nativo

* Aprende una vez, ejecuta en todas partes

* Flex box

* Hot reloading

* Detección de plataforma en código

## Desventajas

* No es estable, difícil de mantener al día

* Falta de documentación

* Thread dedicado único para el dispositivo

* Llamadas a callback

# Conclusión
