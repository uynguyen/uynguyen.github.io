---
title: React Native trong thế giới thực của tôi
date: 2017-12-01 11:46:47
tags: [ReactNative, CrossPlatform]
layout: post
lang: vi
thumbnail: /Post-Resources/ReactNative/Banner.jpg
---
React Native được giới thiệu vào tháng 1 năm 2015 tại React.js Con: Bản xem trước công khai đầu tiên. Vào tháng 3 năm 2015, React Native được mở và có sẵn trên Github. Sau khi phát hành, React Native nhanh chóng trở nên phổ biến và được cập nhật liên tục bởi hàng ngàn lập trình viên trên thế giới. Hiện tại, React Native là một trong những [repository có nhiều star nhất](https://github.com/search?p=2&q=stars%3A%3E1&s=stars&type=Repositories) trên Github.
<!-- more -->
# Threads

# Hiệu năng

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


# Ưu điểm và nhược điểm

## Ưu điểm

* Hiệu năng native

* Học một lần, chạy mọi nơi

* Flex box

* Hot reloading

* Phát hiện platform trong code

## Nhược điểm

* Không ổn định, khó theo kịp

* Thiếu tài liệu

* Single dedicated device thread

* Gọi callback

# Kết luận
