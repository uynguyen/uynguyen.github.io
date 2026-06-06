---
title: "MQTT: Introducción, Configuración y Buenas Prácticas"
date: 2026-03-29 10:00:00
tags: [MQTT, IoT, Networking, Protocol, Swift, Python]
lang: es
layout: post
thumbnail: /Post-Resources/MQTT/cover.png
---

MQTT (Message Queuing Telemetry Transport) es un protocolo de mensajería publish/subscribe ligero, diseñado para dispositivos con recursos limitados y redes poco confiables. Desarrollado originalmente por IBM a finales de los años 90 para monitorear oleoductos a través de enlaces satelitales, se ha convertido en el estándar de facto para la comunicación IoT, impulsando desde sensores de hogar inteligente hasta sistemas de automatización industrial.

En este artículo cubriremos qué es MQTT, cómo configurarlo, ejemplos prácticos, casos de uso reales, sus fortalezas y debilidades, y las mejores prácticas que debes seguir.

<!-- more -->

---

## Cómo Funciona MQTT

MQTT se construye alrededor de tres roles:

- **Publisher**: un cliente que envía mensajes a un topic.
- **Subscriber**: un cliente que recibe mensajes de los topics a los que se ha suscrito.
- **Broker**: el servidor intermediario que recibe todos los mensajes de los publishers y los enruta a los subscribers correctos.

```
┌──────────────┐       publish        ┌──────────────┐
│  Publisher   │ ──── topic/data ───► │              │
└──────────────┘                      │    Broker    │
                                      │              │
┌──────────────┐       subscribe      │              │
│  Subscriber  │ ◄─── topic/data ──── │              │
└──────────────┘                      └──────────────┘
```

Los clientes nunca se comunican directamente entre sí. Todos los mensajes pasan por el broker. Este desacoplamiento significa que publishers y subscribers no necesitan conocerse entre sí, ni siquiera estar conectados al mismo tiempo (con sesiones persistentes).

### Topics

Los topics son cadenas jerárquicas que actúan como claves de enrutamiento:

```
home/livingroom/temperature
home/livingroom/humidity
home/bedroom/temperature
factory/line1/machine3/status
```

Los subscribers pueden usar comodines:
- `+` coincide con un nivel: `home/+/temperature` coincide con `home/livingroom/temperature` y `home/bedroom/temperature`.
- `#` coincide con todos los niveles restantes: `home/#` coincide con todo lo que esté bajo `home/`.

### Quality of Service (QoS)

MQTT ofrece tres garantías de entrega:

| QoS | Nombre | Garantía |
|-----|--------|----------|
| 0 | At most once | Disparar y olvidar. El mensaje puede perderse. |
| 1 | At least once | Entrega garantizada, pero posibles duplicados. |
| 2 | Exactly once | Entrega garantizada, sin duplicados. El más lento. |

---

## Configuración del Broker

El broker open-source más popular es **Mosquitto**. Para ejecutarlo localmente:

```bash
# macOS
brew install mosquitto
brew services start mosquitto

# Ubuntu / Debian
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
```

Prueba rápida usando los clientes de línea de comandos:

```bash
# Terminal 1: suscribirse
mosquitto_sub -h localhost -t "test/topic"

# Terminal 2: publicar
mosquitto_pub -h localhost -t "test/topic" -m "hello world"
```

Para producción, considera un broker gestionado:
- **HiveMQ Cloud** — nivel gratuito disponible, escala fácilmente.
- **AWS IoT Core** — integración estrecha con AWS, precio por mensaje.
- **EMQX** — alto rendimiento, open-source, listo para empresas.

### Configuración Básica de Mosquitto

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

Crear un usuario:
```bash
mosquitto_passwd -c /etc/mosquitto/passwords myuser
```

---

## Ejemplos de Código

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

Agrega a tu `Package.swift` o Podfile:

```ruby
pod 'CocoaMQTT'
```

**Conectar y suscribirse:**

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
        // Manejar reconexión
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

### Mensajes Retenidos y Last Will

**Mensaje retenido**: el broker almacena el último mensaje de un topic y lo entrega inmediatamente a cualquier nuevo subscriber. Útil para el estado del dispositivo.

```python
# Marcar como retenido para que los nuevos subscribers reciban el estado actual de inmediato
client.publish("devices/sensor1/status", "online", qos=1, retain=True)
```

