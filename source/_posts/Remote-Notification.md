---
title: Remote Notification
date: 2021-04-08 18:22:07
tags: [iOS, Notification]
---

![](/Post-Resources/Remote_Notification/remote_notification.png "")

Push notification allows your app to reach users more frequently, and can also perform some tasks. In this tutorial, we will learn how to config apps to get remote notifications, display contents and then perform some actions when the user presses in.
Let's get started.

<!-- more --> 
### APNs

APNs, which stands for Apple Push Notification service, is a service that delivers messages to your applications. The notification information sent can include badges, sounds, custom content, or custom text alerts. Note that you need a paid developer account so that you can configure your app with the Push Notification capability. You also need a physical device for testing if you want to launch remote notifications as push notifications are not available in the simulator. You only can simulate notifications on simulators.

### Configuration
Firstly, you need to add the push notifications entitlement to your project,
Head over the Project Setting > Signing Capabilities > + Capability > Add `Push Notification`

![](/Post-Resources/Remote_Notification/add_noti.png "")

If you want to send notifications to real devices, you need to do some extra steps to have a notification key:

1. Sign in to [Apple developer](https://developer.apple.com/account/resources/certificates/list)
2. Under the `Keys` section > Add new keys > Enter your key name > Select `Apple Push Notifications service (APNs)` > Continue.
![](/Post-Resources/Remote_Notification/create_key.png "")
3. Download the key and store it to any location you want to save this key. Notice the file name of the key file has a pattern `AuthKey_[Key ID].p8`

### Request user permissions
Next, the app needs to ask the user to get permission to show notifications.
Open the `AppDelegate.swift` and add the following code

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // The rest omitted
    self.registerPushNotifications()
    ...
}

func registerPushNotifications() {
    UNUserNotificationCenter.current()
        .requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            guard granted else { return }
            // If the user allows showing notification, then register the device to receive a push notification
            self.registerForRemoteNotification()
    }
}

func registerForRemoteNotification() {
    UNUserNotificationCenter.current().getNotificationSettings { settings in
        guard settings.authorizationStatus == .authorized else { return }

        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
}

```

If the process complete successfully, the `didRegisterForRemoteNotificationsWithDeviceToken:` callback will be called including your device token (A unique value to identify your device, note that it is different every time you re-install the app). 
If an error occurs, the `didFailToRegisterForRemoteNotificationsWithError:` will be triggered.

```swift
func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    print("Did register remote notification successfully \(deviceToken.hexadecimalString)")
}

func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("Did failed register remote notification \(error.localizedDescription)")
    // e.g Did failed register remote notification no valid “aps-environment” entitlement string found for application
}
```

Notice the `Alert`, `sound`, and `badge` is the common combination when requesting authorization. 
There are other options you can find on [Apple doc](https://developer.apple.com/documentation/usernotifications/unauthorizationoptions).
Another warning is that if you run your app in a simulator, you will get the `didFailToRegisterForRemoteNotificationsWithError` event as remote notification are not supported on simulators.
### Handle notifications while the app is in foreground
After registering to remote notification successfully, if you want to handle notifications while your app is in the foreground, you need to implement the `userNotificationCenter:willPresent:withCompletionHandler` in your class.

```swift
public func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    ...
    completionHandler([.alert, .sound, .badge])
}
```

**If you do not implement this function, notifications will not show if your app is in the foreground.** 
### It's time to send notification
There are 2 ways to test your implementation. If you don't have a physical device, don't worry, you still can simulate notifications in a simple way, or you can send real notifications to real devices.
#### Simulate APNs
Create a file with ext `.apns`. eg. SimulateNoti.apns, then copy your content to this file
```bash
{
    "Simulator Target Bundle": "YOUR_APP_BUNDLE_ID", <--- CHANGE TO YOUR APP BUNDLE ID
    "aps": {
        "alert": {
            "title" : "Your title",
            "subtitle" : "Your subtitle",
            "body" : "Your body"
        },
        "sound": "default"
    }
}
```

Dragging and dropping this onto the target simulator will present the notification

<div style="text-align:center">

![](/Post-Resources/Remote_Notification/simulate_notification.gif "Simulation")

</div>


#### Push to real devices 
First, you need a remote notification client tool that helps you to push a notification. A great tool to test is [Push notification tester](https://github.com/onmyway133/PushNotifications). Let's navigate to this website to download and launch the app.

After launching the app successfully,
1. Switch to `TOKEN` tab in `Authentication` section.
2. Press `SELECT P8` and select your P8 file which is downloaded from the previous step, then Fill in the rest information `KEY ID`, `TEAM ID`. The `KEY ID` is a part of the P8 file name `AuthKey_[Key ID].p8`. For the `TEAM ID`, you can find it on your membership page.
![](/Post-Resources/Remote_Notification/membership.png "")

3. In `Body` section, fill in your app bundle Id (e.g com.example.yourapp) and your device token which is generated from `didRegisterForRemoteNotificationsWithDeviceToken:` callback.
4. Compose your content. Here is a common body for push notification.
e.g
```bash
{
    "aps": {
        "alert": {
            "title" : "Your title",
            "subtitle" : "Your subtitle",
            "body" : "Your body"
        },
        "sound": "default"
    }
}
```

For all available options in a notification, please refer to [Apple doc: generating_a_remote_notification](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification)

![](/Post-Resources/Remote_Notification/testing.png "")

5. Press the `Send` button to deliver your notification to the selected device. A message will be appeared on the top of the button to show the result.
<center>
<img src="/Post-Resources/Remote_Notification/notification.jpeg" alt="" style="width:300px;"/>
</center>

### Silent notification
From my perspective, the most interesting feature of Push notification is "Silent notification", **which can wake your app up to perform some tasks while your app is in the background**, even if your app was terminated by the user. Many engineers out there are finding a way to keep their app lives in the background as many as they can. There are several ways to achieve it by using restoration and preservation, core location, iBeacon. Silent push notification is one among of them.

I will have [another post](/2021/08/06/Silent-notification) talking about silent notification and my experiment so that I will give you more details and info.

To send a silent notification, simply change the JSON content to

```bash
{
  "aps": {
    "content-available": 1
  }
}
```

After pressing the `Send` button, there is no notification showing on your app. 
### Final thought
By using push notifications wisely, you can engage users coming back to your app again. However, if you overdo the notifications, it can lead to negative effects such as users turn off permissions to your app or rate your app 1* with complaints on the store (Same as our story in the past :)).
Notifications not only help to deliver your messages to users but also can be used for other advanced purposes like wake your app up by using silent notifications. In the next post, we will have a deep look at this amazing feature.
If you have any doubts or comments, let me know.
Happy sharing!
### Refs
1. [Apple doc: Generating a remote notification](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification)
2. [Raywenderlich: Push notification tutorial](https://www.raywenderlich.com/11395893-push-notifications-tutorial-getting-started)