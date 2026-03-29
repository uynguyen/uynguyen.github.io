---
title: "MQTT: Introduction, Setup, and Best Practices"
date: 2026-03-29 10:00:00
tags: [MQTT, IoT, Networking, Protocol, Swift, Python]
---

![](/Post-Resources/MQTT/cover.png "Cover")

MQTT (Message Queuing Telemetry Transport) is a lightweight publish/subscribe messaging protocol designed for constrained devices and unreliable networks. Originally developed by IBM in the late 1990s for monitoring oil pipelines over satellite links, it has since become the de-facto standard for IoT communication — powering everything from smart home sensors to industrial automation systems.

In this post, we'll cover what MQTT is, how to set it up, practical examples, real-world use cases, its strengths and weaknesses, and the best practices you should follow.

<!-- more -->

---

## How MQTT Works

MQTT is built around three roles:

- **Publisher**: a client that sends messages to a topic.
- **Subscriber**: a client that receives messages from topics it has subscribed to.
- **Broker**: the server that sits in the middle, receiving all messages from publishers and routing them to the correct subscribers.

```
┌──────────────┐       publish        ┌──────────────┐
│  Publisher   │ ──── topic/data ───► │              │
└──────────────┘                      │    Broker    │
                                      │              │
┌──────────────┐       subscribe      │              │
│  Subscriber  │ ◄─── topic/data ──── │              │
└──────────────┘                      └──────────────┘
```

Clients never communicate directly with each other. All messages pass through the broker. This decoupling means publishers and subscribers don't need to know about each other — or even be online at the same time (with persistent sessions).

### Topics

Topics are hierarchical strings that act as routing keys:

```
home/livingroom/temperature
home/livingroom/humidity
home/bedroom/temperature
factory/line1/machine3/status
```

Subscribers can use wildcards:
- `+` matches one level: `home/+/temperature` matches `home/livingroom/temperature` and `home/bedroom/temperature`.
- `#` matches all remaining levels: `home/#` matches everything under `home/`.

### Quality of Service (QoS)

MQTT offers three delivery guarantees:

| QoS | Name | Guarantee |
|-----|------|-----------|
| 0 | At most once | Fire and forget. Message may be lost. |
| 1 | At least once | Guaranteed delivery, but duplicates possible. |
| 2 | Exactly once | Guaranteed delivery, no duplicates. Slowest. |

---

## Setting Up a Broker

The most popular open-source broker is **Mosquitto**. To run it locally:

```bash
# macOS
brew install mosquitto
brew services start mosquitto

# Ubuntu / Debian
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
```

For a quick test using the command-line clients:

```bash
# Terminal 1: subscribe
mosquitto_sub -h localhost -t "test/topic"

# Terminal 2: publish
mosquitto_pub -h localhost -t "test/topic" -m "hello world"
```

For production, consider a managed broker:
- **HiveMQ Cloud** — free tier available, scales easily.
- **AWS IoT Core** — tight AWS integration, per-message pricing.
- **EMQX** — high-performance, open-source, enterprise-ready.

### Basic Mosquitto Configuration

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

Create a user:
```bash
mosquitto_passwd -c /etc/mosquitto/passwords myuser
```

---

## Code Examples

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

Add to your `Package.swift` or Podfile:

```ruby
pod 'CocoaMQTT'
```

**Connecting and subscribing:**

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
        // Handle reconnection
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

### Retained Messages and Last Will

**Retained message**: the broker stores the last message on a topic and delivers it immediately to any new subscriber. Useful for device status.

```python
# Mark as retained so new subscribers get the current state immediately
client.publish("devices/sensor1/status", "online", qos=1, retain=True)
```

**Last Will and Testament (LWT)**: a message the broker publishes automatically if a client disconnects ungracefully (no DISCONNECT packet). Essential for presence detection.

```python
client.will_set("devices/sensor1/status", payload="offline", qos=1, retain=True)
client.connect("localhost", 1883)
```

---

## Real-World Use Cases

### 1. Smart Home
Sensors publish temperature, humidity, and motion events. A home automation controller (e.g. Home Assistant) subscribes and triggers actions — turning on heating, sending alerts, controlling lights.

```
home/bedroom/temperature  →  22.1
home/hallway/motion       →  detected
home/kitchen/light/set    →  ON
```

### 2. Industrial IoT (IIoT)
Manufacturing equipment publishes machine status, vibration readings, and error codes. A monitoring dashboard aggregates and alerts when thresholds are exceeded.

### 3. Fleet Tracking
Vehicles publish GPS coordinates every few seconds over a cellular connection. A backend service subscribes and updates a live map. MQTT's low overhead makes it suitable for high-frequency updates at scale.

### 4. Mobile App ↔ IoT Device Communication
A mobile app publishes commands to a device (e.g. a smart lock) and subscribes to status updates. The broker decouples the app from the device — the app doesn't need to know the device's IP address.

### 5. Microservices Event Bus
Within a backend system, services publish events (e.g. `orders/created`, `payments/processed`) and downstream services subscribe to react. This is a simple alternative to Kafka for lower-throughput systems.

---

## The Good and the Bad

### Strengths

