---
title: 'Seguridad en Comunicaciones Bluetooth: Implementando Flujos de Autenticación y Cifrado'
date: 2025-04-02 18:03:38
tags: [CoreBluetooh, BLE]
layout: post
lang: es
---

![](/Post-Resources/BLESecurity/cover.png "Seguridad Bluetooth")

Bluetooth se ha convertido en el hilo invisible que conecta nuestros dispositivos, desde relojes inteligentes y rastreadores de salud hasta cerraduras inteligentes y sistemas IoT industriales. Pero con la comodidad viene el riesgo: la comunicación Bluetooth es inalámbrica y fácilmente interceptable, lo que la hace vulnerable a la interceptación, acceso no autorizado y ataques de repetición.
Para defendernos contra estas amenazas, la autenticación y el cifrado son esenciales. En esta publicación, presentaré un flujo de seguridad Bluetooth robusto, explicando cómo funcionan juntos la autenticación, el intercambio de claves y la transferencia cifrada. También lo compararemos con TLS/HTTPS ya que ambos comparten un enfoque similar de seguridad por capas.

<!-- more -->

## Repaso: Cómo Funciona HTTPS
Antes de profundizar en la autenticación Bluetooth, es útil entender cómo HTTPS (Protocolo de Transferencia de Hipertexto Seguro) protege la comunicación en la web, ya que ambos comparten principios de seguridad similares.
Cuando visitas un sitio web seguro (https://), tu navegador y el servidor realizan un proceso llamado handshake TLS para establecer confianza y cifrado. Este handshake ocurre en algunos pasos clave:

- Saludo del Cliente – El navegador envía un mensaje al servidor presentándose, listando los métodos de cifrado soportados y un número aleatorio (usado posteriormente en la generación de claves).
- Saludo del Servidor – El servidor responde con su propio número aleatorio, selecciona un método de cifrado y envía su certificado SSL/TLS — que incluye su clave pública y es verificado por una Autoridad de Certificación (CA).
- Autenticación – El navegador verifica que el certificado sea válido y confiable (no expirado, revocado ni emitido para otro dominio). Este paso asegura que el sitio web es legítimo.
- Intercambio de Claves – Usando la clave pública del certificado (o a través de ECDHE — Curva Elíptica Diffie-Hellman Efímera), ambas partes generan de forma segura una clave de sesión compartida que solo ellos pueden calcular.
- Comunicación Cifrada – Una vez establecida la clave de sesión, todos los datos intercambiados entre el navegador y el servidor se cifran usando cifrado simétrico (típicamente AES o ChaCha20).
- Integridad y Autenticación – Cada mensaje incluye una suma de verificación criptográfica (MAC o etiqueta AEAD) para prevenir manipulación o ataques de repetición.

Desde ese punto en adelante, tu conexión está tanto cifrada (nadie puede leer tus datos) como autenticada (sabes que estás hablando con el servidor real).

En resumen, HTTPS asegura la comunicación usando:

- Certificados para establecer identidad.
- Intercambio de claves para derivar claves de sesión únicas.
- Cifrado simétrico para rendimiento y confidencialidad.
- Verificaciones de integridad para detectar cualquier modificación.

## Un Flujo de Autenticación Bluetooth Seguro

Ahora traduzcamos estos conceptos a un flujo de seguridad Bluetooth práctico. A diferencia de HTTPS, Bluetooth no tiene una infraestructura de autoridad de certificación incorporada. En cambio, típicamente dependemos de **Claves Precompartidas (PSK)** o mecanismos de emparejamiento fuera de banda para establecer la confianza inicial.

Aquí hay un flujo robusto de autenticación y cifrado para comunicación BLE:

![](/Post-Resources/BLESecurity/ble-security-flow.png "Flujo de Seguridad BLE")

### Fase 1: Autenticación Desafío-Respuesta

Antes de que se intercambien datos sensibles, tanto la aplicación móvil (Central) como el dispositivo BLE (Periférico) deben demostrar que comparten un secreto común — el PSK.

```
┌──────────────┐                          ┌──────────────┐
│   Central    │                          │  Periférico  │
│   (Móvil)    │                          │ (Dispositivo)│
└──────┬───────┘                          └──────┬───────┘
       │                                         │
       │  1. Generar Desafío Aleatorio (Nc)      │
       │  2. Enviar Desafío ─────────────────────▶
       │                                         │
       │         3. Dispositivo genera Nd        │
       │         4. Respuesta = HMAC(PSK, Nc||Nd)│
       │                                         │
       │  ◀───────────── 5. Enviar (Nd, Respuesta)│
       │                                         │
       │  6. Verificar Respuesta                 │
       │  7. Generar propia Respuesta para Disp. │
       │  ─────────────────────────────────────▶ │
       │                                         │
       │         8. Dispositivo verifica         │
       ▼                                         ▼
   [Autenticación Mutua Completada]
```

**Cómo funciona:**

1. **Central genera un nonce (Nc)** — un número aleatorio usado solo una vez — y lo envía al Periférico.
2. **Periférico genera su propio nonce (Nd)** y calcula una respuesta usando HMAC-SHA256:
   ```
   Respuesta = HMAC-SHA256(PSK, Nc || Nd)
   ```
3. **Periférico envía de vuelta (Nd, Respuesta)** al Central.
4. **Central verifica** calculando el mismo HMAC con el PSK compartido. Si coincide, el dispositivo está autenticado.
5. **Autenticación mutua** — El Central luego envía su propia respuesta de vuelta para que el Periférico pueda verificar también la identidad del Central.

Este mecanismo de desafío-respuesta asegura:
- **Sin ataques de repetición** — Cada sesión usa nonces frescos.
- **Sin transmisión de PSK** — El secreto nunca viaja por el aire.
- **Autenticación mutua** — Ambas partes prueban su identidad.

### Fase 2: Intercambio de Claves con ECDH

Una vez autenticados, necesitamos establecer una **clave de sesión** para el cifrado. Usamos **Curva Elíptica Diffie-Hellman (ECDH)** para derivar un secreto compartido sin transmitirlo directamente.

```swift
// Generar par de claves efímeras en cada lado
let privateKey = P256.KeyAgreement.PrivateKey()
let publicKey = privateKey.publicKey

// Intercambiar claves públicas sobre BLE
// Central envía su clave pública al Periférico
// Periférico envía su clave pública al Central

// Ambos lados calculan el secreto compartido
let sharedSecret = try privateKey.sharedSecretFromKeyAgreement(
    with: peerPublicKey
)

// Derivar la clave de sesión usando HKDF
let sessionKey = sharedSecret.hkdfDerivedSymmetricKey(
    using: SHA256.self,
    salt: salt,
    sharedInfo: "BLE-Session-Key".data(using: .utf8)!,
    outputByteCount: 32
)
```

**¿Por qué ECDH?**

- **Secreto hacia adelante** — Incluso si el PSK se compromete después, las sesiones pasadas permanecen seguras porque cada sesión usa claves efímeras.
- **Sin transmisión de secreto compartido** — Solo se intercambian claves públicas; el secreto compartido se calcula independientemente.
- **Eficiente** — ECC proporciona seguridad fuerte con tamaños de clave más pequeños, ideal para dispositivos BLE con recursos limitados.

### Fase 3: Transferencia de Datos Cifrada

Con la clave de sesión establecida, toda la comunicación subsecuente se cifra usando **AES-GCM** (Modo Galois/Contador):

```swift
// Cifrar datos antes de enviar
func encrypt(data: Data, using key: SymmetricKey) throws -> Data {
    let nonce = AES.GCM.Nonce()
    let sealedBox = try AES.GCM.seal(data, using: key, nonce: nonce)

    // Combinar nonce + texto cifrado + etiqueta para transmisión
    return nonce + sealedBox.ciphertext + sealedBox.tag
}

// Descifrar datos recibidos
func decrypt(data: Data, using key: SymmetricKey) throws -> Data {
    let nonce = try AES.GCM.Nonce(data: data.prefix(12))
    let ciphertext = data.dropFirst(12).dropLast(16)
    let tag = data.suffix(16)

    let sealedBox = try AES.GCM.SealedBox(
        nonce: nonce,
        ciphertext: ciphertext,
        tag: tag
    )

    return try AES.GCM.open(sealedBox, using: key)
}
```

**AES-GCM proporciona:**

- **Confidencialidad** — Los datos están cifrados e ilegibles sin la clave.
- **Integridad** — La etiqueta de autenticación detecta cualquier manipulación.
- **Autenticación** — Solo las partes con la clave de sesión pueden descifrar.

### Contador de Secuencia: Previniendo Ataques de Repetición

Incluso con cifrado, un atacante podría capturar y repetir paquetes cifrados. Para prevenir esto, incluimos un **contador de secuencia**:

```swift
struct SecureMessage {
    let sequenceNumber: UInt32
    let encryptedPayload: Data
}

class SequenceValidator {
    private var expectedSequence: UInt32 = 0

    func validate(_ message: SecureMessage) -> Bool {
        guard message.sequenceNumber == expectedSequence else {
            return false // Ataque de repetición o fuera de orden detectado
        }
        expectedSequence += 1
        return true
    }
}
```

El número de secuencia se incluye en los datos autenticados (AAD) de AES-GCM, por lo que cualquier modificación es detectada.

## Comparación: HTTPS vs Flujo de Seguridad BLE

| Aspecto | HTTPS/TLS | Flujo de Seguridad BLE |
|---------|-----------|------------------------|
| **Ancla de Confianza** | Autoridad de Certificación (CA) | Clave Precompartida (PSK) |
| **Autenticación** | Verificación de certificado | Desafío-respuesta con HMAC |
| **Intercambio de Claves** | ECDHE o RSA | ECDH |
| **Cifrado** | AES-GCM, ChaCha20-Poly1305 | AES-GCM |
| **Secreto Hacia Adelante** | Sí (con ECDHE) | Sí (claves ECDH efímeras) |
| **Protección contra Repetición** | Números de secuencia en registro TLS | Contador de secuencia en carga útil |

Ambos enfoques comparten los mismos principios fundamentales:
1. **Autenticar primero** — Verificar identidad antes de confiar.
2. **Derivar claves de sesión** — Nunca reutilizar claves entre sesiones.
3. **Cifrar todo** — Proteger la confidencialidad de los datos.
4. **Verificar integridad** — Detectar manipulación.

## Consideraciones de Implementación

### En el Lado Móvil (iOS/Swift)

El framework **CryptoKit** de Apple proporciona todas las primitivas necesarias:

```swift
import CryptoKit

class BLESecurityManager {
    private let psk: SymmetricKey
    private var sessionKey: SymmetricKey?
    private var sequenceNumber: UInt32 = 0

    init(psk: Data) {
        self.psk = SymmetricKey(data: psk)
    }

    // Autenticación desafío-respuesta
    func generateChallenge() -> Data {
        var bytes = [UInt8](repeating: 0, count: 16)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        return Data(bytes)
    }

    func computeResponse(challenge: Data, nonce: Data) -> Data {
        let message = challenge + nonce
        let hmac = HMAC<SHA256>.authenticationCode(for: message, using: psk)
        return Data(hmac)
    }

    func verifyResponse(_ response: Data, challenge: Data, nonce: Data) -> Bool {
        let expected = computeResponse(challenge: challenge, nonce: nonce)
        return response == expected
    }
}
```

### En el Lado del Dispositivo (Embebido)

Para dispositivos con recursos limitados, bibliotecas como **mbed TLS** o **wolfSSL** proporcionan implementaciones ligeras:

```c
// Pseudocódigo para dispositivo embebido
#include "mbedtls/gcm.h"
#include "mbedtls/ecdh.h"

int verify_challenge_response(
    const uint8_t *psk, size_t psk_len,
    const uint8_t *challenge, size_t challenge_len,
    const uint8_t *nonce, size_t nonce_len,
    const uint8_t *response, size_t response_len
) {
    uint8_t computed[32];
    uint8_t message[challenge_len + nonce_len];

    memcpy(message, challenge, challenge_len);
    memcpy(message + challenge_len, nonce, nonce_len);

    mbedtls_md_hmac(
        mbedtls_md_info_from_type(MBEDTLS_MD_SHA256),
        psk, psk_len,
        message, sizeof(message),
        computed
    );

    return memcmp(computed, response, 32) == 0 ? 0 : -1;
}
```

## Mejores Prácticas de Seguridad

1. **Rotar PSKs periódicamente** — No dependas de un solo PSK para siempre. Implementa un mecanismo seguro para actualizarlo.

2. **Usar generación segura de números aleatorios** — La aleatoriedad débil socava todo el modelo de seguridad.

3. **Implementar mecanismos de tiempo de espera** — Abortar la autenticación si tarda demasiado (potencial ataque DoS).

4. **Validar todas las entradas** — Verificar longitudes, formatos y límites antes de procesar.

5. **Manejar errores de forma segura** — No filtrar información a través de mensajes de error o diferencias de tiempo.

6. **Considerar Conexiones Seguras BLE 4.2+** — La especificación BLE incluye Conexiones Seguras LE con ECDH. Úsalo como una capa adicional cuando esté disponible.

## Aplicaciones Prácticas

Este flujo de seguridad es ideal para escenarios donde la confidencialidad de datos y la autenticación de dispositivos son críticas:

- **Wearables** — Relojes inteligentes y rastreadores de fitness que transmiten datos de salud que caen bajo regulaciones de privacidad (HIPAA, GDPR).

- **Dispositivos de Hogar Inteligente** — Cerraduras, abridores de puertas de garaje y cámaras de seguridad donde el acceso no autorizado podría tener consecuencias físicas.

- **Dispositivos Médicos** — Bombas de insulina, marcapasos y monitores continuos de glucosa donde la manipulación podría ser potencialmente mortal.

- **IoT Industrial** — Sensores y controladores en entornos de manufactura donde la integridad de datos afecta las operaciones y la seguridad.

- **Terminales de Pago** — Sistemas de punto de venta móviles que deben proteger transacciones financieras.

- **Automotriz** — Llaves remotas, herramientas de diagnóstico y sistemas de infoentretenimiento en vehículos que se conectan a teléfonos.

## Conclusión

La seguridad en la comunicación Bluetooth no se trata solo de emparejar una vez y confiar para siempre — se trata de **autenticación continua**, **claves frescas** y **transferencias cifradas**. Al superponer:

1. **Autenticación desafío-respuesta basada en PSK** — Demuestra que ambas partes comparten un secreto.
2. **Intercambio de claves ECDH** — Establece claves de sesión con secreto hacia adelante.
3. **Cifrado AES-GCM** — Protege confidencialidad e integridad.
4. **Contadores de secuencia** — Previene ataques de repetición.

Creamos un flujo de seguridad que es resistente a la interceptación, suplantación de identidad y ataques de repetición.

Así como HTTPS transformó la seguridad web al hacer la comunicación cifrada el estándar, implementar flujos de seguridad Bluetooth robustos trae confianza y resiliencia similar a los dispositivos en los que confiamos diariamente. La comodidad inalámbrica de Bluetooth no tiene que venir a costa de la seguridad — con la arquitectura correcta, podemos tener ambas.

---

*Los ejemplos de código en esta publicación usan CryptoKit de Apple para iOS. Implementaciones similares son posibles en Android usando la Arquitectura de Criptografía Java (JCA) o BouncyCastle, y en dispositivos embebidos usando mbed TLS o wolfSSL.*
