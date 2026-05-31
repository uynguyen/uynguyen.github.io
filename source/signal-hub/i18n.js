/* Signal Hub — client-side i18n
 * Translations are keyed by the page's original (English) text, normalized to
 * single-spaced plain text. The English copy lives in index.html and is the
 * fallback for any missing key, so only the non-English languages are listed.
 * Product/UI proper names (Signal Hub, node names, RSSI/UUID/hex tokens) and
 * code snippets stay in English on purpose.
 */
var SH_TRANSLATIONS = (window.SH_TRANSLATIONS = {});

/* ===================== Tiếng Việt ===================== */
SH_TRANSLATIONS.vi = {
  // Nav
  Connect: "Kết nối",
  Workflows: "Workflows",
  Simulate: "Mô phỏng",
  Export: "Xuất file",
  Demo: "Demo",
  "Get Signal Hub": "Tải Signal Hub",
  // Hero
  "BLE Testing · Workflow Automation · Device Simulator · macOS":
    "Kiểm thử BLE · Tự động hóa quy trình · Mô phỏng thiết bị · macOS",
  "The BLE workbench, reimagined for Mac.":
    "BLE Workbench,<br><span class='accent'>phát triển và kiểm thử BLE được thiết kế cho Mac.</span>",
  "Signal Hub is a Mac app for Bluetooth Low Energy (BLE) testing and automation. Scan and connect to many BLE devices at once, build visual workflows that run on real hardware, simulate peripherals when the prototype hasn't shipped, and export PNG / video documentation — all from one elegant macOS app.":
    "Signal Hub là <strong>ứng dụng Mac để kiểm thử và tự động hóa Bluetooth Low Energy (BLE)</strong>. Quét và kết nối nhiều thiết bị BLE cùng lúc, dựng quy trình trực quan chạy trên phần cứng thật, mô phỏng thiết bị ngoại vi khi bản mẫu chưa sẵn sàng, và xuất tài liệu PNG / video. <br/>Tất cả trong một ứng dụng macOS tinh tế.",
  "Download for macOS →": "Tải cho macOS →",
  "Watch demo →": "Xem demo →",
  // Feature 1 — Concurrent BLE
  "Concurrent BLE": "Kết nối đồng thời",
  "Many devices. One calm cockpit.":
    "Quản lý mọi thiết bị <br>từ một giao diện duy nhất.",
  "Signal Hub treats every BLE connection as a first-class citizen. Scan the room, connect to multiple peripherals in parallel, and switch between them without losing context. Read, write, and subscribe to characteristics with one click — and watch traffic stream in real time.":
    "Quản lý nhiều thiết bị BLE cùng lúc, không bỏ lỡ bất kỳ ngữ cảnh nào. Kết nối, đọc, ghi và theo dõi dữ liệu theo thời gian thực từ một giao diện thống nhất.",
  "Concurrent scan & connect across as many devices as your radio can hold":
    "Quét và kết nối đồng thời với số thiết bị tối đa mà sóng radio của bạn cho phép",
  "Per-device sessions with live characteristic explorer and notification stream":
    "Phiên làm việc riêng cho từng thiết bị với trình khám phá characteristic trực tiếp và luồng thông báo",
  "Smart filters: name, RSSI, service UUID, manufacturer data":
    "Bộ lọc thông minh: tên, RSSI, service UUID, dữ liệu nhà sản xuất",
  "Auto-reconnect, pairing, and bond management built in":
    "Tích hợp sẵn tự động kết nối lại, ghép đôi và quản lý liên kết",
  Scan: "Quét",
  "GATT explorer": "Trình khám phá GATT",
  Notifications: "Thông báo",
  // Feature 2 — Workflows
  "Visual workflows": "Quy trình trực quan",
  "Your test plan, drawn into reality.":
    "Kế hoạch kiểm thử của bạn,<br>được vẽ thành hiện thực.",
  "Drag, drop, and connect nodes to compose any BLE flow — handshake, OTA, telemetry, edge cases. Each node is a real BLE action. Hit run, and Signal Hub executes the entire workflow against your device, with full visibility into every step.":
    "Kéo, thả và kết nối các node để xây dựng bất kỳ BLE flow nào — từ handshake, OTA, telemetry đến các edge case phức tạp. Mỗi node đại diện cho một BLE action thực tế. Chỉ cần nhấn Run, Signal Hub sẽ thực thi toàn bộ workflow trên thiết bị của bạn, đồng thời cung cấp khả năng quan sát đầy đủ mọi bước trong quá trình thực thi.",
  "Composable nodes: scan, connect, write, read, wait, branch, assert":
    "Kết hợp linh hoạt các node như scan, connect, write, read, wait, branch và assert để xây dựng bất kỳ BLE workflow nào.",
  "Loop, retry, and conditional logic without writing a line of code":
    "Sử dụng loop, retry và conditional logic mà không cần viết một dòng code nào.",
  "Run once or schedule for regression — the workflow is the spec":
    "Run một lần hoặc schedule cho regression testing — workflow chính là spec.",
  "Version-controlled workspaces keep the team in sync":
    "Version-controlled workspaces giúp cả team luôn đồng bộ.",
  // Feature 2b — Workspaces
  Workspaces: "Không gian làm việc",
  "A home for every project.": "Nơi mọi project<br>được tổ chức gọn gàng.",
  "Organize devices, workflows, and notes into workspaces. Each one is a self-contained context — switch projects with a click. Share a workspace with a teammate and they pick up exactly where you left off.":
    "Sắp xếp thiết bị, quy trình và ghi chú thành các <strong>không gian làm việc</strong>. Mỗi không gian là một ngữ cảnh độc lập — chuyển dự án chỉ bằng một cú nhấp. Chia sẻ không gian làm việc với đồng đội và họ tiếp tục đúng nơi bạn dừng lại.",
  "Per-workspace devices, workflows, and assets":
    "Thiết bị, quy trình và tài nguyên riêng cho từng không gian làm việc",
  "Local-first storage with export anywhere":
    "Lưu trữ ưu tiên cục bộ, xuất ra bất cứ đâu",
  "Built for teams: open the same workspace, get the same view":
    "Thiết kế cho nhóm: mở cùng một không gian làm việc, thấy cùng một giao diện",
  // Feature 3 — Live binding
  "Live binding": "Liên kết trực tiếp",
  "Bind real devices to every node — live.":
    "Mọi node đều có thể<br> tương tác trực tiếp với thiết bị thật.",
  "Connect a workflow to physical hardware in seconds. Pick a discovered peripheral, bind it to a node, and watch the workflow drive the device for real — no scripts, no fixtures, no detours through a terminal.":
    "Đưa workflow của bạn lên thiết bị thật chỉ trong vài giây. Chọn peripheral, bind vào node và thực thi trực tiếp trên phần cứng — không cần script, không cần fixture, không cần terminal.",
  "Real-time binding of any discovered peripheral to any node":
    "Liên kết bất kỳ peripheral vào bất kỳ node nào theo thời gian thực.",
  "Inspect responses, latency, and characteristic values as the workflow runs":
    "Theo dõi responses, latency và characteristic values theo thời gian thực trong suốt quá trình workflow thực thi.",
  "Step through, pause, and re-run — debug like you would code":
    "Step through, pause và re-run workflow — debug như khi làm việc với code.",
  // Feature 4 — Simulator
  "Built-in simulator": "Giả lập thiết bị",
  "No hardware? No problem.": "Không có phần cứng?<br>Không sao cả.",
  "The built-in BLE simulator stands in for any peripheral. Mock services, characteristics, and responses — including the gnarly edge cases that real hardware refuses to reproduce. Build, test, and demo your workflows before the prototype hits your desk.":
    "Built-in BLE simulator giúp bạn mô phỏng bất kỳ peripheral nào. Tạo services, characteristics và responses theo ý muốn, bao gồm cả những edge case phức tạp mà thiết bị thật khó tái tạo. Xây dựng, kiểm thử và demo workflows từ sớm, ngay cả khi phần cứng vẫn chưa sẵn sàng.",
  "Define virtual peripherals with any service / characteristic shape":
    "Tạo virtual peripherals với bất kỳ cấu trúc service / characteristic nào bạn cần.",
  "Scripted responses, delays, and failure modes — reproduce real bugs on demand":
    "Mô phỏng responses, latency và failure modes. Tái hiện lỗi thực tế theo yêu cầu.",
  "Mix and match: real devices and simulated ones in the same workflow":
    "Linh hoạt kết hợp thiết bị thật và thiết bị mô phỏng trong một workflow duy nhất.",
  "Mock services": "Giả lập",
  "Scripted responses": "Phản hồi theo kịch bản",
  "Edge cases": "Tình huống ngoại lệ",
  // Feature 5 — Export
  "Share & document": "Chia sẻ & tài liệu hóa",
  "Beautiful artifacts, one click away.":
    "Báo cáo và tài liệu chuyên nghiệp, chỉ với một cú nhấp chuột.",
  "Export any workflow as a high-resolution PNG, a screen recording, or a compact summary — ready to drop into a PR, a spec, or a customer report. Documentation becomes a by-product of building, not a chore.":
    "Xuất workflow thành PNG độ phân giải cao, screen recording hoặc bản tóm tắt chỉ với một cú nhấp chuột. Sẵn sàng chia sẻ trong PR, spec hoặc customer report. Documentation không còn là việc phải làm thêm — nó được tạo ra ngay trong quá trình xây dựng.",
  "One-click PNG export with crisp typography and clear edges":
    "NG export đẹp mắt, sắc nét chỉ với một cú nhấp chuột.",
  "Video export of a live workflow run for demos and bug reports":
    "Xuất video từ một lần chạy workflow thực tế để phục vụ demo và báo lỗi.",
  "Auto-generated run summaries: steps, timings, outcomes":
    "Tự động tạo bản tóm tắt lần chạy: các bước, thời gian và kết quả.",
  "PNG export": "Xuất PNG",
  "Workflows rendered at retina resolution, ready for documentation, PRs, or slide decks.":
    "Workflow được kết xuất ở độ phân giải Retina, sẵn sàng cho documentation, PR hoặc slide thuyết trình.",
  "Video capture": "Ghi hình workflow",
  "Record a live run with all device traffic overlaid. Perfect for demos and bug reports.":
    "Ghi lại một lần chạy thực tế với toàn bộ device traffic được hiển thị trực tiếp trên video. Hoàn hảo cho demo và báo lỗi.",
  "Run summaries": "Tóm tắt lần chạy",
  "Every workflow run produces a structured summary — steps, timing, results, errors.":
    "Mỗi lần chạy workflow đều tạo ra một bản tóm tắt có cấu trúc gồm các bước, thời gian thực thi, kết quả và lỗi.",
  "Concurrent devices": "Nhiều thiết bị đồng thời",
  "Lines of code required": "Số dòng code cần viết",
  "Local-first": "Local-first",
  "PNG & video export": "Xuất PNG & video",
  // Nodes header
  "Workflow nodes": "Nodes",
  "53 building blocks. One workflow.": "53 mảnh ghép.<br>Một quy trình.",
  "Each node is a single BLE action — scan, connect, read, branch, wait. Snap them together on the canvas and you've described a complete protocol exchange, ready to run on a real device or the built-in simulator.":
    "Mỗi node đại diện cho một BLE action duy nhất — scan, connect, read, branch hoặc wait. Kết nối chúng trên canvas để mô tả một protocol hoàn chỉnh, sẵn sàng thực thi trên thiết bị thật hoặc built-in simulator.",
  "Show all nodes": "Hiện tất cả node",
  "Hide all nodes": "Ẩn tất cả node",
  // Category headers
  "Control — 3 nodes": "Điều khiển — 3 node",
  "Triggers — 6 nodes": "Trình kích hoạt — 6 node",
  "Scan — 2 nodes": "Quét — 2 node",
  "Connection — 2 nodes": "Kết nối — 2 node",
  "Discovery — 2 nodes": "Khám phá — 2 node",
  "Read / Write — 4 nodes": "Đọc / Ghi — 4 node",
  "Notify — 2 nodes": "Thông báo — 2 node",
  "Flow — 9 nodes": "Luồng — 9 node",
  "Logic — 3 nodes": "Logic — 3 node",
  "Data — 3 nodes": "Dữ liệu — 3 node",
  "Link — 2 nodes": "Liên kết — 2 node",
  "Egress — 3 nodes": "Đầu ra — 3 node",
  // Shared block heads
  Attributes: "Thuộc tính",
  "Example use cases": "Ví dụ sử dụng",
  // Node: Start
  "Entry point of the workflow.": "Điểm bắt đầu của quy trình.",
  "Entry point of the workflow. Exactly one Start node is allowed — execution begins here when you press Run.":
    "Điểm bắt đầu của quy trình. Chỉ cho phép đúng một node Start — quá trình thực thi bắt đầu từ đây khi bạn nhấn Run.",
  "Every workflow": "Mọi quy trình",
  "Drop a Start node, wire its output into your first real step (Start Scan, Connect, etc.). Without it, Run is disabled.":
    "Đặt một node Start, nối đầu ra của nó vào bước thực sự đầu tiên (Start Scan, Connect, v.v.). Không có nó, Run sẽ bị vô hiệu hóa.",
  // Node: End
  "Terminates a branch cleanly.": "Kết thúc một nhánh gọn gàng.",
  "Terminates a branch cleanly. Optional — branches that reach a dead end also stop, but End makes the intent explicit.":
    "Kết thúc một nhánh gọn gàng. Tùy chọn — các nhánh đi đến ngõ cụt cũng dừng lại, nhưng End thể hiện ý định một cách rõ ràng.",
  "Mark a success path": "Đánh dấu một đường thành công",
  'If/true → HTTP Request → End. The End makes "this branch is done" visible in the run log.':
    'If/true → HTTP Request → End. End làm cho "nhánh này đã xong" hiển thị rõ trong nhật ký chạy.',
  // Node: On Device Discovered
  "Blocks until a matching advertisement is seen.":
    "Chặn cho đến khi thấy một advertisement khớp.",
  "Blocks until a peripheral advertisement matches the configured filters (name substring, manufacturer-data hex prefix, RSSI threshold). Auto-starts a scan unless disabled.":
    "Chặn cho đến khi advertisement của thiết bị ngoại vi khớp các bộ lọc đã cấu hình (chuỗi con của tên, tiền tố hex của manufacturer data, ngưỡng RSSI). Tự động bắt đầu quét trừ khi bị tắt.",
  "Name match": "Khớp tên",
  "Case-insensitive substring required in the advertised local name. Empty = don't filter on name.":
    "Chuỗi con không phân biệt hoa thường bắt buộc có trong local name được quảng bá. Để trống = không lọc theo tên.",
  "Manufacturer (hex)": "Nhà sản xuất (hex)",
  "Hex prefix the device's manufacturer data must start with. Common pattern: 4C00 for Apple beacons.":
    "Tiền tố hex mà manufacturer data của thiết bị phải bắt đầu bằng. Mẫu phổ biến: <code>4C00</code> cho beacon của Apple.",
  "Min RSSI": "RSSI tối thiểu",
  "Drop advertisements weaker than this dBm value. Off = no threshold.":
    "Bỏ qua advertisement yếu hơn giá trị dBm này. Tắt = không có ngưỡng.",
  "Auto scan": "Tự động quét",
  "When on, starts a scan on entry and stops it on match. Turn off if an upstream Start Scan already configured filters.":
    "Khi bật, bắt đầu quét lúc vào node và dừng khi khớp. Tắt đi nếu một node Start Scan phía trước đã cấu hình bộ lọc.",
  "Timeout (s)": "Thời gian chờ (giây)",
  "Maximum wait. Empty = wait forever.":
    "Thời gian chờ tối đa. Để trống = chờ mãi mãi.",
  "Store as": "Lưu thành",
  "Optional variable that receives the matched device address.":
    "Biến tùy chọn nhận địa chỉ thiết bị đã khớp.",
  "Wait for a known sensor": "Chờ một cảm biến đã biết",
  "On Device Discovered (name=SignalHub, rssi ≥ -75) → Connect (uses stored mac).":
    "On Device Discovered (name=<code>SignalHub</code>, rssi ≥ -75) → Connect (dùng mac đã lưu).",
  // Node: On Device Connected
  "Blocks until a connect event fires.": "Chặn cho đến khi có sự kiện kết nối.",
  "Blocks until a connect event fires. Optionally filters by mac so the trigger only resumes when a specific device comes online.":
    "Chặn cho đến khi có sự kiện kết nối. Có thể lọc theo mac để trình kích hoạt chỉ tiếp tục khi một thiết bị cụ thể online.",
  "Device address": "Địa chỉ thiết bị",
  "Optional mac. Empty = match any connect.":
    "Mac tùy chọn. Để trống = khớp mọi kết nối.",
  "Optional variable that receives the connected device address.":
    "Biến tùy chọn nhận địa chỉ thiết bị đã kết nối.",
  "Coordinate with external connect": "Phối hợp với kết nối bên ngoài",
  "On Device Connected (mac=AA:BB:…) → Discover Services → Read Char.":
    "On Device Connected (mac=<code>AA:BB:…</code>) → Discover Services → Read Char.",
  // Node: On Device Disconnected
  "Blocks until a disconnect event fires.":
    "Chặn cho đến khi có sự kiện ngắt kết nối.",
  "Blocks until a disconnect event fires. Used to react to peripherals dropping the link without polling.":
    "Chặn cho đến khi có sự kiện ngắt kết nối. Dùng để phản ứng khi thiết bị ngoại vi rớt liên kết mà không cần thăm dò liên tục.",
  "Optional mac. Empty = match any disconnect.":
    "Mac tùy chọn. Để trống = khớp mọi lần ngắt kết nối.",
  "Optional variable receiving the disconnected mac.":
    "Biến tùy chọn nhận mac đã ngắt kết nối.",
  "Telemetry on drop": "Telemetry khi rớt kết nối",
  "On Device Disconnected → HTTP Request (alert).":
    "On Device Disconnected → HTTP Request (cảnh báo).",
  // Node: On Notification
  "Blocks until a matching notification arrives.":
    "Chặn cho đến khi có một notification khớp.",
  "Blocks until a characteristic notification matches the optional hex prefix. Auto-subscribes to the characteristic before listening so a separate Subscribe step isn't required.":
    "Chặn cho đến khi notification của characteristic khớp tiền tố hex tùy chọn. Tự động đăng ký characteristic trước khi lắng nghe nên không cần bước Subscribe riêng.",
  "Characteristic UUID": "UUID của Characteristic",
  "Target characteristic. Must be notifiable or indicatable.":
    "Characteristic mục tiêu. Phải hỗ trợ notify hoặc indicate.",
  "Match prefix (hex)": "Tiền tố khớp (hex)",
  "Optional hex prefix the payload must start with. Empty = match any notification.":
    "Tiền tố hex tùy chọn mà payload phải bắt đầu bằng. Để trống = khớp mọi notification.",
  "Optional variable that receives the matched payload as hex.":
    "Biến tùy chọn nhận payload đã khớp dưới dạng hex.",
  "Wait for boot notification": "Chờ notification khởi động",
  "Connect → On Notification (uuid=…, match=AA01) → continue.":
    "Connect → On Notification (uuid=…, match=<code>AA01</code>) → tiếp tục.",
  // Node: Timer
  "Wait on a delay, interval, or exact date.":
    "Chờ theo độ trễ, chu kỳ hoặc thời điểm chính xác.",
  "Waits on a time condition before continuing. After delay = one-shot wait. Interval = self-looping periodic tick that runs forever until stopped. Exact date = wait until an ISO-8601 timestamp.":
    "Chờ một điều kiện thời gian trước khi tiếp tục. <strong>After delay</strong> = chờ một lần. <strong>Interval</strong> = nhịp định kỳ tự lặp chạy mãi cho đến khi dừng. <strong>Exact date</strong> = chờ đến một mốc thời gian ISO-8601.",
  Mode: "Chế độ",
  "After delay: wait N seconds, then take edge 1 once. Interval: fire repeatedly on each N-second boundary. Exact date: wait until ISO-8601 timestamp.":
    "After delay: chờ N giây, rồi đi theo edge 1 một lần. Interval: kích hoạt lặp lại mỗi mốc N giây. Exact date: chờ đến mốc thời gian ISO-8601.",
  Seconds: "Số giây",
  "Delay or interval length for After / Interval modes.":
    "Độ dài của độ trễ hoặc chu kỳ cho chế độ After / Interval.",
  "Date (ISO-8601)": "Ngày (ISO-8601)",
  "Used in Exact date mode (e.g. 2026-12-31T23:00:00Z). Past dates fire immediately.":
    "Dùng trong chế độ Exact date (ví dụ <code>2026-12-31T23:00:00Z</code>). Ngày trong quá khứ kích hoạt ngay lập tức.",
  Name: "Tên",
  "Optional identifier referenced by a Stop Timer node. Defaults to the node's label.":
    "Định danh tùy chọn được node Stop Timer tham chiếu. Mặc định là nhãn của node.",
  "Forever-periodic poll": "Thăm dò định kỳ vô hạn",
  "Start → Timer (interval, 5s) → Read Char. The Read fires every 5s; press Stop to end the workflow.":
    "Start → Timer (interval, 5s) → Read Char. Read kích hoạt mỗi 5 giây; nhấn Stop để kết thúc quy trình.",
  "Bounded periodic poll": "Thăm dò định kỳ có giới hạn",
  "Repeat (10) → Timer (after, 5s) → Read Char. Body executes exactly 10 times spaced 5s apart.":
    "Repeat (10) → Timer (after, 5s) → Read Char. Phần thân thực thi đúng 10 lần, cách nhau 5 giây.",
  "Scheduled run": "Lần chạy theo lịch",
  "Start → Timer (exactDate, 2026-12-31T23:00:00Z) → Start Scan → …":
    "Start → Timer (exactDate, <code>2026-12-31T23:00:00Z</code>) → Start Scan → …",
  // Node: Stop Timer
  "Cancels a running Timer by name.": "Hủy một Timer đang chạy theo tên.",
  "Cancels a running Timer node addressed by name. The targeted timer's pending wait is disposed immediately, no more ticks fire. Other branches and timers keep running.":
    "Hủy một node Timer đang chạy được chỉ định theo tên. Lượt chờ đang treo của timer đó bị hủy ngay lập tức, không còn nhịp nào kích hoạt. Các nhánh và timer khác vẫn tiếp tục chạy.",
  "Timer name": "Tên Timer",
  "Must match the target Timer node's Name field. Stopping by name lets one workflow run many timers and cancel them independently.":
    "Phải khớp trường Name của node Timer mục tiêu. Dừng theo tên cho phép một quy trình chạy nhiều timer và hủy chúng độc lập.",
  "Stop on condition": "Dừng theo điều kiện",
  "Timer (name=poll, interval, 5s) → Read Char → If (battery, <, 5) → true: Stop Timer (poll) → HTTP alert.":
    "Timer (name=poll, interval, 5s) → Read Char → If (battery, <, 5) → true: Stop Timer (poll) → HTTP cảnh báo.",
  "Race two timers": "Đua hai timer",
  "Parallel → branch 1: Timer (name=A, interval, 1s) → … ; branch 2: Timer (name=B, after, 30s) → Stop Timer (A). After 30s the fast poller stops.":
    "Parallel → nhánh 1: Timer (name=A, interval, 1s) → … ; nhánh 2: Timer (name=B, after, 30s) → Stop Timer (A). Sau 30 giây, bộ thăm dò nhanh dừng lại.",
  // Node: Start Scan
  "Begins a BLE scan asynchronously.": "Bắt đầu quét BLE một cách bất đồng bộ.",
  "Begins a BLE scan. Continues running asynchronously; subsequent steps execute immediately without waiting for results.":
    "Bắt đầu quét BLE. Tiếp tục chạy bất đồng bộ; các bước sau thực thi ngay mà không chờ kết quả.",
  "Service UUID": "UUID của Service",
  "Optional. When set, only devices advertising this service appear in scan results. Empty = scan everything.":
    "Tùy chọn. Khi đặt, chỉ các thiết bị quảng bá service này xuất hiện trong kết quả quét. Để trống = quét tất cả.",
  "Allow duplicates": "Cho phép trùng lặp",
  "When on, the same device produces multiple advertisement events. Useful for live RSSI tracking; off for one-shot discovery.":
    "Khi bật, cùng một thiết bị tạo ra nhiều sự kiện advertisement. Hữu ích để theo dõi RSSI trực tiếp; tắt để phát hiện một lần.",
  "Find a known device by service": "Tìm thiết bị đã biết theo service",
  "Start Scan (svc=180D) → Delay 3s → Stop Scan → Connect (mac from scan results).":
    "Start Scan (svc=180D) → Delay 3s → Stop Scan → Connect (mac từ kết quả quét).",
  // Node: Stop Scan
  "Stops an in-progress scan.": "Dừng một lần quét đang diễn ra.",
  "Stops an in-progress scan. Pair with Start Scan when you want a bounded discovery window.":
    "Dừng một lần quét đang diễn ra. Kết hợp với Start Scan khi bạn muốn một cửa sổ phát hiện có giới hạn.",
  "Bounded scan": "Quét có giới hạn",
  "Start Scan → Delay 5s → Stop Scan. Without Stop Scan the radio keeps scanning until the workflow ends.":
    "Start Scan → Delay 5s → Stop Scan. Không có Stop Scan, sóng radio tiếp tục quét cho đến khi quy trình kết thúc.",
  // Node: Connect
  "Connects to a peripheral by MAC.":
    "Kết nối tới một thiết bị ngoại vi theo MAC.",
  'Connects to a peripheral by MAC. Resolves on "connected" — i.e. CoreBluetooth fired didConnect and the link is up.':
    'Kết nối tới một thiết bị ngoại vi theo MAC. Hoàn tất khi "connected" — tức là CoreBluetooth đã gọi didConnect và liên kết đã sẵn sàng.',
  Device: "Thiết bị",
  "Pick from the live device list (populated by Start Scan / known devices). The selected MAC becomes the workflow's active device for downstream BLE steps.":
    "Chọn từ danh sách thiết bị trực tiếp (được điền bởi Start Scan / thiết bị đã biết). MAC được chọn trở thành thiết bị đang hoạt động của quy trình cho các bước BLE phía sau.",
  "Connect then read": "Kết nối rồi đọc",
  "Connect (chosen device) → Discover Services → Read Char (battery level).":
    "Connect (thiết bị đã chọn) → Discover Services → Read Char (mức pin).",
  "Reconnect on disconnect": "Kết nối lại khi mất kết nối",
  "Try/Catch around Connect. On the catch path, Delay 1s → Connect again.":
    "Try/Catch bao quanh Connect. Trên nhánh catch, Delay 1s → Connect lại.",
  // Node: Disconnect
  "Closes the active connection.": "Đóng kết nối đang hoạt động.",
  "Closes the active connection. Always good practice at the end of a workflow so the peripheral is free for other apps.":
    "Đóng kết nối đang hoạt động. Luôn là thói quen tốt ở cuối quy trình để thiết bị ngoại vi rảnh cho ứng dụng khác.",
  "Defaults to the active device. Override only if you've connected to multiple peripherals in the same workflow.":
    "Mặc định là thiết bị đang hoạt động. Chỉ ghi đè nếu bạn đã kết nối nhiều thiết bị ngoại vi trong cùng một quy trình.",
  "Clean teardown": "Dọn dẹp gọn gàng",
  "… → Read Char → Disconnect → End.": "… → Read Char → Disconnect → End.",
  // Node: Discover Services
  "Enumerate the peripheral's services.":
    "Liệt kê các service của thiết bị ngoại vi.",
  "Asks the peripheral to enumerate its services. Required before reading/writing characteristics on most devices.":
    "Yêu cầu thiết bị ngoại vi liệt kê các service của nó. Bắt buộc trước khi đọc/ghi characteristic trên hầu hết thiết bị.",
  "Standard prep": "Chuẩn bị tiêu chuẩn",
  "Connect → Discover Services → Discover Characteristics → Read Char.":
    "Connect → Discover Services → Discover Characteristics → Read Char.",
  // Node: Discover Characteristics
  "Enumerate characteristics under each service.":
    "Liệt kê các characteristic dưới mỗi service.",
  "Enumerates the characteristics under each discovered service. Run after Discover Services.":
    "Liệt kê các characteristic dưới mỗi service đã phát hiện. Chạy sau Discover Services.",
  "Walk the GATT": "Duyệt qua GATT",
  "Connect → Discover Services → Discover Characteristics. Now Read/Write/Subscribe can target any UUID.":
    "Connect → Discover Services → Discover Characteristics. Giờ Read/Write/Subscribe có thể nhắm tới bất kỳ UUID nào.",
  // Node: Read Char
  "Read a characteristic's current value.":
    "Đọc giá trị hiện tại của một characteristic.",
  "Reads the current value of a characteristic. Resolves with raw bytes; the bytes are stored in lastReadHex and (optionally) into a named variable.":
    "Đọc giá trị hiện tại của một characteristic. Trả về byte thô; các byte được lưu trong <code>lastReadHex</code> và (tùy chọn) vào một biến có tên.",
  "Standard short (0x2A19) or 128-bit UUID. The picker fills this in from the discovered list.":
    "UUID dạng ngắn chuẩn (<code>0x2A19</code>) hoặc 128-bit. Bộ chọn sẽ điền giá trị này từ danh sách đã phát hiện.",
  "Value format / endian": "Định dạng giá trị / endian",
  "How the result is decoded for display on the node card. Doesn't change lastReadHex — only the human-readable view.":
    "Cách kết quả được giải mã để hiển thị trên thẻ node. Không thay đổi <code>lastReadHex</code> — chỉ là phần hiển thị dễ đọc cho người.",
  "Optional variable name. The decoded value is stored under this name for use by downstream If / Transform steps.":
    "Tên biến tùy chọn. Giá trị đã giải mã được lưu dưới tên này để các bước If / Transform phía sau dùng.",
  "Battery snapshot": "Ảnh chụp mức pin",
  "Connect → Discover … → Read Char (0x2A19, format=UInt8, store as=battery).":
    "Connect → Discover … → Read Char (<code>0x2A19</code>, format=UInt8, store as=battery).",
  "Conditional logic": "Logic điều kiện",
  'Read Char → If (variable=battery, <, 20) → HTTP Request ("low battery").':
    'Read Char → If (variable=battery, <, 20) → HTTP Request ("pin yếu").',
  // Node: Write Char
  "Write bytes to a characteristic.": "Ghi byte vào một characteristic.",
  "Writes bytes to a characteristic. Supports hex (DE AD) or text payloads, and chooses write-with/without-response automatically based on the characteristic's properties.":
    "Ghi byte vào một characteristic. Hỗ trợ payload hex (<code>DE AD</code>) hoặc văn bản, và tự chọn ghi có/không phản hồi dựa trên thuộc tính của characteristic.",
  "Target characteristic.": "Characteristic mục tiêu.",
  Payload: "Payload",
  "Hex bytes (DE AD BE EF) or ${var} interpolations. The executor chunks payloads larger than the negotiated MTU automatically.":
    "Byte hex (<code>DE AD BE EF</code>) hoặc nội suy <code>${var}</code>. Bộ thực thi tự chia nhỏ payload lớn hơn MTU đã thương lượng.",
  "Wake a sensor": "Đánh thức cảm biến",
  "Connect → Discover … → Write Char (0xFF03, payload=01).":
    "Connect → Discover … → Write Char (<code>0xFF03</code>, payload=<code>01</code>).",
  "Send a variable": "Gửi một biến",
  "Set Variable (cmd=AA01) → Write Char (payload=${cmd}).":
    "Set Variable (cmd=<code>AA01</code>) → Write Char (payload=<code>${cmd}</code>).",
  // Node: Read Descriptor
  "Read a GATT descriptor value.": "Đọc giá trị của một descriptor GATT.",
  "Reads a GATT descriptor (e.g. Characteristic User Description 0x2901, Format 0x2904, or the current notify-state bits in the CCCD 0x2902).":
    "Đọc một descriptor GATT (ví dụ Characteristic User Description <code>0x2901</code>, Format <code>0x2904</code>, hoặc các bit trạng thái notify hiện tại trong CCCD <code>0x2902</code>).",
  "Parent characteristic.": "Characteristic cha.",
  "Descriptor UUID": "UUID của Descriptor",
  "Standard short (0x2901, 0x2902, 0x2904) or 128-bit UUID.":
    "UUID dạng ngắn chuẩn (<code>0x2901</code>, <code>0x2902</code>, <code>0x2904</code>) hoặc 128-bit.",
  "Decoding for the result display.": "Cách giải mã để hiển thị kết quả.",
  "Read a friendly name": "Đọc tên thân thiện",
  "Read Descriptor (char=…, desc=0x2901, format=text).":
    "Read Descriptor (char=…, desc=<code>0x2901</code>, format=text).",
  // Node: Write Descriptor
  "Write to a GATT descriptor (not CCCD).":
    "Ghi vào một descriptor GATT (không phải CCCD).",
  "Writes bytes to a writable GATT descriptor. ⚠️ macOS blocks writes to the CCCD (0x2902) — use Subscribe instead. Useful for the rare devices that expose other writable descriptors.":
    "Ghi byte vào một descriptor GATT có thể ghi. ⚠️ macOS chặn việc ghi vào CCCD (<code>0x2902</code>) — hãy dùng Subscribe thay thế. Hữu ích cho số ít thiết bị có descriptor khác cho phép ghi.",
  "Target descriptor — anything other than 0x2902.":
    "Descriptor mục tiêu — bất kỳ cái nào khác <code>0x2902</code>.",
  "Payload (hex)": "Payload (hex)",
  "Bytes to write.": "Các byte cần ghi.",
  "Set custom config": "Đặt cấu hình tùy chỉnh",
  "Write Descriptor (char=…, desc=0xFFD1, payload=01).":
    "Write Descriptor (char=…, desc=<code>0xFFD1</code>, payload=<code>01</code>).",
  // Node: Subscribe
  "Enable notifications on a characteristic.":
    "Bật notification trên một characteristic.",
  "Enables notifications/indications on a characteristic. Subsequent notifications populate lastReadHex and fire Wait Notification steps.":
    "Bật notification/indication trên một characteristic. Các notification sau đó sẽ điền vào <code>lastReadHex</code> và kích hoạt các bước Wait Notification.",
  "Live stream": "Luồng trực tiếp",
  "Subscribe (heart rate) → Wait Notification (5s) → Set Variable (hr = lastReadHex). Loop with Repeat.":
    "Subscribe (nhịp tim) → Wait Notification (5s) → Set Variable (hr = lastReadHex). Lặp với Repeat.",
  // Node: Unsubscribe
  "Turn off notifications for a characteristic.":
    "Tắt notification cho một characteristic.",
  "Turns off notifications for a characteristic. Useful when a workflow has multiple subscribe/unsubscribe phases.":
    "Tắt notification cho một characteristic. Hữu ích khi một quy trình có nhiều giai đoạn subscribe/unsubscribe.",
  "Same UUID as the Subscribe step you want to stop.":
    "Cùng UUID với bước Subscribe mà bạn muốn dừng.",
  "Bounded listen window": "Cửa sổ lắng nghe có giới hạn",
  "Subscribe → Delay 10s → Unsubscribe → Disconnect.":
    "Subscribe → Delay 10s → Unsubscribe → Disconnect.",
  // Node: Repeat
  "Loop N times, then take the exit edge.":
    "Lặp N lần, rồi đi theo edge thoát.",
  "Loops its first output edge N times, then takes the second output (exit) once. Body executions are numbered (#1, #2, …) in the run log.":
    "Lặp edge đầu ra thứ nhất N lần, rồi đi theo đầu ra thứ hai (thoát) một lần. Các lần chạy phần thân được đánh số (<code>#1</code>, <code>#2</code>, …) trong nhật ký chạy.",
  Times: "Số lần",
  "Number of iterations of the body branch before falling through to the exit branch.":
    "Số lần lặp của nhánh thân trước khi rơi xuống nhánh thoát.",
  "Poll a value": "Thăm dò một giá trị",
  "Repeat (10) → body: Read Char → Delay 1s. Exit: Disconnect.":
    "Repeat (10) → thân: Read Char → Delay 1s. Thoát: Disconnect.",
  // Node: Delay
  "Pause this branch for N seconds.": "Tạm dừng nhánh này N giây.",
  "Pauses the branch for a fixed duration. Other parallel branches keep running.":
    "Tạm dừng nhánh trong một khoảng thời gian cố định. Các nhánh song song khác vẫn tiếp tục chạy.",
  "Duration (s)": "Thời lượng (giây)",
  "Seconds to wait before continuing. Floats are fine (0.25 = 250 ms).":
    "Số giây chờ trước khi tiếp tục. Số thập phân hợp lệ (0.25 = 250 ms).",
  "Settle after connect": "Ổn định sau khi kết nối",
  "Connect → Delay 0.5s → Discover Services (some peripherals need a beat).":
    "Connect → Delay 0.5s → Discover Services (một số thiết bị ngoại vi cần một nhịp nghỉ).",
  // Node: Parallel
  "Fan out into concurrent branches.": "Tỏa ra thành các nhánh đồng thời.",
  "Fans out into multiple branches that run concurrently. Each outgoing edge starts its own execution token.":
    "Tỏa ra thành nhiều nhánh chạy đồng thời. Mỗi edge đi ra khởi tạo token thực thi riêng.",
  "Read two characteristics at once": "Đọc hai characteristic cùng lúc",
  "Parallel → branch 1: Read Char A; branch 2: Read Char B → Join (waits for both).":
    "Parallel → nhánh 1: Read Char A; nhánh 2: Read Char B → Join (chờ cả hai).",
  // Node: Join
  "Wait for every incoming branch.": "Chờ mọi nhánh đi vào.",
  "Counterpart to Parallel: waits until every incoming edge has delivered a token before continuing downstream.":
    "Đối ứng với Parallel: chờ đến khi mọi edge đi vào đã chuyển token trước khi tiếp tục về phía sau.",
  "Fan-out / fan-in": "Tỏa ra / gộp vào",
  "Parallel → 3 branches do Read/Read/HTTP → Join → continue.":
    "Parallel → 3 nhánh làm Read/Read/HTTP → Join → tiếp tục.",
  // Node: Try / Catch
  "Recover from failures on a branch.": "Phục hồi khi nhánh gặp lỗi.",
  "Wraps its protected branch (edge 0). If any downstream step on that branch fails, execution jumps to the catch branch (edge 1) instead of failing the workflow.":
    "Bao bọc nhánh được bảo vệ (edge 0). Nếu bất kỳ bước nào phía sau trên nhánh đó lỗi, quá trình thực thi nhảy sang nhánh catch (edge 1) thay vì làm hỏng cả quy trình.",
  "Reconnect on transient failure": "Kết nối lại khi lỗi tạm thời",
  "Try/Catch → protected: Read Char; catch: Delay 1s → Connect → Read Char again.":
    "Try/Catch → được bảo vệ: Read Char; catch: Delay 1s → Connect → Read Char lại.",
  // Node: Retry
  "Retry a branch up to N attempts.": "Thử lại một nhánh tối đa N lần.",
  "Wraps a branch in a retry loop. If anything downstream of edge 0 errors, the executor delays then re-enters edge 0 — up to attempts total tries before falling through to edge 1 (the give-up branch).":
    "Bao một nhánh trong vòng lặp thử lại. Nếu bất kỳ thứ gì phía sau edge 0 lỗi, bộ thực thi sẽ chờ rồi vào lại edge 0 — tối đa <code>attempts</code> lần trước khi rơi xuống edge 1 (nhánh bỏ cuộc).",
  Attempts: "Số lần thử",
  "Total tries (1 = no retry; the branch runs once and any failure falls through immediately).":
    "Tổng số lần thử (1 = không thử lại; nhánh chạy một lần và mọi lỗi rơi xuống ngay).",
  "Backoff (s)": "Khoảng nghỉ (giây)",
  "Delay applied before each retry. Doesn't apply before the first attempt.":
    "Độ trễ áp dụng trước mỗi lần thử lại. Không áp dụng trước lần thử đầu tiên.",
  "Reconnect on flaky link": "Kết nối lại khi liên kết chập chờn",
  "Retry (3 attempts, 1s) → protected: Connect → Read; give-up: HTTP alert.":
    "Retry (3 lần, 1s) → được bảo vệ: Connect → Read; bỏ cuộc: HTTP cảnh báo.",
  // Node: Endless
  "Park a branch indefinitely.": "Giữ một nhánh chạy vô thời hạn.",
  "Parks the current branch indefinitely. The workflow stays in the running state until the user hits Stop, so concurrent triggers (timer, on-notification, on-device-discovered) can keep firing. Has no outgoing edges.":
    "Giữ nhánh hiện tại chạy vô thời hạn. Quy trình ở trạng thái đang chạy cho đến khi người dùng nhấn Stop, nên các trình kích hoạt đồng thời (timer, on-notification, on-device-discovered) vẫn tiếp tục kích hoạt. Không có edge đi ra.",
  "Notification-only flow": "Luồng chỉ có notification",
  "Start → Connect → Subscribe → Endless. A parallel On Notification trigger reacts to inbound packets for as long as the run lasts.":
    "Start → Connect → Subscribe → Endless. Một trình kích hoạt On Notification song song phản ứng với các gói đến trong suốt thời gian chạy.",
  "Background poller": "Bộ thăm dò nền",
  "Start → Timer (every 30s) → Read Char → Append CSV; in parallel: Endless. The Endless branch keeps the run alive so the timer keeps ticking.":
    "Start → Timer (mỗi 30s) → Read Char → Append CSV; song song: Endless. Nhánh Endless giữ cho lần chạy sống để timer tiếp tục đếm nhịp.",
  // Node: If
  "Branch on a condition.": "Rẽ nhánh theo một điều kiện.",
  "Branches on a condition. Edge 0 = true, edge 1 = false. Compares a Source (variable, last RSSI, last hex, isConnected) against a Right-hand value using the chosen operator.":
    "Rẽ nhánh theo một điều kiện. Edge 0 = đúng, edge 1 = sai. So sánh một Source (variable, last RSSI, last hex, isConnected) với một giá trị bên phải bằng toán tử đã chọn.",
  Source: "Nguồn",
  "What the left-hand value is: variable looks up a stored variable; lastRSSI / lastReadHex / isConnected use runtime state.":
    "Giá trị bên trái là gì: <code>variable</code> tra một biến đã lưu; <code>lastRSSI</code> / <code>lastReadHex</code> / <code>isConnected</code> dùng trạng thái lúc chạy.",
  "Variable Name": "Tên biến",
  "Only shown when Source = variable. The name to look up.":
    "Chỉ hiển thị khi Source = variable. Tên cần tra.",
  Operator: "Toán tử",
  "=, ≠, <, ≤, >, ≥, contains, starts with. Numeric ops parse both sides as numbers; others compare as strings.":
    "<code>=</code>, <code>≠</code>, <code><</code>, <code>≤</code>, <code>></code>, <code>≥</code>, <code>contains</code>, <code>starts with</code>. Toán tử số phân tích cả hai vế thành số; các toán tử khác so sánh dạng chuỗi.",
  "Right-hand value": "Giá trị bên phải",
  "Literal value (with ${var} interpolation). When both sides start with 0x they're auto-normalized for hex comparison.":
    "Giá trị nguyên văn (có nội suy <code>${var}</code>). Khi cả hai vế bắt đầu bằng <code>0x</code> chúng được tự chuẩn hóa để so sánh hex.",
  "Low-battery alert": "Cảnh báo pin yếu",
  "Read Char (store as=battery) → If (variable=battery, <, 20) → true: HTTP Request.":
    "Read Char (store as=battery) → If (variable=battery, <, 20) → true: HTTP Request.",
  "Match a hex response": "Khớp một phản hồi hex",
  "Subscribe → Wait Notification → If (lastReadHex, =, 0x AA 01) → true: continue.":
    "Subscribe → Wait Notification → If (lastReadHex, =, <code>0x AA 01</code>) → true: tiếp tục.",
  // Node: Wait Notification
  "Block until a notification arrives.":
    "Chặn cho đến khi có một notification.",
  "Blocks the branch until a notification arrives on the characteristic, or the timeout elapses. The received bytes populate lastReadHex.":
    "Chặn nhánh cho đến khi có notification trên characteristic, hoặc hết thời gian chờ. Các byte nhận được điền vào <code>lastReadHex</code>.",
  "Must already be Subscribed.": "Phải đã được Subscribe trước đó.",
  "Match (hex)": "Khớp (hex)",
  "Optional. If set, ignore notifications that don't equal these bytes.":
    "Tùy chọn. Nếu đặt, bỏ qua các notification không bằng các byte này.",
  "Maximum wait. Leave empty for no timeout.":
    "Thời gian chờ tối đa. Để trống nếu không giới hạn.",
  "Optional variable name for the received bytes.":
    "Tên biến tùy chọn cho các byte nhận được.",
  "Wait for ack byte": "Chờ byte xác nhận",
  "Write Char (cmd) → Wait Notification (match=0x AA, timeout=2) → If on lastReadHex.":
    "Write Char (cmd) → Wait Notification (match=<code>0x AA</code>, timeout=2) → If trên lastReadHex.",
  // Node: Assert
  "Fail the branch if a condition is false.":
    "Làm nhánh thất bại nếu một điều kiện sai.",
  "Checks a condition and fails the step if it's false. Same operand/operator semantics as the If node, but doesn't branch — it terminates the branch on failure (or jumps to the nearest Try/Catch / Retry catch edge).":
    "Kiểm tra một điều kiện và làm bước thất bại nếu sai. Cùng ngữ nghĩa toán hạng/toán tử như node If, nhưng không rẽ nhánh — nó kết thúc nhánh khi thất bại (hoặc nhảy đến edge catch của Try/Catch / Retry gần nhất).",
  "Source / Operator / Value": "Nguồn / Toán tử / Giá trị",
  "Same as If. Compares a variable, lastRSSI, lastReadHex, or isConnected against a literal value.":
    "Giống node If. So sánh một variable, lastRSSI, lastReadHex hoặc isConnected với một giá trị nguyên văn.",
  Message: "Thông điệp",
  "Optional human-readable message included in the failure entry. Defaults to the operand-vs-expected summary.":
    "Thông điệp dễ đọc tùy chọn được thêm vào mục thất bại. Mặc định là bản tóm tắt toán-hạng-so-với-kỳ-vọng.",
  "Guard before write": "Bảo vệ trước khi ghi",
  "Read MTU (store as=mtu) → Assert (variable=mtu, ≥, 100) → Write Char (large payload).":
    "Read MTU (store as=mtu) → Assert (variable=mtu, ≥, 100) → Write Char (payload lớn).",
  "Sanity check protocol": "Kiểm tra nhanh giao thức",
  "On Notification (store as=ack) → Assert (variable=ack, starts with, 0xAA01, msg=bad ack).":
    "On Notification (store as=ack) → Assert (variable=ack, starts with, <code>0xAA01</code>, msg=<code>bad ack</code>).",
  // Node: Set Variable
  "Store a value into a named variable.":
    "Lưu một giá trị vào một biến có tên.",
  "Stores a value into a named variable so later steps can reference it. The source can be a literal, another variable, last RSSI, last hex, or the connection state.":
    "Lưu một giá trị vào một biến có tên để các bước sau tham chiếu. Nguồn có thể là giá trị nguyên văn, một biến khác, last RSSI, last hex, hoặc trạng thái kết nối.",
  "Destination. Pick something the If / Transform / payload steps will reference.":
    "Đích đến. Chọn một tên mà các bước If / Transform / payload sẽ tham chiếu.",
  "Where the value comes from: variable (literal or another variable), lastRSSI, lastReadHex, isConnected.":
    "Giá trị đến từ đâu: <code>variable</code> (nguyên văn hoặc một biến khác), <code>lastRSSI</code>, <code>lastReadHex</code>, <code>isConnected</code>.",
  Literal: "Nguyên văn",
  "Only shown when Source = variable. If the text matches an existing variable name, that variable's value is used; otherwise it's stored as a literal string.":
    "Chỉ hiển thị khi Source = variable. Nếu văn bản khớp tên một biến đã có, giá trị của biến đó được dùng; nếu không, nó được lưu thành chuỗi nguyên văn.",
  "Snapshot RSSI": "Chụp nhanh RSSI",
  "Read RSSI → Set Variable (name=rssi_at_start, source=lastRSSI).":
    "Read RSSI → Set Variable (name=rssi_at_start, source=lastRSSI).",
  "Literal flag": "Cờ nguyên văn",
  "Set Variable (name=mode, source=variable, literal=night) → If (variable=mode, =, night).":
    "Set Variable (name=mode, source=variable, literal=<code>night</code>) → If (variable=mode, =, night).",
  // Node: Transform
  "Convert hex ↔ UInt / Float / UTF-8.":
    "Chuyển đổi hex ↔ UInt / Float / UTF-8.",
  "Converts a hex string into a decoded value (UInt8 / UInt16 / Float / UTF-8 / sliced bytes) or vice versa. Reads from lastReadHex if no input variable is set.":
    "Chuyển một chuỗi hex thành giá trị đã giải mã (UInt8 / UInt16 / Float / UTF-8 / byte cắt lát) hoặc ngược lại. Đọc từ <code>lastReadHex</code> nếu không đặt biến đầu vào.",
  Operation: "Phép toán",
  "hexToUtf8 (auto-trims NUL / whitespace), utf8ToHex, hexToUInt8/16/Int16/Float32 (LE/BE), hexSlice (offset + length).":
    "hexToUtf8 (tự cắt NUL / khoảng trắng), utf8ToHex, hexToUInt8/16/Int16/Float32 (LE/BE), hexSlice (offset + length).",
  Input: "Đầu vào",
  "Source variable name. Empty = use lastReadHex.":
    "Tên biến nguồn. Để trống = dùng lastReadHex.",
  Output: "Đầu ra",
  "Destination variable name. Required.": "Tên biến đích. Bắt buộc.",
  "Offset / Length": "Offset / Độ dài",
  "For hexSlice only. Byte offset from the start, and how many bytes to keep (0 = to end).":
    "Chỉ dành cho hexSlice. Offset byte tính từ đầu, và số byte giữ lại (0 = đến hết).",
  "Decode a version string": "Giải mã một chuỗi phiên bản",
  "Read Char → Transform (hexToUtf8, output=version) → If (variable=version, =, 3.4.4).":
    "Read Char → Transform (hexToUtf8, output=version) → If (variable=version, =, 3.4.4).",
  "First-byte command": "Lệnh ở byte đầu",
  "Subscribe → Wait Notif → Transform (hexSlice, offset=0, length=1, output=cmd_byte) → If (variable=cmd_byte, =, 0xAA).":
    "Subscribe → Wait Notif → Transform (hexSlice, offset=0, length=1, output=cmd_byte) → If (variable=cmd_byte, =, <code>0xAA</code>).",
  // Node: Payload Parser
  "Parse a packet into named fields.":
    "Phân tích một gói thành các trường có tên.",
  Fields: "Các trường",
  "Parses a hex payload into multiple named fields in one node — replaces a chain of Transform nodes when you have a structured packet with several offsets.":
    "Phân tích một payload hex thành nhiều trường có tên trong một node — thay cho một chuỗi node Transform khi bạn có gói có cấu trúc với nhiều offset.",
  "One field per line: name offset length type [endian]. Types: hex, utf8, ascii, uint8/int8, uint16/int16, uint32/int32, float32, float64. length of 0 = to end. Endian (LE/BE) only required for multi-byte numeric types.":
    "Mỗi dòng một trường: <code>name  offset  length  type  [endian]</code>. Kiểu: hex, utf8, ascii, uint8/int8, uint16/int16, uint32/int32, float32, float64. <code>length</code> bằng 0 = đến hết. Endian (LE/BE) chỉ bắt buộc với các kiểu số nhiều byte.",
  "Sensor packet": "Gói cảm biến",
  "Read Char → Payload Parser: temp 0 2 int16 LE hum 2 1 uint8 flag 3 1 hex":
    "Read Char → Payload Parser:<br>temp 0 2 int16 LE<br>hum  2 1 uint8<br>flag 3 1 hex",
  // Node: Read RSSI
  "Read the current connection RSSI.": "Đọc RSSI hiện tại của kết nối.",
  "Reads the current RSSI of the active connection. Stored in the lastRSSI runtime slot and (optionally) into a named variable.":
    "Đọc RSSI hiện tại của kết nối đang hoạt động. Lưu trong ô runtime <code>lastRSSI</code> và (tùy chọn) vào một biến có tên.",
  "Optional variable name.": "Tên biến tùy chọn.",
  "Range check": "Kiểm tra tầm",
  'Read RSSI → If (lastRSSI, <, -85) → true: HTTP "link weak".':
    'Read RSSI → If (lastRSSI, <, -85) → true: HTTP "liên kết yếu".',
  // Node: Read MTU
  "Read the negotiated ATT MTU.": "Đọc ATT MTU đã thương lượng.",
  "Reads the negotiated ATT MTU. macOS CoreBluetooth doesn't expose an API to request a specific MTU — this step just surfaces what the OS negotiated at connect time.":
    "Đọc ATT MTU đã thương lượng. CoreBluetooth của macOS không cung cấp API để <em>yêu cầu</em> một MTU cụ thể — bước này chỉ hiển thị giá trị hệ điều hành đã thương lượng lúc kết nối.",
  "Optional variable name for the MTU integer.":
    "Tên biến tùy chọn cho số nguyên MTU.",
  "Chunk sizing diagnostics": "Chẩn đoán kích thước phân mảnh",
  "Connect → Read MTU (store as=mtu) → HTTP Request (body uses ${mtu}).":
    "Connect → Read MTU (store as=mtu) → HTTP Request (body dùng <code>${mtu}</code>).",
  // Node: HTTP Request
  "Send an HTTP request.": "Gửi một yêu cầu HTTP.",
  "Sends an HTTP request to a URL with optional headers and body. Variables are interpolated with ${name}.":
    "Gửi một yêu cầu HTTP tới một URL với header và body tùy chọn. Biến được nội suy bằng <code>${name}</code>.",
  URL: "URL",
  "Full URL with ${var} allowed.":
    "URL đầy đủ, cho phép dùng <code>${var}</code>.",
  Method: "Phương thức",
  "GET / POST / PUT / DELETE / PATCH.": "GET / POST / PUT / DELETE / PATCH.",
  Headers: "Header",
  "Key: value pairs, one per line. Values support ${var}.":
    "Cặp khóa: giá trị, mỗi cặp một dòng. Giá trị hỗ trợ <code>${var}</code>.",
  Body: "Body",
  "Raw body string. ${var} interpolation applies.":
    "Chuỗi body thô. Áp dụng nội suy <code>${var}</code>.",
  "Ship a reading": "Gửi một số đo",
  'Read Char (store as=temp) → HTTP Request (POST https://api.x/ingest, body={"temp":${temp}}).':
    'Read Char (store as=temp) → HTTP Request (POST https://api.x/ingest, body=<code>{"temp":${temp}}</code>).',
  // Node: Append CSV
  "Append a row to a CSV file.": "Thêm một dòng vào tệp CSV.",
  "Appends a row to a CSV file on disk. Creates the file with the configured header on first run.":
    "Thêm một dòng vào tệp CSV trên ổ đĩa. Tạo tệp với header đã cấu hình trong lần chạy đầu tiên.",
  "File path": "Đường dẫn tệp",
  "Absolute path to the CSV file.": "Đường dẫn tuyệt đối tới tệp CSV.",
  Header: "Header",
  "Comma-separated column names. Written once when the file is created.":
    "Tên cột phân tách bằng dấu phẩy. Chỉ ghi một lần khi tệp được tạo.",
  Row: "Dòng",
  "Comma-separated values. ${var} interpolation applies.":
    "Giá trị phân tách bằng dấu phẩy. Áp dụng nội suy <code>${var}</code>.",
  "Telemetry log": "Nhật ký telemetry",
  "Loop: Read RSSI → Append CSV (header=ts,rssi, row=${now},${rssi}).":
    "Lặp: Read RSSI → Append CSV (header=<code>ts,rssi</code>, row=<code>${now},${rssi}</code>).",
  // Node: Save File
  "Write a payload to disk in one shot.":
    "Ghi một payload xuống ổ đĩa trong một lần.",
  "Writes a payload to disk in one shot (overwrites if exists). Use for snapshots, not append-style logs.":
    "Ghi một payload xuống ổ đĩa trong một lần (ghi đè nếu đã tồn tại). Dùng cho ảnh chụp, không phải nhật ký kiểu nối thêm.",
  "Absolute path to the destination.": "Đường dẫn tuyệt đối tới đích.",
  Content: "Nội dung",
  "Raw text content with ${var} interpolation.":
    "Nội dung văn bản thô với nội suy <code>${var}</code>.",
  "Dump last read": "Kết xuất lần đọc cuối",
  "Read Char → Save File (path=/tmp/last.bin, content=${lastReadHex}).":
    "Read Char → Save File (path=<code>/tmp/last.bin</code>, content=<code>${lastReadHex}</code>).",
  // Request a node
  "Don't see the node you need?": "Không thấy node bạn cần?",
  "Signal Hub is shaped by the engineers who use it. Tell me what step is missing from your workflow and I'll prioritize it for the next release.":
    "Signal Hub được xây dựng dựa trên phản hồi từ những người sử dụng nó mỗi ngày. Nếu bạn thấy workflow của mình còn thiếu điều gì, hãy cho tôi biết — rất có thể đó sẽ là tính năng tiếp theo được phát triển.",
  "Request a node →": "Yêu cầu một node →",
  // Demo
  "See it move": "Xem mọi thứ chuyển động",
  "A 60-second tour.": "60 giây để bắt đầu.",
  "Concurrent connections, workflows, simulator, export — all in motion. The fastest way to feel what Signal Hub actually does.":
    "Concurrent connections, workflows, simulator và export — tất cả vận hành cùng lúc. Cách nhanh nhất để cảm nhận những gì Signal Hub thực sự mang lại.",
  "Signal Hub 1.0.1 — recorded on macOS Sonoma":
    "Signal Hub 1.0.1 — quay trên macOS Sonoma",
  // CTA
  "Build with BLE, finally enjoyable.":
    "Từ ý tưởng đến thiết bị thật, nhanh hơn với BLE workflow.",
  "Signal Hub is in private beta on macOS. If you spend your days talking to BLE peripherals, we'd love to hand you the keys.":
    "Signal Hub đang ở giai đoạn private beta trên macOS. Nếu bạn thường xuyên làm việc với BLE peripheral, hãy tham gia cùng chúng tôi và trở thành một trong những người dùng đầu tiên.",
  "Request beta access": "Yêu cầu quyền truy cập beta",
  "Back to the blog": "Quay lại blog",
  // Footer
  "Designed & built by Uy Nguyen — crafted for engineers who live in the BLE stack.":
    "Được thiết kế & xây dựng bởi <a href='/'>Uy Nguyen</a> — dành cho những người làm BLE mỗi ngày.",
  Blog: "Blog",
  Archives: "Lưu trữ",
  Contact: "Liên hệ",
};

