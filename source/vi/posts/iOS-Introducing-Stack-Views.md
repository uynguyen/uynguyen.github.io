---
title: 'iOS: Giới thiệu Stack Views Lập trình'
date: 2020-07-18 17:00:08
tags: [UI, UIStackView, iOS]
layout: post
permalink: vi/posts/iOS-Introducing-Stack-Views/
lang: vi
---

![](/Post-Resources/StackView/stackview.png "Banner")

Khi kỹ năng phát triển iOS của bạn đang phát triển, tôi tin rằng bạn sử dụng `UIScrollView`, `UICollectionView`, `UITableView`, và các view native khác thường xuyên và thành thạo trong các ứng dụng của mình. Tuy nhiên, một số iOS developer vẫn không biết chính xác `UIStackView` là gì, nó được sử dụng cho mục đích gì hoặc trong tình huống nào chúng ta nên sử dụng `UIStackView`.
Trong tutorial này, tôi sẽ giới thiệu cho bạn `UIStackView` - Một view giúp chúng ta đơn giản hóa các layout iOS.

Hãy tưởng tượng bạn đang xây dựng một ứng dụng cho phép người dùng thêm hoặc xóa các view trong runtime. Nhớ cách chúng ta sẽ hoàn thành tác vụ này? Đầu tiên chúng ta phải xóa tất cả các constraint trong vùng liên quan và cập nhật lại tất cả. Hoặc nhớ trường hợp bạn triển khai view đăng nhập / đăng ký, bạn thêm nhiều text field và thiết lập constraint thủ công giữa các view đó. Trong những tình huống như vậy, `UIStackView` tỏ ra hữu ích hơn các view khác.

<!-- more -->

