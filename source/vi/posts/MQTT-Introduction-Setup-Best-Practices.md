---
title: "MQTT: Giới thiệu, Cài đặt và Best Practices"
date: 2026-03-29 10:00:00
tags: [MQTT, IoT, Networking, Protocol, Swift, Python]
lang: vi
layout: post
thumbnail: /Post-Resources/MQTT/cover.png
---

MQTT (Message Queuing Telemetry Transport) là một giao thức nhắn tin publish/subscribe nhẹ, được thiết kế cho các thiết bị bị giới hạn tài nguyên và mạng không ổn định. Ban đầu được IBM phát triển vào cuối những năm 1990 để giám sát đường ống dầu qua liên kết vệ tinh, ngày nay nó đã trở thành tiêu chuẩn thực tế cho giao tiếp IoT — từ cảm biến nhà thông minh đến hệ thống tự động hóa công nghiệp.

Trong bài viết này, chúng ta sẽ tìm hiểu MQTT là gì, cách cài đặt, các ví dụ thực tế, trường hợp sử dụng, điểm mạnh/yếu và những best practices cần tuân theo.

<!-- more -->

---

## MQTT Hoạt Động Như Thế Nào

MQTT được xây dựng xung quanh ba vai trò:

- **Publisher**: client gửi tin nhắn lên một topic.
- **Subscriber**: client nhận tin nhắn từ các topic đã đăng ký.
- **Broker**: server đứng ở giữa, nhận tất cả tin nhắn từ publisher và định tuyến đến subscriber tương ứng.

```
┌──────────────┐       publish        ┌──────────────┐
│  Publisher   │ ──── topic/data ───► │              │
└──────────────┘                      │    Broker    │
                                      │              │
┌──────────────┐       subscribe      │              │
│  Subscriber  │ ◄─── topic/data ──── │              │
└──────────────┘                      └──────────────┘
```

Các client không bao giờ giao tiếp trực tiếp với nhau. Mọi tin nhắn đều đi qua broker. Sự tách biệt này có nghĩa là publisher và subscriber không cần biết về nhau — thậm chí không cần online cùng lúc (với persistent session).

### Topics

Topic là các chuỗi phân cấp đóng vai trò là khóa định tuyến:

```
home/livingroom/temperature
home/livingroom/humidity
home/bedroom/temperature
factory/line1/machine3/status
```

Subscriber có thể dùng ký tự đại diện (wildcard):
- `+` khớp một cấp: `home/+/temperature` khớp `home/livingroom/temperature` và `home/bedroom/temperature`.
- `#` khớp tất cả các cấp còn lại: `home/#` khớp mọi thứ bên dưới `home/`.

### Quality of Service (QoS)

MQTT cung cấp ba mức độ đảm bảo giao nhận:

| QoS | Tên | Đảm bảo |
|-----|-----|---------|
| 0 | At most once | Gửi và quên. Tin nhắn có thể bị mất. |
| 1 | At least once | Đảm bảo giao nhận, nhưng có thể có bản sao. |
| 2 | Exactly once | Đảm bảo giao nhận, không có bản sao. Chậm nhất. |

---

## Cài Đặt Broker

Broker mã nguồn mở phổ biến nhất là **Mosquitto**. Để chạy trên máy local:

```bash
# macOS
brew install mosquitto
brew services start mosquitto

# Ubuntu / Debian
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
```

Kiểm tra nhanh bằng command-line client:

```bash
# Terminal 1: đăng ký nhận tin
mosquitto_sub -h localhost -t "test/topic"

# Terminal 2: gửi tin
mosquitto_pub -h localhost -t "test/topic" -m "hello world"
```

Cho môi trường production, hãy cân nhắc broker được quản lý:
- **HiveMQ Cloud** — có gói miễn phí, dễ mở rộng.
- **AWS IoT Core** — tích hợp chặt với AWS, tính phí theo từng tin nhắn.
- **EMQX** — hiệu năng cao, mã nguồn mở, sẵn sàng cho doanh nghiệp.

### Cấu Hình Mosquitto Cơ Bản

`/etc/mosquitto/mosquitto.conf`:

```conf
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwords

# TLS
listener 8883
certfile /etc/letsencrypt/live/yourdomain.com/cert.pem
keyfile  /etc/letsencrypt/live/yourdomain.com/privkey.pem
cafile   /etc/letsencrypt/live/yourdomain.com/chain.pem
```

