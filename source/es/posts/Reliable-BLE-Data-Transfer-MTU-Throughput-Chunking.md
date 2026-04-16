---
title: 'Transferencia fiable de datos BLE: Manejo de MTU, rendimiento y fragmentación'
date: 2026-04-12 10:00:00
tags: [BLE, iOS, Android, Bluetooth, CoreBluetooh]
layout: post
lang: es
---

![](/Post-Resources/BLE-DataTransfer/cover.png "Cover")

Tarde o temprano, todo desarrollador BLE se topa con el mismo muro: necesitas enviar más de 20 bytes a la vez. Tal vez sea una imagen de firmware, un lote de lecturas de sensores o un payload de configuración. Lanzas una escritura y... solo llegan los primeros 20 bytes. El resto se descarta silenciosamente.

La raíz de este problema es el **MTU (Maximum Transmission Unit)** — la cantidad máxima de bytes que un solo paquete BLE puede transportar. Entender el MTU, saber cómo negociarlo y construir una capa fiable de fragmentación sobre él es esencial para cualquier aplicación BLE del mundo real.

En este artículo cubriremos todo lo que necesitas saber: qué es realmente el MTU, cómo negociarlo en iOS y Android, la diferencia entre tipos de escritura, cómo construir un protocolo de fragmentación y cómo maximizar el rendimiento.

¡Comencemos!

<!-- more -->

---

## Conocimiento fundamental

Antes de entrar en el código, construyamos un modelo mental claro de cómo funciona la transferencia de datos BLE.

### La capa ATT

El intercambio de datos BLE ocurre a través de la capa **ATT (Attribute Protocol)**. Cuando lees o escribes una característica, estás enviando un paquete ATT. Cada paquete ATT tiene una sobrecarga fija de **3 bytes** (1 byte de código de operación + 2 bytes de handle de atributo), dejando el resto para tu payload real.

```
┌──────────────────────────────────────────┐
│              Paquete ATT                 │
├──────────┬───────────┬───────────────────┤
│  Opcode  │  Handle   │     Payload       │
│  1 byte  │  2 bytes  │  (MTU - 3) bytes  │
├──────────┴───────────┴───────────────────┤
│             Total = MTU bytes            │
└──────────────────────────────────────────┘
```

Así que el payload efectivo por escritura es:

> **Payload efectivo = MTU - 3 bytes**

Con el MTU predeterminado de **23 bytes**, obtienes solo **20 bytes** de datos utilizables por escritura. Por eso 20 bytes es el número mágico que ves en todas partes.

### MTU vs longitud de paquete vs rendimiento

Estos tres conceptos están relacionados pero son diferentes:

| Concepto | Qué significa | Valor predeterminado |
|---|---|---|
| **MTU** | Payload ATT máximo por paquete | 23 bytes |
| **Data Length (DLE)** | Payload máximo de la capa de enlace (Bluetooth 4.2+) | 27 bytes, hasta 251 |
| **Rendimiento** | Datos reales transferidos por segundo | Depende de todos los factores |

El MTU se negocia a nivel de aplicación. La extensión de longitud de datos (DLE) se negocia en la capa de enlace. Ambos deben optimizarse para obtener el máximo rendimiento.

---

## Negociación de MTU

El MTU predeterminado de BLE es de 23 bytes — diseñado en 2010 para lecturas de sensores pequeñas. Los dispositivos BLE 4.2+ modernos soportan MTU de hasta **517 bytes** (el máximo de la especificación Bluetooth). Para desbloquear esto, el central debe solicitar explícitamente un MTU mayor.

### En iOS (CoreBluetooth)

iOS maneja la negociación de MTU automáticamente. Cuando te conectas a un periférico, CoreBluetooth negocia el MTU más alto soportado por ambas partes. No necesitas llamar a ningún método "solicitar MTU" — en su lugar, consultas el resultado:

```swift
// Después de conectar y descubrir características
let mtu = peripheral.maximumWriteValueLength(for: .withoutResponse)
print("Payload MTU negociado: \(mtu) bytes")
```

Hay dos variantes:

```swift
// Para escritura sin respuesta — devuelve el payload máximo directamente
let mtuWithoutResponse = peripheral.maximumWriteValueLength(for: .withoutResponse)

// Para escritura con respuesta — siempre devuelve min(MTU - 3, 512)
let mtuWithResponse = peripheral.maximumWriteValueLength(for: .withResponse)
```

**Importante:** en iOS no puedes establecer un valor específico de MTU. El sistema negocia el máximo automáticamente. A partir de iOS 16, la mayoría de los dispositivos negocian **517 bytes** de MTU cuando el periférico lo soporta.

### En Android

Android requiere una solicitud explícita de MTU:

```kotlin
// Después de conectar al servidor GATT
bluetoothGatt.requestMtu(517) // Solicitar el máximo

// Manejar el callback
override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
    if (status == BluetoothGatt.GATT_SUCCESS) {
        val payload = mtu - 3
        Log.d("BLE", "MTU negociado: $mtu, payload utilizable: $payload bytes")
    }
}
```

**El momento importa.** Siempre solicita el MTU **después** de que la conexión esté establecida pero **antes** de empezar a leer o escribir características. Un error común es solicitar el MTU demasiado tarde, después de que el MTU predeterminado de 23 bytes ya se haya usado para el descubrimiento de servicios.

```kotlin
// Flujo de conexión recomendado en Android
override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
    if (newState == BluetoothProfile.STATE_CONNECTED) {
        // Paso 1: Solicitar MTU primero
        gatt.requestMtu(517)
    }
}

override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
    if (status == BluetoothGatt.GATT_SUCCESS) {
        // Paso 2: Ahora descubrir servicios
        gatt.discoverServices()
    }
}
```

### Comparación de MTU entre iOS y Android

| Aspecto | iOS | Android |
|---|---|---|
| Cómo solicitarlo | Automático | `requestMtu(517)` |
| Predeterminado | Negocia el máximo automáticamente | 23 hasta que lo solicites |
| Máximo soportado | 517 | 517 |
| Consultar resultado | `maximumWriteValueLength(for:)` | Callback `onMtuChanged` |
| Error común | Ninguno — solo lee el valor | Olvidar llamar a `requestMtu` |

---

## Tipos de escritura: con respuesta vs sin respuesta

BLE ofrece dos modos de escritura, y elegir el correcto impacta directamente en la fiabilidad y el rendimiento.

### Escritura con respuesta (con confirmación)

```
Central                          Periférico
   │                                 │
   │──── Write Request ─────────────►│
   │                                 │
   │◄─── Write Response ────────────│
   │                                 │
   │──── Write Request ─────────────►│
   │                                 │
   │◄─── Write Response ────────────│
```

- El periférico **confirma** cada escritura.
- Si una escritura falla, lo sabes inmediatamente.
- **Más lento** — debe esperar la confirmación antes de enviar el siguiente paquete.
- Payload máximo por escritura: **min(MTU - 3, 512)** bytes.

### Escritura sin respuesta (sin confirmación)

```
Central                          Periférico
   │                                 │
   │──── Write Command ─────────────►│
   │──── Write Command ─────────────►│
   │──── Write Command ─────────────►│
   │──── Write Command ─────────────►│
   │                                 │
```

- Sin confirmación — enviar y olvidar.
- **Mucho más rápido** — puede encolar múltiples paquetes en un solo evento de conexión.
- Riesgo de pérdida de paquetes si el búfer del periférico se desborda.
- Payload máximo por escritura: **(MTU - 3)** bytes.

### Cuándo usar cada uno

