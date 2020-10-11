---
title: 'WWDC 2020 - Key Note Series: Top reasons why app get killed in background'
date: 2020-09-30 19:03:28
tags:
---

![](/Post-Resources/AppGetKilled/AppGetKilled.png "AppGetKilled")

Ever wonder why your app gets killed from the system when it enters to the background? This post is going to summarize are introduced by Apple in WWDC 2020.

<!-- ## Keynote

- Crashes: Segmentation fault, illegal instruction, asserts and uncaught exceptions.
- CPU resource limit: High sustained CPU load in background > Moving work to BGProcessingTask (several minutes of run time)
- Watchdog: A long hang during app transitions such as deadlock, infinite loop or unending synchronous task on the main thread. approximately 20s
+ application(_:didFinishLaunchingWithOptions)
+ applicationDidEnterBackground(_:)
+ applicationWillEnterForeground(_:)
- Memory limit exceeded: App using too much memory (same on background and foreground). Before iPhone6s, 200M limited. the older, the smaller.
- Memory pressure exit (jetsam): system need to free memory from background application for the foreground application (and other running applications like music or navigation app) > Less then 50M, clear out image views. can't eliminate the risk of jetsam entiely. (State Restoration)
- Background task timeout
```swift
UIApplication.beginBackgroundTask(exprirationHandler:)
UIApplication.endBackgroundTask(_:)
```
the timeout will be triggered if endBackgroundTask not called., 30s after suspending app. > Carefully handle background tasks., do not kick off any additional expensive work because we only have a few seconds.

## MetricKit

```swift
open class MXBackgroundExitData: NSObject, NSSecureCoding {
    // Cumulative number of times the application exited normally, or was gracefully terminated by the system.
    open var cumulativeNormalAppExitCount: Int { get }
    // Cumulative number of times the application was terminated for exceeding a memory consumption limit.
    open var cumulativeMemoryResourceLimitExitCount: Int { get }
    // Cumulative number of times the application was terminated for exceeding a CPU consumption limit.
    open var cumulativeCPUResourceLimitExitCount: Int { get }
    // Cumulative number of times the application exited due to memory pressure on the system.
    open var cumulativeMemoryPressureExitCount: Int { get }
    // Cumulative number of times the application was terminated for attempting to access invalid memory, or attempting to access memory in a manner not allowed by the memory's protection level (e.g. writing to read-only memory).
    open var cumulativeBadAccessExitCount: Int { get }
    // The most common causes of crashes with this exception type are uncaught Objective-C/C++ exceptions and calls to abort().
    open var cumulativeAbnormalExitCount: Int { get }
    // The process may have attempted to jump to an invalid address via a misconfigured function pointer.
    open var cumulativeIllegalInstructionExitCount: Int { get }
    // These can occur when the application took too long to launch, terminate, or respond to system events.
    open var cumulativeAppWatchdogExitCount: Int { get }
    // If your application is performing operations on a locked file or sqlite database at suspension time, it must request additional background execution time to complete those operations and relinquish the lock before suspending.
    open var cumulativeSuspendedWithLockedFileExitCount: Int { get }
    // If your application begins a background task, you must call endBackgroundTask() to signal completion of the task to prevent your application from being terminated. You can do this in the expiration handler of the task, but it must be done immediately.
    open var cumulativeBackgroundTaskAssertionTimeoutExitCount: Int { get }
}

```

## Take to practice

## Conclusion -->