Để minh họa cách áp dụng `UIStackView` vào các project của bạn, chúng ta sẽ xây dựng một ứng dụng đơn giản cho phép người dùng điều khiển các thiết bị thông minh trong nhà của họ; Người dùng có thể thêm hoặc xóa phòng nào họ muốn hiển thị trong danh sách điều khiển của họ. Điểm chính ở đây là tất cả các hành động của người dùng được thực thi trong runtime một cách động. Ngoài ra, thay vì sử dụng Storyboard trong project này, tôi sẽ sử dụng code động cùng với sự trợ giúp của framework AutoLayout ([SnapKit](https://github.com/SnapKit/SnapKit) - đây chỉ là sở thích cá nhân). Hãy bỏ qua các triển khai phức tạp khác, ứng dụng chỉ chứa hai view: Một view đăng nhập và một trang chủ. Ngoài ra, sẽ không có code logic nào cả.

<center>

![](/Post-Resources/StackView/demo.gif "Demo")

</center>

## Các thuộc tính chính
Để hiểu cách Stack View hoạt động, trước tiên chúng ta cần xem xét các thuộc tính của nó. Bất kể loại Stack View là gì (Ngang hay Dọc), có bốn thuộc tính chính: **Axis**, **Spacing**, **Alignment**, và **Distribution**. Hình ảnh sau đây tóm tắt mối quan hệ giữa các thuộc tính đó.

![](/Post-Resources/StackView/StackViewProps.png "Props")

- **Axis**: xác định hướng của stack, bao gồm Horizontal và Vertical.
- **Spacing**: xác định khoảng cách tối thiểu giữa các view của stack.
- **Alignment**: xác định layout của các view của stack vuông góc với trục của nó.
Cả stack view ngang và dọc đều có các tùy chọn `Fill` và `Center`.
    - Fill: Các view được sắp xếp của Stack sẽ được thay đổi kích thước sao cho chúng vừa với stack view vuông góc với trục của nó. Các cạnh leading và trailing của các item xếp dọc hoặc các cạnh top và bottom của item xếp ngang, tương ứng.
    - Center: Như tên gọi, căn giữa các view của stack theo chiều ngang (Stack dọc) hoặc theo chiều dọc (Stack ngang).

Fill             |  Center
:-------------------------:|:-------------------------:
![](/Post-Resources/StackView/h_alighment/fill.png)  |  ![](/Post-Resources/StackView/h_alighment/center.png)

Có một số tùy chọn alignment chỉ áp dụng cho stack view ngang:
- Top: Như tên gọi, căn giữa các view của stack theo chiều ngang (Stack dọc) hoặc theo chiều dọc (Stack ngang).
- Bottom: Như tên gọi, căn giữa các view của stack theo chiều ngang (Stack dọc) hoặc theo chiều dọc (Stack ngang).
- First baseline: Một layout trong đó stack view căn chỉnh các view được sắp xếp của nó dựa trên baseline đầu tiên của chúng.
- Last baseline: Một layout trong đó stack view căn chỉnh các view được sắp xếp của nó dựa trên baseline cuối cùng của chúng.

Top             |  Bottom |  First baseline |  Last baseline
:-------------------------:|:-------------------------:|:-------------------------:|:-------------------------:
![](/Post-Resources/StackView/h_alighment/top.png)  |  ![](/Post-Resources/StackView/h_alighment/bottom.png) |  ![](/Post-Resources/StackView/h_alighment/firstbaseline.png) |  ![](/Post-Resources/StackView/h_alighment/lastbaseline.png)
  |   |  ![](/Post-Resources/StackView/h_alighment/first_baseline.png) |  ![](/Post-Resources/StackView/h_alighment/last_baseline.png)


Tương tự, có một số tùy chọn alignment chỉ hoạt động cho stack view dọc:
- Leading: Stack view căn chỉnh cạnh leading (Trái) của các view được sắp xếp dọc theo cạnh leading của nó. Tương tự như alignment top cho stack ngang.
- Trailing: Stack view căn chỉnh cạnh trailing (Phải) của các view được sắp xếp dọc theo cạnh leading của nó. Tương tự như alignment bottom cho stack ngang.
Leading             |  Trailing
:-------------------------:|:-------------------------:
![](/Post-Resources/StackView/h_alighment/leading.png)  |  ![](/Post-Resources/StackView/h_alighment/trailing.png)

- **Distribution**: xác định layout của các view của stack dọc theo trục của nó. Các subview đều được thay đổi kích thước dựa trên cài đặt này.
    - Fill: Đây được đặt làm distribution mặc định khi một Stack View được tạo. Khi chúng ta đặt các view bên trong một UIStackView với Fill được đặt làm distribution, nó sẽ tiếp tục cố gắng kéo dãn kích thước của một trong các view để lấp đầy không gian.
    Vậy câu hỏi là, nó sẽ dựa trên tiêu chí nào để chọn view để thay đổi kích thước? **Content Hugging Priority (CHP)** sẽ là tiêu chí. Để xác định view nào sẽ được kéo dãn, stack view sẽ dựa vào CHP để đánh giá, priority càng thấp, view càng có khả năng được chọn. Nếu tất cả các view có cùng CHP, view đầu tiên sẽ được chọn.
    - Fill Equally: Mỗi control trong UIStackView sẽ có kích thước bằng nhau.
    - Fill Proportionally: Tất cả các control cần có intrinsic content size, Stack view sẽ đảm bảo các control duy trì cùng tỷ lệ.
    - Equal Spacing: Loại distribution này sẽ duy trì khoảng cách bằng nhau giữa các subview.
    - Equal Centering: Loại distribution này sẽ duy trì khoảng cách bằng nhau giữa tâm của các subview.

Fill             |  Fill Equally               |  Fill Proportionally
:-------------------------:|:-------------------------:|:-------------------------:
![](/Post-Resources/StackView/h_distribution/fill.png)  |  ![](/Post-Resources/StackView/h_distribution/equally.png) |  ![](/Post-Resources/StackView/h_distribution/proportionally.png)

Equal Spacing             |  Equal Centering
:-------------------------:|:-------------------------:
![](/Post-Resources/StackView/h_distribution/equalspacing.png)  |  ![](/Post-Resources/StackView/h_distribution/equalcentering.png)


> Lưu ý: `UIStackView` là một view không render, có nghĩa là bạn không thể đặt thuộc tính background-color, hoặc override method `draw`, v.v.

## Thực hành
Bây giờ, với kiến thức đó trong tâm trí, chúng ta sẽ áp dụng nó vào một project hiện có mà hiện tại không sử dụng `UIStackView` để sắp xếp view của nó. Bằng cách áp dụng `UIStackView` vào thực tế, chúng ta sẽ thực sự hiểu cách `UIStackView` hoạt động và những vấn đề nào nó có thể giải quyết.

### Tự động sắp xếp các view
Điều đầu tiên `UIStackView` mang lại cho chúng ta là sự tự do khỏi việc thiết lập constraint cho tất cả các view.
View đăng nhập khá đơn giản, nó chứa hai text field, một nút đăng nhập và một số text label.

![](/Post-Resources/StackView/login.png "View đăng nhập")

Nếu không sử dụng `UIStackView`, chúng ta phải thiết lập constraint thủ công cho tất cả các text field đó.

```swift
view.addSubview(lblLogin)
lblLogin.snp.makeConstraints { (make) in
    make.centerX.equalToSuperview()
    make.centerY.equalToSuperview().offset(-250)
    make.left.equalToSuperview().offset(20)
    make.right.equalToSuperview().offset(-20)
    make.height.equalTo(30)
}

view.addSubview(lblUsername)
lblUsername.snp.makeConstraints { (make) in
    make.centerX.left.right.equalTo(lblLogin)
    make.top.equalTo(lblLogin.snp.bottom).offset(30)
    make.height.equalTo(30)
}

view.addSubView(btnLogin)
//...
// Phần còn lại được bỏ qua
```

Nhưng nó vẫn chưa phải là cơn ác mộng. Tưởng tượng bây giờ bạn muốn thêm một số view khác, chẳng hạn như một label và một switch view để cho phép người dùng nhớ phiên đăng nhập. Bây giờ chúng ta phải thay đổi tất cả các view khác để chèn những view mới đó vào đúng vị trí trên màn hình!

![](/Post-Resources/StackView/login2.png "View đăng nhập")

Tác vụ sẽ dễ dàng và đơn giản hơn nếu chúng ta sử dụng `StackView`. Bây giờ hãy xem cách chúng ta có thể làm điều đó.
Đầu tiên, hãy thêm một thuộc tính mới vào view controller Đăng nhập.
```swift
lazy var stackView: UIStackView = {
    let stack = UIStackView()
    stack.axis = .vertical
    stack.spacing = 20.0
    stack.alignment = .fill
    stack.distribution = .fillEqually
    [self.lblUsername,
        self.txtUserName,
        self.lblPassword,
        self.txtPassword,
        self.btnLogin].forEach { stack.addArrangedSubview($0) } [1]
    return stack
}()
```

Lưu ý tại [1], đây là cách chúng ta thêm các view được sắp xếp vào một stack view. Sau đó, chúng ta chỉ cần thiết lập constraint cho stackView.

```swift
 override func viewDidLoad() {
    super.viewDidLoad()
    // ...
    view.addSubview(stackView)
    stackView.snp.makeConstraints { (make) in
        make.centerX.left.right.equalTo(lblLogin)
        make.top.equalTo(lblLogin.snp.bottom).offset(30)
        make.height.equalTo(280)
    }
 }
```
Trong tương lai, nếu chúng ta muốn thêm các view mới, chúng ta chỉ cần đặt nó vào mảng các view được sắp xếp. Như bên dưới.

```swift
lazy var keepLoginStackView: UIStackView = {
    let stackView = UIStackView()
    stackView.axis = .horizontal
    stackView.alignment = .trailing
    stackView.distribution = .fill
    [self.lblRememberMe,
        self.swKeepLogin].forEach { stackView.addArrangedSubview($0) }
    return stackView
}()
```

```swift
    // ...
    self.txtPassword,
    self.keepLoginStackView,
    self.btnLogin].forEach { stack.addArrangedSubview($0) }
    // ...
```

Bạn có thể thấy sự khác biệt không? Codebase bây giờ sạch hơn và dễ bảo trì hơn cái cũ, phải không?

### Các view động
Bây giờ chuyển sang trường hợp chúng ta sẽ triển khai trang Chủ của ứng dụng.
Khi người dùng nhấn nút bên phải của màn hình, một view mới, đại diện cho một phòng được điều khiển trong trường hợp này, sẽ được đặt trên trang chính. Người dùng cũng có thể xóa bất kỳ phòng nào trong danh sách bằng cách nhấn nút "Remove". Bên trong mỗi phòng, có một nút "Hide" / "Show" cho phép ẩn và hiện hình ảnh phòng. Nhớ trong quá khứ khi bạn phải triển khai một tính năng tương tự trong ứng dụng của bạn mà không sử dụng `UIStackView`, bạn sẽ làm gì? Hơi đau đớn! Đầu tiên chúng ta cần xóa tất cả các constraint trong vùng liên quan và cập nhật lại tất cả.

Đây là những gì chúng ta sẽ làm với `UIStackView`, trang chính chứa một stack view dọc được nhúng bên trong một scroll view. Bất cứ khi nào nút Add được nhấn, một view `TaskView` mới sẽ được thêm vào stack view này.

![](/Post-Resources/StackView/dynamic.png "Dynamic View")


```swift
func addMoreView() {
    let view = TaskView(delegate: self, data: room[Int.random(in: 0..<room.count)])
    let constraint1 = view.heightAnchor.constraint(lessThanOrEqualToConstant: 400.0)
    constraint1.isActive = true
    self.taskStackView.addArrangedSubview(view)
    self.view.layoutIfNeeded()
}
```

Chúng ta cũng cần thiết lập constraint chiều cao cho view mới này. Vì chiều cao của view có thể thay đổi khi nút show/hide được nhấn, chúng ta cần định nghĩa constraint này là `lessThanOrEqualToConstant:value` để stack view có thể điều chỉnh constraint chiều cao này.

```swift
func onRemove(_ view: TaskView) {
    if let first = self.taskStackView.arrangedSubviews.first(where: { $0 === view }) {
        UIView.animate(withDuration: 0.3, animations: {
            first.isHidden = true
            first.removeFromSuperview()
        }) { (_) in
            self.view.layoutIfNeeded()
        }
    }
}
```
Khi nút remove trên một task view được click, view này sẽ được xóa khỏi stack view. Chúng ta có thể truy cập tất cả các view được sắp xếp của một stack view bằng cách truy cập thuộc tính `arrangedSubviews`. Đầu tiên chúng ta lặp qua tất cả các view được sắp xếp và tìm view thích hợp có cùng địa chỉ với sender, sau đó xóa nó khỏi super view. Ngoài ra, tôi tạo một animation nhỏ, `UIView.animate(withDuration:animations:)`, để transition trông mượt mà và đẹp hơn cái trước.
Bằng cách sử dụng cùng một cách tiếp cận, bạn có thể làm điều tương tự khi người dùng click vào nút Show / Hide để hiện/ẩn image view. Hãy tự thử.

## Suy nghĩ cuối cùng
Trong tutorial này, tôi đã giới thiệu cho bạn `UIStackView` - một subclass của UIView giúp quản lý vị trí và kích thước của các view được sắp xếp của nó. Chúng ta cũng đã làm việc qua một demo đưa `UIStackView` vào thực tế. Bây giờ bạn đã hiểu cách `UIStackView` hoạt động và `UIStackView` được sử dụng cho mục đích gì, lần tới hãy thử sử dụng `UIStackView` trong ứng dụng của bạn để tận dụng sức mạnh của nó. Tôi sẽ làm, còn bạn thì sao?
Bạn có thể tải demo hoàn chỉnh tại [Github](https://github.com/uynguyen/UIStackView),
Happy coding!
