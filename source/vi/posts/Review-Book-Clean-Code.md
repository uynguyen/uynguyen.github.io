---
title: 'Review Sach: Clean Code'
date: 2017-10-20 04:09:39
tags: [books, study]
layout: post
lang: vi
---
Day la cuon sach toi duoc tang tu lau boi mot dong nghiep cu, nguoi cung la mot trong nhung nguoi ban than cua toi. Day la mot trong nhung cuon sach ve phan mem ma toi thich nhat nhung khong co co hoi mua khi con la sinh vien.
![](/Post-Resources/CleanCode/CleanCode.jpg "Clean code")
<!-- more -->
# Gioi thieu
Ve tac gia, Robert C. Martin, ong duoc coi la mot trong nhung ky su lau nam nhat trong nganh cong nghiep phan mem. Ong co nhieu nam kinh nghiem lam viec trong linh vuc phan mem tu nhieu vi tri khac nhau, tu lap trinh vien, quan ly, den CEO. Ong duoc biet den nhieu nhat voi viec viet cac huong dan phan mem mo ta cac nguyen tac, mau thiet ke, va cac thuc hanh phan mem. Ong da xuat ban nhieu cuon sach nhu Clean Coder, Clean Code, Clean Architecture, v.v. Clean Code la mot trong nhung cuon sach phan mem ma nhieu ky su phan mem tren the gioi khuyen doc.
Tac gia noi rang *"Theo thoi gian, su lon xon tro nen qua lon, qua sau va qua cao, ho khong the don dep no"*. Chung ta can doc, suy nghi nhieu truoc khi viet code. Chung ta nen tranh viet code voi vang. Voi vang viet code te se dan den viec ton nhieu thoi gian hon cho viec bao tri sau nay. Clean Code tap trung vao cac khia canh ky thuat: huong dan lap trinh vien cach to chuc code va viet code sach. Ban se khong hoc bat ky framework moi nao, nhung no se cung cap cho ban mot bo quy tac ve phong cach lap trinh co ban. Cuon sach dang de doc.

# Noi dung sach
Noi dung cua cuon sach duoc chia thanh ba phan: Cac chuong dau tien se giai thich cac nguyen tac, mau thiet ke, va cac thuc hanh viet code sach. Phan thu hai bao gom nhieu case study, moi case study la mot bai tap chuyen doi code co mot so van de thanh code it van de hon. Phan cuoi cung la phan tong ket.

## Tai sao can code sach?
Bjarne Stroustrup (Nguoi sang tao C++): `Elegant`, `Efficiency`.
Grady Booch (Tac gia Object Oriented Analysis): `Readability`.
David Thomas (Nguoi sang lap OTI): `De cho nguoi khac cai tien`.
Warn Cunningham (Nguoi sang tao Wiki): `Lam cho ngon ngu trong don gian`.
Toi: `De co the nho nhung gi ban viet mot thang truoc`.

## Tieu chi danh gia code sach

### Tong quat
- Khong lap lai chinh minh: Su trung lap co the la goc re cua moi dieu xau trong phan mem. Nhieu nguyen tac va thuc hanh da duoc tao ra voi muc dich kiem soat hoac loai bo no. Doi khi chung ta co the su dung mau `Template method` de loai bo su trung lap o cap cao hon.

### Dat ten bien, phuong thuc, tham so, lop, tap tin
- Ten cua mot bien, ham hoac lop nen tra loi cau hoi tai sao no ton tai, no lam gi va no duoc su dung nhu the nao.
- Su dung ten co the tim kiem.
- Lop va doi tuong nen co ten danh tu hoac cum danh tu. Phuong thuc nen la dong tu hoac cum dong tu.
- Su khong nhat quan: Can than voi cac quy uoc ban chon, va mot khi da chon, tiep tuc tuan thu chung.

### Comment
- Comment nen noi nhung dieu ma code khong the tu noi: Giai thich y tuong trong code, neu khong the, thi viet comment.
- Comment nen duoc danh rieng cho cac ghi chu ky thuat ve code va thiet ke.
- Su dung ngu phap va dau cau dung.
- Dung comment-out code, hay xoa no.