/* ===================== Español ===================== */
SH_TRANSLATIONS.es = {
  // Nav
  Connect: "Conectar",
  Workflows: "Flujos",
  Simulate: "Simular",
  Export: "Exportar",
  Demo: "Demo",
  "Get Signal Hub": "Obtener Signal Hub",
  // Hero
  "BLE Testing · Workflow Automation · Device Simulator · macOS":
    "Pruebas BLE · Automatización de flujos · Simulador de dispositivos · macOS",
  "The BLE workbench, reimagined for Mac.":
    "El banco de trabajo BLE,<br><span class='accent'>reinventado para Mac.</span>",
  "Signal Hub is a Mac app for Bluetooth Low Energy (BLE) testing and automation. Scan and connect to many BLE devices at once, build visual workflows that run on real hardware, simulate peripherals when the prototype hasn't shipped, and export PNG / video documentation — all from one elegant macOS app.":
    "Signal Hub es una <strong>app de Mac para pruebas y automatización de Bluetooth Low Energy (BLE)</strong>. Escanea y conéctate a muchos dispositivos BLE a la vez, crea flujos de trabajo visuales que se ejecutan en hardware real, simula periféricos cuando el prototipo aún no ha llegado y exporta documentación en PNG / vídeo, todo desde una elegante app de macOS.",
  "Download for macOS →": "Descargar para macOS →",
  "Watch demo →": "Ver demo →",
  // Feature 1
  "Concurrent BLE": "BLE concurrente",
  "Many devices. One calm cockpit.":
    "Muchos dispositivos.<br>Una cabina tranquila.",
  "Signal Hub treats every BLE connection as a first-class citizen. Scan the room, connect to multiple peripherals in parallel, and switch between them without losing context. Read, write, and subscribe to characteristics with one click — and watch traffic stream in real time.":
    "Signal Hub trata cada conexión BLE como ciudadana de primera clase. Escanea la sala, conéctate a varios periféricos en paralelo y cambia entre ellos sin perder el contexto. Lee, escribe y suscríbete a características con un clic, y observa el tráfico en tiempo real.",
  "Concurrent scan & connect across as many devices as your radio can hold":
    "Escaneo y conexión concurrentes en tantos dispositivos como soporte tu radio",
  "Per-device sessions with live characteristic explorer and notification stream":
    "Sesiones por dispositivo con explorador de características en vivo y flujo de notificaciones",
  "Smart filters: name, RSSI, service UUID, manufacturer data":
    "Filtros inteligentes: nombre, RSSI, UUID de servicio, datos del fabricante",
  "Auto-reconnect, pairing, and bond management built in":
    "Reconexión automática, emparejamiento y gestión de vínculos integrados",
  Scan: "Escanear",
  "GATT explorer": "Explorador GATT",
  Notifications: "Notificaciones",
  // Feature 2
  "Visual workflows": "Flujos visuales",
  "Your test plan, drawn into reality.":
    "Tu plan de pruebas,<br>dibujado en la realidad.",
  "Drag, drop, and connect nodes to compose any BLE flow — handshake, OTA, telemetry, edge cases. Each node is a real BLE action. Hit run, and Signal Hub executes the entire workflow against your device, with full visibility into every step.":
    "Arrastra, suelta y conecta nodos para componer cualquier flujo BLE: handshake, OTA, telemetría, casos límite. Cada nodo es una acción BLE real. Pulsa ejecutar y Signal Hub ejecuta todo el flujo contra tu dispositivo, con plena visibilidad de cada paso.",
  "Composable nodes: scan, connect, write, read, wait, branch, assert":
    "Nodos componibles: escanear, conectar, escribir, leer, esperar, ramificar, verificar",
  "Loop, retry, and conditional logic without writing a line of code":
    "Bucles, reintentos y lógica condicional sin escribir una línea de código",
  "Run once or schedule for regression — the workflow is the spec":
    "Ejecuta una vez o programa para regresión: el flujo es la especificación",
  "Version-controlled workspaces keep the team in sync":
    "Espacios de trabajo con control de versiones mantienen al equipo sincronizado",
  // Feature 2b
  Workspaces: "Espacios de trabajo",
  "A home for every project.": "Un hogar<br>para cada proyecto.",
  "Organize devices, workflows, and notes into workspaces. Each one is a self-contained context — switch projects with a click. Share a workspace with a teammate and they pick up exactly where you left off.":
    "Organiza dispositivos, flujos y notas en <strong>espacios de trabajo</strong>. Cada uno es un contexto independiente: cambia de proyecto con un clic. Comparte un espacio con un compañero y continuará justo donde lo dejaste.",
  "Per-workspace devices, workflows, and assets":
    "Dispositivos, flujos y recursos por espacio de trabajo",
  "Local-first storage with export anywhere":
    "Almacenamiento local primero, con exportación a cualquier sitio",
  "Built for teams: open the same workspace, get the same view":
    "Hecho para equipos: abre el mismo espacio y obtén la misma vista",
  // Feature 3
  "Live binding": "Vinculación en vivo",
  "Bind real devices to every node — live.":
    "Vincula dispositivos reales<br>a cada nodo, en vivo.",
  "Connect a workflow to physical hardware in seconds. Pick a discovered peripheral, bind it to a node, and watch the workflow drive the device for real — no scripts, no fixtures, no detours through a terminal.":
    "Conecta un flujo a hardware físico en segundos. Elige un periférico descubierto, vincúlalo a un nodo y observa cómo el flujo controla el dispositivo de verdad: sin scripts, sin montajes, sin rodeos por un terminal.",
  "Real-time binding of any discovered peripheral to any node":
    "Vinculación en tiempo real de cualquier periférico descubierto a cualquier nodo",
  "Inspect responses, latency, and characteristic values as the workflow runs":
    "Inspecciona respuestas, latencia y valores de características mientras el flujo se ejecuta",
  "Step through, pause, and re-run — debug like you would code":
    "Avanza paso a paso, pausa y vuelve a ejecutar: depura como lo harías con código",
  // Feature 4
  "Built-in simulator": "Simulador integrado",
  "No hardware? No problem.": "¿Sin hardware?<br>Sin problema.",
  "The built-in BLE simulator stands in for any peripheral. Mock services, characteristics, and responses — including the gnarly edge cases that real hardware refuses to reproduce. Build, test, and demo your workflows before the prototype hits your desk.":
    "El simulador BLE integrado sustituye a cualquier periférico. Simula servicios, características y respuestas, incluidos los casos límite más espinosos que el hardware real se niega a reproducir. Crea, prueba y demuestra tus flujos antes de que el prototipo llegue a tu escritorio.",
  "Define virtual peripherals with any service / characteristic shape":
    "Define periféricos virtuales con cualquier estructura de servicio / característica",
  "Scripted responses, delays, and failure modes — reproduce real bugs on demand":
    "Respuestas guionizadas, retardos y modos de fallo: reproduce errores reales a demanda",
  "Mix and match: real devices and simulated ones in the same workflow":
    "Combínalos: dispositivos reales y simulados en el mismo flujo",
  "Mock services": "Servicios simulados",
  "Scripted responses": "Respuestas guionizadas",
  "Edge cases": "Casos límite",
  // Feature 5
  "Share & document": "Comparte y documenta",
  "Beautiful artifacts, one click away.": "Artefactos preciosos,<br>a un clic.",
  "Export any workflow as a high-resolution PNG, a screen recording, or a compact summary — ready to drop into a PR, a spec, or a customer report. Documentation becomes a by-product of building, not a chore.":
    "Exporta cualquier flujo como un PNG de alta resolución, una grabación de pantalla o un resumen compacto, listo para incluir en un PR, una especificación o un informe para el cliente. La documentación se vuelve un subproducto de construir, no una tarea tediosa.",
  "One-click PNG export with crisp typography and clear edges":
    "Exportación PNG con un clic, con tipografía nítida y bordes claros",
  "Video export of a live workflow run for demos and bug reports":
    "Exportación en vídeo de una ejecución en vivo para demos e informes de errores",
  "Auto-generated run summaries: steps, timings, outcomes":
    "Resúmenes de ejecución autogenerados: pasos, tiempos, resultados",
  "PNG export": "Exportación PNG",
  "Workflows rendered at retina resolution, ready for documentation, PRs, or slide decks.":
    "Flujos renderizados a resolución retina, listos para documentación, PR o presentaciones.",
  "Video capture": "Captura de vídeo",
  "Record a live run with all device traffic overlaid. Perfect for demos and bug reports.":
    "Graba una ejecución en vivo con todo el tráfico del dispositivo superpuesto. Perfecto para demos e informes de errores.",
  "Run summaries": "Resúmenes de ejecución",
  "Every workflow run produces a structured summary — steps, timing, results, errors.":
    "Cada ejecución de flujo produce un resumen estructurado: pasos, tiempos, resultados, errores.",
  "Concurrent devices": "Dispositivos concurrentes",
  "Lines of code required": "Líneas de código necesarias",
  "Local-first": "Local primero",
  "PNG & video export": "Exportación PNG y vídeo",
  // Nodes header
  "Workflow nodes": "Nodos de flujo",
  "53 building blocks. One workflow.":
    "53 bloques de construcción.<br>Un flujo.",
  "Each node is a single BLE action — scan, connect, read, branch, wait. Snap them together on the canvas and you've described a complete protocol exchange, ready to run on a real device or the built-in simulator.":
    "Cada nodo es una sola acción BLE: escanear, conectar, leer, ramificar, esperar. Encájalos en el lienzo y habrás descrito un intercambio de protocolo completo, listo para ejecutarse en un dispositivo real o en el simulador integrado.",
  "Show all nodes": "Mostrar todos los nodos",
  "Hide all nodes": "Ocultar todos los nodos",
  // Category headers
  "Control — 3 nodes": "Control — 3 nodos",
  "Triggers — 6 nodes": "Disparadores — 6 nodos",
  "Scan — 2 nodes": "Escaneo — 2 nodos",
  "Connection — 2 nodes": "Conexión — 2 nodos",
  "Discovery — 2 nodes": "Descubrimiento — 2 nodos",
  "Read / Write — 4 nodes": "Lectura / Escritura — 4 nodos",
  "Notify — 2 nodes": "Notificación — 2 nodos",
  "Flow — 9 nodes": "Flujo — 9 nodos",
  "Logic — 3 nodes": "Lógica — 3 nodos",
  "Data — 3 nodes": "Datos — 3 nodos",
  "Link — 2 nodes": "Enlace — 2 nodos",
  "Egress — 3 nodes": "Salida — 3 nodos",
  // Shared block heads
  Attributes: "Atributos",
  "Example use cases": "Ejemplos de uso",
  // Node: Start
  "Entry point of the workflow.": "Punto de entrada del flujo.",
  "Entry point of the workflow. Exactly one Start node is allowed — execution begins here when you press Run.":
    "Punto de entrada del flujo. Solo se permite un nodo Start: la ejecución comienza aquí al pulsar Run.",
  "Every workflow": "Todos los flujos",
  "Drop a Start node, wire its output into your first real step (Start Scan, Connect, etc.). Without it, Run is disabled.":
    "Coloca un nodo Start y conecta su salida a tu primer paso real (Start Scan, Connect, etc.). Sin él, Run queda deshabilitado.",
  // Node: End
  "Terminates a branch cleanly.": "Termina una rama de forma limpia.",
  "Terminates a branch cleanly. Optional — branches that reach a dead end also stop, but End makes the intent explicit.":
    "Termina una rama de forma limpia. Opcional: las ramas que llegan a un callejón sin salida también se detienen, pero End hace explícita la intención.",
  "Mark a success path": "Marcar una ruta de éxito",
  'If/true → HTTP Request → End. The End makes "this branch is done" visible in the run log.':
    'If/true → HTTP Request → End. El End hace visible "esta rama ha terminado" en el registro de ejecución.',
  // Node: On Device Discovered
  "Blocks until a matching advertisement is seen.":
    "Se bloquea hasta ver un anuncio coincidente.",
  "Blocks until a peripheral advertisement matches the configured filters (name substring, manufacturer-data hex prefix, RSSI threshold). Auto-starts a scan unless disabled.":
    "Se bloquea hasta que el anuncio de un periférico coincide con los filtros configurados (subcadena de nombre, prefijo hex de datos del fabricante, umbral de RSSI). Inicia un escaneo automáticamente salvo que se desactive.",
  "Name match": "Coincidencia de nombre",
  "Case-insensitive substring required in the advertised local name. Empty = don't filter on name.":
    "Subcadena sin distinción de mayúsculas requerida en el nombre local anunciado. Vacío = no filtrar por nombre.",
  "Manufacturer (hex)": "Fabricante (hex)",
  "Hex prefix the device's manufacturer data must start with. Common pattern: 4C00 for Apple beacons.":
    "Prefijo hex con el que deben empezar los datos del fabricante del dispositivo. Patrón común: <code>4C00</code> para beacons de Apple.",
  "Min RSSI": "RSSI mínimo",
  "Drop advertisements weaker than this dBm value. Off = no threshold.":
    "Descarta anuncios más débiles que este valor en dBm. Desactivado = sin umbral.",
  "Auto scan": "Escaneo automático",
  "When on, starts a scan on entry and stops it on match. Turn off if an upstream Start Scan already configured filters.":
    "Cuando está activo, inicia un escaneo al entrar y lo detiene al coincidir. Desactívalo si un Start Scan anterior ya configuró los filtros.",
  "Timeout (s)": "Tiempo de espera (s)",
  "Maximum wait. Empty = wait forever.":
    "Espera máxima. Vacío = esperar indefinidamente.",
  "Store as": "Guardar como",
  "Optional variable that receives the matched device address.":
    "Variable opcional que recibe la dirección del dispositivo coincidente.",
  "Wait for a known sensor": "Esperar un sensor conocido",
  "On Device Discovered (name=SignalHub, rssi ≥ -75) → Connect (uses stored mac).":
    "On Device Discovered (name=<code>SignalHub</code>, rssi ≥ -75) → Connect (usa la mac guardada).",
  // Node: On Device Connected
  "Blocks until a connect event fires.":
    "Se bloquea hasta que se dispara un evento de conexión.",
  "Blocks until a connect event fires. Optionally filters by mac so the trigger only resumes when a specific device comes online.":
    "Se bloquea hasta que se dispara un evento de conexión. Opcionalmente filtra por mac para que el disparador solo continúe cuando un dispositivo concreto se conecta.",
  "Device address": "Dirección del dispositivo",
  "Optional mac. Empty = match any connect.":
    "Mac opcional. Vacío = coincidir con cualquier conexión.",
  "Optional variable that receives the connected device address.":
    "Variable opcional que recibe la dirección del dispositivo conectado.",
  "Coordinate with external connect": "Coordinar con una conexión externa",
  "On Device Connected (mac=AA:BB:…) → Discover Services → Read Char.":
    "On Device Connected (mac=<code>AA:BB:…</code>) → Discover Services → Read Char.",
  // Node: On Device Disconnected
  "Blocks until a disconnect event fires.":
    "Se bloquea hasta que se dispara un evento de desconexión.",
  "Blocks until a disconnect event fires. Used to react to peripherals dropping the link without polling.":
    "Se bloquea hasta que se dispara un evento de desconexión. Sirve para reaccionar a periféricos que pierden el enlace sin sondeo continuo.",
  "Optional mac. Empty = match any disconnect.":
    "Mac opcional. Vacío = coincidir con cualquier desconexión.",
  "Optional variable receiving the disconnected mac.":
    "Variable opcional que recibe la mac desconectada.",
  "Telemetry on drop": "Telemetría al caer el enlace",
  "On Device Disconnected → HTTP Request (alert).":
    "On Device Disconnected → HTTP Request (alerta).",
  // Node: On Notification
  "Blocks until a matching notification arrives.":
    "Se bloquea hasta que llega una notificación coincidente.",
  "Blocks until a characteristic notification matches the optional hex prefix. Auto-subscribes to the characteristic before listening so a separate Subscribe step isn't required.":
    "Se bloquea hasta que la notificación de una característica coincide con el prefijo hex opcional. Se suscribe automáticamente a la característica antes de escuchar, así que no hace falta un paso Subscribe aparte.",
  "Characteristic UUID": "UUID de característica",
  "Target characteristic. Must be notifiable or indicatable.":
    "Característica objetivo. Debe admitir notificación o indicación.",
  "Match prefix (hex)": "Prefijo de coincidencia (hex)",
  "Optional hex prefix the payload must start with. Empty = match any notification.":
    "Prefijo hex opcional con el que debe empezar el payload. Vacío = coincidir con cualquier notificación.",
  "Optional variable that receives the matched payload as hex.":
    "Variable opcional que recibe el payload coincidente en hex.",
  "Wait for boot notification": "Esperar la notificación de arranque",
  "Connect → On Notification (uuid=…, match=AA01) → continue.":
    "Connect → On Notification (uuid=…, match=<code>AA01</code>) → continuar.",
  // Node: Timer
  "Wait on a delay, interval, or exact date.":
    "Espera por un retardo, intervalo o fecha exacta.",
  "Waits on a time condition before continuing. After delay = one-shot wait. Interval = self-looping periodic tick that runs forever until stopped. Exact date = wait until an ISO-8601 timestamp.":
    "Espera una condición de tiempo antes de continuar. <strong>After delay</strong> = espera única. <strong>Interval</strong> = pulso periódico que se repite indefinidamente hasta detenerse. <strong>Exact date</strong> = espera hasta una marca de tiempo ISO-8601.",
  Mode: "Modo",
  "After delay: wait N seconds, then take edge 1 once. Interval: fire repeatedly on each N-second boundary. Exact date: wait until ISO-8601 timestamp.":
    "After delay: espera N segundos y toma el edge 1 una vez. Interval: se dispara repetidamente en cada límite de N segundos. Exact date: espera hasta la marca de tiempo ISO-8601.",
  Seconds: "Segundos",
  "Delay or interval length for After / Interval modes.":
    "Duración del retardo o intervalo para los modos After / Interval.",
  "Date (ISO-8601)": "Fecha (ISO-8601)",
  "Used in Exact date mode (e.g. 2026-12-31T23:00:00Z). Past dates fire immediately.":
    "Se usa en el modo Exact date (p. ej. <code>2026-12-31T23:00:00Z</code>). Las fechas pasadas se disparan de inmediato.",
  Name: "Nombre",
  "Optional identifier referenced by a Stop Timer node. Defaults to the node's label.":
    "Identificador opcional al que hace referencia un nodo Stop Timer. Por defecto es la etiqueta del nodo.",
  "Forever-periodic poll": "Sondeo periódico perpetuo",
  "Start → Timer (interval, 5s) → Read Char. The Read fires every 5s; press Stop to end the workflow.":
    "Start → Timer (interval, 5s) → Read Char. La lectura se dispara cada 5 s; pulsa Stop para terminar el flujo.",
  "Bounded periodic poll": "Sondeo periódico acotado",
  "Repeat (10) → Timer (after, 5s) → Read Char. Body executes exactly 10 times spaced 5s apart.":
    "Repeat (10) → Timer (after, 5s) → Read Char. El cuerpo se ejecuta exactamente 10 veces separadas 5 s.",
  "Scheduled run": "Ejecución programada",
  "Start → Timer (exactDate, 2026-12-31T23:00:00Z) → Start Scan → …":
    "Start → Timer (exactDate, <code>2026-12-31T23:00:00Z</code>) → Start Scan → …",
  // Node: Stop Timer
  "Cancels a running Timer by name.":
    "Cancela un Timer en ejecución por su nombre.",
  "Cancels a running Timer node addressed by name. The targeted timer's pending wait is disposed immediately, no more ticks fire. Other branches and timers keep running.":
    "Cancela un nodo Timer en ejecución indicado por nombre. La espera pendiente de ese timer se descarta de inmediato y no se disparan más pulsos. Otras ramas y timers siguen ejecutándose.",
  "Timer name": "Nombre del Timer",
  "Must match the target Timer node's Name field. Stopping by name lets one workflow run many timers and cancel them independently.":
    "Debe coincidir con el campo Name del nodo Timer objetivo. Detener por nombre permite que un flujo ejecute muchos timers y los cancele de forma independiente.",
  "Stop on condition": "Detener según condición",
  "Timer (name=poll, interval, 5s) → Read Char → If (battery, <, 5) → true: Stop Timer (poll) → HTTP alert.":
    "Timer (name=poll, interval, 5s) → Read Char → If (battery, <, 5) → true: Stop Timer (poll) → alerta HTTP.",
  "Race two timers": "Competir entre dos timers",
  "Parallel → branch 1: Timer (name=A, interval, 1s) → … ; branch 2: Timer (name=B, after, 30s) → Stop Timer (A). After 30s the fast poller stops.":
    "Parallel → rama 1: Timer (name=A, interval, 1s) → … ; rama 2: Timer (name=B, after, 30s) → Stop Timer (A). Tras 30 s, el sondeo rápido se detiene.",
  // Node: Start Scan
  "Begins a BLE scan asynchronously.":
    "Inicia un escaneo BLE de forma asíncrona.",
  "Begins a BLE scan. Continues running asynchronously; subsequent steps execute immediately without waiting for results.":
    "Inicia un escaneo BLE. Continúa ejecutándose de forma asíncrona; los pasos siguientes se ejecutan de inmediato sin esperar resultados.",
  "Service UUID": "UUID de servicio",
  "Optional. When set, only devices advertising this service appear in scan results. Empty = scan everything.":
    "Opcional. Si se define, solo aparecen en los resultados los dispositivos que anuncian este servicio. Vacío = escanear todo.",
  "Allow duplicates": "Permitir duplicados",
  "When on, the same device produces multiple advertisement events. Useful for live RSSI tracking; off for one-shot discovery.":
    "Cuando está activo, el mismo dispositivo produce varios eventos de anuncio. Útil para seguir el RSSI en vivo; desactivado para un descubrimiento único.",
  "Find a known device by service":
    "Encontrar un dispositivo conocido por servicio",
  "Start Scan (svc=180D) → Delay 3s → Stop Scan → Connect (mac from scan results).":
    "Start Scan (svc=180D) → Delay 3s → Stop Scan → Connect (mac de los resultados del escaneo).",
  // Node: Stop Scan
  "Stops an in-progress scan.": "Detiene un escaneo en curso.",
  "Stops an in-progress scan. Pair with Start Scan when you want a bounded discovery window.":
    "Detiene un escaneo en curso. Combínalo con Start Scan cuando quieras una ventana de descubrimiento acotada.",
  "Bounded scan": "Escaneo acotado",
  "Start Scan → Delay 5s → Stop Scan. Without Stop Scan the radio keeps scanning until the workflow ends.":
    "Start Scan → Delay 5s → Stop Scan. Sin Stop Scan, la radio sigue escaneando hasta que termina el flujo.",
  // Node: Connect
  "Connects to a peripheral by MAC.": "Se conecta a un periférico por MAC.",
  'Connects to a peripheral by MAC. Resolves on "connected" — i.e. CoreBluetooth fired didConnect and the link is up.':
    'Se conecta a un periférico por MAC. Se resuelve en "connected", es decir, CoreBluetooth disparó didConnect y el enlace está activo.',
  Device: "Dispositivo",
  "Pick from the live device list (populated by Start Scan / known devices). The selected MAC becomes the workflow's active device for downstream BLE steps.":
    "Elige de la lista de dispositivos en vivo (rellenada por Start Scan / dispositivos conocidos). La MAC seleccionada se convierte en el dispositivo activo del flujo para los pasos BLE posteriores.",
  "Connect then read": "Conectar y luego leer",
  "Connect (chosen device) → Discover Services → Read Char (battery level).":
    "Connect (dispositivo elegido) → Discover Services → Read Char (nivel de batería).",
  "Reconnect on disconnect": "Reconectar al desconectar",
  "Try/Catch around Connect. On the catch path, Delay 1s → Connect again.":
    "Try/Catch alrededor de Connect. En la ruta catch, Delay 1s → Connect de nuevo.",
  // Node: Disconnect
  "Closes the active connection.": "Cierra la conexión activa.",
  "Closes the active connection. Always good practice at the end of a workflow so the peripheral is free for other apps.":
    "Cierra la conexión activa. Siempre es buena práctica al final de un flujo para que el periférico quede libre para otras apps.",
  "Defaults to the active device. Override only if you've connected to multiple peripherals in the same workflow.":
    "Por defecto es el dispositivo activo. Anúlalo solo si te has conectado a varios periféricos en el mismo flujo.",
  "Clean teardown": "Cierre ordenado",
  "… → Read Char → Disconnect → End.": "… → Read Char → Disconnect → End.",
  // Node: Discover Services
  "Enumerate the peripheral's services.":
    "Enumera los servicios del periférico.",
  "Asks the peripheral to enumerate its services. Required before reading/writing characteristics on most devices.":
    "Pide al periférico que enumere sus servicios. Necesario antes de leer/escribir características en la mayoría de dispositivos.",
  "Standard prep": "Preparación estándar",
  "Connect → Discover Services → Discover Characteristics → Read Char.":
    "Connect → Discover Services → Discover Characteristics → Read Char.",
  // Node: Discover Characteristics
  "Enumerate characteristics under each service.":
    "Enumera las características de cada servicio.",
  "Enumerates the characteristics under each discovered service. Run after Discover Services.":
    "Enumera las características de cada servicio descubierto. Ejecútalo tras Discover Services.",
  "Walk the GATT": "Recorrer el GATT",
  "Connect → Discover Services → Discover Characteristics. Now Read/Write/Subscribe can target any UUID.":
    "Connect → Discover Services → Discover Characteristics. Ahora Read/Write/Subscribe pueden apuntar a cualquier UUID.",
  // Node: Read Char
  "Read a characteristic's current value.":
    "Lee el valor actual de una característica.",
  "Reads the current value of a characteristic. Resolves with raw bytes; the bytes are stored in lastReadHex and (optionally) into a named variable.":
    "Lee el valor actual de una característica. Se resuelve con bytes en bruto; los bytes se guardan en <code>lastReadHex</code> y (opcionalmente) en una variable con nombre.",
  "Standard short (0x2A19) or 128-bit UUID. The picker fills this in from the discovered list.":
    "UUID corto estándar (<code>0x2A19</code>) o de 128 bits. El selector lo rellena desde la lista descubierta.",
  "Value format / endian": "Formato de valor / endianness",
  "How the result is decoded for display on the node card. Doesn't change lastReadHex — only the human-readable view.":
    "Cómo se decodifica el resultado para mostrarlo en la tarjeta del nodo. No cambia <code>lastReadHex</code>, solo la vista legible.",
  "Optional variable name. The decoded value is stored under this name for use by downstream If / Transform steps.":
    "Nombre de variable opcional. El valor decodificado se guarda con este nombre para usarlo en pasos If / Transform posteriores.",
  "Battery snapshot": "Instantánea de batería",
  "Connect → Discover … → Read Char (0x2A19, format=UInt8, store as=battery).":
    "Connect → Discover … → Read Char (<code>0x2A19</code>, format=UInt8, store as=battery).",
  "Conditional logic": "Lógica condicional",
  'Read Char → If (variable=battery, <, 20) → HTTP Request ("low battery").':
    'Read Char → If (variable=battery, <, 20) → HTTP Request ("batería baja").',
  // Node: Write Char
  "Write bytes to a characteristic.": "Escribe bytes en una característica.",
  "Writes bytes to a characteristic. Supports hex (DE AD) or text payloads, and chooses write-with/without-response automatically based on the characteristic's properties.":
    "Escribe bytes en una característica. Admite payloads en hex (<code>DE AD</code>) o texto, y elige escritura con/sin respuesta automáticamente según las propiedades de la característica.",
  "Target characteristic.": "Característica objetivo.",
  Payload: "Payload",
  "Hex bytes (DE AD BE EF) or ${var} interpolations. The executor chunks payloads larger than the negotiated MTU automatically.":
    "Bytes hex (<code>DE AD BE EF</code>) o interpolaciones <code>${var}</code>. El ejecutor fragmenta automáticamente los payloads mayores que el MTU negociado.",
  "Wake a sensor": "Despertar un sensor",
  "Connect → Discover … → Write Char (0xFF03, payload=01).":
    "Connect → Discover … → Write Char (<code>0xFF03</code>, payload=<code>01</code>).",
  "Send a variable": "Enviar una variable",
  "Set Variable (cmd=AA01) → Write Char (payload=${cmd}).":
    "Set Variable (cmd=<code>AA01</code>) → Write Char (payload=<code>${cmd}</code>).",
  // Node: Read Descriptor
  "Read a GATT descriptor value.": "Lee el valor de un descriptor GATT.",
  "Reads a GATT descriptor (e.g. Characteristic User Description 0x2901, Format 0x2904, or the current notify-state bits in the CCCD 0x2902).":
    "Lee un descriptor GATT (p. ej. Characteristic User Description <code>0x2901</code>, Format <code>0x2904</code>, o los bits de estado de notificación actuales en el CCCD <code>0x2902</code>).",
  "Parent characteristic.": "Característica padre.",
  "Descriptor UUID": "UUID de descriptor",
  "Standard short (0x2901, 0x2902, 0x2904) or 128-bit UUID.":
    "UUID corto estándar (<code>0x2901</code>, <code>0x2902</code>, <code>0x2904</code>) o de 128 bits.",
  "Decoding for the result display.":
    "Decodificación para mostrar el resultado.",
  "Read a friendly name": "Leer un nombre descriptivo",
  "Read Descriptor (char=…, desc=0x2901, format=text).":
    "Read Descriptor (char=…, desc=<code>0x2901</code>, format=text).",
  // Node: Write Descriptor
  "Write to a GATT descriptor (not CCCD).":
    "Escribe en un descriptor GATT (no el CCCD).",
  "Writes bytes to a writable GATT descriptor. ⚠️ macOS blocks writes to the CCCD (0x2902) — use Subscribe instead. Useful for the rare devices that expose other writable descriptors.":
    "Escribe bytes en un descriptor GATT modificable. ⚠️ macOS bloquea las escrituras al CCCD (<code>0x2902</code>): usa Subscribe en su lugar. Útil para los raros dispositivos que exponen otros descriptores modificables.",
  "Target descriptor — anything other than 0x2902.":
    "Descriptor objetivo: cualquiera distinto de <code>0x2902</code>.",
  "Payload (hex)": "Payload (hex)",
  "Bytes to write.": "Bytes a escribir.",
  "Set custom config": "Establecer una configuración personalizada",
  "Write Descriptor (char=…, desc=0xFFD1, payload=01).":
    "Write Descriptor (char=…, desc=<code>0xFFD1</code>, payload=<code>01</code>).",
  // Node: Subscribe
  "Enable notifications on a characteristic.":
    "Activa notificaciones en una característica.",
  "Enables notifications/indications on a characteristic. Subsequent notifications populate lastReadHex and fire Wait Notification steps.":
    "Activa notificaciones/indicaciones en una característica. Las notificaciones posteriores rellenan <code>lastReadHex</code> y disparan los pasos Wait Notification.",
  "Live stream": "Transmisión en vivo",
  "Subscribe (heart rate) → Wait Notification (5s) → Set Variable (hr = lastReadHex). Loop with Repeat.":
    "Subscribe (frecuencia cardíaca) → Wait Notification (5s) → Set Variable (hr = lastReadHex). Repite con Repeat.",
  // Node: Unsubscribe
  "Turn off notifications for a characteristic.":
    "Desactiva las notificaciones de una característica.",
  "Turns off notifications for a characteristic. Useful when a workflow has multiple subscribe/unsubscribe phases.":
    "Desactiva las notificaciones de una característica. Útil cuando un flujo tiene varias fases de suscripción/cancelación.",
  "Same UUID as the Subscribe step you want to stop.":
    "El mismo UUID que el paso Subscribe que quieres detener.",
  "Bounded listen window": "Ventana de escucha acotada",
  "Subscribe → Delay 10s → Unsubscribe → Disconnect.":
    "Subscribe → Delay 10s → Unsubscribe → Disconnect.",
  // Node: Repeat
  "Loop N times, then take the exit edge.":
    "Repite N veces y luego toma el edge de salida.",
  "Loops its first output edge N times, then takes the second output (exit) once. Body executions are numbered (#1, #2, …) in the run log.":
    "Repite su primer edge de salida N veces y luego toma la segunda salida (salida) una vez. Las ejecuciones del cuerpo se numeran (<code>#1</code>, <code>#2</code>, …) en el registro.",
  Times: "Veces",
  "Number of iterations of the body branch before falling through to the exit branch.":
    "Número de iteraciones de la rama del cuerpo antes de pasar a la rama de salida.",
  "Poll a value": "Sondear un valor",
  "Repeat (10) → body: Read Char → Delay 1s. Exit: Disconnect.":
    "Repeat (10) → cuerpo: Read Char → Delay 1s. Salida: Disconnect.",
  // Node: Delay
  "Pause this branch for N seconds.": "Pausa esta rama durante N segundos.",
  "Pauses the branch for a fixed duration. Other parallel branches keep running.":
    "Pausa la rama durante un tiempo fijo. Las demás ramas paralelas siguen ejecutándose.",
  "Duration (s)": "Duración (s)",
  "Seconds to wait before continuing. Floats are fine (0.25 = 250 ms).":
    "Segundos a esperar antes de continuar. Se admiten decimales (0.25 = 250 ms).",
  "Settle after connect": "Estabilizar tras conectar",
  "Connect → Delay 0.5s → Discover Services (some peripherals need a beat).":
    "Connect → Delay 0.5s → Discover Services (algunos periféricos necesitan un instante).",
  // Node: Parallel
  "Fan out into concurrent branches.": "Se ramifica en ramas concurrentes.",
  "Fans out into multiple branches that run concurrently. Each outgoing edge starts its own execution token.":
    "Se ramifica en varias ramas que se ejecutan a la vez. Cada edge saliente inicia su propio token de ejecución.",
  "Read two characteristics at once": "Leer dos características a la vez",
  "Parallel → branch 1: Read Char A; branch 2: Read Char B → Join (waits for both).":
    "Parallel → rama 1: Read Char A; rama 2: Read Char B → Join (espera a ambas).",
  // Node: Join
  "Wait for every incoming branch.": "Espera a todas las ramas entrantes.",
  "Counterpart to Parallel: waits until every incoming edge has delivered a token before continuing downstream.":
    "Contraparte de Parallel: espera hasta que cada edge entrante haya entregado un token antes de continuar.",
  "Fan-out / fan-in": "Ramificación / unión",
  "Parallel → 3 branches do Read/Read/HTTP → Join → continue.":
    "Parallel → 3 ramas hacen Read/Read/HTTP → Join → continuar.",
  // Node: Try / Catch
  "Recover from failures on a branch.": "Recupérate de fallos en una rama.",
  "Wraps its protected branch (edge 0). If any downstream step on that branch fails, execution jumps to the catch branch (edge 1) instead of failing the workflow.":
    "Envuelve su rama protegida (edge 0). Si falla cualquier paso posterior de esa rama, la ejecución salta a la rama catch (edge 1) en lugar de hacer fallar el flujo.",
  "Reconnect on transient failure": "Reconectar ante un fallo transitorio",
  "Try/Catch → protected: Read Char; catch: Delay 1s → Connect → Read Char again.":
    "Try/Catch → protegida: Read Char; catch: Delay 1s → Connect → Read Char de nuevo.",
  // Node: Retry
  "Retry a branch up to N attempts.": "Reintenta una rama hasta N intentos.",
  "Wraps a branch in a retry loop. If anything downstream of edge 0 errors, the executor delays then re-enters edge 0 — up to attempts total tries before falling through to edge 1 (the give-up branch).":
    "Envuelve una rama en un bucle de reintento. Si algo posterior al edge 0 falla, el ejecutor espera y vuelve a entrar en el edge 0, hasta <code>attempts</code> intentos en total antes de pasar al edge 1 (la rama de abandono).",
  Attempts: "Intentos",
  "Total tries (1 = no retry; the branch runs once and any failure falls through immediately).":
    "Intentos totales (1 = sin reintento; la rama se ejecuta una vez y cualquier fallo pasa de inmediato).",
  "Backoff (s)": "Espera entre reintentos (s)",
  "Delay applied before each retry. Doesn't apply before the first attempt.":
    "Retardo aplicado antes de cada reintento. No se aplica antes del primer intento.",
  "Reconnect on flaky link": "Reconectar ante un enlace inestable",
  "Retry (3 attempts, 1s) → protected: Connect → Read; give-up: HTTP alert.":
    "Retry (3 intentos, 1s) → protegida: Connect → Read; abandono: alerta HTTP.",
  // Node: Endless
  "Park a branch indefinitely.": "Mantiene una rama de forma indefinida.",
  "Parks the current branch indefinitely. The workflow stays in the running state until the user hits Stop, so concurrent triggers (timer, on-notification, on-device-discovered) can keep firing. Has no outgoing edges.":
    "Mantiene la rama actual de forma indefinida. El flujo permanece en ejecución hasta que el usuario pulsa Stop, de modo que los disparadores concurrentes (timer, on-notification, on-device-discovered) pueden seguir activándose. No tiene edges salientes.",
  "Notification-only flow": "Flujo solo de notificaciones",
  "Start → Connect → Subscribe → Endless. A parallel On Notification trigger reacts to inbound packets for as long as the run lasts.":
    "Start → Connect → Subscribe → Endless. Un disparador On Notification paralelo reacciona a los paquetes entrantes mientras dure la ejecución.",
  "Background poller": "Sondeo en segundo plano",
  "Start → Timer (every 30s) → Read Char → Append CSV; in parallel: Endless. The Endless branch keeps the run alive so the timer keeps ticking.":
    "Start → Timer (cada 30s) → Read Char → Append CSV; en paralelo: Endless. La rama Endless mantiene viva la ejecución para que el timer siga marcando.",
  // Node: If
  "Branch on a condition.": "Ramifica según una condición.",
  "Branches on a condition. Edge 0 = true, edge 1 = false. Compares a Source (variable, last RSSI, last hex, isConnected) against a Right-hand value using the chosen operator.":
    "Ramifica según una condición. Edge 0 = verdadero, edge 1 = falso. Compara una fuente (variable, last RSSI, last hex, isConnected) con un valor de la derecha usando el operador elegido.",
  Source: "Fuente",
  "What the left-hand value is: variable looks up a stored variable; lastRSSI / lastReadHex / isConnected use runtime state.":
    "Qué es el valor de la izquierda: <code>variable</code> busca una variable guardada; <code>lastRSSI</code> / <code>lastReadHex</code> / <code>isConnected</code> usan el estado de ejecución.",
  "Variable Name": "Nombre de variable",
  "Only shown when Source = variable. The name to look up.":
    "Solo se muestra cuando Source = variable. El nombre a buscar.",
  Operator: "Operador",
  "=, ≠, <, ≤, >, ≥, contains, starts with. Numeric ops parse both sides as numbers; others compare as strings.":
    "<code>=</code>, <code>≠</code>, <code><</code>, <code>≤</code>, <code>></code>, <code>≥</code>, <code>contains</code>, <code>starts with</code>. Los operadores numéricos interpretan ambos lados como números; los demás comparan como cadenas.",
  "Right-hand value": "Valor de la derecha",
  "Literal value (with ${var} interpolation). When both sides start with 0x they're auto-normalized for hex comparison.":
    "Valor literal (con interpolación <code>${var}</code>). Cuando ambos lados empiezan por <code>0x</code> se normalizan automáticamente para comparar en hex.",
  "Low-battery alert": "Alerta de batería baja",
  "Read Char (store as=battery) → If (variable=battery, <, 20) → true: HTTP Request.":
    "Read Char (store as=battery) → If (variable=battery, <, 20) → true: HTTP Request.",
  "Match a hex response": "Coincidir una respuesta hex",
  "Subscribe → Wait Notification → If (lastReadHex, =, 0x AA 01) → true: continue.":
    "Subscribe → Wait Notification → If (lastReadHex, =, <code>0x AA 01</code>) → true: continuar.",
  // Node: Wait Notification
  "Block until a notification arrives.":
    "Se bloquea hasta que llega una notificación.",
  "Blocks the branch until a notification arrives on the characteristic, or the timeout elapses. The received bytes populate lastReadHex.":
    "Bloquea la rama hasta que llega una notificación en la característica, o se agota el tiempo de espera. Los bytes recibidos rellenan <code>lastReadHex</code>.",
  "Must already be Subscribed.": "Debe estar ya suscrita.",
  "Match (hex)": "Coincidencia (hex)",
  "Optional. If set, ignore notifications that don't equal these bytes.":
    "Opcional. Si se define, ignora las notificaciones que no sean iguales a estos bytes.",
  "Maximum wait. Leave empty for no timeout.":
    "Espera máxima. Déjalo vacío para no tener tiempo límite.",
  "Optional variable name for the received bytes.":
    "Nombre de variable opcional para los bytes recibidos.",
  "Wait for ack byte": "Esperar el byte de confirmación",
  "Write Char (cmd) → Wait Notification (match=0x AA, timeout=2) → If on lastReadHex.":
    "Write Char (cmd) → Wait Notification (match=<code>0x AA</code>, timeout=2) → If sobre lastReadHex.",
  // Node: Assert
  "Fail the branch if a condition is false.":
    "Hace fallar la rama si una condición es falsa.",
  "Checks a condition and fails the step if it's false. Same operand/operator semantics as the If node, but doesn't branch — it terminates the branch on failure (or jumps to the nearest Try/Catch / Retry catch edge).":
    "Comprueba una condición y hace fallar el paso si es falsa. Misma semántica de operandos/operadores que el nodo If, pero no ramifica: termina la rama al fallar (o salta al edge catch más cercano de Try/Catch / Retry).",
  "Source / Operator / Value": "Fuente / Operador / Valor",
  "Same as If. Compares a variable, lastRSSI, lastReadHex, or isConnected against a literal value.":
    "Igual que If. Compara una variable, lastRSSI, lastReadHex o isConnected con un valor literal.",
  Message: "Mensaje",
  "Optional human-readable message included in the failure entry. Defaults to the operand-vs-expected summary.":
    "Mensaje legible opcional incluido en la entrada de fallo. Por defecto es el resumen de operando frente a esperado.",
  "Guard before write": "Proteger antes de escribir",
  "Read MTU (store as=mtu) → Assert (variable=mtu, ≥, 100) → Write Char (large payload).":
    "Read MTU (store as=mtu) → Assert (variable=mtu, ≥, 100) → Write Char (payload grande).",
  "Sanity check protocol": "Verificación rápida del protocolo",
  "On Notification (store as=ack) → Assert (variable=ack, starts with, 0xAA01, msg=bad ack).":
    "On Notification (store as=ack) → Assert (variable=ack, starts with, <code>0xAA01</code>, msg=<code>bad ack</code>).",
  // Node: Set Variable
  "Store a value into a named variable.":
    "Guarda un valor en una variable con nombre.",
  "Stores a value into a named variable so later steps can reference it. The source can be a literal, another variable, last RSSI, last hex, or the connection state.":
    "Guarda un valor en una variable con nombre para que pasos posteriores puedan referenciarlo. La fuente puede ser un literal, otra variable, last RSSI, last hex o el estado de conexión.",
  "Destination. Pick something the If / Transform / payload steps will reference.":
    "Destino. Elige algo a lo que harán referencia los pasos If / Transform / payload.",
  "Where the value comes from: variable (literal or another variable), lastRSSI, lastReadHex, isConnected.":
    "De dónde viene el valor: <code>variable</code> (literal u otra variable), <code>lastRSSI</code>, <code>lastReadHex</code>, <code>isConnected</code>.",
  Literal: "Literal",
  "Only shown when Source = variable. If the text matches an existing variable name, that variable's value is used; otherwise it's stored as a literal string.":
    "Solo se muestra cuando Source = variable. Si el texto coincide con el nombre de una variable existente, se usa el valor de esa variable; de lo contrario se guarda como cadena literal.",
  "Snapshot RSSI": "Capturar el RSSI",
  "Read RSSI → Set Variable (name=rssi_at_start, source=lastRSSI).":
    "Read RSSI → Set Variable (name=rssi_at_start, source=lastRSSI).",
  "Literal flag": "Indicador literal",
  "Set Variable (name=mode, source=variable, literal=night) → If (variable=mode, =, night).":
    "Set Variable (name=mode, source=variable, literal=<code>night</code>) → If (variable=mode, =, night).",
  // Node: Transform
  "Convert hex ↔ UInt / Float / UTF-8.":
    "Convierte hex ↔ UInt / Float / UTF-8.",
  "Converts a hex string into a decoded value (UInt8 / UInt16 / Float / UTF-8 / sliced bytes) or vice versa. Reads from lastReadHex if no input variable is set.":
    "Convierte una cadena hex en un valor decodificado (UInt8 / UInt16 / Float / UTF-8 / bytes recortados) o viceversa. Lee de <code>lastReadHex</code> si no se define una variable de entrada.",
  Operation: "Operación",
  "hexToUtf8 (auto-trims NUL / whitespace), utf8ToHex, hexToUInt8/16/Int16/Float32 (LE/BE), hexSlice (offset + length).":
    "hexToUtf8 (recorta NUL / espacios automáticamente), utf8ToHex, hexToUInt8/16/Int16/Float32 (LE/BE), hexSlice (offset + longitud).",
  Input: "Entrada",
  "Source variable name. Empty = use lastReadHex.":
    "Nombre de la variable de origen. Vacío = usar lastReadHex.",
  Output: "Salida",
  "Destination variable name. Required.":
    "Nombre de la variable de destino. Obligatorio.",
  "Offset / Length": "Offset / Longitud",
  "For hexSlice only. Byte offset from the start, and how many bytes to keep (0 = to end).":
    "Solo para hexSlice. Desplazamiento de bytes desde el inicio y cuántos bytes conservar (0 = hasta el final).",
  "Decode a version string": "Decodificar una cadena de versión",
  "Read Char → Transform (hexToUtf8, output=version) → If (variable=version, =, 3.4.4).":
    "Read Char → Transform (hexToUtf8, output=version) → If (variable=version, =, 3.4.4).",
  "First-byte command": "Comando en el primer byte",
  "Subscribe → Wait Notif → Transform (hexSlice, offset=0, length=1, output=cmd_byte) → If (variable=cmd_byte, =, 0xAA).":
    "Subscribe → Wait Notif → Transform (hexSlice, offset=0, length=1, output=cmd_byte) → If (variable=cmd_byte, =, <code>0xAA</code>).",
  // Node: Payload Parser
  "Parse a packet into named fields.":
    "Analiza un paquete en campos con nombre.",
  Fields: "Campos",
  "Parses a hex payload into multiple named fields in one node — replaces a chain of Transform nodes when you have a structured packet with several offsets.":
    "Analiza un payload hex en varios campos con nombre en un solo nodo: sustituye una cadena de nodos Transform cuando tienes un paquete estructurado con varios offsets.",
  "One field per line: name offset length type [endian]. Types: hex, utf8, ascii, uint8/int8, uint16/int16, uint32/int32, float32, float64. length of 0 = to end. Endian (LE/BE) only required for multi-byte numeric types.":
    "Un campo por línea: <code>name  offset  length  type  [endian]</code>. Tipos: hex, utf8, ascii, uint8/int8, uint16/int16, uint32/int32, float32, float64. <code>length</code> de 0 = hasta el final. El endianness (LE/BE) solo es obligatorio para tipos numéricos de varios bytes.",
  "Sensor packet": "Paquete de sensor",
  "Read Char → Payload Parser: temp 0 2 int16 LE hum 2 1 uint8 flag 3 1 hex":
    "Read Char → Payload Parser:<br>temp 0 2 int16 LE<br>hum  2 1 uint8<br>flag 3 1 hex",
  // Node: Read RSSI
  "Read the current connection RSSI.": "Lee el RSSI actual de la conexión.",
  "Reads the current RSSI of the active connection. Stored in the lastRSSI runtime slot and (optionally) into a named variable.":
    "Lee el RSSI actual de la conexión activa. Se guarda en el espacio de ejecución <code>lastRSSI</code> y (opcionalmente) en una variable con nombre.",
  "Optional variable name.": "Nombre de variable opcional.",
  "Range check": "Comprobación de alcance",
  'Read RSSI → If (lastRSSI, <, -85) → true: HTTP "link weak".':
    'Read RSSI → If (lastRSSI, <, -85) → true: HTTP "enlace débil".',
  // Node: Read MTU
  "Read the negotiated ATT MTU.": "Lee el MTU ATT negociado.",
  "Reads the negotiated ATT MTU. macOS CoreBluetooth doesn't expose an API to request a specific MTU — this step just surfaces what the OS negotiated at connect time.":
    "Lee el MTU ATT negociado. CoreBluetooth de macOS no expone una API para <em>solicitar</em> un MTU concreto; este paso solo muestra lo que negoció el sistema al conectar.",
  "Optional variable name for the MTU integer.":
    "Nombre de variable opcional para el entero del MTU.",
  "Chunk sizing diagnostics": "Diagnóstico de tamaño de fragmento",
  "Connect → Read MTU (store as=mtu) → HTTP Request (body uses ${mtu}).":
    "Connect → Read MTU (store as=mtu) → HTTP Request (el body usa <code>${mtu}</code>).",
  // Node: HTTP Request
  "Send an HTTP request.": "Envía una solicitud HTTP.",
  "Sends an HTTP request to a URL with optional headers and body. Variables are interpolated with ${name}.":
    "Envía una solicitud HTTP a una URL con cabeceras y cuerpo opcionales. Las variables se interpolan con <code>${name}</code>.",
  URL: "URL",
  "Full URL with ${var} allowed.":
    "URL completa; se permite <code>${var}</code>.",
  Method: "Método",
  "GET / POST / PUT / DELETE / PATCH.": "GET / POST / PUT / DELETE / PATCH.",
  Headers: "Cabeceras",
  "Key: value pairs, one per line. Values support ${var}.":
    "Pares clave: valor, uno por línea. Los valores admiten <code>${var}</code>.",
  Body: "Cuerpo",
  "Raw body string. ${var} interpolation applies.":
    "Cadena de cuerpo en bruto. Se aplica la interpolación <code>${var}</code>.",
  "Ship a reading": "Enviar una lectura",
  'Read Char (store as=temp) → HTTP Request (POST https://api.x/ingest, body={"temp":${temp}}).':
    'Read Char (store as=temp) → HTTP Request (POST https://api.x/ingest, body=<code>{"temp":${temp}}</code>).',
  // Node: Append CSV
  "Append a row to a CSV file.": "Añade una fila a un archivo CSV.",
  "Appends a row to a CSV file on disk. Creates the file with the configured header on first run.":
    "Añade una fila a un archivo CSV en disco. Crea el archivo con la cabecera configurada en la primera ejecución.",
  "File path": "Ruta del archivo",
  "Absolute path to the CSV file.": "Ruta absoluta al archivo CSV.",
  Header: "Cabecera",
  "Comma-separated column names. Written once when the file is created.":
    "Nombres de columna separados por comas. Se escriben una vez al crear el archivo.",
  Row: "Fila",
  "Comma-separated values. ${var} interpolation applies.":
    "Valores separados por comas. Se aplica la interpolación <code>${var}</code>.",
  "Telemetry log": "Registro de telemetría",
  "Loop: Read RSSI → Append CSV (header=ts,rssi, row=${now},${rssi}).":
    "Bucle: Read RSSI → Append CSV (header=<code>ts,rssi</code>, row=<code>${now},${rssi}</code>).",
  // Node: Save File
  "Write a payload to disk in one shot.":
    "Escribe un payload en disco de una sola vez.",
  "Writes a payload to disk in one shot (overwrites if exists). Use for snapshots, not append-style logs.":
    "Escribe un payload en disco de una sola vez (sobrescribe si existe). Úsalo para instantáneas, no para registros de tipo añadido.",
  "Absolute path to the destination.": "Ruta absoluta al destino.",
  Content: "Contenido",
  "Raw text content with ${var} interpolation.":
    "Contenido de texto en bruto con interpolación <code>${var}</code>.",
  "Dump last read": "Volcar la última lectura",
  "Read Char → Save File (path=/tmp/last.bin, content=${lastReadHex}).":
    "Read Char → Save File (path=<code>/tmp/last.bin</code>, content=<code>${lastReadHex}</code>).",
  // Request a node
  "Don't see the node you need?": "¿No ves el nodo que necesitas?",
  "Signal Hub is shaped by the engineers who use it. Tell me what step is missing from your workflow and I'll prioritize it for the next release.":
    "Signal Hub lo moldean los ingenieros que lo usan. Dime qué paso le falta a tu flujo y lo priorizaré para la próxima versión.",
  "Request a node →": "Solicitar un nodo →",
  // Demo
  "See it move": "Míralo en movimiento",
  "A 60-second tour.": "Un recorrido de 60 segundos.",
  "Concurrent connections, workflows, simulator, export — all in motion. The fastest way to feel what Signal Hub actually does.":
    "Conexiones concurrentes, flujos, simulador, exportación: todo en movimiento. La forma más rápida de sentir lo que Signal Hub hace de verdad.",
  "Signal Hub 1.0.1 — recorded on macOS Sonoma":
    "Signal Hub 1.0.1 — grabado en macOS Sonoma",
  // CTA
  "Build with BLE, finally enjoyable.":
    "Desarrollar con BLE, por fin disfrutable.",
  "Signal Hub is in private beta on macOS. If you spend your days talking to BLE peripherals, we'd love to hand you the keys.":
    "Signal Hub está en beta privada en macOS. Si pasas los días hablando con periféricos BLE, nos encantaría darte las llaves.",
  "Request beta access": "Solicitar acceso beta",
  "Back to the blog": "Volver al blog",
  // Footer
  "Designed & built by Uy Nguyen — crafted for engineers who live in the BLE stack.":
    "Diseñado y desarrollado por <a href='/'>Uy Nguyen</a>, hecho para ingenieros que viven en la pila BLE.",
  Blog: "Blog",
  Archives: "Archivo",
  Contact: "Contacto",
};

