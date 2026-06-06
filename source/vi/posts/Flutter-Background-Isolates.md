---
title: 'Flutter Background Isolates: Xử lý song song mà không ảnh hưởng UI'
date: 2026-04-05 09:00:00
tags: [Flutter, Dart, Concurrency, BLE, Background]
layout: post
lang: vi
thumbnail: /Post-Resources/FlutterBackgroundIsolates/cover.png
---

Flutter chạy trên một luồng chính duy nhất — **main isolate** — chịu trách nhiệm render UI ở 60 hoặc 120 fps và xử lý các tương tác của người dùng. Bất kỳ tác vụ nặng nào đặt lên luồng đó đều thể hiện ngay lập tức: mất frame, animation bị giật và ứng dụng có cảm giác chậm chạp.

Giải pháp của Dart là **isolate**: một đơn vị thực thi hoàn toàn độc lập, với bộ nhớ riêng biệt và event loop riêng. Chuyển tác vụ sang một background isolate giải phóng luồng chính để làm đúng thứ nó cần làm tốt nhất — vẽ giao diện.

Trong bài này chúng ta sẽ tìm hiểu background isolate là gì, cách hoạt động bên trong, khi nào nên dùng, và cách tích hợp vào ứng dụng Bluetooth Low Energy.

Bắt đầu thôi!

<!-- more -->

---

## Tại sao vấn đề này tồn tại?

Dart được thiết kế theo kiểu **single-threaded**. Không giống Java hay Kotlin, không có shared thread hay mutex. Toàn bộ quá trình thực thi diễn ra trong một isolate — và mặc định, ứng dụng của bạn chỉ có một isolate duy nhất.

Main isolate có một ngân sách thời gian nghiêm ngặt cho mỗi frame: **~16 ms ở 60 fps** hoặc **~8 ms ở 120 fps**. Bất kỳ tác vụ nào mất nhiều thời gian hơn sẽ chặn bộ renderer.

```
Timeline của main isolate (không có background isolate):

[frame 1] [render] [frame 2] [render] [TÁC VỤ NẶNG...........] [frame 3] ← JANK
```

Với background isolate:

```
Main isolate:   [frame 1] [render] [frame 2] [render] [frame 3] ← mượt mà
Background:     [______ TÁC VỤ NẶNG _________________________________]
```

---

## Mô hình Isolate trong Dart

Một **isolate** trong Dart tương tự như một tiến trình OS thu nhỏ:

- Có **bộ nhớ heap riêng** — không chia sẻ object với các isolate khác.
- Giao tiếp duy nhất qua **message passing** thông qua `SendPort` / `ReceivePort`.
- Chạy trên **luồng OS riêng biệt**, cho phép xử lý song song thực sự trên CPU đa nhân.

```
┌──────────────────────────────────────────────────┐
│                   Dart VM                        │
│                                                  │
│  ┌─────────────────┐    ┌─────────────────────┐  │
│  │   Main Isolate  │    │  Background Isolate │  │
│  │                 │◄──►│                     │  │
│  │  - UI           │    │  - Tính toán nặng   │  │
│  │  - Gestures     │    │  - Parse JSON        │  │
│  │  - Animation    │    │  - Crypto / ML       │  │
│  └─────────────────┘    └─────────────────────┘  │
│          (messages)                              │
└──────────────────────────────────────────────────┘
```

> **Điểm quan trọng:** các isolate không chia sẻ bộ nhớ. Để gửi dữ liệu giữa chúng, Dart **sao chép** dữ liệu (với kiểu nguyên thủy và collection đơn giản) hoặc **chuyển giao** (với các kiểu đặc biệt như `TransferableTypedData`). Điều này loại bỏ race condition theo thiết kế.

---

## Cách sử dụng Background Isolate

### Cách 1 — `compute()` (đơn giản nhất)

`compute` là một helper của Flutter, tạo một isolate tạm thời, chờ kết quả rồi đóng isolate đó lại. Lý tưởng cho các tác vụ một lần, không có trạng thái.

