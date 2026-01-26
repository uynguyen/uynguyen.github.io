---
title: 'Bảo mật giao tiếp Bluetooth: Triển khai luồng xác thực và mã hóa'
date: 2025-04-02 18:03:38
tags: [CoreBluetooh, BLE]
layout: post
permalink: vi/posts/Bluetooth-security-Implement-authentication/
lang: vi
---

![](/Post-Resources/BLESecurity/cover.png "Bluetooth security")

Bluetooth đã trở thành sợi dây vô hình kết nối các thiết bị của chúng ta, từ đồng hồ thông minh và thiết bị theo dõi sức khỏe đến khóa thông minh và hệ thống IoT công nghiệp. Nhưng sự tiện lợi đi kèm với rủi ro: giao tiếp Bluetooth là không dây và dễ bị chặn bắt, khiến nó dễ bị nghe lén, truy cập trái phép và tấn công phát lại.
Để chống lại những mối đe dọa này, xác thực và mã hóa là thiết yếu. Trong bài viết này, tôi sẽ giới thiệu một luồng bảo mật Bluetooth mạnh mẽ, giải thích cách xác thực, trao đổi khóa và truyền dữ liệu mã hóa hoạt động cùng nhau. Chúng ta cũng sẽ so sánh nó với TLS/HTTPS vì cả hai đều chia sẻ cách tiếp cận bảo mật phân lớp tương tự.

<!-- more -->