| Escenario | Tipo recomendado |
|---|---|
| Escrituras de configuración | Con respuesta |
| Comandos críticos | Con respuesta |
| Actualización de firmware (OTA/DFU) | Sin respuesta + ACK a nivel de aplicación |
| Transmisión de datos de sensores | Sin respuesta |
| Transferencia de archivos grandes | Sin respuesta + protocolo de fragmentación |

Para transferencias de alto rendimiento, la escritura sin respuesta es el camino a seguir. Pero necesitas construir tu propia capa de fiabilidad encima — ahí es donde entra la fragmentación.

---

## Control de flujo: evitando el desbordamiento de búfer

Cuando usas escritura sin respuesta, el mayor riesgo es desbordar el búfer interno de la pila BLE. Si envías paquetes más rápido de lo que la radio puede transmitirlos, los paquetes se descartan silenciosamente.

### iOS — `canSendWriteWithoutResponse`

CoreBluetooth proporciona un mecanismo de control de flujo integrado:

```swift
func sendNextChunk() {
    while peripheral.canSendWriteWithoutResponse {
        guard let chunk = nextChunk() else { return }
        peripheral.writeValue(chunk, for: characteristic, type: .withoutResponse)
    }
}

// Llamado por CoreBluetooth cuando el búfer tiene espacio de nuevo
func peripheralIsReady(toSendWriteWithoutResponse peripheral: CBPeripheral) {
    sendNextChunk()
}
```

Esta es la forma **correcta** de transmitir datos en iOS. Nunca uses temporizadores o retrasos arbitrarios — `peripheralIsReady(toSendWriteWithoutResponse:)` te indica exactamente cuándo la pila está lista para más datos.

### Android — Control de flujo

En Android, `writeCharacteristic` devuelve `false` si el búfer interno está lleno. Además, debes esperar el callback `onCharacteristicWrite` antes de enviar el siguiente paquete:

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

**Error común:** lanzar escrituras en un bucle cerrado en Android sin esperar los callbacks. Esto causa pérdida silenciosa de datos que es extremadamente difícil de depurar.

---

## Construyendo un protocolo de fragmentación

Cuando tu payload excede el MTU, necesitas dividirlo en fragmentos, enviarlos secuencialmente y reensamblarlo en el otro lado. Aquí tienes un diseño práctico de protocolo.

### Formato del paquete

```
┌─────────┬──────────┬─────────────────────┐
│  Flags  │  Seq #   │      Payload        │
│ 1 byte  │ 2 bytes  │  (MTU - 6) bytes    │
└─────────┴──────────┴─────────────────────┘

Flags:
  bit 0: SOF (Start of Frame)  — primer fragmento
  bit 1: EOF (End of Frame)    — último fragmento
  bit 2: Solicitud de ACK      — el periférico debe confirmar
```

Con un MTU de 517 bytes, cada fragmento transporta hasta **511 bytes** de payload (517 - 3 sobrecarga ATT - 3 cabecera del protocolo).

### Implementación en iOS

```swift
struct ChunkHeader {
    static let size = 3 // 1 flag + 2 secuencia
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

    // Llamar desde peripheralIsReady(toSendWriteWithoutResponse:)
    func onReadyToSend() {
        sendNextChunk()
    }
}
```

### Lado receptor (periférico / firmware)

El periférico reensambla basándose en los flags y el número de secuencia:

```
1. Recibir fragmento
2. Si SOF → asignar nuevo búfer, reiniciar secuencia esperada a 0
3. Verificar que el número de secuencia coincida con el esperado
4. Agregar payload al búfer
5. Incrementar secuencia esperada
6. Si EOF → el búfer está completo, procesar el payload completo
7. Si la secuencia no coincide → solicitar retransmisión desde esa secuencia
```

---

## Maximizando el rendimiento

El rendimiento BLE depende de múltiples factores trabajando juntos. Así es como optimizar cada uno.

### 1. Negociar el MTU máximo

