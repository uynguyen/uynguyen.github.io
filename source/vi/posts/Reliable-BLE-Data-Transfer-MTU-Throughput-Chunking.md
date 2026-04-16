---
title: "Truyền Dữ Liệu BLE Đáng Tin Cậy: Xử Lý MTU, Throughput & Chunking"
date: 2026-04-12 10:00:00
tags: [BLE, iOS, Android, Bluetooth, CoreBluetooh]
layout: post
lang: vi
---

![](/Post-Resources/BLE-DataTransfer/cover.png "Cover")

Sớm hay muộn, mọi lập trình viên BLE đều gặp phải cùng một vấn đề: bạn cần gửi hơn 20 byte mỗi lần. Có thể là một firmware image, một lô dữ liệu cảm biến, hoặc một gói cấu hình. Bạn gọi lệnh write và... chỉ có 20 byte đầu tiên đến được. Phần còn lại bị âm thầm bỏ qua.

Gốc rễ của vấn đề này là **MTU (Maximum Transmission Unit)** — số byte tối đa mà một gói tin BLE có thể mang. Hiểu rõ MTU, biết cách thương lượng nó, và xây dựng một lớp chunking đáng tin cậy bên trên là điều thiết yếu cho bất kỳ ứng dụng BLE thực tế nào.

Trong bài viết này, chúng ta sẽ đề cập mọi thứ bạn cần biết: MTU thực sự là gì, cách thương lượng MTU trên iOS và Android, sự khác biệt giữa các loại write, cách xây dựng giao thức chunking, và cách tối đa hóa throughput.

Bắt đầu thôi!

<!-- more -->

---

## Kiến Thức Nền Tảng

Trước khi đi vào code, hãy xây dựng một mô hình tư duy rõ ràng về cách truyền dữ liệu BLE hoạt động.

### Tầng ATT

Việc trao đổi dữ liệu BLE diễn ra qua tầng **ATT (Attribute Protocol)**. Khi bạn đọc hoặc ghi một characteristic, bạn đang gửi một gói tin ATT. Mỗi gói tin ATT có phần overhead cố định **3 byte** (1 byte opcode + 2 byte attribute handle), phần còn lại dành cho payload thực tế của bạn.

```
┌──────────────────────────────────────────┐
│              Gói tin ATT                 │
├──────────┬───────────┬───────────────────┤
│  Opcode  │  Handle   │     Payload       │
│  1 byte  │  2 bytes  │  (MTU - 3) bytes  │
├──────────┴───────────┴───────────────────┤
│           Tổng cộng = MTU bytes          │
└──────────────────────────────────────────┘
```

Vậy payload hiệu dụng mỗi lần write là:

> **Payload hiệu dụng = MTU - 3 bytes**

Với MTU mặc định là **23 byte**, bạn chỉ có **20 byte** dữ liệu sử dụng được mỗi lần write. Đó là lý do tại sao 20 byte là con số kỳ diệu bạn thấy ở khắp nơi.

### MTU vs Độ Dài Gói Tin vs Throughput

Ba khái niệm này có liên quan nhưng khác nhau:

| Khái niệm | Ý nghĩa | Mặc định |
|---|---|---|
| **MTU** | Payload ATT tối đa mỗi gói tin | 23 bytes |
| **Data Length (DLE)** | Payload Link Layer tối đa (Bluetooth 4.2+) | 27 bytes, tối đa 251 |
| **Throughput** | Lượng dữ liệu thực tế truyền được mỗi giây | Phụ thuộc vào nhiều yếu tố |

MTU được thương lượng ở tầng ứng dụng. Data Length Extension (DLE) được thương lượng ở tầng link layer. Cả hai đều cần được tối ưu hóa để đạt throughput tối đa.

---

## Thương Lượng MTU

MTU mặc định của BLE là 23 byte — được thiết kế vào năm 2010 cho các giá trị cảm biến nhỏ. Các thiết bị BLE 4.2+ hiện đại hỗ trợ MTU lên đến **517 byte** (giá trị tối đa theo đặc tả Bluetooth). Để mở khóa giá trị này, central phải yêu cầu MTU lớn hơn một cách rõ ràng.