```dart
import 'package:flutter/foundation.dart';

// Hàm này chạy trong background isolate
List<Device> parseDevices(String jsonString) {
  final List decoded = jsonDecode(jsonString);
  return decoded.map((e) => Device.fromJson(e)).toList();
}

// Trong widget hoặc bloc của bạn:
final devices = await compute(parseDevices, rawJson);
```

**Giới hạn quan trọng:** hàm top-level (hoặc static method) truyền vào `compute` không thể capture closure từ môi trường của main isolate.

---

### Cách 2 — `Isolate.spawn()` (kiểm soát hoàn toàn)

Cho các tác vụ dài hạn hoặc giao tiếp hai chiều, dùng `Isolate.spawn` trực tiếp.

```dart
import 'dart:isolate';

Future<void> startBackgroundIsolate() async {
  final receivePort = ReceivePort();

  // Khởi động isolate, truyền SendPort để nó có thể phản hồi
  await Isolate.spawn(_backgroundEntry, receivePort.sendPort);

  // Lắng nghe message từ isolate
  receivePort.listen((message) {
    if (message is SendPort) {
      // Isolate gửi SendPort của nó cho giao tiếp hai chiều
      final isolateSendPort = message;
      isolateSendPort.send({'command': 'start'});
    } else {
      print('Kết quả nhận được: $message');
    }
  });
}

// Entry point của background isolate — phải là hàm top-level hoặc static
void _backgroundEntry(SendPort mainSendPort) {
  final isolateReceivePort = ReceivePort();

  // Gửi SendPort của chúng ta cho main isolate để nhận lệnh
  mainSendPort.send(isolateReceivePort.sendPort);

  isolateReceivePort.listen((message) {
    if (message is Map && message['command'] == 'start') {
      final result = _doHeavyWork();
      mainSendPort.send(result);
    }
  });
}

String _doHeavyWork() {
  // Tính toán nặng...
  return 'hoàn thành';
}
```

---

### Cách 3 — `Isolate.run()` (Dart 2.19+, cách hiện đại)

Từ Dart 2.19, `Isolate.run()` kết hợp điểm mạnh của cả hai: sự đơn giản của `compute` kèm hỗ trợ closure.

```dart
import 'dart:isolate';

final result = await Isolate.run(() {
  // Closure từ scope bên ngoài hoạt động ở đây (giá trị, không phải tham chiếu)
  return expensiveComputation(data);
});
```

> Ưu tiên dùng `Isolate.run()` thay vì `compute()` trong các dự án mới — ergonomic hơn và là chuẩn hiện đại của Dart.

---

## Truy cập Plugin từ Background Isolate (Flutter 3.7+)

Trước Flutter 3.7, background isolate **không thể gọi native plugin** (platform channel). Đây là giới hạn lớn với ứng dụng BLE hay sensor.

Từ Flutter 3.7, điều này khả thi nhờ `BackgroundIsolateBinaryMessenger`:

```dart
import 'dart:isolate';
import 'package:flutter/services.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lấy token từ main isolate
  final token = RootIsolateToken.instance!;

  await Isolate.spawn(_bleIsolateEntry, token);
}

void _bleIsolateEntry(RootIsolateToken token) async {
  // Đăng ký messenger trước khi dùng bất kỳ plugin nào
  BackgroundIsolateBinaryMessenger.ensureInitialized(token);

  // Bây giờ có thể dùng platform channel và plugin từ đây
  const channel = MethodChannel('com.example/ble');
  final result = await channel.invokeMethod('startScan');
  print('Quét BLE bắt đầu từ background isolate: $result');
}
```

---

## Truyền dữ liệu hiệu quả — `TransferableTypedData`

Sao chép các buffer byte lớn giữa các isolate có thể tốn kém. Với dữ liệu nhị phân (như frame BLE), dùng `TransferableTypedData` để **chuyển giao** bộ nhớ mà không cần sao chép:

```dart
// Trong main isolate — đóng gói để chuyển giao
final bytes = Uint8List.fromList([0x01, 0x02, 0x03, 0xFF]);
final transferable = TransferableTypedData.fromList([bytes]);
sendPort.send(transferable);

// Trong background isolate — giải nén
receivePort.listen((message) {
  if (message is TransferableTypedData) {
    final data = message.materialize().asUint8List();
    // Xử lý data mà không cần sao chép thêm
  }
});
```

