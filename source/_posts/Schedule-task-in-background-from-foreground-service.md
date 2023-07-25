---
title: Schedule task in background from foreground service
date: 2023-07-22 21:56:13
tags:
---
![](/Post-Resources/ScheduleTask/banner.png "ScheduleTask")

If you're running your service on Android, be aware that Android has introduced stricter background execution restrictions in recent versions. Starting from Android 8.0 (API level 26) and above, background services have limitations on their execution time, especially when the app is in the background. Make sure you are aware of these restrictions and adapt your service accordingly.

<!-- more -->

## Timer
When using `Timer` to schedule tasks, it relies on a single background thread. If the screen turn off, the device may enter a low-power state or go to sleep mode, and this can effect the execution of tasks scheduled with `Timer`. In such cases, the device's power-saving features might pause or delay the task execution, leading to unexpected behavior.

```java
private final Timer syncTimer = new Timer();
syncTimer.scheduleAtFixedRate(new TimerTask() {
    @Override
    public void run() {
        // Do your task
    }
});
```

In my case, my app needs to schedule a repeated task in background to sync data and check if the user still has permission to access the Bluetooth device. In the first attempt, we used `Timer`, and it didn't work as expected since the `Timer` does not run when the device falls into doze mode (Doze mode is a power-saving feature introduced in Android 6.0 (Marshmallow) that helps extend battery life by reducing the device's power consumption when it is idle and not in use. It optimizes app behavior to minimize background activity, network access, and CPU usage during periods of inactivity. When a device is in Doze mode, it restricts background processing, network access, and wake locks to save battery power.).
Thus, we need to find an alternative, and there are two other candidates I would like to share to you: `AlarmManager` and `WorkManager`.

## Alarm manager
If you need to schedule tasks that should run even when the app is not actively running, you can use the `AlarmManager` class. It allows you to schedule tasks at specific times or intervals, even if your app is in the background or not running.

The `AlarmManager` class in Android is a system service that allows you to schedule tasks or events to be executed at specific times or intervals, even when your app is not actively running. It provides a way to perform actions or trigger code execution at specified times, such as setting alarms, scheduling recurring tasks, or executing background operations.

The key features of `AlarmManager` include:

**Timing Accuracy**: `AlarmManager` provides accurate timing for scheduling tasks. It uses the device's system clock to determine when the specified time or interval has elapsed.

**Flexibility in Scheduling**: You can schedule tasks to run once (`set()`), repeat at fixed intervals (`setRepeating()`), or repeat at specific intervals with flexibility (`setInexactRepeating()`). This flexibility allows you to schedule tasks according to your specific requirements.

**Execution Persistence**: The scheduled tasks registered with `AlarmManager` persist even if the device is restarted. This ensures that the tasks will be executed as scheduled even after system reboots.

**Device Wake-up Capability**: `AlarmManager` can wake up the device from sleep mode to execute the scheduled tasks. This is useful for scenarios where you need to perform background operations that require the device to be awake.

**Compatibility and Backward Support**: `AlarmManager` has been available since the early versions of Android and provides backward compatibility with older Android versions. This ensures that your scheduled tasks can run on a wide range of devices.

Here's a basic example of using `AlarmManager` to schedule a task:

- First, you'll need to set up the necessary permissions in your `AndroidManifest.xml` file:

```bash
<uses-permission android:name="android.permission.WAKE_LOCK"/>
```

- Next, create a class to handle the task that will be executed when the alarm triggers, and use it

```java
public class MyAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        // Do your task
    }
}


Intent intent = new Intent(this, MyAlarmReceiver.class);
PendingIntent pendingIntent = PendingIntent.getBroadcast(this, 0, intent, 0);

// Get the AlarmManager service
AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);

// Set the repeating alarm
alarmManager.setRepeating(
    AlarmManager.RTC_WAKEUP,
    System.currentTimeMillis() + ALARM_INTERVAL_MS,
    ALARM_INTERVAL_MS,
    pendingIntent
);

```

## Work manager
`WorkManager` is an Android Jetpack library introduced by Google to simplify and manage background tasks in Android applications. It is designed to make it easier for developers to schedule deferrable, periodic, and one-off tasks that need to be executed even when the app is not running or the device is in a low-power state.

Using `WorkManager`, you can perform tasks such as uploading data to a server, syncing data from a remote server, periodic data refreshes, database cleanup, and more, while ensuring efficient and battery-friendly background execution. It abstracts away the complexity of dealing with various Android versions and power-saving features, making it a powerful and recommended solution for background processing in modern Android applications.

- First, Open your app's `build.gradle` file and add the Guava dependency to the dependencies block:

```bash
implementation "androidx.work:work-runtime:2.8.1"
implementation 'com.google.guava:guava:30.1-android'
```

- Next, create a class to handle the task that will be executed and use it