### Trên iOS (CoreBluetooth)

iOS xử lý thương lượng MTU tự động. Khi bạn kết nối với một peripheral, CoreBluetooth thương lượng MTU cao nhất mà cả hai bên hỗ trợ. Bạn không cần gọi bất kỳ phương thức "request MTU" nào — thay vào đó, bạn chỉ cần truy vấn kết quả:

```swift
// Sau khi kết nối và discover các characteristic
let mtu = peripheral.maximumWriteValueLength(for: .withoutResponse)
print("MTU payload đã thương lượng: \(mtu) bytes")
```

Có hai biến thể:

```swift
// Cho write-without-response — trả về payload tối đa trực tiếp
let mtuWithoutResponse = peripheral.maximumWriteValueLength(for: .withoutResponse)

// Cho write-with-response — luôn trả về min(MTU - 3, 512)
let mtuWithResponse = peripheral.maximumWriteValueLength(for: .withResponse)
```

**Lưu ý quan trọng:** trên iOS, bạn không thể đặt một giá trị MTU cụ thể. Hệ thống tự động thương lượng giá trị tối đa. Từ iOS 16, hầu hết các thiết bị thương lượng **517 byte** MTU khi peripheral hỗ trợ.

### Trên Android

Android yêu cầu gọi MTU request một cách rõ ràng:

```kotlin
// Sau khi kết nối đến GATT server
bluetoothGatt.requestMtu(517) // Yêu cầu giá trị tối đa

// Xử lý callback
override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
    if (status == BluetoothGatt.GATT_SUCCESS) {
        val payload = mtu - 3
        Log.d("BLE", "MTU đã thương lượng: $mtu, payload sử dụng được: $payload bytes")
    }
}
```

**Thời điểm rất quan trọng.** Luôn yêu cầu MTU **sau** khi kết nối được thiết lập nhưng **trước** khi bạn bắt đầu đọc hoặc ghi characteristic. Một sai lầm phổ biến là yêu cầu MTU quá muộn, sau khi MTU mặc định 23 byte đã được sử dụng cho service discovery.

```kotlin
// Luồng kết nối khuyến nghị trên Android
override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
    if (newState == BluetoothProfile.STATE_CONNECTED) {
        // Bước 1: Yêu cầu MTU trước
        gatt.requestMtu(517)
    }
}

override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
    if (status == BluetoothGatt.GATT_SUCCESS) {
        // Bước 2: Bây giờ mới discover service
        gatt.discoverServices()
    }
}
```

### So Sánh MTU Giữa iOS và Android

| Khía cạnh | iOS | Android |
|---|---|---|
| Cách yêu cầu | Tự động | `requestMtu(517)` |
| Mặc định | Tự động thương lượng tối đa | 23 cho đến khi bạn yêu cầu |
| Tối đa hỗ trợ | 517 | 517 |
| Truy vấn kết quả | `maximumWriteValueLength(for:)` | Callback `onMtuChanged` |
| Lỗi thường gặp | Không có — chỉ cần đọc giá trị | Quên gọi `requestMtu` |

---

## Loại Write: With Response vs Without Response

BLE cung cấp hai chế độ write, và việc chọn đúng loại ảnh hưởng trực tiếp đến độ tin cậy và throughput.

### Write With Response (Có Xác Nhận)

```
Central                          Peripheral
   │                                 │
   │──── Write Request ─────────────►│
   │                                 │
   │◄─── Write Response ────────────│
   │                                 │
   │──── Write Request ─────────────►│
   │                                 │
   │◄─── Write Response ────────────│
```

- Peripheral **xác nhận** mỗi lần write.
- Nếu write thất bại, bạn biết ngay lập tức.
- **Chậm hơn** — phải đợi xác nhận trước khi gửi gói tin tiếp theo.
- Payload tối đa mỗi lần write: **min(MTU - 3, 512)** bytes.