### Ham
- Ham nen nho: It hon 100 dong. No lam cho ham de doc va hieu hon.
- Ham chi nen lam mot viec.
- Ham nen co it tham so (It hon 4 tham so).
- Dung truyen gia tri boolean lam tham so.
- Ham khong bao gio duoc goi nen duoc xoa.
- Tach xu ly loi ra khoi xu ly binh thuong.
- Dong goi cac dieu kien.

### Xu ly loi
- Xu ly loi la quan trong, nhung neu no che khuat logic, thi no sai.
- Dung tra ve `Null`: Hay xem xet nem exception hoac tra ve mot doi tuong `SPECIAL CASE` thay the. Neu ban code theo cach nay, ban se giam thieu co hoi gap `NullPointerException` va code cua ban se sach hon.
- Dung truyen `Null` lam tham so.

### Ranh gioi
- Boc cac API cua ben thu ba: Giam thieu su phu thuoc cua ban vao no.
- Khi co ban phat hanh moi cua goi thu ba, chung ta nen chay test de xem co su khac biet ve hanh vi khong.
- Tranh de qua nhieu code cua chung ta biet ve cac chi tiet cu the cua ben thu ba: Hay su dung `Adapter` de xu ly no.

### Lop
- Mot lop nen nho: Chung ta do no bang trach nhiem. (Chung ta biet no nhu nguyen tac SRP)
- Code nen duoc dat o noi ma nguoi doc tu nhien mong doi no o do. (Hang so `PI` nen o dau? No nen o trong lop `Math`? Hay co le trong lop `Circle`?).
- Can than khi tao cac phuong thuc static. Mot phuong thuc static khong hoat dong tren mot instance don le. Tat ca du lieu ma phuong thuc su dung den tu cac tham so cua no, va khong tu bat ky instance nao cua lop nay. Ngoai ra, hay dam bao rang khong co co hoi ban muon no hoat dong da hinh.

### Dong thoi
- Co mot so dinh nghia co ban chung ta nen biet khi noi ve dong thoi va thread: Bound resources, mutual exclusion, starvation, deadlock, va livelock.
- Dong thoi khong phai luc nao cung cai thien hieu suat. No doi khi phat sinh chi phi va loi tu no khong thuong lap lai.
- Gioi han quyen truy cap cua du lieu duoc chia se giua hon hai thread. Su dung ban sao cua du lieu neu co co hoi.
- Giu cac phan dong bo hoa cang nho cang tot vi Lock tao ra do tre va them chi phi. Chung la dat.
- Code da luong hoat dong khac nhau trong cac moi truong khac nhau: Chay test trong moi moi truong trien khai tiem nang.

# Nhung gi toi thich
- Kien thuc trong cuon sach nay huu ich. No hoan toan co the ap dung vao thuc te. Sau khi doc cuon sach, phong cach lap trinh cua toi da thay doi rat nhieu.
- Cuon sach de hieu va theo doi. Ban se doc nhieu code, ban se co thach thuc de suy nghi ve dieu gi dung ve code do va dieu gi sai voi no.
- Sau moi chuong, tac gia tom tat cac y chinh. No giup toi nho cac diem chinh lau hon.

# Nhung gi toi khong thich
- Tac gia su dung code Java lam vi du trong sach. Doi khi de hieu y tuong cua tac gia, chung ta phai tim hieu them ve cac khai niem Java. (Spring framework, JUnit framework, cac loai exception, v.v.)
- Y tuong cua tac gia bi trung lap trong mot so chuong.

# Tong quat
Tat nhien, trong pham vi bai viet, toi khong the mo ta day du cac y tuong cua tac gia. Day la mot cuon sach tot ma toi khuyen doc, dac biet cho cac lap trinh vien junior moi tot nghiep. Vi o truong, giao vien co the khong day chung ta code nhu the nao duoc goi la sach, phong cach lap trinh cua ban khong duoc danh gia. Tren thuc te, code cua ban co the chay dung nhung khong sach.
Neu ban co kha nang mua cuon sach nay de co the tham khao khi can, no se rat huu ich.
"Ban dang doc cuon sach nay vi hai ly do. Thu nhat, ban la mot lap trinh vien. Thu hai, ban muon tro thanh mot lap trinh vien gioi hon."

![](/Post-Resources/CleanCode/Introduction.JPG "Clean code")