```
MTU 23  → 20 bytes/paquete   → ~2.5 KB/s típico
MTU 185 → 182 bytes/paquete  → ~18 KB/s típico
MTU 517 → 514 bytes/paquete  → ~45 KB/s típico
```

Siempre solicita 517. Incluso si el periférico soporta menos, la negociación se establece en el valor común más alto.

### 2. Habilitar Data Length Extension (DLE)

DLE aumenta el tamaño del paquete de la capa de enlace de 27 a 251 bytes. Esto significa menos paquetes de radio por payload ATT. En iOS, DLE se habilita automáticamente. En Android 5.0+, generalmente es automático después de la negociación de MTU, pero algunos dispositivos requieren:

```kotlin
// Android — algunos dispositivos necesitan solicitud explícita de DLE
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
    bluetoothGatt.requestMtu(517) // Esto a menudo activa DLE automáticamente
}
```

### 3. Usar escritura sin respuesta

Las escrituras con respuesta están limitadas a **un paquete por evento de conexión** debido al viaje de ida y vuelta del ACK. Las escrituras sin respuesta pueden empaquetar **múltiples paquetes** en un solo evento de conexión.

```
Con respuesta:    1 paquete × 514 bytes por evento
Sin respuesta:    4-6 paquetes × 514 bytes por evento  ← hasta 6x más rápido
```

### 4. Solicitar un intervalo de conexión más corto

El intervalo de conexión determina con qué frecuencia el central y el periférico intercambian datos. Intervalos más cortos significan más oportunidades para enviar paquetes.

```
Intervalo de conexión 30ms  → ~33 eventos/segundo
Intervalo de conexión 15ms  → ~67 eventos/segundo (mínimo en iOS)
Intervalo de conexión 7.5ms → ~133 eventos/segundo (mínimo en Android)
```

En iOS, no puedes establecer el intervalo de conexión directamente — CoreBluetooth elige un valor basado en los parámetros preferidos del periférico. En Android:

```kotlin
// Android — solicitar conexión de alta prioridad (intervalo más corto)
bluetoothGatt.requestConnectionPriority(BluetoothGatt.CONNECTION_PRIORITY_HIGH)
```

**Advertencia:** los intervalos más cortos aumentan significativamente el consumo de energía. Usa `CONNECTION_PRIORITY_HIGH` solo durante la transferencia activa de datos, luego vuelve a cambiar:

```kotlin
// Después de completar la transferencia
bluetoothGatt.requestConnectionPriority(BluetoothGatt.CONNECTION_PRIORITY_BALANCED)
```

### 5. Cálculo del rendimiento

Rendimiento teórico máximo:

```
Rendimiento = (MTU - 3) × paquetes_por_evento × (1000 / intervalo_conexión_ms)

Ejemplo con configuraciones óptimas:
= 514 bytes × 6 paquetes × (1000 / 7.5)
= 514 × 6 × 133
= ~400 KB/s máximo teórico
```

En la práctica, espera **30-80 KB/s** en iOS y **50-100 KB/s** en Android con parámetros bien ajustados. Los factores del mundo real como interferencia RF, otras conexiones BLE y limitaciones del firmware del periférico reducen el máximo teórico.

---

## Errores comunes

### 1. Enviar sin negociación de MTU

```
// Android — se olvidó de llamar a requestMtu()
// Resultado: cada escritura se limita a 20 bytes, truncamiento silencioso
```

Siempre negocia el MTU antes de cualquier transferencia de datos.

### 2. Escribir en un bucle cerrado

```swift
// iOS — INCORRECTO
for chunk in chunks {
    peripheral.writeValue(chunk, for: characteristic, type: .withoutResponse)
}
// Muchos fragmentos se descartan silenciosamente porque el búfer se desbordó
```

Usa `canSendWriteWithoutResponse` y `peripheralIsReady(toSendWriteWithoutResponse:)` en su lugar.

### 3. Ignorar la capacidad del tipo de escritura

