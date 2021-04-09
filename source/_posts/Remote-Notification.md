---
title: Remote Notification
date: 2021-04-08 18:22:07
tags:
---

![](/Post-Resources/Remote_Notification/remote_notification.png "")

Push notification allows your app to reach users more frequently, and can also perform some tasks. In this tutorial, we will learn how to config apps to get remote notifications, display contents and then perform some actions when the user presses in.
Let's get started.

<!-- more --> 
<!-- ### APNs

APNs, stands for Apple Push Notification service, is a service that delivers messages to your app. Note that you need a paid developer account so that you can config your app with the Push Notification capability. You also need a physical device for testing because push notifications are not available in the simulator.

### Request permissions
First, the app needs to ask the user to get permissions to show notifications.

```swift
func registerPushNotifications() {
    UNUserNotificationCenter.current()
        .requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            guard granted else { return }
            self.registerForRemoteNotification()
    }
}

`Alert`, `sound`, and `badge` is the common combination when requesting authorization. There are other options you can find on [Apple doc](https://developer.apple.com/documentation/usernotifications/unauthorizationoptions).

Then, we need to register for remote notification. If the process goes well, the `didRegisterForRemoteNotificationsWithDeviceToken:` callback will be triggered including your device token (A unique value to identify your device, note that it is different everytime you re-install the app). If an error happends, the `didFailToRegisterForRemoteNotificationsWithError:` will be called.

func registerForRemoteNotification() {
    UNUserNotificationCenter.current().getNotificationSettings { settings in
        guard settings.authorizationStatus == .authorized else { return }
        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
}
```

### Handle notification

Recieve notification when the app is in foreground

```swift
extension AppDelegate: UNUserNotificationCenterDelegate {
    public func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {

        completionHandler([.alert, .sound, .badge])
    }
    ...
}
```

To show to notification while the app is open, we need to add some more extra code.

```swift
func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
    let userInfo = response.notification.request.content.userInfo
    Logger.shared.debug("notif \(userInfo)")
    completionHandler()
}
```


### Simulate APNs
```bash
{
    "Simulator Target Bundle": "com.misfitwearables.bgfetch",
    "aps": {
        "alert": "Breaking News!",
        "sound": "default",
        "link_url": "https://raywenderlich.com"
  }
}
```

### It's time to send notification
First, you need to download a client tool that helps you to push a notification. My choice is [Push notification tester](https://github.com/onmyway133/PushNotifications)
1. Switch to `TOKEN` tab in `Authentication` section.
2. Press `SELECT P8` and select your P8 file which is downloaded from the previous step, then Fill in the rest infomation KEY ID, TEAM ID.
3. In `Body` section, fill in your app Id (e.g com.example.yourapp) and your device token which is generated from `didRegisterForRemoteNotificationsWithDeviceToken:` callback.
4. Enter your noti content.
e.g
```bash
{
    "aps": {
        "alert": "YOUR NOTI TITLE",
        "sound": "default",
        "link_url": "SOME LINK URL"
  }
}
```
5. Press the `Send` button to deliver your noti to the selected device. A message will be appeared on the top of the button to show the result.


### Silent notification
From my perspective, the most interested feature of Push notification is "Silient notification", which can wake your app up to perform some tasks while your app is in the background, even if your app was terminated by the user. Many engineers out there is finding the way to keep their apps live in the backgorund as much as posible. There are serveral ways to achieve it by using restoration and preservation, core location, iBeacon. Silent push notification is one among of them.

Kindly note that I will have another post taking about silent notification and my experiment so that I will give you more details and infos.

To send a silient notification, simply change the JSON content to

```bash
{
  "aps": {
    "content-available": 1
  }
}
```

After pressing the `Send` button, there are no notification showing up on your app. 

### Notification with action buttons

```swift
let viewAction = UNNotificationAction(
    identifier: "action_view",
    title: "View",
    options: [.foreground])

let newsCategory = UNNotificationCategory(
    identifier: "news",
    actions: [viewAction],
    intentIdentifiers: [],
    options: [])

UNUserNotificationCenter.current().setNotificationCategories([newsCategory])
```

### Final thought
By using push notification wisely, you can engage users coming back to your app again. However, if you overdo the notifications, it can lead to negative affects such as users turn off permissions to your app or rate your app 1* with complaint on store (Same as us :)).
Notifications not only helps to deliver your messages to users, but also can be used for other advanced purposes like wake your app up by using slient notification. In the next post, we will 
If you have any doubts or comments, let me know.
Happy sharing! -->