**Last Will and Testament (LWT)**: un mensaje que el broker publica automáticamente si un cliente se desconecta de forma inesperada (sin paquete DISCONNECT). Esencial para la detección de presencia.

```python
client.will_set("devices/sensor1/status", payload="offline", qos=1, retain=True)
client.connect("localhost", 1883)
```

---

## Casos de Uso Reales

### 1. Hogar Inteligente
Los sensores publican temperatura, humedad y eventos de movimiento. Un controlador de automatización del hogar (por ejemplo, Home Assistant) se suscribe y activa acciones: encender la calefacción, enviar alertas, controlar luces.

```
home/bedroom/temperature  →  22.1
home/hallway/motion       →  detected
home/kitchen/light/set    →  ON
```

### 2. IoT Industrial (IIoT)
Los equipos de fabricación publican estado de máquinas, lecturas de vibración y códigos de error. Un dashboard de monitoreo agrega y alerta cuando se superan umbrales.

### 3. Seguimiento de Flota
Los vehículos publican coordenadas GPS cada pocos segundos a través de una conexión celular. Un servicio backend se suscribe y actualiza un mapa en vivo. El bajo overhead de MQTT lo hace adecuado para actualizaciones de alta frecuencia a escala.

### 4. Comunicación App Móvil ↔ Dispositivo IoT
Una app móvil publica comandos a un dispositivo (por ejemplo, una cerradura inteligente) y se suscribe a actualizaciones de estado. El broker desacopla la app del dispositivo — la app no necesita conocer la dirección IP del dispositivo.

### 5. Bus de Eventos para Microservicios
Dentro de un sistema backend, los servicios publican eventos (por ejemplo, `orders/created`, `payments/processed`) y los servicios downstream se suscriben para reaccionar. Es una alternativa simple a Kafka para sistemas de menor throughput.

---

## Lo Bueno y Lo Malo

### Fortalezas

| Fortaleza | Por qué importa |
|-----------|-----------------|
| **Protocolo ligero** | Overhead de cabecera mínimo (2 bytes de cabecera fija). Ideal para dispositivos limitados y enlaces de bajo ancho de banda. |
| **Desacoplamiento publish/subscribe** | Publishers y subscribers son completamente independientes. Cualquiera puede estar offline sin afectar al otro. |
| **Niveles de QoS** | Elige la garantía de entrega adecuada por mensaje. Los datos críticos pueden usar QoS 2; la telemetría puede usar QoS 0. |
| **Mensajes retenidos** | Los nuevos subscribers reciben inmediatamente el estado actual sin esperar el siguiente publish. |
| **Last Will and Testament** | Notificación automática de "offline" cuando un cliente se desconecta de forma inesperada. |
| **Sesiones persistentes** | El broker pone en cola mensajes para subscribers offline (QoS > 0) y los entrega al reconectar. |
| **Ecosistema amplio** | Clientes para todos los lenguajes y plataformas. Brokers desde embedded (Mosquitto) hasta escala cloud (AWS IoT Core). |

### Debilidades

| Debilidad | Impacto |
|-----------|---------|
| **Sin aplicación de schema** | El broker enruta bytes arbitrarios. Los clientes deben acordar el formato del payload fuera de banda — fácil de romper silenciosamente. |
| **Sin request/response incorporado** | MQTT es fire-and-forget. Implementar RPC requiere correlation IDs y response topics manuales. |
| **El broker es un punto único de falla** | Sin clustering o failover, un crash del broker interrumpe toda la comunicación. |
| **La estructura de topics es difícil de cambiar** | Una vez que los dispositivos están desplegados, cambiar la estructura de topics requiere actualizaciones coordinadas de firmware/software. |
| **Sin control de acceso por topic por defecto** | Requiere configuración explícita del broker (archivos ACL o auth por plugin) para restringir qué clientes pueden publicar/suscribirse a qué topics. |
| **No ideal para payloads grandes** | Diseñado para mensajes pequeños y frecuentes. Las transferencias binarias grandes se manejan mejor con HTTP/S3, usando MQTT solo para señalización. |

---

## Buenas Prácticas

### Diseño de Topics

