---
title: Silent notification
date: 2021-08-06 19:59:44
tags: [iOS, Notification]
---

![](/Post-Resources/Silent-Notification/silent_notification.png "")

**Background notification** (aka **Silent notification**) is originally designed for server-based applications. A silent notification is just a remote notification without displaying an alert in applications. The main responsibility of a background notification is to wake your app while it's in the background.

<!-- more --> 
## Warning!!!
"The system treats background notifications as low priority: you can use them to refresh your app’s content, but the system doesn’t guarantee their delivery. In addition, the system may throttle the delivery of background notifications if the total number becomes excessive. The number of background notifications allowed by the system depends on current conditions, but don’t try to send more than two or three per hour."
## Setting up

![](/Post-Resources/Silent-Notification/setting.png "")


To deliver a background notification, the system wakes your app in the background. On iOS it then calls your app delegate’s application(_:didReceiveRemoteNotification:fetchCompletionHandler:) method. On watchOS, it calls your extension delegate’s didReceiveRemoteNotification(_:fetchCompletionHandler:) method. Your app has 30 seconds to perform any tasks and call the provided completion handler

## Take to practice

### Analysis, Uninstall Metric.

### Fetching new data
### Wake up the app

## Ref
https://firebase.google.com/docs/admin/setup#add_firebase_to_your_app
https://firebase.google.com/docs/cloud-messaging/send-message
https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/pushing_background_updates_to_your_app