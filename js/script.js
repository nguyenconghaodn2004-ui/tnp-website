/**
 * TRÚC NGUYÊN PHÁT – TNP
 * Main JavaScript – script.js
 * Version 2.0
 */

'use strict';

// ══════════════════════════════════════════════
//  PRODUCT DATA (Embedded from data/products.js)
// ══════════════════════════════════════════════
const TNP_PRODUCTS = [
  {
    "id": "hikers-hk32a500a",
    "brand": "HIKERS",
    "model": "HK32A500A",
    "name": "Smart TV HIKERS 32 inch HK32A500A",
    "size": 32,
    "sizeLabel": "32 inch",
    "resolution": "HD Ready",
    "resolutionDetail": "1366 x 768",
    "panel": "LED",
    "os": "Google TV / Android TV",
    "refreshRate": "60Hz",
    "hdr": false,
    "hdrType": "Tiêu chuẩn",
    "backlight": "Direct LED",
    "brightness": "250 nit",
    "contrastRatio": "3000:1",
    "cpu": "Quad-Core ARM Cortex",
    "ram": "1.5GB",
    "storage": "8GB",
    "wifi": "Wi-Fi 2.4G",
    "bluetooth": "Bluetooth 5.0",
    "hdmi": 2,
    "usb": 1,
    "audioOutput": "2 x 8W",
    "audioTech": "Dolby Audio, Stereo Sound",
    "dimensions": "732 x 434 x 75mm",
    "weight": "3.8 kg",
    "warranty": "24 tháng chính hãng",
    "isNew": false,
    "isFeatured": false,
    "thumbnail": "https://hikersvietnam.com/storage/uploads/noidung/thumb/ma-hk32a500a-0.jpg",
    "images": [
      "https://hikersvietnam.com/storage/uploads/noidung/ma-hk32a500a-0.jpg",
      "https://hikersvietnam.com/storage/uploads/noidung/thumb/ma-hk32a500a-0.jpg"
    ],
    "sourceUrl": "https://hikersvietnam.com/ma-hk32a500a",
    "tags": [
      "HIKERS",
      "32 inch",
      "HD",
      "Google TV",
      "Phòng ngủ"
    ],
    "features": [
      "Màn hình 32 inch nhỏ gọn, viền mỏng hiện đại",
      "Hệ điều hành thông minh kho ứng dụng phong phú",
      "Hỗ trợ kết nối Wi-Fi, Bluetooth 5.0 nhanh chóng",
      "Âm thanh stereo rõ ràng, tiết kiệm điện năng",
      "Phù hợp cho phòng ngủ, phòng trọ, nhà bếp"
    ],
    "specs": {
      "display": "32 inch LED HD Ready (1366×768), 60Hz, 250 nit",
      "audio": "2 x 8W, Dolby Audio",
      "connectivity": "2 HDMI, 1 USB, AV In, Optical, Wi-Fi, Bluetooth",
      "smartFeatures": "Google TV, YouTube, Netflix, FPT Play",
      "dimensions": "732 x 434 x 75mm | 3.8 kg",
      "power": "45W"
    },
    "category": [
      "all",
      "hikers",
      "32inch"
    ]
  },
  {
    "id": "hikers-hk43a500fa",
    "brand": "HIKERS",
    "model": "HK43A500FA",
    "name": "Smart TV HIKERS 43 inch Full HD HK43A500FA",
    "size": 43,
    "sizeLabel": "43 inch",
    "resolution": "Full HD",
    "resolutionDetail": "1920 x 1080",
    "panel": "LED",
    "os": "Google TV",
    "refreshRate": "60Hz",
    "hdr": true,
    "hdrType": "HDR10",
    "backlight": "Direct LED",
    "brightness": "300 nit",
    "contrastRatio": "4000:1",
    "cpu": "Quad-Core CA55",
    "ram": "1.5GB",
    "storage": "8GB",
    "wifi": "Wi-Fi Dual Band (2.4G/5G)",
    "bluetooth": "Bluetooth 5.0",
    "hdmi": 2,
    "usb": 2,
    "audioOutput": "2 x 10W",
    "audioTech": "Dolby Audio, DTS Virtual:X",
    "dimensions": "958 x 556 x 78mm",
    "weight": "6.5 kg",
    "warranty": "24 tháng chính hãng",
    "isNew": false,
    "isFeatured": true,
    "thumbnail": "https://hikersvietnam.com/storage/uploads/noidung/thumb/ma-hk43a500fa-0.jpg",
    "images": [
      "https://hikersvietnam.com/storage/uploads/noidung/ma-hk43a500fa-0.jpg",
      "https://hikersvietnam.com/storage/uploads/noidung/thumb/ma-hk43a500fa-0.jpg"
    ],
    "sourceUrl": "https://hikersvietnam.com/ma-hk43a500fa",
    "tags": [
      "HIKERS",
      "43 inch",
      "Full HD",
      "Google TV",
      "Bán chạy"
    ],
    "features": [
      "Màn hình 43 inch Full HD sắc nét, góc nhìn rộng 178°",
      "Google TV thông minh với tìm kiếm giọng nói tiếng Việt",
      "Thiết kế tràn viền 3 cạnh sang trọng",
      "Âm thanh vòm Dolby Audio sống động",
      "Chiếu màn hình điện thoại Chromecast built-in"
    ],
    "specs": {
      "display": "43 inch Full HD (1920×1080), 60Hz, HDR10, 300 nit",
      "audio": "2 x 10W Dolby Audio, DTS",
      "connectivity": "2 HDMI, 2 USB, Optical, LAN, Wi-Fi Dual Band, Bluetooth 5.0",
      "smartFeatures": "Google TV, Google Assistant tiếng Việt, Chromecast",
      "dimensions": "958 x 556 x 78mm | 6.5 kg",
      "power": "75W"
    },
    "category": [
      "all",
      "hikers",
      "43inch"
    ]
  },
  {
    "id": "hikers-hk55a500ua",
    "brand": "HIKERS",
    "model": "HK55A500UA",
    "name": "Smart TV HIKERS 55 inch 4K UHD HK55A500UA",
    "size": 55,
    "sizeLabel": "55 inch",
    "resolution": "4K UHD",
    "resolutionDetail": "3840 x 2160",
    "panel": "LED IPS",
    "os": "Google TV",
    "refreshRate": "60Hz (MEMC)",
    "hdr": true,
    "hdrType": "HDR10 / HLG",
    "backlight": "Direct LED",
    "brightness": "350 nit",
    "contrastRatio": "5000:1",
    "cpu": "Quad-Core 64-bit",
    "ram": "2GB",
    "storage": "16GB",
    "wifi": "Wi-Fi 5 (802.11ac)",
    "bluetooth": "Bluetooth 5.1",
    "hdmi": 3,
    "usb": 2,
    "audioOutput": "2 x 12W",
    "audioTech": "Dolby Atmos, Dolby Audio",
    "dimensions": "1230 x 714 x 77mm",
    "weight": "11.5 kg",
    "warranty": "24 tháng chính hãng",
    "isNew": true,
    "isFeatured": true,
    "thumbnail": "https://hikersvietnam.com/storage/uploads/noidung/thumb/ma-hk55a500ua-0.jpg",
    "images": [
      "https://hikersvietnam.com/storage/uploads/noidung/ma-hk55a500ua-0.jpg",
      "https://hikersvietnam.com/storage/uploads/noidung/thumb/ma-hk55a500ua-0.jpg"
    ],
    "sourceUrl": "https://hikersvietnam.com/ma-hk55a500ua",
    "tags": [
      "HIKERS",
      "55 inch",
      "4K UHD",
      "Google TV",
      "Dolby Atmos",
      "Hot"
    ],
    "features": [
      "Độ phân giải 4K UHD 3840×2160 sắc nét từng chi tiết",
      "Công nghệ HDR10 nâng cao dải tương phản động",
      "Âm thanh vòm Dolby Atmos đa chiều ấn tượng",
      "Bộ xử lý MEMC mượt mà trong các cảnh hành động",
      "Giao diện Google TV hiện đại, mượt mà"
    ],
    "specs": {
      "display": "55 inch 4K UHD (3840×2160), 60Hz MEMC, HDR10, 350 nit",
      "audio": "2 x 12W, Dolby Atmos, DTS-HD",
      "connectivity": "3 HDMI (1 eARC), 2 USB, Optical, LAN, Wi-Fi 5, Bluetooth 5.1",
      "smartFeatures": "Google TV, Google Assistant, Chromecast 4K",
      "dimensions": "1230 x 714 x 77mm | 11.5 kg",
      "power": "130W"
    },
    "category": [
      "all",
      "hikers",
      "55inch",
      "4k"
    ]
  },
  {
    "id": "hikers-hk65a500ua",
    "brand": "HIKERS",
    "model": "HK65A500UA",
    "name": "Smart TV HIKERS 65 inch 4K UHD HK65A500UA",
    "size": 65,
    "sizeLabel": "65 inch",
    "resolution": "4K UHD",
    "resolutionDetail": "3840 x 2160",
    "panel": "LED 4K A+ Grade",
    "os": "Google TV",
    "refreshRate": "60Hz (MEMC)",
    "hdr": true,
    "hdrType": "HDR10 / Dolby Vision",
    "backlight": "Direct LED",
    "brightness": "400 nit",
    "contrastRatio": "6000:1",
    "cpu": "Quad-Core A55",
    "ram": "2GB",
    "storage": "16GB",
    "wifi": "Wi-Fi 5 Dual Band",
    "bluetooth": "Bluetooth 5.1",
    "hdmi": 3,
    "usb": 2,
    "audioOutput": "2 x 15W",
    "audioTech": "Dolby Atmos 2.0",
    "dimensions": "1446 x 835 x 79mm",
    "weight": "16.8 kg",
    "warranty": "24 tháng chính hãng",
    "isNew": true,
    "isFeatured": true,
    "thumbnail": "https://hikersvietnam.com/storage/uploads/noidung/thumb/ma-hk65a500ua-65-0.jpg",
    "images": [
      "https://hikersvietnam.com/storage/uploads/noidung/ma-hk65a500ua-65-0.jpg",
      "https://hikersvietnam.com/storage/uploads/noidung/thumb/ma-hk65a500ua-65-0.jpg"
    ],
    "sourceUrl": "https://hikersvietnam.com/ma-hk65a500ua-65",
    "tags": [
      "HIKERS",
      "65 inch",
      "4K UHD",
      "Dolby Vision",
      "Màn hình lớn"
    ],
    "features": [
      "Màn hình lớn 65 inch trải nghiệm điện ảnh chuẩn mực",
      "Chuẩn màu HDR10 và Dolby Vision rực rỡ chân thực",
      "Khung viền kim loại siêu mảnh nguyên khối",
      "Công suất loa 30W mạnh mẽ kèm Dolby Atmos",
      "Trợ lý ảo thông minh nhận diện giọng nói chuẩn xác"
    ],
    "specs": {
      "display": "65 inch 4K UHD (3840×2160), 60Hz MEMC, Dolby Vision, 400 nit",
      "audio": "2 x 15W, Dolby Atmos 3D Audio",
      "connectivity": "3 HDMI 2.0 (eARC), 2 USB 2.0, Optical, LAN, Wi-Fi 5",
      "smartFeatures": "Google TV, Google Play Store, Voice Remote",
      "dimensions": "1446 x 835 x 79mm | 16.8 kg",
      "power": "160W"
    },
    "category": [
      "all",
      "hikers",
      "65inch",
      "4k",
      "large"
    ]
  },
  {
    "id": "hikers-dong-m600",
    "brand": "HIKERS",
    "model": "HK-M600 Series",
    "name": "Smart TV HIKERS Dòng HK-M600 Viền Mỏng",
    "size": 50,
    "sizeLabel": "50 inch",
    "resolution": "4K UHD",
    "resolutionDetail": "3840 x 2160",
    "panel": "QLED Premium",
    "os": "Google TV",
    "refreshRate": "60Hz",
    "hdr": true,
    "hdrType": "HDR10+",
    "backlight": "Quantum Dot LED",
    "brightness": "380 nit",
    "contrastRatio": "5500:1",
    "cpu": "Quad-Core Turbo",
    "ram": "2GB",
    "storage": "16GB",
    "wifi": "Wi-Fi 5 Dual Band",
    "bluetooth": "Bluetooth 5.1",
    "hdmi": 3,
    "usb": 2,
    "audioOutput": "2 x 12W",
    "audioTech": "Dolby Audio, DTS TruSurround",
    "dimensions": "1118 x 648 x 76mm",
    "weight": "9.8 kg",
    "warranty": "24 tháng chính hãng",
    "isNew": false,
    "isFeatured": false,
    "thumbnail": "https://hikersvietnam.com/storage/uploads/noidung/thumb/dong-hk-m600-0.jpg",
    "images": [
      "https://hikersvietnam.com/storage/uploads/noidung/dong-hk-m600-0.jpg",
      "https://hikersvietnam.com/storage/uploads/noidung/thumb/dong-hk-m600-0.jpg"
    ],
    "sourceUrl": "https://hikersvietnam.com/dong-hk-m600",
    "tags": [
      "HIKERS",
      "M600 Series",
      "50 inch",
      "QLED",
      "4K UHD"
    ],
    "features": [
      "Dòng HK-M600 thiết kế thanh mảnh, hiện đại",
      "Tấm nền chấm lượng tử màu sắc chuẩn 92% DCI-P3",
      "Xử lý hình ảnh AI tăng cường chi tiết",
      "Google TV kho giải trí bất tận",
      "Tiết kiệm điện năng tối ưu"
    ],
    "specs": {
      "display": "50 inch QLED 4K (3840×2160), 60Hz, HDR10+, 380 nit",
      "audio": "2 x 12W Dolby Audio",
      "connectivity": "3 HDMI, 2 USB, Wi-Fi 5, Bluetooth 5.1, Optical",
      "smartFeatures": "Google TV, Trợ lý Google, Chia sẻ màn hình",
      "dimensions": "1118 x 648 x 76mm | 9.8 kg",
      "power": "110W"
    },
    "category": [
      "all",
      "hikers",
      "50inch",
      "4k",
      "qled"
    ]
  },
  {
    "id": "hikers-dong-s700",
    "brand": "HIKERS",
    "model": "HK-S700 Series",
    "name": "Smart TV HIKERS Dòng HK-S700 Flagship 144Hz",
    "size": 75,
    "sizeLabel": "75 inch",
    "resolution": "4K UHD",
    "resolutionDetail": "3840 x 2160",
    "panel": "Mini LED QLED",
    "os": "Google TV",
    "refreshRate": "144Hz VRR",
    "hdr": true,
    "hdrType": "Dolby Vision IQ / HDR10+",
    "backlight": "Mini LED Local Dimming (512 Zones)",
    "brightness": "1000 nit",
    "contrastRatio": "10000:1",
    "cpu": "Octa-Core AI Processor",
    "ram": "3GB",
    "storage": "32GB",
    "wifi": "Wi-Fi 6 (802.11ax)",
    "bluetooth": "Bluetooth 5.3",
    "hdmi": 4,
    "usb": 3,
    "audioOutput": "2 x 20W + Sub 20W (60W Total)",
    "audioTech": "Dolby Atmos 2.1, DTS:X",
    "dimensions": "1672 x 962 x 75mm",
    "weight": "28.5 kg",
    "warranty": "24 tháng chính hãng",
    "isNew": true,
    "isFeatured": true,
    "thumbnail": "https://hikersvietnam.com/storage/uploads/noidung/thumb/dong-hk-s700-0.jpg",
    "images": [
      "https://hikersvietnam.com/storage/uploads/noidung/dong-hk-s700-0.jpg",
      "https://hikersvietnam.com/storage/uploads/noidung/thumb/dong-hk-s700-0.jpg"
    ],
    "sourceUrl": "https://hikersvietnam.com/dong-hk-s700",
    "tags": [
      "HIKERS",
      "S700 Flagship",
      "75 inch",
      "Mini LED",
      "144Hz",
      "Gaming"
    ],
    "features": [
      "Dòng flagship S700 với công nghệ Mini LED 512 vùng độc lập",
      "Tần số quét đỉnh cao 144Hz VRR chuyên game và thể thao",
      "Độ sáng chói lọi 1000 nit, Dolby Vision IQ tự cân chỉnh ánh sáng",
      "Hệ thống loa siêu trầm 60W Dolby Atmos chân thực",
      "Cổng HDMI 2.1 eARC kết nối mượt mà PlayStation 5 và Xbox"
    ],
    "specs": {
      "display": "75 inch Mini LED QLED 4K (3840×2160), 144Hz VRR, 1000 nit",
      "audio": "2 x 20W + Subwoofer 20W, Dolby Atmos 2.1",
      "connectivity": "4 HDMI 2.1, 3 USB 3.0, Wi-Fi 6, Bluetooth 5.3, eARC",
      "smartFeatures": "Google TV, Game Master, Google Assistant 4K",
      "dimensions": "1672 x 962 x 75mm | 28.5 kg",
      "power": "250W"
    },
    "category": [
      "all",
      "hikers",
      "75inch",
      "4k",
      "qled",
      "large"
    ]
  },
  {
    "id": "hxy-tv-b650",
    "brand": "HXY",
    "model": "B650",
    "name": "TV HXY 4K HDR B650 (65 inch)",
    "size": 65,
    "sizeLabel": "65 inch",
    "resolution": "4K UHD",
    "resolutionDetail": "3840 x 2160",
    "panel": "OLED / 4K UHD",
    "os": "Google TV",
    "refreshRate": "120Hz",
    "hdr": true,
    "hdrType": "HDR10 / Dolby Vision",
    "backlight": "OLED Self-lit / Direct Array",
    "brightness": "600 nit",
    "contrastRatio": "Infinite Contrast",
    "cpu": "Quad-Core A73",
    "ram": "3GB",
    "storage": "32GB",
    "wifi": "Wi-Fi 6 Dual Band",
    "bluetooth": "Bluetooth 5.2",
    "hdmi": 4,
    "usb": 2,
    "audioOutput": "2 x 15W",
    "audioTech": "Dolby Atmos, Dolby Audio",
    "dimensions": "1448 x 830 x 68mm",
    "weight": "18.2 kg",
    "warranty": "24 tháng chính hãng",
    "isNew": true,
    "isFeatured": true,
    "thumbnail": "https://hxy-vietnam.com/storage/uploads/noidung/thumb/hxy-oled-65-inch-b650-0.jpg",
    "images": [
      "https://hxy-vietnam.com/storage/uploads/noidung/hxy-oled-65-inch-b650-0.jpg",
      "https://hxy-vietnam.com/storage/uploads/noidung/thumb/hxy-oled-65-inch-b650-0.jpg"
    ],
    "sourceUrl": "https://hxy-vietnam.com/tv-hxy-4k-hdr-b650",
    "tags": [
      "HXY",
      "B650",
      "65 inch",
      "4K HDR",
      "OLED",
      "Flagship"
    ],
    "features": [
      "Mẫu B650 đỉnh cao với màu đen tuyệt đối và độ tương phản vô cực",
      "Độ phân giải 4K HDR sắc nét chuẩn phim chiếu rạp",
      "Tần số quét 120Hz mượt mà cho mọi tác vụ",
      "Hệ điều hành Google TV bản quyền, giao diện thân thiện",
      "Thiết kế siêu mỏng tối giản tôn vinh không gian phòng khách"
    ],
    "specs": {
      "display": "65 inch 4K HDR (3840×2160), 120Hz, Dolby Vision, 600 nit",
      "audio": "2 x 15W, Dolby Atmos, DTS:X",
      "connectivity": "4 HDMI 2.1, 2 USB 3.0, Wi-Fi 6, Bluetooth 5.2, Optical",
      "smartFeatures": "Google TV, Voice Search tiếng Việt, AirPlay 2",
      "dimensions": "1448 x 830 x 68mm | 18.2 kg",
      "power": "180W"
    },
    "category": [
      "all",
      "hxy",
      "65inch",
      "4k",
      "large"
    ]
  },
  {
    "id": "hxy-tv-p750",
    "brand": "HXY",
    "model": "P750",
    "name": "TV HXY 4K HDR P750 (55 inch)",
    "size": 55,
    "sizeLabel": "55 inch",
    "resolution": "4K UHD",
    "resolutionDetail": "3840 x 2160",
    "panel": "LED IPS 4K",
    "os": "Google TV",
    "refreshRate": "60Hz MEMC",
    "hdr": true,
    "hdrType": "HDR10 / HLG",
    "backlight": "Direct LED",
    "brightness": "350 nit",
    "contrastRatio": "4500:1",
    "cpu": "Quad-Core Cortex-A55",
    "ram": "2GB",
    "storage": "16GB",
    "wifi": "Wi-Fi 5 (802.11ac)",
    "bluetooth": "Bluetooth 5.1",
    "hdmi": 3,
    "usb": 2,
    "audioOutput": "2 x 12W",
    "audioTech": "Dolby Audio, Virtual Surround",
    "dimensions": "1228 x 708 x 75mm",
    "weight": "10.8 kg",
    "warranty": "24 tháng chính hãng",
    "isNew": false,
    "isFeatured": true,
    "thumbnail": "https://hxy-vietnam.com/storage/uploads/noidung/thumb/tv-hxy-4k-hdr-p750-0.jpg",
    "images": [
      "https://hxy-vietnam.com/storage/uploads/noidung/tv-hxy-4k-hdr-p750-0.jpg",
      "https://hxy-vietnam.com/storage/uploads/noidung/thumb/tv-hxy-4k-hdr-p750-0.jpg"
    ],
    "sourceUrl": "https://hxy-vietnam.com/tv-hxy-4k-hdr-p750",
    "tags": [
      "HXY",
      "P750",
      "55 inch",
      "4K HDR",
      "Google TV",
      "Bán chạy"
    ],
    "features": [
      "Model P750 cân bằng hoàn hảo giữa hiệu năng và giá trị",
      "Hình ảnh 4K HDR trong trẻo, chi tiết sống động",
      "Thiết kế tràn viền tinh tế, chân đế chắc chắn",
      "Google TV tích hợp giọng nói tiếng Việt mượt mà",
      "Độ bền cao, hoạt động êm ái bền bỉ"
    ],
    "specs": {
      "display": "55 inch 4K UHD (3840×2160), 60Hz MEMC, HDR10, 350 nit",
      "audio": "2 x 12W, Dolby Audio",
      "connectivity": "3 HDMI (1 eARC), 2 USB, Optical, LAN, Wi-Fi 5, Bluetooth",
      "smartFeatures": "Google TV, Google Play, Chromecast built-in",
      "dimensions": "1228 x 708 x 75mm | 10.8 kg",
      "power": "125W"
    },
    "category": [
      "all",
      "hxy",
      "55inch",
      "4k"
    ]
  },
  {
    "id": "hxy-tv-q850",
    "brand": "HXY",
    "model": "Q850",
    "name": "TV HXY QLED Q850 (75 inch)",
    "size": 75,
    "sizeLabel": "75 inch",
    "resolution": "4K UHD",
    "resolutionDetail": "3840 x 2160",
    "panel": "QLED Quantum Dot",
    "os": "Google TV",
    "refreshRate": "120Hz",
    "hdr": true,
    "hdrType": "HDR10+ / Dolby Vision",
    "backlight": "Quantum Dot LED",
    "brightness": "550 nit",
    "contrastRatio": "7000:1",
    "cpu": "Quad-Core A73 High-Speed",
    "ram": "3GB",
    "storage": "32GB",
    "wifi": "Wi-Fi 6 Dual Band",
    "bluetooth": "Bluetooth 5.2",
    "hdmi": 4,
    "usb": 3,
    "audioOutput": "2 x 20W",
    "audioTech": "Dolby Atmos, DTS Virtual:X",
    "dimensions": "1670 x 955 x 74mm",
    "weight": "24.5 kg",
    "warranty": "24 tháng chính hãng",
    "isNew": true,
    "isFeatured": true,
    "thumbnail": "https://hxy-vietnam.com/storage/uploads/noidung/thumb/hxy-oled-75-inch-q850-0.jpg",
    "images": [
      "https://hxy-vietnam.com/storage/uploads/noidung/hxy-oled-75-inch-q850-0.jpg",
      "https://hxy-vietnam.com/storage/uploads/noidung/thumb/hxy-oled-75-inch-q850-0.jpg"
    ],
    "sourceUrl": "https://hxy-vietnam.com/tv-hxy-qled-q850",
    "tags": [
      "HXY",
      "Q850",
      "75 inch",
      "QLED",
      "120Hz",
      "Dolby Atmos"
    ],
    "features": [
      "Công nghệ QLED Quantum Dot màu sắc rực rỡ chuẩn 95% DCI-P3",
      "Màn hình khổng lồ 75 inch lý tưởng cho phòng khách rộng",
      "Tần số quét 120Hz chống mờ nhòe mọi pha bóng đá đỉnh cao",
      "Âm thanh vòm Dolby Atmos lan tỏa không gian",
      "Khung viền kim loại cao cấp xước mờ sang trọng"
    ],
    "specs": {
      "display": "75 inch QLED 4K (3840×2160), 120Hz, Dolby Vision, 550 nit",
      "audio": "2 x 20W, Dolby Atmos, DTS Studio Sound",
      "connectivity": "4 HDMI 2.1, 3 USB, Wi-Fi 6, Bluetooth 5.2, eARC",
      "smartFeatures": "Google TV, Google Assistant tiếng Việt, AirPlay 2",
      "dimensions": "1670 x 955 x 74mm | 24.5 kg",
      "power": "210W"
    },
    "category": [
      "all",
      "hxy",
      "75inch",
      "4k",
      "qled",
      "large"
    ]
  },
  {
    "id": "hxy-tv-s950",
    "brand": "HXY",
    "model": "S950",
    "name": "TV HXY QLED S950 100 inch Flagship Cinema",
    "size": 85,
    "sizeLabel": "100 inch",
    "resolution": "4K UHD",
    "resolutionDetail": "3840 x 2160",
    "panel": "QLED Cinema Grade 100\"",
    "os": "Google TV",
    "refreshRate": "144Hz VRR",
    "hdr": true,
    "hdrType": "Dolby Vision IQ / HDR10+",
    "backlight": "Full Array Local Dimming (1000+ Zones)",
    "brightness": "1200 nit",
    "contrastRatio": "12000:1",
    "cpu": "Flagship Octa-Core AI Chip",
    "ram": "4GB",
    "storage": "64GB",
    "wifi": "Wi-Fi 6E Tri-Band",
    "bluetooth": "Bluetooth 5.3",
    "hdmi": 4,
    "usb": 3,
    "audioOutput": "2 x 25W + Sub 30W (80W Total)",
    "audioTech": "Dolby Atmos 2.1 3D Soundstage",
    "dimensions": "2235 x 1285 x 85mm",
    "weight": "58 kg",
    "warranty": "24 tháng chính hãng",
    "isNew": true,
    "isFeatured": true,
    "thumbnail": "https://hxy-vietnam.com/storage/uploads/noidung/thumb/hxy-oled-100-inch-s950-1.jpg",
    "images": [
      "https://hxy-vietnam.com/storage/uploads/noidung/hxy-oled-100-inch-s950-1.jpg",
      "https://hxy-vietnam.com/storage/uploads/noidung/hxy-oled-100-inch-s950-0.jpg"
    ],
    "sourceUrl": "https://hxy-vietnam.com/tv-hxy-qled-s950",
    "tags": [
      "HXY",
      "S950",
      "100 inch",
      "Ultra Large",
      "QLED",
      "144Hz",
      "Cinema"
    ],
    "features": [
      "Kích thước khổng lồ 100 inch biến ngôi nhà thành rạp chiếu phim IMAX",
      "Độ sáng đỉnh 1200 nit kết hợp 1000+ vùng làm mờ cục bộ",
      "Tần số quét siêu tốc 144Hz VRR hoàn hảo cho máy chơi game",
      "Hệ thống âm thanh rạp hát tích hợp Subwoofer 80W uy lực",
      "Thiết kế viền hợp kim hàng không siêu cứng vững, đẳng cấp tối thượng"
    ],
    "specs": {
      "display": "100 inch QLED 4K (3840×2160), 144Hz VRR, Dolby Vision IQ, 1200 nit",
      "audio": "2 x 25W + Sub 30W (80W), Dolby Atmos 2.1 Cinema",
      "connectivity": "4 HDMI 2.1, 3 USB 3.0, Wi-Fi 6E, Bluetooth 5.3, eARC",
      "smartFeatures": "Google TV, AI Picture Master, Chromecast Ultra 4K",
      "dimensions": "2235 x 1285 x 85mm | 58 kg",
      "power": "380W"
    },
    "category": [
      "all",
      "hxy",
      "large",
      "4k",
      "qled"
    ]
  },
  {
    "id": "hxy-tv-43g1",
    "brand": "HXY",
    "model": "HXY-43G1",
    "name": "Smart TV HXY 43 inch 4K Google TV",
    "size": 43,
    "sizeLabel": "43 inch",
    "resolution": "4K UHD",
    "resolutionDetail": "3840 x 2160",
    "panel": "LED",
    "os": "Google TV",
    "refreshRate": "60Hz",
    "hdr": true,
    "hdrType": "HDR10",
    "backlight": "Direct LED",
    "brightness": "320 nit",
    "contrastRatio": "4000:1",
    "cpu": "Quad-Core A55",
    "ram": "2GB",
    "storage": "16GB",
    "wifi": "Wi-Fi 5",
    "bluetooth": "Bluetooth 5.0",
    "hdmi": 3,
    "usb": 2,
    "audioOutput": "2 x 10W",
    "audioTech": "Dolby Audio",
    "dimensions": "961 x 558 x 75mm",
    "weight": "6.8 kg",
    "warranty": "24 tháng chính hãng",
    "isNew": false,
    "isFeatured": false,
    "thumbnail": "https://hxy-vietnam.com/storage/uploads/noidung/thumb/tv-hxy-4k-hdr-p750-0.jpg",
    "images": [
      "https://hxy-vietnam.com/storage/uploads/noidung/tv-hxy-4k-hdr-p750-0.jpg"
    ],
    "sourceUrl": "https://hxy-vietnam.com/tv-man-hinh-tv/",
    "tags": [
      "HXY",
      "43 inch",
      "4K UHD",
      "Google TV",
      "Phòng ngủ"
    ],
    "features": [
      "Màn hình 43 inch 4K UHD độ chi tiết vượt trội",
      "Google TV thông minh, dễ dàng tìm kiếm bằng giọng nói",
      "Công nghệ HDR10 tái tạo dải màu phong phú",
      "Loa kép Dolby Audio âm thanh trong trẻo",
      "Kích thước hoàn hảo cho phòng khách nhỏ và phòng ngủ"
    ],
    "specs": {
      "display": "43 inch 4K UHD (3840×2160), 60Hz, HDR10, 320 nit",
      "audio": "2 x 10W Dolby Audio",
      "connectivity": "3 HDMI, 2 USB, Optical, Wi-Fi 5, Bluetooth 5.0",
      "smartFeatures": "Google TV, YouTube, Netflix, Google Assistant",
      "dimensions": "961 x 558 x 75mm | 6.8 kg",
      "power": "80W"
    },
    "category": [
      "all",
      "hxy",
      "43inch",
      "4k"
    ]
  },
  {
    "id": "hxy-tv-32g1",
    "brand": "HXY",
    "model": "HXY-32G1",
    "name": "Smart TV HXY 32 inch HD Google TV",
    "size": 32,
    "sizeLabel": "32 inch",
    "resolution": "HD Ready",
    "resolutionDetail": "1366 x 768",
    "panel": "LED",
    "os": "Google TV",
    "refreshRate": "60Hz",
    "hdr": false,
    "hdrType": "Tiêu chuẩn",
    "backlight": "Edge LED",
    "brightness": "240 nit",
    "contrastRatio": "3000:1",
    "cpu": "Quad-Core A35",
    "ram": "1.5GB",
    "storage": "8GB",
    "wifi": "Wi-Fi 2.4G",
    "bluetooth": "Bluetooth 5.0",
    "hdmi": 2,
    "usb": 1,
    "audioOutput": "2 x 8W",
    "audioTech": "Dolby Audio",
    "dimensions": "730 x 432 x 70mm",
    "weight": "3.7 kg",
    "warranty": "24 tháng chính hãng",
    "isNew": false,
    "isFeatured": false,
    "thumbnail": "https://hxy-vietnam.com/storage/uploads/noidung/thumb/hxy-oled-65-inch-b650-0.jpg",
    "images": [
      "https://hxy-vietnam.com/storage/uploads/noidung/thumb/hxy-oled-65-inch-b650-0.jpg"
    ],
    "sourceUrl": "https://hxy-vietnam.com/tv-man-hinh-tv/",
    "tags": [
      "HXY",
      "32 inch",
      "HD",
      "Google TV",
      "Giá tốt"
    ],
    "features": [
      "Thiết kế 32 inch thanh gọn, dễ di chuyển và lắp đặt",
      "Trang bị Google TV thông minh, dễ sử dụng cho người lớn tuổi và trẻ nhỏ",
      "Hỗ trợ kết nối âm thanh không dây Bluetooth",
      "Tiết kiệm điện năng tối đa",
      "Bảo hành chính hãng 24 tháng"
    ],
    "specs": {
      "display": "32 inch HD (1366×768), 60Hz, 240 nit",
      "audio": "2 x 8W Dolby Audio",
      "connectivity": "2 HDMI, 1 USB, Optical, Wi-Fi, Bluetooth 5.0",
      "smartFeatures": "Google TV, Google Play, YouTube",
      "dimensions": "730 x 432 x 70mm | 3.7 kg",
      "power": "45W"
    },
    "category": [
      "all",
      "hxy",
      "32inch"
    ]
  }
];

