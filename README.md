# Sepay Payment Modal Demo

Đây là trang HTML tĩnh mô phỏng popup thanh toán QR Code (Sepay) cho bước cuối cùng của quy trình đặt hàng (Landing Page Flow).

## Tính năng

1.  **Flow chuẩn UX:**
    *   Hiển thị thông báo "Cảm ơn" (2s).
    *   Tự động chuyển sang form thanh toán.
    *   Đếm ngược 10 phút.
    *   Giả lập tự động kiểm tra trạng thái (Auto-check) mỗi 5 giây.
    *   Giả lập thanh toán thành công sau 15 giây.
2.  **Giao diện (UI):**
    *   Mobile-first, Responsive.
    *   Tạo QR Code Sepay động dựa trên ID đơn hàng.
    *   Hiển thị thông tin tài khoản rõ ràng, có chức năng Copy.
    *   Hiệu ứng Success Animation mượt mà.
3.  **Kỹ thuật:**
    *   Không dùng Framework (React/Vue) - Chỉ thuần HTML/CSS/JS.
    *   Không cần backend (Mock API logic nằm ngay trong JS).
    *   Single-file `index.html`.

## Hướng dẫn Deploy lên Vercel

Vì đây là trang tĩnh hoàn toàn, việc deploy cực kỳ đơn giản:

1.  **Tải code về:** Clone repo này hoặc tải file `index.html`.
2.  **Push lên GitHub:** Tạo một repository mới và push file `index.html` lên.
3.  **Vercel:**
    *   Truy cập [Vercel Dashboard](https://vercel.com/dashboard).
    *   Chọn **"Add New..."** -> **"Project"**.
    *   Import repository GitHub vừa tạo.
    *   Tại mục **Framework Preset**, chọn **Other** (hoặc để mặc định).
    *   Bấm **Deploy**.

## Cấu hình dữ liệu giả lập (Mock Data)

Để thay đổi thông tin đơn hàng (vì không có LocalStorage thực tế), bạn mở file `index.html` và sửa phần `CONFIG` ở dòng ~250:

```javascript
const MOCK_DATA = {
    orderId: "DH12345", // Mã đơn hàng
    amount: 199000,     // Số tiền
    note: "Ghi chú..."  // Ghi chú
};

const CONFIG = {
    mockSuccessAfter: 15000 // Thời gian giả lập thanh toán thành công (ms)
};
```

## Lưu ý

*   Hệ thống đang giả lập API check thanh toán. Trong thực tế, bạn cần thay hàm `mockCheckPaymentAPI` bằng `fetch('/api/check-payment?orderId=...')`.
*   QR Code được sinh tự động thông qua API công khai của Sepay (`qr.sepay.vn`).