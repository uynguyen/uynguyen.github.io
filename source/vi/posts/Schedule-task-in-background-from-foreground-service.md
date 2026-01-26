---
title: Lên lịch tác vụ ở chế độ nền từ foreground service
date: 2023-07-22 21:56:13
tags:
layout: post
permalink: vi/posts/Schedule-task-in-background-from-foreground-service/
lang: vi
---
![](/Post-Resources/ScheduleTask/banner.png "ScheduleTask")

Nếu bạn đang chạy service trên Android, hãy lưu ý rằng Android đã giới thiệu các hạn chế thực thi nền nghiêm ngặt hơn trong các phiên bản gần đây. Bắt đầu từ Android 8.0 (API level 26) trở lên, background service có giới hạn về thời gian thực thi, đặc biệt khi ứng dụng ở chế độ nền. Hãy đảm bảo bạn nhận thức được các hạn chế này và điều chỉnh service của mình cho phù hợp.

<!-- more -->

## Timer
Khi sử dụng `Timer` để lên lịch tác vụ, nó dựa vào một background thread duy nhất. Nếu màn hình tắt, thiết bị có thể vào trạng thái tiết kiệm năng lượng hoặc chế độ ngủ, và điều này có thể ảnh hưởng đến việc thực thi các tác vụ được lên lịch với `Timer`. Trong những trường hợp như vậy, các tính năng tiết kiệm năng lượng của thiết bị có thể tạm dừng hoặc trì hoãn việc thực thi tác vụ, dẫn đến hành vi không mong đợi.

```java
private final Timer syncTimer = new Timer();
syncTimer.scheduleAtFixedRate(new TimerTask() {
    @Override
    public void run() {
        // Do your task
    }
});
```

Trong trường hợp của tôi, ứng dụng cần lên lịch một tác vụ lặp lại ở chế độ nền để đồng bộ dữ liệu và kiểm tra xem người dùng còn quyền truy cập thiết bị Bluetooth hay không. Trong lần thử đầu tiên, chúng tôi sử dụng `Timer`, và nó không hoạt động như mong đợi vì `Timer` không chạy khi thiết bị vào chế độ doze (Doze mode là tính năng tiết kiệm năng lượng được giới thiệu trong Android 6.0 (Marshmallow) giúp kéo dài tuổi thọ pin bằng cách giảm mức tiêu thụ năng lượng của thiết bị khi nó ở chế độ rảnh và không được sử dụng. Nó tối ưu hóa hành vi của ứng dụng để giảm thiểu hoạt động nền, truy cập mạng và sử dụng CPU trong các khoảng thời gian không hoạt động. Khi thiết bị ở chế độ Doze, nó hạn chế xử lý nền, truy cập mạng và wake lock để tiết kiệm pin.).
Do đó, chúng tôi cần tìm một giải pháp thay thế, và có hai ứng cử viên khác tôi muốn chia sẻ với bạn: `AlarmManager` và `WorkManager`.

## Alarm manager
Nếu bạn cần lên lịch các tác vụ cần chạy ngay cả khi ứng dụng không đang chạy, bạn có thể sử dụng class `AlarmManager`. Nó cho phép bạn lên lịch các tác vụ vào thời điểm hoặc khoảng thời gian cụ thể, ngay cả khi ứng dụng của bạn ở chế độ nền hoặc không chạy.

Class `AlarmManager` trong Android là một system service cho phép bạn lên lịch các tác vụ hoặc sự kiện để thực thi vào thời điểm hoặc khoảng thời gian cụ thể, ngay cả khi ứng dụng của bạn không đang chạy. Nó cung cấp một cách để thực hiện các hành động hoặc kích hoạt thực thi code vào những thời điểm được chỉ định, chẳng hạn như đặt báo thức, lên lịch các tác vụ định kỳ hoặc thực hiện các hoạt động nền.

Các tính năng chính của `AlarmManager` bao gồm:

