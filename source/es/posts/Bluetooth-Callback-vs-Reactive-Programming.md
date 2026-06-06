---
title: 'Desarrollo Bluetooth: Callback vs Programación Reactiva'
date: 2026-01-31 10:00:00
tags: [iOS, Android, BLE, RxSwift, RxJava, Reactive]
lang: es
layout: post
thumbnail: /Post-Resources/BLEReactive/cover.png
---

Construir aplicaciones Bluetooth Low Energy implica manejar numerosas operaciones asíncronas: escaneo, conexión, descubrimiento de servicios, lectura/escritura de características y manejo de desconexiones. El enfoque tradicional basado en callbacks puede volverse rápidamente difícil de manejar, llevando a lo que los desarrolladores llaman "callback hell". En este artículo, compararemos el enfoque de callback con la programación reactiva usando RxSwift y RxJava, y exploraremos cómo los patrones reactivos pueden mejorar dramáticamente tu código BLE.

<!-- more -->

## El desafío del desarrollo BLE

Las operaciones de Bluetooth Low Energy son inherentemente asíncronas. Un flujo típico para leer el valor de una característica implica:

1. Iniciar el escaneo de dispositivos
2. Conectar al periférico descubierto
3. Descubrir servicios
4. Descubrir características
5. Leer el valor de la característica
6. Manejar errores potenciales en cada paso

Cada paso depende de que el anterior se complete exitosamente, creando una cascada de operaciones dependientes que deben ser cuidadosamente orquestadas.

## El enfoque Callback

Comencemos viendo cómo implementaríamos un flujo BLE completo usando el patrón tradicional de delegate/callback en iOS.

### iOS con CoreBluetooth Delegates

