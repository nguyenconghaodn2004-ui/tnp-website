/**
 * TRÚC NGUYÊN PHÁT – TNP
 * Node.js / Express Server
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Tự động nạp biến môi trường từ file .env (không cần cài thêm thư viện)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const value = trimmed.substring(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'tnpcare.vn';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON and URL-encoded bodies (cho phép tải ảnh Base64 lên tới 25MB)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// ══════════════════════════════════════════════
//  DATABASE FILE PERSISTENCE (LƯU TRỮ VĨNH VIỄN)
// ══════════════════════════════════════════════
const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

function readDbFile(filename, fallbackData) {
  const filePath = path.join(DB_DIR, filename);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.warn(`⚠️ Lỗi đọc file ${filename}, dùng dữ liệu mặc định:`, e.message);
    }
  }
  return fallbackData;
}

function writeDbFile(filename, data) {
  try {
    const filePath = path.join(DB_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

    // Đồng bộ sang public/data/ nếu có
    const pubPath = path.join(__dirname, 'public', 'data', filename);
    if (fs.existsSync(path.dirname(pubPath))) {
      fs.writeFileSync(pubPath, JSON.stringify(data, null, 2), 'utf8');
    }
    return true;
  } catch (e) {
    console.error(`❌ Lỗi ghi file ${filename}:`, e);
    return false;
  }
}

// Khởi tạo State ban đầu từ các file lưu trữ
let dbProducts = readDbFile('products.json', null);
if (!dbProducts) {
  try {
    const { products } = require('./data/products');
    dbProducts = products || [];
    writeDbFile('products.json', dbProducts);
  } catch (e) { dbProducts = []; }
}

let dbStations = readDbFile('stations.json', null);
if (!dbStations) {
  dbStations = [];
  writeDbFile('stations.json', dbStations);
}

let dbBanners = readDbFile('banners.json', null);
if (!dbBanners) {
  dbBanners = [
    {
      id: 'banner-1',
      title: 'Smart TV HXY 100 Inch - QLED Đỉnh Cao Rạp Phim Tại Gia',
      badge: 'TV HXY VIỆT NAM · FLAGSHIP CINEMA',
      image: './images/banner_hxy_100.jpg',
      desc: 'Màn hình vô cực 100 inch chuẩn rạp chiếu phim IMAX thế hệ mới, tấm nền QLED 4K siêu sắc nét, 144Hz VRR.',
      link: './tv-hxy.html',
      order: 1,
      active: true
    },
    {
      id: 'banner-2',
      title: 'HIKERS Mini LED 75 Inch - Đỉnh Cao Tương Phản 1000+ Dimming Zones',
      badge: 'HIKERS VIỆT NAM · CÔNG NGHỆ MINI LED',
      image: './images/banner_hikers_75.jpg',
      desc: 'Công nghệ đèn nền Mini LED siêu sáng 1200 nit, dải màu 98% DCI-P3, âm thanh Dolby Atmos sống động.',
      link: './tv-hikers.html',
      order: 2,
      active: true
    },
    {
      id: 'banner-3',
      title: 'Dịch Vụ Bảo Hành Smart TV Toàn Quốc - Chuẩn Mực & Uy Tín',
      badge: 'TNP CARE · DỊCH VỤ TOÀN QUỐC',
      image: './images/banner_tnp_care.jpg',
      desc: 'Mạng lưới 80 - 100 trạm bảo hành phủ sóng 63 tỉnh thành, cam kết linh kiện chính hãng 100%.',
      link: './tram-bao-hanh.html',
      order: 3,
      active: true
    }
  ];
  writeDbFile('banners.json', dbBanners);
}

let dbContacts = readDbFile('contacts.json', []);

// 1. API Sản phẩm TV (Đồng bộ vĩnh viễn)
app.get('/api/products', (req, res) => {
  res.json({ success: true, data: dbProducts });
});

app.post('/api/admin/products', (req, res) => {
  const newProducts = req.body;
  if (!Array.isArray(newProducts)) {
    return res.status(400).json({ success: false, message: 'Dữ liệu sản phẩm phải là một danh sách mảng (Array).' });
  }
  dbProducts = newProducts;
  writeDbFile('products.json', dbProducts);
  console.log(`💾 Đã lưu vĩnh viễn ${dbProducts.length} sản phẩm TV vào Database!`);
  res.json({ success: true, message: 'Đã lưu vĩnh viễn danh sách sản phẩm thành công!' });
});

// 2. API Banner Hero Slider (Đồng bộ vĩnh viễn)
app.get('/api/banners', (req, res) => {
  res.json({ success: true, data: dbBanners.filter(b => b.active !== false) });
});

app.get('/api/admin/banners', (req, res) => {
  res.json({ success: true, data: dbBanners });
});

app.post('/api/admin/banners', (req, res) => {
  const newBanners = req.body;
  if (!Array.isArray(newBanners)) {
    return res.status(400).json({ success: false, message: 'Dữ liệu banners phải là một danh sách mảng (Array).' });
  }
  dbBanners = newBanners;
  writeDbFile('banners.json', dbBanners);
  console.log(`💾 Đã lưu vĩnh viễn ${dbBanners.length} banners vào Database!`);
  res.json({ success: true, message: 'Đã lưu vĩnh viễn danh sách banners thành công!' });
});

// 3. API Trạm bảo hành (Đồng bộ vĩnh viễn)
app.get('/api/admin/stations', (req, res) => {
  res.json({ success: true, data: dbStations });
});

app.post('/api/admin/stations', (req, res) => {
  const newStations = req.body;
  if (!Array.isArray(newStations)) {
    return res.status(400).json({ success: false, message: 'Dữ liệu trạm bảo hành phải là một mảng.' });
  }
  dbStations = newStations;
  writeDbFile('stations.json', dbStations);
  res.json({ success: true, message: 'Đã lưu danh sách trạm bảo hành!' });
});

// API Đăng nhập quản trị viên
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin@tnpcare.vn';
  const adminPass = process.env.ADMIN_PASS || 'tnpcare@2026';

  if (
    (username === adminUser || username === 'admin') &&
    (password === adminPass || password === 'admin')
  ) {
    return res.json({
      success: true,
      token: 'tnp_jwt_' + Buffer.from(`${username}:${Date.now()}`).toString('base64'),
      user: {
        name: 'Quản Trị Viên TNP',
        email: 'admin@tnpcare.vn',
        role: 'Super Admin'
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Tài khoản hoặc mật khẩu quản trị không chính xác!'
  });
});

// API Lấy danh sách liên hệ cho Admin
app.get('/api/admin/contacts', (req, res) => {
  res.json({ success: true, data: dbContacts });
});

// API Cập nhật trạng thái liên hệ (chờ liên hệ -> đang tư vấn -> hoàn tất -> hủy)
app.put('/api/admin/contacts/:id', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const lead = dbContacts.find(c => c.id === id);
  if (!lead) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu tư vấn này.' });
  }
  if (status) lead.status = status;
  if (notes !== undefined) lead.notes = notes;
  writeDbFile('contacts.json', dbContacts);
  res.json({ success: true, data: lead, message: 'Đã cập nhật trạng thái liên hệ!' });
});

// API Xóa yêu cầu liên hệ
app.delete('/api/admin/contacts/:id', (req, res) => {
  const { id } = req.params;
  const idx = dbContacts.findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu tư vấn này.' });
  }
  dbContacts.splice(idx, 1);
  writeDbFile('contacts.json', dbContacts);
  res.json({ success: true, message: 'Đã xóa yêu cầu tư vấn thành công.' });
});

// Handle form submissions (contact / consultation)
app.post('/api/contact', (req, res) => {
  const { name, phone, product, message } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ họ tên và số điện thoại.' });
  }
  
  const newLead = {
    id: 'lead-' + Date.now(),
    name,
    phone,
    product: product || 'Tư vấn chung',
    message: message || '',
    time: new Date().toLocaleString('vi-VN'),
    status: 'pending',
    notes: ''
  };

  dbContacts.unshift(newLead);
  writeDbFile('contacts.json', dbContacts);
  console.log('📩 Yêu cầu tư vấn mới:', newLead);
  res.json({ success: true, message: 'Cảm ơn bạn! TNP sẽ liên hệ trong thời gian sớm nhất.' });
});

// ══════════════════════════════════════════════
//  PHẦN 3: API UPLOAD MEDIA & BÀI VIẾT (ARTICLES)
// ══════════════════════════════════════════════
const articlesList = [
  {
    id: 'art-1',
    title: 'Khoảng Cách Xem Tivi Chuẩn Khoa Học Bảo Vệ Mắt Cho Gia Đình',
    category: 'support',
    categoryLabel: 'Hướng dẫn & Hỗ trợ',
    author: 'Chuyên gia Kỹ thuật TNP',
    date: '04/09/2026',
    thumbnail: './images/banner_tnp_care.jpg',
    summary: 'Bảng tra cứu kích thước màn hình TV 32 - 100 inch và khoảng cách ngồi xem tối ưu giúp bảo vệ thị lực và trải nghiệm điện ảnh chân thực.',
    content: 'Việc lựa chọn khoảng cách xem TV phù hợp không chỉ mang lại trải nghiệm hình ảnh tốt nhất mà còn bảo vệ mắt cho cả gia đình...',
    status: 'published'
  },
  {
    id: 'art-2',
    title: 'Công Nghệ QLED & Mini LED Trên Smart TV HXY - Đỉnh Cao Điện Ảnh',
    category: 'tech',
    categoryLabel: 'Công nghệ & Đổi mới',
    author: 'Ban Công Nghệ TNP',
    date: '03/09/2026',
    thumbnail: './images/banner_hxy_100.jpg',
    summary: 'Khám phá sự khác biệt vượt bậc của 1000+ vùng làm mờ cục bộ (Local Dimming) và độ sáng 1200 nit trên dòng Flagship Cinema.',
    content: 'Tấm nền QLED kết hợp hạt lượng tử ánh sáng mang lại phổ màu đạt 98% chuẩn rạp chiếu phim DCI-P3...',
    status: 'published'
  }
];

// 1. API Tải ảnh lên máy chủ (Upload Base64 image)
app.post('/api/admin/upload', (req, res) => {
  const { filename, dataUrl } = req.body;
  if (!dataUrl) {
    return res.status(400).json({ success: false, message: 'Không có dữ liệu ảnh tải lên.' });
  }

  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Định dạng dữ liệu ảnh không hợp lệ.' });
    }

    const ext = matches[1].split('/')[1] || 'jpg';
    const cleanExt = ext === 'jpeg' ? 'jpg' : ext;
    const cleanName = (filename ? filename.replace(/[^a-zA-Z0-9_\-\.]/g, '') : 'img')
      .replace(/\.[^/.]+$/, '');
    const generatedFilename = `${Date.now()}_${cleanName}.${cleanExt}`;

    const uploadDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    const targetPath = path.join(uploadDir, generatedFilename);
    fs.writeFileSync(targetPath, buffer);

    // Đồng bộ sang thư mục gốc uploads/ nếu có
    const rootUploadDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(rootUploadDir)) {
      fs.writeFileSync(path.join(rootUploadDir, generatedFilename), buffer);
    }

    const publicUrl = `./uploads/${generatedFilename}`;
    console.log('📸 Tải ảnh thành công:', publicUrl);

    res.json({
      success: true,
      url: publicUrl,
      filename: generatedFilename,
      message: 'Tải ảnh lên thành công!'
    });
  } catch (err) {
    console.error('❌ Lỗi upload ảnh:', err);
    res.status(500).json({ success: false, message: 'Lỗi trong quá trình lưu file ảnh.' });
  }
});

// 2. API Quản lý Bài viết / Tin tức
app.get('/api/admin/articles', (req, res) => {
  res.json({ success: true, data: articlesList });
});

app.post('/api/admin/articles', (req, res) => {
  const { id, title, category, categoryLabel, thumbnail, summary, content, status } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề bài viết.' });
  }

  const existingIdx = articlesList.findIndex(a => a.id === id);
  const articleObj = {
    id: id || 'art-' + Date.now(),
    title,
    category: category || 'news',
    categoryLabel: categoryLabel || 'Tin tức',
    author: 'Admin TNP',
    date: new Date().toLocaleDateString('vi-VN'),
    thumbnail: thumbnail || './images/banner_tnp_care.jpg',
    summary: summary || '',
    content: content || '',
    status: status || 'published'
  };

  if (existingIdx >= 0) {
    articlesList[existingIdx] = { ...articlesList[existingIdx], ...articleObj };
  } else {
    articlesList.unshift(articleObj);
  }

  res.json({ success: true, data: articleObj, message: 'Đã lưu bài viết thành công!' });
});

app.delete('/api/admin/articles/:id', (req, res) => {
  const { id } = req.params;
  const idx = articlesList.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });
  }
  articlesList.splice(idx, 1);
  res.json({ success: true, message: 'Đã xóa bài viết thành công.' });
});

// Fallback: serve index.html for any unmatched routes (SPA support)
app.get('*', (req, res) => {
  // If request is under /admin, serve /public/admin/index.html
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server with automatic port fallback if port is in use
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════╗');
    console.log('  ║      TRÚC NGUYÊN PHÁT – TNP CARE         ║');
    console.log('  ╠══════════════════════════════════════════╣');
    console.log(`  ║  🌐 Tên miền:    ${DOMAIN.padEnd(23)} ║`);
    console.log(`  ║  🟢 Cục bộ:      http://localhost:${String(port).padEnd(9)} ║`);
    console.log(`  ║  🚀 Trực tuyến:  ${BASE_URL.padEnd(23)} ║`);
    console.log('  ║                                          ║');
    console.log('  ║  Nhấn Ctrl+C để dừng server              ║');
    console.log('  ╚══════════════════════════════════════════╝');
    console.log('');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Cổng ${port} đang bận. Tự động chuyển sang cổng ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Lỗi khởi động server:', err);
    }
  });
};

startServer(PORT);

module.exports = app;