### Write Without Response (Không Xác Nhận)

```
Central                          Peripheral
   │                                 │
   │──── Write Command ─────────────►│
   │──── Write Command ─────────────►│
   │──── Write Command ─────────────►│
   │──── Write Command ─────────────►│
   │                                 │
```

- Không có xác nhận — gửi rồi quên.
- **Nhanh hơn nhiều** — có thể xếp hàng nhiều gói tin trong một connection event.
- Có rủi ro mất gói nếu buffer của peripheral bị tràn.
- Payload tối đa mỗi lần write: **(MTU - 3)** bytes.

### Khi Nào Sử Dụng Loại Nào

| Tình huống | Loại Khuyến Nghị |
|---|---|
| Ghi cấu hình | With Response |
| Lệnh quan trọng | With Response |
| Cập nhật firmware (OTA/DFU) | Without Response + ACK ở tầng ứng dụng |
| Streaming dữ liệu cảm biến | Without Response |
| Truyền file lớn | Without Response + giao thức chunking |

Để truyền dữ liệu throughput cao, write-without-response là lựa chọn đúng đắn. Nhưng bạn cần xây dựng lớp đảm bảo tin cậy của riêng mình phía trên — đó là lúc chunking phát huy tác dụng.

---

## Kiểm Soát Luồng: Tránh Tràn Buffer

Khi sử dụng write-without-response, rủi ro lớn nhất là làm tràn buffer nội bộ của BLE stack. Nếu bạn gửi gói tin nhanh hơn tốc độ radio có thể truyền, các gói tin sẽ bị âm thầm loại bỏ.

### iOS — `canSendWriteWithoutResponse`

CoreBluetooth cung cấp cơ chế kiểm soát luồng sẵn có:

```swift
func sendNextChunk() {
    while peripheral.canSendWriteWithoutResponse {
        guard let chunk = nextChunk() else { return }
        peripheral.writeValue(chunk, for: characteristic, type: .withoutResponse)
    }
}

// Được CoreBluetooth gọi khi buffer có chỗ trống
func peripheralIsReady(toSendWriteWithoutResponse peripheral: CBPeripheral) {
    sendNextChunk()
}
```

Đây là cách **đúng đắn** để stream dữ liệu trên iOS. Đừng bao giờ sử dụng timer hoặc delay tùy ý — `peripheralIsReady(toSendWriteWithoutResponse:)` cho bạn biết chính xác khi nào stack sẵn sàng nhận thêm dữ liệu.

### Android — Kiểm Soát Luồng

Trên Android, `writeCharacteristic` trả về `false` nếu buffer nội bộ đầy. Ngoài ra, bạn phải đợi callback `onCharacteristicWrite` trước khi gửi gói tin tiếp theo:

```kotlin
private val writeQueue = ArrayDeque<ByteArray>()
private var isWriting = false

fun enqueueChunk(data: ByteArray) {
    writeQueue.add(data)
    if (!isWriting) writeNext()
}

private fun writeNext() {
    val chunk = writeQueue.pollFirst() ?: run {
        isWriting = false
        return
    }
    isWriting = true
    characteristic.value = chunk
    characteristic.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
    bluetoothGatt.writeCharacteristic(characteristic)
}

override fun onCharacteristicWrite(
    gatt: BluetoothGatt,
    characteristic: BluetoothGattCharacteristic,
    status: Int
) {
    writeNext()
}
```

**Lỗi thường gặp:** gọi write liên tục trong vòng lặp trên Android mà không đợi callback. Điều này gây mất dữ liệu âm thầm và cực kỳ khó debug.

---

## Xây Dựng Giao Thức Chunking

Khi payload vượt quá MTU, bạn cần chia nhỏ thành các chunk, gửi tuần tự, và ghép lại ở phía bên kia. Dưới đây là thiết kế giao thức thực tế.

### Định Dạng Gói Tin