/* ===================== Português ===================== */
SH_TRANSLATIONS.pt = {
  // Nav
  Connect: "Conectar",
  Workflows: "Fluxos",
  Simulate: "Simular",
  Export: "Exportar",
  Demo: "Demo",
  "Get Signal Hub": "Obter o Signal Hub",
  // Hero
  "BLE Testing · Workflow Automation · Device Simulator · macOS":
    "Testes BLE · Automação de fluxos · Simulador de dispositivos · macOS",
  "The BLE workbench, reimagined for Mac.":
    "A bancada de trabalho BLE,<br><span class='accent'>reinventada para o Mac.</span>",
  "Signal Hub is a Mac app for Bluetooth Low Energy (BLE) testing and automation. Scan and connect to many BLE devices at once, build visual workflows that run on real hardware, simulate peripherals when the prototype hasn't shipped, and export PNG / video documentation — all from one elegant macOS app.":
    "O Signal Hub é um <strong>app de Mac para testes e automação de Bluetooth Low Energy (BLE)</strong>. Escaneie e conecte-se a vários dispositivos BLE de uma vez, crie fluxos de trabalho visuais que rodam em hardware real, simule periféricos quando o protótipo ainda não chegou e exporte documentação em PNG / vídeo — tudo em um elegante app de macOS.",
  "Download for macOS →": "Baixar para macOS →",
  "Watch demo →": "Ver demo →",
  // Feature 1
  "Concurrent BLE": "BLE concorrente",
  "Many devices. One calm cockpit.":
    "Muitos dispositivos.<br>Um cockpit tranquilo.",
  "Signal Hub treats every BLE connection as a first-class citizen. Scan the room, connect to multiple peripherals in parallel, and switch between them without losing context. Read, write, and subscribe to characteristics with one click — and watch traffic stream in real time.":
    "O Signal Hub trata cada conexão BLE como cidadã de primeira classe. Escaneie o ambiente, conecte-se a vários periféricos em paralelo e alterne entre eles sem perder o contexto. Leia, escreva e inscreva-se em características com um clique — e acompanhe o tráfego em tempo real.",
  "Concurrent scan & connect across as many devices as your radio can hold":
    "Escaneamento e conexão concorrentes em quantos dispositivos o seu rádio suportar",
  "Per-device sessions with live characteristic explorer and notification stream":
    "Sessões por dispositivo com explorador de características ao vivo e fluxo de notificações",
  "Smart filters: name, RSSI, service UUID, manufacturer data":
    "Filtros inteligentes: nome, RSSI, UUID de serviço, dados do fabricante",
  "Auto-reconnect, pairing, and bond management built in":
    "Reconexão automática, pareamento e gestão de vínculos integrados",
  Scan: "Escanear",
  "GATT explorer": "Explorador GATT",
  Notifications: "Notificações",
  // Feature 2
  "Visual workflows": "Fluxos visuais",
  "Your test plan, drawn into reality.":
    "Seu plano de testes,<br>desenhado em realidade.",
  "Drag, drop, and connect nodes to compose any BLE flow — handshake, OTA, telemetry, edge cases. Each node is a real BLE action. Hit run, and Signal Hub executes the entire workflow against your device, with full visibility into every step.":
    "Arraste, solte e conecte nós para compor qualquer fluxo BLE — handshake, OTA, telemetria, casos extremos. Cada nó é uma ação BLE real. Clique em executar e o Signal Hub executa todo o fluxo no seu dispositivo, com total visibilidade de cada passo.",
  "Composable nodes: scan, connect, write, read, wait, branch, assert":
    "Nós combináveis: escanear, conectar, escrever, ler, esperar, ramificar, verificar",
  "Loop, retry, and conditional logic without writing a line of code":
    "Laços, novas tentativas e lógica condicional sem escrever uma linha de código",
  "Run once or schedule for regression — the workflow is the spec":
    "Execute uma vez ou agende para regressão — o fluxo é a especificação",
  "Version-controlled workspaces keep the team in sync":
    "Espaços de trabalho com controle de versão mantêm a equipe sincronizada",
  // Feature 2b
  Workspaces: "Espaços de trabalho",
  "A home for every project.": "Um lar<br>para cada projeto.",
  "Organize devices, workflows, and notes into workspaces. Each one is a self-contained context — switch projects with a click. Share a workspace with a teammate and they pick up exactly where you left off.":
    "Organize dispositivos, fluxos e notas em <strong>espaços de trabalho</strong>. Cada um é um contexto independente — troque de projeto com um clique. Compartilhe um espaço com um colega e ele continua exatamente de onde você parou.",
  "Per-workspace devices, workflows, and assets":
    "Dispositivos, fluxos e recursos por espaço de trabalho",
  "Local-first storage with export anywhere":
    "Armazenamento local em primeiro lugar, com exportação para qualquer lugar",
  "Built for teams: open the same workspace, get the same view":
    "Feito para equipes: abra o mesmo espaço e tenha a mesma visão",
  // Feature 3
  "Live binding": "Vinculação ao vivo",
  "Bind real devices to every node — live.":
    "Vincule dispositivos reais<br>a cada nó — ao vivo.",
  "Connect a workflow to physical hardware in seconds. Pick a discovered peripheral, bind it to a node, and watch the workflow drive the device for real — no scripts, no fixtures, no detours through a terminal.":
    "Conecte um fluxo a hardware físico em segundos. Escolha um periférico descoberto, vincule-o a um nó e veja o fluxo controlar o dispositivo de verdade — sem scripts, sem montagens, sem desvios por um terminal.",
  "Real-time binding of any discovered peripheral to any node":
    "Vinculação em tempo real de qualquer periférico descoberto a qualquer nó",
  "Inspect responses, latency, and characteristic values as the workflow runs":
    "Inspecione respostas, latência e valores de características enquanto o fluxo é executado",
  "Step through, pause, and re-run — debug like you would code":
    "Avance passo a passo, pause e reexecute — depure como faria com código",
  // Feature 4
  "Built-in simulator": "Simulador integrado",
  "No hardware? No problem.": "Sem hardware?<br>Sem problema.",
  "The built-in BLE simulator stands in for any peripheral. Mock services, characteristics, and responses — including the gnarly edge cases that real hardware refuses to reproduce. Build, test, and demo your workflows before the prototype hits your desk.":
    "O simulador BLE integrado substitui qualquer periférico. Simule serviços, características e respostas — incluindo os casos extremos cabeludos que o hardware real se recusa a reproduzir. Crie, teste e demonstre seus fluxos antes de o protótipo chegar à sua mesa.",
  "Define virtual peripherals with any service / characteristic shape":
    "Defina periféricos virtuais com qualquer estrutura de serviço / característica",
  "Scripted responses, delays, and failure modes — reproduce real bugs on demand":
    "Respostas roteirizadas, atrasos e modos de falha — reproduza bugs reais sob demanda",
  "Mix and match: real devices and simulated ones in the same workflow":
    "Combine à vontade: dispositivos reais e simulados no mesmo fluxo",
  "Mock services": "Serviços simulados",
  "Scripted responses": "Respostas roteirizadas",
  "Edge cases": "Casos extremos",
  // Feature 5
  "Share & document": "Compartilhe e documente",
  "Beautiful artifacts, one click away.": "Artefatos lindos,<br>a um clique.",
  "Export any workflow as a high-resolution PNG, a screen recording, or a compact summary — ready to drop into a PR, a spec, or a customer report. Documentation becomes a by-product of building, not a chore.":
    "Exporte qualquer fluxo como um PNG de alta resolução, uma gravação de tela ou um resumo compacto — pronto para incluir em um PR, uma especificação ou um relatório para o cliente. A documentação vira um subproduto da construção, não uma tarefa chata.",
  "One-click PNG export with crisp typography and clear edges":
    "Exportação PNG com um clique, com tipografia nítida e bordas claras",
  "Video export of a live workflow run for demos and bug reports":
    "Exportação em vídeo de uma execução ao vivo para demos e relatórios de bugs",
  "Auto-generated run summaries: steps, timings, outcomes":
    "Resumos de execução gerados automaticamente: passos, tempos, resultados",
  "PNG export": "Exportação PNG",
  "Workflows rendered at retina resolution, ready for documentation, PRs, or slide decks.":
    "Fluxos renderizados em resolução retina, prontos para documentação, PRs ou apresentações.",
  "Video capture": "Captura de vídeo",
  "Record a live run with all device traffic overlaid. Perfect for demos and bug reports.":
    "Grave uma execução ao vivo com todo o tráfego do dispositivo sobreposto. Perfeito para demos e relatórios de bugs.",
  "Run summaries": "Resumos de execução",
  "Every workflow run produces a structured summary — steps, timing, results, errors.":
    "Cada execução de fluxo produz um resumo estruturado — passos, tempo, resultados, erros.",
  "Concurrent devices": "Dispositivos concorrentes",
  "Lines of code required": "Linhas de código necessárias",
  "Local-first": "Local em primeiro lugar",
  "PNG & video export": "Exportação PNG e vídeo",
  // Nodes header
  "Workflow nodes": "Nós de fluxo",
  "53 building blocks. One workflow.": "53 blocos de construção.<br>Um fluxo.",
  "Each node is a single BLE action — scan, connect, read, branch, wait. Snap them together on the canvas and you've described a complete protocol exchange, ready to run on a real device or the built-in simulator.":
    "Cada nó é uma única ação BLE — escanear, conectar, ler, ramificar, esperar. Encaixe-os no canvas e você terá descrito uma troca de protocolo completa, pronta para rodar em um dispositivo real ou no simulador integrado.",
  "Show all nodes": "Mostrar todos os nós",
  "Hide all nodes": "Ocultar todos os nós",
  // Category headers
  "Control — 3 nodes": "Controle — 3 nós",
  "Triggers — 6 nodes": "Gatilhos — 6 nós",
  "Scan — 2 nodes": "Escaneamento — 2 nós",
  "Connection — 2 nodes": "Conexão — 2 nós",
  "Discovery — 2 nodes": "Descoberta — 2 nós",
  "Read / Write — 4 nodes": "Leitura / Escrita — 4 nós",
  "Notify — 2 nodes": "Notificação — 2 nós",
  "Flow — 9 nodes": "Fluxo — 9 nós",
  "Logic — 3 nodes": "Lógica — 3 nós",
  "Data — 3 nodes": "Dados — 3 nós",
  "Link — 2 nodes": "Enlace — 2 nós",
  "Egress — 3 nodes": "Saída — 3 nós",
  // Shared block heads
  Attributes: "Atributos",
  "Example use cases": "Exemplos de uso",
  // Node: Start
  "Entry point of the workflow.": "Ponto de entrada do fluxo.",
  "Entry point of the workflow. Exactly one Start node is allowed — execution begins here when you press Run.":
    "Ponto de entrada do fluxo. É permitido exatamente um nó Start — a execução começa aqui ao pressionar Run.",
  "Every workflow": "Todos os fluxos",
  "Drop a Start node, wire its output into your first real step (Start Scan, Connect, etc.). Without it, Run is disabled.":
    "Coloque um nó Start e conecte a saída dele ao seu primeiro passo real (Start Scan, Connect, etc.). Sem ele, o Run fica desabilitado.",
  // Node: End
  "Terminates a branch cleanly.": "Encerra um ramo de forma limpa.",
  "Terminates a branch cleanly. Optional — branches that reach a dead end also stop, but End makes the intent explicit.":
    "Encerra um ramo de forma limpa. Opcional — ramos que chegam a um beco sem saída também param, mas o End torna a intenção explícita.",
  "Mark a success path": "Marcar um caminho de sucesso",
  'If/true → HTTP Request → End. The End makes "this branch is done" visible in the run log.':
    'If/true → HTTP Request → End. O End deixa "este ramo terminou" visível no log de execução.',
  // Node: On Device Discovered
  "Blocks until a matching advertisement is seen.":
    "Bloqueia até ver um anúncio correspondente.",
  "Blocks until a peripheral advertisement matches the configured filters (name substring, manufacturer-data hex prefix, RSSI threshold). Auto-starts a scan unless disabled.":
    "Bloqueia até que o anúncio de um periférico corresponda aos filtros configurados (substring do nome, prefixo hex dos dados do fabricante, limiar de RSSI). Inicia um escaneamento automaticamente, a menos que seja desativado.",
  "Name match": "Correspondência de nome",
  "Case-insensitive substring required in the advertised local name. Empty = don't filter on name.":
    "Substring sem distinção de maiúsculas exigida no nome local anunciado. Vazio = não filtrar por nome.",
  "Manufacturer (hex)": "Fabricante (hex)",
  "Hex prefix the device's manufacturer data must start with. Common pattern: 4C00 for Apple beacons.":
    "Prefixo hex com que os dados do fabricante do dispositivo devem começar. Padrão comum: <code>4C00</code> para beacons da Apple.",
  "Min RSSI": "RSSI mínimo",
  "Drop advertisements weaker than this dBm value. Off = no threshold.":
    "Descarta anúncios mais fracos que este valor em dBm. Desligado = sem limiar.",
  "Auto scan": "Escaneamento automático",
  "When on, starts a scan on entry and stops it on match. Turn off if an upstream Start Scan already configured filters.":
    "Quando ligado, inicia um escaneamento ao entrar e o para ao corresponder. Desligue se um Start Scan anterior já configurou os filtros.",
  "Timeout (s)": "Tempo limite (s)",
  "Maximum wait. Empty = wait forever.":
    "Espera máxima. Vazio = esperar para sempre.",
  "Store as": "Salvar como",
  "Optional variable that receives the matched device address.":
    "Variável opcional que recebe o endereço do dispositivo correspondente.",
  "Wait for a known sensor": "Esperar um sensor conhecido",
  "On Device Discovered (name=SignalHub, rssi ≥ -75) → Connect (uses stored mac).":
    "On Device Discovered (name=<code>SignalHub</code>, rssi ≥ -75) → Connect (usa a mac salva).",
  // Node: On Device Connected
  "Blocks until a connect event fires.":
    "Bloqueia até que um evento de conexão dispare.",
  "Blocks until a connect event fires. Optionally filters by mac so the trigger only resumes when a specific device comes online.":
    "Bloqueia até que um evento de conexão dispare. Opcionalmente filtra por mac para que o gatilho só prossiga quando um dispositivo específico ficar online.",
  "Device address": "Endereço do dispositivo",
  "Optional mac. Empty = match any connect.":
    "Mac opcional. Vazio = corresponder a qualquer conexão.",
  "Optional variable that receives the connected device address.":
    "Variável opcional que recebe o endereço do dispositivo conectado.",
  "Coordinate with external connect": "Coordenar com uma conexão externa",
  "On Device Connected (mac=AA:BB:…) → Discover Services → Read Char.":
    "On Device Connected (mac=<code>AA:BB:…</code>) → Discover Services → Read Char.",
  // Node: On Device Disconnected
  "Blocks until a disconnect event fires.":
    "Bloqueia até que um evento de desconexão dispare.",
  "Blocks until a disconnect event fires. Used to react to peripherals dropping the link without polling.":
    "Bloqueia até que um evento de desconexão dispare. Usado para reagir a periféricos que perdem o enlace sem sondagem contínua.",
  "Optional mac. Empty = match any disconnect.":
    "Mac opcional. Vazio = corresponder a qualquer desconexão.",
  "Optional variable receiving the disconnected mac.":
    "Variável opcional que recebe a mac desconectada.",
  "Telemetry on drop": "Telemetria ao cair o enlace",
  "On Device Disconnected → HTTP Request (alert).":
    "On Device Disconnected → HTTP Request (alerta).",
  // Node: On Notification
  "Blocks until a matching notification arrives.":
    "Bloqueia até que chegue uma notificação correspondente.",
  "Blocks until a characteristic notification matches the optional hex prefix. Auto-subscribes to the characteristic before listening so a separate Subscribe step isn't required.":
    "Bloqueia até que a notificação de uma característica corresponda ao prefixo hex opcional. Inscreve-se automaticamente na característica antes de escutar, então não é preciso um passo Subscribe separado.",
  "Characteristic UUID": "UUID da característica",
  "Target characteristic. Must be notifiable or indicatable.":
    "Característica alvo. Deve suportar notificação ou indicação.",
  "Match prefix (hex)": "Prefixo de correspondência (hex)",
  "Optional hex prefix the payload must start with. Empty = match any notification.":
    "Prefixo hex opcional com que o payload deve começar. Vazio = corresponder a qualquer notificação.",
  "Optional variable that receives the matched payload as hex.":
    "Variável opcional que recebe o payload correspondente em hex.",
  "Wait for boot notification": "Esperar a notificação de inicialização",
  "Connect → On Notification (uuid=…, match=AA01) → continue.":
    "Connect → On Notification (uuid=…, match=<code>AA01</code>) → continuar.",
  // Node: Timer
  "Wait on a delay, interval, or exact date.":
    "Espera por um atraso, intervalo ou data exata.",
  "Waits on a time condition before continuing. After delay = one-shot wait. Interval = self-looping periodic tick that runs forever until stopped. Exact date = wait until an ISO-8601 timestamp.":
    "Espera uma condição de tempo antes de continuar. <strong>After delay</strong> = espera única. <strong>Interval</strong> = pulso periódico que se repete indefinidamente até ser parado. <strong>Exact date</strong> = espera até um carimbo de tempo ISO-8601.",
  Mode: "Modo",
  "After delay: wait N seconds, then take edge 1 once. Interval: fire repeatedly on each N-second boundary. Exact date: wait until ISO-8601 timestamp.":
    "After delay: espera N segundos e toma o edge 1 uma vez. Interval: dispara repetidamente a cada limite de N segundos. Exact date: espera até o carimbo de tempo ISO-8601.",
  Seconds: "Segundos",
  "Delay or interval length for After / Interval modes.":
    "Duração do atraso ou intervalo para os modos After / Interval.",
  "Date (ISO-8601)": "Data (ISO-8601)",
  "Used in Exact date mode (e.g. 2026-12-31T23:00:00Z). Past dates fire immediately.":
    "Usado no modo Exact date (ex.: <code>2026-12-31T23:00:00Z</code>). Datas no passado disparam imediatamente.",
  Name: "Nome",
  "Optional identifier referenced by a Stop Timer node. Defaults to the node's label.":
    "Identificador opcional referenciado por um nó Stop Timer. O padrão é o rótulo do nó.",
  "Forever-periodic poll": "Sondagem periódica perpétua",
  "Start → Timer (interval, 5s) → Read Char. The Read fires every 5s; press Stop to end the workflow.":
    "Start → Timer (interval, 5s) → Read Char. A leitura dispara a cada 5 s; pressione Stop para encerrar o fluxo.",
  "Bounded periodic poll": "Sondagem periódica limitada",
  "Repeat (10) → Timer (after, 5s) → Read Char. Body executes exactly 10 times spaced 5s apart.":
    "Repeat (10) → Timer (after, 5s) → Read Char. O corpo executa exatamente 10 vezes, espaçadas de 5 s.",
  "Scheduled run": "Execução agendada",
  "Start → Timer (exactDate, 2026-12-31T23:00:00Z) → Start Scan → …":
    "Start → Timer (exactDate, <code>2026-12-31T23:00:00Z</code>) → Start Scan → …",
  // Node: Stop Timer
  "Cancels a running Timer by name.": "Cancela um Timer em execução pelo nome.",
  "Cancels a running Timer node addressed by name. The targeted timer's pending wait is disposed immediately, no more ticks fire. Other branches and timers keep running.":
    "Cancela um nó Timer em execução identificado pelo nome. A espera pendente desse timer é descartada imediatamente e nenhum outro pulso dispara. Outros ramos e timers continuam rodando.",
  "Timer name": "Nome do Timer",
  "Must match the target Timer node's Name field. Stopping by name lets one workflow run many timers and cancel them independently.":
    "Deve corresponder ao campo Name do nó Timer alvo. Parar pelo nome permite que um fluxo rode muitos timers e os cancele de forma independente.",
  "Stop on condition": "Parar conforme condição",
  "Timer (name=poll, interval, 5s) → Read Char → If (battery, <, 5) → true: Stop Timer (poll) → HTTP alert.":
    "Timer (name=poll, interval, 5s) → Read Char → If (battery, <, 5) → true: Stop Timer (poll) → alerta HTTP.",
  "Race two timers": "Disputar entre dois timers",
  "Parallel → branch 1: Timer (name=A, interval, 1s) → … ; branch 2: Timer (name=B, after, 30s) → Stop Timer (A). After 30s the fast poller stops.":
    "Parallel → ramo 1: Timer (name=A, interval, 1s) → … ; ramo 2: Timer (name=B, after, 30s) → Stop Timer (A). Após 30 s, a sondagem rápida para.",
  // Node: Start Scan
  "Begins a BLE scan asynchronously.":
    "Inicia um escaneamento BLE de forma assíncrona.",
  "Begins a BLE scan. Continues running asynchronously; subsequent steps execute immediately without waiting for results.":
    "Inicia um escaneamento BLE. Continua rodando de forma assíncrona; os passos seguintes executam imediatamente sem esperar pelos resultados.",
  "Service UUID": "UUID de serviço",
  "Optional. When set, only devices advertising this service appear in scan results. Empty = scan everything.":
    "Opcional. Quando definido, apenas dispositivos que anunciam este serviço aparecem nos resultados. Vazio = escanear tudo.",
  "Allow duplicates": "Permitir duplicatas",
  "When on, the same device produces multiple advertisement events. Useful for live RSSI tracking; off for one-shot discovery.":
    "Quando ligado, o mesmo dispositivo gera vários eventos de anúncio. Útil para acompanhar o RSSI ao vivo; desligado para uma descoberta única.",
  "Find a known device by service":
    "Encontrar um dispositivo conhecido por serviço",
  "Start Scan (svc=180D) → Delay 3s → Stop Scan → Connect (mac from scan results).":
    "Start Scan (svc=180D) → Delay 3s → Stop Scan → Connect (mac dos resultados do escaneamento).",
  // Node: Stop Scan
  "Stops an in-progress scan.": "Para um escaneamento em andamento.",
  "Stops an in-progress scan. Pair with Start Scan when you want a bounded discovery window.":
    "Para um escaneamento em andamento. Combine com Start Scan quando quiser uma janela de descoberta limitada.",
  "Bounded scan": "Escaneamento limitado",
  "Start Scan → Delay 5s → Stop Scan. Without Stop Scan the radio keeps scanning until the workflow ends.":
    "Start Scan → Delay 5s → Stop Scan. Sem o Stop Scan, o rádio continua escaneando até o fluxo terminar.",
  // Node: Connect
  "Connects to a peripheral by MAC.": "Conecta-se a um periférico pelo MAC.",
  'Connects to a peripheral by MAC. Resolves on "connected" — i.e. CoreBluetooth fired didConnect and the link is up.':
    'Conecta-se a um periférico pelo MAC. Resolve em "connected" — ou seja, o CoreBluetooth disparou didConnect e o enlace está ativo.',
  Device: "Dispositivo",
  "Pick from the live device list (populated by Start Scan / known devices). The selected MAC becomes the workflow's active device for downstream BLE steps.":
    "Escolha na lista de dispositivos ao vivo (preenchida por Start Scan / dispositivos conhecidos). O MAC selecionado se torna o dispositivo ativo do fluxo para os passos BLE seguintes.",
  "Connect then read": "Conectar e depois ler",
  "Connect (chosen device) → Discover Services → Read Char (battery level).":
    "Connect (dispositivo escolhido) → Discover Services → Read Char (nível de bateria).",
  "Reconnect on disconnect": "Reconectar ao desconectar",
  "Try/Catch around Connect. On the catch path, Delay 1s → Connect again.":
    "Try/Catch em volta do Connect. No caminho catch, Delay 1s → Connect de novo.",
  // Node: Disconnect
  "Closes the active connection.": "Fecha a conexão ativa.",
  "Closes the active connection. Always good practice at the end of a workflow so the peripheral is free for other apps.":
    "Fecha a conexão ativa. Sempre uma boa prática no fim de um fluxo para que o periférico fique livre para outros apps.",
  "Defaults to the active device. Override only if you've connected to multiple peripherals in the same workflow.":
    "O padrão é o dispositivo ativo. Substitua apenas se você se conectou a vários periféricos no mesmo fluxo.",
  "Clean teardown": "Encerramento limpo",
  "… → Read Char → Disconnect → End.": "… → Read Char → Disconnect → End.",
  // Node: Discover Services
  "Enumerate the peripheral's services.": "Enumera os serviços do periférico.",
  "Asks the peripheral to enumerate its services. Required before reading/writing characteristics on most devices.":
    "Pede ao periférico que enumere seus serviços. Necessário antes de ler/escrever características na maioria dos dispositivos.",
  "Standard prep": "Preparação padrão",
  "Connect → Discover Services → Discover Characteristics → Read Char.":
    "Connect → Discover Services → Discover Characteristics → Read Char.",
  // Node: Discover Characteristics
  "Enumerate characteristics under each service.":
    "Enumera as características de cada serviço.",
  "Enumerates the characteristics under each discovered service. Run after Discover Services.":
    "Enumera as características de cada serviço descoberto. Execute após Discover Services.",
  "Walk the GATT": "Percorrer o GATT",
  "Connect → Discover Services → Discover Characteristics. Now Read/Write/Subscribe can target any UUID.":
    "Connect → Discover Services → Discover Characteristics. Agora Read/Write/Subscribe podem mirar qualquer UUID.",
  // Node: Read Char
  "Read a characteristic's current value.":
    "Lê o valor atual de uma característica.",
  "Reads the current value of a characteristic. Resolves with raw bytes; the bytes are stored in lastReadHex and (optionally) into a named variable.":
    "Lê o valor atual de uma característica. Resolve com bytes brutos; os bytes são salvos em <code>lastReadHex</code> e (opcionalmente) em uma variável nomeada.",
  "Standard short (0x2A19) or 128-bit UUID. The picker fills this in from the discovered list.":
    "UUID curto padrão (<code>0x2A19</code>) ou de 128 bits. O seletor preenche isso a partir da lista descoberta.",
  "Value format / endian": "Formato do valor / endianness",
  "How the result is decoded for display on the node card. Doesn't change lastReadHex — only the human-readable view.":
    "Como o resultado é decodificado para exibição no cartão do nó. Não altera <code>lastReadHex</code> — apenas a visualização legível.",
  "Optional variable name. The decoded value is stored under this name for use by downstream If / Transform steps.":
    "Nome de variável opcional. O valor decodificado é salvo com este nome para uso pelos passos If / Transform seguintes.",
  "Battery snapshot": "Instantâneo da bateria",
  "Connect → Discover … → Read Char (0x2A19, format=UInt8, store as=battery).":
    "Connect → Discover … → Read Char (<code>0x2A19</code>, format=UInt8, store as=battery).",
  "Conditional logic": "Lógica condicional",
  'Read Char → If (variable=battery, <, 20) → HTTP Request ("low battery").':
    'Read Char → If (variable=battery, <, 20) → HTTP Request ("bateria fraca").',
  // Node: Write Char
  "Write bytes to a characteristic.": "Escreve bytes em uma característica.",
  "Writes bytes to a characteristic. Supports hex (DE AD) or text payloads, and chooses write-with/without-response automatically based on the characteristic's properties.":
    "Escreve bytes em uma característica. Suporta payloads em hex (<code>DE AD</code>) ou texto e escolhe escrita com/sem resposta automaticamente, conforme as propriedades da característica.",
  "Target characteristic.": "Característica alvo.",
  Payload: "Payload",
  "Hex bytes (DE AD BE EF) or ${var} interpolations. The executor chunks payloads larger than the negotiated MTU automatically.":
    "Bytes hex (<code>DE AD BE EF</code>) ou interpolações <code>${var}</code>. O executor fragmenta automaticamente payloads maiores que o MTU negociado.",
  "Wake a sensor": "Despertar um sensor",
  "Connect → Discover … → Write Char (0xFF03, payload=01).":
    "Connect → Discover … → Write Char (<code>0xFF03</code>, payload=<code>01</code>).",
  "Send a variable": "Enviar uma variável",
  "Set Variable (cmd=AA01) → Write Char (payload=${cmd}).":
    "Set Variable (cmd=<code>AA01</code>) → Write Char (payload=<code>${cmd}</code>).",
  // Node: Read Descriptor
  "Read a GATT descriptor value.": "Lê o valor de um descritor GATT.",
  "Reads a GATT descriptor (e.g. Characteristic User Description 0x2901, Format 0x2904, or the current notify-state bits in the CCCD 0x2902).":
    "Lê um descritor GATT (ex.: Characteristic User Description <code>0x2901</code>, Format <code>0x2904</code>, ou os bits de estado de notificação atuais no CCCD <code>0x2902</code>).",
  "Parent characteristic.": "Característica pai.",
  "Descriptor UUID": "UUID do descritor",
  "Standard short (0x2901, 0x2902, 0x2904) or 128-bit UUID.":
    "UUID curto padrão (<code>0x2901</code>, <code>0x2902</code>, <code>0x2904</code>) ou de 128 bits.",
  "Decoding for the result display.":
    "Decodificação para a exibição do resultado.",
  "Read a friendly name": "Ler um nome amigável",
  "Read Descriptor (char=…, desc=0x2901, format=text).":
    "Read Descriptor (char=…, desc=<code>0x2901</code>, format=text).",
  // Node: Write Descriptor
  "Write to a GATT descriptor (not CCCD).":
    "Escreve em um descritor GATT (não o CCCD).",
  "Writes bytes to a writable GATT descriptor. ⚠️ macOS blocks writes to the CCCD (0x2902) — use Subscribe instead. Useful for the rare devices that expose other writable descriptors.":
    "Escreve bytes em um descritor GATT gravável. ⚠️ O macOS bloqueia escritas no CCCD (<code>0x2902</code>) — use Subscribe em vez disso. Útil para os raros dispositivos que expõem outros descritores graváveis.",
  "Target descriptor — anything other than 0x2902.":
    "Descritor alvo — qualquer um diferente de <code>0x2902</code>.",
  "Payload (hex)": "Payload (hex)",
  "Bytes to write.": "Bytes a escrever.",
  "Set custom config": "Definir uma configuração personalizada",
  "Write Descriptor (char=…, desc=0xFFD1, payload=01).":
    "Write Descriptor (char=…, desc=<code>0xFFD1</code>, payload=<code>01</code>).",
  // Node: Subscribe
  "Enable notifications on a characteristic.":
    "Ativa notificações em uma característica.",
  "Enables notifications/indications on a characteristic. Subsequent notifications populate lastReadHex and fire Wait Notification steps.":
    "Ativa notificações/indicações em uma característica. As notificações seguintes preenchem <code>lastReadHex</code> e disparam os passos Wait Notification.",
  "Live stream": "Transmissão ao vivo",
  "Subscribe (heart rate) → Wait Notification (5s) → Set Variable (hr = lastReadHex). Loop with Repeat.":
    "Subscribe (frequência cardíaca) → Wait Notification (5s) → Set Variable (hr = lastReadHex). Repita com Repeat.",
  // Node: Unsubscribe
  "Turn off notifications for a characteristic.":
    "Desativa as notificações de uma característica.",
  "Turns off notifications for a characteristic. Useful when a workflow has multiple subscribe/unsubscribe phases.":
    "Desativa as notificações de uma característica. Útil quando um fluxo tem várias fases de inscrição/cancelamento.",
  "Same UUID as the Subscribe step you want to stop.":
    "O mesmo UUID do passo Subscribe que você quer parar.",
  "Bounded listen window": "Janela de escuta limitada",
  "Subscribe → Delay 10s → Unsubscribe → Disconnect.":
    "Subscribe → Delay 10s → Unsubscribe → Disconnect.",
  // Node: Repeat
  "Loop N times, then take the exit edge.":
    "Repete N vezes e depois toma o edge de saída.",
  "Loops its first output edge N times, then takes the second output (exit) once. Body executions are numbered (#1, #2, …) in the run log.":
    "Repete o primeiro edge de saída N vezes e depois toma a segunda saída (saída) uma vez. As execuções do corpo são numeradas (<code>#1</code>, <code>#2</code>, …) no log.",
  Times: "Vezes",
  "Number of iterations of the body branch before falling through to the exit branch.":
    "Número de iterações do ramo do corpo antes de passar para o ramo de saída.",
  "Poll a value": "Sondar um valor",
  "Repeat (10) → body: Read Char → Delay 1s. Exit: Disconnect.":
    "Repeat (10) → corpo: Read Char → Delay 1s. Saída: Disconnect.",
  // Node: Delay
  "Pause this branch for N seconds.": "Pausa este ramo por N segundos.",
  "Pauses the branch for a fixed duration. Other parallel branches keep running.":
    "Pausa o ramo por uma duração fixa. Os outros ramos paralelos continuam rodando.",
  "Duration (s)": "Duração (s)",
  "Seconds to wait before continuing. Floats are fine (0.25 = 250 ms).":
    "Segundos a esperar antes de continuar. Decimais são aceitos (0.25 = 250 ms).",
  "Settle after connect": "Estabilizar após conectar",
  "Connect → Delay 0.5s → Discover Services (some peripherals need a beat).":
    "Connect → Delay 0.5s → Discover Services (alguns periféricos precisam de um instante).",
  // Node: Parallel
  "Fan out into concurrent branches.": "Ramifica-se em ramos concorrentes.",
  "Fans out into multiple branches that run concurrently. Each outgoing edge starts its own execution token.":
    "Ramifica-se em vários ramos que rodam ao mesmo tempo. Cada edge de saída inicia seu próprio token de execução.",
  "Read two characteristics at once": "Ler duas características ao mesmo tempo",
  "Parallel → branch 1: Read Char A; branch 2: Read Char B → Join (waits for both).":
    "Parallel → ramo 1: Read Char A; ramo 2: Read Char B → Join (espera por ambos).",
  // Node: Join
  "Wait for every incoming branch.": "Espera por todos os ramos de entrada.",
  "Counterpart to Parallel: waits until every incoming edge has delivered a token before continuing downstream.":
    "Contraparte do Parallel: espera até que cada edge de entrada tenha entregue um token antes de continuar.",
  "Fan-out / fan-in": "Ramificação / junção",
  "Parallel → 3 branches do Read/Read/HTTP → Join → continue.":
    "Parallel → 3 ramos fazem Read/Read/HTTP → Join → continuar.",
  // Node: Try / Catch
  "Recover from failures on a branch.": "Recupere-se de falhas em um ramo.",
  "Wraps its protected branch (edge 0). If any downstream step on that branch fails, execution jumps to the catch branch (edge 1) instead of failing the workflow.":
    "Envolve o ramo protegido (edge 0). Se qualquer passo seguinte desse ramo falhar, a execução salta para o ramo catch (edge 1) em vez de falhar o fluxo.",
  "Reconnect on transient failure": "Reconectar em falha transitória",
  "Try/Catch → protected: Read Char; catch: Delay 1s → Connect → Read Char again.":
    "Try/Catch → protegido: Read Char; catch: Delay 1s → Connect → Read Char de novo.",
  // Node: Retry
  "Retry a branch up to N attempts.": "Repete um ramo em até N tentativas.",
  "Wraps a branch in a retry loop. If anything downstream of edge 0 errors, the executor delays then re-enters edge 0 — up to attempts total tries before falling through to edge 1 (the give-up branch).":
    "Envolve um ramo em um laço de novas tentativas. Se algo após o edge 0 der erro, o executor espera e reentra no edge 0 — até <code>attempts</code> tentativas no total antes de passar para o edge 1 (o ramo de desistência).",
  Attempts: "Tentativas",
  "Total tries (1 = no retry; the branch runs once and any failure falls through immediately).":
    "Total de tentativas (1 = sem repetição; o ramo roda uma vez e qualquer falha passa imediatamente).",
  "Backoff (s)": "Espera entre tentativas (s)",
  "Delay applied before each retry. Doesn't apply before the first attempt.":
    "Atraso aplicado antes de cada nova tentativa. Não se aplica antes da primeira tentativa.",
  "Reconnect on flaky link": "Reconectar em enlace instável",
  "Retry (3 attempts, 1s) → protected: Connect → Read; give-up: HTTP alert.":
    "Retry (3 tentativas, 1s) → protegido: Connect → Read; desistência: alerta HTTP.",
  // Node: Endless
  "Park a branch indefinitely.": "Mantém um ramo indefinidamente.",
  "Parks the current branch indefinitely. The workflow stays in the running state until the user hits Stop, so concurrent triggers (timer, on-notification, on-device-discovered) can keep firing. Has no outgoing edges.":
    "Mantém o ramo atual indefinidamente. O fluxo permanece em execução até o usuário pressionar Stop, de modo que os gatilhos concorrentes (timer, on-notification, on-device-discovered) podem continuar disparando. Não tem edges de saída.",
  "Notification-only flow": "Fluxo só de notificações",
  "Start → Connect → Subscribe → Endless. A parallel On Notification trigger reacts to inbound packets for as long as the run lasts.":
    "Start → Connect → Subscribe → Endless. Um gatilho On Notification paralelo reage aos pacotes recebidos enquanto durar a execução.",
  "Background poller": "Sondador em segundo plano",
  "Start → Timer (every 30s) → Read Char → Append CSV; in parallel: Endless. The Endless branch keeps the run alive so the timer keeps ticking.":
    "Start → Timer (a cada 30s) → Read Char → Append CSV; em paralelo: Endless. O ramo Endless mantém a execução viva para o timer continuar marcando.",
  // Node: If
  "Branch on a condition.": "Ramifica conforme uma condição.",
  "Branches on a condition. Edge 0 = true, edge 1 = false. Compares a Source (variable, last RSSI, last hex, isConnected) against a Right-hand value using the chosen operator.":
    "Ramifica conforme uma condição. Edge 0 = verdadeiro, edge 1 = falso. Compara uma fonte (variable, last RSSI, last hex, isConnected) com um valor da direita usando o operador escolhido.",
  Source: "Fonte",
  "What the left-hand value is: variable looks up a stored variable; lastRSSI / lastReadHex / isConnected use runtime state.":
    "O que é o valor da esquerda: <code>variable</code> busca uma variável salva; <code>lastRSSI</code> / <code>lastReadHex</code> / <code>isConnected</code> usam o estado de execução.",
  "Variable Name": "Nome da variável",
  "Only shown when Source = variable. The name to look up.":
    "Mostrado apenas quando Source = variable. O nome a buscar.",
  Operator: "Operador",
  "=, ≠, <, ≤, >, ≥, contains, starts with. Numeric ops parse both sides as numbers; others compare as strings.":
    "<code>=</code>, <code>≠</code>, <code><</code>, <code>≤</code>, <code>></code>, <code>≥</code>, <code>contains</code>, <code>starts with</code>. Operadores numéricos interpretam ambos os lados como números; os demais comparam como strings.",
  "Right-hand value": "Valor da direita",
  "Literal value (with ${var} interpolation). When both sides start with 0x they're auto-normalized for hex comparison.":
    "Valor literal (com interpolação <code>${var}</code>). Quando ambos os lados começam com <code>0x</code> eles são normalizados automaticamente para comparação em hex.",
  "Low-battery alert": "Alerta de bateria fraca",
  "Read Char (store as=battery) → If (variable=battery, <, 20) → true: HTTP Request.":
    "Read Char (store as=battery) → If (variable=battery, <, 20) → true: HTTP Request.",
  "Match a hex response": "Corresponder a uma resposta hex",
  "Subscribe → Wait Notification → If (lastReadHex, =, 0x AA 01) → true: continue.":
    "Subscribe → Wait Notification → If (lastReadHex, =, <code>0x AA 01</code>) → true: continuar.",
  // Node: Wait Notification
  "Block until a notification arrives.":
    "Bloqueia até que chegue uma notificação.",
  "Blocks the branch until a notification arrives on the characteristic, or the timeout elapses. The received bytes populate lastReadHex.":
    "Bloqueia o ramo até que chegue uma notificação na característica, ou o tempo limite expire. Os bytes recebidos preenchem <code>lastReadHex</code>.",
  "Must already be Subscribed.": "Deve já estar inscrita.",
  "Match (hex)": "Correspondência (hex)",
  "Optional. If set, ignore notifications that don't equal these bytes.":
    "Opcional. Se definido, ignora notificações que não sejam iguais a estes bytes.",
  "Maximum wait. Leave empty for no timeout.":
    "Espera máxima. Deixe vazio para não ter tempo limite.",
  "Optional variable name for the received bytes.":
    "Nome de variável opcional para os bytes recebidos.",
  "Wait for ack byte": "Esperar o byte de confirmação",
  "Write Char (cmd) → Wait Notification (match=0x AA, timeout=2) → If on lastReadHex.":
    "Write Char (cmd) → Wait Notification (match=<code>0x AA</code>, timeout=2) → If sobre lastReadHex.",
  // Node: Assert
  "Fail the branch if a condition is false.":
    "Faz o ramo falhar se uma condição for falsa.",
  "Checks a condition and fails the step if it's false. Same operand/operator semantics as the If node, but doesn't branch — it terminates the branch on failure (or jumps to the nearest Try/Catch / Retry catch edge).":
    "Verifica uma condição e faz o passo falhar se for falsa. Mesma semântica de operandos/operadores do nó If, mas não ramifica — encerra o ramo na falha (ou salta para o edge catch mais próximo de Try/Catch / Retry).",
  "Source / Operator / Value": "Fonte / Operador / Valor",
  "Same as If. Compares a variable, lastRSSI, lastReadHex, or isConnected against a literal value.":
    "Igual ao If. Compara uma variable, lastRSSI, lastReadHex ou isConnected com um valor literal.",
  Message: "Mensagem",
  "Optional human-readable message included in the failure entry. Defaults to the operand-vs-expected summary.":
    "Mensagem legível opcional incluída na entrada de falha. O padrão é o resumo de operando versus esperado.",
  "Guard before write": "Proteger antes de escrever",
  "Read MTU (store as=mtu) → Assert (variable=mtu, ≥, 100) → Write Char (large payload).":
    "Read MTU (store as=mtu) → Assert (variable=mtu, ≥, 100) → Write Char (payload grande).",
  "Sanity check protocol": "Verificação rápida do protocolo",
  "On Notification (store as=ack) → Assert (variable=ack, starts with, 0xAA01, msg=bad ack).":
    "On Notification (store as=ack) → Assert (variable=ack, starts with, <code>0xAA01</code>, msg=<code>bad ack</code>).",
  // Node: Set Variable
  "Store a value into a named variable.":
    "Salva um valor em uma variável nomeada.",
  "Stores a value into a named variable so later steps can reference it. The source can be a literal, another variable, last RSSI, last hex, or the connection state.":
    "Salva um valor em uma variável nomeada para que passos posteriores possam referenciá-lo. A fonte pode ser um literal, outra variável, last RSSI, last hex ou o estado da conexão.",
  "Destination. Pick something the If / Transform / payload steps will reference.":
    "Destino. Escolha algo que os passos If / Transform / payload irão referenciar.",
  "Where the value comes from: variable (literal or another variable), lastRSSI, lastReadHex, isConnected.":
    "De onde vem o valor: <code>variable</code> (literal ou outra variável), <code>lastRSSI</code>, <code>lastReadHex</code>, <code>isConnected</code>.",
  Literal: "Literal",
  "Only shown when Source = variable. If the text matches an existing variable name, that variable's value is used; otherwise it's stored as a literal string.":
    "Mostrado apenas quando Source = variable. Se o texto corresponder ao nome de uma variável existente, o valor dessa variável é usado; caso contrário, é salvo como string literal.",
  "Snapshot RSSI": "Capturar o RSSI",
  "Read RSSI → Set Variable (name=rssi_at_start, source=lastRSSI).":
    "Read RSSI → Set Variable (name=rssi_at_start, source=lastRSSI).",
  "Literal flag": "Sinalizador literal",
  "Set Variable (name=mode, source=variable, literal=night) → If (variable=mode, =, night).":
    "Set Variable (name=mode, source=variable, literal=<code>night</code>) → If (variable=mode, =, night).",
  // Node: Transform
  "Convert hex ↔ UInt / Float / UTF-8.": "Converte hex ↔ UInt / Float / UTF-8.",
  "Converts a hex string into a decoded value (UInt8 / UInt16 / Float / UTF-8 / sliced bytes) or vice versa. Reads from lastReadHex if no input variable is set.":
    "Converte uma string hex em um valor decodificado (UInt8 / UInt16 / Float / UTF-8 / bytes fatiados) ou vice-versa. Lê de <code>lastReadHex</code> se nenhuma variável de entrada for definida.",
  Operation: "Operação",
  "hexToUtf8 (auto-trims NUL / whitespace), utf8ToHex, hexToUInt8/16/Int16/Float32 (LE/BE), hexSlice (offset + length).":
    "hexToUtf8 (remove NUL / espaços automaticamente), utf8ToHex, hexToUInt8/16/Int16/Float32 (LE/BE), hexSlice (offset + comprimento).",
  Input: "Entrada",
  "Source variable name. Empty = use lastReadHex.":
    "Nome da variável de origem. Vazio = usar lastReadHex.",
  Output: "Saída",
  "Destination variable name. Required.":
    "Nome da variável de destino. Obrigatório.",
  "Offset / Length": "Offset / Comprimento",
  "For hexSlice only. Byte offset from the start, and how many bytes to keep (0 = to end).":
    "Apenas para hexSlice. Deslocamento de bytes a partir do início e quantos bytes manter (0 = até o fim).",
  "Decode a version string": "Decodificar uma string de versão",
  "Read Char → Transform (hexToUtf8, output=version) → If (variable=version, =, 3.4.4).":
    "Read Char → Transform (hexToUtf8, output=version) → If (variable=version, =, 3.4.4).",
  "First-byte command": "Comando no primeiro byte",
  "Subscribe → Wait Notif → Transform (hexSlice, offset=0, length=1, output=cmd_byte) → If (variable=cmd_byte, =, 0xAA).":
    "Subscribe → Wait Notif → Transform (hexSlice, offset=0, length=1, output=cmd_byte) → If (variable=cmd_byte, =, <code>0xAA</code>).",
  // Node: Payload Parser
  "Parse a packet into named fields.": "Analisa um pacote em campos nomeados.",
  Fields: "Campos",
  "Parses a hex payload into multiple named fields in one node — replaces a chain of Transform nodes when you have a structured packet with several offsets.":
    "Analisa um payload hex em vários campos nomeados em um único nó — substitui uma cadeia de nós Transform quando você tem um pacote estruturado com vários offsets.",
  "One field per line: name offset length type [endian]. Types: hex, utf8, ascii, uint8/int8, uint16/int16, uint32/int32, float32, float64. length of 0 = to end. Endian (LE/BE) only required for multi-byte numeric types.":
    "Um campo por linha: <code>name  offset  length  type  [endian]</code>. Tipos: hex, utf8, ascii, uint8/int8, uint16/int16, uint32/int32, float32, float64. <code>length</code> 0 = até o fim. O endianness (LE/BE) só é obrigatório para tipos numéricos de vários bytes.",
  "Sensor packet": "Pacote de sensor",
  "Read Char → Payload Parser: temp 0 2 int16 LE hum 2 1 uint8 flag 3 1 hex":
    "Read Char → Payload Parser:<br>temp 0 2 int16 LE<br>hum  2 1 uint8<br>flag 3 1 hex",
  // Node: Read RSSI
  "Read the current connection RSSI.": "Lê o RSSI atual da conexão.",
  "Reads the current RSSI of the active connection. Stored in the lastRSSI runtime slot and (optionally) into a named variable.":
    "Lê o RSSI atual da conexão ativa. Salvo no slot de execução <code>lastRSSI</code> e (opcionalmente) em uma variável nomeada.",
  "Optional variable name.": "Nome de variável opcional.",
  "Range check": "Verificação de alcance",
  'Read RSSI → If (lastRSSI, <, -85) → true: HTTP "link weak".':
    'Read RSSI → If (lastRSSI, <, -85) → true: HTTP "enlace fraco".',
  // Node: Read MTU
  "Read the negotiated ATT MTU.": "Lê o MTU ATT negociado.",
  "Reads the negotiated ATT MTU. macOS CoreBluetooth doesn't expose an API to request a specific MTU — this step just surfaces what the OS negotiated at connect time.":
    "Lê o MTU ATT negociado. O CoreBluetooth do macOS não expõe uma API para <em>solicitar</em> um MTU específico — este passo apenas mostra o que o sistema negociou no momento da conexão.",
  "Optional variable name for the MTU integer.":
    "Nome de variável opcional para o inteiro do MTU.",
  "Chunk sizing diagnostics": "Diagnóstico de tamanho de fragmento",
  "Connect → Read MTU (store as=mtu) → HTTP Request (body uses ${mtu}).":
    "Connect → Read MTU (store as=mtu) → HTTP Request (o body usa <code>${mtu}</code>).",
  // Node: HTTP Request
  "Send an HTTP request.": "Envia uma requisição HTTP.",
  "Sends an HTTP request to a URL with optional headers and body. Variables are interpolated with ${name}.":
    "Envia uma requisição HTTP a uma URL com cabeçalhos e corpo opcionais. As variáveis são interpoladas com <code>${name}</code>.",
  URL: "URL",
  "Full URL with ${var} allowed.":
    "URL completa; <code>${var}</code> permitido.",
  Method: "Método",
  "GET / POST / PUT / DELETE / PATCH.": "GET / POST / PUT / DELETE / PATCH.",
  Headers: "Cabeçalhos",
  "Key: value pairs, one per line. Values support ${var}.":
    "Pares chave: valor, um por linha. Os valores suportam <code>${var}</code>.",
  Body: "Corpo",
  "Raw body string. ${var} interpolation applies.":
    "String de corpo bruta. Aplica-se a interpolação <code>${var}</code>.",
  "Ship a reading": "Enviar uma leitura",
  'Read Char (store as=temp) → HTTP Request (POST https://api.x/ingest, body={"temp":${temp}}).':
    'Read Char (store as=temp) → HTTP Request (POST https://api.x/ingest, body=<code>{"temp":${temp}}</code>).',
  // Node: Append CSV
  "Append a row to a CSV file.": "Adiciona uma linha a um arquivo CSV.",
  "Appends a row to a CSV file on disk. Creates the file with the configured header on first run.":
    "Adiciona uma linha a um arquivo CSV no disco. Cria o arquivo com o cabeçalho configurado na primeira execução.",
  "File path": "Caminho do arquivo",
  "Absolute path to the CSV file.": "Caminho absoluto para o arquivo CSV.",
  Header: "Cabeçalho",
  "Comma-separated column names. Written once when the file is created.":
    "Nomes de coluna separados por vírgula. Escritos uma vez quando o arquivo é criado.",
  Row: "Linha",
  "Comma-separated values. ${var} interpolation applies.":
    "Valores separados por vírgula. Aplica-se a interpolação <code>${var}</code>.",
  "Telemetry log": "Log de telemetria",
  "Loop: Read RSSI → Append CSV (header=ts,rssi, row=${now},${rssi}).":
    "Laço: Read RSSI → Append CSV (header=<code>ts,rssi</code>, row=<code>${now},${rssi}</code>).",
  // Node: Save File
  "Write a payload to disk in one shot.":
    "Escreve um payload no disco de uma só vez.",
  "Writes a payload to disk in one shot (overwrites if exists). Use for snapshots, not append-style logs.":
    "Escreve um payload no disco de uma só vez (sobrescreve se existir). Use para instantâneos, não para logs do tipo anexado.",
  "Absolute path to the destination.": "Caminho absoluto para o destino.",
  Content: "Conteúdo",
  "Raw text content with ${var} interpolation.":
    "Conteúdo de texto bruto com interpolação <code>${var}</code>.",
  "Dump last read": "Despejar a última leitura",
  "Read Char → Save File (path=/tmp/last.bin, content=${lastReadHex}).":
    "Read Char → Save File (path=<code>/tmp/last.bin</code>, content=<code>${lastReadHex}</code>).",
  // Request a node
  "Don't see the node you need?": "Não encontra o nó de que precisa?",
  "Signal Hub is shaped by the engineers who use it. Tell me what step is missing from your workflow and I'll prioritize it for the next release.":
    "O Signal Hub é moldado pelos engenheiros que o usam. Diga-me qual passo está faltando no seu fluxo e eu o priorizarei para a próxima versão.",
  "Request a node →": "Solicitar um nó →",
  // Demo
  "See it move": "Veja em movimento",
  "A 60-second tour.": "Um tour de 60 segundos.",
  "Concurrent connections, workflows, simulator, export — all in motion. The fastest way to feel what Signal Hub actually does.":
    "Conexões concorrentes, fluxos, simulador, exportação — tudo em movimento. A forma mais rápida de sentir o que o Signal Hub realmente faz.",
  "Signal Hub 1.0.1 — recorded on macOS Sonoma":
    "Signal Hub 1.0.1 — gravado no macOS Sonoma",
  // CTA
  "Build with BLE, finally enjoyable.":
    "Desenvolver com BLE, finalmente prazeroso.",
  "Signal Hub is in private beta on macOS. If you spend your days talking to BLE peripherals, we'd love to hand you the keys.":
    "O Signal Hub está em beta privado no macOS. Se você passa os dias conversando com periféricos BLE, adoraríamos lhe entregar as chaves.",
  "Request beta access": "Solicitar acesso beta",
  "Back to the blog": "Voltar ao blog",
  // Footer
  "Designed & built by Uy Nguyen — crafted for engineers who live in the BLE stack.":
    "Projetado e desenvolvido por <a href='/'>Uy Nguyen</a> — feito para engenheiros que vivem na pilha BLE.",
  Blog: "Blog",
  Archives: "Arquivos",
  Contact: "Contato",
};