No toda característica soporta ambos tipos de escritura. Siempre verifica:

```swift
if characteristic.properties.contains(.writeWithoutResponse) {
    // Puede usar .withoutResponse
}
if characteristic.properties.contains(.write) {
    // Puede usar .withResponse
}
```

### 4. Valores de MTU codificados en duro

```swift
// INCORRECTO — codificado en duro
let chunkSize = 20

// CORRECTO — dinámico
let chunkSize = peripheral.maximumWriteValueLength(for: .withoutResponse)
```

El MTU varía entre dispositivos. Siempre consulta en tiempo de ejecución.

### 5. No manejar la desconexión durante la transferencia

Las transferencias largas pueden interrumpirse por desconexión. Tu protocolo de fragmentación debe soportar la reanudación:

```swift
class ResumeableTransfer {
    private var lastAckedSequence: UInt16 = 0

    func resume() {
        // Reanudar desde lastAckedSequence en lugar de reiniciar
        currentIndex = Int(lastAckedSequence)
        sendNextChunk()
    }
}
```

---

## Resumen de mejores prácticas

1. **Siempre negocia el MTU máximo** — llama a `requestMtu(517)` en Android; en iOS es automático, solo lee el resultado.
2. **Usa escritura sin respuesta para datos masivos** — es 4-6x más rápido que escritura con respuesta.
3. **Respeta el control de flujo** — usa `canSendWriteWithoutResponse` en iOS y espera los callbacks en Android. Nunca hagas bucles a ciegas.
4. **Construye un protocolo de fragmentación** — incluye números de secuencia y flags de inicio/fin para reensamblaje y recuperación de errores.
5. **Consulta el MTU en tiempo de ejecución** — nunca codifiques 20 bytes en duro. Los dispositivos negocian diferentes valores de MTU.
6. **Solicita alta prioridad de conexión durante la transferencia** — en Android, usa `CONNECTION_PRIORITY_HIGH` durante la transferencia activa, luego vuelve a equilibrado.
7. **Maneja la desconexión con gracia** — soporta transferencias reanudables para payloads grandes.
8. **Prueba en dispositivos reales** — los simuladores no reflejan el comportamiento BLE del mundo real. Siempre valida el rendimiento y la fiabilidad en hardware físico en entornos RF con ruido.

---

## Resumen

La transferencia de datos BLE es simple en la superficie — escribir bytes en una característica — pero hacerlo bien requiere entender toda la pila: negociación de MTU, tipos de escritura, control de flujo y fragmentación. El límite predeterminado de 20 bytes no es un muro infranqueable, es solo el punto de partida.

Con una negociación adecuada de MTU (517 bytes), escritura sin respuesta, control de flujo y un protocolo de fragmentación bien diseñado, puedes alcanzar **30-100 KB/s** de rendimiento fiable — más que suficiente para actualizaciones de firmware, archivos de configuración y lotes de datos de sensores.

La conclusión clave: **nunca envíes datos BLE sin conocer tu MTU, y nunca transmitas sin control de flujo.** Si haces bien estas dos cosas, el resto viene naturalmente.

¡Buen fin de semana!

---

## Referencias

1. [Bluetooth Core Specification v5.3 — Vol 3, Part F (ATT)](https://www.bluetooth.com/specifications/specs/core-specification-5-3/)
2. [Apple — Core Bluetooth Programming Guide](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/AboutCoreBluetooth/Introduction.html)
3. [Android — BLE Overview](https://developer.android.com/develop/connectivity/bluetooth/ble/ble-overview)
4. [Nordic Semiconductor — Optimizing BLE Throughput](https://devzone.nordicsemi.com/guides/short-range-guides/b/bluetooth-low-energy/posts/ble-throughput-part-1)
5. [Punch Through — Maximizing BLE Throughput](https://punchthrough.com/maximizing-ble-throughput-on-ios-and-android/)
