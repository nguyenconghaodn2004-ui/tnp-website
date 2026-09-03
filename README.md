# TRÚC NGUYÊN PHÁT – TNP Website

Website chính thức giới thiệu và phân phối TV **HXY** và **HIKERS**.

## Yêu cầu hệ thống

- **Node.js** v16 trở lên — [Tải tại nodejs.org](https://nodejs.org/)
- **npm** (đi kèm với Node.js)

## Cài đặt & Khởi động

```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi động server
npm start
```

Sau đó mở trình duyệt và truy cập: **http://localhost:3000**

---

## Cấu trúc project

```
tnp/
├── package.json          # Cấu hình project & dependencies
├── server.js             # Node.js Express server
├── README.md             # Tài liệu này
│
├── data/
│   └── products.js       # ⭐ Dữ liệu sản phẩm (thêm/sửa sản phẩm tại đây)
│
└── public/               # Thư mục web tĩnh
    ├── index.html         # Trang chủ (toàn bộ nội dung)
    │
    ├── css/
    │   └── style.css      # Toàn bộ CSS – design system
    │
    ├── js/
    │   └── script.js      # Toàn bộ JavaScript – tương tác
    │
    ├── images/
    │   ├── logo/           # Logo TNP
    │   ├── banners/        # Banner homepage
    │   ├── hxy/            # Ảnh thương hiệu HXY
    │   ├── hikers/         # Ảnh thương hiệu HIKERS
    │   └── products/       # Ảnh sản phẩm TV
    │       └── placeholder.svg  # Placeholder tạm thời
    │
    ├── robots.txt
    └── sitemap.xml
```

---

## Thêm sản phẩm mới

Mở file `data/products.js` và thêm object vào mảng `products`:

```javascript
{
  id: "hxy-43-xxx",           // ID duy nhất (không dấu, không dấu cách)
  brand: "HXY",               // "HXY" hoặc "HIKERS"
  model: "HXY-43XXX",
  name: "Smart TV HXY 43 inch 4K Google TV",
  size: 43,                   // Số (inch)
  sizeLabel: "43 inch",
  resolution: "4K UHD",
  panel: "LED",               // LED | QLED | Mini LED | OLED
  os: "Google TV",
  refreshRate: "60Hz",
  hdr: true,
  hdrType: "HDR10",
  ram: "2GB",
  storage: "16GB",
  wifi: "Wi-Fi 5",
  bluetooth: "Bluetooth 5.0",
  hdmi: 3,
  usb: 2,
  audioOutput: "2x10W",
  audioTech: "Dolby Audio",
  dimensions: "961×558×75mm",
  weight: "6.5 kg",
  warranty: "24 tháng",
  isNew: true,
  isFeatured: true,
  thumbnail: "/images/products/hxy/model-xxx.jpg",
  images: ["/images/products/hxy/model-xxx.jpg"],
  tags: ["4K", "Google TV", "HDR"],
  features: [
    "Tính năng 1",
    "Tính năng 2"
  ],
  specs: {
    display: "...",
    audio: "...",
    connectivity: "...",
    smartFeatures: "...",
    dimensions: "...",
    power: "..."
  },
  category: ["all", "hxy", "43inch", "4k"]  // Dùng để lọc
}
```

**Danh sách category hợp lệ:**
- `all` — luôn có
- `hxy` hoặc `hikers` — thương hiệu
- `32inch`, `43inch`, `50inch`, `55inch`, `65inch`, `75inch`, `85inch`
- `4k` — nếu là TV 4K UHD
- `qled` — nếu có QLED
- `large` — nếu từ 65 inch trở lên

---

## Thêm hình ảnh sản phẩm

1. Đặt ảnh vào thư mục `public/images/products/hxy/` hoặc `public/images/products/hikers/`
2. Cập nhật `thumbnail` và `images` trong `data/products.js`

**Kích thước ảnh khuyến nghị:** 800×600px, định dạng JPG hoặc WebP

---

## Thông tin liên hệ

Cập nhật thông tin liên hệ trong file `public/index.html`:
- Tìm kiếm `0901 234 567` → thay bằng số hotline thật
- Tìm kiếm `info@trucnguyenphat.vn` → thay bằng email thật
- Tìm kiếm `fb.com/trucnguyenphat` → thay bằng link Facebook thật

---

## Công nghệ sử dụng

| Công nghệ | Mục đích |
|-----------|---------|
| HTML5 | Cấu trúc trang web |
| CSS3 | Giao diện & responsive |
| JavaScript ES6+ | Tương tác người dùng |
| Node.js + Express | Web server |
| Font Awesome 6 | Icons |
| Google Fonts (Inter) | Typography |

---

## Tính năng website

- ✅ Giao diện responsive (Mobile, Tablet, Desktop)
- ✅ Header sticky + scroll effect
- ✅ Mobile hamburger menu
- ✅ Tìm kiếm sản phẩm real-time
- ✅ Lọc sản phẩm theo thương hiệu & kích thước
- ✅ Modal xem chi tiết sản phẩm
- ✅ So sánh tối đa 3 sản phẩm
- ✅ FAQ accordion
- ✅ Form liên hệ có validation
- ✅ Floating contact buttons (Zalo, Facebook, Gọi)
- ✅ Scroll reveal animations
- ✅ Back to top button
- ✅ Lazy loading images
- ✅ SEO cơ bản (meta tags, semantic HTML)
- ✅ API endpoint `/api/products` và `/api/contact`

---

© 2026 **TRÚC NGUYÊN PHÁT – TNP**. All rights reserved.