/* ===================== 中文 ===================== */
SH_TRANSLATIONS.zh = {
  // Nav
  Connect: "连接",
  Workflows: "工作流",
  Simulate: "模拟",
  Export: "导出",
  Demo: "演示",
  "Get Signal Hub": "获取 Signal Hub",
  // Hero
  "BLE Testing · Workflow Automation · Device Simulator · macOS":
    "BLE 测试 · 工作流自动化 · 设备模拟器 · macOS",
  "The BLE workbench, reimagined for Mac.":
    "BLE 工作台，<br><span class='accent'>为 Mac 重新设计。</span>",
  "Signal Hub is a Mac app for Bluetooth Low Energy (BLE) testing and automation. Scan and connect to many BLE devices at once, build visual workflows that run on real hardware, simulate peripherals when the prototype hasn't shipped, and export PNG / video documentation — all from one elegant macOS app.":
    "Signal Hub 是一款<strong>用于 Bluetooth Low Energy（BLE）测试与自动化的 Mac 应用</strong>。同时扫描并连接多台 BLE 设备，构建可在真实硬件上运行的可视化工作流，在原型尚未到位时模拟外设，并导出 PNG / 视频文档——全部都在一款优雅的 macOS 应用中完成。",
  "Download for macOS →": "下载 macOS 版 →",
  "Watch demo →": "观看演示 →",
  // Feature 1
  "Concurrent BLE": "并发 BLE",
  "Many devices. One calm cockpit.": "众多设备，<br>一处从容驾驶舱。",
  "Signal Hub treats every BLE connection as a first-class citizen. Scan the room, connect to multiple peripherals in parallel, and switch between them without losing context. Read, write, and subscribe to characteristics with one click — and watch traffic stream in real time.":
    "Signal Hub 将每一个 BLE 连接都视为一等公民。扫描周围环境，并行连接多个外设，并在它们之间切换而不丢失上下文。一键读取、写入和订阅特征值——并实时观察数据流。",
  "Concurrent scan & connect across as many devices as your radio can hold":
    "在射频所能承载的设备数量上并发扫描与连接",
  "Per-device sessions with live characteristic explorer and notification stream":
    "每台设备独立会话，配备实时特征值浏览器与通知流",
  "Smart filters: name, RSSI, service UUID, manufacturer data":
    "智能过滤：名称、RSSI、服务 UUID、厂商数据",
  "Auto-reconnect, pairing, and bond management built in":
    "内置自动重连、配对与绑定管理",
  Scan: "扫描",
  "GATT explorer": "GATT 浏览器",
  Notifications: "通知",
  // Feature 2
  "Visual workflows": "可视化工作流",
  "Your test plan, drawn into reality.": "你的测试计划，<br>绘制为现实。",
  "Drag, drop, and connect nodes to compose any BLE flow — handshake, OTA, telemetry, edge cases. Each node is a real BLE action. Hit run, and Signal Hub executes the entire workflow against your device, with full visibility into every step.":
    "拖放并连接节点，即可组合任意 BLE 流程——握手、OTA、遥测、边界情况。每个节点都是一个真实的 BLE 操作。点击运行，Signal Hub 便会在你的设备上执行整个工作流，每一步都清晰可见。",
  "Composable nodes: scan, connect, write, read, wait, branch, assert":
    "可组合节点：扫描、连接、写入、读取、等待、分支、断言",
  "Loop, retry, and conditional logic without writing a line of code":
    "无需编写一行代码即可实现循环、重试与条件逻辑",
  "Run once or schedule for regression — the workflow is the spec":
    "运行一次或安排回归测试——工作流即规范",
  "Version-controlled workspaces keep the team in sync":
    "受版本控制的工作区让团队保持同步",
  // Feature 2b
  Workspaces: "工作区",
  "A home for every project.": "为每个项目<br>安一个家。",
  "Organize devices, workflows, and notes into workspaces. Each one is a self-contained context — switch projects with a click. Share a workspace with a teammate and they pick up exactly where you left off.":
    "将设备、工作流和笔记整理到<strong>工作区</strong>中。每个工作区都是一个自包含的上下文——一键切换项目。把工作区分享给队友，他们就能从你停下的地方无缝接手。",
  "Per-workspace devices, workflows, and assets":
    "每个工作区独立的设备、工作流与资源",
  "Local-first storage with export anywhere": "本地优先存储，可随处导出",
  "Built for teams: open the same workspace, get the same view":
    "为团队打造：打开同一个工作区，看到同样的视图",
  // Feature 3
  "Live binding": "实时绑定",
  "Bind real devices to every node — live.":
    "将真实设备绑定<br>到每个节点——实时进行。",
  "Connect a workflow to physical hardware in seconds. Pick a discovered peripheral, bind it to a node, and watch the workflow drive the device for real — no scripts, no fixtures, no detours through a terminal.":
    "几秒钟即可将工作流连接到物理硬件。选择一个已发现的外设，将其绑定到节点，看着工作流真正驱动设备——无需脚本，无需测试夹具，也无需绕道终端。",
  "Real-time binding of any discovered peripheral to any node":
    "将任意已发现的外设实时绑定到任意节点",
  "Inspect responses, latency, and characteristic values as the workflow runs":
    "在工作流运行时检查响应、延迟与特征值",
  "Step through, pause, and re-run — debug like you would code":
    "单步执行、暂停并重新运行——像调试代码一样调试",
  // Feature 4
  "Built-in simulator": "内置模拟器",
  "No hardware? No problem.": "没有硬件？<br>没问题。",
  "The built-in BLE simulator stands in for any peripheral. Mock services, characteristics, and responses — including the gnarly edge cases that real hardware refuses to reproduce. Build, test, and demo your workflows before the prototype hits your desk.":
    "内置 BLE 模拟器可替代任何外设。模拟服务、特征值和响应——包括真实硬件拒绝重现的那些棘手边界情况。在原型送到你桌前之前，就构建、测试并演示你的工作流。",
  "Define virtual peripherals with any service / characteristic shape":
    "用任意服务 / 特征值结构定义虚拟外设",
  "Scripted responses, delays, and failure modes — reproduce real bugs on demand":
    "脚本化响应、延迟与故障模式——按需重现真实缺陷",
  "Mix and match: real devices and simulated ones in the same workflow":
    "任意搭配：在同一工作流中混用真实设备与模拟设备",
  "Mock services": "模拟服务",
  "Scripted responses": "脚本化响应",
  "Edge cases": "边界情况",
  // Feature 5
  "Share & document": "分享与记录",
  "Beautiful artifacts, one click away.": "精美的成果，<br>一键即得。",
  "Export any workflow as a high-resolution PNG, a screen recording, or a compact summary — ready to drop into a PR, a spec, or a customer report. Documentation becomes a by-product of building, not a chore.":
    "将任意工作流导出为高分辨率 PNG、屏幕录像或精简摘要——可直接放入 PR、规范文档或客户报告。文档成为构建过程的副产品，而非苦差事。",
  "One-click PNG export with crisp typography and clear edges":
    "一键导出 PNG，字体清晰、边缘分明",
  "Video export of a live workflow run for demos and bug reports":
    "将实时工作流运行导出为视频，用于演示与缺陷报告",
  "Auto-generated run summaries: steps, timings, outcomes":
    "自动生成运行摘要：步骤、用时、结果",
  "PNG export": "PNG 导出",
  "Workflows rendered at retina resolution, ready for documentation, PRs, or slide decks.":
    "以视网膜分辨率渲染的工作流，可用于文档、PR 或幻灯片。",
  "Video capture": "视频录制",
  "Record a live run with all device traffic overlaid. Perfect for demos and bug reports.":
    "录制实时运行并叠加全部设备流量。非常适合演示与缺陷报告。",
  "Run summaries": "运行摘要",
  "Every workflow run produces a structured summary — steps, timing, results, errors.":
    "每次工作流运行都会生成结构化摘要——步骤、用时、结果、错误。",
  "Concurrent devices": "并发设备数",
  "Lines of code required": "所需代码行数",
  "Local-first": "本地优先",
  "PNG & video export": "PNG 与视频导出",
  // Nodes header
  "Workflow nodes": "工作流节点",
  "53 building blocks. One workflow.": "53 个构建块。<br>一个工作流。",
  "Each node is a single BLE action — scan, connect, read, branch, wait. Snap them together on the canvas and you've described a complete protocol exchange, ready to run on a real device or the built-in simulator.":
    "每个节点都是一个单一的 BLE 操作——扫描、连接、读取、分支、等待。在画布上把它们拼接起来，你就描述了一次完整的协议交互，随时可在真实设备或内置模拟器上运行。",
  "Show all nodes": "显示全部节点",
  "Hide all nodes": "隐藏全部节点",
  // Category headers
  "Control — 3 nodes": "控制 — 3 个节点",
  "Triggers — 6 nodes": "触发器 — 6 个节点",
  "Scan — 2 nodes": "扫描 — 2 个节点",
  "Connection — 2 nodes": "连接 — 2 个节点",
  "Discovery — 2 nodes": "发现 — 2 个节点",
  "Read / Write — 4 nodes": "读取 / 写入 — 4 个节点",
  "Notify — 2 nodes": "通知 — 2 个节点",
  "Flow — 9 nodes": "流程 — 9 个节点",
  "Logic — 3 nodes": "逻辑 — 3 个节点",
  "Data — 3 nodes": "数据 — 3 个节点",
  "Link — 2 nodes": "链路 — 2 个节点",
  "Egress — 3 nodes": "出口 — 3 个节点",
  // Shared block heads
  Attributes: "属性",
  "Example use cases": "用例示例",
  // Node: Start
  "Entry point of the workflow.": "工作流的入口点。",
  "Entry point of the workflow. Exactly one Start node is allowed — execution begins here when you press Run.":
    "工作流的入口点。仅允许一个 Start 节点——按下 Run 时从这里开始执行。",
  "Every workflow": "每个工作流",
  "Drop a Start node, wire its output into your first real step (Start Scan, Connect, etc.). Without it, Run is disabled.":
    "放置一个 Start 节点，将其输出连到你的第一个实际步骤（Start Scan、Connect 等）。没有它，Run 将被禁用。",
  // Node: End
  "Terminates a branch cleanly.": "干净地终止一个分支。",
  "Terminates a branch cleanly. Optional — branches that reach a dead end also stop, but End makes the intent explicit.":
    "干净地终止一个分支。可选——走到尽头的分支也会停止，但 End 让意图更明确。",
  "Mark a success path": "标记一条成功路径",
  'If/true → HTTP Request → End. The End makes "this branch is done" visible in the run log.':
    "If/true → HTTP Request → End。End 让“此分支已完成”在运行日志中清晰可见。",
  // Node: On Device Discovered
  "Blocks until a matching advertisement is seen.":
    "阻塞，直到看到匹配的广播。",
  "Blocks until a peripheral advertisement matches the configured filters (name substring, manufacturer-data hex prefix, RSSI threshold). Auto-starts a scan unless disabled.":
    "阻塞，直到某个外设广播匹配所配置的过滤条件（名称子串、厂商数据 hex 前缀、RSSI 阈值）。除非禁用，否则会自动开始扫描。",
  "Name match": "名称匹配",
  "Case-insensitive substring required in the advertised local name. Empty = don't filter on name.":
    "广播的本地名称中必须包含的子串（不区分大小写）。留空 = 不按名称过滤。",
  "Manufacturer (hex)": "厂商（hex）",
  "Hex prefix the device's manufacturer data must start with. Common pattern: 4C00 for Apple beacons.":
    "设备厂商数据必须以之开头的 hex 前缀。常见模式：<code>4C00</code> 用于 Apple beacon。",
  "Min RSSI": "最小 RSSI",
  "Drop advertisements weaker than this dBm value. Off = no threshold.":
    "丢弃弱于该 dBm 值的广播。关闭 = 无阈值。",
  "Auto scan": "自动扫描",
  "When on, starts a scan on entry and stops it on match. Turn off if an upstream Start Scan already configured filters.":
    "开启时，进入节点即开始扫描，匹配后停止。如果上游的 Start Scan 已配置过滤条件，则关闭它。",
  "Timeout (s)": "超时（秒）",
  "Maximum wait. Empty = wait forever.": "最长等待时间。留空 = 一直等待。",
  "Store as": "存储为",
  "Optional variable that receives the matched device address.":
    "接收所匹配设备地址的可选变量。",
  "Wait for a known sensor": "等待一个已知传感器",
  "On Device Discovered (name=SignalHub, rssi ≥ -75) → Connect (uses stored mac).":
    "On Device Discovered (name=<code>SignalHub</code>, rssi ≥ -75) → Connect（使用存储的 mac）。",
  // Node: On Device Connected
  "Blocks until a connect event fires.": "阻塞，直到触发连接事件。",
  "Blocks until a connect event fires. Optionally filters by mac so the trigger only resumes when a specific device comes online.":
    "阻塞，直到触发连接事件。可选地按 mac 过滤，使触发器仅在特定设备上线时才恢复。",
  "Device address": "设备地址",
  "Optional mac. Empty = match any connect.": "可选 mac。留空 = 匹配任意连接。",
  "Optional variable that receives the connected device address.":
    "接收已连接设备地址的可选变量。",
  "Coordinate with external connect": "与外部连接协同",
  "On Device Connected (mac=AA:BB:…) → Discover Services → Read Char.":
    "On Device Connected (mac=<code>AA:BB:…</code>) → Discover Services → Read Char。",
  // Node: On Device Disconnected
  "Blocks until a disconnect event fires.": "阻塞，直到触发断开事件。",
  "Blocks until a disconnect event fires. Used to react to peripherals dropping the link without polling.":
    "阻塞，直到触发断开事件。用于在无需轮询的情况下响应外设掉线。",
  "Optional mac. Empty = match any disconnect.":
    "可选 mac。留空 = 匹配任意断开。",
  "Optional variable receiving the disconnected mac.":
    "接收已断开 mac 的可选变量。",
  "Telemetry on drop": "掉线时上报遥测",
  "On Device Disconnected → HTTP Request (alert).":
    "On Device Disconnected → HTTP Request（告警）。",
  // Node: On Notification
  "Blocks until a matching notification arrives.": "阻塞，直到收到匹配的通知。",
  "Blocks until a characteristic notification matches the optional hex prefix. Auto-subscribes to the characteristic before listening so a separate Subscribe step isn't required.":
    "阻塞，直到某个特征值通知匹配可选的 hex 前缀。在监听前会自动订阅该特征值，因此无需单独的 Subscribe 步骤。",
  "Characteristic UUID": "特征值 UUID",
  "Target characteristic. Must be notifiable or indicatable.":
    "目标特征值。必须支持 notify 或 indicate。",
  "Match prefix (hex)": "匹配前缀（hex）",
  "Optional hex prefix the payload must start with. Empty = match any notification.":
    "负载必须以之开头的可选 hex 前缀。留空 = 匹配任意通知。",
  "Optional variable that receives the matched payload as hex.":
    "以 hex 形式接收所匹配负载的可选变量。",
  "Wait for boot notification": "等待启动通知",
  "Connect → On Notification (uuid=…, match=AA01) → continue.":
    "Connect → On Notification (uuid=…, match=<code>AA01</code>) → 继续。",
  // Node: Timer
  "Wait on a delay, interval, or exact date.": "按延迟、间隔或精确日期等待。",
  "Waits on a time condition before continuing. After delay = one-shot wait. Interval = self-looping periodic tick that runs forever until stopped. Exact date = wait until an ISO-8601 timestamp.":
    "在继续前等待一个时间条件。<strong>After delay</strong> = 一次性等待。<strong>Interval</strong> = 自循环的周期性触发，持续运行直到被停止。<strong>Exact date</strong> = 等待到某个 ISO-8601 时间戳。",
  Mode: "模式",
  "After delay: wait N seconds, then take edge 1 once. Interval: fire repeatedly on each N-second boundary. Exact date: wait until ISO-8601 timestamp.":
    "After delay：等待 N 秒，然后走一次 edge 1。Interval：在每个 N 秒边界重复触发。Exact date：等待到 ISO-8601 时间戳。",
  Seconds: "秒数",
  "Delay or interval length for After / Interval modes.":
    "After / Interval 模式下的延迟或间隔长度。",
  "Date (ISO-8601)": "日期（ISO-8601）",
  "Used in Exact date mode (e.g. 2026-12-31T23:00:00Z). Past dates fire immediately.":
    "用于 Exact date 模式（例如 <code>2026-12-31T23:00:00Z</code>）。过去的日期会立即触发。",
  Name: "名称",
  "Optional identifier referenced by a Stop Timer node. Defaults to the node's label.":
    "供 Stop Timer 节点引用的可选标识符。默认为节点的标签。",
  "Forever-periodic poll": "永久周期性轮询",
  "Start → Timer (interval, 5s) → Read Char. The Read fires every 5s; press Stop to end the workflow.":
    "Start → Timer (interval, 5s) → Read Char。该读取每 5 秒触发一次；按 Stop 结束工作流。",
  "Bounded periodic poll": "有界周期性轮询",
  "Repeat (10) → Timer (after, 5s) → Read Char. Body executes exactly 10 times spaced 5s apart.":
    "Repeat (10) → Timer (after, 5s) → Read Char。主体恰好执行 10 次，每次间隔 5 秒。",
  "Scheduled run": "定时运行",
  "Start → Timer (exactDate, 2026-12-31T23:00:00Z) → Start Scan → …":
    "Start → Timer (exactDate, <code>2026-12-31T23:00:00Z</code>) → Start Scan → …",
  // Node: Stop Timer
  "Cancels a running Timer by name.": "按名称取消一个正在运行的 Timer。",
  "Cancels a running Timer node addressed by name. The targeted timer's pending wait is disposed immediately, no more ticks fire. Other branches and timers keep running.":
    "按名称取消一个正在运行的 Timer 节点。目标计时器待处理的等待会被立即释放，不再触发任何节拍。其他分支和计时器继续运行。",
  "Timer name": "Timer 名称",
  "Must match the target Timer node's Name field. Stopping by name lets one workflow run many timers and cancel them independently.":
    "必须与目标 Timer 节点的 Name 字段匹配。按名称停止可让一个工作流运行多个计时器并各自独立取消。",
  "Stop on condition": "按条件停止",
  "Timer (name=poll, interval, 5s) → Read Char → If (battery, <, 5) → true: Stop Timer (poll) → HTTP alert.":
    "Timer (name=poll, interval, 5s) → Read Char → If (battery, <, 5) → true：Stop Timer (poll) → HTTP 告警。",
  "Race two timers": "让两个计时器竞速",
  "Parallel → branch 1: Timer (name=A, interval, 1s) → … ; branch 2: Timer (name=B, after, 30s) → Stop Timer (A). After 30s the fast poller stops.":
    "Parallel → 分支 1：Timer (name=A, interval, 1s) → … ；分支 2：Timer (name=B, after, 30s) → Stop Timer (A)。30 秒后，快速轮询器停止。",
  // Node: Start Scan
  "Begins a BLE scan asynchronously.": "异步开始一次 BLE 扫描。",
  "Begins a BLE scan. Continues running asynchronously; subsequent steps execute immediately without waiting for results.":
    "开始一次 BLE 扫描。以异步方式继续运行；后续步骤立即执行，无需等待结果。",
  "Service UUID": "服务 UUID",
  "Optional. When set, only devices advertising this service appear in scan results. Empty = scan everything.":
    "可选。设置后，扫描结果中只显示广播该服务的设备。留空 = 扫描全部。",
  "Allow duplicates": "允许重复",
  "When on, the same device produces multiple advertisement events. Useful for live RSSI tracking; off for one-shot discovery.":
    "开启时，同一设备会产生多个广播事件。适合实时跟踪 RSSI；关闭则用于一次性发现。",
  "Find a known device by service": "按服务查找已知设备",
  "Start Scan (svc=180D) → Delay 3s → Stop Scan → Connect (mac from scan results).":
    "Start Scan (svc=180D) → Delay 3s → Stop Scan → Connect（来自扫描结果的 mac）。",
  // Node: Stop Scan
  "Stops an in-progress scan.": "停止正在进行的扫描。",
  "Stops an in-progress scan. Pair with Start Scan when you want a bounded discovery window.":
    "停止正在进行的扫描。当你需要一个有界的发现窗口时，与 Start Scan 配对使用。",
  "Bounded scan": "有界扫描",
  "Start Scan → Delay 5s → Stop Scan. Without Stop Scan the radio keeps scanning until the workflow ends.":
    "Start Scan → Delay 5s → Stop Scan。没有 Stop Scan，射频会一直扫描直到工作流结束。",
  // Node: Connect
  "Connects to a peripheral by MAC.": "按 MAC 连接到一个外设。",
  'Connects to a peripheral by MAC. Resolves on "connected" — i.e. CoreBluetooth fired didConnect and the link is up.':
    "按 MAC 连接到一个外设。在“connected”时完成——即 CoreBluetooth 触发了 didConnect 且链路已建立。",
  Device: "设备",
  "Pick from the live device list (populated by Start Scan / known devices). The selected MAC becomes the workflow's active device for downstream BLE steps.":
    "从实时设备列表中选择（由 Start Scan / 已知设备填充）。所选 MAC 将成为工作流后续 BLE 步骤的活动设备。",
  "Connect then read": "先连接再读取",
  "Connect (chosen device) → Discover Services → Read Char (battery level).":
    "Connect（所选设备）→ Discover Services → Read Char（电量）。",
  "Reconnect on disconnect": "断开后重连",
  "Try/Catch around Connect. On the catch path, Delay 1s → Connect again.":
    "在 Connect 外包一层 Try/Catch。在 catch 路径上，Delay 1s → 再次 Connect。",
  // Node: Disconnect
  "Closes the active connection.": "关闭活动连接。",
  "Closes the active connection. Always good practice at the end of a workflow so the peripheral is free for other apps.":
    "关闭活动连接。在工作流结束时这样做总是好习惯，让外设可供其他应用使用。",
  "Defaults to the active device. Override only if you've connected to multiple peripherals in the same workflow.":
    "默认为活动设备。仅当你在同一工作流中连接了多个外设时才需要覆盖。",
  "Clean teardown": "干净收尾",
  "… → Read Char → Disconnect → End.": "… → Read Char → Disconnect → End。",
  // Node: Discover Services
  "Enumerate the peripheral's services.": "枚举外设的服务。",
  "Asks the peripheral to enumerate its services. Required before reading/writing characteristics on most devices.":
    "请求外设枚举其服务。在大多数设备上读写特征值之前是必需的。",
  "Standard prep": "标准准备",
  "Connect → Discover Services → Discover Characteristics → Read Char.":
    "Connect → Discover Services → Discover Characteristics → Read Char。",
  // Node: Discover Characteristics
  "Enumerate characteristics under each service.": "枚举每个服务下的特征值。",
  "Enumerates the characteristics under each discovered service. Run after Discover Services.":
    "枚举每个已发现服务下的特征值。在 Discover Services 之后运行。",
  "Walk the GATT": "遍历 GATT",
  "Connect → Discover Services → Discover Characteristics. Now Read/Write/Subscribe can target any UUID.":
    "Connect → Discover Services → Discover Characteristics。现在 Read/Write/Subscribe 可针对任意 UUID。",
  // Node: Read Char
  "Read a characteristic's current value.": "读取特征值的当前值。",
  "Reads the current value of a characteristic. Resolves with raw bytes; the bytes are stored in lastReadHex and (optionally) into a named variable.":
    "读取特征值的当前值。以原始字节完成；这些字节存储在 <code>lastReadHex</code> 中，并（可选地）存入一个命名变量。",
  "Standard short (0x2A19) or 128-bit UUID. The picker fills this in from the discovered list.":
    "标准短 UUID（<code>0x2A19</code>）或 128 位 UUID。选择器会从已发现列表中填入。",
  "Value format / endian": "值格式 / 字节序",
  "How the result is decoded for display on the node card. Doesn't change lastReadHex — only the human-readable view.":
    "结果如何解码以在节点卡片上显示。不会改变 <code>lastReadHex</code>——只影响可读视图。",
  "Optional variable name. The decoded value is stored under this name for use by downstream If / Transform steps.":
    "可选的变量名。解码后的值以此名称存储，供下游 If / Transform 步骤使用。",
  "Battery snapshot": "电量快照",
  "Connect → Discover … → Read Char (0x2A19, format=UInt8, store as=battery).":
    "Connect → Discover … → Read Char (<code>0x2A19</code>, format=UInt8, store as=battery)。",
  "Conditional logic": "条件逻辑",
  'Read Char → If (variable=battery, <, 20) → HTTP Request ("low battery").':
    "Read Char → If (variable=battery, <, 20) → HTTP Request（“低电量”）。",
  // Node: Write Char
  "Write bytes to a characteristic.": "向特征值写入字节。",
  "Writes bytes to a characteristic. Supports hex (DE AD) or text payloads, and chooses write-with/without-response automatically based on the characteristic's properties.":
    "向特征值写入字节。支持 hex（<code>DE AD</code>）或文本负载，并根据特征值的属性自动选择带响应/不带响应写入。",
  "Target characteristic.": "目标特征值。",
  Payload: "负载",
  "Hex bytes (DE AD BE EF) or ${var} interpolations. The executor chunks payloads larger than the negotiated MTU automatically.":
    "Hex 字节（<code>DE AD BE EF</code>）或 <code>${var}</code> 插值。执行器会自动将大于协商 MTU 的负载分块。",
  "Wake a sensor": "唤醒一个传感器",
  "Connect → Discover … → Write Char (0xFF03, payload=01).":
    "Connect → Discover … → Write Char (<code>0xFF03</code>, payload=<code>01</code>)。",
  "Send a variable": "发送一个变量",
  "Set Variable (cmd=AA01) → Write Char (payload=${cmd}).":
    "Set Variable (cmd=<code>AA01</code>) → Write Char (payload=<code>${cmd}</code>)。",
  // Node: Read Descriptor
  "Read a GATT descriptor value.": "读取一个 GATT 描述符的值。",
  "Reads a GATT descriptor (e.g. Characteristic User Description 0x2901, Format 0x2904, or the current notify-state bits in the CCCD 0x2902).":
    "读取一个 GATT 描述符（例如 Characteristic User Description <code>0x2901</code>、Format <code>0x2904</code>，或 CCCD <code>0x2902</code> 中当前的通知状态位）。",
  "Parent characteristic.": "父特征值。",
  "Descriptor UUID": "描述符 UUID",
  "Standard short (0x2901, 0x2902, 0x2904) or 128-bit UUID.":
    "标准短 UUID（<code>0x2901</code>、<code>0x2902</code>、<code>0x2904</code>）或 128 位 UUID。",
  "Decoding for the result display.": "用于结果显示的解码方式。",
  "Read a friendly name": "读取一个友好名称",
  "Read Descriptor (char=…, desc=0x2901, format=text).":
    "Read Descriptor (char=…, desc=<code>0x2901</code>, format=text)。",
  // Node: Write Descriptor
  "Write to a GATT descriptor (not CCCD).": "写入一个 GATT 描述符（非 CCCD）。",
  "Writes bytes to a writable GATT descriptor. ⚠️ macOS blocks writes to the CCCD (0x2902) — use Subscribe instead. Useful for the rare devices that expose other writable descriptors.":
    "向可写的 GATT 描述符写入字节。⚠️ macOS 会阻止对 CCCD（<code>0x2902</code>）的写入——请改用 Subscribe。适用于少数暴露了其他可写描述符的设备。",
  "Target descriptor — anything other than 0x2902.":
    "目标描述符——除 <code>0x2902</code> 以外的任意一个。",
  "Payload (hex)": "负载（hex）",
  "Bytes to write.": "要写入的字节。",
  "Set custom config": "设置自定义配置",
  "Write Descriptor (char=…, desc=0xFFD1, payload=01).":
    "Write Descriptor (char=…, desc=<code>0xFFD1</code>, payload=<code>01</code>)。",
  // Node: Subscribe
  "Enable notifications on a characteristic.": "在特征值上启用通知。",
  "Enables notifications/indications on a characteristic. Subsequent notifications populate lastReadHex and fire Wait Notification steps.":
    "在特征值上启用 notification/indication。后续通知会填充 <code>lastReadHex</code> 并触发 Wait Notification 步骤。",
  "Live stream": "实时流",
  "Subscribe (heart rate) → Wait Notification (5s) → Set Variable (hr = lastReadHex). Loop with Repeat.":
    "Subscribe（心率）→ Wait Notification (5s) → Set Variable (hr = lastReadHex)。用 Repeat 循环。",
  // Node: Unsubscribe
  "Turn off notifications for a characteristic.": "关闭某个特征值的通知。",
  "Turns off notifications for a characteristic. Useful when a workflow has multiple subscribe/unsubscribe phases.":
    "关闭某个特征值的通知。当工作流有多个订阅/取消订阅阶段时很有用。",
  "Same UUID as the Subscribe step you want to stop.":
    "与你想停止的 Subscribe 步骤相同的 UUID。",
  "Bounded listen window": "有界监听窗口",
  "Subscribe → Delay 10s → Unsubscribe → Disconnect.":
    "Subscribe → Delay 10s → Unsubscribe → Disconnect。",
  // Node: Repeat
  "Loop N times, then take the exit edge.": "循环 N 次，然后走出口 edge。",
  "Loops its first output edge N times, then takes the second output (exit) once. Body executions are numbered (#1, #2, …) in the run log.":
    "将其第一个输出 edge 循环 N 次，然后走一次第二个输出（出口）。主体的每次执行在运行日志中编号（<code>#1</code>、<code>#2</code>、…）。",
  Times: "次数",
  "Number of iterations of the body branch before falling through to the exit branch.":
    "在进入出口分支前主体分支的迭代次数。",
  "Poll a value": "轮询一个值",
  "Repeat (10) → body: Read Char → Delay 1s. Exit: Disconnect.":
    "Repeat (10) → 主体：Read Char → Delay 1s。出口：Disconnect。",
  // Node: Delay
  "Pause this branch for N seconds.": "将此分支暂停 N 秒。",
  "Pauses the branch for a fixed duration. Other parallel branches keep running.":
    "将分支暂停固定的时长。其他并行分支继续运行。",
  "Duration (s)": "时长（秒）",
  "Seconds to wait before continuing. Floats are fine (0.25 = 250 ms).":
    "继续前等待的秒数。支持小数（0.25 = 250 毫秒）。",
  "Settle after connect": "连接后稳定",
  "Connect → Delay 0.5s → Discover Services (some peripherals need a beat).":
    "Connect → Delay 0.5s → Discover Services（有些外设需要缓一缓）。",
  // Node: Parallel
  "Fan out into concurrent branches.": "扇出为并发分支。",
  "Fans out into multiple branches that run concurrently. Each outgoing edge starts its own execution token.":
    "扇出为多个并发运行的分支。每个出向 edge 都会启动各自的执行令牌。",
  "Read two characteristics at once": "同时读取两个特征值",
  "Parallel → branch 1: Read Char A; branch 2: Read Char B → Join (waits for both).":
    "Parallel → 分支 1：Read Char A；分支 2：Read Char B → Join（等待两者）。",
  // Node: Join
  "Wait for every incoming branch.": "等待每个进入的分支。",
  "Counterpart to Parallel: waits until every incoming edge has delivered a token before continuing downstream.":
    "Parallel 的对应节点：等待每个进入的 edge 都传来令牌后，才继续向下游推进。",
  "Fan-out / fan-in": "扇出 / 扇入",
  "Parallel → 3 branches do Read/Read/HTTP → Join → continue.":
    "Parallel → 3 个分支执行 Read/Read/HTTP → Join → 继续。",
  // Node: Try / Catch
  "Recover from failures on a branch.": "从分支的失败中恢复。",
  "Wraps its protected branch (edge 0). If any downstream step on that branch fails, execution jumps to the catch branch (edge 1) instead of failing the workflow.":
    "包裹其受保护分支（edge 0）。如果该分支上任意下游步骤失败，执行会跳转到 catch 分支（edge 1），而不是让整个工作流失败。",
  "Reconnect on transient failure": "瞬时失败时重连",
  "Try/Catch → protected: Read Char; catch: Delay 1s → Connect → Read Char again.":
    "Try/Catch → 受保护：Read Char；catch：Delay 1s → Connect → 再次 Read Char。",
  // Node: Retry
  "Retry a branch up to N attempts.": "对一个分支最多重试 N 次。",
  "Wraps a branch in a retry loop. If anything downstream of edge 0 errors, the executor delays then re-enters edge 0 — up to attempts total tries before falling through to edge 1 (the give-up branch).":
    "将一个分支包裹在重试循环中。如果 edge 0 下游有任何报错，执行器会延迟后重新进入 edge 0——最多尝试 <code>attempts</code> 次，然后才落入 edge 1（放弃分支）。",
  Attempts: "尝试次数",
  "Total tries (1 = no retry; the branch runs once and any failure falls through immediately).":
    "总尝试次数（1 = 不重试；分支运行一次，任何失败立即落空）。",
  "Backoff (s)": "退避（秒）",
  "Delay applied before each retry. Doesn't apply before the first attempt.":
    "每次重试前施加的延迟。第一次尝试前不适用。",
  "Reconnect on flaky link": "链路不稳时重连",
  "Retry (3 attempts, 1s) → protected: Connect → Read; give-up: HTTP alert.":
    "Retry (3 次, 1s) → 受保护：Connect → Read；放弃：HTTP 告警。",
  // Node: Endless
  "Park a branch indefinitely.": "让一个分支无限期驻留。",
  "Parks the current branch indefinitely. The workflow stays in the running state until the user hits Stop, so concurrent triggers (timer, on-notification, on-device-discovered) can keep firing. Has no outgoing edges.":
    "让当前分支无限期驻留。工作流保持运行状态，直到用户按下 Stop，因此并发触发器（timer、on-notification、on-device-discovered）可以持续触发。没有出向 edge。",
  "Notification-only flow": "仅通知流程",
  "Start → Connect → Subscribe → Endless. A parallel On Notification trigger reacts to inbound packets for as long as the run lasts.":
    "Start → Connect → Subscribe → Endless。一个并行的 On Notification 触发器会在整个运行期间响应收到的数据包。",
  "Background poller": "后台轮询器",
  "Start → Timer (every 30s) → Read Char → Append CSV; in parallel: Endless. The Endless branch keeps the run alive so the timer keeps ticking.":
    "Start → Timer（每 30 秒）→ Read Char → Append CSV；并行：Endless。Endless 分支让运行保持存活，使计时器持续走时。",
  // Node: If
  "Branch on a condition.": "按条件分支。",
  "Branches on a condition. Edge 0 = true, edge 1 = false. Compares a Source (variable, last RSSI, last hex, isConnected) against a Right-hand value using the chosen operator.":
    "按条件分支。edge 0 = true，edge 1 = false。使用所选运算符，将来源（variable、last RSSI、last hex、isConnected）与右值进行比较。",
  Source: "来源",
  "What the left-hand value is: variable looks up a stored variable; lastRSSI / lastReadHex / isConnected use runtime state.":
    "左值是什么：<code>variable</code> 查找已存储的变量；<code>lastRSSI</code> / <code>lastReadHex</code> / <code>isConnected</code> 使用运行时状态。",
  "Variable Name": "变量名",
  "Only shown when Source = variable. The name to look up.":
    "仅当 Source = variable 时显示。要查找的名称。",
  Operator: "运算符",
  "=, ≠, <, ≤, >, ≥, contains, starts with. Numeric ops parse both sides as numbers; others compare as strings.":
    "<code>=</code>、<code>≠</code>、<code><</code>、<code>≤</code>、<code>></code>、<code>≥</code>、<code>contains</code>、<code>starts with</code>。数值运算符将两侧解析为数字；其他则按字符串比较。",
  "Right-hand value": "右值",
  "Literal value (with ${var} interpolation). When both sides start with 0x they're auto-normalized for hex comparison.":
    "字面值（支持 <code>${var}</code> 插值）。当两侧都以 <code>0x</code> 开头时，会自动归一化以进行 hex 比较。",
  "Low-battery alert": "低电量告警",
  "Read Char (store as=battery) → If (variable=battery, <, 20) → true: HTTP Request.":
    "Read Char (store as=battery) → If (variable=battery, <, 20) → true：HTTP Request。",
  "Match a hex response": "匹配一个 hex 响应",
  "Subscribe → Wait Notification → If (lastReadHex, =, 0x AA 01) → true: continue.":
    "Subscribe → Wait Notification → If (lastReadHex, =, <code>0x AA 01</code>) → true：继续。",
  // Node: Wait Notification
  "Block until a notification arrives.": "阻塞，直到收到一个通知。",
  "Blocks the branch until a notification arrives on the characteristic, or the timeout elapses. The received bytes populate lastReadHex.":
    "阻塞该分支，直到特征值上收到通知，或超时到期。收到的字节会填充 <code>lastReadHex</code>。",
  "Must already be Subscribed.": "必须已经订阅。",
  "Match (hex)": "匹配（hex）",
  "Optional. If set, ignore notifications that don't equal these bytes.":
    "可选。若设置，则忽略与这些字节不相等的通知。",
  "Maximum wait. Leave empty for no timeout.": "最长等待时间。留空表示无超时。",
  "Optional variable name for the received bytes.":
    "用于接收字节的可选变量名。",
  "Wait for ack byte": "等待确认字节",
  "Write Char (cmd) → Wait Notification (match=0x AA, timeout=2) → If on lastReadHex.":
    "Write Char (cmd) → Wait Notification (match=<code>0x AA</code>, timeout=2) → 对 lastReadHex 做 If。",
  // Node: Assert
  "Fail the branch if a condition is false.": "如果条件为假，则使分支失败。",
  "Checks a condition and fails the step if it's false. Same operand/operator semantics as the If node, but doesn't branch — it terminates the branch on failure (or jumps to the nearest Try/Catch / Retry catch edge).":
    "检查一个条件，若为假则使该步骤失败。与 If 节点具有相同的操作数/运算符语义，但不分支——失败时终止该分支（或跳转到最近的 Try/Catch / Retry 的 catch edge）。",
  "Source / Operator / Value": "来源 / 运算符 / 值",
  "Same as If. Compares a variable, lastRSSI, lastReadHex, or isConnected against a literal value.":
    "与 If 相同。将 variable、lastRSSI、lastReadHex 或 isConnected 与一个字面值进行比较。",
  Message: "消息",
  "Optional human-readable message included in the failure entry. Defaults to the operand-vs-expected summary.":
    "失败条目中包含的可选可读消息。默认为操作数与期望值的对比摘要。",
  "Guard before write": "写入前守卫",
  "Read MTU (store as=mtu) → Assert (variable=mtu, ≥, 100) → Write Char (large payload).":
    "Read MTU (store as=mtu) → Assert (variable=mtu, ≥, 100) → Write Char（大负载）。",
  "Sanity check protocol": "协议合理性检查",
  "On Notification (store as=ack) → Assert (variable=ack, starts with, 0xAA01, msg=bad ack).":
    "On Notification (store as=ack) → Assert (variable=ack, starts with, <code>0xAA01</code>, msg=<code>bad ack</code>)。",
  // Node: Set Variable
  "Store a value into a named variable.": "将一个值存入命名变量。",
  "Stores a value into a named variable so later steps can reference it. The source can be a literal, another variable, last RSSI, last hex, or the connection state.":
    "将一个值存入命名变量，以便后续步骤引用。来源可以是字面量、另一个变量、last RSSI、last hex 或连接状态。",
  "Destination. Pick something the If / Transform / payload steps will reference.":
    "目标。选择一个 If / Transform / 负载 步骤会引用的名称。",
  "Where the value comes from: variable (literal or another variable), lastRSSI, lastReadHex, isConnected.":
    "值的来源：<code>variable</code>（字面量或另一个变量）、<code>lastRSSI</code>、<code>lastReadHex</code>、<code>isConnected</code>。",
  Literal: "字面量",
  "Only shown when Source = variable. If the text matches an existing variable name, that variable's value is used; otherwise it's stored as a literal string.":
    "仅当 Source = variable 时显示。如果文本与已有变量名匹配，则使用该变量的值；否则作为字面字符串存储。",
  "Snapshot RSSI": "快照 RSSI",
  "Read RSSI → Set Variable (name=rssi_at_start, source=lastRSSI).":
    "Read RSSI → Set Variable (name=rssi_at_start, source=lastRSSI)。",
  "Literal flag": "字面标志",
  "Set Variable (name=mode, source=variable, literal=night) → If (variable=mode, =, night).":
    "Set Variable (name=mode, source=variable, literal=<code>night</code>) → If (variable=mode, =, night)。",
  // Node: Transform
  "Convert hex ↔ UInt / Float / UTF-8.":
    "在 hex ↔ UInt / Float / UTF-8 之间转换。",
  "Converts a hex string into a decoded value (UInt8 / UInt16 / Float / UTF-8 / sliced bytes) or vice versa. Reads from lastReadHex if no input variable is set.":
    "将 hex 字符串转换为解码后的值（UInt8 / UInt16 / Float / UTF-8 / 切片字节），或反之。如果未设置输入变量，则从 <code>lastReadHex</code> 读取。",
  Operation: "操作",
  "hexToUtf8 (auto-trims NUL / whitespace), utf8ToHex, hexToUInt8/16/Int16/Float32 (LE/BE), hexSlice (offset + length).":
    "hexToUtf8（自动去除 NUL / 空白）、utf8ToHex、hexToUInt8/16/Int16/Float32（LE/BE）、hexSlice（偏移 + 长度）。",
  Input: "输入",
  "Source variable name. Empty = use lastReadHex.":
    "源变量名。留空 = 使用 lastReadHex。",
  Output: "输出",
  "Destination variable name. Required.": "目标变量名。必填。",
  "Offset / Length": "偏移 / 长度",
  "For hexSlice only. Byte offset from the start, and how many bytes to keep (0 = to end).":
    "仅用于 hexSlice。从起始处的字节偏移，以及保留多少字节（0 = 到末尾）。",
  "Decode a version string": "解码一个版本字符串",
  "Read Char → Transform (hexToUtf8, output=version) → If (variable=version, =, 3.4.4).":
    "Read Char → Transform (hexToUtf8, output=version) → If (variable=version, =, 3.4.4)。",
  "First-byte command": "首字节命令",
  "Subscribe → Wait Notif → Transform (hexSlice, offset=0, length=1, output=cmd_byte) → If (variable=cmd_byte, =, 0xAA).":
    "Subscribe → Wait Notif → Transform (hexSlice, offset=0, length=1, output=cmd_byte) → If (variable=cmd_byte, =, <code>0xAA</code>)。",
  // Node: Payload Parser
  "Parse a packet into named fields.": "将一个数据包解析为命名字段。",
  Fields: "字段",
  "Parses a hex payload into multiple named fields in one node — replaces a chain of Transform nodes when you have a structured packet with several offsets.":
    "在一个节点中将 hex 负载解析为多个命名字段——当你有一个带多个偏移的结构化数据包时，可替代一连串的 Transform 节点。",
  "One field per line: name offset length type [endian]. Types: hex, utf8, ascii, uint8/int8, uint16/int16, uint32/int32, float32, float64. length of 0 = to end. Endian (LE/BE) only required for multi-byte numeric types.":
    "每行一个字段：<code>name  offset  length  type  [endian]</code>。类型：hex、utf8、ascii、uint8/int8、uint16/int16、uint32/int32、float32、float64。<code>length</code> 为 0 = 到末尾。字节序（LE/BE）仅多字节数值类型需要。",
  "Sensor packet": "传感器数据包",
  "Read Char → Payload Parser: temp 0 2 int16 LE hum 2 1 uint8 flag 3 1 hex":
    "Read Char → Payload Parser：<br>temp 0 2 int16 LE<br>hum  2 1 uint8<br>flag 3 1 hex",
  // Node: Read RSSI
  "Read the current connection RSSI.": "读取当前连接的 RSSI。",
  "Reads the current RSSI of the active connection. Stored in the lastRSSI runtime slot and (optionally) into a named variable.":
    "读取活动连接的当前 RSSI。存储在运行时槽 <code>lastRSSI</code> 中，并（可选地）存入一个命名变量。",
  "Optional variable name.": "可选的变量名。",
  "Range check": "距离检查",
  'Read RSSI → If (lastRSSI, <, -85) → true: HTTP "link weak".':
    "Read RSSI → If (lastRSSI, <, -85) → true：HTTP “链路弱”。",
  // Node: Read MTU
  "Read the negotiated ATT MTU.": "读取协商得到的 ATT MTU。",
  "Reads the negotiated ATT MTU. macOS CoreBluetooth doesn't expose an API to request a specific MTU — this step just surfaces what the OS negotiated at connect time.":
    "读取协商得到的 ATT MTU。macOS 的 CoreBluetooth 未提供<em>请求</em>特定 MTU 的 API——此步骤只是呈现系统在连接时协商出的结果。",
  "Optional variable name for the MTU integer.": "用于 MTU 整数的可选变量名。",
  "Chunk sizing diagnostics": "分块大小诊断",
  "Connect → Read MTU (store as=mtu) → HTTP Request (body uses ${mtu}).":
    "Connect → Read MTU (store as=mtu) → HTTP Request（body 使用 <code>${mtu}</code>）。",
  // Node: HTTP Request
  "Send an HTTP request.": "发送一个 HTTP 请求。",
  "Sends an HTTP request to a URL with optional headers and body. Variables are interpolated with ${name}.":
    "向某个 URL 发送 HTTP 请求，带可选的头部和正文。变量使用 <code>${name}</code> 插值。",
  URL: "URL",
  "Full URL with ${var} allowed.": "完整 URL，允许使用 <code>${var}</code>。",
  Method: "方法",
  "GET / POST / PUT / DELETE / PATCH.": "GET / POST / PUT / DELETE / PATCH。",
  Headers: "头部",
  "Key: value pairs, one per line. Values support ${var}.":
    "键: 值 对，每行一个。值支持 <code>${var}</code>。",
  Body: "正文",
  "Raw body string. ${var} interpolation applies.":
    "原始正文字符串。应用 <code>${var}</code> 插值。",
  "Ship a reading": "上报一个读数",
  'Read Char (store as=temp) → HTTP Request (POST https://api.x/ingest, body={"temp":${temp}}).':
    'Read Char (store as=temp) → HTTP Request (POST https://api.x/ingest, body=<code>{"temp":${temp}}</code>)。',
  // Node: Append CSV
  "Append a row to a CSV file.": "向 CSV 文件追加一行。",
  "Appends a row to a CSV file on disk. Creates the file with the configured header on first run.":
    "向磁盘上的 CSV 文件追加一行。首次运行时用所配置的表头创建文件。",
  "File path": "文件路径",
  "Absolute path to the CSV file.": "CSV 文件的绝对路径。",
  Header: "表头",
  "Comma-separated column names. Written once when the file is created.":
    "以逗号分隔的列名。创建文件时写入一次。",
  Row: "行",
  "Comma-separated values. ${var} interpolation applies.":
    "以逗号分隔的值。应用 <code>${var}</code> 插值。",
  "Telemetry log": "遥测日志",
  "Loop: Read RSSI → Append CSV (header=ts,rssi, row=${now},${rssi}).":
    "循环：Read RSSI → Append CSV (header=<code>ts,rssi</code>, row=<code>${now},${rssi}</code>)。",
  // Node: Save File
  "Write a payload to disk in one shot.": "一次性将负载写入磁盘。",
  "Writes a payload to disk in one shot (overwrites if exists). Use for snapshots, not append-style logs.":
    "一次性将负载写入磁盘（若已存在则覆盖）。用于快照，而非追加式日志。",
  "Absolute path to the destination.": "目标的绝对路径。",
  Content: "内容",
  "Raw text content with ${var} interpolation.":
    "原始文本内容，支持 <code>${var}</code> 插值。",
  "Dump last read": "转储上一次读取",
  "Read Char → Save File (path=/tmp/last.bin, content=${lastReadHex}).":
    "Read Char → Save File (path=<code>/tmp/last.bin</code>, content=<code>${lastReadHex}</code>)。",
  // Request a node
  "Don't see the node you need?": "没找到你需要的节点？",
  "Signal Hub is shaped by the engineers who use it. Tell me what step is missing from your workflow and I'll prioritize it for the next release.":
    "Signal Hub 由使用它的工程师塑造。告诉我你的工作流缺少哪个步骤，我会在下一个版本中优先安排。",
  "Request a node →": "申请一个节点 →",
  // Demo
  "See it move": "看它运转",
  "A 60-second tour.": "60 秒速览。",
  "Concurrent connections, workflows, simulator, export — all in motion. The fastest way to feel what Signal Hub actually does.":
    "并发连接、工作流、模拟器、导出——全都在运转之中。这是感受 Signal Hub 真正能做什么的最快方式。",
  "Signal Hub 1.0.1 — recorded on macOS Sonoma":
    "Signal Hub 1.0.1 — 录制于 macOS Sonoma",
  // CTA
  "Build with BLE, finally enjoyable.": "用 BLE 开发，终于变得愉快。",
  "Signal Hub is in private beta on macOS. If you spend your days talking to BLE peripherals, we'd love to hand you the keys.":
    "Signal Hub 正在 macOS 上进行私有测试。如果你每天都在与 BLE 外设打交道，我们很乐意把钥匙交给你。",
  "Request beta access": "申请测试资格",
  "Back to the blog": "返回博客",
  // Footer
  "Designed & built by Uy Nguyen — crafted for engineers who live in the BLE stack.":
    "由 <a href='/'>Uy Nguyen</a> 设计与构建——为生活在 BLE 协议栈中的工程师精心打造。",
  Blog: "博客",
  Archives: "归档",
  Contact: "联系",
};