---

## Các Trường Hợp Sử Dụng

| Trường hợp | Lý do cần isolate |
|---|---|
| Parse JSON lớn | Sẽ chặn render thread nếu làm inline |
| Nén / giải nén | Nặng CPU, mất hàng chục ms |
| Mã hóa / băm | AES, SHA256 trên buffer lớn |
| Giải mã ảnh | Trước khi đưa vào `Canvas` hay widget `Image` |
| Xử lý frame BLE | Byte thô → domain struct |
| Query SQLite nặng | Tránh độ trễ I/O trên main thread |
| Suy luận mô hình ML | TFLite chạy trên background isolate |

---

## Isolate và Ứng Dụng BLE

Đây có lẽ là sự kết hợp thực tế nhất. Ứng dụng BLE nhận một **luồng dữ liệu liên tục** — thông báo characteristic, kết quả quét, frame giao thức — và cần xử lý tất cả mà không ảnh hưởng đến UI.

### Vấn đề khi không có isolate

```
BLE Plugin → Main Isolate → [parse frame] → cập nhật UI
                  ↑
       Jank xuất hiện ở đây nếu việc parse chậm!
```

### Giải pháp với Background Isolate

```dart
// Kiến trúc đề xuất cho BLE + Isolate

class BleProcessor {
  late final SendPort _isolateSendPort;
  final _resultStream = StreamController<DeviceData>.broadcast();

  Stream<DeviceData> get dataStream => _resultStream.stream;

  Future<void> initialize() async {
    final receivePort = ReceivePort();
    await Isolate.spawn(_processorIsolate, receivePort.sendPort);

    receivePort.listen((message) {
      if (message is SendPort) {
        _isolateSendPort = message;
      } else if (message is DeviceData) {
        _resultStream.add(message);
      }
    });
  }

  void processRawFrame(Uint8List bytes) {
    // Gửi byte thô đến isolate để giải mã
    _isolateSendPort.send(TransferableTypedData.fromList([bytes]));
  }
}

void _processorIsolate(SendPort mainPort) {
  final port = ReceivePort();
  mainPort.send(port.sendPort);

  port.listen((message) {
    if (message is TransferableTypedData) {
      final bytes = message.materialize().asUint8List();
      // Giải mã giao thức độc quyền của thiết bị BLE
      final data = _decodeFrame(bytes);
      mainPort.send(data);
    }
  });
}

DeviceData _decodeFrame(Uint8List bytes) {
  // Ví dụ: giao thức thiết bị y tế
  // Byte 0:   loại gói tin
  // Byte 1-4: timestamp (little-endian)
  // Byte 5-6: giá trị cảm biến
  final type = bytes[0];
  final timestamp = ByteData.sublistView(bytes, 1, 5).getUint32(0, Endian.little);
  final value = ByteData.sublistView(bytes, 5, 7).getUint16(0, Endian.big);
  return DeviceData(type: type, timestamp: timestamp, value: value);
}
```

### Flutter 3.7+ — Isolate gọi plugin BLE trực tiếp

```dart
void _bleBackgroundIsolate(RootIsolateToken token) async {
  BackgroundIsolateBinaryMessenger.ensureInitialized(token);

  // Isolate có thể tự quét, kết nối và đọc characteristic
  FlutterBluePlus.scanResults.listen((results) {
    for (final result in results) {
      final processed = _processAdvertisement(result.advertisementData);
      // Gửi kết quả đã xử lý về main isolate
    }
  });

  await FlutterBluePlus.startScan(timeout: const Duration(seconds: 10));
}
```

---

## Thực Tiễn Tốt Nhất

### 1. Dùng `Isolate.run()` cho tác vụ một lần

```dart
// ✅ Sạch, hiện đại, không cần boilerplate
final result = await Isolate.run(() => heavyParsing(data));

// ❌ Tránh dùng — quá dài dòng cho tác vụ đơn giản
final port = ReceivePort();
await Isolate.spawn(heavyParsing, port.sendPort);
```

### 2. Không lạm dụng isolate cho tác vụ nhanh