- **Usa una jerarquía que refleje tu dominio**: `{location}/{device}/{measurement}` o `{org}/{fleet}/{vehicleId}/{metric}`.
- **Sé específico**: prefiere `devices/sensor1/temperature` sobre `sensor_data`.
- **Nunca comiences un topic con `/`** — crea un primer nivel vacío.
- **Reserva los topics `$`** — los usa el broker internamente (por ejemplo, `$SYS/#` para métricas del broker).
- **Evita espacios y caracteres especiales** en los nombres de topic.
- **Define tu estructura de topics pronto** — es muy difícil cambiarla después de que los dispositivos están en producción.

### Seguridad

- **Usa siempre TLS (puerto 8883)** en producción. MQTT plano (puerto 1883) envía las credenciales en texto claro.
- **Autentica cada cliente** — nunca permitas conexiones anónimas en producción.
- **Usa credenciales por cliente** — no compartas un único usuario/contraseña entre todos los dispositivos.
- **Aplica ACLs** para que los clientes solo puedan publicar/suscribirse a los topics que les corresponden.
- **Rota las credenciales** periódicamente, especialmente cuando un dispositivo es dado de baja.

### Selección de QoS

- **QoS 0** para telemetría de alta frecuencia donde la pérdida ocasional es aceptable (lecturas de sensor cada segundo).
- **QoS 1** para la mayoría de mensajes de comando y control — entrega garantizada, maneja duplicados de forma defensiva.
- **QoS 2** solo cuando la entrega duplicada es genuinamente dañina (transacciones financieras, comandos de actuadores que no deben repetirse).

Evita usar QoS 2 por defecto en todas partes — requiere cuatro round-trips de red por mensaje y reduce significativamente el throughput.

### Formato de Payload

- **Usa un formato estructurado**: JSON para legibilidad durante el desarrollo, Protocol Buffers o CBOR en producción para reducir el tamaño del payload.
- **Incluye un timestamp en el payload**, no solo en el topic. Los timestamps sobreviven la reproducción de logs y los pipelines de analítica.
- **Versiona tu schema de payload desde el primer día**: `{"v": 1, "ts": 1700000000, "temp": 22.5}`.

### Gestión de Conexiones

- **Siempre establece un valor significativo de `keepAlive`** (60–120 segundos es típico). Demasiado corto desperdicia ancho de banda; demasiado largo retrasa la detección de conexiones muertas.
- **Siempre configura un Last Will** para dispositivos que deben reportar presencia.
- **Usa backoff exponencial** al reconectar — no bombardees el broker con reconexiones rápidas.

```swift
func reconnect(attempt: Int) {
    let delay = min(pow(2.0, Double(attempt)), 60.0) // máximo 60s
    DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
        self.mqtt?.connect()
    }
}
```

- **Usa sesión persistente** (clean session = false) para subscribers que no deben perder mensajes mientras están offline.

### Broker

- **Ejecuta el broker detrás de un load balancer** con al menos un hot standby para cargas de trabajo en producción.
- **Monitorea los topics `$SYS/#`** — Mosquitto publica métricas del broker (clientes conectados, mensajes/seg, bytes entrada/salida) allí.
- **Establece `max_queued_messages`** para limitar cuántos mensajes QoS 1/2 se ponen en cola para clientes offline. Las colas sin límite pueden agotar la memoria del broker.

---

## Conclusión

La simplicidad de MQTT es su superpoder. Su pequeño footprint, niveles de QoS flexibles y características integradas como mensajes retenidos y Last Will lo convierten en la herramienta correcta para mensajería IoT, comunicación mobile-to-device y arquitecturas ligeras orientadas a eventos.

Las cosas principales que hay que hacer bien desde el principio son la estructura de topics, la seguridad (TLS + autenticación + ACLs) y el versionado del schema de payload. Estas decisiones son difíciles de cambiar una vez que los dispositivos están desplegados en campo.

## Referencias

[1] [MQTT Specification v5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)
[2] [Eclipse Mosquitto](https://mosquitto.org/)
[3] [HiveMQ MQTT Essentials](https://www.hivemq.com/mqtt-essentials/)
[4] [paho-mqtt Python client](https://eclipse.dev/paho/index.php?page=clients/python/index.php)
[5] [CocoaMQTT for iOS/macOS](https://github.com/emqx/CocoaMQTT)
