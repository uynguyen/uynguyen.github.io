---
title: 'Review sach: Building Applications With iBeacon'
date: 2020-06-14 21:13:41
tags: [Books, Study, BLE, iBeacon]
layout: post
lang: vi
---
![](/Post-Resources/ibeacons/ibeacon-cover.png "SwiftApprentice")

Trong [bai viet truoc](/2018/08/18/Best-practice-iBeacon/), toi da gioi thieu so luoc ve iBeacon - Mot giao thuc Bluetooth duoc xay dung tren nen tang BLE boi Apple, va tao mot demo don gian ve cach iBeacon co the danh thuc mot ung dung sau khi bi nguoi dung tat. Tuy nhien, toi chua de cap den cac khai niem nen tang khac trong Beacon, no cung khong cho ban cai nhin sau ve cac uu diem va nhuoc diem cua cong nghe manh me nay.
Hom nay, toi muon gioi thieu cho ban mot cuon sach tot cung cap kien thuc vung chac trong linh vuc Beacon, dac biet la iBeacon: `Building Applications With iBeacon` xuat ban boi O'Reilly.
Sau khi doc cuon sach nay, toi dam bao rang ban se co duoc kien thuc tot trong linh vuc iBeacon va tam tri cua ban se coi mo hon voi cac y tuong sap toi.
Bat dau thoi!
<!-- more -->

## Noi dung chinh
Cuon sach tap trung chu yeu vao cac lap trinh vien dang tim kiem cach hieu qua de tich hop giao thuc beacon vao ung dung cua ho. De su dung sach hieu qua, toi khuyen ban nen co mot so kien thuc nen tang ve BLE vi iBeacon duoc xay dung tren BLE.
Trong phan dau, cuon sach mo ta mot lich su ngan gon cua cac cong nghe *proximity* noi rieng. No cung giai thich tai sao va khi nao su dung trong mot so tinh huong cu the.
Hai ly do chinh tai sao su dung iBeacon la, truoc het, `cong nghe GPS kho co the lam tot hon vai met, va GPS thuong bi han che trong nha. iBeacons co the cho phep xac dinh trong pham vi centimet`. Ly do thu hai la `iBeacons cung cap vi tri vi mo co do chinh xac cao, cung voi kha nang hanh dong dua tren nhung gi thiet bi di dong o gan. Chua co cong nghe nao khac cung cap su ket hop do.`
De thuyet phuc nguoi doc, cuon sach so sanh GPS voi Beacon, noi cach khac la vi tri so voi su gan gui; dua ra mot so han che cua cong nghe GPS hien tai, tac gia chi ra mot so linh vuc ma Beacon vuot troi hon nhieu so voi GPS.
Tiep theo, cuon sach giai thich cach giao thuc Beacon hoat dong ben duoi; gioi thieu cho ban cac thuat ngu nen tang, va cach chung tuong tac voi nhau.
Cuoi cung, trong mot so chuong, cuon sach huong dan ban cach thiet lap beacon cua rieng ban tren Mac OS, thiet bi di dong, hoac cac may tinh nho nhu Ras. Pi hoac Arduino.

## Cac khai niem chinh
- Moi quan he giua iBeacons, generic beacons, BLE beacons, va BLE devices duoc mo ta nhu ben duoi

<div style="text-align:center">

![](/Post-Resources/ibeacons/Beacon-RelationShip.png "Beacon Relationship")

</div>

> iBeacons la mot tap con cua dac ta BLE beacon, Tat ca iBeacons la BLE beacons, va tat ca BLE beacons la BLE devices. Tuy nhien, co cac beacon khong dua tren Bluetooth, va co cac BLE devices khong phat beacon.


- Mot iBeacon can duoc cau hinh voi bo so dinh danh cua no (UUID, major number, va minor number).
Beacon identifier = UUID + Major + Minor.
- Trong Core Location, mot region la khong gian nhan duoc su ket hop cu the cua UUID, major number, va minor number.
- Core Location ho tro ba loai loc region:
    + Chi UUID: bat ky iBeacon nao da cai dat khop voi uuid.
    + UUID cong major number: Giong nhu tuy chon chi UUID, no co the khop voi nhieu iBeacons, rat co the duoc cai dat tai mot vi tri cu the.
    + UUID cong major va minor numbers: Tuy chon nay se chi khop voi mot iBeacon cu the.

![](/Post-Resources/ibeacons/Regions.png "Beacon Regions")

- Code sau minh hoa cach dinh nghia ba region do trong Swift, tuong ung.
```swift
let region1 = CLBeaconRegion(uuid: "uuid1", identifier: "Your region's name 1")
let region2 = CLBeaconRegion(proximityUUID: "uuid2", major: 1, identifier: "Your region's name 2")
let region3 = CLBeaconRegion(proximityUUID: "uuid3", major: 1, minor: 0, identifier: "Your region's name 3")
```

