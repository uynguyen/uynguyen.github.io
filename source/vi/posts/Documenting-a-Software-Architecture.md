---
title: Tài liệu hóa Kiến trúc Phần mềm
date: 2018-04-11 22:19:20
tags: [UML, Software Architecture]
layout: post
permalink: vi/posts/Documenting-a-Software-Architecture/
lang: vi
---
![](/Post-Resources/UML/Banner.png "")
Rõ ràng là việc tài liệu hóa kiến trúc là một trong những công việc ~~nhàm chán~~ quan trọng nhất của Kỹ thuật Phần mềm.
<!-- more -->
## Một hoạt động hai mặt
Có nhiều lý do tốt để chúng ta phải tài liệu hóa các dự án phần mềm của mình:
- Các thành viên khác có thể hiểu và đánh giá thiết kế của phần mềm này.
- Chúng ta có thể hiểu những gì đã triển khai khi quay lại sau một khoảng thời gian nhất định.
- Chúng ta có thể phân tích thiết kế để đánh giá hiệu năng của hệ thống, ngăn ngừa lỗi xảy ra trước khi bắt đầu giai đoạn triển khai.

Việc tài liệu hóa kiến trúc cũng có một số nhược điểm, như:
- Tài liệu sẽ dần trở nên lỗi thời so với code. Việc giữ cho tài liệu kiến trúc cập nhật thường là một hoạt động bị bỏ qua, đặc biệt dưới áp lực trong một dự án.
- Tài liệu hóa *tốn thời gian* và *tốn kém*.
<br />

Vậy khi nào chúng ta nên tài liệu hóa kiến trúc phần mềm?
Có rất nhiều yếu tố cần xem xét để quyết định có cần tài liệu hóa hay không. Các dự án ít có triển vọng tồn tại lâu dài có lẽ không cần nhiều tài liệu. Yếu tố khác cần xem xét khi tài liệu hóa là nhu cầu của các bên liên quan trong dự án, bao gồm các vai trò khác nhau như developer, tester, manager, v.v. Trong một team nhỏ, tài liệu có thể ở mức tối thiểu và có thể được thay thế bằng giao tiếp trực tiếp, giúp tiết kiệm thời gian. Tuy nhiên, trong một team lớn, tài liệu trở nên quan trọng hơn để mô tả hệ thống, đặc biệt là các công ty hoạt động ở nhiều quốc gia và nhiều văn phòng. Do đó, điều quan trọng là phải suy nghĩ kỹ trước khi tài liệu hóa vì nó tốn thời gian để phát triển và duy trì cùng với các dự án.
Trong bài viết này, tôi sẽ giới thiệu cho bạn ngôn ngữ phổ biến nhất để tài liệu hóa kiến trúc phần mềm: Unified Modeling Language.

## Unified Modeling Language (UML)
UML là một ngôn ngữ mô hình hóa của Kỹ thuật Phần mềm. Nó cung cấp một cách tiêu chuẩn để trực quan hóa thiết kế của một hệ thống hoặc ứng dụng. UML bao gồm cả biểu đồ cấu trúc và biểu đồ hành vi để biểu diễn một hệ thống phần mềm:
- Biểu đồ cấu trúc mô tả kiến trúc tĩnh của hệ thống.
- Biểu đồ hành vi hiển thị các tương tác giữa các thực thể bên trong hệ thống.

![](/Post-Resources/UML/UML-Diagram-Types.png "")

Lưu ý rằng tôi chưa bao giờ sử dụng *Component diagrams*, *Package diagram*, *Deployment diagrams*, *Profile Diagram*, *Composite Structure diagrams*, *Communication diagrams*, *Interaction Overview diagrams* và *Timing diagrams* nên tôi sẽ bỏ qua các biểu đồ này trong bài viết này.

### Biểu đồ cấu trúc

#### *Class diagrams*
Class diagram mô tả cấu trúc của một hệ thống bằng cách hiển thị các mối quan hệ giữa các class. Nó cũng hiển thị các thuộc tính và phương thức của mỗi class. Mục đích chính của class diagrams là để có cái nhìn tổng quan về hệ thống.

![](/Post-Resources/UML/Class.png "")

Trong đó vis = visibility

| Cú pháp        | Loại visibility |
| ------------- |:-------------:  |
| +     		| Public 		  <td rowspan=4>Nếu một biến hoặc phương thức là static,  <br/> nó phải được gạch chân.</td>|
| #			    | Protected       |
| -				| Private         |
| ~ 			| Package         |


Các dòng sau giới thiệu một số mối quan hệ chính trong Class diagrams.

