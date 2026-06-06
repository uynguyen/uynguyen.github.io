---
title: Programar tareas en segundo plano desde un servicio en primer plano
date: 2023-07-22 21:56:13
tags:
layout: post
lang: es
thumbnail: /Post-Resources/ScheduleTask/banner.png
---
Si estas ejecutando tu servicio en Android, ten en cuenta que Android ha introducido restricciones mas estrictas de ejecucion en segundo plano en versiones recientes. A partir de Android 8.0 (nivel de API 26) y superior, los servicios en segundo plano tienen limitaciones en su tiempo de ejecucion, especialmente cuando la aplicacion esta en segundo plano. Asegurate de conocer estas restricciones y adaptar tu servicio en consecuencia.

<!-- more -->

## Timer
Cuando usas `Timer` para programar tareas, depende de un solo hilo en segundo plano. Si la pantalla se apaga, el dispositivo puede entrar en un estado de bajo consumo o en modo de suspension, y esto puede afectar la ejecucion de tareas programadas con `Timer`. En tales casos, las caracteristicas de ahorro de energia del dispositivo podrian pausar o retrasar la ejecucion de tareas, llevando a un comportamiento inesperado.

```java
private final Timer syncTimer = new Timer();
syncTimer.scheduleAtFixedRate(new TimerTask() {
    @Override
    public void run() {
        // Do your task
    }
});
```

En mi caso, mi aplicacion necesita programar una tarea repetida en segundo plano para sincronizar datos y verificar si el usuario todavia tiene permiso para acceder al dispositivo Bluetooth. En el primer intento, usamos `Timer`, y no funciono como se esperaba ya que el `Timer` no se ejecuta cuando el dispositivo entra en modo doze (El modo Doze es una caracteristica de ahorro de energia introducida en Android 6.0 (Marshmallow) que ayuda a extender la vida de la bateria reduciendo el consumo de energia del dispositivo cuando esta inactivo y no en uso. Optimiza el comportamiento de la aplicacion para minimizar la actividad en segundo plano, el acceso a la red y el uso de CPU durante periodos de inactividad. Cuando un dispositivo esta en modo Doze, restringe el procesamiento en segundo plano, el acceso a la red y los wake locks para ahorrar energia de la bateria.).
Por lo tanto, necesitamos encontrar una alternativa, y hay dos otros candidatos que me gustaria compartir contigo: `AlarmManager` y `WorkManager`.

## Alarm manager
Si necesitas programar tareas que deben ejecutarse incluso cuando la aplicacion no esta activamente en ejecucion, puedes usar la clase `AlarmManager`. Te permite programar tareas en momentos o intervalos especificos, incluso si tu aplicacion esta en segundo plano o no esta ejecutandose.

La clase `AlarmManager` en Android es un servicio del sistema que te permite programar tareas o eventos para que se ejecuten en momentos o intervalos especificos, incluso cuando tu aplicacion no esta activamente en ejecucion. Proporciona una forma de realizar acciones o activar la ejecucion de codigo en momentos especificados, como configurar alarmas, programar tareas recurrentes o ejecutar operaciones en segundo plano.

Las caracteristicas clave de `AlarmManager` incluyen:

**Precision de tiempo**: `AlarmManager` proporciona una sincronizacion precisa para programar tareas. Usa el reloj del sistema del dispositivo para determinar cuando ha transcurrido el tiempo o intervalo especificado.

**Flexibilidad en la programacion**: Puedes programar tareas para que se ejecuten una vez (`set()`), se repitan a intervalos fijos (`setRepeating()`), o se repitan a intervalos especificos con flexibilidad (`setInexactRepeating()`). Esta flexibilidad te permite programar tareas segun tus requisitos especificos.

**Persistencia de ejecucion**: Las tareas programadas registradas con `AlarmManager` persisten incluso si el dispositivo se reinicia. Esto asegura que las tareas se ejecutaran segun lo programado incluso despues de reinicios del sistema.

**Capacidad de despertar el dispositivo**: `AlarmManager` puede despertar el dispositivo del modo de suspension para ejecutar las tareas programadas. Esto es util para escenarios donde necesitas realizar operaciones en segundo plano que requieren que el dispositivo este despierto.

**Compatibilidad y soporte hacia atras**: `AlarmManager` ha estado disponible desde las primeras versiones de Android y proporciona compatibilidad hacia atras con versiones anteriores de Android. Esto asegura que tus tareas programadas puedan ejecutarse en una amplia gama de dispositivos.

Aqui hay un ejemplo basico de uso de `AlarmManager` para programar una tarea:

- Primero, necesitaras configurar los permisos necesarios en tu archivo `AndroidManifest.xml`:

```bash
<uses-permission android:name="android.permission.WAKE_LOCK"/>
```

- Luego, crea una clase para manejar la tarea que se ejecutara cuando se active la alarma, y usala

```java
public class MyAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        // Do your task
    }
}


Intent intent = new Intent(this, MyAlarmReceiver.class);
PendingIntent pendingIntent = PendingIntent.getBroadcast(this, 0, intent, 0);

// Get the AlarmManager service
AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);

// Set the repeating alarm
alarmManager.setRepeating(
    AlarmManager.RTC_WAKEUP,
    System.currentTimeMillis() + ALARM_INTERVAL_MS,
    ALARM_INTERVAL_MS,
    pendingIntent
);

```

## Work manager
`WorkManager` es una biblioteca de Android Jetpack introducida por Google para simplificar y gestionar tareas en segundo plano en aplicaciones Android. Esta disenada para facilitar a los desarrolladores la programacion de tareas diferibles, periodicas y unicas que necesitan ejecutarse incluso cuando la aplicacion no esta en ejecucion o el dispositivo esta en un estado de bajo consumo.

Usando `WorkManager`, puedes realizar tareas como subir datos a un servidor, sincronizar datos desde un servidor remoto, actualizaciones periodicas de datos, limpieza de base de datos, y mas, mientras aseguras una ejecucion en segundo plano eficiente y amigable con la bateria. Abstrae la complejidad de lidiar con varias versiones de Android y caracteristicas de ahorro de energia, convirtiendola en una solucion poderosa y recomendada para el procesamiento en segundo plano en aplicaciones Android modernas.

- Primero, abre el archivo `build.gradle` de tu aplicacion y agrega la dependencia de Guava al bloque de dependencias:

```bash
implementation "androidx.work:work-runtime:2.8.1"
implementation 'com.google.guava:guava:30.1-android'
```

- Luego, crea una clase para manejar la tarea que se ejecutara y usala

```java
class SyncDataWorker extends Worker {
    public SyncDataWorker(
            @NonNull Context context,
            @NonNull WorkerParameters params) {
        super(context, params);
    }

    @Override
    public Result doWork() {
        // Do your task
        return Result.success();
    }
}


// somewhere in your code
PeriodicWorkRequest periodicWorkRequest = new PeriodicWorkRequest.Builder(
        SyncDataWorker.class, TIME_IN_MILLISECONDS, TimeUnit.MILLISECONDS)
        .setConstraints(new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED) // Set it if your task requires network to be completed
                .build())
        .build();

WorkManager.getInstance(context).enqueue(periodicWorkRequest);
```

Cuando usas `WorkManager` y la pantalla del dispositivo esta apagada, hay algunas limitaciones y consideraciones a tener en cuenta:

**Ejecucion retrasada**: Cuando la pantalla del dispositivo esta apagada, Android puede entrar en estados de bajo consumo como el modo Doze o el modo de espera de aplicaciones para conservar bateria. En estos estados, las tareas en segundo plano, incluyendo las programadas por WorkManager, pueden retrasarse. WorkManager intenta ejecutar tareas durante ventanas de mantenimiento, pero todavia puede haber retrasos en la ejecucion de tareas.

**Restricciones de acceso a la red**: Android puede restringir el acceso a la red para tareas en segundo plano cuando la pantalla esta apagada. Si tu tarea depende de la conectividad de red, puede experimentar retrasos o tener acceso limitado a recursos de red. Puedes usar restricciones como `setRequiredNetworkType()` en WorkManager para especificar requisitos de red para tus tareas.

**Limites de ejecucion en segundo plano**: A partir de Android 8.0 (nivel de API 26), Android introdujo limites mas estrictos de ejecucion en segundo plano. Las aplicaciones en segundo plano, incluyendo las que ejecutan tareas en segundo plano programadas por WorkManager, tienen restricciones en su capacidad para ejecutar tareas intensivas en CPU o acceder a ciertos recursos. Aunque WorkManager esta disenado para manejar estas limitaciones y asegurar una ejecucion eficiente de tareas, todavia puede estar sujeto a restricciones impuestas por el sistema operativo.

**Comportamiento especifico del dispositivo**: Diferentes dispositivos Android y fabricantes pueden tener sus propias caracteristicas de ahorro de energia u optimizaciones que pueden afectar la ejecucion de tareas en segundo plano cuando la pantalla esta apagada. Estas optimizaciones pueden variar, llevando a diferentes comportamientos y limitaciones. Es importante probar tu aplicacion en varios dispositivos para asegurar un comportamiento consistente.

Para optimizar la ejecucion de tareas en segundo plano cuando la pantalla del dispositivo esta apagada, considera lo siguiente:

**Usa restricciones apropiadas**: Especifica restricciones como requisitos de red (`setRequiredNetworkType()`), estado de carga (`setRequiresCharging()`), y mas para asegurar que las tareas se ejecuten bajo las condiciones deseadas.

**Respeta las optimizaciones de bateria**: Anima a los usuarios a excluir tu aplicacion de las optimizaciones de bateria o ponerla en lista blanca en cualquier configuracion de ahorro de energia en su dispositivo. Esto puede ayudar a asegurar que tu aplicacion y sus tareas en segundo plano no sean excesivamente restringidas.

**Optimiza la ejecucion de tareas**: Estructura tus tareas para que sean lo mas eficientes posible, minimizando el impacto en la vida de la bateria y los recursos. Divide las tareas mas grandes en unidades mas pequenas y manejables y considera usar `ListenableWorker` o `CoroutineWorker` de WorkManager para mejor rendimiento.

Al considerar estos factores y disenar tus tareas en segundo plano y estrategias de programacion en consecuencia, puedes optimizar su ejecucion incluso cuando la pantalla del dispositivo esta apagada y trabajar dentro de las limitaciones impuestas por el sistema Android.

## Cual usar?
La eleccion entre `AlarmManager` y `WorkManager` depende de tu caso de uso especifico y requisitos. Aqui hay algunos factores a considerar al decidir cual es mejor para tus necesidades:

**Tiempo y flexibilidad**
   - `AlarmManager`: Ofrece una sincronizacion precisa para ejecutar tareas en momentos o intervalos especificos, incluso cuando la aplicacion no esta activamente en ejecucion. `AlarmManager` es adecuado para tareas criticas en tiempo que requieren una sincronizacion de ejecucion exacta.
   - `WorkManager`: Proporciona mas flexibilidad y optimizacion para tareas en segundo plano. `WorkManager` considera factores como optimizaciones de bateria, disponibilidad de red y estado inactivo del dispositivo para ejecutar tareas eficientemente. Es muy adecuado para tareas que no requieren precision estricta de tiempo, como sincronizar datos o actualizaciones periodicas que pueden aceptar algun retraso.

**Eficiencia energetica y optimizacion de bateria**
   - `AlarmManager`: Permite una ejecucion mas inmediata y puede despertar el dispositivo del modo de suspension. Sin embargo, si se usa incorrectamente, puede tener un impacto significativo en la vida de la bateria.
   - `WorkManager`: Aprovecha las optimizaciones del sistema para minimizar el uso de bateria. `WorkManager` agrupa tareas, respeta los estados inactivos del dispositivo y se adapta a las caracteristicas de ahorro de energia. Proporciona un enfoque mas eficiente energeticamente para ejecutar tareas en segundo plano.

**Compatibilidad y soporte hacia atras**
   - `AlarmManager`: Ha estado disponible desde las primeras versiones de Android y ofrece compatibilidad hacia atras con versiones anteriores de Android. Puede usarse en una amplia gama de dispositivos Android.
   - `WorkManager`: Es parte de la biblioteca Android Jetpack y es compatible hacia atras hasta el nivel de API 14 de Android (Ice Cream Sandwich). `WorkManager` esta disenado para funcionar consistentemente en diferentes versiones y dispositivos Android.

**Manejo de errores y mecanismo de reintento**
   - `AlarmManager`: No proporciona mecanismos integrados para manejar fallos de tareas o reintentos automaticos.
   - `WorkManager`: `WorkManager` puede reintentar automaticamente tareas fallidas con restricciones configurables.

En general, si necesitas sincronizacion precisa, ejecucion inmediata o la capacidad de despertar el dispositivo del modo de suspension, `AlarmManager` podria ser la mejor opcion. Por otro lado, si requieres eficiencia energetica, programacion flexible de tareas, manejo de errores y compatibilidad entre diferentes versiones de Android, `WorkManager` es una opcion mas adecuada.
En algunos casos, incluso puedes usar tanto `AlarmManager` como `WorkManager` juntos, dependiendo de los requisitos especificos de tu aplicacion. Por ejemplo, puedes usar `AlarmManager` para tareas sensibles al tiempo y `WorkManager` para procesamiento en segundo plano eficiente energeticamente.

## Conclusion
En resumen, mientras usar `Timer` podria llevar a un comportamiento impredecible cuando la pantalla se apaga debido a la ejecucion de un solo hilo y la falta de optimizaciones de ahorro de energia, `WorkManager` y `AlarmManager` pueden manejar la ejecucion de tareas de manera mas eficiente y confiable, **incluso cuando la pantalla esta apagada o el dispositivo esta en un estado de bajo consumo**. Para programar tareas en segundo plano, generalmente se recomienda usar `WorkManager` o `AlarmManager` en lugar de usar `Timer`.
