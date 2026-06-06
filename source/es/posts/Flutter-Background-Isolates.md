---
title: 'Flutter Background Isolates: Concurrencia real sin bloquear la UI'
date: 2026-04-05 09:00:00
tags: [Flutter, Dart, Concurrency, BLE, Background]
lang: es
layout: post
thumbnail: /Post-Resources/FlutterBackgroundIsolates/cover.png
---

Flutter corre sobre un único hilo principal — el **main isolate** — que se encarga de renderizar la UI a 60 o 120 fps y de procesar los eventos del usuario. Cuando introduces trabajo pesado en ese hilo, el resultado es inmediato: frames perdidos, animaciones cortadas y una experiencia que se siente lenta.

La solución de Dart es el **isolate**: una unidad de ejecución completamente independiente, con su propia memoria aislada y su propio event loop. Lanzar trabajo a un isolate en segundo plano libera al hilo principal para que haga lo único que debe hacer bien — dibujar la interfaz.

En este artículo exploraremos qué son los background isolates, cómo funcionan internamente, cuándo usarlos y cómo se integran en aplicaciones BLE.

¡Comencemos!

<!-- more -->

---

## ¿Por qué existe el problema?

Dart es **single-threaded by design**. A diferencia de Java o Kotlin, no hay threads compartidos ni mutexes. Toda la ejecución ocurre dentro de un isolate — y por defecto, tu app solo tiene uno.

El main isolate tiene un presupuesto estricto por frame: **~16 ms a 60 fps** o **~8 ms a 120 fps**. Cualquier operación que tarde más que eso bloquea el renderizador.

```
Timeline del main isolate (sin isolates):

[frame 1] [render] [frame 2] [render] [TRABAJO PESADO........] [frame 3] ← JANK
```

Con un background isolate:

```
Main isolate:   [frame 1] [render] [frame 2] [render] [frame 3] ← suave
Background:     [______ TRABAJO PESADO ________________________]
```

---

## Modelo de isolates en Dart

Un **isolate** en Dart es similar a un proceso del sistema operativo en miniatura:

- Tiene su **propia memoria heap** — no comparte objetos con otros isolates.
- Se comunica exclusivamente mediante **paso de mensajes** a través de `SendPort` / `ReceivePort`.
- Corre en un **hilo del SO diferente**, lo que permite paralelismo real en CPUs multi-core.

```
┌──────────────────────────────────────────────────┐
│                   Dart VM                        │
│                                                  │
│  ┌─────────────────┐    ┌─────────────────────┐  │
│  │   Main Isolate  │    │  Background Isolate │  │
│  │                 │◄──►│                     │  │
│  │  - UI           │    │  - Cómputo pesado   │  │
│  │  - Gestures     │    │  - Parseo JSON       │  │
│  │  - Animation    │    │  - Crypto / ML       │  │
│  └─────────────────┘    └─────────────────────┘  │
│       (mensaje)                                  │
└──────────────────────────────────────────────────┘
```

> **Dato clave:** los isolates no comparten memoria. Para enviar datos entre ellos, Dart los **copia** (para tipos primitivos y colecciones simples) o los **transfiere** (para tipos especiales como `TransferableTypedData`). Esto elimina las condiciones de carrera por diseño.

---

## Cómo usar un Background Isolate

### Opción 1 — `compute()` (la forma más simple)

`compute` es un helper de Flutter que lanza una función en un isolate temporal, espera el resultado y cierra el isolate. Es ideal para tareas únicas y sin estado.

```dart
import 'package:flutter/foundation.dart';

// Esta función se ejecuta en el background isolate
List<Device> parseDevices(String jsonString) {
  final List decoded = jsonDecode(jsonString);
  return decoded.map((e) => Device.fromJson(e)).toList();
}

// En tu widget o bloc:
final devices = await compute(parseDevices, rawJson);
```

**Restricción importante:** la función top-level (o método estático) pasada a `compute` no puede capturar closures del entorno del main isolate. Debe ser una función pura.

---

### Opción 2 — `Isolate.spawn()` (control total)

Para tareas de larga duración o comunicación bidireccional, usa `Isolate.spawn` directamente.

```dart
import 'dart:isolate';

Future<void> startBackgroundIsolate() async {
  final receivePort = ReceivePort();

  // Lanza el isolate, pasando el SendPort para responder
  await Isolate.spawn(_backgroundEntry, receivePort.sendPort);

  // Escucha los mensajes del isolate
  receivePort.listen((message) {
    if (message is SendPort) {
      // El isolate nos manda su propio SendPort para comunicación bidireccional
      final isolateSendPort = message;
      isolateSendPort.send({'command': 'start'});
    } else {
      print('Resultado recibido: $message');
    }
  });
}

// Punto de entrada del background isolate — debe ser top-level o static
void _backgroundEntry(SendPort mainSendPort) {
  final isolateReceivePort = ReceivePort();

  // Envía nuestro SendPort al main isolate para recibir comandos
  mainSendPort.send(isolateReceivePort.sendPort);

  isolateReceivePort.listen((message) {
    if (message is Map && message['command'] == 'start') {
      final result = _doHeavyWork();
      mainSendPort.send(result);
    }
  });
}

String _doHeavyWork() {
  // Cómputo intensivo...
  return 'trabajo completado';
}
```