| Ký hiệu        		| Ý nghĩa |
| ------------- 	|:-------------:  |
| Implementation    | Class B triển khai các hành vi được định nghĩa trong Class A. <br/>![](/Post-Resources/UML/Imple.png "")|
| Inheritance		| Class B có mối quan hệ IS-A với Class A, hay chúng ta có thể nói Class B là một loại của Class A. <br/>![](/Post-Resources/UML/Inher.png "")|
| Dependency 		| Nó tồn tại giữa hai phần tử nếu thay đổi định nghĩa của một phần tử có thể gây ra thay đổi cho phần tử kia. <br/>![](/Post-Resources/UML/Depen.png "")|
| Association		|  Một association nhị phân (với hai đầu) thường được biểu diễn dưới dạng một đường thẳng. <br/> Nó chỉ ra rằng Class A chứa một hoặc nhiều thuộc tính thuộc về Class B, hoặc ngược lại. <br/>![](/Post-Resources/UML/Ass.png "")|
| Aggregation 		| Nó là một trường hợp đặc biệt của Association. Chúng ta có thể nói Class A được aggregation với Class B nếu Object X là một instance của Class A bị hủy nhưng Object Y là một instance của Class B vẫn tồn tại. <br/>![](/Post-Resources/UML/Agg.png "") <br/> Ở đây, vòng đời của cả Employee và Department độc lập với nhau. Employees có thể tồn tại mà không cần department. |
| Composition		| Nó là một trường hợp đặc biệt của Aggregation nhưng mạnh hơn mối quan hệ Aggregation. Nếu Object X là một instance của Class A bị hủy, Object Y là một instance của Class B cũng sẽ bị hủy. Chúng ta cũng nói Composition là mối quan hệ HAS-A.<br/>![](/Post-Resources/UML/Compo.png "") <br/> Ở đây, nếu chúng ta xóa đối tượng vehicle thì tất cả các engine sẽ tự động bị xóa. Các engine không có vòng đời độc lập, nó phụ thuộc vào vòng đời của đối tượng vehicle.         |

![](/Post-Resources/UML/Ex-Class-Diagram.png "")
<center>Một ví dụ về class diagram.</center>

#### *Instance diagrams (Object diagrams)*
Về cơ bản, instance diagram tương tự như class diagram mà nó phụ thuộc vào. Tuy nhiên, instance diagram chỉ là một snapshot của hệ thống tại một thời điểm nào đó, và nó hiển thị những giá trị mà các object đó chứa tại thời điểm được chỉ định. Instance diagrams thường được sử dụng để tạo prototype của một hệ thống, và để hiểu hệ thống rõ hơn từ góc nhìn thực tế.
Các ký hiệu và notation của instance diagrams có thể được sử dụng trong class diagrams.

Ví dụ
![](/Post-Resources/UML/Ex-Object-Diagram.png "")
<center>Chuyển đổi từ class diagram sang instance diagram.</center>

### Biểu đồ hành vi
#### *Activity diagrams*
Activity diagram hiển thị luồng từ một activity này sang activity khác (Một activity là một chức năng được thực hiện bởi hệ thống). Lưu ý rằng các message không được bao gồm trong activity diagrams.
Activity diagram thường được sử dụng để mô tả mức cao của hệ thống, chủ yếu cho người dùng kinh doanh hoặc người không có chuyên môn kỹ thuật. Nó cũng có thể mô tả các bước trong một use case diagram.
Các ký hiệu và thành phần cơ bản:
![](/Post-Resources/UML/Activity-Symbols.png "")

| Ký hiệu cơ bản        		| Ý nghĩa |
| ---------------------		|:-------------:  |
| Start point    					| Nó đại diện cho trạng thái hành động ban đầu.|
| Activity					| Nó đại diện cho một activity của quy trình.|
| Condition 			| Sử dụng ký hiệu này khi một activity yêu cầu một quyết định trước khi chuyển sang activity tiếp theo|
| Synchronization 						| Nó chỉ ra rằng nhiều activity được thực hiện đồng thời.|
| Time event				| Điều này đề cập đến một sự kiện dừng luồng trong một khoảng thời gian.       |
| Interrupting Edge					| Một sự kiện làm gián đoạn luồng. |
| End Point		| Nó đại diện cho trạng thái hành động cuối cùng.       |

#### *Sequence diagrams*
Sequence diagram hiển thị cách các object và component tương tác với nhau để hoàn thành một chức năng.
Các ký hiệu và thành phần cơ bản:
![](/Post-Resources/UML/Sequence-Symbols.png "")

| Ký hiệu cơ bản        		| Ý nghĩa |
| ---------------------		|:-------------:  |
| Actor    					| Nó hiển thị các thực thể tương tác với hệ thống.|
| Object					| Nó đại diện cho một object trong UML.|
| Activation box 			| Nó đại diện cho thời gian cần thiết để hoàn thành một tác vụ.|
| Loop 						| Nó chỉ ra các câu lệnh lặp.   |
| Alternative				| Nó chỉ ra các câu lệnh điều kiện.       |
| Parallel					| Mỗi tác vụ trong frame đại diện cho một thread thực thi được thực hiện song song. |
| Synchronous message		| Người gửi phải đợi phản hồi cho một message trước khi tiếp tục. Biểu đồ nên hiển thị cả lời gọi và phản hồi.       |
| Asynchronous message		| Người gửi không cần đợi phản hồi cho một message trước khi tiếp tục.|
| Return message			| Các message được trả lời cho các lời gọi.       |
| Delete object				| Nó chỉ ra rằng object sẽ bị hủy.    |