**Độ chính xác thời gian**: `AlarmManager` cung cấp thời gian chính xác để lên lịch tác vụ. Nó sử dụng đồng hồ hệ thống của thiết bị để xác định khi nào thời gian hoặc khoảng thời gian được chỉ định đã trôi qua.

**Linh hoạt trong việc lên lịch**: Bạn có thể lên lịch các tác vụ chạy một lần (`set()`), lặp lại theo khoảng thời gian cố định (`setRepeating()`), hoặc lặp lại theo khoảng thời gian cụ thể với độ linh hoạt (`setInexactRepeating()`). Sự linh hoạt này cho phép bạn lên lịch các tác vụ theo yêu cầu cụ thể của mình.

**Bền vững khi thực thi**: Các tác vụ đã lên lịch được đăng ký với `AlarmManager` vẫn tồn tại ngay cả khi thiết bị được khởi động lại. Điều này đảm bảo rằng các tác vụ sẽ được thực thi theo lịch trình ngay cả sau khi hệ thống khởi động lại.

**Khả năng đánh thức thiết bị**: `AlarmManager` có thể đánh thức thiết bị từ chế độ ngủ để thực thi các tác vụ đã lên lịch. Điều này hữu ích cho các tình huống mà bạn cần thực hiện các hoạt động nền yêu cầu thiết bị phải thức.

**Tương thích và hỗ trợ ngược**: `AlarmManager` đã có sẵn từ các phiên bản đầu tiên của Android và cung cấp khả năng tương thích ngược với các phiên bản Android cũ hơn. Điều này đảm bảo rằng các tác vụ đã lên lịch của bạn có thể chạy trên nhiều loại thiết bị.

Dưới đây là ví dụ cơ bản về việc sử dụng `AlarmManager` để lên lịch một tác vụ:

- Đầu tiên, bạn cần thiết lập các quyền cần thiết trong file `AndroidManifest.xml`:

```bash
<uses-permission android:name="android.permission.WAKE_LOCK"/>
```

- Tiếp theo, tạo một class để xử lý tác vụ sẽ được thực thi khi alarm kích hoạt, và sử dụng nó

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
`WorkManager` là một thư viện Android Jetpack được Google giới thiệu để đơn giản hóa và quản lý các tác vụ nền trong các ứng dụng Android. Nó được thiết kế để giúp các nhà phát triển dễ dàng lên lịch các tác vụ có thể hoãn lại, định kỳ và một lần cần được thực thi ngay cả khi ứng dụng không chạy hoặc thiết bị ở trạng thái tiết kiệm năng lượng.

Sử dụng `WorkManager`, bạn có thể thực hiện các tác vụ như tải dữ liệu lên server, đồng bộ dữ liệu từ server từ xa, làm mới dữ liệu định kỳ, dọn dẹp database và hơn thế nữa, đồng thời đảm bảo thực thi nền hiệu quả và tiết kiệm pin. Nó che giấu sự phức tạp của việc xử lý các phiên bản Android khác nhau và các tính năng tiết kiệm năng lượng, khiến nó trở thành một giải pháp mạnh mẽ và được khuyến nghị cho xử lý nền trong các ứng dụng Android hiện đại.

- Đầu tiên, mở file `build.gradle` của ứng dụng và thêm dependency Guava vào khối dependencies:

```bash
implementation "androidx.work:work-runtime:2.8.1"
implementation 'com.google.guava:guava:30.1-android'
```

- Tiếp theo, tạo một class để xử lý tác vụ sẽ được thực thi và sử dụng nó

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

Khi sử dụng `WorkManager` và màn hình thiết bị tắt, có một số giới hạn và lưu ý cần nhớ:

**Thực thi bị trì hoãn**: Khi màn hình thiết bị tắt, Android có thể vào các trạng thái tiết kiệm năng lượng như Doze mode hoặc app standby mode để tiết kiệm pin. Trong các trạng thái này, các tác vụ nền, bao gồm những tác vụ được lên lịch bởi WorkManager, có thể bị trì hoãn. WorkManager cố gắng thực thi các tác vụ trong các cửa sổ bảo trì, nhưng vẫn có thể có sự chậm trễ trong việc thực thi tác vụ.