## Ôn lại: Cách HTTPS hoạt động
Trước khi đi sâu hơn vào xác thực Bluetooth, việc hiểu cách HTTPS (Hypertext Transfer Protocol Secure) bảo vệ giao tiếp trên web sẽ rất hữu ích, vì cả hai đều chia sẻ các nguyên tắc bảo mật tương tự.
Khi bạn truy cập một trang web an toàn (https://), trình duyệt và máy chủ thực hiện một quy trình gọi là TLS handshake để thiết lập sự tin cậy và mã hóa. Quá trình bắt tay này diễn ra qua một vài bước chính:

- Client Hello – Trình duyệt gửi một thông điệp đến máy chủ để giới thiệu bản thân, liệt kê các phương thức mã hóa được hỗ trợ và một số ngẫu nhiên (được sử dụng sau trong quá trình tạo khóa).
- Server Hello – Máy chủ phản hồi với số ngẫu nhiên của riêng nó, chọn một phương thức mã hóa và gửi chứng chỉ SSL/TLS của nó — bao gồm khóa công khai và được xác minh bởi Certificate Authority (CA).
- Xác thực – Trình duyệt xác minh rằng chứng chỉ hợp lệ và đáng tin cậy (không hết hạn, bị thu hồi hoặc cấp cho tên miền khác). Bước này đảm bảo trang web là hợp pháp.
- Trao đổi khóa – Sử dụng khóa công khai từ chứng chỉ (hoặc thông qua ECDHE — Elliptic Curve Diffie-Hellman Ephemeral), cả hai bên tạo ra một khóa phiên chung một cách an toàn mà chỉ họ có thể tính toán.
- Giao tiếp mã hóa – Khi khóa phiên được thiết lập, tất cả dữ liệu trao đổi giữa trình duyệt và máy chủ được mã hóa bằng mã hóa đối xứng (thường là AES hoặc ChaCha20).
- Tính toàn vẹn &amp; Xác thực – Mỗi thông điệp bao gồm một checksum mật mã (MAC hoặc AEAD tag) để ngăn chặn giả mạo hoặc tấn công phát lại.

Từ thời điểm đó trở đi, kết nối của bạn vừa được mã hóa (không ai có thể đọc dữ liệu của bạn) vừa được xác thực (bạn biết bạn đang nói chuyện với máy chủ thực).

Tóm lại, HTTPS bảo mật giao tiếp bằng cách sử dụng:

- Chứng chỉ để thiết lập danh tính.
- Trao đổi khóa để tạo ra các khóa phiên duy nhất.
- Mã hóa đối xứng cho hiệu suất và tính bảo mật.
- Kiểm tra tính toàn vẹn để phát hiện bất kỳ sửa đổi nào.

## Luồng xác thực Bluetooth an toàn

Bây giờ hãy chuyển các khái niệm này thành một luồng bảo mật Bluetooth thực tế. Không giống như HTTPS, Bluetooth không có cơ sở hạ tầng certificate authority tích hợp sẵn. Thay vào đó, chúng ta thường dựa vào **Pre-Shared Keys (PSK)** hoặc cơ chế ghép nối ngoài băng tần để thiết lập sự tin cậy ban đầu.

Đây là một luồng xác thực và mã hóa mạnh mẽ cho giao tiếp BLE:

![](/Post-Resources/BLESecurity/ble-security-flow.png "BLE Security Flow")

### Giai đoạn 1: Xác thực Challenge-Response

Trước khi bất kỳ dữ liệu nhạy cảm nào được trao đổi, cả ứng dụng di động (Central) và thiết bị BLE (Peripheral) phải chứng minh họ chia sẻ một bí mật chung — PSK.

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

**Cách hoạt động:**

1. **Central tạo một nonce (Nc)** — một số ngẫu nhiên chỉ được sử dụng một lần — và gửi nó đến Peripheral.
2. **Peripheral tạo nonce riêng của nó (Nd)** và tính toán phản hồi bằng HMAC-SHA256:
   ```
   Response = HMAC-SHA256(PSK, Nc || Nd)
   ```
3. **Peripheral gửi lại (Nd, Response)** cho Central.
4. **Central xác minh** bằng cách tính toán cùng HMAC với PSK được chia sẻ. Nếu khớp, thiết bị được xác thực.
5. **Xác thực hai chiều** — Central sau đó gửi phản hồi của riêng nó để Peripheral cũng có thể xác minh danh tính của Central.

Cơ chế challenge-response này đảm bảo:
- **Không có tấn công phát lại** — Mỗi phiên sử dụng nonce mới.
- **Không truyền PSK** — Bí mật không bao giờ được truyền qua sóng vô tuyến.
- **Xác thực hai chiều** — Cả hai bên chứng minh danh tính của họ.

### Giai đoạn 2: Trao đổi khóa với ECDH

Sau khi xác thực, chúng ta cần thiết lập một **khóa phiên** để mã hóa. Chúng ta sử dụng **Elliptic Curve Diffie-Hellman (ECDH)** để tạo ra một bí mật chung mà không cần truyền trực tiếp.

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

**Tại sao ECDH?**

- **Forward secrecy** — Ngay cả khi PSK bị xâm phạm sau này, các phiên trước đó vẫn an toàn vì mỗi phiên sử dụng khóa tạm thời.
- **Không truyền bí mật chung** — Chỉ khóa công khai được trao đổi; bí mật chung được tính toán độc lập.
- **Hiệu quả** — ECC cung cấp bảo mật mạnh với kích thước khóa nhỏ hơn, lý tưởng cho các thiết bị BLE có tài nguyên hạn chế.

### Giai đoạn 3: Truyền dữ liệu mã hóa

Với khóa phiên được thiết lập, tất cả giao tiếp tiếp theo được mã hóa bằng **AES-GCM** (Galois/Counter Mode):

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

**AES-GCM cung cấp:**

- **Tính bảo mật** — Dữ liệu được mã hóa và không thể đọc được nếu không có khóa.
- **Tính toàn vẹn** — Tag xác thực phát hiện bất kỳ sự giả mạo nào.
- **Xác thực** — Chỉ các bên có khóa phiên mới có thể giải mã.

### Bộ đếm tuần tự: Ngăn chặn tấn công phát lại

Ngay cả với mã hóa, kẻ tấn công có thể bắt và phát lại các gói tin đã mã hóa. Để ngăn chặn điều này, chúng ta bao gồm một **bộ đếm tuần tự**:

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

Số tuần tự được bao gồm trong dữ liệu xác thực bổ sung (AAD) của AES-GCM, vì vậy bất kỳ sửa đổi nào cũng được phát hiện.

## So sánh: HTTPS với Luồng bảo mật BLE

| Khía cạnh | HTTPS/TLS | Luồng bảo mật BLE |
|--------|-----------|-------------------|
| **Nguồn tin cậy** | Certificate Authority (CA) | Pre-Shared Key (PSK) |
| **Xác thực** | Xác minh chứng chỉ | Challenge-response với HMAC |
| **Trao đổi khóa** | ECDHE hoặc RSA | ECDH |
| **Mã hóa** | AES-GCM, ChaCha20-Poly1305 | AES-GCM |
| **Forward Secrecy** | Có (với ECDHE) | Có (khóa ECDH tạm thời) |
| **Bảo vệ phát lại** | Số tuần tự trong bản ghi TLS | Bộ đếm tuần tự trong payload |

Cả hai cách tiếp cận đều chia sẻ các nguyên tắc cơ bản giống nhau:
1. **Xác thực trước** — Xác minh danh tính trước khi tin tưởng.
2. **Tạo khóa phiên** — Không bao giờ tái sử dụng khóa qua các phiên.
3. **Mã hóa mọi thứ** — Bảo vệ tính bảo mật dữ liệu.
4. **Xác minh tính toàn vẹn** — Phát hiện giả mạo.

## Các cân nhắc triển khai

### Phía di động (iOS/Swift)

Framework **CryptoKit** của Apple cung cấp tất cả các primitive cần thiết:

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
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &amp;bytes)
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