```swift
import CoreBluetooth

class CallbackBLEManager: NSObject {
    private var centralManager: CBCentralManager!
    private var targetPeripheral: CBPeripheral?
    private var targetCharacteristic: CBCharacteristic?

    // Callbacks para cada operación
    private var scanCompletion: ((CBPeripheral?, Error?) -> Void)?
    private var connectCompletion: ((Error?) -> Void)?
    private var discoverServicesCompletion: (([CBService]?, Error?) -> Void)?
    private var discoverCharacteristicsCompletion: (([CBCharacteristic]?, Error?) -> Void)?
    private var readValueCompletion: ((Data?, Error?) -> Void)?

    private let targetServiceUUID = CBUUID(string: "180D")
    private let targetCharacteristicUUID = CBUUID(string: "2A37")

    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: nil)
    }

    // Función principal para leer frecuencia cardíaca
    func readHeartRate(completion: @escaping (Int?, Error?) -> Void) {
        // Paso 1: Escanear dispositivo
        scanForDevice { [weak self] peripheral, error in
            guard let self = self, let peripheral = peripheral else {
                completion(nil, error ?? BLEError.deviceNotFound)
                return
            }

            // Paso 2: Conectar al dispositivo
            self.connect(to: peripheral) { error in
                guard error == nil else {
                    completion(nil, error)
                    return
                }

                // Paso 3: Descubrir servicios
                self.discoverServices(for: peripheral) { services, error in
                    guard let services = services, error == nil else {
                        completion(nil, error)
                        return
                    }

                    guard let heartRateService = services.first(where: {
                        $0.uuid == self.targetServiceUUID
                    }) else {
                        completion(nil, BLEError.serviceNotFound)
                        return
                    }

                    // Paso 4: Descubrir características
                    self.discoverCharacteristics(for: heartRateService,
                                                 peripheral: peripheral) { characteristics, error in
                        guard let characteristics = characteristics, error == nil else {
                            completion(nil, error)
                            return
                        }

                        guard let heartRateChar = characteristics.first(where: {
                            $0.uuid == self.targetCharacteristicUUID
                        }) else {
                            completion(nil, BLEError.characteristicNotFound)
                            return
                        }

                        // Paso 5: Leer valor
                        self.readValue(for: heartRateChar,
                                      peripheral: peripheral) { data, error in
                            guard let data = data, error == nil else {
                                completion(nil, error)
                                return
                            }

                            let heartRate = self.parseHeartRate(from: data)
                            completion(heartRate, nil)
                        }
                    }
                }
            }
        }
    }

    private func scanForDevice(completion: @escaping (CBPeripheral?, Error?) -> Void) {
        scanCompletion = completion
        centralManager.scanForPeripherals(withServices: [targetServiceUUID], options: nil)

        // Timeout después de 10 segundos
        DispatchQueue.main.asyncAfter(deadline: .now() + 10) { [weak self] in
            if self?.scanCompletion != nil {
                self?.centralManager.stopScan()
                self?.scanCompletion?(nil, BLEError.scanTimeout)
                self?.scanCompletion = nil
            }
        }
    }

    private func connect(to peripheral: CBPeripheral,
                        completion: @escaping (Error?) -> Void) {
        connectCompletion = completion
        targetPeripheral = peripheral
        centralManager.connect(peripheral, options: nil)
    }

    private func discoverServices(for peripheral: CBPeripheral,
                                  completion: @escaping ([CBService]?, Error?) -> Void) {
        discoverServicesCompletion = completion
        peripheral.delegate = self
        peripheral.discoverServices([targetServiceUUID])
    }

    private func discoverCharacteristics(for service: CBService,
                                         peripheral: CBPeripheral,
                                         completion: @escaping ([CBCharacteristic]?, Error?) -> Void) {
        discoverCharacteristicsCompletion = completion
        peripheral.discoverCharacteristics([targetCharacteristicUUID], for: service)
    }

    private func readValue(for characteristic: CBCharacteristic,
                          peripheral: CBPeripheral,
                          completion: @escaping (Data?, Error?) -> Void) {
        readValueCompletion = completion
        targetCharacteristic = characteristic
        peripheral.readValue(for: characteristic)
    }

    private func parseHeartRate(from data: Data) -> Int {
        let bytes = [UInt8](data)
        if bytes[0] & 0x01 == 0 {
            return Int(bytes[1])
        } else {
            return Int(bytes[1]) | (Int(bytes[2]) << 8)
        }
    }
}

// MARK: - CBCentralManagerDelegate
extension CallbackBLEManager: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        // Manejar cambios de estado
    }

    func centralManager(_ central: CBCentralManager,
                       didDiscover peripheral: CBPeripheral,
                       advertisementData: [String: Any],
                       rssi RSSI: NSNumber) {
        central.stopScan()
        scanCompletion?(peripheral, nil)
        scanCompletion = nil
    }

    func centralManager(_ central: CBCentralManager,
                       didConnect peripheral: CBPeripheral) {
        connectCompletion?(nil)
        connectCompletion = nil
    }

    func centralManager(_ central: CBCentralManager,
                       didFailToConnect peripheral: CBPeripheral,
                       error: Error?) {
        connectCompletion?(error ?? BLEError.connectionFailed)
        connectCompletion = nil
    }
}

// MARK: - CBPeripheralDelegate
extension CallbackBLEManager: CBPeripheralDelegate {
    func peripheral(_ peripheral: CBPeripheral,
                   didDiscoverServices error: Error?) {
        if let error = error {
            discoverServicesCompletion?(nil, error)
        } else {
            discoverServicesCompletion?(peripheral.services, nil)
        }
        discoverServicesCompletion = nil
    }

    func peripheral(_ peripheral: CBPeripheral,
                   didDiscoverCharacteristicsFor service: CBService,
                   error: Error?) {
        if let error = error {
            discoverCharacteristicsCompletion?(nil, error)
        } else {
            discoverCharacteristicsCompletion?(service.characteristics, nil)
        }
        discoverCharacteristicsCompletion = nil
    }

    func peripheral(_ peripheral: CBPeripheral,
                   didUpdateValueFor characteristic: CBCharacteristic,
                   error: Error?) {
        if let error = error {
            readValueCompletion?(nil, error)
        } else {
            readValueCompletion?(characteristic.value, nil)
        }
        readValueCompletion = nil
    }
}

enum BLEError: Error {
    case deviceNotFound
    case scanTimeout
    case connectionFailed
    case serviceNotFound
    case characteristicNotFound
}
```