### iOS va iBeacon: Apple cung cap hai hanh dong chinh khi lam viec voi iBeacon
#### **Monitoring**
Monitoring cung cap kha nang dang ky theo doi su xuat hien cua mot region, duoc ket hop voi mot hoac nhieu beacon.
Mot su kien `in` va `out` se duoc kich hoat khi thiet bi vao hoac ra khoi region, tuong ung.

- Duoc thuc hien o ca foreground va background tren iOS, duoc su dung de xac dinh khi nao thiet bi da vao hoac roi khoi vung phu song cua iBeacon. Mot trong nhung loi ich lon nhat cua viec su dung beacon la cac region duoc theo doi boi he dieu hanh, khong phai ung dung. Ngay ca khi ung dung khong chay (bi OS tat hoac nguoi dung buoc dung), OS co the khoi dong lai ung dung de xu ly cac su kien. Sau khi duoc dua tro lai background, ung dung co vai giay de thuc thi cac tac vu (Khoang 10 giay).
- Location manager dinh nghia mot phuong thuc cho `didEnterRegion`, duoc goi khi thiet bi vuot qua ranh gioi de vao mot region
- Location manager dinh nghia mot phuong thuc cho `didExitRegion`, duoc goi khi thiet bi vuot qua ranh gioi de roi khoi mot region.

Han che cua Monitoring
- iOS chi co the theo doi toi da 20 region trong mot ung dung don le nhu mo ta trong tai lieu Apple
> Regions la tai nguyen he thong duoc chia se, va tong so region co san tren toan he thong bi gioi han. Vi ly do nay, Core Location gioi han 20 so luong region co the duoc theo doi dong thoi boi mot ung dung don le" [Apple doc](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/LocationAwarenessPG/RegionMonitoring/RegionMonitoring.html).
- He thong cung mat mot thoi gian de kich hoat su kien exit, trong thuc te khoang 30 ~ 40 giay.

#### **Ranging**
Su dung cac tin hieu truyen de uoc tinh khoang cach tu thiet bi di dong den beacon. Mot cach su dung pho bien cua hoat dong ranging la xac dinh iBeacon nao gan nhat voi khu vuc nay.
Location manager se kich hoat phuong thuc `didRangeBeacons` sau khi ranging thanh cong, mot danh sach cac iBeacons co du lieu ranging se duoc truyen vao phuong thuc delegate, cung voi region ma chung duoc phat hien. No cung cung cap chi so cuong do tin hieu nhan duoc (RSSI) de uoc tinh pham vi tinh bang met (No la mot thuoc tinh cua doi tuong CLBeacon).

Han che cua Ranging:
- Mot nhuoc diem chinh cua hoat dong ranging yeu cau nhieu hoat dong hon trong phan cung Bluetooth va tieu thu nhieu nang luong, vi giao dien Bluetooth hoat dong nhieu hon khi ranging

## Nhung gi toi thich
- Toi khong bao gio nghi chu de iBeacon se duoc viet thanh mot cuon sach hoan chinh nhung tac gia da lam rat tot: Cuon sach mo ta iBeacon voi giai thich sau sac.
- Lam ro cac thuat ngu nen tang thuong duoc su dung trong cong nghe beacon.
- Phan tich uu va nhuoc diem cua iBeacon voi cac vi du.
- Gioi thieu cac ung dung khac cua beacon ma toi chua bao gio nghi den truoc day, dieu nay mo rong tam tri toi rat nhieu:
    + Indoor Location va Proximity: Thay the ban do, ho tro giao thong cong cong, tim duong trong nha, xe cua toi dau?, huong dan bao tang, nang cao cua hang ban le.
    + Proximity-Triggered Actions: Quang cao di dong, xac nhan ve, tim kho bau, tich hop thong tin benh nhan.
    + Quan ly hang doi: Do luong hang doi, may goi ban nha hang, hoan thanh giao dich ban le.
- De hieu: noi dung duoc to chuc tot, de theo doi dong noi dung.

## Nhung gi toi khong thich
Khong co gi de phan nan ve cuon sach, tu noi dung den hinh thuc.

## Tong quat
Nhieu cong nghe ton tai de giup dien thoai tuong tac voi the gioi xung quanh chung. Cuon sach nay gioi thieu cho ban iBeacons, mot cong nghe Bluetooth cho phep thiet bi phat hien cac doi tuong gan do voi do chinh xac tuong doi cao. Khong con nghi ngo gi rang cac ung dung cua beacon ngay cang duoc ap dung rong rai trong nhieu linh vuc, dac biet la trong marketing va quang cao.
Tu quan diem cua toi, ban nen doc cuon sach de co the mo rong tam tri ve iBeacon. Co the startup tiep theo cua ban duoc xay dung tren Beacon, ai biet?
Trong bai huong dan tiep theo, toi se dua ban vao thuc hanh voi iBeacon tren iOS, cung se gioi thieu cho ban mot so ky thuat de xu ly iBeacon trong phan tich sau.
Neu ban co bat ky cau hoi hoac nhan xet nao ve bai viet nay, hay lien he voi toi!
