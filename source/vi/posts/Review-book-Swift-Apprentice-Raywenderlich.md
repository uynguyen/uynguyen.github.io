---
title: 'Review sach: Swift Apprentice - Raywenderlich'
date: 2020-02-26 22:05:30
tags:
layout: post
lang: vi
---
![](/Post-Resources/SwiftApprentice/banner.png "SwiftApprentice")
Khi toi dang tim kiem mot cuon sach de nang cao ky nang phat trien iOS, toi tim thay cuon Swift Apprentice nay tren cua hang sach cua Raywenderlich. Xem qua noi dung cua cuon sach, toi quyet dinh them cuon sach vao thu vien cua minh.
Noi chung, neu ky nang iOS cua ban la mid-level hoac senior, ban rat tu tin voi ky nang lap trinh bac thay cua minh, cuon sach nay khong danh cho ban. Nhung neu ban dang tim kiem mot cuon sach de cung co kien thuc, hoac ban chi muon dam bao moi thu ban hieu ve ngon ngu Swift la dung - nhu muc dich cua toi, thi hay mang cuon sach nay theo.
Ban se hoc ve nhung thu rat co ban nhu function, method, constants, control statement, v.v. Ban cung se co co hoi co duoc kien thuc sau ve Stack/Heap allocation, protocol-oriented programming, va generic programming, dieu nay lam cho cong viec hang ngay cua ban thuan tien hon, va ban se thay minh nhu mot bac thay trong ngon ngu Swift.
Bat dau thoi!
<!-- more -->
<div style="text-align:center">
<img src="/Post-Resources/SwiftApprentice/LikeABoss.jpg" />
</div>

