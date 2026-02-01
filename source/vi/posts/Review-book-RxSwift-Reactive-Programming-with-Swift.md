---
title: "Review sach: RxSwift Reactive Programming with Swift"
date: 2020-09-26 21:51:41
tags:
layout: post
lang: vi
---

![](/Post-Resources/RxSwift/rxSwift.png "RxSwift")

Trong the gioi phat trien iOS lien tuc phat trien, viec thao tac thuan thuc reactive programming co the giup ban noi bat nhu mot lap trinh vien. Mot trong nhung tai nguyen tot nhat de di sau vao reactive programming voi Swift la cuon sach "RxSwift: Reactive Programming with Swift." Huong dan toan dien nay cung cap moi thu ban can de hieu va tan dung RxSwift trong cac ung dung cua ban. Hay cung kham pha dieu gi lam cho cuon sach nay tro thanh tai lieu can doc cho cac lap trinh vien Swift.

<!-- more -->

## Reactive Programming la gi?
Reactive programming la mot mo hinh cho phep ban lam viec voi cac luong du lieu bat dong bo va cac su kien theo cach khai bao. Thay vi quan ly thu cong cac callback va thay doi trang thai, reactive programming cho phep ban khai bao cach du lieu nen chay va phan hoi cac su kien. Dieu nay mang lai code sach hon, de bao tri hon, dac biet cho cac ung dung phuc tap.

## Bat dau voi RxSwift
Cuon sach bat dau voi cac kien thuc co ban cua reactive programming, gioi thieu cac khai niem cot loi nhu `Observables`, `Subscribers`, va `Observer Pattern`. No huong dan ban thiet lap RxSwift trong du an cua ban su dung cac dependency managers pho bien nhu CocoaPods va Swift Package Manager.

## Cac khai niem cot loi
Cuon sach di sau vao cac khai niem cot loi cua RxSwift:

- **Observables va Observers**: Hoc cach Observables phat ra cac item va cach Observers subscribe vao cac luong nay. Day la xuong song cua reactive programming.
- **Operators**: RxSwift cung cap mot bo operators phong phu de chuyen doi va ket hop cac luong. Cuon sach bao gom cac operators khac nhau, bao gom:
- **Creation Operators**: create, just, from
- **Transformation Operators**: map, flatMap, concatMap
- **Filtering Operators**: filter, distinctUntilChanged, throttle
- **Combination Operators**: merge, combineLatest, zip
- **Subjects**: Hieu cac loai Subjects khac nhau nhu PublishSubject, BehaviorSubject, ReplaySubject, va AsyncSubject va cac truong hop su dung cua chung.

Cac chu de nang cao va Thuc hanh tot nhat: Khi ban da thoai mai voi cac kien thuc co ban, cuon sach gioi thieu cac chu de nang cao hon:

- **Schedulers**: Quan ly dong thoi va quan ly thread voi cac schedulers cua RxSwift, bao gom MainScheduler va ConcurrentDispatchQueueScheduler.
- **Xu ly loi**: Kham pha cac chien luoc xu ly loi trong cac luong reactive su dung cac operators nhu catchError va retry.
- **Quan ly bo nho**: Hoc cac thuc hanh tot nhat de quan ly subscriptions va tranh ro ri bo nho voi cac cong cu nhu DisposeBag.

Tich hop RxSwift voi UIKit: Mot trong nhung diem manh cua RxSwift la kha nang tich hop lien mach voi UIKit. Cuon sach trinh bay cach bind RxSwift Observables vao cac thanh phan UIKit nhu UITableView va UICollectionView. No cung bao gom xu ly dau vao nguoi dung theo cach reactive, lam cho code UI cua ban phan hoi nhanh hon va de quan ly hon.

Test va Debug: Test va debug code reactive co the la thach thuc. "RxSwift: Reactive Programming with Swift" cung cap loi khuyen thuc te ve viec viet unit tests cho code RxSwift va su dung cac cong cu nhu TestScheduler. No cung cung cap cac meo de debug cac luong reactive, giup ban dam bao ung dung cua ban chay tron tru.

Ung dung thuc te: Cuon sach day cac vi du thuc te va case studies. Ban se thay cach RxSwift co the duoc ap dung vao cac van de thuc te nhu network requests, form validation, va quan ly cac tuong tac UI phuc tap. Nhung vi du nay giup cung co su hieu biet cua ban va chi ra cach su dung RxSwift hieu qua trong cac du an cua ban.

## Uu diem
- Giai thich ro rang: Cuon sach duoc khen ngoi vi cac giai thich ro rang va co cau truc, lam cho cac khai niem reactive programming phuc tap tro nen de tiep can hon.
- Vi du thuc te: No cung cap mot loat cac vi du thuc te giup hieu cach su dung RxSwift hieu qua.
- Bao quat toan dien: Bao gom ca cac chu de co ban va nang cao, phuc vu nguoi doc voi cac cap do kinh nghiem khac nhau.

## Nhuoc diem
- Phien ban Swift: Tuy thuoc vao ngay xuat ban, mot so noi dung co the dua tren cac phien ban Swift hoac RxSwift cu hon, dieu nay co the yeu cau mot so dieu chinh neu ban dang su dung cac phien ban moi nhat.
- Do sau bao quat: Mot so nguoi doc co the thay rang mac du cuon sach bao quat nhieu noi dung, mot so chu de nang cao co the yeu cau tai nguyen bo sung de thao tac day du.

## Ket luan
Day la mot tai nguyen vo gia cho cac lap trinh vien iOS muon thao tac thuan thuc reactive programming. Voi cac giai thich ro rang, vi du thuc te, va bao quat toan dien ca cac chu de co ban va nang cao, day la cuon sach can doc cho bat ky ai nghiem tuc ve viec su dung RxSwift trong cac ung dung cua ho. Du ban moi lam quen voi reactive programming hay dang muon nang cao kien thuc, cuon sach nay se huong dan ban tung buoc tren duong di.