/* ===================== 日本語 ===================== */
SH_TRANSLATIONS.ja = {
  // Nav
  Connect: "接続",
  Workflows: "ワークフロー",
  Simulate: "シミュレート",
  Export: "エクスポート",
  Demo: "デモ",
  "Get Signal Hub": "Signal Hub を入手",
  // Hero
  "BLE Testing · Workflow Automation · Device Simulator · macOS":
    "BLE テスト · ワークフロー自動化 · デバイスシミュレーター · macOS",
  "The BLE workbench, reimagined for Mac.":
    "BLE のワークベンチを、<br><span class='accent'>Mac のために再構築。</span>",
  "Signal Hub is a Mac app for Bluetooth Low Energy (BLE) testing and automation. Scan and connect to many BLE devices at once, build visual workflows that run on real hardware, simulate peripherals when the prototype hasn't shipped, and export PNG / video documentation — all from one elegant macOS app.":
    "Signal Hub は <strong>Bluetooth Low Energy（BLE）のテストと自動化のための Mac アプリ</strong>です。多数の BLE デバイスを一度にスキャンして接続し、実機上で動作するビジュアルなワークフローを構築し、試作機がまだ届いていないときには周辺機器をシミュレートし、PNG / 動画のドキュメントを書き出す——そのすべてを、ひとつの洗練された macOS アプリで行えます。",
  "Download for macOS →": "macOS 版をダウンロード →",
  "Watch demo →": "デモを見る →",
  // Feature 1
  "Concurrent BLE": "同時 BLE",
  "Many devices. One calm cockpit.":
    "多くのデバイスを、<br>ひとつの静かなコックピットで。",
  "Signal Hub treats every BLE connection as a first-class citizen. Scan the room, connect to multiple peripherals in parallel, and switch between them without losing context. Read, write, and subscribe to characteristics with one click — and watch traffic stream in real time.":
    "Signal Hub はすべての BLE 接続を第一級の存在として扱います。周囲をスキャンし、複数の周辺機器に並行して接続し、コンテキストを失うことなく切り替えられます。キャラクタリスティックの読み取り・書き込み・購読をワンクリックで行い——トラフィックをリアルタイムに観察できます。",
  "Concurrent scan & connect across as many devices as your radio can hold":
    "無線が許す限りのデバイス数で、同時にスキャンと接続",
  "Per-device sessions with live characteristic explorer and notification stream":
    "デバイスごとのセッションに、ライブのキャラクタリスティックエクスプローラーと通知ストリームを搭載",
  "Smart filters: name, RSSI, service UUID, manufacturer data":
    "スマートフィルター：名前、RSSI、サービス UUID、メーカーデータ",
  "Auto-reconnect, pairing, and bond management built in":
    "自動再接続、ペアリング、ボンド管理を標準搭載",
  Scan: "スキャン",
  "GATT explorer": "GATT エクスプローラー",
  Notifications: "通知",
  // Feature 2
  "Visual workflows": "ビジュアルワークフロー",
  "Your test plan, drawn into reality.":
    "あなたのテスト計画を、<br>そのまま現実へ。",
  "Drag, drop, and connect nodes to compose any BLE flow — handshake, OTA, telemetry, edge cases. Each node is a real BLE action. Hit run, and Signal Hub executes the entire workflow against your device, with full visibility into every step.":
    "ノードをドラッグ＆ドロップでつなげて、あらゆる BLE フローを構成できます——ハンドシェイク、OTA、テレメトリ、エッジケース。各ノードは実際の BLE アクションです。実行を押せば、Signal Hub がワークフロー全体をあなたのデバイスに対して実行し、各ステップを余すところなく可視化します。",
  "Composable nodes: scan, connect, write, read, wait, branch, assert":
    "組み合わせ可能なノード：スキャン、接続、書き込み、読み取り、待機、分岐、アサート",
  "Loop, retry, and conditional logic without writing a line of code":
    "1 行もコードを書かずにループ、リトライ、条件分岐を実現",
  "Run once or schedule for regression — the workflow is the spec":
    "一度実行、あるいは回帰用にスケジュール——ワークフローこそが仕様です",
  "Version-controlled workspaces keep the team in sync":
    "バージョン管理されたワークスペースでチームを同期",
  // Feature 2b
  Workspaces: "ワークスペース",
  "A home for every project.": "すべてのプロジェクトに、<br>ひとつの居場所を。",
  "Organize devices, workflows, and notes into workspaces. Each one is a self-contained context — switch projects with a click. Share a workspace with a teammate and they pick up exactly where you left off.":
    "デバイス、ワークフロー、メモを<strong>ワークスペース</strong>に整理します。それぞれが自己完結したコンテキストで——ワンクリックでプロジェクトを切り替えられます。ワークスペースを仲間と共有すれば、あなたが中断したところからそのまま続けられます。",
  "Per-workspace devices, workflows, and assets":
    "ワークスペースごとのデバイス、ワークフロー、アセット",
  "Local-first storage with export anywhere":
    "ローカルファーストのストレージで、どこへでもエクスポート",
  "Built for teams: open the same workspace, get the same view":
    "チームのために設計：同じワークスペースを開けば、同じビューに",
  // Feature 3
  "Live binding": "ライブバインディング",
  "Bind real devices to every node — live.":
    "実機を各ノードに<br>バインド——ライブで。",
  "Connect a workflow to physical hardware in seconds. Pick a discovered peripheral, bind it to a node, and watch the workflow drive the device for real — no scripts, no fixtures, no detours through a terminal.":
    "ワークフローを数秒で実機ハードウェアに接続します。発見した周辺機器を選んでノードにバインドし、ワークフローが実際にデバイスを動かす様子を確認できます——スクリプトも、治具も、ターミナル経由の回り道も不要です。",
  "Real-time binding of any discovered peripheral to any node":
    "発見済みのあらゆる周辺機器を、あらゆるノードにリアルタイムでバインド",
  "Inspect responses, latency, and characteristic values as the workflow runs":
    "ワークフローの実行中に、応答・レイテンシ・キャラクタリスティック値を確認",
  "Step through, pause, and re-run — debug like you would code":
    "ステップ実行、一時停止、再実行——コードと同じようにデバッグ",
  // Feature 4
  "Built-in simulator": "内蔵シミュレーター",
  "No hardware? No problem.": "ハードウェアがない？<br>問題ありません。",
  "The built-in BLE simulator stands in for any peripheral. Mock services, characteristics, and responses — including the gnarly edge cases that real hardware refuses to reproduce. Build, test, and demo your workflows before the prototype hits your desk.":
    "内蔵の BLE シミュレーターが、あらゆる周辺機器の代わりを務めます。サービス、キャラクタリスティック、応答をモック化——実機が再現を拒むような厄介なエッジケースも含めて。試作機が机に届く前に、ワークフローを構築・テスト・デモできます。",
  "Define virtual peripherals with any service / characteristic shape":
    "任意のサービス / キャラクタリスティック構成で仮想周辺機器を定義",
  "Scripted responses, delays, and failure modes — reproduce real bugs on demand":
    "スクリプト化された応答、遅延、障害モード——実際のバグをオンデマンドで再現",
  "Mix and match: real devices and simulated ones in the same workflow":
    "自由に組み合わせ：同じワークフロー内で実機とシミュレーションを併用",
  "Mock services": "モックサービス",
  "Scripted responses": "スクリプト化応答",
  "Edge cases": "エッジケース",
  // Feature 5
  "Share & document": "共有とドキュメント化",
  "Beautiful artifacts, one click away.":
    "美しい成果物を、<br>ワンクリックで。",
  "Export any workflow as a high-resolution PNG, a screen recording, or a compact summary — ready to drop into a PR, a spec, or a customer report. Documentation becomes a by-product of building, not a chore.":
    "あらゆるワークフローを高解像度の PNG、画面録画、またはコンパクトなサマリーとして書き出せます——PR、仕様書、顧客向けレポートにそのまま貼り付け可能。ドキュメント作成は面倒な作業ではなく、構築の副産物になります。",
  "One-click PNG export with crisp typography and clear edges":
    "くっきりとしたタイポグラフィと明瞭なエッジで、ワンクリック PNG エクスポート",
  "Video export of a live workflow run for demos and bug reports":
    "デモやバグ報告のために、ライブ実行を動画でエクスポート",
  "Auto-generated run summaries: steps, timings, outcomes":
    "自動生成される実行サマリー：ステップ、所要時間、結果",
  "PNG export": "PNG エクスポート",
  "Workflows rendered at retina resolution, ready for documentation, PRs, or slide decks.":
    "Retina 解像度でレンダリングされたワークフロー。ドキュメント、PR、スライド資料にすぐ使えます。",
  "Video capture": "動画キャプチャ",
  "Record a live run with all device traffic overlaid. Perfect for demos and bug reports.":
    "すべてのデバイストラフィックを重ねてライブ実行を録画。デモやバグ報告に最適です。",
  "Run summaries": "実行サマリー",
  "Every workflow run produces a structured summary — steps, timing, results, errors.":
    "ワークフローを実行するたびに、構造化されたサマリーが生成されます——ステップ、所要時間、結果、エラー。",
  "Concurrent devices": "同時接続デバイス数",
  "Lines of code required": "必要なコード行数",
  "Local-first": "ローカルファースト",
  "PNG & video export": "PNG・動画エクスポート",
  // Nodes header
  "Workflow nodes": "ワークフローノード",
  "53 building blocks. One workflow.":
    "53 個のビルディングブロック。<br>ひとつのワークフロー。",
  "Each node is a single BLE action — scan, connect, read, branch, wait. Snap them together on the canvas and you've described a complete protocol exchange, ready to run on a real device or the built-in simulator.":
    "各ノードはひとつの BLE アクションです——スキャン、接続、読み取り、分岐、待機。キャンバス上でつなぎ合わせれば、完全なプロトコルのやり取りを記述したことになり、実機でも内蔵シミュレーターでもすぐに実行できます。",
  "Show all nodes": "すべてのノードを表示",
  "Hide all nodes": "すべてのノードを非表示",
  // Category headers
  "Control — 3 nodes": "制御 — 3 ノード",
  "Triggers — 6 nodes": "トリガー — 6 ノード",
  "Scan — 2 nodes": "スキャン — 2 ノード",
  "Connection — 2 nodes": "接続 — 2 ノード",
  "Discovery — 2 nodes": "ディスカバリー — 2 ノード",
  "Read / Write — 4 nodes": "読み取り / 書き込み — 4 ノード",
  "Notify — 2 nodes": "通知 — 2 ノード",
  "Flow — 9 nodes": "フロー — 9 ノード",
  "Logic — 3 nodes": "ロジック — 3 ノード",
  "Data — 3 nodes": "データ — 3 ノード",
  "Link — 2 nodes": "リンク — 2 ノード",
  "Egress — 3 nodes": "送出 — 3 ノード",
  // Shared block heads
  Attributes: "属性",
  "Example use cases": "ユースケース例",
  // Node: Start
  "Entry point of the workflow.": "ワークフローのエントリーポイント。",
  "Entry point of the workflow. Exactly one Start node is allowed — execution begins here when you press Run.":
    "ワークフローのエントリーポイント。Start ノードはちょうど 1 つだけ許可されます——Run を押すとここから実行が始まります。",
  "Every workflow": "あらゆるワークフロー",
  "Drop a Start node, wire its output into your first real step (Start Scan, Connect, etc.). Without it, Run is disabled.":
    "Start ノードを配置し、その出力を最初の実ステップ（Start Scan、Connect など）につなぎます。これがないと Run は無効になります。",
  // Node: End
  "Terminates a branch cleanly.": "ブランチをきれいに終了します。",
  "Terminates a branch cleanly. Optional — branches that reach a dead end also stop, but End makes the intent explicit.":
    "ブランチをきれいに終了します。任意です——行き止まりに達したブランチも停止しますが、End は意図を明示します。",
  "Mark a success path": "成功パスを示す",
  'If/true → HTTP Request → End. The End makes "this branch is done" visible in the run log.':
    "If/true → HTTP Request → End。End によって「このブランチは完了」が実行ログ上で見えるようになります。",
  // Node: On Device Discovered
  "Blocks until a matching advertisement is seen.":
    "一致するアドバタイズが見えるまでブロックします。",
  "Blocks until a peripheral advertisement matches the configured filters (name substring, manufacturer-data hex prefix, RSSI threshold). Auto-starts a scan unless disabled.":
    "周辺機器のアドバタイズが、設定したフィルター（名前の部分文字列、メーカーデータの hex プレフィックス、RSSI しきい値）に一致するまでブロックします。無効化しない限り、自動的にスキャンを開始します。",
  "Name match": "名前の一致",
  "Case-insensitive substring required in the advertised local name. Empty = don't filter on name.":
    "アドバタイズされるローカル名に含まれている必要がある部分文字列（大文字小文字を区別しない）。空 = 名前で絞り込まない。",
  "Manufacturer (hex)": "メーカー（hex）",
  "Hex prefix the device's manufacturer data must start with. Common pattern: 4C00 for Apple beacons.":
    "デバイスのメーカーデータが先頭に持つべき hex プレフィックス。よくあるパターン：Apple のビーコンでは <code>4C00</code>。",
  "Min RSSI": "最小 RSSI",
  "Drop advertisements weaker than this dBm value. Off = no threshold.":
    "この dBm 値より弱いアドバタイズを破棄します。オフ = しきい値なし。",
  "Auto scan": "自動スキャン",
  "When on, starts a scan on entry and stops it on match. Turn off if an upstream Start Scan already configured filters.":
    "オンのとき、ノード進入時にスキャンを開始し、一致時に停止します。上流の Start Scan で既にフィルターを設定済みならオフにします。",
  "Timeout (s)": "タイムアウト（秒）",
  "Maximum wait. Empty = wait forever.": "最大待機時間。空 = 無期限に待機。",
  "Store as": "保存先",
  "Optional variable that receives the matched device address.":
    "一致したデバイスアドレスを受け取る任意の変数。",
  "Wait for a known sensor": "既知のセンサーを待つ",
  "On Device Discovered (name=SignalHub, rssi ≥ -75) → Connect (uses stored mac).":
    "On Device Discovered (name=<code>SignalHub</code>, rssi ≥ -75) → Connect（保存した mac を使用）。",
  // Node: On Device Connected
  "Blocks until a connect event fires.":
    "接続イベントが発生するまでブロックします。",
  "Blocks until a connect event fires. Optionally filters by mac so the trigger only resumes when a specific device comes online.":
    "接続イベントが発生するまでブロックします。任意で mac により絞り込み、特定のデバイスがオンラインになったときだけトリガーが再開するようにできます。",
  "Device address": "デバイスアドレス",
  "Optional mac. Empty = match any connect.":
    "任意の mac。空 = 任意の接続に一致。",
  "Optional variable that receives the connected device address.":
    "接続されたデバイスアドレスを受け取る任意の変数。",
  "Coordinate with external connect": "外部の接続と連携",
  "On Device Connected (mac=AA:BB:…) → Discover Services → Read Char.":
    "On Device Connected (mac=<code>AA:BB:…</code>) → Discover Services → Read Char。",
  // Node: On Device Disconnected
  "Blocks until a disconnect event fires.":
    "切断イベントが発生するまでブロックします。",
  "Blocks until a disconnect event fires. Used to react to peripherals dropping the link without polling.":
    "切断イベントが発生するまでブロックします。ポーリングせずに、周辺機器のリンク切断に反応するために使います。",
  "Optional mac. Empty = match any disconnect.":
    "任意の mac。空 = 任意の切断に一致。",
  "Optional variable receiving the disconnected mac.":
    "切断された mac を受け取る任意の変数。",
  "Telemetry on drop": "切断時のテレメトリ",
  "On Device Disconnected → HTTP Request (alert).":
    "On Device Disconnected → HTTP Request（アラート）。",
  // Node: On Notification
  "Blocks until a matching notification arrives.":
    "一致する通知が届くまでブロックします。",
  "Blocks until a characteristic notification matches the optional hex prefix. Auto-subscribes to the characteristic before listening so a separate Subscribe step isn't required.":
    "キャラクタリスティックの通知が任意の hex プレフィックスに一致するまでブロックします。リッスン前にそのキャラクタリスティックへ自動購読するため、別途 Subscribe ステップは不要です。",
  "Characteristic UUID": "キャラクタリスティック UUID",
  "Target characteristic. Must be notifiable or indicatable.":
    "対象のキャラクタリスティック。notify または indicate に対応している必要があります。",
  "Match prefix (hex)": "一致プレフィックス（hex）",
  "Optional hex prefix the payload must start with. Empty = match any notification.":
    "ペイロードが先頭に持つべき任意の hex プレフィックス。空 = 任意の通知に一致。",
  "Optional variable that receives the matched payload as hex.":
    "一致したペイロードを hex として受け取る任意の変数。",
  "Wait for boot notification": "起動通知を待つ",
  "Connect → On Notification (uuid=…, match=AA01) → continue.":
    "Connect → On Notification (uuid=…, match=<code>AA01</code>) → 続行。",
  // Node: Timer
  "Wait on a delay, interval, or exact date.":
    "遅延・間隔・正確な日時のいずれかで待機します。",
  "Waits on a time condition before continuing. After delay = one-shot wait. Interval = self-looping periodic tick that runs forever until stopped. Exact date = wait until an ISO-8601 timestamp.":
    "続行する前に時間条件を待ちます。<strong>After delay</strong> = 一回限りの待機。<strong>Interval</strong> = 停止されるまで永遠に動く、自己ループの周期的ティック。<strong>Exact date</strong> = ISO-8601 のタイムスタンプまで待機。",
  Mode: "モード",
  "After delay: wait N seconds, then take edge 1 once. Interval: fire repeatedly on each N-second boundary. Exact date: wait until ISO-8601 timestamp.":
    "After delay：N 秒待ってから edge 1 を一度通ります。Interval：N 秒ごとの境界で繰り返し発火します。Exact date：ISO-8601 のタイムスタンプまで待ちます。",
  Seconds: "秒数",
  "Delay or interval length for After / Interval modes.":
    "After / Interval モードでの遅延または間隔の長さ。",
  "Date (ISO-8601)": "日時（ISO-8601）",
  "Used in Exact date mode (e.g. 2026-12-31T23:00:00Z). Past dates fire immediately.":
    "Exact date モードで使用します（例：<code>2026-12-31T23:00:00Z</code>）。過去の日時は即座に発火します。",
  Name: "名前",
  "Optional identifier referenced by a Stop Timer node. Defaults to the node's label.":
    "Stop Timer ノードから参照される任意の識別子。既定はノードのラベル。",
  "Forever-periodic poll": "無期限の周期ポーリング",
  "Start → Timer (interval, 5s) → Read Char. The Read fires every 5s; press Stop to end the workflow.":
    "Start → Timer (interval, 5s) → Read Char。Read は 5 秒ごとに発火します。Stop を押すとワークフローが終了します。",
  "Bounded periodic poll": "回数制限のある周期ポーリング",
  "Repeat (10) → Timer (after, 5s) → Read Char. Body executes exactly 10 times spaced 5s apart.":
    "Repeat (10) → Timer (after, 5s) → Read Char。本体は 5 秒間隔でちょうど 10 回実行されます。",
  "Scheduled run": "スケジュール実行",
  "Start → Timer (exactDate, 2026-12-31T23:00:00Z) → Start Scan → …":
    "Start → Timer (exactDate, <code>2026-12-31T23:00:00Z</code>) → Start Scan → …",
  // Node: Stop Timer
  "Cancels a running Timer by name.": "実行中の Timer を名前で取り消します。",
  "Cancels a running Timer node addressed by name. The targeted timer's pending wait is disposed immediately, no more ticks fire. Other branches and timers keep running.":
    "名前で指定した実行中の Timer ノードを取り消します。対象タイマーの保留中の待機は即座に破棄され、以降ティックは発火しません。他のブランチやタイマーは動作を続けます。",
  "Timer name": "タイマー名",
  "Must match the target Timer node's Name field. Stopping by name lets one workflow run many timers and cancel them independently.":
    "対象 Timer ノードの Name フィールドと一致している必要があります。名前で停止することで、ひとつのワークフローが多数のタイマーを動かし、それぞれ独立に取り消せます。",
  "Stop on condition": "条件で停止",
  "Timer (name=poll, interval, 5s) → Read Char → If (battery, <, 5) → true: Stop Timer (poll) → HTTP alert.":
    "Timer (name=poll, interval, 5s) → Read Char → If (battery, <, 5) → true：Stop Timer (poll) → HTTP アラート。",
  "Race two timers": "2 つのタイマーを競わせる",
  "Parallel → branch 1: Timer (name=A, interval, 1s) → … ; branch 2: Timer (name=B, after, 30s) → Stop Timer (A). After 30s the fast poller stops.":
    "Parallel → ブランチ 1：Timer (name=A, interval, 1s) → … ；ブランチ 2：Timer (name=B, after, 30s) → Stop Timer (A)。30 秒後に高速ポーラーが停止します。",
  // Node: Start Scan
  "Begins a BLE scan asynchronously.": "BLE スキャンを非同期に開始します。",
  "Begins a BLE scan. Continues running asynchronously; subsequent steps execute immediately without waiting for results.":
    "BLE スキャンを開始します。非同期に動作を続け、後続のステップは結果を待たずに直ちに実行されます。",
  "Service UUID": "サービス UUID",
  "Optional. When set, only devices advertising this service appear in scan results. Empty = scan everything.":
    "任意。設定すると、このサービスをアドバタイズするデバイスだけがスキャン結果に表示されます。空 = すべてをスキャン。",
  "Allow duplicates": "重複を許可",
  "When on, the same device produces multiple advertisement events. Useful for live RSSI tracking; off for one-shot discovery.":
    "オンのとき、同じデバイスが複数のアドバタイズイベントを生成します。RSSI のライブ追跡に便利です。一回限りの発見にはオフにします。",
  "Find a known device by service": "サービスで既知のデバイスを探す",
  "Start Scan (svc=180D) → Delay 3s → Stop Scan → Connect (mac from scan results).":
    "Start Scan (svc=180D) → Delay 3s → Stop Scan → Connect（スキャン結果の mac）。",
  // Node: Stop Scan
  "Stops an in-progress scan.": "進行中のスキャンを停止します。",
  "Stops an in-progress scan. Pair with Start Scan when you want a bounded discovery window.":
    "進行中のスキャンを停止します。発見の時間枠を区切りたいときは Start Scan と組み合わせます。",
  "Bounded scan": "時間を区切ったスキャン",
  "Start Scan → Delay 5s → Stop Scan. Without Stop Scan the radio keeps scanning until the workflow ends.":
    "Start Scan → Delay 5s → Stop Scan。Stop Scan がないと、ワークフローが終わるまで無線はスキャンし続けます。",
  // Node: Connect
  "Connects to a peripheral by MAC.": "MAC で周辺機器に接続します。",
  'Connects to a peripheral by MAC. Resolves on "connected" — i.e. CoreBluetooth fired didConnect and the link is up.':
    "MAC で周辺機器に接続します。「connected」で解決します——つまり CoreBluetooth が didConnect を発火し、リンクが確立した状態です。",
  Device: "デバイス",
  "Pick from the live device list (populated by Start Scan / known devices). The selected MAC becomes the workflow's active device for downstream BLE steps.":
    "ライブのデバイス一覧（Start Scan / 既知デバイスにより生成）から選びます。選択した MAC が、以降の BLE ステップにおけるワークフローのアクティブデバイスになります。",
  "Connect then read": "接続してから読み取り",
  "Connect (chosen device) → Discover Services → Read Char (battery level).":
    "Connect（選んだデバイス）→ Discover Services → Read Char（バッテリー残量）。",
  "Reconnect on disconnect": "切断時に再接続",
  "Try/Catch around Connect. On the catch path, Delay 1s → Connect again.":
    "Connect を Try/Catch で囲みます。catch パスで Delay 1s → 再度 Connect。",
  // Node: Disconnect
  "Closes the active connection.": "アクティブな接続を閉じます。",
  "Closes the active connection. Always good practice at the end of a workflow so the peripheral is free for other apps.":
    "アクティブな接続を閉じます。周辺機器を他のアプリに解放するため、ワークフローの最後に行うのが常に良い習慣です。",
  "Defaults to the active device. Override only if you've connected to multiple peripherals in the same workflow.":
    "既定はアクティブデバイスです。同じワークフロー内で複数の周辺機器に接続した場合にのみ上書きします。",
  "Clean teardown": "きれいな後始末",
  "… → Read Char → Disconnect → End.": "… → Read Char → Disconnect → End。",
  // Node: Discover Services
  "Enumerate the peripheral's services.": "周辺機器のサービスを列挙します。",
  "Asks the peripheral to enumerate its services. Required before reading/writing characteristics on most devices.":
    "周辺機器にそのサービスの列挙を要求します。ほとんどのデバイスでは、キャラクタリスティックの読み書きの前に必要です。",
  "Standard prep": "標準的な下準備",
  "Connect → Discover Services → Discover Characteristics → Read Char.":
    "Connect → Discover Services → Discover Characteristics → Read Char。",
  // Node: Discover Characteristics
  "Enumerate characteristics under each service.":
    "各サービス配下のキャラクタリスティックを列挙します。",
  "Enumerates the characteristics under each discovered service. Run after Discover Services.":
    "発見した各サービス配下のキャラクタリスティックを列挙します。Discover Services の後に実行します。",
  "Walk the GATT": "GATT をたどる",
  "Connect → Discover Services → Discover Characteristics. Now Read/Write/Subscribe can target any UUID.":
    "Connect → Discover Services → Discover Characteristics。これで Read/Write/Subscribe が任意の UUID を対象にできます。",
  // Node: Read Char
  "Read a characteristic's current value.":
    "キャラクタリスティックの現在値を読み取ります。",
  "Reads the current value of a characteristic. Resolves with raw bytes; the bytes are stored in lastReadHex and (optionally) into a named variable.":
    "キャラクタリスティックの現在値を読み取ります。生のバイト列で解決され、そのバイト列は <code>lastReadHex</code> に、また（任意で）名前付き変数に格納されます。",
  "Standard short (0x2A19) or 128-bit UUID. The picker fills this in from the discovered list.":
    "標準の短い UUID（<code>0x2A19</code>）または 128 ビット UUID。ピッカーが発見済み一覧から自動入力します。",
  "Value format / endian": "値のフォーマット / エンディアン",
  "How the result is decoded for display on the node card. Doesn't change lastReadHex — only the human-readable view.":
    "結果をノードカード上に表示するためにどうデコードするか。<code>lastReadHex</code> は変更せず——人が読める表示だけが変わります。",
  "Optional variable name. The decoded value is stored under this name for use by downstream If / Transform steps.":
    "任意の変数名。デコードした値はこの名前で格納され、下流の If / Transform ステップで使えます。",
  "Battery snapshot": "バッテリーのスナップショット",
  "Connect → Discover … → Read Char (0x2A19, format=UInt8, store as=battery).":
    "Connect → Discover … → Read Char (<code>0x2A19</code>, format=UInt8, store as=battery)。",
  "Conditional logic": "条件ロジック",
  'Read Char → If (variable=battery, <, 20) → HTTP Request ("low battery").':
    "Read Char → If (variable=battery, <, 20) → HTTP Request（「バッテリー低下」）。",
  // Node: Write Char
  "Write bytes to a characteristic.":
    "キャラクタリスティックにバイトを書き込みます。",
  "Writes bytes to a characteristic. Supports hex (DE AD) or text payloads, and chooses write-with/without-response automatically based on the characteristic's properties.":
    "キャラクタリスティックにバイトを書き込みます。hex（<code>DE AD</code>）またはテキストのペイロードに対応し、キャラクタリスティックのプロパティに基づいて応答あり/なしの書き込みを自動選択します。",
  "Target characteristic.": "対象のキャラクタリスティック。",
  Payload: "ペイロード",
  "Hex bytes (DE AD BE EF) or ${var} interpolations. The executor chunks payloads larger than the negotiated MTU automatically.":
    "hex バイト（<code>DE AD BE EF</code>）または <code>${var}</code> 補間。エグゼキューターは、ネゴシエートした MTU を超えるペイロードを自動的に分割します。",
  "Wake a sensor": "センサーを起こす",
  "Connect → Discover … → Write Char (0xFF03, payload=01).":
    "Connect → Discover … → Write Char (<code>0xFF03</code>, payload=<code>01</code>)。",
  "Send a variable": "変数を送る",
  "Set Variable (cmd=AA01) → Write Char (payload=${cmd}).":
    "Set Variable (cmd=<code>AA01</code>) → Write Char (payload=<code>${cmd}</code>)。",
  // Node: Read Descriptor
  "Read a GATT descriptor value.": "GATT ディスクリプタの値を読み取ります。",
  "Reads a GATT descriptor (e.g. Characteristic User Description 0x2901, Format 0x2904, or the current notify-state bits in the CCCD 0x2902).":
    "GATT ディスクリプタを読み取ります（例：Characteristic User Description <code>0x2901</code>、Format <code>0x2904</code>、または CCCD <code>0x2902</code> 内の現在の notify 状態ビット）。",
  "Parent characteristic.": "親キャラクタリスティック。",
  "Descriptor UUID": "ディスクリプタ UUID",
  "Standard short (0x2901, 0x2902, 0x2904) or 128-bit UUID.":
    "標準の短い UUID（<code>0x2901</code>、<code>0x2902</code>、<code>0x2904</code>）または 128 ビット UUID。",
  "Decoding for the result display.": "結果表示のためのデコード。",
  "Read a friendly name": "わかりやすい名前を読む",
  "Read Descriptor (char=…, desc=0x2901, format=text).":
    "Read Descriptor (char=…, desc=<code>0x2901</code>, format=text)。",
  // Node: Write Descriptor
  "Write to a GATT descriptor (not CCCD).":
    "GATT ディスクリプタ（CCCD 以外）に書き込みます。",
  "Writes bytes to a writable GATT descriptor. ⚠️ macOS blocks writes to the CCCD (0x2902) — use Subscribe instead. Useful for the rare devices that expose other writable descriptors.":
    "書き込み可能な GATT ディスクリプタにバイトを書き込みます。⚠️ macOS は CCCD（<code>0x2902</code>）への書き込みをブロックします——代わりに Subscribe を使ってください。他に書き込み可能なディスクリプタを公開する、まれなデバイスに有用です。",
  "Target descriptor — anything other than 0x2902.":
    "対象ディスクリプタ——<code>0x2902</code> 以外の任意のもの。",
  "Payload (hex)": "ペイロード（hex）",
  "Bytes to write.": "書き込むバイト。",
  "Set custom config": "カスタム設定を行う",
  "Write Descriptor (char=…, desc=0xFFD1, payload=01).":
    "Write Descriptor (char=…, desc=<code>0xFFD1</code>, payload=<code>01</code>)。",
  // Node: Subscribe
  "Enable notifications on a characteristic.":
    "キャラクタリスティックの通知を有効にします。",
  "Enables notifications/indications on a characteristic. Subsequent notifications populate lastReadHex and fire Wait Notification steps.":
    "キャラクタリスティックの notification/indication を有効にします。以降の通知は <code>lastReadHex</code> を埋め、Wait Notification ステップを発火させます。",
  "Live stream": "ライブストリーム",
  "Subscribe (heart rate) → Wait Notification (5s) → Set Variable (hr = lastReadHex). Loop with Repeat.":
    "Subscribe（心拍数）→ Wait Notification (5s) → Set Variable (hr = lastReadHex)。Repeat でループ。",
  // Node: Unsubscribe
  "Turn off notifications for a characteristic.":
    "キャラクタリスティックの通知をオフにします。",
  "Turns off notifications for a characteristic. Useful when a workflow has multiple subscribe/unsubscribe phases.":
    "キャラクタリスティックの通知をオフにします。ワークフローに複数の購読/購読解除フェーズがあるときに便利です。",
  "Same UUID as the Subscribe step you want to stop.":
    "停止したい Subscribe ステップと同じ UUID。",
  "Bounded listen window": "区切られたリッスン期間",
  "Subscribe → Delay 10s → Unsubscribe → Disconnect.":
    "Subscribe → Delay 10s → Unsubscribe → Disconnect。",
  // Node: Repeat
  "Loop N times, then take the exit edge.":
    "N 回ループし、その後に出口エッジへ進みます。",
  "Loops its first output edge N times, then takes the second output (exit) once. Body executions are numbered (#1, #2, …) in the run log.":
    "最初の出力エッジを N 回ループし、その後に 2 番目の出力（出口）を一度通ります。本体の各実行は実行ログ内で番号付け（<code>#1</code>、<code>#2</code>、…）されます。",
  Times: "回数",
  "Number of iterations of the body branch before falling through to the exit branch.":
    "出口ブランチへ抜ける前に本体ブランチを反復する回数。",
  "Poll a value": "値をポーリング",
  "Repeat (10) → body: Read Char → Delay 1s. Exit: Disconnect.":
    "Repeat (10) → 本体：Read Char → Delay 1s。出口：Disconnect。",
  // Node: Delay
  "Pause this branch for N seconds.": "このブランチを N 秒間一時停止します。",
  "Pauses the branch for a fixed duration. Other parallel branches keep running.":
    "ブランチを一定時間一時停止します。他の並列ブランチは動作を続けます。",
  "Duration (s)": "時間（秒）",
  "Seconds to wait before continuing. Floats are fine (0.25 = 250 ms).":
    "続行前に待つ秒数。小数も可（0.25 = 250 ミリ秒）。",
  "Settle after connect": "接続後に落ち着かせる",
  "Connect → Delay 0.5s → Discover Services (some peripherals need a beat).":
    "Connect → Delay 0.5s → Discover Services（少し間を必要とする周辺機器もあります）。",
  // Node: Parallel
  "Fan out into concurrent branches.": "並行ブランチへ展開します。",
  "Fans out into multiple branches that run concurrently. Each outgoing edge starts its own execution token.":
    "同時に実行される複数のブランチへ展開します。各出力エッジが独自の実行トークンを開始します。",
  "Read two characteristics at once":
    "2 つのキャラクタリスティックを同時に読む",
  "Parallel → branch 1: Read Char A; branch 2: Read Char B → Join (waits for both).":
    "Parallel → ブランチ 1：Read Char A；ブランチ 2：Read Char B → Join（両方を待つ）。",
  // Node: Join
  "Wait for every incoming branch.": "入ってくるすべてのブランチを待ちます。",
  "Counterpart to Parallel: waits until every incoming edge has delivered a token before continuing downstream.":
    "Parallel の対になるノード：入ってくる各エッジがトークンを届けるまで待ってから、下流へ続行します。",
  "Fan-out / fan-in": "ファンアウト / ファンイン",
  "Parallel → 3 branches do Read/Read/HTTP → Join → continue.":
    "Parallel → 3 つのブランチで Read/Read/HTTP → Join → 続行。",
  // Node: Try / Catch
  "Recover from failures on a branch.": "ブランチの失敗から回復します。",
  "Wraps its protected branch (edge 0). If any downstream step on that branch fails, execution jumps to the catch branch (edge 1) instead of failing the workflow.":
    "保護対象ブランチ（edge 0）を包みます。そのブランチの下流ステップが失敗すると、ワークフローを失敗させる代わりに catch ブランチ（edge 1）へ実行がジャンプします。",
  "Reconnect on transient failure": "一時的な失敗で再接続",
  "Try/Catch → protected: Read Char; catch: Delay 1s → Connect → Read Char again.":
    "Try/Catch → 保護対象：Read Char；catch：Delay 1s → Connect → 再度 Read Char。",
  // Node: Retry
  "Retry a branch up to N attempts.": "ブランチを最大 N 回まで再試行します。",
  "Wraps a branch in a retry loop. If anything downstream of edge 0 errors, the executor delays then re-enters edge 0 — up to attempts total tries before falling through to edge 1 (the give-up branch).":
    "ブランチを再試行ループで包みます。edge 0 の下流で何かがエラーになると、エグゼキューターは遅延してから edge 0 に再突入します——合計で <code>attempts</code> 回まで試し、その後 edge 1（あきらめブランチ）へ抜けます。",
  Attempts: "試行回数",
  "Total tries (1 = no retry; the branch runs once and any failure falls through immediately).":
    "総試行回数（1 = 再試行なし。ブランチは一度実行され、失敗すれば直ちに抜けます）。",
  "Backoff (s)": "バックオフ（秒）",
  "Delay applied before each retry. Doesn't apply before the first attempt.":
    "各再試行の前に適用される遅延。最初の試行の前には適用されません。",
  "Reconnect on flaky link": "不安定なリンクで再接続",
  "Retry (3 attempts, 1s) → protected: Connect → Read; give-up: HTTP alert.":
    "Retry (3 回, 1s) → 保護対象：Connect → Read；あきらめ：HTTP アラート。",
  // Node: Endless
  "Park a branch indefinitely.": "ブランチを無期限に留め置きます。",
  "Parks the current branch indefinitely. The workflow stays in the running state until the user hits Stop, so concurrent triggers (timer, on-notification, on-device-discovered) can keep firing. Has no outgoing edges.":
    "現在のブランチを無期限に留め置きます。ユーザーが Stop を押すまでワークフローは実行状態を保つため、並行トリガー（timer、on-notification、on-device-discovered）が発火し続けられます。出力エッジはありません。",
  "Notification-only flow": "通知のみのフロー",
  "Start → Connect → Subscribe → Endless. A parallel On Notification trigger reacts to inbound packets for as long as the run lasts.":
    "Start → Connect → Subscribe → Endless。並行する On Notification トリガーが、実行が続く限り受信パケットに反応します。",
  "Background poller": "バックグラウンドポーラー",
  "Start → Timer (every 30s) → Read Char → Append CSV; in parallel: Endless. The Endless branch keeps the run alive so the timer keeps ticking.":
    "Start → Timer（30 秒ごと）→ Read Char → Append CSV；並行：Endless。Endless ブランチが実行を生かし続け、タイマーが動き続けます。",
  // Node: If
  "Branch on a condition.": "条件で分岐します。",
  "Branches on a condition. Edge 0 = true, edge 1 = false. Compares a Source (variable, last RSSI, last hex, isConnected) against a Right-hand value using the chosen operator.":
    "条件で分岐します。edge 0 = true、edge 1 = false。選んだ演算子を使って、ソース（variable、last RSSI、last hex、isConnected）を右辺値と比較します。",
  Source: "ソース",
  "What the left-hand value is: variable looks up a stored variable; lastRSSI / lastReadHex / isConnected use runtime state.":
    "左辺値が何か：<code>variable</code> は保存済み変数を参照します。<code>lastRSSI</code> / <code>lastReadHex</code> / <code>isConnected</code> は実行時の状態を使います。",
  "Variable Name": "変数名",
  "Only shown when Source = variable. The name to look up.":
    "Source = variable のときのみ表示。参照する名前。",
  Operator: "演算子",
  "=, ≠, <, ≤, >, ≥, contains, starts with. Numeric ops parse both sides as numbers; others compare as strings.":
    "<code>=</code>、<code>≠</code>、<code><</code>、<code>≤</code>、<code>></code>、<code>≥</code>、<code>contains</code>、<code>starts with</code>。数値演算子は両辺を数値として解釈し、その他は文字列として比較します。",
  "Right-hand value": "右辺値",
  "Literal value (with ${var} interpolation). When both sides start with 0x they're auto-normalized for hex comparison.":
    "リテラル値（<code>${var}</code> 補間あり）。両辺が <code>0x</code> で始まる場合、hex 比較のため自動的に正規化されます。",
  "Low-battery alert": "バッテリー低下アラート",
  "Read Char (store as=battery) → If (variable=battery, <, 20) → true: HTTP Request.":
    "Read Char (store as=battery) → If (variable=battery, <, 20) → true：HTTP Request。",
  "Match a hex response": "hex 応答に一致させる",
  "Subscribe → Wait Notification → If (lastReadHex, =, 0x AA 01) → true: continue.":
    "Subscribe → Wait Notification → If (lastReadHex, =, <code>0x AA 01</code>) → true：続行。",
  // Node: Wait Notification
  "Block until a notification arrives.": "通知が届くまでブロックします。",
  "Blocks the branch until a notification arrives on the characteristic, or the timeout elapses. The received bytes populate lastReadHex.":
    "キャラクタリスティックに通知が届くか、タイムアウトが経過するまでブランチをブロックします。受信したバイト列が <code>lastReadHex</code> を埋めます。",
  "Must already be Subscribed.":
    "あらかじめ Subscribe されている必要があります。",
  "Match (hex)": "一致（hex）",
  "Optional. If set, ignore notifications that don't equal these bytes.":
    "任意。設定すると、これらのバイトと等しくない通知を無視します。",
  "Maximum wait. Leave empty for no timeout.":
    "最大待機時間。タイムアウトなしにするには空のままにします。",
  "Optional variable name for the received bytes.":
    "受信したバイト用の任意の変数名。",
  "Wait for ack byte": "ack バイトを待つ",
  "Write Char (cmd) → Wait Notification (match=0x AA, timeout=2) → If on lastReadHex.":
    "Write Char (cmd) → Wait Notification (match=<code>0x AA</code>, timeout=2) → lastReadHex に対して If。",
  // Node: Assert
  "Fail the branch if a condition is false.":
    "条件が偽ならブランチを失敗させます。",
  "Checks a condition and fails the step if it's false. Same operand/operator semantics as the If node, but doesn't branch — it terminates the branch on failure (or jumps to the nearest Try/Catch / Retry catch edge).":
    "条件をチェックし、偽ならステップを失敗させます。If ノードと同じオペランド/演算子のセマンティクスを持ちますが、分岐はしません——失敗時にブランチを終了します（または最も近い Try/Catch / Retry の catch エッジへジャンプします）。",
  "Source / Operator / Value": "ソース / 演算子 / 値",
  "Same as If. Compares a variable, lastRSSI, lastReadHex, or isConnected against a literal value.":
    "If と同じ。variable、lastRSSI、lastReadHex、または isConnected をリテラル値と比較します。",
  Message: "メッセージ",
  "Optional human-readable message included in the failure entry. Defaults to the operand-vs-expected summary.":
    "失敗エントリに含める任意の可読メッセージ。既定はオペランドと期待値の対比サマリー。",
  "Guard before write": "書き込み前のガード",
  "Read MTU (store as=mtu) → Assert (variable=mtu, ≥, 100) → Write Char (large payload).":
    "Read MTU (store as=mtu) → Assert (variable=mtu, ≥, 100) → Write Char（大きなペイロード）。",
  "Sanity check protocol": "プロトコルの健全性チェック",
  "On Notification (store as=ack) → Assert (variable=ack, starts with, 0xAA01, msg=bad ack).":
    "On Notification (store as=ack) → Assert (variable=ack, starts with, <code>0xAA01</code>, msg=<code>bad ack</code>)。",
  // Node: Set Variable
  "Store a value into a named variable.": "値を名前付き変数に格納します。",
  "Stores a value into a named variable so later steps can reference it. The source can be a literal, another variable, last RSSI, last hex, or the connection state.":
    "値を名前付き変数に格納し、後のステップが参照できるようにします。ソースはリテラル、別の変数、last RSSI、last hex、または接続状態のいずれかです。",
  "Destination. Pick something the If / Transform / payload steps will reference.":
    "格納先。If / Transform / ペイロードのステップが参照する名前を選びます。",
  "Where the value comes from: variable (literal or another variable), lastRSSI, lastReadHex, isConnected.":
    "値の出どころ：<code>variable</code>（リテラルまたは別の変数）、<code>lastRSSI</code>、<code>lastReadHex</code>、<code>isConnected</code>。",
  Literal: "リテラル",
  "Only shown when Source = variable. If the text matches an existing variable name, that variable's value is used; otherwise it's stored as a literal string.":
    "Source = variable のときのみ表示。テキストが既存の変数名と一致すればその変数の値が使われ、そうでなければリテラル文字列として格納されます。",
  "Snapshot RSSI": "RSSI をスナップショット",
  "Read RSSI → Set Variable (name=rssi_at_start, source=lastRSSI).":
    "Read RSSI → Set Variable (name=rssi_at_start, source=lastRSSI)。",
  "Literal flag": "リテラルフラグ",
  "Set Variable (name=mode, source=variable, literal=night) → If (variable=mode, =, night).":
    "Set Variable (name=mode, source=variable, literal=<code>night</code>) → If (variable=mode, =, night)。",
  // Node: Transform
  "Convert hex ↔ UInt / Float / UTF-8.":
    "hex ↔ UInt / Float / UTF-8 を変換します。",
  "Converts a hex string into a decoded value (UInt8 / UInt16 / Float / UTF-8 / sliced bytes) or vice versa. Reads from lastReadHex if no input variable is set.":
    "hex 文字列をデコード値（UInt8 / UInt16 / Float / UTF-8 / 切り出したバイト）に、またはその逆に変換します。入力変数が設定されていなければ <code>lastReadHex</code> から読み取ります。",
  Operation: "操作",
  "hexToUtf8 (auto-trims NUL / whitespace), utf8ToHex, hexToUInt8/16/Int16/Float32 (LE/BE), hexSlice (offset + length).":
    "hexToUtf8（NUL / 空白を自動トリム）、utf8ToHex、hexToUInt8/16/Int16/Float32（LE/BE）、hexSlice（オフセット + 長さ）。",
  Input: "入力",
  "Source variable name. Empty = use lastReadHex.":
    "ソース変数名。空 = lastReadHex を使用。",
  Output: "出力",
  "Destination variable name. Required.": "出力先変数名。必須。",
  "Offset / Length": "オフセット / 長さ",
  "For hexSlice only. Byte offset from the start, and how many bytes to keep (0 = to end).":
    "hexSlice 専用。先頭からのバイトオフセットと、保持するバイト数（0 = 末尾まで）。",
  "Decode a version string": "バージョン文字列をデコード",
  "Read Char → Transform (hexToUtf8, output=version) → If (variable=version, =, 3.4.4).":
    "Read Char → Transform (hexToUtf8, output=version) → If (variable=version, =, 3.4.4)。",
  "First-byte command": "先頭バイトのコマンド",
  "Subscribe → Wait Notif → Transform (hexSlice, offset=0, length=1, output=cmd_byte) → If (variable=cmd_byte, =, 0xAA).":
    "Subscribe → Wait Notif → Transform (hexSlice, offset=0, length=1, output=cmd_byte) → If (variable=cmd_byte, =, <code>0xAA</code>)。",
  // Node: Payload Parser
  "Parse a packet into named fields.":
    "パケットを名前付きフィールドに解析します。",
  Fields: "フィールド",
  "Parses a hex payload into multiple named fields in one node — replaces a chain of Transform nodes when you have a structured packet with several offsets.":
    "hex ペイロードを 1 つのノードで複数の名前付きフィールドに解析します——複数のオフセットを持つ構造化パケットがある場合に、Transform ノードの連鎖を置き換えます。",
  "One field per line: name offset length type [endian]. Types: hex, utf8, ascii, uint8/int8, uint16/int16, uint32/int32, float32, float64. length of 0 = to end. Endian (LE/BE) only required for multi-byte numeric types.":
    "1 行に 1 フィールド：<code>name  offset  length  type  [endian]</code>。型：hex、utf8、ascii、uint8/int8、uint16/int16、uint32/int32、float32、float64。<code>length</code> が 0 = 末尾まで。エンディアン（LE/BE）はマルチバイトの数値型でのみ必要です。",
  "Sensor packet": "センサーパケット",
  "Read Char → Payload Parser: temp 0 2 int16 LE hum 2 1 uint8 flag 3 1 hex":
    "Read Char → Payload Parser：<br>temp 0 2 int16 LE<br>hum  2 1 uint8<br>flag 3 1 hex",
  // Node: Read RSSI
  "Read the current connection RSSI.": "現在の接続の RSSI を読み取ります。",
  "Reads the current RSSI of the active connection. Stored in the lastRSSI runtime slot and (optionally) into a named variable.":
    "アクティブな接続の現在の RSSI を読み取ります。実行時スロット <code>lastRSSI</code> に、また（任意で）名前付き変数に格納されます。",
  "Optional variable name.": "任意の変数名。",
  "Range check": "距離チェック",
  'Read RSSI → If (lastRSSI, <, -85) → true: HTTP "link weak".':
    "Read RSSI → If (lastRSSI, <, -85) → true：HTTP「リンクが弱い」。",
  // Node: Read MTU
  "Read the negotiated ATT MTU.": "ネゴシエートされた ATT MTU を読み取ります。",
  "Reads the negotiated ATT MTU. macOS CoreBluetooth doesn't expose an API to request a specific MTU — this step just surfaces what the OS negotiated at connect time.":
    "ネゴシエートされた ATT MTU を読み取ります。macOS の CoreBluetooth は特定の MTU を<em>要求</em>する API を公開していません——このステップは接続時に OS がネゴシエートした値を示すだけです。",
  "Optional variable name for the MTU integer.": "MTU 整数用の任意の変数名。",
  "Chunk sizing diagnostics": "分割サイズの診断",
  "Connect → Read MTU (store as=mtu) → HTTP Request (body uses ${mtu}).":
    "Connect → Read MTU (store as=mtu) → HTTP Request（body で <code>${mtu}</code> を使用）。",
  // Node: HTTP Request
  "Send an HTTP request.": "HTTP リクエストを送信します。",
  "Sends an HTTP request to a URL with optional headers and body. Variables are interpolated with ${name}.":
    "任意のヘッダーとボディを付けて、URL へ HTTP リクエストを送信します。変数は <code>${name}</code> で補間されます。",
  URL: "URL",
  "Full URL with ${var} allowed.":
    "完全な URL。<code>${var}</code> を使用できます。",
  Method: "メソッド",
  "GET / POST / PUT / DELETE / PATCH.": "GET / POST / PUT / DELETE / PATCH。",
  Headers: "ヘッダー",
  "Key: value pairs, one per line. Values support ${var}.":
    "キー: 値 のペアを 1 行に 1 つ。値は <code>${var}</code> をサポートします。",
  Body: "ボディ",
  "Raw body string. ${var} interpolation applies.":
    "生のボディ文字列。<code>${var}</code> 補間が適用されます。",
  "Ship a reading": "読み取り値を送る",
  'Read Char (store as=temp) → HTTP Request (POST https://api.x/ingest, body={"temp":${temp}}).':
    'Read Char (store as=temp) → HTTP Request (POST https://api.x/ingest, body=<code>{"temp":${temp}}</code>)。',
  // Node: Append CSV
  "Append a row to a CSV file.": "CSV ファイルに 1 行追記します。",
  "Appends a row to a CSV file on disk. Creates the file with the configured header on first run.":
    "ディスク上の CSV ファイルに 1 行追記します。初回実行時に、設定したヘッダーでファイルを作成します。",
  "File path": "ファイルパス",
  "Absolute path to the CSV file.": "CSV ファイルへの絶対パス。",
  Header: "ヘッダー",
  "Comma-separated column names. Written once when the file is created.":
    "カンマ区切りの列名。ファイル作成時に一度だけ書き込まれます。",
  Row: "行",
  "Comma-separated values. ${var} interpolation applies.":
    "カンマ区切りの値。<code>${var}</code> 補間が適用されます。",
  "Telemetry log": "テレメトリログ",
  "Loop: Read RSSI → Append CSV (header=ts,rssi, row=${now},${rssi}).":
    "ループ：Read RSSI → Append CSV (header=<code>ts,rssi</code>, row=<code>${now},${rssi}</code>)。",
  // Node: Save File
  "Write a payload to disk in one shot.":
    "ペイロードを一度でディスクに書き込みます。",
  "Writes a payload to disk in one shot (overwrites if exists). Use for snapshots, not append-style logs.":
    "ペイロードを一度でディスクに書き込みます（存在すれば上書き）。追記式のログではなく、スナップショットに使います。",
  "Absolute path to the destination.": "保存先への絶対パス。",
  Content: "内容",
  "Raw text content with ${var} interpolation.":
    "生のテキスト内容。<code>${var}</code> 補間あり。",
  "Dump last read": "最後の読み取りをダンプ",
  "Read Char → Save File (path=/tmp/last.bin, content=${lastReadHex}).":
    "Read Char → Save File (path=<code>/tmp/last.bin</code>, content=<code>${lastReadHex}</code>)。",
  // Request a node
  "Don't see the node you need?": "必要なノードが見つかりませんか？",
  "Signal Hub is shaped by the engineers who use it. Tell me what step is missing from your workflow and I'll prioritize it for the next release.":
    "Signal Hub は、それを使うエンジニアたちによって形づくられています。あなたのワークフローに足りないステップを教えてください。次のリリースで優先的に対応します。",
  "Request a node →": "ノードをリクエスト →",
  // Demo
  "See it move": "動きを見る",
  "A 60-second tour.": "60 秒のツアー。",
  "Concurrent connections, workflows, simulator, export — all in motion. The fastest way to feel what Signal Hub actually does.":
    "同時接続、ワークフロー、シミュレーター、エクスポート——そのすべてが動いています。Signal Hub が実際に何をするのかを感じ取る、最も速い方法です。",
  "Signal Hub 1.0.1 — recorded on macOS Sonoma":
    "Signal Hub 1.0.1 — macOS Sonoma で収録",
  // CTA
  "Build with BLE, finally enjoyable.": "BLE での開発が、ついに楽しくなる。",
  "Signal Hub is in private beta on macOS. If you spend your days talking to BLE peripherals, we'd love to hand you the keys.":
    "Signal Hub は macOS でプライベートベータ中です。毎日 BLE 周辺機器と向き合っているなら、ぜひその鍵をお渡ししたいと思います。",
  "Request beta access": "ベータアクセスを申請",
  "Back to the blog": "ブログに戻る",
  // Footer
  "Designed & built by Uy Nguyen — crafted for engineers who live in the BLE stack.":
    "<a href='/'>Uy Nguyen</a> が設計・開発——BLE スタックに生きるエンジニアのために作られました。",
  Blog: "ブログ",
  Archives: "アーカイブ",
  Contact: "お問い合わせ",
};

