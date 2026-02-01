---
title: 'Dark Hat - Phiên bản 1.0 đã được phát hành'
date: 2021-07-25 19:35:30
tags:
layout: post
lang: vi
---

![](/Post-Resources/Darkhat/darkhat.png "")

Sau nhiều năm làm việc với công nghệ BLE, tôi nhận thấy rằng mặc dù có nhiều ứng dụng giúp kiểm tra thiết bị BLE nhưng không có ứng dụng nào thực hiện tốt vai trò của mình. Đó là lý do tại sao tôi quyết định xây dựng một ứng dụng BLE của riêng mình - [Dark Hat](https://apps.apple.com/az/app/dark-hat/id1576175854?ign-mpt=uo%3D2). Mục tiêu cốt lõi của ứng dụng này là chia sẻ một công cụ tốt hơn với bạn - một kỹ sư làm việc trong lĩnh vực BLE.
<!-- more -->
## Tính năng chính
`Khám phá các thiết bị gần đó` với `nhiều bộ lọc được hỗ trợ` để chỉ hiển thị các thiết bị mà người dùng quan tâm.
- Lọc theo RSSI.
- Lọc theo tên thiết bị.
- Lọc theo service UUID: Chỉ truy xuất và quét các thiết bị có service UUID của bạn.
<center>
<img src="/Post-Resources/Darkhat/scanning.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/filters.jpg" alt="" style="width:200px;"/>
</center>

Hỗ trợ nhiều tùy chọn trong cài đặt cho phép người dùng tùy chỉnh ứng dụng theo yêu cầu của họ.
- `Quản lý trạng thái`: Tự động kết nối lại khi mất kết nối.
- `Preservation and Restoration`: Người dùng hiện có thể chọn tham gia kiểm tra "Preservation and Restoration". Để biết thêm chi tiết về kỹ thuật này, vui lòng tham khảo [Thực hành tốt nhất: Cách xử lý Bluetooth Low Energy trong nền](/2018/07/23/Best-practice-How-to-deal-with-Bluetooth-Low-Energy-in-background/)
- Các bước trong quy trình kết nối hiện được `điều khiển bởi người dùng`: thời gian chờ kết nối, thiết lập trạng thái notification và nhiều hơn nữa.

<center>
<img src="/Post-Resources/Darkhat/setting.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/state_management.jpg" alt="" style="width:200px;"/>
</center>

Màn hình chính hiển thị `tất cả thông tin và service` thực sự quan trọng với bạn.
`Chế độ xem log inline` giúp bạn quan sát tốt hơn những gì đang xảy ra trên thiết bị của bạn.
Ứng dụng cũng cung cấp tùy chọn cho phép người dùng đặt tên riêng cho các characteristic để hiển thị tốt hơn, bật | tắt notification, sao chép UUID vào clipboard, và nhiều hơn nữa.
<center>
<img src="/Post-Resources/Darkhat/inline_log.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/channel_option.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/channel_options.jpg" alt="" style="width:200px;"/>
</center>

Ứng dụng hỗ trợ `trình soạn thảo thông minh` tự động gợi ý tất cả các lệnh gần đây - một cải tiến nhỏ nhưng giúp giảm thời gian kiểm tra của bạn.
Màn hình chi tiết characteristic hiện cung cấp tùy chọn cho phép `hiển thị tất cả phản hồi từ nhiều characteristic` giúp bạn nắm bắt toàn bộ quy trình khi kiểm tra.

<center>
<img src="/Post-Resources/Darkhat/channel.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/sugesstion.jpg" alt="" style="width:200px;"/>
</center>

<br />

`Dễ dàng chia sẻ`: Chia sẻ kết quả của bạn chỉ với 1 lần nhấp.

<center>
<img src="/Post-Resources/Darkhat/response.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/sharing.jpg" alt="" style="width:200px;"/>
</center>

## Kiến trúc

Trung tâm của ứng dụng này là một SDK có tên `BLEFramework` - được tôi xây dựng - bao gồm tất cả logic làm việc với framework BLE của Apple và cung cấp các giao diện đơn giản cho các layer cấp cao hơn - ứng dụng. Bằng cách này, chúng ta có thể tách logic phức tạp khỏi ứng dụng UI, giúp dễ dàng phát triển và bảo trì.
Ngoài ra, tôi có kế hoạch chuyển tất cả các view UI sang một công nghệ cross-platform (có thể là React Native) để hỗ trợ Android trong một layer view duy nhất. Tất cả những gì tôi cần làm là tạo một SDK khác hỗ trợ cho nền tảng Android.

![](/Post-Resources/Darkhat/arch.png "")

## Các bước tiếp theo
Tôi có một lộ trình để thêm nhiều tính năng tuyệt vời hơn cho ứng dụng, kể đến một vài: streaming dữ liệu realtime, đo tốc độ, nhiều kết nối, điều khiển bằng script, iBeacons.
Không thể chờ đợi để cung cấp tất cả các tính năng thú vị này cho người dùng.
Nếu bạn có bất kỳ ý tưởng hoặc phản hồi nào, hãy gửi email đến uynguyen.itus@gmail.com hoặc dark.hat.ble@gmail.com, tôi rất muốn nghe từ bạn.