---

### Opción 3 — `Isolate.run()` (Dart 2.19+, la forma moderna)

A partir de Dart 2.19, `Isolate.run()` combina lo mejor de ambos mundos: la simplicidad de `compute` con soporte para closures.

```dart
import 'dart:isolate';

final result = await Isolate.run(() {
  // Aquí sí puedes usar closures del scope externo (valores, no referencias)
  return expensiveComputation(data);
});
```

> Prefiere `Isolate.run()` sobre `compute()` en proyectos nuevos — es más ergonómico y es el estándar moderno de Dart.

---

## Acceso a Plugins desde Background Isolates (Flutter 3.7+)

Antes de Flutter 3.7, los background isolates **no podían llamar a plugins nativos** (platform channels). Esto era una limitación importante para apps BLE o de sensores.

Desde Flutter 3.7, esto es posible gracias a `BackgroundIsolateBinaryMessenger`:

```dart
import 'dart:isolate';
import 'package:flutter/services.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Captura el token del main isolate
  final token = RootIsolateToken.instance!;

  await Isolate.spawn(_bleIsolateEntry, token);
}

void _bleIsolateEntry(RootIsolateToken token) async {
  // Registra el messenger antes de usar cualquier plugin
  BackgroundIsolateBinaryMessenger.ensureInitialized(token);

  // Ahora puedes usar platform channels y plugins desde aquí
  const channel = MethodChannel('com.example/ble');
  final result = await channel.invokeMethod('startScan');
  print('Escaneo iniciado desde background isolate: $result');
}
```

---

## Transferencia eficiente de datos — `TransferableTypedData`

Copiar grandes bloques de bytes entre isolates puede ser costoso. Para datos binarios (como tramas BLE), usa `TransferableTypedData`, que **transfiere** la memoria sin copiarla:

```dart
// En el main isolate — empaquetar para transferencia
final bytes = Uint8List.fromList([0x01, 0x02, 0x03, 0xFF]);
final transferable = TransferableTypedData.fromList([bytes]);
sendPort.send(transferable);

// En el background isolate — desempaquetar
receivePort.listen((message) {
  if (message is TransferableTypedData) {
    final data = message.materialize().asUint8List();
    // Procesar data sin copia extra
  }
});
```

---

## Casos de Uso

| Caso de uso | Por qué un isolate |
|---|---|
| Parseo de JSON grande | Bloquearía el render thread si se hace inline |
| Compresión / descompresión | CPU-intensivo, tarda decenas de ms |
| Encriptación / hashing | AES, SHA256 sobre buffers grandes |
| Decodificación de imágenes | Antes de pasarlas a un `Canvas` o `Image` |
| Procesamiento de tramas BLE | Bytes crudos → structs de dominio |
| Queries pesadas a SQLite | Evita latencia de I/O en el main thread |
| Inferencia de modelos ML | TFLite sobre el background isolate |

---

## Isolates y Apps BLE

Esta es quizás la combinación más práctica. Las apps BLE reciben un **stream continuo de datos** — notificaciones de características, resultados de escaneo, tramas de protocolo — y necesitan procesarlos sin afectar la UI.

### Problema sin isolates

```
BLE Plugin → Main Isolate → [parseo de trama] → UI update
                ↑
         ¡Aquí se genera el jank si el parseo es lento!
```

### Solución con Background Isolate

```dart
// Arquitectura recomendada para BLE + Isolate

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
    // Envía los bytes crudos al isolate para que los decodifique
    _isolateSendPort.send(TransferableTypedData.fromList([bytes]));
  }
}

void _processorIsolate(SendPort mainPort) {
  final port = ReceivePort();
  mainPort.send(port.sendPort);

  port.listen((message) {
    if (message is TransferableTypedData) {
      final bytes = message.materialize().asUint8List();
      // Decodificar el protocolo propietario del dispositivo BLE
      final data = _decodeFrame(bytes);
      mainPort.send(data);
    }
  });
}

DeviceData _decodeFrame(Uint8List bytes) {
  // Ejemplo: protocolo de dispositivo de salud
  // Byte 0: tipo de paquete
  // Bytes 1-4: timestamp (little-endian)
  // Bytes 5-6: valor del sensor
  final type = bytes[0];
  final timestamp = ByteData.sublistView(bytes, 1, 5).getUint32(0, Endian.little);
  final value = ByteData.sublistView(bytes, 5, 7).getUint16(0, Endian.big);
  return DeviceData(type: type, timestamp: timestamp, value: value);
}
```