**Hạn chế truy cập mạng**: Android có thể hạn chế truy cập mạng cho các tác vụ nền khi màn hình tắt. Nếu tác vụ của bạn phụ thuộc vào kết nối mạng, nó có thể gặp sự chậm trễ hoặc có quyền truy cập hạn chế vào tài nguyên mạng. Bạn có thể sử dụng các constraint như `setRequiredNetworkType()` trong WorkManager để chỉ định yêu cầu mạng cho các tác vụ của bạn.

**Giới hạn thực thi nền**: Bắt đầu từ Android 8.0 (API level 26), Android đã giới thiệu các giới hạn thực thi nền nghiêm ngặt hơn. Các ứng dụng nền, bao gồm những ứng dụng chạy các tác vụ nền được lên lịch bởi WorkManager, có hạn chế về khả năng chạy các tác vụ tốn CPU hoặc truy cập một số tài nguyên nhất định. Mặc dù WorkManager được thiết kế để xử lý các giới hạn này và đảm bảo thực thi tác vụ hiệu quả, nó vẫn có thể phải tuân theo các hạn chế do hệ điều hành áp đặt.

**Hành vi theo thiết bị cụ thể**: Các thiết bị Android và nhà sản xuất khác nhau có thể có các tính năng tiết kiệm năng lượng hoặc tối ưu hóa riêng có thể ảnh hưởng đến việc thực thi tác vụ nền khi màn hình tắt. Các tối ưu hóa này có thể khác nhau, dẫn đến các hành vi và giới hạn khác nhau. Điều quan trọng là kiểm thử ứng dụng của bạn trên nhiều thiết bị khác nhau để đảm bảo hành vi nhất quán.

Để tối ưu hóa việc thực thi các tác vụ nền khi màn hình thiết bị tắt, hãy xem xét các điều sau:

**Sử dụng các constraint phù hợp**: Chỉ định các constraint như yêu cầu mạng (`setRequiredNetworkType()`), trạng thái sạc (`setRequiresCharging()`), và hơn thế nữa để đảm bảo các tác vụ được thực thi trong các điều kiện mong muốn.

**Tôn trọng tối ưu hóa pin**: Khuyến khích người dùng loại trừ ứng dụng của bạn khỏi tối ưu hóa pin hoặc đưa vào whitelist trong bất kỳ cài đặt tiết kiệm năng lượng nào trên thiết bị của họ. Điều này có thể giúp đảm bảo rằng ứng dụng của bạn và các tác vụ nền của nó không bị hạn chế quá mức.

**Tối ưu hóa thực thi tác vụ**: Cấu trúc các tác vụ của bạn để hiệu quả nhất có thể, giảm thiểu tác động lên tuổi thọ pin và tài nguyên. Chia nhỏ các tác vụ lớn thành các đơn vị nhỏ hơn, dễ quản lý và cân nhắc sử dụng `ListenableWorker` hoặc `CoroutineWorker` của WorkManager để có hiệu suất tốt hơn.

Bằng cách xem xét các yếu tố này và thiết kế các tác vụ nền và chiến lược lên lịch của bạn cho phù hợp, bạn có thể tối ưu hóa việc thực thi của chúng ngay cả khi màn hình thiết bị tắt và làm việc trong các giới hạn do hệ thống Android áp đặt.

## Nên sử dụng cái nào?
Việc lựa chọn giữa `AlarmManager` và `WorkManager` phụ thuộc vào trường hợp sử dụng và yêu cầu cụ thể của bạn. Dưới đây là một số yếu tố cần xem xét khi quyết định cái nào phù hợp hơn với nhu cầu của bạn:

**Thời gian và Tính linh hoạt**
   - `AlarmManager`: Nó cung cấp thời gian chính xác để thực thi các tác vụ vào thời điểm hoặc khoảng thời gian cụ thể, ngay cả khi ứng dụng không đang chạy. `AlarmManager` phù hợp cho các tác vụ yêu cầu thời gian quan trọng đòi hỏi thời gian thực thi chính xác.
   - `WorkManager`: Nó cung cấp nhiều sự linh hoạt và tối ưu hóa hơn cho các tác vụ nền. `WorkManager` xem xét các yếu tố như tối ưu hóa pin, khả năng mạng và trạng thái rảnh của thiết bị để thực thi các tác vụ một cách hiệu quả. Nó phù hợp cho các tác vụ không yêu cầu độ chính xác thời gian nghiêm ngặt, chẳng hạn như đồng bộ dữ liệu hoặc cập nhật định kỳ có thể chấp nhận một số độ trễ.

**Hiệu quả năng lượng và Tối ưu hóa pin**
   - `AlarmManager`: Nó cho phép thực thi ngay lập tức hơn và có thể đánh thức thiết bị từ chế độ ngủ. Tuy nhiên, nếu sử dụng không đúng cách, nó có thể ảnh hưởng đáng kể đến tuổi thọ pin.
   - `WorkManager`: Nó tận dụng các tối ưu hóa hệ thống để giảm thiểu sử dụng pin. `WorkManager` gom nhóm các tác vụ, tôn trọng trạng thái rảnh của thiết bị và thích ứng với các tính năng tiết kiệm năng lượng. Nó cung cấp cách tiếp cận hiệu quả năng lượng hơn để thực thi các tác vụ nền.

**Tương thích và Hỗ trợ ngược**
   - `AlarmManager`: Nó đã có sẵn từ các phiên bản đầu tiên của Android và cung cấp khả năng tương thích ngược với các phiên bản Android cũ hơn. Nó có thể được sử dụng trên nhiều loại thiết bị Android.
   - `WorkManager`: Nó là một phần của thư viện Android Jetpack và tương thích ngược đến Android API level 14 (Ice Cream Sandwich). `WorkManager` được thiết kế để hoạt động nhất quán trên các phiên bản và thiết bị Android khác nhau.

**Xử lý lỗi và Cơ chế thử lại**
   - `AlarmManager`: Nó không cung cấp các cơ chế tích hợp để xử lý lỗi tác vụ hoặc thử lại tự động.
   - `WorkManager`: `WorkManager` có thể tự động thử lại các tác vụ thất bại với các constraint có thể cấu hình.

Nói chung, nếu bạn cần thời gian chính xác, thực thi ngay lập tức hoặc khả năng đánh thức thiết bị từ chế độ ngủ, `AlarmManager` có thể là lựa chọn tốt hơn. Mặt khác, nếu bạn yêu cầu hiệu quả năng lượng, lên lịch tác vụ linh hoạt, xử lý lỗi và tương thích trên các phiên bản Android khác nhau, `WorkManager` là một lựa chọn phù hợp hơn.
Trong một số trường hợp, bạn thậm chí có thể sử dụng cả `AlarmManager` và `WorkManager` cùng nhau, tùy thuộc vào yêu cầu cụ thể của ứng dụng. Ví dụ, bạn có thể sử dụng `AlarmManager` cho các tác vụ nhạy cảm về thời gian và `WorkManager` cho xử lý nền hiệu quả năng lượng.

## Kết luận
Tóm lại, trong khi sử dụng `Timer` có thể dẫn đến hành vi không thể đoán trước khi màn hình tắt do thực thi đơn luồng và thiếu tối ưu hóa tiết kiệm năng lượng, `WorkManager` và `AlarmManager` có thể xử lý việc thực thi tác vụ hiệu quả và đáng tin cậy hơn, **ngay cả khi màn hình tắt hoặc thiết bị ở trạng thái tiết kiệm năng lượng**. Để lên lịch các tác vụ nền, thường được khuyến nghị sử dụng `WorkManager` hoặc `AlarmManager` hơn là sử dụng `Timer`.