### Problemas con el enfoque Callback

Mirando el código anterior, varios problemas se hacen evidentes:

1. **Callback Hell**: Los callbacks anidados en `readHeartRate()` crean una "pirámide de la perdición" difícil de leer y mantener.

2. **Gestión de estado**: Necesitamos múltiples completion handlers opcionales y debemos gestionar cuidadosamente su ciclo de vida.

3. **Manejo de errores**: El manejo de errores es repetitivo y está disperso por todo el código.

4. **Gestión de memoria**: Riesgo de retain cycles con closures requiere uso cuidadoso de `[weak self]`.

5. **Manejo de timeout**: Cada operación necesita su propia lógica de timeout.

6. **Sin composición**: Las operaciones no pueden combinarse, reintentarse o transformarse fácilmente.

## El enfoque Reactivo

### ¿Qué es la Programación Reactiva?

La Programación Reactiva es un paradigma de programación declarativo enfocado en flujos de datos y la propagación de cambios. En lugar de escribir instrucciones paso a paso (imperativo), describes *qué* quieres que suceda cuando los datos fluyen a través de tu sistema.

Piénsalo como configurar una tubería: los datos entran por un extremo, fluyen a través de varias transformaciones, y salen por el otro extremo en la forma que necesitas. La tubería maneja automáticamente el flujo, errores y finalización.

### Conceptos fundamentales

**1. Observable (Flujo)**
Un Observable representa un flujo de datos que puede emitir valores a lo largo del tiempo. Puede emitir:
- **Next**: Un nuevo valor en el flujo
- **Error**: Ocurrió un error, el flujo termina
- **Complete**: El flujo finalizó exitosamente

```swift
// Un Observable que emite valores de frecuencia cardíaca a lo largo del tiempo
Observable<Int>  // emite: 72 -> 75 -> 71 -> 68 -> ...
```

**2. Observer (Suscriptor)**
Un Observer se suscribe a un Observable y reacciona a los valores emitidos:

```swift
heartRateObservable
    .subscribe(
        onNext: { value in print("Frecuencia cardíaca: \(value)") },
        onError: { error in print("Error: \(error)") },
        onComplete: { print("Monitoreo detenido") }
    )
```

**3. Operators (Operadores)**
Los operadores transforman, filtran y combinan flujos. Los operadores comunes incluyen:

| Operador | Propósito | Ejemplo |
|----------|---------|---------|
| `map` | Transformar cada valor | Convertir bytes crudos a frecuencia cardíaca |
| `filter` | Solo pasar valores que cumplan condición | Solo valores > 60 BPM |
| `flatMap` | Transformar en otro Observable | Conectar, luego descubrir servicios |
| `take` | Tomar solo los primeros N valores | Tomar primer dispositivo descubierto |
| `timeout` | Fallar si no hay valor en el tiempo | Timeout de escaneo después de 10s |
| `retry` | Reintentar en caso de error | Reconectar al desconectarse |
| `catch` | Manejar errores graciosamente | Retornar valor por defecto en error |

**4. Disposable (Gestión de suscripciones)**
Un Disposable representa una suscripción activa. Disponerlo cancela la suscripción y limpia los recursos:

```swift
let disposeBag = DisposeBag()

observable
    .subscribe(onNext: { value in /* manejar */ })
    .disposed(by: disposeBag)  // Auto-dispuesto cuando disposeBag es deallocado
```

**5. Schedulers**
Los Schedulers controlan en qué hilo/cola se ejecutan las operaciones:

```swift
observable
    .subscribe(on: ConcurrentDispatchQueueScheduler(qos: .background))  // Trabajar en background
    .observe(on: MainScheduler.instance)  // Entregar resultados en hilo principal
```

### ¿Por qué Reactivo para BLE?

La programación reactiva es particularmente adecuada para BLE porque:

1. **Ajuste natural para eventos asíncronos**: Las operaciones BLE son flujos de eventos (resultados de escaneo, estado de conexión, actualizaciones de características)
2. **Manejo de errores integrado**: Operadores como `retry`, `catch` y `timeout` manejan escenarios comunes de fallas BLE
3. **Composición fácil**: Encadenar operaciones naturalmente (escanear → conectar → descubrir → leer)
4. **Limpieza automática de recursos**: Los Disposables aseguran que las conexiones y escaneos se limpien correctamente

Ahora veamos cómo la programación reactiva transforma este código. Usaremos RxSwift para iOS y mostraremos equivalentes en RxJava para Android.

### iOS con RxSwift + RxBluetoothKit

```swift
import RxSwift
import RxBluetoothKit
import CoreBluetooth

class ReactiveBLEManager {
    private let centralManager: CentralManager
    private let disposeBag = DisposeBag()

    private let heartRateServiceUUID = CBUUID(string: "180D")
    private let heartRateMeasurementUUID = CBUUID(string: "2A37")

    init() {
        centralManager = CentralManager(queue: .main)
    }

    // Flujo BLE limpio y declarativo
    func readHeartRate() -> Observable<Int> {
        return centralManager.observeState()
            .startWith(centralManager.state)
            .filter { $0 == .poweredOn }
            .take(1)
            .flatMap { [weak self] _ -> Observable<ScannedPeripheral> in
                guard let self = self else { return .empty() }
                return self.centralManager.scanForPeripherals(
                    withServices: [self.heartRateServiceUUID]
                )
            }
            .take(1)
            .timeout(.seconds(10), scheduler: MainScheduler.instance)
            .flatMap { scannedPeripheral -> Observable<Peripheral> in
                scannedPeripheral.peripheral.establishConnection()
            }
            .flatMap { [weak self] peripheral -> Observable<Service> in
                guard let self = self else { return .empty() }
                return peripheral.discoverServices([self.heartRateServiceUUID])
                    .flatMap { Observable.from($0) }
            }
            .flatMap { [weak self] service -> Observable<Characteristic> in
                guard let self = self else { return .empty() }
                return service.discoverCharacteristics([self.heartRateMeasurementUUID])
                    .flatMap { Observable.from($0) }
            }
            .flatMap { characteristic -> Observable<Characteristic> in
                characteristic.readValue()
            }
            .map { characteristic -> Int in
                guard let data = characteristic.value else {
                    throw BLEError.invalidData
                }
                return self.parseHeartRate(from: data)
            }
    }

    // Suscribirse a actualizaciones continuas de frecuencia cardíaca
    func observeHeartRate() -> Observable<Int> {
        return centralManager.observeState()
            .startWith(centralManager.state)
            .filter { $0 == .poweredOn }
            .take(1)
            .flatMap { [weak self] _ -> Observable<ScannedPeripheral> in
                guard let self = self else { return .empty() }
                return self.centralManager.scanForPeripherals(
                    withServices: [self.heartRateServiceUUID]
                )
            }
            .take(1)
            .timeout(.seconds(10), scheduler: MainScheduler.instance)
            .flatMap { scannedPeripheral -> Observable<Peripheral> in
                scannedPeripheral.peripheral.establishConnection()
            }
            .flatMap { [weak self] peripheral -> Observable<Characteristic> in
                guard let self = self else { return .empty() }
                return peripheral.discoverServices([self.heartRateServiceUUID])
                    .flatMap { Observable.from($0) }
                    .flatMap { service in
                        service.discoverCharacteristics([self.heartRateMeasurementUUID])
                    }
                    .flatMap { Observable.from($0) }
            }
            .flatMap { characteristic -> Observable<Characteristic> in
                characteristic.observeValueUpdateAndSetNotification()
            }
            .map { [weak self] characteristic -> Int in
                guard let self = self, let data = characteristic.value else {
                    throw BLEError.invalidData
                }
                return self.parseHeartRate(from: data)
            }
    }

    private func parseHeartRate(from data: Data) -> Int {
        let bytes = [UInt8](data)
        if bytes[0] & 0x01 == 0 {
            return Int(bytes[1])
        } else {
            return Int(bytes[1]) | (Int(bytes[2]) << 8)
        }
    }
}

// Uso
class HeartRateViewController: UIViewController {
    private let bleManager = ReactiveBLEManager()
    private let disposeBag = DisposeBag()

    override func viewDidLoad() {
        super.viewDidLoad()

        // Lectura única
        bleManager.readHeartRate()
            .observe(on: MainScheduler.instance)
            .subscribe(
                onNext: { heartRate in
                    print("Frecuencia cardíaca: \(heartRate) BPM")
                },
                onError: { error in
                    print("Error: \(error)")
                }
            )
            .disposed(by: disposeBag)

        // Monitoreo continuo con reintento automático
        bleManager.observeHeartRate()
            .retry(when: { errors in
                errors.delay(.seconds(5), scheduler: MainScheduler.instance)
            })
            .observe(on: MainScheduler.instance)
            .subscribe(onNext: { heartRate in
                self.updateUI(heartRate: heartRate)
            })
            .disposed(by: disposeBag)
    }

    private func updateUI(heartRate: Int) {
        // Actualizar UI
    }
}
```

