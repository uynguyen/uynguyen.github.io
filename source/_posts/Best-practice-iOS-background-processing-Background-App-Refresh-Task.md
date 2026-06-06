---
title: 'Best practice: iOS background processing - Background App Refresh Task'
date: 2020-09-26 21:53:32
tags: [iOS, BLE]
thumbnail: /Post-Resources/RefreshInBg/RefreshAppBg.png
ping: true
---

Unlike Android, iOS restricts background processing in an effort to improve battery life and user experience. When your app enters background mode, developers lose direct control over it. How and when your app gets a chance to execute a task depends entirely on the system. At its core, iOS uses an internally complex algorithm to determine which apps are allowed to run in the background, based on factors such as user activity patterns, current battery state, and more.

In this tutorial, we will learn how to request periodic background execution time on iOS. After understanding how it works, we will apply this technique to a BLE-based app in some specific cases in the next tutorial.

Let's get started!

<!-- more --> 

## Foundational knowledge
Before diving into practice, it helps to understand how iOS manages application states. Apple officially presented a video at WWDC describing the top factors that affect background execution ([WWDC 2020 - Background execution demystified](https://developer.apple.com/videos/play/wwdc2020/10063/?fbclid=IwAR1_oejf0JY9B8yV4d9riMAH4MQsLasO86iVjhwqmAruw2v64_utbuGZIEc)). Apple designed iOS to balance two competing concerns: keeping app content up to date, while adapting to its core goals:

- **Battery life**: allowing background execution while maintaining all-day battery life.
- **Performance**: ensuring background execution does not negatively affect active usage.
- **Privacy**: users should be aware of background tasks based on their particular usage patterns.
- **Respecting user intent**: if a user takes a certain action, the system should respond correctly.

With these goals in mind, here are the top 7 factors that influence how the system schedules background execution.

- **Critical low battery**: When the phone is about to run out of battery (< 20%), background execution will be paused by the system to conserve power.
- **Low power mode**: When users switch to low power mode, they are explicitly signaling the system to preserve battery for critical tasks only.
- **Background App refresh setting**: The user can toggle this setting to allow or disallow a specific app from running background tasks.
![](/Post-Resources/RefreshInBg/app_refresh_setting.png "App refresh setting")
- **App usage**: Resources on the phone are limited, so the system must prioritize which apps to allocate resources to — typically those the user opens most often. Apple also introduced an "on-device predictive engine" that learns which apps the user frequently uses and when, and uses that information to prioritize background execution.
- **App switcher**: Only apps visible in the App Switcher have opportunities to run background tasks.
- **System budget**: To prevent background activities from draining battery and data plans, there is a daily limit on background execution time and data usage.
- **Rate limiting**: The system applies some rate-limiting per launch.

Additional factors include: Airplane mode, device temperature, display state, device lock state, and more.

![](/Post-Resources/RefreshInBg/factors.png "Factors")

## Capabilities
Make sure your app has the following capabilities enabled.

![](/Post-Resources/RefreshInBg/BG-Capabilities.png "Capability")

## Prior to iOS 13
Setting up a background fetch before iOS 13 is straightforward.
Inside the `application(_:didFinishLaunchingWithOptions)` method, add the following line.
```swift
UIApplication.shared.setMinimumBackgroundFetchInterval(UIApplication.backgroundFetchIntervalMinimum)
```
`setMinimumBackgroundFetchInterval` specifies the minimum amount of time that must elapse between background fetch executions. However, the exact timing is ultimately up to the system. In most cases, `UIApplicationBackgroundFetchIntervalMinimum` is a sensible default.

Once your app gets a chance to perform background tasks, the `application(_:performFetchWithCompletionHandler)` event will be triggered.
```swift
func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    Logger.shared.debug("\(Date().toString()) perfom bg fetch")
    completionHandler(.newData)
}
```

**Always call the `completionHandler` callback. If you do not, the system will not know your task has completed, which will limit how often your app is woken up for future events.**

To simulate a background fetch, go to the tab bar > Debug > Simulate Background Fetch. Note that this only works on a real device.

![](/Post-Resources/RefreshInBg/simulate_bg_fetch.png "Simulate background fetch")

<iframe width="100%" height="415" src="https://www.youtube.com/embed/oOysGc_f0pA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## iOS 13+, Advanced Background Processing — WWDC 2019 and WWDC 2020
[At WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/707/), Apple introduced a new framework for scheduling background work: `BackgroundTasks`. This framework provides better support for tasks that need to run in the background. It supports two task types: `BGAppRefreshTaskRequest` and `BGProcessingTaskRequest`. With this new framework, Apple deprecated the old background fetch API starting from iOS 13, and dropped support for it on macOS.

First, register the identifiers of your background tasks in `info.plist`.
```bash
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
    <string>YOUR_REFRESH_TASK_ID</string>
    <string>YOUR_PROCESSING_TASK_ID</string>
</array>
```

Skipping this step will cause a crash at runtime:
```swift
2020-10-11 08:24:40.648838+0700 TestBgTask[275:5188] *** Terminating app due to uncaught exception 'NSInternalInconsistencyException', reason: 'No launch handler registered for task with identifier com.example.bgRefresh'
```

Use `BGAppRefreshTaskRequest` when you need to execute a short background task — for example, fetching a social media feed, new emails, or the latest stock prices. The system grants up to **30 seconds** of execution time per launch.

A `BGProcessingTaskRequest` grants several minutes of run time for heavier work, such as Core ML training on-device.

To register background tasks, add the following inside `application(_:didFinishLaunchingWithOptions)`.

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

When the app enters the background, schedule both tasks so the system knows to run them later.

```swift
func applicationDidEnterBackground(_ application: UIApplication) {
    Logger.shared.info("App did enter background")
    if #available(iOS 13, *) {
        self.scheduleAppRefresh()
        self.scheduleBackgroundProcessing()
    }
}
```

**Always call `task.setTaskCompleted(success: true)` as quickly as possible.**
Note that after calling it, you need to call `self.scheduleAppRefresh()` and `self.scheduleBackgroundProcessing()` again to re-schedule these tasks for the next cycle.

### Simulate background task and background processing
Apple provides a way to trigger background execution during development.
After submitting your task to the system, pause the app at any breakpoint. Then enter the following command in the Xcode console.
```bash
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"YOUR_REFRESH_TASK_ID || YOUR_PROCESSING_TASK_ID"]
```
The output should look like this:
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
You might expect background execution to be evenly distributed throughout the day.
![](/Post-Resources/RefreshInBg/Expectation.png "Expectation")

However, here is what we actually observe. Because of the 7 factors introduced above, the on-device predictive engine learns the user's usage patterns — for example, that they typically open the app in the morning, at lunchtime, and in the evening. The system will therefore schedule background tasks to run just before the user brings the app to the foreground. Other factors that affect the result include the user enabling Low Power Mode, or the device reaching a critically low battery state.
![](/Post-Resources/RefreshInBg/Reality.png "Reality")

## Best Practices
- Background tasks will not run until the device is unlocked for the first time after a reboot.
- You can check whether the user has Low Power Mode enabled:
```swift
ProcessInfo.processInfo.isLowPowerModeEnabled
NSProcessInfoPowerStateDidChange
```
- You can also check the Background App Refresh status:
```swift
UIApplication.shared.backgroundRefreshStatus
UIApplication.backgroundStatusDidChangeNotification
```
- Minimize data usage: use thumbnails instead of full images, and only download what is truly necessary.
- Minimize power consumption: avoid unnecessary hardware usage such as GPS or the accelerometer. Complete the task as quickly as possible.
- Use `BackgroundURLSession` to offload network work from the app to the system.

## Summary
In this post, we explored the factors that influence background execution, and understood the key differences between `BGAppRefreshTaskRequest` and `BGProcessingTaskRequest`. We also walked through a demo project to see how it works in practice.

Now you can choose the right request type for your task and respond gracefully to the user's intent.
There is another technique to wake your app — silent push notifications. We will cover that in the next tutorial.

Happy weekend!

## References
1. [Background execution demystified WWDC 2020](https://developer.apple.com/videos/play/wwdc2020/10063)
2. [Advances in App Background Execution WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/707/)
