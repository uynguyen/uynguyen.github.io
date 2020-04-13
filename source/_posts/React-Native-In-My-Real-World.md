---
title: React Native In My Real World
date: 2017-12-01 11:46:47
tags: [ReactNative, CrossPlatform]
---
![](/Post-Resources/ReactNative/Banner.jpg "Ahihi")
React Native was introduced in January of 2015 at React.js Con: The first public preview. In March of 2015, React Native is open and available on Github. After releasing, React Native quickly becomes popular and is constantly updated by thousands of developers in the world. Currently, React Native is one of the [most stars repositories](https://github.com/search?p=2&q=stars%3A%3E1&s=stars&type=Repositories) on Github.
<!-- more --> 
# Threads

# Performance

# Native modules

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

![](/Post-Resources/ReactNative/Native_Module_Work_Flow.png "The work flow of native modules")


# Pros and cons

## Pros

* Native performance

* Learn once, run everywhere

* Flex box

* Hot reloading

* Platform detection in code

## Cons

* Not stable, hard to keep up

* Lack of documentation

* Single dedicated device thread

* Calling callback

# Conclusion
