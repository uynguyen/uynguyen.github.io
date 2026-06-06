---
title: 'Android Bluetooth: Một cạm bẫy'
date: 2024-08-04 12:10:39
tags: [Android, Bluetooth]
layout: post
lang: vi
thumbnail: /Post-Resources/BluetoothPitfall/bluetooth_pitfall.png
---

Phát triển ứng dụng Android hỗ trợ BLE đầy rẫy thách thức, đặc biệt khi nói đến việc quản lý các thao tác đồng thời. Một trong những cạm bẫy phổ biến nhất mà các nhà phát triển gặp phải là hành vi không mong đợi xảy ra khi cố gắng thực hiện các thao tác BLE liên tiếp nhanh chóng. Trong bài blog này, chúng ta sẽ đi sâu vào lý do tại sao điều này xảy ra và cách bạn có thể vượt qua nó bằng cách triển khai cơ chế hàng đợi tùy chỉnh cho các thao tác BLE.

<!-- more -->

Nếu bạn đã làm việc với BLE trên Android, bạn có thể đã gặp một vấn đề khó chịu: khi bạn cố gắng thực hiện nhiều thao tác BLE liên tiếp, như đọc và ghi characteristic hoặc descriptor, chỉ thao tác đầu tiên thành công, trong khi các thao tác khác dường như biến mất. Đây không chỉ là một bất tiện nhỏ; đây là một vấn đề nghiêm trọng vì logic ứng dụng của bạn thường phụ thuộc vào việc hoàn thành thành công các thao tác này. Nếu không có chúng, UI của bạn không thể cập nhật với dữ liệu mới từ thiết bị được kết nối, dẫn đến trải nghiệm người dùng kém.

Vậy, điều gì đang xảy ra bên dưới? Vấn đề cốt lõi nằm ở cách BLE stack của Android xử lý các thao tác. Các thao tác BLE là bất đồng bộ, có nghĩa là chúng không hoàn thành ngay lập tức. Khi bạn thực hiện BLE stack với nhiều request liên tiếp nhanh chóng, hệ thống gặp khó khăn trong việc theo kịp, dẫn đến các thao tác bị drop và hành vi không thể đoán trước.

## Cách tiếp cận truyền thống: Giải pháp dựa trên Callback
Một cách để giảm thiểu vấn đề này là sử dụng callback để sắp xếp thứ tự các thao tác BLE của bạn.
Ví dụ, bạn có thể đợi callback onCharacteristicWrite() được trigger trước khi bắt đầu thao tác tiếp theo. Điều này hoạt động cho các trường hợp sử dụng đơn giản khi các tương tác BLE của bạn được giới hạn trong một màn hình hoặc Activity đơn lẻ.
Tuy nhiên, cách tiếp cận này nhanh chóng trở nên không thể quản lý được khi độ phức tạp của ứng dụng tăng lên. Khi bạn thêm nhiều thao tác BLE hơn - như đọc và ghi descriptor, xử lý kết nối và ngắt kết nối, cập nhật MTU, và thực hiện service discovery. Bạn sẽ thấy rằng cần một giải pháp có khả năng mở rộng hơn.

## Giải pháp có khả năng mở rộng: Triển khai cơ chế hàng đợi
Để xử lý các thao tác BLE đáng tin cậy hơn, cơ chế hàng đợi tùy chỉnh là điều cần thiết. Bằng cách xếp hàng các thao tác BLE, bạn đảm bảo rằng mỗi thao tác được thực hiện tuần tự, chỉ sau khi thao tác trước đó đã thành công hoặc thất bại. Cách tiếp cận này không chỉ ngăn các thao tác bị drop mà còn đơn giản hóa việc quản lý các tác vụ BLE trong ứng dụng của bạn.

Đây là phác thảo cơ bản về cách bạn có thể triển khai cơ chế như vậy:

- `Tạo Queue`: Bắt đầu bằng cách tạo một queue (như LinkedList hoặc Queue) để chứa các thao tác BLE của bạn. Mỗi thao tác có thể được đại diện như một task hoặc command object chứa chi tiết của thao tác bạn muốn thực hiện.
- `Operation Handler`: Triển khai một handler hoặc manager class chịu trách nhiệm xử lý các thao tác trong queue. Class này nên lắng nghe việc hoàn thành của mỗi thao tác BLE, dù thành công hay thất bại, trước khi dequeue và thực hiện thao tác tiếp theo.
- `Tích hợp Callback`: Sửa đổi các callback BLE hiện có của bạn (như onCharacteristicWrite(), onCharacteristicRead(), v.v.) để trigger việc dequeue và thực hiện thao tác tiếp theo trong queue.
- `Xử lý lỗi`: Triển khai xử lý lỗi để đảm bảo rằng các thao tác thất bại không block queue. Bạn cũng có thể muốn thực hiện logic retry cho các lỗi tạm thời.
- `Cập nhật UI`: Vì UI của bạn có thể phụ thuộc vào kết quả của các thao tác BLE, hãy đảm bảo rằng queue manager của bạn trigger các cập nhật UI phù hợp khi thao tác hoàn thành.