### Android con RxJava + RxAndroidBle

```java
import com.polidea.rxandroidble2.RxBleClient;
import com.polidea.rxandroidble2.RxBleConnection;
import com.polidea.rxandroidble2.RxBleDevice;
import com.polidea.rxandroidble2.scan.ScanSettings;
import io.reactivex.Observable;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

public class ReactiveBLEManager {
    private static final UUID HEART_RATE_SERVICE =
        UUID.fromString("0000180d-0000-1000-8000-00805f9b34fb");
    private static final UUID HEART_RATE_MEASUREMENT =
        UUID.fromString("00002a37-0000-1000-8000-00805f9b34fb");

    private final RxBleClient rxBleClient;
    private final CompositeDisposable disposables = new CompositeDisposable();

    public ReactiveBLEManager(Context context) {
        rxBleClient = RxBleClient.create(context);
    }

    public Observable<Integer> readHeartRate() {
        return rxBleClient.scanBleDevices(
                new ScanSettings.Builder()
                    .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                    .build(),
                new ScanFilter.Builder()
                    .setServiceUuid(new ParcelUuid(HEART_RATE_SERVICE))
                    .build()
            )
            .take(1)
            .timeout(10, TimeUnit.SECONDS)
            .map(scanResult -> scanResult.getBleDevice())
            .flatMap(device -> device.establishConnection(false))
            .flatMapSingle(connection ->
                connection.readCharacteristic(HEART_RATE_MEASUREMENT)
            )
            .map(this::parseHeartRate);
    }

    public Observable<Integer> observeHeartRate() {
        return rxBleClient.scanBleDevices(
                new ScanSettings.Builder()
                    .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                    .build(),
                new ScanFilter.Builder()
                    .setServiceUuid(new ParcelUuid(HEART_RATE_SERVICE))
                    .build()
            )
            .take(1)
            .timeout(10, TimeUnit.SECONDS)
            .map(scanResult -> scanResult.getBleDevice())
            .flatMap(device -> device.establishConnection(false))
            .flatMap(connection ->
                connection.setupNotification(HEART_RATE_MEASUREMENT)
            )
            .flatMap(observable -> observable)
            .map(this::parseHeartRate);
    }

    private int parseHeartRate(byte[] data) {
        if ((data[0] & 0x01) == 0) {
            return data[1] & 0xFF;
        } else {
            return (data[1] & 0xFF) | ((data[2] & 0xFF) << 8);
        }
    }

    public void dispose() {
        disposables.clear();
    }
}

// Uso en Activity
public class HeartRateActivity extends AppCompatActivity {
    private ReactiveBLEManager bleManager;
    private CompositeDisposable disposables = new CompositeDisposable();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        bleManager = new ReactiveBLEManager(this);

        // Lectura única
        disposables.add(
            bleManager.readHeartRate()
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                    heartRate -> Log.d("BLE", "Frecuencia cardíaca: " + heartRate),
                    error -> Log.e("BLE", "Error: " + error.getMessage())
                )
        );

        // Monitoreo continuo con reintento
        disposables.add(
            bleManager.observeHeartRate()
                .retryWhen(errors ->
                    errors.delay(5, TimeUnit.SECONDS)
                )
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                    heartRate -> updateUI(heartRate),
                    error -> handleError(error)
                )
        );
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        disposables.clear();
    }
}
```