Tạo user:
```bash
mosquitto_passwd -c /etc/mosquitto/passwords myuser
```

---

## Ví Dụ Code

### Python (paho-mqtt)

```bash
pip install paho-mqtt
```

**Publisher:**

```python
import paho.mqtt.client as mqtt

client = mqtt.Client(client_id="publisher-1")
client.username_pw_set("myuser", "mypassword")
client.connect("localhost", 1883, keepalive=60)

client.publish("home/livingroom/temperature", payload="22.5", qos=1, retain=False)
client.disconnect()
```

**Subscriber:**

```python
import paho.mqtt.client as mqtt

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe("home/#", qos=1)

def on_message(client, userdata, msg):
    print(f"{msg.topic}: {msg.payload.decode()}")

client = mqtt.Client(client_id="subscriber-1")
client.username_pw_set("myuser", "mypassword")
client.on_connect = on_connect
client.on_message = on_message

client.connect("localhost", 1883, keepalive=60)
client.loop_forever()
```

---

### Swift (CocoaMQTT)

Thêm vào `Package.swift` hoặc Podfile:

```ruby
pod 'CocoaMQTT'
```

**Kết nối và đăng ký nhận tin:**

```swift
import CocoaMQTT

class MQTTService: CocoaMQTTDelegate {
    private var mqtt: CocoaMQTT?

    func connect() {
        let clientID = "ios-client-\(UUID().uuidString)"
        mqtt = CocoaMQTT(clientID: clientID, host: "localhost", port: 1883)
        mqtt?.username = "myuser"
        mqtt?.password = "mypassword"
        mqtt?.keepAlive = 60
        mqtt?.delegate = self
        mqtt?.connect()
    }

    func publish(topic: String, message: String) {
        mqtt?.publish(topic, withString: message, qos: .qos1, retained: false)
    }

    // MARK: - CocoaMQTTDelegate

    func mqtt(_ mqtt: CocoaMQTT, didConnectAck ack: CocoaMQTTConnAck) {
        guard ack == .accept else { return }
        mqtt.subscribe("home/#", qos: .qos1)
    }

    func mqtt(_ mqtt: CocoaMQTT, didReceiveMessage message: CocoaMQTTMessage, id: UInt16) {
        let payload = message.string ?? ""
        print("\(message.topic): \(payload)")
    }

    func mqtt(_ mqtt: CocoaMQTT, didDisconnectWithError err: Error?) {
        // Xử lý kết nối lại
    }

    func mqtt(_ mqtt: CocoaMQTT, didPublishMessage message: CocoaMQTTMessage, id: UInt16) {}
    func mqtt(_ mqtt: CocoaMQTT, didPublishAck id: UInt16) {}
    func mqtt(_ mqtt: CocoaMQTT, didSubscribeTopics success: NSDictionary, failed: [String]) {}
    func mqtt(_ mqtt: CocoaMQTT, didUnsubscribeTopics topics: [String]) {}
    func mqttDidPing(_ mqtt: CocoaMQTT) {}
    func mqttDidReceivePong(_ mqtt: CocoaMQTT) {}
    func mqttDidDisconnect(_ mqtt: CocoaMQTT, withError err: Error?) {}
}
```

---

### Retained Messages và Last Will

**Retained message**: broker lưu tin nhắn mới nhất của một topic và gửi ngay cho subscriber mới khi họ đăng ký. Hữu ích cho trạng thái thiết bị.

```python
# Đánh dấu retain để subscriber mới nhận được trạng thái hiện tại ngay lập tức
client.publish("devices/sensor1/status", "online", qos=1, retain=True)
```

**Last Will and Testament (LWT)**: tin nhắn mà broker tự động publish nếu client ngắt kết nối bất thường (không gửi gói DISCONNECT). Thiết yếu để phát hiện thiết bị offline.

```python
client.will_set("devices/sensor1/status", payload="offline", qos=1, retain=True)
client.connect("localhost", 1883)
```

---

## Các Trường Hợp Sử Dụng Thực Tế

