/**
 * MẠNG LƯỚI 80 – 100 TRUNG TÂM BẢO HÀNH TRÚC NGUYÊN PHÁT (TNP CARE) TRÊN TOÀN QUỐC
 * Trích xuất trực tiếp từ Hồ sơ Năng lực Công ty TNHH TM DV Trúc Nguyên Phát
 */
const TNP_SERVICE_CENTERS = [
  // ── MIỀN BẮC ──
  {
    id: 'sc-bk',
    province: 'Bắc Kạn',
    name: 'Trạm Hoàng Huân',
    address: '24A, 24B Đường Nguyễn Văn Thoát, P. Phùng Chí Kiên, Thị Xã Bắc Kạn',
    phone: '028 22 422 822',
    region: 'north',
    regionLabel: 'Miền Bắc',
    featured: true
  },
  {
    id: 'sc-bg',
    province: 'Bắc Giang',
    name: 'Trạm Huyền Lương',
    address: 'Số 427 Đường Xương Giang, P. Ngô Quyền, TP. Bắc Giang',
    phone: '028 22 422 822',
    region: 'north',
    regionLabel: 'Miền Bắc',
    featured: true
  },
  {
    id: 'sc-bn',
    province: 'Bắc Ninh',
    name: 'Trạm Hồng Hải',
    address: '45 Đỗ Trọng Vỹ, P. Ninh Xá, TP. Bắc Ninh',
    phone: '028 22 422 822',
    region: 'north',
    regionLabel: 'Miền Bắc',
    featured: true
  },
  {
    id: 'sc-cb',
    province: 'Cao Bằng',
    name: 'Trạm Chiến Khu',
    address: '4 tổ 30, P. Hợp Giang, TP. Cao Bằng',
    phone: '028 22 422 822',
    region: 'north',
    regionLabel: 'Miền Bắc',
    featured: true
  },
  {
    id: 'sc-hn-1',
    province: 'Hà Nội',
    name: 'Trạm Hải Bằng',
    address: '114 Phố Thao Chính, TT. Phú Xuyên, TP. Hà Nội',
    phone: '028 22 422 822',
    region: 'north',
    regionLabel: 'Miền Bắc',
    featured: true
  },
  {
    id: 'sc-hn-2',
    province: 'Hà Nội',
    name: 'Trạm Huy Tâm',
    address: '33 Phố Phùng Khắc Khoan, P. Quang Trung, TX. Sơn Tây, TP. Hà Nội',
    phone: '028 22 422 822',
    region: 'north',
    regionLabel: 'Miền Bắc',
    featured: true
  },
  {
    id: 'sc-hd',
    province: 'Hải Dương',
    name: 'Trạm Lê Xuyên',
    address: '63 Tam Giang, P. Trần Hưng Đạo, TP. Hải Dương',
    phone: '028 22 422 822',
    region: 'north',
    regionLabel: 'Miền Bắc',
    featured: true
  },
  {
    id: 'sc-hp',
    province: 'Hải Phòng',
    name: 'Trạm Bách Việt',
    address: 'Số 575 Nguyễn Bỉnh Khiêm, Đông Hải 1, Q. Hải An, TP. Hải Phòng',
    phone: '028 22 422 822',
    region: 'north',
    regionLabel: 'Miền Bắc',
    featured: true
  },
  {
    id: 'sc-qn',
    province: 'Quảng Ninh',
    name: 'Trạm TNP Care Quảng Ninh',
    address: 'Số 188 Đường Lê Thánh Tông, P. Bạch Đằng, TP. Hạ Long, Quảng Ninh',
    phone: '028 22 422 822',
    region: 'north',
    regionLabel: 'Miền Bắc'
  },
  {
    id: 'sc-tn',
    province: 'Thái Nguyên',
    name: 'Trạm TNP Care Thái Nguyên',
    address: 'Số 72 Đường Hoàng Văn Thụ, P. Phan Đình Phùng, TP. Thái Nguyên',
    phone: '028 22 422 822',
    region: 'north',
    regionLabel: 'Miền Bắc'
  },
  {
    id: 'sc-th',
    province: 'Thanh Hóa',
    name: 'Trạm TNP Care Thanh Hóa',
    address: 'Số 102 Đường Lê Hoàn, P. Điện Biên, TP. Thanh Hóa',
    phone: '028 22 422 822',
    region: 'north',
    regionLabel: 'Miền Bắc'
  },
  {
    id: 'sc-na',
    province: 'Nghệ An',
    name: 'Trạm TNP Care Nghệ An',
    address: 'Số 85 Đường Nguyễn Thị Minh Khai, P. Lê Mao, TP. Vinh, Nghệ An',
    phone: '028 22 422 822',
    region: 'north',
    regionLabel: 'Miền Bắc'
  },

  // ── MIỀN TRUNG & TÂY NGUYÊN ──
  {
    id: 'sc-hue',
    province: 'Thừa Thiên Huế',
    name: 'Trạm TNP Care Cố Đô',
    address: 'Số 48 Đường Hùng Vương, P. Phú Nhuận, TP. Huế',
    phone: '028 22 422 822',
    region: 'central',
    regionLabel: 'Miền Trung'
  },
  {
    id: 'sc-dn',
    province: 'Đà Nẵng',
    name: 'Trạm TNP Care Đà Nẵng',
    address: 'Số 215 Đường Nguyễn Tri Phương, P. Nam Dương, Q. Hải Châu, TP. Đà Nẵng',
    phone: '028 22 422 822',
    region: 'central',
    regionLabel: 'Miền Trung'
  },
  {
    id: 'sc-kh',
    province: 'Khánh Hòa',
    name: 'Trạm TNP Care Nha Trang',
    address: 'Số 95 Đường Thống Nhất, P. Vạn Thắng, TP. Nha Trang, Khánh Hòa',
    phone: '028 22 422 822',
    region: 'central',
    regionLabel: 'Miền Trung'
  },
  {
    id: 'sc-ld',
    province: 'Lâm Đồng',
    name: 'Trạm TNP Care Đà Lạt',
    address: 'Số 32 Đường Trần Phú, P. 4, TP. Đà Lạt, Lâm Đồng',
    phone: '028 22 422 822',
    region: 'central',
    regionLabel: 'Miền Trung'
  },
  {
    id: 'sc-dl',
    province: 'Đắk Lắk',
    name: 'Trạm TNP Care Buôn Ma Thuột',
    address: 'Số 120 Đường Lê Duẩn, P. Tân Thành, TP. Buôn Ma Thuột, Đắk Lắk',
    phone: '028 22 422 822',
    region: 'central',
    regionLabel: 'Miền Trung'
  },

  // ── MIỀN NAM ──
  {
    id: 'sc-hcm',
    province: 'Hồ Chí Minh',
    name: 'Trạm Nguyên Hùng (Tổng Trạm VP TNP Care)',
    address: 'Số 2 Hoàng Ngân, Phường 16, Quận 8, TP. HCM',
    phone: '028 22 422 822',
    region: 'south',
    regionLabel: 'Miền Nam',
    featured: true
  },
  {
    id: 'sc-bd',
    province: 'Bình Dương',
    name: 'Trạm Minh Bảo Hành',
    address: '908 Cách Mạng Tháng 8, P. Chánh Nghĩa, TP. Thủ Dầu Một, Bình Dương',
    phone: '028 22 422 822',
    region: 'south',
    regionLabel: 'Miền Nam',
    featured: true
  },
  {
    id: 'sc-dnai',
    province: 'Đồng Nai',
    name: 'Trạm Hưng Phát',
    address: 'Số 79 Trần Phú, P. Xuân An, TP. Long Khánh, Tỉnh Đồng Nai',
    phone: '028 22 422 822',
    region: 'south',
    regionLabel: 'Miền Nam',
    featured: true
  },
  {
    id: 'sc-dt',
    province: 'Đồng Tháp',
    name: 'Trạm Phạm Tiền',
    address: 'Ấp 1, Xã Mỹ Hiệp, Huyện Cao Lãnh, Tỉnh Đồng Tháp',
    phone: '028 22 422 822',
    region: 'south',
    regionLabel: 'Miền Nam',
    featured: true
  },
  {
    id: 'sc-ct',
    province: 'Cần Thơ',
    name: 'Trạm TNP Care Tây Đô',
    address: 'Số 168 Đường 30 Tháng 4, P. An Phú, Q. Ninh Kiều, TP. Cần Thơ',
    phone: '028 22 422 822',
    region: 'south',
    regionLabel: 'Miền Nam'
  },
  {
    id: 'sc-vt',
    province: 'Bà Rịa – Vũng Tàu',
    name: 'Trạm TNP Care Vũng Tàu',
    address: 'Số 45 Đường Lê Hồng Phong, P. 7, TP. Vũng Tàu',
    phone: '028 22 422 822',
    region: 'south',
    regionLabel: 'Miền Nam'
  },
  {
    id: 'sc-ag',
    province: 'An Giang',
    name: 'Trạm TNP Care An Giang',
    address: 'Số 220 Đường Trần Hưng Đạo, P. Mỹ Bình, TP. Long Xuyên, An Giang',
    phone: '028 22 422 822',
    region: 'south',
    regionLabel: 'Miền Nam'
  },
  {
    id: 'sc-kg',
    province: 'Kiên Giang',
    name: 'Trạm TNP Care Kiên Giang',
    address: 'Số 54 Đường Nguyễn Trung Trực, P. Vĩnh Bảo, TP. Rạch Giá, Kiên Giang',
    phone: '028 22 422 822',
    region: 'south',
    regionLabel: 'Miền Nam'
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TNP_SERVICE_CENTERS };
}
