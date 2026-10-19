# Hey Trip — MVP

Ứng dụng quản lý chuyến đi, lịch trình, checklist và thu chi bằng Node.js + SQLite. Giao diện tiếng Việt, responsive.

## Chạy trên máy

Yêu cầu Node.js 22 trở lên (có trình biên dịch hỗ trợ native module nếu cần).

```bash
npm install
npm start
```

Truy cập `http://localhost:3000`.

## Triển khai lên Vibe Host

1. Đẩy toàn bộ mã nguồn trong thư mục này lên GitHub repository `tuyennguyendrive/Hey-Trip` (không chỉ README.md).
2. Kết nối repository với Vibe Host.
3. Build/install command: `npm install` (hoặc `npm ci` khi có package-lock.json).
4. Start command: `npm start`.
5. Runtime: Node.js 22+; ứng dụng tự lắng nghe biến môi trường `PORT`.
6. **Quan trọng:** cấu hình `DATA_DIR` trỏ tới thư mục lưu trữ **persistent/writable** do Vibe Host cấp. SQLite sẽ được tạo tại `DATA_DIR/heytrip.sqlite`. Nếu Vibe Host không cung cấp ổ lưu bền vững hoặc không hỗ trợ build native module `better-sqlite3`, cần chuyển sang dịch vụ database khác trước khi chạy production.

## Cấu trúc

- `server.js`: HTTP API, xác thực dữ liệu đầu vào, SQLite và phục vụ giao diện.
- `public/`: HTML, CSS, JavaScript.
- `data/`: dữ liệu local (không commit lên GitHub).

## Giới hạn MVP / an toàn

**Chưa có đăng nhập hoặc phân quyền.** Mọi người truy cập được URL đều có thể đọc, sửa và xóa toàn bộ dữ liệu. Chỉ sử dụng để demo riêng tư, không đưa dữ liệu thật lên một trang công khai. Cần bổ sung xác thực, phân quyền và sao lưu trước khi dùng nhiều người. Không bao gồm AI, thời tiết, bản đồ, chia sẻ nhóm.