### 1. Nhà Thông Minh
Cảm biến publish nhiệt độ, độ ẩm và sự kiện chuyển động. Bộ điều khiển nhà thông minh (ví dụ Home Assistant) đăng ký và kích hoạt hành động — bật sưởi, gửi cảnh báo, điều khiển đèn.

```
home/bedroom/temperature  →  22.1
home/hallway/motion       →  detected
home/kitchen/light/set    →  ON
```

### 2. IoT Công Nghiệp (IIoT)
Thiết bị sản xuất publish trạng thái máy móc, chỉ số rung và mã lỗi. Dashboard giám sát tổng hợp và cảnh báo khi vượt ngưỡng.

### 3. Theo Dõi Đội Xe
Xe cộ publish tọa độ GPS mỗi vài giây qua kết nối di động. Một service backend đăng ký và cập nhật bản đồ trực tiếp. Overhead thấp của MQTT phù hợp cho cập nhật tần suất cao ở quy mô lớn.

### 4. Giao Tiếp Ứng Dụng Mobile ↔ Thiết Bị IoT
Ứng dụng mobile publish lệnh đến thiết bị (ví dụ khóa thông minh) và đăng ký nhận cập nhật trạng thái. Broker tách biệt app khỏi thiết bị — app không cần biết địa chỉ IP của thiết bị.

### 5. Event Bus cho Microservices
Trong hệ thống backend, các service publish event (ví dụ `orders/created`, `payments/processed`) và các service downstream đăng ký để phản ứng. Đây là phương án thay thế đơn giản cho Kafka với hệ thống throughput thấp hơn.

---

## Ưu Và Nhược Điểm

### Điểm Mạnh

| Điểm mạnh | Lý do quan trọng |
|-----------|-----------------|
| **Giao thức nhẹ** | Overhead header tối thiểu (2-byte fixed header). Lý tưởng cho thiết bị bị giới hạn và đường truyền băng thông thấp. |
| **Tách biệt publish/subscribe** | Publisher và subscriber hoàn toàn độc lập. Một bên có thể offline mà không ảnh hưởng bên kia. |
| **Các mức QoS** | Chọn đảm bảo giao nhận phù hợp cho từng tin nhắn. Dữ liệu quan trọng dùng QoS 2; telemetry dùng QoS 0. |
| **Retained messages** | Subscriber mới nhận ngay trạng thái hiện tại mà không cần chờ lần publish tiếp theo. |
| **Last Will and Testament** | Tự động thông báo "offline" khi client ngắt kết nối bất thường. |
| **Persistent session** | Broker xếp hàng tin nhắn cho subscriber offline (QoS > 0) và giao khi kết nối lại. |
| **Hệ sinh thái rộng** | Client tồn tại cho mọi ngôn ngữ và nền tảng. Broker từ nhúng (Mosquitto) đến quy mô cloud (AWS IoT Core). |

### Điểm Yếu

| Điểm yếu | Tác động |
|----------|----------|
| **Không có schema enforcement** | Broker định tuyến byte tùy ý. Client phải tự thỏa thuận format payload — dễ bị phá vỡ ngầm. |
| **Không có request/response tích hợp** | MQTT là fire-and-forget. Để implement RPC cần tự quản lý correlation ID và response topic. |
| **Broker là single point of failure** | Không có clustering hoặc failover, broker crash sẽ làm gián đoạn toàn bộ giao tiếp. |
| **Cấu trúc topic khó thay đổi** | Sau khi thiết bị đã triển khai, đổi cấu trúc topic đòi hỏi cập nhật phần cứng/phần mềm đồng bộ. |
| **Không có access control theo topic theo mặc định** | Cần cấu hình broker rõ ràng (ACL file hoặc auth plugin) để giới hạn client nào được publish/subscribe topic nào. |
| **Không lý tưởng cho payload lớn** | Thiết kế cho tin nhắn nhỏ và thường xuyên. Transfer file lớn nên dùng HTTP/S3, MQTT chỉ dùng để báo hiệu. |

---

## Best Practices

### Thiết Kế Topic

- **Dùng phân cấp phản ánh domain của bạn**: `{location}/{device}/{measurement}` hoặc `{org}/{fleet}/{vehicleId}/{metric}`.
- **Cụ thể hóa**: ưu tiên `devices/sensor1/temperature` hơn `sensor_data`.
- **Không bắt đầu topic bằng `/`** — tạo ra cấp đầu tiên rỗng.
- **Dành topic `$`** — broker dùng nội bộ (ví dụ `$SYS/#` cho số liệu broker).
- **Tránh dấu cách và ký tự đặc biệt** trong tên topic.
- **Chốt cấu trúc topic sớm** — rất khó thay đổi sau khi thiết bị đã được triển khai thực tế.