# Ve tac gia
Voi nhung ai khong biet Raywenderlich la gi, day la mot trang web cong dong tap trung vao viec tao cac bai huong dan va sach lap trinh (Chu yeu tap trung vao phat trien di dong tren Android va iOS). Noi dung cua ho bao gom tat ca cac cap do tu co ban den cac chu de nang cao.
Toi thuong truy cap trang web [Raywenderlich](https://www.raywenderlich.com/about) de lay code mau va cap nhat kien thuc. Cac bai huong dan cua ho cuc ky tuyet voi, chinh xac ve mat ky thuat va duoc cap nhat voi cac cong nghe moi nhat.
Swift Apprentice la mot trong nhung bo suu tap lap trinh iOS cua ho.
![](/Post-Resources/SwiftApprentice/books.png "Library")

# Cac diem chinh
- Lazy property: Neu ban co mot thuoc tinh co the mat thoi gian de tinh toan, ban khong muon lam cham moi thu cho den khi ban thuc su can thuoc tinh do, hay su dung lazy stored property. No huu ich cho nhung thu nhu tai anh dai dien nguoi dung hoac thuc hien tinh toan phuc tap.
- Heap vs. Stack:
Stack duoc su dung de luu tru bat ky thu gi tren thread thuc thi ngay lap tuc; no duoc quan ly va toi uu hoa boi CPU. Khi mot function tao mot bien, stack luu tru bien do va sau do huy no khi function ket thuc. Vi stack duoc to chuc nghiem ngat, no rat hieu qua, va do do kha nhanh.
Heap, o phia ben kia, duoc su dung de luu tru cac instance cua reference types. Heap noi chung la mot vung nho lon ma he thong co the yeu cau va cap phat dong cac khoi bo nho. Thoi gian song linh hoat va dong. No khong tu dong huy du lieu cua no (stack lam dieu do). Can cong viec bo sung de giai phong bo nho tren Heap, dieu nay lam cho viec tao va xoa du lieu tren heap la mot qua trinh cham hon, so voi tren stack.
Khi mot instance cua class duoc tao, code cua ban yeu cau mot khoi bo nho tren heap de luu tru chinh instance do.
Khi mot instance cua struct duoc tao (khong phai la mot phan cua instance cua class), chinh instance do duoc luu tru tren stack, va heap khong lien quan.
- Khi nao su dung class so voi struct:
*Values vs. objects*: Su dung structures nhu values va classes nhu objects co identity. De don gian, chi can nho rang khong co hai objects nao duoc coi la bang nhau chi vi chung giu cung state. Nguoc lai, cac instance cua value types, la values, duoc coi la bang nhau neu chung la cung gia tri. v.d, khong co hai sinh vien nao duoc coi la bang nhau, ngay ca khi ho co cung ten; Hai diem (x, y) bang nhau neu x1 va y1 giong voi x2 va y2, tuong ung, nen chung ta implement Point nhu mot struct.
*Speed*: Neu nhung instances nay chi ton tai trong bo nho trong mot thoi gian ngan — nen su dung struct. Neu instance cua ban se co lifecycle dai hon trong bo nho, hay nghi den class.
`Mot cach tiep can khac la chi su dung nhung gi ban can. Neu du lieu cua ban se khong bao gio thay doi hoac ban can mot noi luu tru du lieu don gian, thi su dung structures. Neu ban can cap nhat du lieu cua ban va ban can no chua logic de cap nhat trang thai cua chinh no, thi su dung classes. Thuong thi, tot nhat la bat dau voi mot struct. Neu ban can cac kha nang them cua class sau nay, thi ban chi can chuyen doi struct thanh class.`
![](/Post-Resources/SwiftApprentice/StructVsClass.png "Library")
- Two-Phase initialization:
• Giai doan mot: Khoi tao tat ca cac stored properties trong class instance, tu duoi len tren cua class hierarchy. Neu ban su dung properties va methods truoc khi giai doan mot hoan thanh, compiler se nem loi.
• Giai doan hai: Bay gio chung ta co the su dung properties va methods cua object.
- Protocols trong Standard Library: Equatable, Comparable, Hashable, CustomStringConvertible.
- Generic function parameters:
```swift
func swapped<T, U>(_ x: T, _ y: U) -> (U, T) {
    (y, x)
}
```
- Wildcard pattern:
```swift
if case (_, 0, 0) = coordinate {
    // x co the la bat ky gia tri nao. y va z phai chinh xac la 0.
    print("On the x-axis") // Printed!
}
```
- Value-binding pattern:
```swift
if case let (x, y, 0) = coordinate {
    print("On the x-y plane at (\(x), \(y))") // Printed: 1, 0
}
```
- "Is" type-casting pattern":
```swift
switch element {
    case is String:
        print("Found a string")
    default: break
}
```
- Rethrows: Bang viec su dung rethrows thay vi throws, cac function chi ra rang chung se chi rethrow cac loi duoc nem boi cac function duoc goi ben trong chinh no nhung khong bao gio la cac loi cua rieng no.
- Loi ich cua Protocol-oriented:
Bang viec su dung protocols thay vi implementations, chung ta tap trung vao nhung gi object co the lam thay vi cach object lam, dieu nay lam cho ung dung co the mo rong va test duoc hon.
Multiple inheritances: Mot trong nhung loi ich thuc su cua protocols la chung cho phep mot hinh thuc da ke thua.
- Swift la ngon ngu protocol-oriented.

# Nhung gi toi thich
- *To chuc tot*.
- *Vi du thuc te*: Co cac vi du cho moi chu de de dam bao nguoi doc hieu sau nhung gi vua de cap.
- *De hieu*: Vi noi dung duoc to chuc tot, de theo doi dong noi dung.
- *Dung lai va suy nghi*: Co cac bai tap ngan va thach thuc xuyen suot cuon sach de cho ban mot so thuc hanh lap trinh va kiem tra kien thuc cua ban theo cach.
- *Keypoints*: Ho tom tat cac diem chinh o cuoi moi chuong.

# Nhung gi toi khong thich
Toi da co xem qua cuon sach nhieu lan de tim mot diem ma toi khong thich nhung khong co gi de phan nan, tu noi dung den hinh thuc.

# Tong quat
Swift thi vui va day cac mo hinh lap trinh. Sau khi doc cuon sach nay, toi hy vong bay gio ban cam thay du thoai mai voi ngon ngu de chuyen sang xay dung nhung thu lon hon. Voi cac kien thuc nen tang ve ngon ngu chung ta da co duoc, chung ta san sang kham pha cac framework nang cao nhu Animation, UIKit, v.v. de xay dung cac ung dung iOS, cac ung dung macOS va hon the nua.
Toi hy vong ban thay cuon sach nay thu vi.
Cuoi tuan vui ve!
