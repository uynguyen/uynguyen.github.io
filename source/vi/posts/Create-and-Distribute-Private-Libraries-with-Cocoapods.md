---
title: Tạo và Phân phối Private Libraries với Cocoapods
date: 2017-09-25 11:38:40
tags: iOS
layout: post
lang: vi
thumbnail: /Post-Resources/PrivatePod/PrivatePod.png
---

[CocoaPods](https://cocoapods.org/) là một dependency manager cho các dự án Swift và Objective-C. Công cụ này không chỉ cho phép chúng ta dễ dàng tích hợp các dependencies mà còn cho phép chúng ta tạo các thư viện của riêng mình. Trong bài viết này, tôi sẽ hướng dẫn bạn cách tạo một private library và phân phối nó cho private team của bạn mà không cần publish thư viện.
<!-- more -->
# Khởi tạo repositories
Truy cập [Github](https://github.com/) hoặc [Bitbucket](https://bitbucket.org/), sau đó tạo hai repositories. Một cho source code của chúng ta được chia sẻ giữa team, cái còn lại cho Podspec, định nghĩa tất cả thông tin về Pod đó.

![](/Post-Resources/PrivatePod/InitGit-Source.png "")
<center>Hình 1. Tạo Github repo để lưu trữ source code</center>

![](/Post-Resources/PrivatePod/InitGit-Spec.png "")
<center>Hình 2. Tạo Github repo để lưu trữ các file Podspec</center>

Theo hướng dẫn trên trang Github, nó hướng dẫn bạn cách thêm project của bạn vào các repositories này.

```bash
$ echo "# MyAwesomeKit-Spec" >> README.md
$ git init
$ git add README.md
$ git commit -m "first commit"
$ git remote add origin git@github.com:uynguyen/MyAwesomeKit-Spec.git
$ git push -u origin master
```

# Tạo thư viện của riêng chúng ta
Mở XCode và tạo một Cocoa Touch Framework mới có tên `MyAwesomeKit`. Sau đó, tạo một class đơn giản tên là `HaHaHaManager`, class này định nghĩa các public methods cho clients. Để đơn giản hơn, tôi định nghĩa một method đơn giản, nhận 2 số làm tham số rồi trả về tổng của chúng:

```obj-c
public class HaHaHaManager {
    public init() { }
    public func awesomeFunction(a: Int, b: Int) -> Int {
        return a + b
    }
}
```

*Lưu ý: Vì chúng ta đang tạo một public Framework, chúng ta phải override default constructor của class `HaHaHaManager`, làm cho nó trở thành public. Nếu không, clients sử dụng Framework này không thể tạo instance của class này vì scope mặc định của classes trong Swift là internal.*

Sau đó, push code của chúng ta lên repository mà chúng ta đã tạo ở bước đầu tiên. Đảm bảo bạn thêm một tag làm version cho commit này.

```bash
$ git add .
$ git commit -m "Our first commit"
$ git tag MyAwesomeKit_1.0.0
$ git push -u origin master --tags
```

# Thêm Private Repository vào cài đặt CocoaPods của bạn
Sử dụng lệnh sau để tạo private repository mới vào CocoaPods của bạn
```bash
$ pod repo add REPO_NAME SOURCE_URL
```

```bash
$ pod repo add MyAwesomeKit https://github.com/uynguyen/MyAwesomeKit
```

Đảm bảo bạn có quyền truy cập đúng vào repository. Bạn có thể cấu hình ssh để truy cập repo qua ssh key. Xem thêm: [Tạo SSH key mới và thêm vào ssh-agent](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)
Để kiểm tra cài đặt của bạn có thành công không, sử dụng các lệnh sau:
```bash
$ cd ~/.cocoapods/repos/MyAwesomeKit
$ pod spec lint . --allow-warnings
```
Lệnh này được sử dụng để validate specifications. Flag `--allow-warnings` chỉ ra rằng chúng ta bỏ qua tất cả warnings khi validate file Pod. (Thiếu một số options như license, author hoặc description).

# Tạo file Podspec của chúng ta

Gõ lệnh để tạo file Podspec. File này chứa tất cả thông tin về code của chúng ta, bao gồm git repository, version của thư viện, dependencies, v.v.

```bash
$ pod spec create MyAwesomeKit
```

Bạn sẽ thấy kết quả như sau

```bash
Pod::Spec.new do |s|
  s.name             	= "MyAwesomeKit"
  s.version          	= "1.0.0"
  s.summary          	= "An awesome KIT can do anything for you"
  s.homepage         	= "https://github.com/uynguyen/MyAwesomeKit"
  s.author           	= { "Uy Nguyen" => "uynguyen.itus@gmail.com" }
  s.source           	= { :git => "git@github.com:uynguyen/MyAwesomeKit.git", :tag => "MyAwesomeKit_#{s.version}" }
  s.platform     		= :ios, '8.0'
  s.requires_arc 		= true
  s.dependency 'AFNetworking', '~> 3.1.0' [1]
  s.source_files 		= "MyAwesomeKit/**/*.{swift}" [2]
  s.frameworks 			= 'UIKit', 'CoreText' [3]
  s.library 			= 'z', 'c++'
  s.module_name 		= 'MyAwesomeKit'
end
```

Đây là giải thích:
* 1: Các Podspecs dependencies khác của bạn. Để thêm nhiều dependency, thêm dòng mới để định nghĩa nó.
* 2: Các source files sẽ được bao gồm. (Thay thế bằng .m, .mm, .c hoặc .cpp nếu bạn cần)
* 3: Các frameworks được liên kết với thư viện của bạn.

Để biết các options khác, vui lòng tham khảo [Podspec Syntax Reference](https://guides.cocoapods.org/syntax/podspec.html)


Push lên Spec Repo

```bash
$ pod repo push MyAwesomeKit MyAwesomeKit.podspec  --allow-warnings
```

Cấu trúc thư mục của bạn sẽ như sau

```bash
.
├── MyAwesomeKit-Spec
    └── MyAwesomeKit
        └── 1.0.0
            └── MyAwesomeKit.podspec
```

Bất cứ khi nào bạn cập nhật thư viện, bạn phải chạy lệnh update để cập nhật Pod repos của bạn
```bash
$ pod repo update
```

# Sử dụng Kit tuyệt vời của chúng ta

Đã đến lúc sử dụng Kit mạnh mẽ của chúng ta. Mở XCode và tạo project mới có tên `MyAwesomeApp`. Sau đó, gõ lệnh dưới đây để init file Pod
```bash
$ Pod init
```
Mở file Pod, thêm code sau để cài đặt thư viện của chúng ta.

```bash
# Uncomment the next line to define a global platform for your project
source 'git@github.com:uynguyen/MyAwesomeKit-Spec.git'
source 'https://github.com/CocoaPods/Specs.git'
platform :ios, :deployment_target => '8.0'
target 'MyAwesomeApp' do
  # Comment the next line if you're not using Swift and don't want to use dynamic frameworks
  use_frameworks!
  pod 'MyAwesomeKit', '1.0.0'
  # Pods for MyAwesomeApp
  target 'MyAwesomeAppTests' do
    inherit! :search_paths
    # Pods for testing
  end
  target 'MyAwesomeAppUITests' do
    inherit! :search_paths
    # Pods for testing
  end
end
```
Hãy xem kết quả của chúng ta (Cầu nguyện và hy vọng nó hoạt động tốt)
![](/Post-Resources/PrivatePod/Result.png "")

# Kết luận
Chúng ta vừa publish private Pod đầu tiên cho team của mình. Từ giờ trở đi, team của chúng ta có thể sử dụng thư viện này một cách riêng tư. Hơn nữa, việc cập nhật và phân phối thư viện khi nó được nâng cấp rất dễ dàng. Cảm ơn CocoaPod!
Nếu bạn có bất kỳ câu hỏi hoặc bình luận nào về bài viết, hãy gửi email cho tôi.
# Tài liệu tham khảo

[1] [Private Pods](https://guides.cocoapods.org/making/private-cocoapods.html)