Khởi tạo isolate tốn khoảng **~1–2 ms** cộng thêm thời gian sao chép dữ liệu. Với tác vụ mất dưới ~5 ms, overhead vượt quá lợi ích.

```dart
// ❌ Không đáng — quá đơn giản
final sum = await Isolate.run(() => list.fold(0, (a, b) => a + b));

// ✅ Tốt hơn — chạy thẳng nếu tầm thường
final sum = list.fold(0, (a, b) => a + b);
```

### 3. Tái sử dụng isolate tồn tại lâu cho stream BLE

Đừng tạo isolate mới cho mỗi frame BLE nhận được. Tạo một isolate chuyên dụng khi khởi động và giữ nó sống suốt phiên kết nối.

```dart
// ✅ Một isolate xử lý nhiều frame
class BleFrameProcessor {
  SendPort? _port;

  Future<void> start() async { /* spawn một lần duy nhất */ }
  void processFrame(Uint8List frame) => _port?.send(frame);
  void dispose() { /* dừng isolate khi phiên kết thúc */ }
}
```

### 4. Ưu tiên `TransferableTypedData` cho buffer lớn

```dart
// ❌ Sao chép toàn bộ buffer
sendPort.send(largeUint8List);

// ✅ Chuyển giao không sao chép — quan trọng với frame BLE thường xuyên
sendPort.send(TransferableTypedData.fromList([largeUint8List]));
```

### 5. Luôn gọi `BackgroundIsolateBinaryMessenger.ensureInitialized()` đầu tiên

Nếu isolate cần truy cập native plugin, đây phải là **dòng đầu tiên** nó thực thi. Mọi lời gọi plugin trước đó sẽ gây `MissingPluginException`.

```dart
void _myIsolate(RootIsolateToken token) async {
  // ✅ Luôn là dòng đầu tiên
  BackgroundIsolateBinaryMessenger.ensureInitialized(token);
  // ... phần còn lại
}
```

### 6. Xử lý lỗi của isolate từ main isolate

Lỗi không được bắt bên trong isolate **không tự động lan truyền** sang main isolate. Dùng `onError` khi spawn để bắt chúng.

```dart
final errorPort = ReceivePort();
await Isolate.spawn(
  _myIsolateEntry,
  sendPort,
  onError: errorPort.sendPort,
);

errorPort.listen((error) {
  final List errorData = error as List;
  print('Lỗi isolate: ${errorData[0]}');
  print('Stack trace: ${errorData[1]}');
});
```

### 7. Luôn đóng ReceivePort khi không còn dùng

`ReceivePort` đang mở ngăn isolate được garbage collect. Đóng khi xong.

```dart
final port = ReceivePort();
// ... dùng port
port.close(); // ✅ Giải phóng tài nguyên
```

---

## Tổng Kết

Background isolate là câu trả lời của Dart cho bài toán concurrency: xử lý song song thực sự không có race condition, nhờ bộ nhớ cô lập và message passing.

Với ứng dụng BLE trong Flutter, đây là công cụ không thể thiếu. Luồng dữ liệu liên tục từ thiết bị được kết nối có thể được parse, giải mã và lọc trên một isolate chuyên dụng trong khi UI hoàn toàn mượt mà. Với Flutter 3.7+, isolate đó thậm chí có thể gọi native plugin trực tiếp, loại bỏ rào cản cuối cùng cho các kiến trúc BLE nền mạnh mẽ trong Flutter.

Quy tắc vàng: **nếu nó block main thread hơn một frame, hãy chuyển sang isolate.**

Cuối tuần vui vẻ!

---

## Tài Liệu Tham Khảo

1. [Dart — Isolates documentation](https://dart.dev/language/isolates)
2. [Flutter — Background isolates (flutter.dev)](https://docs.flutter.dev/perf/isolates)
3. [BackgroundIsolateBinaryMessenger — Flutter 3.7 release notes](https://docs.flutter.dev/release/release-notes/release-notes-3.7.0)
4. [Dart 2.19 — Isolate.run()](https://medium.com/dartlang/dart-2-19-release-notes)
5. [flutter_blue_plus — pub.dev](https://pub.dev/packages/flutter_blue_plus)