| Strength | Why it Matters |
|----------|----------------|
| **Lightweight protocol** | Minimal header overhead (2-byte fixed header). Ideal for constrained devices and low-bandwidth links. |
| **Publish/subscribe decoupling** | Publishers and subscribers are completely independent. Either side can be offline without breaking the other. |
| **QoS levels** | Choose the right delivery guarantee per message. Critical data can use QoS 2; telemetry can use QoS 0. |
| **Retained messages** | New subscribers immediately get current state without waiting for the next publish. |
| **Last Will and Testament** | Automatic "offline" notification when a client disconnects ungracefully. |
| **Persistent sessions** | The broker queues messages for offline subscribers (QoS > 0) and delivers them on reconnection. |
| **Wide ecosystem** | Clients exist for every language and platform. Brokers range from embedded (Mosquitto) to cloud-scale (AWS IoT Core). |

### Weaknesses

| Weakness | Impact |
|----------|--------|
| **No message schema enforcement** | The broker routes arbitrary bytes. Clients must agree on payload format out of band — easy to break silently. |
| **No built-in request/response** | MQTT is fire-and-forget. Implementing RPC requires manual correlation IDs and response topics. |
| **Broker is a single point of failure** | Without clustering or failover, a broker crash takes down all communication. |
| **Topic design is hard to change** | Once devices are deployed, changing topic structure requires coordinated firmware/software updates. |
| **No access control per topic by default** | Requires explicit broker configuration (ACL files or plugin-based auth) to restrict which clients can publish/subscribe to which topics. |
| **Not ideal for large payloads** | Designed for small, frequent messages. Large binary transfers are better handled over HTTP/S3 with MQTT used only for signaling. |

---

## Best Practices

### Topic Design

- **Use a hierarchy that reflects your domain**: `{location}/{device}/{measurement}` or `{org}/{fleet}/{vehicleId}/{metric}`.
- **Be specific**: prefer `devices/sensor1/temperature` over `sensor_data`.
- **Never start a topic with `/`** — it creates an empty first level.
- **Reserve `$` topics** — they are used by the broker internally (e.g. `$SYS/#` for broker stats).
- **Avoid spaces and special characters** in topic names.
- **Lock down your topic structure early** — it is very hard to change after devices are in production.

### Security

- **Always use TLS (port 8883)** in production. Plain MQTT (port 1883) sends credentials in the clear.
- **Authenticate every client** — never allow anonymous connections in production.
- **Use per-client credentials** — don't share a single username/password across all devices.
- **Enforce ACLs** so clients can only publish/subscribe to the topics they own.
- **Rotate credentials** regularly, especially after a device is decommissioned.

### QoS Selection

- **QoS 0** for high-frequency telemetry where occasional loss is acceptable (sensor readings every second).
- **QoS 1** for most command and control messages — delivery guaranteed, handle duplicates defensively.
- **QoS 2** only when duplicate delivery is genuinely harmful (financial transactions, actuator commands that must not repeat).

Avoid defaulting to QoS 2 everywhere — it requires four network round-trips per message and significantly reduces throughput.

### Payload Format

- **Use a structured format**: JSON for readability during development, Protocol Buffers or CBOR for production to reduce payload size.
- **Include a timestamp in the payload**, not just in the topic. Timestamps survive log replay and analytics pipelines.
- **Version your payload schema** from day one: `{"v": 1, "ts": 1700000000, "temp": 22.5}`.

### Connection Management

- **Always set a meaningful `keepAlive` value** (60–120 seconds is typical). Too short wastes bandwidth; too long delays detection of dead connections.
- **Always configure a Last Will** for devices that must report presence.
- **Use exponential backoff** when reconnecting — don't hammer the broker with rapid reconnects.

```swift
func reconnect(attempt: Int) {
    let delay = min(pow(2.0, Double(attempt)), 60.0) // cap at 60s
    DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
        self.mqtt?.connect()
    }
}
```

- **Use persistent sessions** (clean session = false) for subscribers that must not miss messages while offline.

### Broker

- **Run the broker behind a load balancer** with at least one hot standby for production workloads.
- **Monitor `$SYS/#` topics** — Mosquitto publishes broker metrics (connected clients, messages/sec, bytes in/out) there.
- **Set `max_queued_messages`** to limit how many QoS 1/2 messages are queued for offline clients. Unbounded queues can exhaust broker memory.

---

## Conclusion

MQTT's simplicity is its superpower. Its small footprint, flexible QoS levels, and built-in features like retained messages and Last Will make it the right tool for IoT messaging, mobile-to-device communication, and lightweight event-driven architectures.

The main things to get right from the start are topic structure, security (TLS + authentication + ACLs), and payload schema versioning. These decisions are difficult to change once devices are deployed in the field.

## References

[1] [MQTT Specification v5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)
[2] [Eclipse Mosquitto](https://mosquitto.org/)
[3] [HiveMQ MQTT Essentials](https://www.hivemq.com/mqtt-essentials/)
[4] [paho-mqtt Python client](https://eclipse.dev/paho/index.php?page=clients/python/index.php)
[5] [CocoaMQTT for iOS/macOS](https://github.com/emqx/CocoaMQTT)