```java
class SyncDataWorker extends Worker {
    public SyncDataWorker(
            @NonNull Context context,
            @NonNull WorkerParameters params) {
        super(context, params);
    }

    @Override
    public Result doWork() {
        // Do your task
        return Result.success();
    }
}


// somewhere in your code
PeriodicWorkRequest periodicWorkRequest = new PeriodicWorkRequest.Builder(
        SyncDataWorker.class, TIME_IN_MILLISECONDS, TimeUnit.MILLISECONDS)
        .setConstraints(new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED) // Set it if your task requires network to be completed
                .build())
        .build();

WorkManager.getInstance(context).enqueue(periodicWorkRequest);
```

When using `WorkManager` and the device screen is off, there are a few limitations and considerations to keep in mind:

**Delayed Execution**: When the device screen is off, Android may enter low-power states like Doze mode or app standby mode to conserve battery. In these states, background tasks, including those scheduled by WorkManager, may be delayed. WorkManager tries to execute tasks during maintenance windows, but there can still be delays in task execution.

**Network Access Restrictions**: Android may restrict network access for background tasks when the screen is off. If your task relies on network connectivity, it may experience delays or have limited access to network resources. You can use constraints like `setRequiredNetworkType()` in WorkManager to specify network requirements for your tasks.

**Background Execution Limits**: Starting from Android 8.0 (API level 26), Android introduced stricter background execution limits. Background apps, including those running background tasks scheduled by WorkManager, have restrictions on their ability to run CPU-intensive tasks or access certain resources. While WorkManager is designed to handle these limitations and ensure efficient task execution, it may still be subject to restrictions imposed by the operating system.

**Device-Specific Behavior**: Different Android devices and manufacturers may have their own power-saving features or optimizations that can affect background task execution when the screen is off. These optimizations can vary, leading to different behaviors and limitations. It's important to test your app on various devices to ensure consistent behavior.

To optimize the execution of background tasks when the device screen is off, consider the following:

**Use appropriate constraints**: Specify constraints such as network requirements (`setRequiredNetworkType()`), charging status (`setRequiresCharging()`), and more to ensure tasks are executed under the desired conditions.

**Respect battery optimizations**: Encourage users to exclude your app from battery optimizations or whitelist it in any power-saving settings on their device. This can help ensure that your app and its background tasks are not excessively restricted.

**Optimize task execution**: Structure your tasks to be as efficient as possible, minimizing the impact on battery life and resources. Break down larger tasks into smaller, manageable units and consider using WorkManager's `ListenableWorker` or `CoroutineWorker` for better performance.

By considering these factors and designing your background tasks and scheduling strategies accordingly, you can optimize their execution even when the device screen is off and work within the limitations imposed by the Android system.

## Which one to use?
The choice between `AlarmManager` and `WorkManager` depends on your specific use case and requirements. Here are some factors to consider when deciding which one is better suited for your needs:

**Timing and Flexibility**
   - `AlarmManager`: It offers precise timing for executing tasks at specific times or intervals, even when the app is not actively running. `AlarmManager` is suitable for time-critical tasks that require exact execution timing.
   - `WorkManager`: It provides more flexibility and optimization for background tasks. `WorkManager` considers factors like battery optimizations, network availability, and device idle state to execute tasks efficiently. It is well-suited for tasks that don't require strict timing precision, such as syncing data or periodic updates that can accept some delay.

**Power Efficiency and Battery Optimization**
   - `AlarmManager`: It allows for more immediate execution and can wake up the device from sleep mode. However, if used improperly, it can have a significant impact on battery life.
   - `WorkManager`: It leverages system optimizations to minimize battery usage. `WorkManager` batches tasks, respects device idle states, and adapts to power-saving features. It provides a more power-efficient approach for executing background tasks.

**Compatibility and Backward Support**
   - `AlarmManager`: It has been available since early versions of Android and offers backward compatibility with older Android versions. It can be used in a wide range of Android devices.
   - `WorkManager`: It is part of the Android Jetpack library and is backward compatible down to Android API level 14 (Ice Cream Sandwich). `WorkManager` is designed to work consistently across different Android versions and devices.

**Error Handling and Retry Mechanism**
   - `AlarmManager`: It doesn't provide built-in mechanisms for handling task failures or automatic retries.
   - `WorkManager`: `WorkManager` can automatically retry failed tasks with configurable constraints.

In general, if you need precise timing, immediate execution, or the ability to wake up the device from sleep mode, `AlarmManager` might be the better choice. On the other hand, if you require power efficiency, flexible task scheduling, error handling, and compatibility across different Android versions, `WorkManager` is a more suitable option.
In some cases, you may even use both `AlarmManager` and `WorkManager` together, depending on the specific requirements of your app. For example, you can use `AlarmManager` for time-sensitive tasks and `WorkManager` for power-efficient background processing.

## Conclusion
In summary, while using `Timer` might lead to unpredictable behavior when the screen turns off due to single-thread execution and lack of power-saving optimizations, `WorkManger` and `AlarmManager` can handle tasks execution more efficiently and reliably, **even when the screen is off or the device is in a low-power state**. For scheduling background tasks, it's generally recommended to use `WorkManager` or `AlertManager` than using `Timer`.