### Phía thiết bị (Embedded)

Đối với các thiết bị có tài nguyên hạn chế, các thư viện như **mbed TLS** hoặc **wolfSSL** cung cấp các triển khai nhẹ:

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

## Các thực hành bảo mật tốt nhất

1. **Xoay vòng PSK định kỳ** — Không dựa vào một PSK duy nhất mãi mãi. Triển khai một cơ chế an toàn để cập nhật nó.

2. **Sử dụng sinh số ngẫu nhiên an toàn** — Tính ngẫu nhiên yếu làm suy yếu toàn bộ mô hình bảo mật.

3. **Triển khai cơ chế timeout** — Hủy bỏ xác thực nếu mất quá nhiều thời gian (tấn công DoS tiềm ẩn).

4. **Xác thực tất cả đầu vào** — Kiểm tra độ dài, định dạng và giới hạn trước khi xử lý.

5. **Xử lý lỗi một cách an toàn** — Không rò rỉ thông tin qua thông báo lỗi hoặc sự khác biệt về thời gian.

6. **Cân nhắc BLE 4.2+ Secure Connections** — Đặc tả BLE bao gồm LE Secure Connections với ECDH. Sử dụng nó như một lớp bổ sung khi có sẵn.

## Ứng dụng thực tế

Luồng bảo mật này lý tưởng cho các tình huống mà tính bảo mật dữ liệu và xác thực thiết bị là quan trọng:

- **Thiết bị đeo** — Đồng hồ thông minh và thiết bị theo dõi sức khỏe truyền dữ liệu sức khỏe thuộc các quy định về quyền riêng tư (HIPAA, GDPR).

- **Thiết bị nhà thông minh** — Khóa, bộ mở cửa garage và camera an ninh nơi truy cập trái phép có thể có hậu quả vật lý.

- **Thiết bị y tế** — Bơm insulin, máy tạo nhịp tim và máy theo dõi đường huyết liên tục nơi giả mạo có thể đe dọa tính mạng.

- **IoT công nghiệp** — Cảm biến và bộ điều khiển trong môi trường sản xuất nơi tính toàn vẹn dữ liệu ảnh hưởng đến hoạt động và an toàn.

- **Thiết bị thanh toán** — Hệ thống điểm bán hàng di động phải bảo vệ các giao dịch tài chính.

- **Ô tô** — Chìa khóa thông minh, công cụ chẩn đoán và hệ thống giải trí trên xe kết nối với điện thoại.

## Kết luận

Bảo mật trong giao tiếp Bluetooth không chỉ là ghép nối một lần và tin tưởng mãi mãi — mà là về **xác thực liên tục**, **khóa mới** và **truyền dữ liệu mã hóa**. Bằng cách phân lớp:

1. **Xác thực challenge-response dựa trên PSK** — Chứng minh cả hai bên chia sẻ một bí mật.
2. **Trao đổi khóa ECDH** — Thiết lập khóa phiên có forward-secret.
3. **Mã hóa AES-GCM** — Bảo vệ tính bảo mật và toàn vẹn.
4. **Bộ đếm tuần tự** — Ngăn chặn tấn công phát lại.

Chúng ta tạo ra một luồng bảo mật có khả năng chống lại nghe lén, mạo danh và tấn công phát lại.

Giống như HTTPS đã biến đổi bảo mật web bằng cách biến giao tiếp mã hóa thành mặc định, việc triển khai các luồng bảo mật Bluetooth mạnh mẽ mang lại sự tin cậy và khả năng phục hồi tương tự cho các thiết bị chúng ta sử dụng hàng ngày. Sự tiện lợi không dây của Bluetooth không nhất thiết phải đánh đổi bằng bảo mật — với kiến trúc phù hợp, chúng ta có thể có cả hai.

---

*Các ví dụ code trong bài viết này sử dụng CryptoKit của Apple cho iOS. Các triển khai tương tự có thể thực hiện trên Android bằng Java Cryptography Architecture (JCA) hoặc BouncyCastle, và trên các thiết bị embedded sử dụng mbed TLS hoặc wolfSSL.*
