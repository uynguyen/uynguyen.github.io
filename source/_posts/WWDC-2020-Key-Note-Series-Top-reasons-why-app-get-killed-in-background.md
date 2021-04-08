---
title: 'WWDC 2020 - Top reasons why app get killed in background'
date: 2020-09-30 19:03:28
tags:
---
![](/Post-Resources/AppGetKilled/AppGetKilled.png "AppGetKilled")

Ever wonder why your app gets killed from the system when it enters the background? This post is going to summarize the top reasons introduced by Apple in WWDC 2020, and what you can do to prevent your app from being killed in the background. By applying these tips, we can improve our app’s experience because your app does not have to re-launch from the scratch.
Let's rock!

<!-- more -->

## Top reasons
The following describes the top 6 reasons why your app is killed while it is in the background:

- Crashes: Segmentation fault, illegal instructions, asserts and uncaught exceptions.

- Watchdog: 
A long hang during app transitions such as deadlock, infinite loop or unending synchronous tasks on the main thread. In approximately 20s, your app must transition from one state to another. Otherwise, it will be killed.
```swift
    + application(_:didFinishLaunchingWithOptions)
    + applicationDidEnterBackground(_:)
    + applicationWillEnterForeground(_:)
```

- Excessive CPU usage: 
High sustained CPU load in the background. If your app really needs to do heavy works in the background, you should consider moving the task into the background processing task which gives your app **several minutes of running** while charging without CPU resource limits.

- Memory limit exceeded: 
Your app is using too much memory (same on background and foreground). Remember that the limitation differentiates from device to device. Before iPhone6s, 200M is the memory limitation (The older, the smaller).

- Memory pressure exit (aka Jetsam): 
It happens when the system needs to free up memory of background applications for the foreground applications (and other running applications like music or navigation app). To prevent this, try reducing the memory as small as possible, less than **50M** (e.g clear out image views). However, we can't eliminate the risk of jetsam entirely. The best advice to overcome it is leveraging the build-in UI `State Restoration` to restore the app state right before it had been killed in the background.

    The following video describes how Jetsam happens on iOS devices. Let say we open the Amazon app for shopping, we then select a favorite item to see its detail. Say we have to leave the app in the background for a moment, then we start opening other apps (Google Maps, Music, Photos, Spotify, etc.). At some point, we open the Amazon app again. As we notice, the app launches from the scratch. This is because the app is terminated by the system.
    Obviously, the Amazon app did not do anything wrong, it's just because the system needs to free up memory for other applications that are running in the foreground.

<center>
<iframe width="100%" height="500" src="https://www.youtube.com/embed/JVPvaeoNNsk" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</center>

- Background task timeout:
The last common reason is using background tasks improperly.
```swift
UIApplication.beginBackgroundTask(exprirationHandler:)
UIApplication.endBackgroundTask(_:)
```

    When your app moves from foreground to background, and you want to complete some important tasks, iOS provide you some extra runtime (`only a few seconds`) by calling the `UIApplication.beginBackgroundTask` method. When the task is finished, remember to call `UIApplication.endBackgroundTask` to notify the system that the task gets done. If you forget to call `endBackgroundTask` explicitly, the timeout will be triggered 30s after suspending the app, and the termination happens. So you should carefully handle background tasks and do not kick off any additional expensive works when your app enters background mode because we only have a few seconds of runtime.

    While debugging, XCode will generate a log message to notify if there is a task that has been held too long without ending. When seeing this message, you should do an audit to see what went wrong with the background task calls.

```bash

Background task still not ended after expiration handlers were called: <_UIBackgroundTaskInfo: 0x28190d140>: taskID = 8, taskName = Called by AppGetKilled, 
from $s12AppGetKilled13SceneDelegateC23sceneDidEnterBackgroundyySo7UISceneCF, creationTime = 70784 (elapsed = 26). 
This app will likely be terminated by the system. Call UIApplication.endBackgroundTask(_:) to avoid this.
Background Task 5 ("Called by AppGetKilled, from $s12AppGetKilled13SceneDelegateC23sceneDidEnterBackgroundyySo7UISceneCF"), 
was created over 30 seconds ago. 
In applications running in the background, this creates a risk of termination. 
Remember to call UIApplication.endBackgroundTask(_:) for your task in a timely manner to avoid this.

```

## Conclusion
In this post, I summarized the top 6 reasons why an app can be terminated in the background, how we can do to prevent the problems, and how to recover the app gracefully from unpredictable problems like Jetsam.
You can find the full document and video at [WWDC 2020 - Why is my app getting killed](https://developer.apple.com/videos/play/wwdc2020/10078/)