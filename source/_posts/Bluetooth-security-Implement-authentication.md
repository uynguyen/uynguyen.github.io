---
title: 'Securing Bluetooth Communication: Implementing Authentication and Encryption Flows'
date: 2025-04-02 18:03:38
tags: [CoreBluetooh, BLE]
---

![](/Post-Resources/BLESecurity/cover.png "Bluetooth security")

Bluetooth has become the invisible thread connecting our devices, from smartwatches and health trackers to smart locks and industrial IoT systems. But with convenience comes risk: Bluetooth communication is wireless and easily intercepted, making it vulnerable to eavesdropping, unauthorized access, and replay attacks.
To defend against these threats, authentication and encryption are essential. In this post, I'll introduce a robust Bluetooth security flow, explaining how authentication, key exchange, and encrypted transfer work together. We'll also compare it to TLS/https since both share similar approach of layered security.

<!-- more -->

## Review: How HTTPS Works
Before diving deeper into Bluetooth authentication, it’s useful to understand how HTTPS (Hypertext Transfer Protocol Secure) protects communication on the web, since both share similar security principles.
When you visit a secure website (https://), your browser and the server perform a process called the TLS handshake to establish trust and encryption. This handshake happens in a few key steps:

- Client Hello – The browser sends a message to the server introducing itself, listing supported encryption methods and a random number (used later in key generation).
- Server Hello – The server responds with its own random number, selects an encryption method, and sends its SSL/TLS certificate — which includes its public key and is verified by a Certificate Authority (CA).
- Authentication – The browser verifies that the certificate is valid and trusted (not expired, revoked, or issued to another domain). This step ensures the website is legitimate.
- Key Exchange – Using the public key from the certificate (or through ECDHE — Elliptic Curve Diffie-Hellman Ephemeral), both sides securely generate a shared session key that only they can compute.
- Encrypted Communication – Once the session key is established, all data exchanged between the browser and the server is encrypted using symmetric encryption (typically AES or ChaCha20).
- Integrity & Authentication – Each message includes a cryptographic checksum (MAC or AEAD tag) to prevent tampering or replay attacks.

From that point forward, your connection is both encrypted (no one can read your data) and authenticated (you know you’re talking to the real server).

In short, HTTPS secures communication using:

- Certificates to establish identity.
- Key exchange to derive unique session keys.
- Symmetric encryption for performance and confidentiality.
- Integrity checks to detect any modifications.

## A Secure Bluetooth Authentication Flow

Now let's translate these concepts into a practical Bluetooth security flow. Unlike HTTPS, Bluetooth doesn't have a built-in certificate authority infrastructure. Instead, we typically rely on **Pre-Shared Keys (PSK)** or out-of-band pairing mechanisms to establish initial trust.

Here's a robust authentication and encryption flow for BLE communication:

![](/Post-Resources/BLESecurity/ble-security-flow.png "BLE Security Flow")

### Phase 1: Challenge-Response Authentication

Before any sensitive data is exchanged, both the mobile app (Central) and the BLE device (Peripheral) must prove they share a common secret — the PSK.

```
┌──────────────┐                          ┌──────────────┐
│   Central    │                          │  Peripheral  │
│  (Mobile)    │                          │  (Device)    │
└──────┬───────┘                          └──────┬───────┘
       │                                         │
       │  1. Generate Random Challenge (Nc)      │
       │  2. Send Challenge ─────────────────────▶
       │                                         │
       │         3. Device generates Nd          │
       │         4. Response = HMAC(PSK, Nc||Nd) │
       │                                         │
       │  ◀───────────── 5. Send (Nd, Response)  │
       │                                         │
       │  6. Verify Response                     │
       │  7. Generate own Response for Device    │
       │  ─────────────────────────────────────▶ │
       │                                         │
       │         8. Device verifies              │
       ▼                                         ▼
   [Mutual Authentication Complete]
```

**How it works:**

1. **Central generates a nonce (Nc)** — a random number used only once — and sends it to the Peripheral.
2. **Peripheral generates its own nonce (Nd)** and computes a response using HMAC-SHA256:
   ```
   Response = HMAC-SHA256(PSK, Nc || Nd)
   ```
3. **Peripheral sends back (Nd, Response)** to the Central.
4. **Central verifies** by computing the same HMAC with the shared PSK. If it matches, the device is authenticated.
5. **Mutual authentication** — The Central then sends its own response back so the Peripheral can verify the Central's identity too.

This challenge-response mechanism ensures:
- **No replay attacks** — Each session uses fresh nonces.
- **No PSK transmission** — The secret never travels over the air.
- **Mutual authentication** — Both sides prove their identity.

### Phase 2: Key Exchange with ECDH

Once authenticated, we need to establish a **session key** for encryption. We use **Elliptic Curve Diffie-Hellman (ECDH)** to derive a shared secret without transmitting it directly.

```swift
// Generate ephemeral key pair on each side
let privateKey = P256.KeyAgreement.PrivateKey()
let publicKey = privateKey.publicKey

// Exchange public keys over BLE
// Central sends its public key to Peripheral
// Peripheral sends its public key to Central

// Both sides compute the shared secret
let sharedSecret = try privateKey.sharedSecretFromKeyAgreement(
    with: peerPublicKey
)

// Derive the session key using HKDF
let sessionKey = sharedSecret.hkdfDerivedSymmetricKey(
    using: SHA256.self,
    salt: salt,
    sharedInfo: "BLE-Session-Key".data(using: .utf8)!,
    outputByteCount: 32
)
```

**Why ECDH?**

- **Forward secrecy** — Even if the PSK is compromised later, past sessions remain secure because each session uses ephemeral keys.
- **No shared secret transmission** — Only public keys are exchanged; the shared secret is computed independently.
- **Efficient** — ECC provides strong security with smaller key sizes, ideal for resource-constrained BLE devices.

### Phase 3: Encrypted Data Transfer

With the session key established, all subsequent communication is encrypted using **AES-GCM** (Galois/Counter Mode):

```swift
// Encrypting data before sending
func encrypt(data: Data, using key: SymmetricKey) throws -> Data {
    let nonce = AES.GCM.Nonce()
    let sealedBox = try AES.GCM.seal(data, using: key, nonce: nonce)

    // Combine nonce + ciphertext + tag for transmission
    return nonce + sealedBox.ciphertext + sealedBox.tag
}

// Decrypting received data
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

**AES-GCM provides:**

- **Confidentiality** — Data is encrypted and unreadable without the key.
- **Integrity** — The authentication tag detects any tampering.
- **Authentication** — Only parties with the session key can decrypt.

### Sequence Counter: Preventing Replay Attacks

Even with encryption, an attacker could capture and replay encrypted packets. To prevent this, we include a **sequence counter**:

```swift
struct SecureMessage {
    let sequenceNumber: UInt32
    let encryptedPayload: Data
}

class SequenceValidator {
    private var expectedSequence: UInt32 = 0

    func validate(_ message: SecureMessage) -> Bool {
        guard message.sequenceNumber == expectedSequence else {
            return false // Replay or out-of-order attack detected
        }
        expectedSequence += 1
        return true
    }
}
```

The sequence number is included in the authenticated data (AAD) of AES-GCM, so any modification is detected.

## Comparison: HTTPS vs BLE Security Flow

| Aspect | HTTPS/TLS | BLE Security Flow |
|--------|-----------|-------------------|
| **Trust Anchor** | Certificate Authority (CA) | Pre-Shared Key (PSK) |
| **Authentication** | Certificate verification | Challenge-response with HMAC |
| **Key Exchange** | ECDHE or RSA | ECDH |
| **Encryption** | AES-GCM, ChaCha20-Poly1305 | AES-GCM |
| **Forward Secrecy** | Yes (with ECDHE) | Yes (ephemeral ECDH keys) |
| **Replay Protection** | Sequence numbers in TLS record | Sequence counter in payload |

Both approaches share the same fundamental principles:
1. **Authenticate first** — Verify identity before trusting.
2. **Derive session keys** — Never reuse keys across sessions.
3. **Encrypt everything** — Protect data confidentiality.
4. **Verify integrity** — Detect tampering.

## Implementation Considerations

### On the Mobile Side (iOS/Swift)

Apple's **CryptoKit** framework provides all the primitives needed:

```swift
import CryptoKit

class BLESecurityManager {
    private let psk: SymmetricKey
    private var sessionKey: SymmetricKey?
    private var sequenceNumber: UInt32 = 0

    init(psk: Data) {
        self.psk = SymmetricKey(data: psk)
    }

    // Challenge-response authentication
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

### On the Device Side (Embedded)

For resource-constrained devices, libraries like **mbed TLS** or **wolfSSL** provide lightweight implementations:

```c
// Pseudo-code for embedded device
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

## Security Best Practices

1. **Rotate PSKs periodically** — Don't rely on a single PSK forever. Implement a secure mechanism to update it.

2. **Use secure random number generation** — Weak randomness undermines the entire security model.

3. **Implement timeout mechanisms** — Abort authentication if it takes too long (potential DoS attack).

4. **Validate all inputs** — Check lengths, formats, and bounds before processing.

5. **Handle errors securely** — Don't leak information through error messages or timing differences.

6. **Consider BLE 4.2+ Secure Connections** — The BLE specification includes LE Secure Connections with ECDH. Use it as an additional layer when available.

## Practical Applications

This security flow is ideal for scenarios where data confidentiality and device authentication are critical:

- **Wearables** — Smartwatches and fitness trackers transmitting health data that falls under privacy regulations (HIPAA, GDPR).

- **Smart Home Devices** — Locks, garage door openers, and security cameras where unauthorized access could have physical consequences.

- **Medical Devices** — Insulin pumps, pacemakers, and continuous glucose monitors where tampering could be life-threatening.

- **Industrial IoT** — Sensors and controllers in manufacturing environments where data integrity affects operations and safety.

- **Payment Terminals** — Mobile point-of-sale systems that must protect financial transactions.

- **Automotive** — Key fobs, diagnostic tools, and in-vehicle infotainment systems connecting to phones.

## Conclusion

Security in Bluetooth communication isn't just about pairing once and trusting forever — it's about **continuous authentication**, **fresh keys**, and **encrypted transfers**. By layering:

1. **PSK-based challenge-response authentication** — Proves both parties share a secret.
2. **ECDH key exchange** — Establishes forward-secret session keys.
3. **AES-GCM encryption** — Protects confidentiality and integrity.
4. **Sequence counters** — Prevents replay attacks.

We create a security flow that's resilient to eavesdropping, impersonation, and replay attacks.

Just as HTTPS transformed web security by making encrypted communication the default, implementing robust Bluetooth security flows brings similar trust and resilience to the devices we rely on daily. The wireless convenience of Bluetooth doesn't have to come at the cost of security — with the right architecture, we can have both.

---

*The code examples in this post use Apple's CryptoKit for iOS. Similar implementations are possible on Android using the Java Cryptography Architecture (JCA) or BouncyCastle, and on embedded devices using mbed TLS or wolfSSL.*