## Patrones Reactivos avanzados

La programación reactiva permite patrones poderosos que serían complejos de implementar con callbacks.

### 1. Reconexión automática

```swift
func connectWithAutoReconnect(to deviceId: UUID) -> Observable<Peripheral> {
    return centralManager.retrievePeripherals(withIdentifiers: [deviceId])
        .flatMap { peripherals -> Observable<Peripheral> in
            guard let peripheral = peripherals.first else {
                return .error(BLEError.deviceNotFound)
            }
            return peripheral.establishConnection()
        }
        .retry(when: { errors in
            errors
                .enumerated()
                .flatMap { (attempt, error) -> Observable<Int> in
                    guard attempt < 5 else {
                        return .error(error)
                    }
                    let delay = Double(min(attempt + 1, 5)) * 2.0
                    print("Reconectando en \(delay) segundos (intento \(attempt + 1))")
                    return Observable<Int>.timer(
                        .seconds(Int(delay)),
                        scheduler: MainScheduler.instance
                    )
                }
        })
}
```

### 2. Lecturas paralelas de características

```swift
func readMultipleCharacteristics(from peripheral: Peripheral) -> Observable<DeviceInfo> {
    let firmwareChar = CBUUID(string: "2A26")
    let hardwareChar = CBUUID(string: "2A27")
    let serialChar = CBUUID(string: "2A25")
    let deviceInfoService = CBUUID(string: "180A")

    return peripheral.discoverServices([deviceInfoService])
        .flatMap { services -> Observable<Service> in
            guard let service = services.first else {
                return .error(BLEError.serviceNotFound)
            }
            return .just(service)
        }
        .flatMap { service in
            service.discoverCharacteristics([firmwareChar, hardwareChar, serialChar])
        }
        .flatMap { characteristics -> Observable<DeviceInfo> in
            let reads = characteristics.map { char in
                char.readValue().map { ($0.uuid, $0.value) }
            }

            return Observable.zip(reads) { results in
                var firmware = ""
                var hardware = ""
                var serial = ""

                for (uuid, data) in results {
                    guard let data = data,
                          let value = String(data: data, encoding: .utf8) else {
                        continue
                    }

                    switch uuid {
                    case firmwareChar: firmware = value
                    case hardwareChar: hardware = value
                    case serialChar: serial = value
                    default: break
                    }
                }

                return DeviceInfo(
                    firmware: firmware,
                    hardware: hardware,
                    serial: serial
                )
            }
        }
}
```

### 3. Escritura con confirmación de respuesta

```swift
func writeWithConfirmation(data: Data,
                           to characteristic: Characteristic) -> Observable<Bool> {
    return characteristic.writeValue(data, type: .withResponse)
        .timeout(.seconds(5), scheduler: MainScheduler.instance)
        .map { _ in true }
        .catch { error in
            print("Escritura fallida: \(error)")
            return .just(false)
        }
}

func writeSequence(commands: [Data],
                   to characteristic: Characteristic) -> Observable<Int> {
    return Observable.from(commands)
        .enumerated()
        .concatMap { index, data in
            characteristic.writeValue(data, type: .withResponse)
                .map { _ in index }
                .delay(.milliseconds(100), scheduler: MainScheduler.instance)
        }
}
```

### 4. Escaneo con filtrado de RSSI

```swift
func scanForNearbyDevices(rssiThreshold: Int = -70) -> Observable<ScannedPeripheral> {
    return centralManager.scanForPeripherals(withServices: nil)
        .filter { $0.rssi.intValue >= rssiThreshold }
        .distinctUntilChanged { $0.peripheral.identifier == $1.peripheral.identifier }
        .buffer(timeSpan: .seconds(2), count: 100, scheduler: MainScheduler.instance)
        .flatMap { peripherals -> Observable<ScannedPeripheral> in
            // Devolver el que tiene mejor RSSI
            let sorted = peripherals.sorted { $0.rssi.intValue > $1.rssi.intValue }
            return Observable.from(sorted)
        }
}
```

