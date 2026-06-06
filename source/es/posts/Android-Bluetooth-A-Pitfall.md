---
title: 'Android Bluetooth: Una Trampa'
date: 2024-08-04 12:10:39
tags: [Android, Bluetooth]
layout: post
lang: es
thumbnail: /Post-Resources/BluetoothPitfall/bluetooth_pitfall.png
---

Desarrollar aplicaciones Android habilitadas para BLE está lleno de desafíos, especialmente cuando se trata de gestionar operaciones concurrentes. Una de las trampas más comunes que enfrentan los desarrolladores es el comportamiento inesperado que ocurre cuando intentan ejecutar operaciones BLE en rápida sucesión. En esta publicación de blog, profundizaremos en por qué esto sucede y cómo puedes superarlo implementando un mecanismo de cola personalizado para operaciones BLE.

<!-- more -->

Si has trabajado con BLE en Android, podrías haber encontrado un problema frustrante: cuando intentas ejecutar múltiples operaciones BLE una tras otra, como leer y escribir characteristics o descriptors, solo la primera operación tiene éxito, mientras que las otras parecen desaparecer. Esto es más que un inconveniente menor; es un problema serio porque la lógica de tu aplicación a menudo depende de la finalización exitosa de estas operaciones. Sin ellas, tu UI no puede actualizarse con los datos frescos de tu dispositivo conectado, llevando a una mala experiencia de usuario.

Entonces, ¿qué está pasando bajo el capó? El problema central está en cómo el stack BLE de Android maneja las operaciones. Las operaciones BLE son asíncronas, lo que significa que no se completan instantáneamente. Cuando ejecutas el stack BLE con múltiples solicitudes en rápida sucesión, el sistema lucha por mantenerse al día, llevando a operaciones descartadas y comportamiento impredecible.

## El Enfoque Convencional: Soluciones Basadas en Callbacks
Una forma de mitigar este problema es usando callbacks para secuenciar tus operaciones BLE.
Por ejemplo, podrías esperar a que el callback onCharacteristicWrite() se dispare antes de comenzar la siguiente operación. Esto funciona para casos de uso simples donde tus interacciones BLE están limitadas a una sola pantalla o Activity.
Sin embargo, este enfoque rápidamente se vuelve inmanejable a medida que crece la complejidad de tu aplicación. A medida que agregas más operaciones BLE—como leer y escribir descriptors, manejar conexiones y desconexiones, actualizar el MTU y realizar descubrimiento de services. Encontrarás que se necesita una solución más escalable.

## La Solución Escalable: Implementando un Mecanismo de Cola
Para manejar operaciones BLE de manera más confiable, un mecanismo de cola personalizado es esencial. Al encolar operaciones BLE, aseguras que cada operación se ejecute secuencialmente, solo después de que la operación anterior haya tenido éxito o fallado. Este enfoque no solo previene que las operaciones sean descartadas sino que también simplifica la gestión de tareas BLE a través de tu aplicación.

Aquí hay un esquema básico de cómo podrías implementar tal mecanismo:

- `Crear una Cola`: Comienza creando una cola (como un LinkedList o Queue) para contener tus operaciones BLE. Cada operación puede representarse como un objeto de tarea o comando que contiene los detalles de la operación que quieres realizar.
- `Manejador de Operaciones`: Implementa una clase de manejador o gestor responsable de procesar las operaciones en la cola. Esta clase debe escuchar la finalización de cada operación BLE, ya sea que tenga éxito o falle, antes de desencolar y ejecutar la siguiente operación.
- `Integración de Callbacks`: Modifica tus callbacks BLE existentes (como onCharacteristicWrite(), onCharacteristicRead(), etc.) para disparar el desencolado y ejecución de la siguiente operación en la cola.
- `Manejo de Errores`: Implementa manejo de errores para asegurar que las operaciones fallidas no bloqueen la cola. También podrías querer implementar lógica de reintento para errores transitorios.
- `Actualizaciones de UI`: Ya que tu UI puede depender del resultado de las operaciones BLE, asegura que tu gestor de cola dispare actualizaciones de UI apropiadas una vez que las operaciones se completen.

```java
class BLEManager {
    ConcurrentLinkedQueue<BLEBaseCommand> commandQueue = new ConcurrentLinkedQueue<>(); // Nota que estamos usando una ConcurrentLinkedQueue para prevenir problemas de concurrencia.

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
        if (!commandQueue.isEmpty()) { // ¿Hay comando restante?
            executeNextCommand();
        }
    }

    private void executeNextCommand() {
        BLEBaseCommand next = commandQueue.poll();
        if (next == null) {
            // Todo hecho
            return;
        }

        currentCommand = next;
        try {
            if (!currentCommand.execute()) {
                runOnUiThread(currentCommand.fallback); // Maneja tu error desde la función `fallback` dependiendo del comando
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

En algún lugar de tu clase `BluetoothGattCallback`.

```java
@Override
    public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
    // Tu lógica
    manager.signalCommandEnd();
}

@Override
public void onServiceChanged(@NonNull BluetoothGatt gatt) {
    // Tu lógica
    manager.signalCommandEnd();
}

@Override
public void onServicesDiscovered(BluetoothGatt gatt, int status) {
    // Tu lógica
    manager.signalCommandEnd();
}

@Override
public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
    // Tu lógica
    manager.signalCommandEnd();
}

@Override
public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
    // Tu lógica
    manager.signalCommandEnd();
}

@Override
public void onDescriptorRead(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
    // Tu lógica
    manager.signalCommandEnd();
}

@Override
public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
    // Tu lógica
    manager.signalCommandEnd();
}

@Override
public void onReadRemoteRssi(BluetoothGatt gatt, int rssi, int status) {
    // Tu lógica
    manager.signalCommandEnd();
}

@Override
public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
    // Tu lógica
    manager.signalCommandEnd();
}
```

A continuación está el diagrama de clases básico

![](/Post-Resources/BluetoothPitfall/design.png "Bluetooth")

## Por Qué Esto Importa
Implementar un mecanismo de cola para operaciones BLE no se trata solo de evitar operaciones descartadas; se trata de crear una arquitectura más confiable y escalable para tu aplicación. A medida que expandes la funcionalidad BLE de tu aplicación, estarás agradecido por la estabilidad y previsibilidad que proporciona un sistema de cola.

Vale la pena mencionar que paradigmas más modernos como `RxJava` o el framework de `Kotlin` pueden ofrecer soluciones aún más elegantes a este problema. Estas herramientas pueden ayudarte a gestionar operaciones asíncronas con mayor flexibilidad y menos código repetitivo. Sin embargo, para muchos desarrolladores, un mecanismo de cola personalizado proporciona una base sólida que puede ser fácilmente entendida e implementada sin introducir dependencias adicionales. Podríamos discutir esto en otro hilo.

## Conclusión
BLE en Android puede ser desafiante, pero con las estrategias correctas, puedes construir aplicaciones robustas que se comuniquen confiablemente con dispositivos BLE. Al implementar un mecanismo de cola personalizado, puedes superar muchos de los problemas relacionados con la concurrencia. Ya sea que estés comenzando con BLE o buscando mejorar tus aplicaciones existentes, adoptar un enfoque de cola hará tu proceso de desarrollo más fluido y tus aplicaciones más confiables.
¡Feliz Codificación!