```
┌─────────┬──────────┬─────────────────────┐
│  Flags  │  Seq #   │      Payload        │
│ 1 byte  │ 2 bytes  │  (MTU - 6) bytes    │
└─────────┴──────────┴─────────────────────┘

Flags:
  bit 0: SOF (Start of Frame)  — chunk đầu tiên
  bit 1: EOF (End of Frame)    — chunk cuối cùng
  bit 2: ACK request           — peripheral cần xác nhận
```

Với MTU 517 byte, mỗi chunk mang được tối đa **511 byte** payload (517 - 3 overhead ATT - 3 header giao thức).

### Triển Khai Trên iOS

```swift
struct ChunkHeader {
    static let size = 3 // 1 flag + 2 sequence
    static let sof: UInt8  = 0x01
    static let eof: UInt8  = 0x02
    static let ack: UInt8  = 0x04
}

class BLEChunkedSender {
    private let peripheral: CBPeripheral
    private let characteristic: CBCharacteristic
    private let chunkSize: Int

    init(peripheral: CBPeripheral, characteristic: CBCharacteristic) {
        self.peripheral = peripheral
        self.characteristic = characteristic
        let mtu = peripheral.maximumWriteValueLength(for: .withoutResponse)
        self.chunkSize = mtu - ChunkHeader.size
    }

    private var chunks: [Data] = []
    private var currentIndex = 0

    func send(data: Data) {
        chunks = buildChunks(from: data)
        currentIndex = 0
        sendNextChunk()
    }

    private func buildChunks(from data: Data) -> [Data] {
        var result: [Data] = []
        let totalChunks = Int(ceil(Double(data.count) / Double(chunkSize)))

        for i in 0..<totalChunks {
            let start = i * chunkSize
            let end = min(start + chunkSize, data.count)
            let payload = data[start..<end]

            var flags: UInt8 = 0
            if i == 0 { flags |= ChunkHeader.sof }
            if i == totalChunks - 1 { flags |= ChunkHeader.eof }

            var header = Data()
            header.append(flags)
            var seq = UInt16(i)
            header.append(Data(bytes: &seq, count: 2))

            result.append(header + payload)
        }
        return result
    }

    func sendNextChunk() {
        while peripheral.canSendWriteWithoutResponse && currentIndex < chunks.count {
            peripheral.writeValue(chunks[currentIndex], for: characteristic, type: .withoutResponse)
            currentIndex += 1
        }
    }

    // Gọi hàm này từ peripheralIsReady(toSendWriteWithoutResponse:)
    func onReadyToSend() {
        sendNextChunk()
    }
}
```

### Phía Nhận (Peripheral / Firmware)

Peripheral ghép lại dữ liệu dựa trên flags và sequence number:

```
1. Nhận chunk
2. Nếu SOF → cấp phát buffer mới, reset sequence kỳ vọng về 0
3. Xác minh sequence number khớp với giá trị kỳ vọng
4. Nối payload vào buffer
5. Tăng sequence kỳ vọng
6. Nếu EOF → buffer đã hoàn chỉnh, xử lý toàn bộ payload
7. Nếu sequence không khớp → yêu cầu truyền lại từ sequence đó
```

---

## Tối Đa Hóa Throughput

Throughput BLE phụ thuộc vào nhiều yếu tố phối hợp cùng nhau. Dưới đây là cách tối ưu từng yếu tố.

### 1. Thương Lượng MTU Tối Đa

```
MTU 23  → 20 bytes/gói tin   → ~2.5 KB/s thông thường
MTU 185 → 182 bytes/gói tin  → ~18 KB/s thông thường
MTU 517 → 514 bytes/gói tin  → ~45 KB/s thông thường
```

Luôn yêu cầu 517. Ngay cả khi peripheral hỗ trợ ít hơn, quá trình thương lượng sẽ chọn giá trị chung cao nhất.

### 2. Bật Data Length Extension (DLE)

DLE tăng kích thước gói tin Link Layer từ 27 lên 251 byte. Điều này có nghĩa là ít gói tin radio hơn cho mỗi payload ATT. Trên iOS, DLE được bật tự động. Trên Android 5.0+, thường tự động sau khi thương lượng MTU, nhưng một số thiết bị yêu cầu:

```kotlin
// Android — một số thiết bị cần yêu cầu DLE rõ ràng
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
    bluetoothGatt.requestMtu(517) // Thường kích hoạt DLE tự động
}
```

### 3. Sử Dụng Write Without Response

Write-with-response bị giới hạn **một gói tin mỗi connection event** do vòng lặp ACK. Write-without-response có thể đóng gói **nhiều gói tin** vào một connection event duy nhất.

```
With Response:    1 gói tin × 514 bytes mỗi event
Without Response: 4-6 gói tin × 514 bytes mỗi event  ← nhanh hơn tới 6 lần
```

### 4. Yêu Cầu Connection Interval Ngắn Hơn

Connection interval xác định tần suất central và peripheral trao đổi dữ liệu. Interval ngắn hơn nghĩa là nhiều cơ hội gửi gói tin hơn.

```
Connection interval 30ms  → ~33 event/giây
Connection interval 15ms  → ~67 event/giây (tối thiểu trên iOS)
Connection interval 7.5ms → ~133 event/giây (tối thiểu trên Android)
```

Trên iOS, bạn không thể đặt connection interval trực tiếp — CoreBluetooth chọn giá trị dựa trên các tham số ưa thích của peripheral. Trên Android:

```kotlin
// Android — yêu cầu kết nối ưu tiên cao (interval ngắn hơn)
bluetoothGatt.requestConnectionPriority(BluetoothGatt.CONNECTION_PRIORITY_HIGH)
```

**Cảnh báo:** interval ngắn hơn làm tăng đáng kể mức tiêu thụ pin. Chỉ sử dụng `CONNECTION_PRIORITY_HIGH` trong quá trình truyền dữ liệu, sau đó chuyển lại:

```kotlin
// Sau khi truyền xong
bluetoothGatt.requestConnectionPriority(BluetoothGatt.CONNECTION_PRIORITY_BALANCED)
```

### 5. Tính Toán Throughput

Throughput tối đa lý thuyết:

```
Throughput = (MTU - 3) × số_gói_mỗi_event × (1000 / connection_interval_ms)

Ví dụ với thiết lập tối ưu:
= 514 bytes × 6 gói tin × (1000 / 7.5)
= 514 × 6 × 133
= ~400 KB/s tối đa lý thuyết
```

Trong thực tế, hãy kỳ vọng **30-80 KB/s** trên iOS và **50-100 KB/s** trên Android với các tham số được điều chỉnh tốt. Các yếu tố thực tế như nhiễu RF, các kết nối BLE khác, và giới hạn firmware của peripheral sẽ làm giảm giá trị lý thuyết tối đa.

---

## Các Lỗi Thường Gặp

### 1. Gửi Dữ Liệu Mà Không Thương Lượng MTU

```
// Android — quên gọi requestMtu()
// Kết quả: mỗi lần write bị giới hạn ở 20 byte, bị cắt ngắn âm thầm
```

Luôn thương lượng MTU trước bất kỳ quá trình truyền dữ liệu nào.

### 2. Ghi Trong Vòng Lặp Liên Tục

```swift
// iOS — SAI
for chunk in chunks {
    peripheral.writeValue(chunk, for: characteristic, type: .withoutResponse)
}
// Nhiều chunk bị âm thầm loại bỏ vì buffer bị tràn
```

Hãy sử dụng `canSendWriteWithoutResponse` và `peripheralIsReady(toSendWriteWithoutResponse:)` thay vào đó.

### 3. Bỏ Qua Khả Năng Hỗ Trợ Loại Write

Không phải mọi characteristic đều hỗ trợ cả hai loại write. Luôn kiểm tra:

```swift
if characteristic.properties.contains(.writeWithoutResponse) {
    // Có thể dùng .withoutResponse
}
if characteristic.properties.contains(.write) {
    // Có thể dùng .withResponse
}
```

### 4. Hardcode Giá Trị MTU

