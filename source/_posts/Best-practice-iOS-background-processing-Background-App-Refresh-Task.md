---
title: 'Best practice: iOS background processing - Background App Refresh Task'
date: 2020-09-26 21:53:32
tags:
---

![](/Post-Resources/RefreshInBg/RefreshAppBg.png "Cover")

Unlike Android, iOS has restrictions for the use of background processing in an attempt of improving battery life and user experience. When your apps enter to background mode, it's time developers get out of control of their app. How and when your app gets a chance to execute your task totally depends on the system. At the heart of iOS, Apple uses its own internally-complex algorithm to determines which apps are allowed to run in the background, based on various factors such as the pattern of user activity, current battery state, etc.
In this tutorial, we will learn how to request periodic execution time on iOS. After understanding how it works, we will apply this technique to a BLE-based app in some specific cases in the next tutorial.
Let's rock!

<!-- more --> 

## Foundational knowledge
Before taking deep dive into practice, it's good to understand how iOS manages application states. It's been the first time Apple officially announces a video that describes top factors contributing to the app launch times at WWDC ([WWDC 2020 - Background execution demystified](https://developer.apple.com/videos/play/wwdc2020/10063/?fbclid=IwAR1_oejf0JY9B8yV4d9riMAH4MQsLasO86iVjhwqmAruw2v64_utbuGZIEc)). To summarize, Apple designs iOS in a way allowing applications to keep its content up to date on one hand. On the other hand, iOS must adapt to its major goals: 
- **Battery life**: allowing background execution while maintaining all-day battery life.
- **Performance**: ensure background execution does not have any negative effect on active usage.
- **Privacy**: Users should be aware of background tasks based on their particular usage patterns.
- **Respecting user intent**: if a user takes a certain action, make sure the system responds to correctly.

With these goals in mind, here are the top 7 factors that play a role in system scheduling of background execution.

- **Critical low battery**: When the phone is about to run out of battery (< 20%), background execution will be pause by the system to avoid battery usage.
- **Low power mode**: When users change to phone to low power mode, the user explicitly indicates that the system should preserve battery for critical tasks only. 
- **Background App refresh setting**: The user can toggle the setting to allow or not a specified app can run background tasks.
![](/Post-Resources/RefreshInBg/app_refresh_setting.png "App refresh setting")
- **App usage**: There is a limit of resources on the phone so that the system must priorities which apps it should allocate resources for. Typically, apps that the user uses the most. Apple also mentioned to "On-device predictive engine" that learns which apps the user often uses and when. The on-device predictive engine will rely on this information to priorities background execution.
- **App switcher**: Only apps are visible in App Switcher have opportunities to run background tasks.
- **System budget**: Ensure background activities do not drain battery and data plans, there is a limit of battery and data of background execution throughout the day.
- **Rate limit**: The system performs sone rate-limiting per launch.

and some other factors: Airplane mode, device temperature, display, device lock state, etc.

![](/Post-Resources/RefreshInBg/factors.png "Factors")

## Capabilities
Make sure your app has added these following capabilities

![](/Post-Resources/RefreshInBg/BG-Capabilities.png "Capability")

## Prior to iOS 13
It's quite simple to set up a background fetch prior to iOS 13.
Inside the `application(_:didFinishLaunchingWithOptions)` method, we should add the following command.
```swift
UIApplication.shared.setMinimumBackgroundFetchInterval(UIApplication.backgroundFetchIntervalMinimum)
```
The `setMinimumBackgroundFetchInterval` specifies the minimum amount of time that must elapse between background fetch executions. However, the exact timing of the event is up to the system. Generally, `UIApplicationBackgroundFetchIntervalMinimum` is a good default value to use.

Once your app has a chance to perform background tasks, the event `application(_:,performFetchWithCompletionHandler)` will be triggered.
```swift
func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    Logger.shared.debug("\(Date().toString()) perfom bg fetch")
    completionHandler(.newData)
}
```

**Don't forget to call `completionHandler` callback. If you do not call this callback, the system does not aware your task has been completed, which leads to limiting your app from waking up on the next events**

To simulate background fetch, from the tab bar > Debug > Simulate background fetch. Note that it works only when running on real devices.

![](/Post-Resources/RefreshInBg/simulate_bg_fetch.png "Simulate background fetch")

<iframe width="100%" height="415" src="https://www.youtube.com/embed/oOysGc_f0pA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## iOS 13+, Advance Background processing - WWDC 2019 and Background execution demystified - WWDC 2020
[At WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/707/), Apple introduced a new framework for scheduling background work: `BackgroundTasks`. This new framework does better support for tasks that are needed to be done in the background. There are two kinds of tasks supported by `BackgroundTasks` framework: `BGAppRefreshTaskRequest`, and `BGProcessingTaskRequest`. With the presence of the new framework, Apple marked deprecated on the old one from iOS 13, and no longer support on MacOS.
Firstly, we have to register the identifiers of background tasks executed in our app. Open `info.plist` file, and add the following information.
```bash
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
    <string>YOUR_REFRESH_TASK_ID</string>
    <string>YOUR_PROCESSING_TASK_ID</string>
</array>
```

Forget the above step leading to a crash at runtime.
```swift
2020-10-11 08:24:40.648838+0700 TestBgTask[275:5188] *** Terminating app due to uncaught exception 'NSInternalInconsistencyException', reason: 'No launch handler registered for task with identifier com.example.bgRefresh'
```

`BGAppRefreshTaskRequest` is used when you need to execute a task in the background in a short time. 
Refresh tasks like fetching social media feed, new emails, latest stock prices, etc are appropriate to schedule by `BGAppRefreshTaskRequest`. 30s is the time the system allows your task to execute per launch.

Several minutes of run times to finish your work when you register a `BGProcessingTaskRequest`. Tasks such as Core ML training on the device should be registered by a `BGProcessingTaskRequest`.

To register background tasks, inside the `application(_:didFinishLaunchingWithOptions)` method, we should add the following command.

```swift
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        if #available(iOS 13, *) {
            BGTaskScheduler.shared.register(forTaskWithIdentifier: appRefreshTaskId, using: nil) { task in
                Logger.shared.info("[BGTASK] Perform bg fetch \(appRefreshTaskId)")
                task.setTaskCompleted(success: true)
                self.scheduleAppRefresh()
            }

            BGTaskScheduler.shared.register(forTaskWithIdentifier: appProcessingTaskId, using: nil) { task in
                Logger.shared.info("[BGTASK] Perform bg processing \(appProcessingTaskId)")
                task.setTaskCompleted(success: true)
                self.scheduleBackgroundProcessing()
            }
        }
    }

    @available(iOS 13.0, *)
    func scheduleAppRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: "YOUR_REFRESH_TASK_ID")

        request.earliestBeginDate = Date(timeIntervalSinceNow: 5 * 60) // Refresh after 5 minutes.

        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            print("Could not schedule app refresh task \(error.localizedDescription)")
        }
    }

     @available(iOS 13.0, *)
    func scheduleBackgroundProcessing() {
        let request = BGProcessingTaskRequest(identifier: appProcessingTaskId)
        request.requiresNetworkConnectivity = true // Need to true if your task need to network process. Defaults to false.
        request.requiresExternalPower = true // Need to true if your task requires a device connected to power source. Defaults to false.

        request.earliestBeginDate = Date(timeIntervalSinceNow: 5 * 60) // Process after 5 minutes.

        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            print("Could not schedule image fetch: (error)")
        }
    }
}
```

One more thing that needs to be done. When the app enters to the background, we will start scheduling background tasks.

```swift
func applicationDidEnterBackground(_ application: UIApplication) {
    Logger.shared.info("App did enter background")
    if #available(iOS 13, *) {
        self.scheduleAppRefresh()
        self.scheduleBackgroundProcessing()
    }
}
```

**As always, It's important to call `task.setTaskCompleted(success: true)` as quick as possible**.
You might notice that after calling `task.setTaskCompleted(success: true)`, we need to call `self.scheduleAppRefresh()` and `self.scheduleBackgroundProcessing()` again to re-schedule these tasks to the system.

### Simulate background task and background processing
Fortunately, Apple supports a way to trigger background execution.
After submitting your task to the system, pause the application by any break point. Then, enter the following command to the Xcode console.
```bash
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"YOUR_REFRESH_TASK_ID || YOUR_PROCESSING_TASK_ID"]
```
The output should be
```swift
2020-10-11 08:53:58.628667+0700 TestBgTask[381:17115] 💚-2020-10-11 08:53:58.628 +0700 Start schedule app refresh
(lldb) e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"com.example.bgRefresh"]
2020-10-11 08:54:01.927263+0700 TestBgTask[381:16973] Simulating launch for task with identifier com.example.bgRefresh
2020-10-11 08:54:03.669153+0700 TestBgTask[381:17095] Starting simulated task: <decode: missing data>
2020-10-11 08:54:07.560697+0700 TestBgTask[381:17095] Marking simulated task complete: <BGAppRefreshTask: com.example.bgRefresh>
2020-10-11 08:54:07.560750+0700 TestBgTask[381:17012] 💙-2020-10-11 08:54:06.045 +0700 [BGTASK] Perform bg fetch com.example.bgRefresh
2020-10-11 08:54:07.563846+0700 TestBgTask[381:17012] 💚-2020-10-11 08:54:07.562 +0700 Start schedule app refresh
```

<iframe width="100%" height="415" src="https://www.youtube.com/embed/e6KFwzZKmns" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


## Expectation vs Reality
You might expect that background execution would be evenly distributes through out the day.
![](/Post-Resources/RefreshInBg/Expectation.png "Expectation")

However, here is what we observe in reality. Because of the 7 factors I introduced at the beginning of this tutorial, the "On-device predictive engine" learns the user usage pattern and understands that the user typically opens the app in the morning, lunchtime, and in the evening. That's why the system will allow your background tasks to launch just before the user foregrounds the app. Other factors that affect the result are if the user toggled "Low power mode", or if the phone fell into the critical low battery state.
![](/Post-Resources/RefreshInBg/Reality.png "Reality")

## Best advices
- Background tasks will not be run until the first device unlocks after the reboot.
- We can check if the user is in low power mode:
```swift
ProcessInfo.processInfo.isLowPowerModeEnabled
NSProcessInfoPowerStateDidChange
```
- We also can check the "background refresh setting" status.
```swift
UIApplication.shared.backgroundRefreshStatus
UIApplication.backgroundStatusDidChangeNotification
```
- Minimize data usage: Using thumbnails instead of full images, and only download what's really necessary.
- Minimize power consumption: avoid unnecessary hardware usage such as GPS, accelerometer, etc. Also, make sure you complete the task as soon as possible.
- Use `BackgroundURLSession` to offload the work from the app to the system.

## Summary
In this post, we take a deep dive into what factors contributed to your background executions, and understand are key differences between `BGAppRefreshTaskRequest` and  `BGProcessingTaskRequest`. We also take a demo project to see how it actually works in reality. 
Next time, you can choose what kind of request is most appropriate to your tasks, and how you can respond gracefully to your user's intent.
Hopefully, the information that this post brings in helps you build better applications: freshness and optimization.
There is another technique to wake your app up, silent notification. We will talk about it in the next tutorial.
Happy weekend!

## References
1. [Background execution demystified WWDC 2020](https://developer.apple.com/videos/play/wwdc2020/10063)
2. [Advances in App Background Execution WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/707/)