### Con Flutter 3.7+ — El isolate llama al plugin BLE directamente

```dart
void _bleBackgroundIsolate(RootIsolateToken token) async {
  BackgroundIsolateBinaryMessenger.ensureInitialized(token);

  // El isolate puede escanear, conectar y leer características por sí solo
  FlutterBluePlus.scanResults.listen((results) {
    for (final result in results) {
      final processed = _processAdvertisement(result.advertisementData);
      // Enviar resultado procesado al main isolate
    }
  });

  await FlutterBluePlus.startScan(timeout: const Duration(seconds: 10));
}
```

---

## Mejores Prácticas

### 1. Usa `Isolate.run()` para tareas únicas

```dart
// ✅ Correcto — limpio, moderno, sin boilerplate
final result = await Isolate.run(() => heavyParsing(data));

// ❌ Evitar — innecesariamente verboso para tareas simples
final port = ReceivePort();
await Isolate.spawn(heavyParsing, port.sendPort);
```

### 2. No abuses de los isolates para tareas rápidas

Lanzar un isolate tiene un overhead de **~1-2 ms** (más la copia de datos). Para operaciones que tardan menos de ~5 ms, el overhead supera el beneficio.

```dart
// ❌ No vale la pena — demasiado simple
final sum = await Isolate.run(() => list.fold(0, (a, b) => a + b));

// ✅ Mejor — operar inline si es trivial
final sum = list.fold(0, (a, b) => a + b);
```

### 3. Reutiliza isolates de larga duración para streams BLE

No lances un isolate nuevo por cada trama BLE recibida. Crea un isolate dedicado al inicio y mantenlo vivo durante toda la sesión de conexión.

```dart
// ✅ Un isolate que procesa muchas tramas
class BleFrameProcessor {
  SendPort? _port;

  Future<void> start() async { /* spawn una sola vez */ }
  void processFrame(Uint8List frame) => _port?.send(frame);
  void dispose() { /* kill el isolate al cerrar sesión */ }
}
```

### 4. Prefiere `TransferableTypedData` para buffers grandes

```dart
// ❌ Copia el buffer completo
sendPort.send(largeUint8List);

// ✅ Transfiere sin copia — crítico para tramas BLE frecuentes
sendPort.send(TransferableTypedData.fromList([largeUint8List]));
```

### 5. Llama a `BackgroundIsolateBinaryMessenger.ensureInitialized()` antes que nada

Si tu isolate necesita acceder a plugins nativos, esta debe ser **la primera línea** que ejecute. De lo contrario, cualquier llamada a un plugin lanzará un `MissingPluginException`.

```dart
void _myIsolate(RootIsolateToken token) async {
  // ✅ Primera línea siempre
  BackgroundIsolateBinaryMessenger.ensureInitialized(token);
  // ...resto del código
}
```

### 6. Maneja errores del isolate desde el main isolate

Los errores no capturados dentro de un isolate **no se propagan** al main isolate automáticamente. Usa `Isolate.addErrorListener` para capturarlos.

```dart
final errorPort = ReceivePort();
final isolate = await Isolate.spawn(
  _myIsolateEntry,
  sendPort,
  onError: errorPort.sendPort,
);

errorPort.listen((error) {
  final List errorData = error as List;
  print('Error en isolate: ${errorData[0]}');
  print('Stack: ${errorData[1]}');
});
```

### 7. Siempre cierra los ReceivePorts que ya no usas

Los `ReceivePort` activos impiden la recolección de basura del isolate. Ciérralos explícitamente cuando termines.

```dart
final port = ReceivePort();
// ... usar el port
port.close(); // ✅ Libera recursos
```

---

## Resumen

Los background isolates son la respuesta de Dart al problema de concurrencia: paralelismo real sin condiciones de carrera, gracias a la memoria aislada y el paso de mensajes.

Para apps BLE en Flutter, representan una herramienta indispensable: el stream continuo de datos del dispositivo puede procesarse, decodificarse y filtrarse en un isolate dedicado, mientras la UI permanece completamente fluida. Con Flutter 3.7+, ese isolate puede incluso llamar directamente a los plugins nativos, eliminando la última barrera que existía para arquitecturas BLE robustas en background.

La regla de oro es simple: **si bloquea el hilo principal por más de un frame, muévelo a un isolate.**

¡Hasta el próximo artículo!

---

## Referencias

1. [Dart — Isolates documentation](https://dart.dev/language/isolates)
2. [Flutter — Background isolates (flutter.dev)](https://docs.flutter.dev/perf/isolates)
3. [BackgroundIsolateBinaryMessenger — Flutter 3.7 release notes](https://docs.flutter.dev/release/release-notes/release-notes-3.7.0)
4. [Dart 2.19 — Isolate.run()](https://medium.com/dartlang/dart-2-19-release-notes)
5. [flutter_blue_plus — pub.dev](https://pub.dev/packages/flutter_blue_plus)