## Resumen de comparación

| Aspecto | Callback | Reactivo |
|--------|----------|----------|
| **Estructura del código** | Callbacks anidados, pirámide de la perdición | Plano, operaciones encadenables |
| **Manejo de errores** | Disperso, repetitivo | Centralizado con `.catch`, `.retry` |
| **Composición** | Difícil | Natural con operadores |
| **Testing** | Mocking complejo | Fácil con test schedulers |
| **Manejo de timeout** | Implementación manual | Operador `.timeout()` integrado |
| **Lógica de reintento** | Gestión de estado compleja | Simple con `.retry()`, `.retryWhen()` |
| **Threading** | Dispatch manual | Declarativo con schedulers |
| **Gestión de memoria** | Manejo cuidadoso de closures | Automático con DisposeBag |
| **Curva de aprendizaje** | Más baja | Mayor inversión inicial |
| **Depuración** | Stack traces directos | Puede ser complejo |

## Cuándo usar cada enfoque

### Usar Callbacks cuando:

- Construir una app simple con mínimas operaciones BLE
- El equipo no está familiarizado con programación reactiva
- Operaciones BLE únicas, de una sola vez
- Prototipado o prueba de concepto

### Usar Programación Reactiva cuando:

- Flujos BLE complejos con múltiples operaciones
- Necesidad de lógica de reconexión automática y reintentos
- Streaming de datos en tiempo real desde dispositivos
- Múltiples operaciones BLE concurrentes
- Proyectos de equipos grandes que requieren patrones consistentes
- La mantenibilidad a largo plazo es importante

## Estrategia de migración

Si estás migrando de callbacks a reactivo:

1. **Empezar pequeño**: Comenzar con nuevas características usando patrones reactivos
2. **Envolver código existente**: Crear wrappers reactivos alrededor del código basado en callbacks
3. **Refactorización gradual**: Reemplazar implementaciones de callback una a la vez
4. **Capacitación del equipo**: Invertir en educación de programación reactiva

```swift
// Envolviendo código basado en callback
extension CBCentralManager {
    func rx_scanForPeripherals(withServices services: [CBUUID]?) -> Observable<CBPeripheral> {
        return Observable.create { observer in
            // Puente al escaneo basado en callback
            let delegate = RxCentralManagerDelegate(observer: observer)
            self.delegate = delegate
            self.scanForPeripherals(withServices: services, options: nil)

            return Disposables.create {
                self.stopScan()
            }
        }
    }
}
```

## Conclusión

Aunque el enfoque de callback es más simple de entender inicialmente, la programación reactiva proporciona ventajas significativas para el desarrollo BLE:

- **Código más limpio** que se lee como una descripción de lo que quieres lograr
- **Mejor manejo de errores** con mecanismos de reintento y timeout integrados
- **Composición más fácil** de flujos asíncronos complejos
- **Mejor testabilidad** con scheduling determinístico

La curva de aprendizaje inicial vale la inversión para cualquier proyecto BLE serio. Bibliotecas como RxBluetoothKit (iOS) y RxAndroidBle (Android) facilitan la transición al proporcionar wrappers reactivos alrededor de las APIs Bluetooth nativas de la plataforma.

Comienza con operaciones simples, adopta gradualmente patrones más avanzados, y observa cómo tu código BLE se transforma de callbacks enredados en streams reactivos elegantes y mantenibles.

## Referencias

- [Documentación de RxSwift](https://github.com/ReactiveX/RxSwift)
- [RxBluetoothKit](https://github.com/Polidea/RxBluetoothKit)
- [RxAndroidBle](https://github.com/Polidea/RxAndroidBle)
- [Documentación de ReactiveX](http://reactivex.io/documentation)
- [Apple Core Bluetooth](https://developer.apple.com/documentation/corebluetooth)