// ══════════════════════════════════════════════
//  APPLICATION STATE
// ══════════════════════════════════════════════
const TNP = {
  currentFilter: 'all',
  compareList:   [],
  maxCompare:    3,
  activeProduct: null,
  searchTimeout: null,

  // ──────────────────────────────────────────
  //  INIT
  // ──────────────────────────────────────────
  init() {
    if (typeof injectComponents === 'function') {
      injectComponents();
    }
    this.setupHeader();
    this.setupHeroBanner();
    this.setupMobileMenu();
    this.setupSearch();
    this.renderProducts();
    this.setupProductFilter();
    this.setupProductModal();
    this.setupCompare();
    this.setupFAQ();
    this.setupContactForm();
    this.setupScrollReveal();
    this.setupBackToTop();
    this.setupFloatButtons();
    this.setupSmoothScroll();
    this.setupLazyImages();
    console.log('✅ TNP Website initialized');
  },

  // ──────────────────────────────────────────
  //  HERO SHOWCASE BANNER SLIDER
  // ──────────────────────────────────────────
  setupHeroBanner() {
    const banner = document.getElementById('hero-banner');
    if (!banner) return;

    const slides = banner.querySelectorAll('.hero-slide');
    const tabs   = banner.querySelectorAll('.hero-tab-btn');
    const prevBtn= document.getElementById('hero-prev');
    const nextBtn= document.getElementById('hero-next');

    if (!slides.length) return;

    let currentIndex = 0;
    let timer = null;
    const count = slides.length;

    const showSlide = (idx) => {
      currentIndex = (idx + count) % count;

      slides.forEach((s, i) => {
        const isActive = i === currentIndex;
        s.classList.toggle('active', isActive);
        s.setAttribute('aria-hidden', !isActive);
      });

      tabs.forEach((t, i) => {
        t.classList.toggle('active', i === currentIndex);
      });
    };

    const next = () => showSlide(currentIndex + 1);
    const prev = () => showSlide(currentIndex - 1);

    const startTimer = () => {
      stopTimer();
      timer = setInterval(next, 6000);
    };

    const stopTimer = () => {
      if (timer) clearInterval(timer);
    };

    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => {
        showSlide(idx);
        startTimer();
      });
    });

    nextBtn?.addEventListener('click', () => {
      next();
      startTimer();
    });

    prevBtn?.addEventListener('click', () => {
      prev();
      startTimer();
    });

    banner.addEventListener('mouseenter', stopTimer);
    banner.addEventListener('mouseleave', startTimer);

    startTimer();
  },

  // ──────────────────────────────────────────
  //  STICKY HEADER
  // ──────────────────────────────────────────
  setupHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  },

  // ──────────────────────────────────────────
  //  MOBILE MENU
  // ──────────────────────────────────────────
  setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const overlay   = document.getElementById('mobile-overlay');
    const mobileMenu= document.getElementById('mobile-menu');
    const mobileClose=document.getElementById('mobile-close');
    const toggleLinks= document.querySelectorAll('.mobile-nav-toggle');

    const open = () => {
      hamburger?.classList.add('open');
      overlay?.classList.add('open');
      mobileMenu?.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      hamburger?.classList.remove('open');
      overlay?.classList.remove('open');
      mobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
    };

    hamburger?.addEventListener('click', () => mobileMenu?.classList.contains('open') ? close() : open());
    overlay?.addEventListener('click', close);
    mobileClose?.addEventListener('click', close);

    // Submenu toggles
    toggleLinks.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const submenuId = toggle.dataset.target;
        const submenu = document.getElementById(submenuId);
        if (!submenu) return;
        const isOpen = submenu.classList.contains('open');
        document.querySelectorAll('.mobile-submenu.open').forEach(s => s.classList.remove('open'));
        if (!isOpen) submenu.classList.add('open');
      });
    });

    // Close menu on nav link click
    document.querySelectorAll('.mobile-nav-link:not(.mobile-nav-toggle)').forEach(link => {
      link.addEventListener('click', close);
    });
  },

  // ──────────────────────────────────────────
  //  SEARCH OVERLAY
  // ──────────────────────────────────────────
  setupSearch() {
    const searchBtn   = document.getElementById('search-btn');
    const searchOverlay=document.getElementById('search-overlay');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');
    const searchResults=document.getElementById('search-results');

    const openSearch = () => {
      searchOverlay?.classList.add('open');
      setTimeout(() => searchInput?.focus(), 100);
      document.body.style.overflow = 'hidden';
    };
    const closeSearch = () => {
      searchOverlay?.classList.remove('open');
      document.body.style.overflow = '';
      if (searchInput) searchInput.value = '';
      if (searchResults) searchResults.innerHTML = '';
    };

    searchBtn?.addEventListener('click', openSearch);
    searchClose?.addEventListener('click', closeSearch);
    searchOverlay?.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });

    searchInput?.addEventListener('input', (e) => {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => this.doSearch(e.target.value, searchResults), 250);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSearch();
    });
  },

  doSearch(query, container) {
    if (!container) return;
    if (!query.trim()) { container.innerHTML = ''; return; }
    const q = query.toLowerCase().trim();
    const results = TNP_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.resolution.toLowerCase().includes(q) ||
      p.sizeLabel.toLowerCase().includes(q) ||
      p.panel.toLowerCase().includes(q)
    );
    if (!results.length) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:#9ca3af;font-size:14px;">Không tìm thấy sản phẩm phù hợp</div>';
      return;
    }
    container.innerHTML = results.slice(0,6).map(p => `
      <div class="search-result-item" onclick="TNP.openModal('${p.id}')">
        <i class="fas fa-tv"></i>
        <div>
          <div style="font-weight:700;font-size:14px;">${p.name}</div>
          <div style="font-size:12px;color:#6b7280;">${p.brand} · ${p.resolution} · ${p.sizeLabel}</div>
        </div>
      </div>
    `).join('');
  },

  // ──────────────────────────────────────────
  //  RENDER PRODUCTS
  // ──────────────────────────────────────────
  renderProducts() {
    // 1. Featured grid (e.g. on homepage)
    const featuredGrid = document.getElementById('product-grid-featured');
    if (featuredGrid) {
      const featured = TNP_PRODUCTS.filter(p => p.isFeatured).slice(0, 4);
      featuredGrid.innerHTML = featured.map(p => this.renderProductCardHTML(p)).join('');
    }

    // 2. Full product grid (e.g. on san-pham.html)
    const grid = document.getElementById('product-grid');
    if (grid) {
      grid.innerHTML = TNP_PRODUCTS.map(p => this.renderProductCardHTML(p)).join('') +
        '<div class="no-products" id="no-products"><i class="fas fa-search"></i><p>Không có sản phẩm nào phù hợp</p></div>';
    }

    // 3. Brand specific page grid (e.g. on tv-hxy.html and tv-hikers.html)
    const brandPage = document.body.dataset.brandPage;
    const brandGrid = document.getElementById('products-grid');
    if (brandGrid && brandPage) {
      const brandProducts = TNP_PRODUCTS.filter(p => p.brand.toUpperCase() === brandPage.toUpperCase());
      brandGrid.innerHTML = brandProducts.map(p => this.renderProductCardHTML(p)).join('');
    }
  },

  renderProductCardHTML(p) {
    return `
      <div class="product-card" data-id="${p.id}" data-category="${p.category.join(' ')}"
           onclick="TNP.openModal('${p.id}')">
        <div class="product-thumb">
          ${this.renderProductThumb(p)}
          <span class="product-brand-badge ${p.brand.toLowerCase()}">${p.brand}</span>
          ${p.isNew ? '<span class="product-new-badge">Mới</span>' : ''}
        </div>
        <div class="product-body">
          <div class="product-brand-label ${p.brand === 'HXY' ? 'blue' : 'red'}">${p.brand}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-specs-row">
            <span class="spec-pill">${p.sizeLabel}</span>
            <span class="spec-pill">${p.resolution}</span>
            <span class="spec-pill">${p.panel}</span>
            <span class="spec-pill">${p.refreshRate}</span>
            ${p.hdr ? '<span class="spec-pill">HDR</span>' : ''}
          </div>
          <div class="product-meta-row">
            <span class="product-inquiry-label">Liên hệ báo giá</span>
            <div class="product-compare-wrap" onclick="event.stopPropagation()">
              <input type="checkbox" class="compare-checkbox" id="cmp-${p.id}"
                     onchange="TNP.toggleCompare('${p.id}', this.checked)"
                     aria-label="So sánh ${p.name}">
              <label class="compare-label" for="cmp-${p.id}">So sánh</label>
            </div>
          </div>
          <div class="product-actions-row">
            <button class="btn-card-detail" onclick="event.stopPropagation(); TNP.openModal('${p.id}')">
              <i class="fas fa-eye" aria-hidden="true"></i> Xem chi tiết
            </button>
            <button class="btn-card-inquire" onclick="event.stopPropagation(); TNP.scrollToContact('${p.name}')">
              <i class="fas fa-phone-alt" aria-hidden="true"></i> Tư vấn ngay
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderProductThumb(p) {
    const thumb = p.thumbnail || './images/products/placeholder.svg';
    return `
      <img src="${thumb}" alt="${p.name}" class="product-thumb-img" loading="lazy"
           onerror="this.onerror=null;this.src='./images/products/placeholder.svg';">
    `;
  },

  scrollToContact(productName) {
    const contactSection = document.getElementById('contact') || document.getElementById('contact-form');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      const select = document.getElementById('contact-product');
      if (select && productName) {
        for (let opt of select.options) {
          if (opt.text.toLowerCase().includes(productName.toLowerCase())) {
            opt.selected = true;
            break;
          }
        }
      }
    } else {
      window.location.href = `./lien-he.html?product=${encodeURIComponent(productName || '')}`;
    }
  },

  filterState: {
    brand: 'all',
    size: 'all',
    tech: 'all'
  },

  // ──────────────────────────────────────────
  //  PRODUCT FILTER
  // ──────────────────────────────────────────
  setupProductFilter() {
    // 1. Brand tabs (Tách riêng thương hiệu)
    const brandTabs = document.querySelectorAll('.brand-tab');
    brandTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        brandTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        this.filterState.brand = tab.dataset.filterBrand || 'all';
        this.applyFilters();
      });
    });

    // 2. Kích thước màn hình
    const sizeChips = document.querySelectorAll('[data-filter-size]');
    sizeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        sizeChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.filterState.size = chip.dataset.filterSize || 'all';
        this.applyFilters();
      });
    });

    // 3. Công nghệ & Phân khúc
    const techChips = document.querySelectorAll('[data-filter-tech]');
    techChips.forEach(chip => {
      chip.addEventListener('click', () => {
        techChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.filterState.tech = chip.dataset.filterTech || 'all';
        this.applyFilters();
      });
    });

    // 4. Legacy single chips support
    const legacyChips = document.querySelectorAll('.filter-chip[data-filter]');
    legacyChips.forEach(chip => {
      chip.addEventListener('click', () => {
        legacyChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        if (filter === 'hxy' || filter === 'hikers') {
          this.filterState.brand = filter;
        } else if (filter === 'all') {
          this.filterState = { brand: 'all', size: 'all', tech: 'all' };
        } else {
          this.filterState.size = filter;
        }
        this.applyFilters();
      });
    });

    // 5. Nút đặt lại bộ lọc
    const resetBtn = document.getElementById('reset-filter-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.filterState = { brand: 'all', size: 'all', tech: 'all' };
        brandTabs.forEach(t => t.classList.toggle('active', t.dataset.filterBrand === 'all'));
        sizeChips.forEach(c => c.classList.toggle('active', c.dataset.filterSize === 'all'));
        techChips.forEach(c => c.classList.toggle('active', c.dataset.filterTech === 'all'));
        this.applyFilters();
      });
    }

    // 6. Check URL query parameters (e.g. san-pham.html?filter=hxy)
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter') || urlParams.get('brand');
    if (filterParam) {
      if (filterParam === 'hxy' || filterParam === 'hikers') {
        const targetTab = document.querySelector(`.brand-tab[data-filter-brand="${filterParam}"]`);
        if (targetTab) {
          brandTabs.forEach(t => t.classList.remove('active'));
          targetTab.classList.add('active');
          this.filterState.brand = filterParam;
          this.applyFilters();
        }
      } else {
        const targetSize = document.querySelector(`[data-filter-size="${filterParam}"]`);
        const targetTech = document.querySelector(`[data-filter-tech="${filterParam}"]`);
        if (targetSize) targetSize.click();
        else if (targetTech) targetTech.click();
      }
    } else {
      this.applyFilters();
    }
  },

  applyFilters() {
    const cards = document.querySelectorAll('#product-grid .product-card');
    let visible = 0;
    cards.forEach(card => {
      const cats = (card.dataset.category || '').split(' ');
      const matchBrand = this.filterState.brand === 'all' || cats.includes(this.filterState.brand);
      const matchSize  = this.filterState.size  === 'all' || cats.includes(this.filterState.size);
      const matchTech  = this.filterState.tech  === 'all' || cats.includes(this.filterState.tech);

      const show = matchBrand && matchSize && matchTech;
      card.setAttribute('data-hidden', !show);
      if (show) visible++;
    });

    const countEl = document.getElementById('filter-count');
    if (countEl) countEl.textContent = visible;

    const resetBtn = document.getElementById('reset-filter-btn');
    if (resetBtn) {
      const isFiltered = this.filterState.brand !== 'all' || this.filterState.size !== 'all' || this.filterState.tech !== 'all';
      resetBtn.style.display = isFiltered ? 'inline-flex' : 'none';
    }

    const noProducts = document.getElementById('no-products');
    if (noProducts) noProducts.classList.toggle('show', visible === 0);
  },

  filterProducts(filter) {
    if (filter === 'hxy' || filter === 'hikers') {
      this.filterState.brand = filter;
    } else if (filter === 'all') {
      this.filterState = { brand: 'all', size: 'all', tech: 'all' };
    } else {
      this.filterState.size = filter;
    }
    this.applyFilters();
  },

  // ──────────────────────────────────────────
  //  PRODUCT MODAL
  // ──────────────────────────────────────────
  setupProductModal() {
    const backdrop = document.getElementById('product-modal');
    const closeBtn  = document.getElementById('modal-close');
    if (!backdrop) return;

    closeBtn?.addEventListener('click', () => this.closeModal());
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) this.closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('open')) this.closeModal();
    });
  },

  openModal(productId) {
    const product = TNP_PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    this.activeProduct = product;

    // Close search overlay if open
    document.getElementById('search-overlay')?.classList.remove('open');
    document.body.style.overflow = '';

    const backdrop = document.getElementById('product-modal');
    if (!backdrop) return;

    // Populate modal
    document.getElementById('modal-brand').textContent   = product.brand;
    document.getElementById('modal-brand').className     = `modal-brand-badge ${product.brand === 'HXY' ? 'blue' : 'red'}`;
    document.getElementById('modal-name').textContent    = product.name;
    document.getElementById('modal-model').textContent   = `Model: ${product.model}`;

    // Features
    const featEl = document.getElementById('modal-features-list');
    if (featEl) {
      featEl.innerHTML = product.features.map(f =>
        `<div class="feature-item"><i class="fas fa-check-circle"></i><span>${f}</span></div>`
      ).join('');
    }

    // Specs
    const specsEl = document.getElementById('modal-specs-table');
    if (specsEl) {
      const specItems = [
        { key: 'Màn hình', val: product.specs.display },
        { key: 'Âm thanh', val: product.specs.audio },
        { key: 'Kết nối', val: product.specs.connectivity },
        { key: 'Smart TV', val: product.specs.smartFeatures },
        { key: 'Kích thước/Khối lượng', val: product.specs.dimensions },
        { key: 'Công suất', val: product.specs.power },
        { key: 'Bảo hành', val: product.warranty },
      ];
      specsEl.innerHTML = specItems.map(s =>
        `<div class="specs-row"><span class="specs-key">${s.key}</span><span class="specs-val">${s.val}</span></div>`
      ).join('');
    }

    // Thumbnail
    const mainImg = document.getElementById('modal-main-img');
    if (mainImg) {
      const imgUrl = (product.images && product.images[0]) || product.thumbnail || './images/products/placeholder.svg';
      mainImg.innerHTML = `
        <img src="${imgUrl}" alt="${product.name}"
             style="width:100%;height:100%;object-fit:cover;border-radius:var(--r-lg);"
             onerror="this.onerror=null;this.src='./images/products/placeholder.svg';">
      `;
    }

    // Inquire button
    const inquireBtn = document.getElementById('modal-inquire-btn');
    if (inquireBtn) {
      inquireBtn.onclick = () => {
        this.closeModal();
        setTimeout(() => this.scrollToContact(product.name), 300);
      };
    }

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('product-modal')?.classList.remove('open');
    document.body.style.overflow = '';
    this.activeProduct = null;
  },

  // ──────────────────────────────────────────
  //  COMPARE
  // ──────────────────────────────────────────
  setupCompare() {
    const compareBtn  = document.getElementById('compare-btn');
    const clearBtn    = document.getElementById('compare-clear');
    const compareModal= document.getElementById('compare-modal');
    const compareClose= document.getElementById('compare-modal-close');

    compareBtn?.addEventListener('click', () => this.openCompareModal());
    clearBtn?.addEventListener('click', () => this.clearCompare());
    compareClose?.addEventListener('click', () => this.closeCompareModal());
    compareModal?.addEventListener('click', (e) => {
      if (e.target === compareModal) this.closeCompareModal();
    });
  },

  toggleCompare(productId, checked) {
    if (checked) {
      if (this.compareList.length >= this.maxCompare) {
        alert(`Bạn chỉ có thể so sánh tối đa ${this.maxCompare} sản phẩm cùng lúc.`);
        const chk = document.getElementById(`cmp-${productId}`);
        if (chk) chk.checked = false;
        return;
      }
      if (!this.compareList.includes(productId)) this.compareList.push(productId);
    } else {
      this.compareList = this.compareList.filter(id => id !== productId);
    }
    this.updateCompareBar();
  },

  updateCompareBar() {
    const bar = document.getElementById('compare-bar');
    if (!bar) return;

    bar.classList.toggle('visible', this.compareList.length > 0);

    for (let i = 0; i < 3; i++) {
      const slot = document.getElementById(`compare-slot-${i}`);
      if (!slot) continue;
      const product = this.compareList[i] ? TNP_PRODUCTS.find(p => p.id === this.compareList[i]) : null;
      if (product) {
        slot.className = 'compare-slot filled';
        slot.innerHTML = `
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${product.sizeLabel} ${product.brand}</span>
          <span class="compare-slot-remove" onclick="TNP.removeFromCompare('${product.id}')">✕</span>
        `;
      } else {
        slot.className = 'compare-slot';
        slot.innerHTML = `<span>+ Thêm sản phẩm</span>`;
      }
    }
  },

  removeFromCompare(productId) {
    this.compareList = this.compareList.filter(id => id !== productId);
    const chk = document.getElementById(`cmp-${productId}`);
    if (chk) chk.checked = false;
    this.updateCompareBar();
  },

  clearCompare() {
    this.compareList.forEach(id => {
      const chk = document.getElementById(`cmp-${id}`);
      if (chk) chk.checked = false;
    });
    this.compareList = [];
    this.updateCompareBar();
  },

  openCompareModal() {
    if (this.compareList.length < 2) {
      alert('Vui lòng chọn ít nhất 2 sản phẩm để so sánh.');
      return;
    }
    const products = this.compareList.map(id => TNP_PRODUCTS.find(p => p.id === id)).filter(Boolean);
    this.renderCompareTable(products);
    document.getElementById('compare-modal')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeCompareModal() {
    document.getElementById('compare-modal')?.classList.remove('open');
    document.body.style.overflow = '';
  },

  renderCompareTable(products) {
    const tbody = document.getElementById('compare-table-body');
    if (!tbody) return;

    const specRows = [
      { label: 'Thương hiệu', fn: p => `<span style="font-weight:800;">${p.brand}</span>` },
      { label: 'Kích thước', fn: p => p.sizeLabel },
      { label: 'Độ phân giải', fn: p => p.resolution },
      { label: 'Loại màn hình', fn: p => p.panel },
      { label: 'Tần số quét', fn: p => p.refreshRate },
      { label: 'HDR', fn: p => p.hdr ? `<span class="compare-check">✓ ${p.hdrType}</span>` : `<span class="compare-x">✗</span>` },
      { label: 'Hệ điều hành', fn: p => p.os },
      { label: 'RAM', fn: p => p.ram },
      { label: 'Bộ nhớ', fn: p => p.storage },
      { label: 'Wi-Fi', fn: p => p.wifi },
      { label: 'Bluetooth', fn: p => p.bluetooth },
      { label: 'HDMI', fn: p => `${p.hdmi} cổng` },
      { label: 'USB', fn: p => `${p.usb} cổng` },
      { label: 'Âm thanh', fn: p => p.audioOutput },
      { label: 'Công nghệ âm thanh', fn: p => p.audioTech },
      { label: 'Kích thước/KL', fn: p => p.dimensions + ' | ' + p.weight },
      { label: 'Bảo hành', fn: p => p.warranty },
    ];

    // Header row
    const headCols = products.map(p => `
      <th class="product-col-head">
        <div class="brand-name" style="color:${p.brand==='HXY'?'var(--tnp-blue)':'var(--tnp-red)'}">${p.brand}</div>
        <div class="prod-name">${p.name}</div>
      </th>
    `).join('');
    document.getElementById('compare-table-head')?.querySelector('tr')
      ?.insertAdjacentHTML('beforeend', headCols);

    tbody.innerHTML = specRows.map(row => `
      <tr>
        <td class="row-header">${row.label}</td>
        ${products.map(p => `<td style="text-align:center;">${row.fn(p)}</td>`).join('')}
      </tr>
    `).join('');
  },

  // ──────────────────────────────────────────
  //  FAQ ACCORDION
  // ──────────────────────────────────────────
  setupFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const btn = item.querySelector('.faq-q');
      btn?.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close all
        items.forEach(i => i.classList.remove('open'));
        // Toggle current
        if (!isOpen) item.classList.add('open');
      });
    });
  },

  // ──────────────────────────────────────────
  //  CONTACT FORM
  // ──────────────────────────────────────────
  setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => this.handleContactSubmit(e));

    // Pre-fill product from URL parameter if available
    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('product');
    if (productParam) {
      const productSelect = document.getElementById('contact-product');
      if (productSelect) {
        // Try matching option by text
        for (let opt of productSelect.options) {
          if (opt.text.toLowerCase().includes(productParam.toLowerCase())) {
            opt.selected = true;
            break;
          }
        }
      }
    }
  },

  handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const fields = form.querySelectorAll('[required]');
    let valid = true;

    fields.forEach(field => {
      const err = field.parentElement.querySelector('.form-error');
      field.classList.remove('error');
      if (err) err.classList.remove('show');

      if (!field.value.trim()) {
        valid = false;
        field.classList.add('error');
        if (err) { err.textContent = 'Vui lòng điền thông tin này.'; err.classList.add('show'); }
      } else if (field.type === 'tel' && !/^[0-9+\-\s]{8,15}$/.test(field.value.trim())) {
        valid = false;
        field.classList.add('error');
        if (err) { err.textContent = 'Số điện thoại không hợp lệ.'; err.classList.add('show'); }
      }
    });

    if (!valid) return;

    // Send to API
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang gửi...'; }

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        form.reset();
        const successEl = document.getElementById('form-success');
        if (successEl) successEl.classList.add('show');
        setTimeout(() => successEl?.classList.remove('show'), 5000);
      } else {
        alert(res.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    })
    .catch(() => {
      // Fallback: show success anyway (demo mode)
      form.reset();
      const successEl = document.getElementById('form-success');
      if (successEl) successEl.classList.add('show');
      setTimeout(() => successEl?.classList.remove('show'), 5000);
    })
    .finally(() => {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Gửi yêu cầu tư vấn'; }
    });
  },

  scrollToContact(productName) {
    const section = document.getElementById('contact') || document.getElementById('contact-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const productField = document.getElementById('contact-product');
        if (productField && productName) productField.value = productName;
      }, 500);
    } else {
      window.location.href = `./lien-he.html?product=${encodeURIComponent(productName || '')}`;
    }
  },

  // ──────────────────────────────────────────
  //  SCROLL REVEAL
  // ──────────────────────────────────────────
  setupScrollReveal() {
    const elements = document.querySelectorAll('[data-sr]');
    if (!elements.length) return;

    document.documentElement.classList.add('js-loaded');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('sr-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

    elements.forEach(el => observer.observe(el));
  },

  // ──────────────────────────────────────────
  //  BACK TO TOP
  // ──────────────────────────────────────────
  setupBackToTop() {
    const btn = document.getElementById('back-top');
    if (!btn) return;

    const toggle = () => btn.classList.toggle('show', window.scrollY > 400);
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  },

  // ──────────────────────────────────────────
  //  FLOAT BUTTONS
  // ──────────────────────────────────────────
  setupFloatButtons() {
    // Add pulse animation to phone button
    const phoneBtn = document.querySelector('.float-btn-phone');
    if (phoneBtn) phoneBtn.classList.add('float-btn-pulse');
  },

  // ──────────────────────────────────────────
  //  SMOOTH SCROLL
  // ──────────────────────────────────────────
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const offset = document.getElementById('site-header')?.offsetHeight || 70;
          const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
      });
    });
  },

  // ──────────────────────────────────────────
  //  LAZY IMAGES
  // ──────────────────────────────────────────
  setupLazyImages() {
    const imgs = document.querySelectorAll('img[data-src]');
    if (!imgs.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    imgs.forEach(img => observer.observe(img));
  },

  // ──────────────────────────────────────────
  //  HERO COUNTER ANIMATION
  // ──────────────────────────────────────────
  animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const duration = 1800;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current).toLocaleString('vi-VN');
        if (current >= target) clearInterval(timer);
      }, 16);
    });
  }
};

// ══════════════════════════════════════════════
//  DOM READY
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  TNP.init();

  // Animate counters when stats section enters viewport
  const statsSection = document.querySelector('.stats-bar');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        TNP.animateCounters();
        statsObserver.disconnect();
      }
    }, { threshold: 0.3 });
    statsObserver.observe(statsSection);
  }

  // Hero entrance animation
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(20px)';
    setTimeout(() => {
      heroContent.style.transition = 'opacity .7s ease, transform .7s ease';
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }, 100);
  }
});

// Make TNP accessible globally
window.TNP = TNP;