#### *State Machine diagrams*
Mục đích chính của state machine diagrams là hiển thị sự thay đổi trạng thái của một object trong suốt vòng đời của nó.

![](/Post-Resources/UML/State-Machine-Diagram.png "")

| Ký hiệu cơ bản        		| Ý nghĩa |
| ---------------------		|:-------------:  |
| State    					| Một state đại diện cho một tình huống trong vòng đời của một object.|
| Initial State				| Trạng thái ban đầu của object.|
| Final State 				| Trạng thái cuối cùng của object.|

Ví dụ sau đây cho thấy sự chuyển đổi trạng thái của một đơn hàng.

![](/Post-Resources/UML/Ex-State-Machine.png "")

#### *Use Case diagrams*
Use-case diagram hiển thị cách người dùng hoặc các ứng dụng bên ngoài khác tương tác với hệ thống. Nó cũng hiển thị phạm vi của hệ thống.

![](/Post-Resources/UML/Usecase-Diagram.png "")

| Ký hiệu cơ bản        		| Ý nghĩa |
| ---------------------		|:-------------:  |
| Actors    					| Họ đại diện cho người dùng hoặc hệ thống bên ngoài tương tác với hệ thống của chúng ta.|
| Use cases					| Họ đại diện cho các cách sử dụng khác nhau mà người dùng có thể có.|
| Associations 			| Có hai loại association: Actor-use case và use case - use case. <br /> Một Actor - use case association chỉ ra actor nào được liên kết với use case nào. <br /> Một Use case - Use case association hiển thị mối quan hệ của hai use case: <br /> - *Include*: Một use case "include" một use case khác nếu đó là một hành động bắt buộc của use case đó.<br /> - *Extend*: Một use case "extend" một use case khác nếu đó là một cách sử dụng tùy chọn của use case đó. <br /> - *Generalization*: Use case kế thừa cấu trúc, hành vi và các mối quan hệ của một use case khác. ![](/Post-Resources/UML/Ex-Association-Usecase.png "")|

## Bạn đã từng nghe về Business Process Model and Notation (hay BPMN) chưa?
"Business Process Model and Notation (BPMN) là một tiêu chuẩn cho việc mô hình hóa quy trình kinh doanh, cung cấp một ký hiệu đồ họa để chỉ định các quy trình kinh doanh trong Business Process Diagram (BPD)." ([Wiki](https://en.wikipedia.org/wiki/Business_Process_Model_and_Notation)).
Các mục tiêu chính của BPMN là:
- Cung cấp một bộ ký hiệu tiêu chuẩn mà các bên liên quan kinh doanh có thể hiểu được.
- Thường được sử dụng để định nghĩa logic kinh doanh vì nó có các khái niệm về sự kiện hoàn chỉnh hơn và hỗ trợ trao đổi message bất đồng bộ, điều quan trọng trong xử lý kinh doanh. BPMN tương tự như activity diagram từ UML.

Một ví dụ về BPMN.
![](/Post-Resources/UML/shopping-process-bpmn.png "")
<center>Một quy trình mua sắm được mô tả bằng BPMN (Nguồn từ Google image)</center>
## Sự khác biệt giữa UML và BPMN, nên sử dụng cái nào?
Chúng ta sử dụng BPMN để mô tả hệ thống ở mức cao, không quan tâm nhiều đến chi tiết tính toán. Ngược lại, UML được sử dụng để định nghĩa chi tiết của hệ thống này, nó được xây dựng như thế nào? nó được tổ chức như thế nào? nó tương tác với các component khác như thế nào? dữ liệu được xử lý như thế nào? v.v.

## Kết luận
Trong bài viết này, tôi đã cho bạn thấy các ý tưởng chung về một số UML diagram phổ biến, và cho bạn thấy sự khác biệt chính giữa UML và BPMN. Tất nhiên, vẫn còn rất nhiều mục đích và notation của các biểu đồ đó mà tôi không thể liệt kê hết ở đây vì phạm vi của bài viết này.
Nếu bạn quan tâm đến UML, bạn có thể tải tài liệu đầy đủ của UML [tại đây (Phiên bản mới nhất của UML là 2.5.1)](https://www.omg.org/spec/UML/).
Cảm ơn bạn đã đọc.

## Tài liệu tham khảo
[1] Essential Software Architecture (2011, Springer-Verlag Berlin Heidelberg)Ian Gorton (auth.), Chapter 8 Documenting a Software Architecture.