```swift
// SAI — hardcode
let chunkSize = 20

// ĐÚNG — động
let chunkSize = peripheral.maximumWriteValueLength(for: .withoutResponse)
```

MTU khác nhau giữa các thiết bị. Luôn truy vấn tại thời điểm chạy.

### 5. Không Xử Lý Ngắt Kết Nối Trong Quá Trình Truyền

Các lần truyền dài có thể bị gián đoạn do ngắt kết nối. Giao thức chunking của bạn nên hỗ trợ tiếp tục:

```swift
class ResumeableTransfer {
    private var lastAckedSequence: UInt16 = 0

    func resume() {
        // Tiếp tục từ lastAckedSequence thay vì bắt đầu lại
        currentIndex = Int(lastAckedSequence)
        sendNextChunk()
    }
}
```

---

## Tổng Hợp Các Thực Tiễn Tốt Nhất

1. **Luôn thương lượng MTU tối đa** — gọi `requestMtu(517)` trên Android; trên iOS thì tự động, chỉ cần đọc kết quả.
2. **Sử dụng write-without-response cho dữ liệu lớn** — nhanh hơn 4-6 lần so với write-with-response.
3. **Tôn trọng kiểm soát luồng** — sử dụng `canSendWriteWithoutResponse` trên iOS và đợi callback trên Android. Đừng bao giờ lặp một cách mù quáng.
4. **Xây dựng giao thức chunking** — bao gồm sequence number và cờ start/end để ghép lại và phục hồi lỗi.
5. **Truy vấn MTU tại thời điểm chạy** — đừng bao giờ hardcode 20 byte. Các thiết bị thương lượng giá trị MTU khác nhau.
6. **Yêu cầu ưu tiên kết nối cao trong quá trình truyền** — trên Android, sử dụng `CONNECTION_PRIORITY_HIGH` trong khi truyền, sau đó chuyển về balanced.
7. **Xử lý ngắt kết nối một cách khéo léo** — hỗ trợ truyền có thể tiếp tục cho các payload lớn.
8. **Kiểm thử trên thiết bị thật** — simulator không phản ánh hành vi BLE thực tế. Luôn xác thực throughput và độ tin cậy trên phần cứng vật lý trong môi trường RF có nhiễu.

---

## Tổng Kết

Truyền dữ liệu BLE trông đơn giản trên bề mặt — ghi byte vào một characteristic — nhưng để làm đúng đòi hỏi hiểu toàn bộ stack: thương lượng MTU, loại write, kiểm soát luồng, và chunking. Giới hạn 20 byte mặc định không phải là bức tường cứng, nó chỉ là điểm khởi đầu.

Với thương lượng MTU đúng cách (517 byte), write-without-response, kiểm soát luồng, và giao thức chunking được thiết kế tốt, bạn có thể đạt **30-100 KB/s** throughput đáng tin cậy — quá đủ cho cập nhật firmware, file cấu hình, và các lô dữ liệu cảm biến.

Điều quan trọng nhất: **đừng bao giờ gửi dữ liệu BLE mà không biết MTU của bạn, và đừng bao giờ stream mà không có kiểm soát luồng.** Làm đúng hai điều này, phần còn lại sẽ tự nhiên đi theo.

Chúc cuối tuần vui vẻ!

---

## Tài Liệu Tham Khảo

1. [Bluetooth Core Specification v5.3 — Vol 3, Part F (ATT)](https://www.bluetooth.com/specifications/specs/core-specification-5-3/)
2. [Apple — Core Bluetooth Programming Guide](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html)
3. [Android — BLE Overview](https://developer.android.com/develop/connectivity/bluetooth/ble/ble-overview)
4. [Nordic Semiconductor — Optimizing BLE Throughput](https://devzone.nordicsemi.com/guides/short-range-guides/b/bluetooth-low-energy/posts/ble-throughput-part-1)
5. [Punch Through — Maximizing BLE Throughput](https://punchthrough.com/maximizing-ble-throughput-on-ios-and-android/)