```java
class BLEManager {
    ConcurrentLinkedQueue<BLEBaseCommand> commandQueue = new ConcurrentLinkedQueue<>(); // Lưu ý rằng chúng ta đang sử dụng ConcurrentLinkedQueue để ngăn các vấn đề đồng thời.

    private void terminateCommands() {
        commandQueue.clear();
        currentCommand = null;
    }

    private void enqueueCommand(BLEBaseCommand command) {
        commandQueue.offer(command);
        if (currentCommand == null) {
            executeNextCommand();
        }
    }

    private void signalCommandEnd() {
        currentCommand = null;
        if (!commandQueue.isEmpty()) { // Còn command?
            executeNextCommand();
        }
    }

    private void executeNextCommand() {
        BLEBaseCommand next = commandQueue.poll();
        if (next == null) {
            // Hoàn tất tất cả
            return;
        }

        currentCommand = next;
        try {
            if (!currentCommand.execute()) {
                runOnUiThread(currentCommand.fallback); // Xử lý lỗi từ hàm `fallback` tùy thuộc vào command
                signalCommandEnd();
            }
        } catch (Exception ex) {
            signalCommandEnd();
        }
    }

    private void runOnUiThread(Runnable runnable) {
        new Handler(Looper.getMainLooper()).post(runnable);
    }
}
```

Ở đâu đó từ class `BluetoothGattCallback` của bạn.

```java
@Override
    public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
    // Logic của bạn
    manager.signalCommandEnd();
}

@Override
public void onServiceChanged(@NonNull BluetoothGatt gatt) {
    // Logic của bạn
    manager.signalCommandEnd();
}

@Override
public void onServicesDiscovered(BluetoothGatt gatt, int status) {
    // Logic của bạn
    manager.signalCommandEnd();
}

@Override
public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
    // Logic của bạn
    manager.signalCommandEnd();
}

@Override
public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
    // Logic của bạn
    manager.signalCommandEnd();
}

@Override
public void onDescriptorRead(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
    // Logic của bạn
    manager.signalCommandEnd();
}

@Override
public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
    // Logic của bạn
    manager.signalCommandEnd();
}

@Override
public void onReadRemoteRssi(BluetoothGatt gatt, int rssi, int status) {
    // Logic của bạn
    manager.signalCommandEnd();
}

@Override
public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
    // Logic của bạn
    manager.signalCommandEnd();
}
```

Dưới đây là sơ đồ class cơ bản

![](/Post-Resources/BluetoothPitfall/design.png "Bluetooth")

## Tại sao điều này quan trọng
Việc triển khai cơ chế hàng đợi cho các thao tác BLE không chỉ là về việc tránh các thao tác bị drop; đó là về việc tạo ra một kiến trúc đáng tin cậy và có khả năng mở rộng hơn cho ứng dụng của bạn. Khi bạn mở rộng chức năng BLE của ứng dụng, bạn sẽ biết ơn sự ổn định và khả năng dự đoán mà hệ thống hàng đợi cung cấp.

Đáng lưu ý rằng các paradigm hiện đại hơn như `RxJava` hoặc framework `Kotlin` có thể cung cấp các giải pháp thanh lịch hơn cho vấn đề này. Các công cụ này có thể giúp bạn quản lý các thao tác bất đồng bộ với tính linh hoạt cao hơn và ít boilerplate code hơn. Tuy nhiên, đối với nhiều nhà phát triển, cơ chế hàng đợi tùy chỉnh cung cấp một nền tảng vững chắc có thể dễ dàng hiểu và triển khai mà không cần thêm các dependency bổ sung. Chúng ta có thể thảo luận điều này trong một bài khác.

## Kết luận
BLE trên Android có thể đầy thách thức, nhưng với các chiến lược đúng đắn, bạn có thể xây dựng các ứng dụng mạnh mẽ giao tiếp đáng tin cậy với các thiết bị BLE. Bằng cách triển khai cơ chế hàng đợi tùy chỉnh, bạn có thể vượt qua nhiều vấn đề liên quan đến đồng thời. Dù bạn mới bắt đầu với BLE hay đang tìm cách nâng cao các ứng dụng hiện có, việc áp dụng cách tiếp cận hàng đợi sẽ làm cho quá trình phát triển của bạn mượt mà hơn và ứng dụng của bạn đáng tin cậy hơn.
Happy Coding!