### Bảo Mật

- **Luôn dùng TLS (cổng 8883)** trong môi trường production. MQTT thường (cổng 1883) gửi thông tin xác thực không mã hóa.
- **Xác thực mọi client** — không bao giờ cho phép kết nối ẩn danh trong production.
- **Dùng thông tin xác thực riêng cho từng client** — không chia sẻ một username/password cho tất cả thiết bị.
- **Enforce ACL** để client chỉ được publish/subscribe các topic của mình.
- **Luân chuyển thông tin xác thực** định kỳ, đặc biệt sau khi ngừng sử dụng thiết bị.

### Chọn QoS

- **QoS 0** cho telemetry tần suất cao mà việc mất vài tin không sao (đọc cảm biến mỗi giây).
- **QoS 1** cho hầu hết các lệnh điều khiển — đảm bảo giao nhận, xử lý bản sao một cách phòng thủ.
- **QoS 2** chỉ khi giao nhận trùng thực sự có hại (giao dịch tài chính, lệnh actuator không được phép lặp lại).

Tránh mặc định QoS 2 ở mọi nơi — mỗi tin nhắn cần bốn round-trip mạng, làm giảm đáng kể throughput.

### Format Payload

- **Dùng format có cấu trúc**: JSON cho dễ đọc khi phát triển, Protocol Buffers hoặc CBOR cho production để giảm kích thước payload.
- **Luôn ghi timestamp trong payload**, không chỉ trong topic. Timestamp sống sót qua log replay và pipeline phân tích.
- **Phiên bản hóa schema payload từ ngày đầu**: `{"v": 1, "ts": 1700000000, "temp": 22.5}`.

### Quản Lý Kết Nối

- **Luôn đặt giá trị `keepAlive` có ý nghĩa** (60–120 giây là thông thường). Quá ngắn tốn băng thông; quá dài chậm phát hiện kết nối chết.
- **Luôn cấu hình Last Will** cho thiết bị cần báo cáo trạng thái hiện diện.
- **Dùng exponential backoff** khi kết nối lại — không nên retry liên tục gây quá tải broker.

```swift
func reconnect(attempt: Int) {
    let delay = min(pow(2.0, Double(attempt)), 60.0) // tối đa 60 giây
    DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
        self.mqtt?.connect()
    }
}
```

- **Dùng persistent session** (clean session = false) cho subscriber không được phép bỏ lỡ tin nhắn khi offline.

### Broker

- **Chạy broker sau load balancer** với ít nhất một hot standby cho workload production.
- **Theo dõi topic `$SYS/#`** — Mosquitto publish số liệu broker (client đang kết nối, tin nhắn/giây, bytes vào/ra) ở đó.
- **Đặt `max_queued_messages`** để giới hạn số tin nhắn QoS 1/2 được xếp hàng cho client offline. Hàng đợi không giới hạn có thể làm cạn kiệt bộ nhớ broker.

---

## Kết Luận

Sự đơn giản của MQTT chính là sức mạnh của nó. Footprint nhỏ, mức QoS linh hoạt và các tính năng tích hợp như retained messages và Last Will khiến nó là công cụ phù hợp cho nhắn tin IoT, giao tiếp mobile-to-device và kiến trúc hướng sự kiện nhẹ.

Những điều cần làm đúng ngay từ đầu là cấu trúc topic, bảo mật (TLS + xác thực + ACL) và phiên bản hóa schema payload. Những quyết định này rất khó thay đổi khi thiết bị đã được triển khai thực tế.

## Tham Khảo

[1] [MQTT Specification v5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)
[2] [Eclipse Mosquitto](https://mosquitto.org/)
[3] [HiveMQ MQTT Essentials](https://www.hivemq.com/mqtt-essentials/)
[4] [paho-mqtt Python client](https://eclipse.dev/paho/index.php?page=clients/python/index.php)
[5] [CocoaMQTT for iOS/macOS](https://github.com/emqx/CocoaMQTT)