/* __LANG_ANCHOR__ (additional language blocks are inserted above this line) */

/* ===================== Engine ===================== */
(function () {
  var T = window.SH_TRANSLATIONS || {};
  var SUPPORTED = ["en", "vi", "es", "pt", "zh", "ja"];
  var SHORT = {
    en: "EN",
    vi: "VI",
    es: "ES",
    pt: "PT",
    zh: "中文",
    ja: "日本語",
  };
  var STORE_KEY = "sh_lang";

  var SELECTOR = [
    ".nav-links a",
    ".nav-cta",
    ".hero-eyebrow",
    ".hero-title",
    ".hero-sub",
    ".hero-cta .btn",
    ".section-eyebrow",
    ".feature-text h2",
    ".feature-text p",
    ".feature-list li",
    ".chip",
    ".mini-card h3",
    ".mini-card p",
    ".stat-label",
    ".demo-eyebrow",
    ".demo-title",
    ".demo-lead",
    ".demo-caption",
    ".cta h2",
    ".cta p",
    ".section-title",
    ".section-lead",
    ".nodes-category-head",
    ".node-tagline",
    ".node-summary",
    ".node-block-head",
    ".node-attr-name",
    ".node-attr-detail",
    ".node-example-title",
    ".node-example-body",
    ".nodes-request-title",
    ".nodes-request-text",
    ".nodes-request-cta",
    ".footer > div:first-child",
    ".footer-links a",
  ].join(",");

  var scratch = document.createElement("div");
  function keyFromHTML(html) {
    scratch.innerHTML = html.replace(/<br\s*\/?>/gi, " ");
    return (scratch.textContent || "").replace(/\s+/g, " ").trim();
  }

  var nodes = [],
    originals = [],
    keys = [];
  function collect() {
    nodes = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
    originals = [];
    keys = [];
    for (var i = 0; i < nodes.length; i++) {
      var html = nodes[i].innerHTML;
      originals.push(html);
      keys.push(keyFromHTML(html));
    }
  }

  var current = "en";
  function tr(lang, enText) {
    var d = T[lang];
    return d && d[enText] != null ? d[enText] : enText;
  }

  function apply(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = "en";
    current = lang;
    document.documentElement.lang = lang;
    var dict = T[lang] || {};
    for (var i = 0; i < nodes.length; i++) {
      if (lang === "en") {
        nodes[i].innerHTML = originals[i];
        continue;
      }
      var v = dict[keys[i]];
      nodes[i].innerHTML = v != null ? v : originals[i];
    }
    var tgl = document.getElementById("nodes-toggle-all");
    if (tgl) {
      var lbl = tgl.querySelector(".nodes-toggle-label");
      if (lbl) {
        var expanded = tgl.getAttribute("aria-expanded") === "true";
        lbl.textContent = tr(
          lang,
          expanded ? "Hide all nodes" : "Show all nodes",
        );
      }
    }
  }

  function detect() {
    try {
      var saved = localStorage.getItem(STORE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var n = (
      navigator.language ||
      navigator.userLanguage ||
      "en"
    ).toLowerCase();
    if (n.indexOf("vi") === 0) return "vi";
    if (n.indexOf("es") === 0) return "es";
    if (n.indexOf("pt") === 0) return "pt";
    if (n.indexOf("zh") === 0) return "zh";
    if (n.indexOf("ja") === 0) return "ja";
    return "en";
  }

  // ---- switcher UI ----
  var sw = document.getElementById("lang-switch");
  var btn = document.getElementById("lang-btn");
  var menu = document.getElementById("lang-menu");
  var curLabel = sw ? sw.querySelector(".lang-cur") : null;

  function updateSwitcher(lang) {
    if (curLabel) curLabel.textContent = SHORT[lang] || "EN";
    if (menu) {
      var items = menu.querySelectorAll("[data-lang]");
      for (var i = 0; i < items.length; i++) {
        items[i].setAttribute(
          "aria-selected",
          items[i].getAttribute("data-lang") === lang ? "true" : "false",
        );
      }
    }
  }
  function closeMenu() {
    if (sw) {
      sw.classList.remove("open");
      if (btn) btn.setAttribute("aria-expanded", "false");
    }
  }
  function openMenu() {
    if (sw) {
      sw.classList.add("open");
      if (btn) btn.setAttribute("aria-expanded", "true");
    }
  }

  function setLang(lang, persist) {
    apply(lang);
    updateSwitcher(current);
    if (persist) {
      try {
        localStorage.setItem(STORE_KEY, current);
      } catch (e) {}
    }
  }

  if (btn && menu) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (sw.classList.contains("open")) closeMenu();
      else openMenu();
    });
    menu.addEventListener("click", function (e) {
      var li = e.target.closest ? e.target.closest("[data-lang]") : null;
      if (!li) return;
      setLang(li.getAttribute("data-lang"), true);
      closeMenu();
    });
    document.addEventListener("click", function (e) {
      if (sw && !sw.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.keyCode === 27) closeMenu();
    });
  }

  window.SH_I18N = {
    t: function (enText) {
      return tr(current, enText);
    },
    lang: function () {
      return current;
    },
    set: function (lang) {
      setLang(lang, true);
    },
  };

  collect();
  setLang(detect(), false);
})();
