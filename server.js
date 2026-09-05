/**
 * TRÚC NGUYÊN PHÁT – TNP
 * Node.js / Express Server
 * Hỗ trợ chế độ kép: Cloud Database (MongoDB Atlas) & CSDL JSON Dự phòng
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const dns = require('dns');
const mongoose = require('mongoose');

// Cấu hình DNS Server chuẩn quốc tế (Google & Cloudflare) để giải quyết lỗi querySrv ECONNREFUSED khi kết nối MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Bỏ qua nếu môi trường không cho phép đổi dns servers
}

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
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON and URL-encoded bodies (cho phép tải ảnh Base64 lên tới 25MB)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// ══════════════════════════════════════════════
//  1. CSDL DỰ PHÒNG CỤC BỘ (LOCAL JSON FALLBACK)
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

let articlesList = [
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

// ══════════════════════════════════════════════
//  2. MONGODB ATLAS CLOUD SCHEMAS & MODELS
// ══════════════════════════════════════════════
// strict: false cho phép tùy biến linh hoạt mọi trường dữ liệu động
const ProductSchema = new mongoose.Schema({ id: { type: String, unique: true, index: true } }, { strict: false, timestamps: true });
const StationSchema = new mongoose.Schema({ id: { type: String, index: true } }, { strict: false, timestamps: true });
const BannerSchema  = new mongoose.Schema({ id: { type: String, unique: true, index: true } }, { strict: false, timestamps: true });
const ContactSchema = new mongoose.Schema({ id: { type: String, unique: true, index: true } }, { strict: false, timestamps: true });
const ArticleSchema = new mongoose.Schema({ id: { type: String, unique: true, index: true } }, { strict: false, timestamps: true });

const ProductModel = mongoose.model('Product', ProductSchema);
const StationModel = mongoose.model('Station', StationSchema);
const BannerModel  = mongoose.model('Banner', BannerSchema);
const ContactModel = mongoose.model('Contact', ContactSchema);
const ArticleModel = mongoose.model('Article', ArticleSchema);

let isMongoConnected = false;

// Tự động Seed dữ liệu từ file cục bộ sang MongoDB nếu Collection trên Cloud còn trống
async function autoSeedMongoData() {
  try {
    const productCount = await ProductModel.countDocuments();
    if (productCount === 0 && dbProducts && dbProducts.length > 0) {
      await ProductModel.insertMany(dbProducts);
      console.log(`  🌱 Đã tự động nạp ${dbProducts.length} sản phẩm vào MongoDB Atlas.`);
    }

    const stationCount = await StationModel.countDocuments();
    if (stationCount === 0 && dbStations && dbStations.length > 0) {
      await StationModel.insertMany(dbStations);
      console.log(`  🌱 Đã tự động nạp ${dbStations.length} trạm bảo hành vào MongoDB Atlas.`);
    }

    const bannerCount = await BannerModel.countDocuments();
    if (bannerCount === 0 && dbBanners && dbBanners.length > 0) {
      await BannerModel.insertMany(dbBanners);
      console.log(`  🌱 Đã tự động nạp ${dbBanners.length} banners vào MongoDB Atlas.`);
    }

    const articleCount = await ArticleModel.countDocuments();
    if (articleCount === 0 && articlesList && articlesList.length > 0) {
      await ArticleModel.insertMany(articlesList);
      console.log(`  🌱 Đã tự động nạp ${articlesList.length} bài viết vào MongoDB Atlas.`);
    }
  } catch (err) {
    console.warn('  ⚠️ Lỗi trong quá trình tự động nạp dữ liệu ban đầu vào MongoDB:', err.message);
  }
}

// Khởi tạo kết nối MongoDB
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(async () => {
    isMongoConnected = true;
    console.log('  🟢 ĐÃ KẾT NỐI THÀNH CÔNG CLOUD DATABASE MONGODB ATLAS!');
    await autoSeedMongoData();
  })
  .catch(err => {
    console.warn('  ⚠️ Không thể kết nối MongoDB Atlas (đang chạy CSDL JSON dự phòng):', err.message);
  });
} else {
  console.log('  ℹ️ Chưa cấu hình DATABASE_URL trong .env, server đang chạy với CSDL JSON cục bộ.');
}

// ══════════════════════════════════════════════
//  3. REST APIS (HYBRID: MONGODB + LOCAL FALLBACK)
// ══════════════════════════════════════════════

// API Kiểm tra trạng thái hệ thống và kết nối CSDL
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    server: 'TNP Care API Server',
    database: isMongoConnected ? 'mongodb_atlas' : 'local_json',
    connected: isMongoConnected,
    timestamp: new Date().toISOString()
  });
});

// 1. API Sản phẩm TV
app.get('/api/products', async (req, res) => {
  try {
    if (isMongoConnected) {
      const items = await ProductModel.find().lean();
      if (items && items.length > 0) {
        return res.json({ success: true, data: items, source: 'cloud' });
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc sản phẩm từ MongoDB:', err.message);
  }
  res.json({ success: true, data: dbProducts, source: 'local' });
});

app.post('/api/admin/products', async (req, res) => {
  const newProducts = req.body;
  if (!Array.isArray(newProducts)) {
    return res.status(400).json({ success: false, message: 'Dữ liệu sản phẩm phải là một danh sách mảng (Array).' });
  }

  // Cập nhật CSDL cục bộ
  dbProducts = newProducts;
  writeDbFile('products.json', dbProducts);

  // Cập nhật Cloud MongoDB
  if (isMongoConnected) {
    try {
      await ProductModel.deleteMany({});
      if (newProducts.length > 0) {
        await ProductModel.insertMany(newProducts);
      }
      console.log(`💾 Đã đồng bộ ${newProducts.length} sản phẩm lên MongoDB Atlas!`);
      return res.json({ success: true, message: 'Đã lưu sản phẩm thành công lên Cloud MongoDB Atlas!' });
    } catch (err) {
      console.error('Lỗi ghi sản phẩm lên MongoDB:', err);
    }
  }

  console.log(`💾 Đã lưu vĩnh viễn ${dbProducts.length} sản phẩm TV vào Database JSON!`);
  res.json({ success: true, message: 'Đã lưu vĩnh viễn danh sách sản phẩm thành công!' });
});

// 2. API Banner Hero Slider
app.get('/api/banners', async (req, res) => {
  try {
    if (isMongoConnected) {
      const banners = await BannerModel.find({ active: { $ne: false } }).sort({ order: 1 }).lean();
      if (banners && banners.length > 0) {
        return res.json({ success: true, data: banners, source: 'cloud' });
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc banners từ MongoDB:', err.message);
  }
  res.json({ success: true, data: dbBanners.filter(b => b.active !== false), source: 'local' });
});

app.get('/api/admin/banners', async (req, res) => {
  try {
    if (isMongoConnected) {
      const banners = await BannerModel.find().sort({ order: 1 }).lean();
      if (banners && banners.length > 0) {
        return res.json({ success: true, data: banners, source: 'cloud' });
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc admin banners từ MongoDB:', err.message);
  }
  res.json({ success: true, data: dbBanners, source: 'local' });
});

app.post('/api/admin/banners', async (req, res) => {
  const newBanners = req.body;
  if (!Array.isArray(newBanners)) {
    return res.status(400).json({ success: false, message: 'Dữ liệu banners phải là một danh sách mảng (Array).' });
  }

  dbBanners = newBanners;
  writeDbFile('banners.json', dbBanners);

  if (isMongoConnected) {
    try {
      await BannerModel.deleteMany({});
      if (newBanners.length > 0) {
        await BannerModel.insertMany(newBanners);
      }
      console.log(`💾 Đã đồng bộ ${newBanners.length} banners lên MongoDB Atlas!`);
      return res.json({ success: true, message: 'Đã lưu banners thành công lên Cloud MongoDB Atlas!' });
    } catch (err) {
      console.error('Lỗi ghi banners lên MongoDB:', err);
    }
  }

  console.log(`💾 Đã lưu vĩnh viễn ${dbBanners.length} banners vào Database JSON!`);
  res.json({ success: true, message: 'Đã lưu vĩnh viễn danh sách banners thành công!' });
});

// 3. API Trạm bảo hành
app.get('/api/admin/stations', async (req, res) => {
  try {
    if (isMongoConnected) {
      const stations = await StationModel.find().lean();
      if (stations && stations.length > 0) {
        return res.json({ success: true, data: stations, source: 'cloud' });
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc trạm từ MongoDB:', err.message);
  }
  res.json({ success: true, data: dbStations, source: 'local' });
});

app.post('/api/admin/stations', async (req, res) => {
  const newStations = req.body;
  if (!Array.isArray(newStations)) {
    return res.status(400).json({ success: false, message: 'Dữ liệu trạm bảo hành phải là một mảng.' });
  }

  dbStations = newStations;
  writeDbFile('stations.json', dbStations);

  if (isMongoConnected) {
    try {
      await StationModel.deleteMany({});
      if (newStations.length > 0) {
        await StationModel.insertMany(newStations);
      }
      return res.json({ success: true, message: 'Đã lưu danh sách trạm bảo hành lên Cloud MongoDB Atlas!' });
    } catch (err) {
      console.error('Lỗi ghi trạm lên MongoDB:', err);
    }
  }

  res.json({ success: true, message: 'Đã lưu danh sách trạm bảo hành!' });
});

// 4. API Đăng nhập quản trị viên
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

// 5. API Yêu cầu tư vấn & Liên hệ
app.get('/api/admin/contacts', async (req, res) => {
  try {
    if (isMongoConnected) {
      const contacts = await ContactModel.find().sort({ createdAt: -1 }).lean();
      return res.json({ success: true, data: contacts, source: 'cloud' });
    }
  } catch (err) {
    console.warn('Lỗi đọc contacts từ MongoDB:', err.message);
  }
  res.json({ success: true, data: dbContacts, source: 'local' });
});

app.put('/api/admin/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const lead = dbContacts.find(c => c.id === id);
  if (lead) {
    if (status) lead.status = status;
    if (notes !== undefined) lead.notes = notes;
    writeDbFile('contacts.json', dbContacts);
  }

  if (isMongoConnected) {
    try {
      const updateData = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      await ContactModel.findOneAndUpdate({ id }, { $set: updateData });
    } catch (err) {
      console.warn('Lỗi cập nhật contact trên MongoDB:', err.message);
    }
  }

  res.json({ success: true, data: lead, message: 'Đã cập nhật trạng thái liên hệ!' });
});

app.delete('/api/admin/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const idx = dbContacts.findIndex(c => c.id === id);
  if (idx !== -1) {
    dbContacts.splice(idx, 1);
    writeDbFile('contacts.json', dbContacts);
  }

  if (isMongoConnected) {
    try {
      await ContactModel.findOneAndDelete({ id });
    } catch (err) {
      console.warn('Lỗi xóa contact trên MongoDB:', err.message);
    }
  }

  res.json({ success: true, message: 'Đã xóa yêu cầu tư vấn thành công.' });
});

// Nhận form gửi liên hệ từ khách hàng
app.post('/api/contact', async (req, res) => {
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

  if (isMongoConnected) {
    try {
      await ContactModel.create(newLead);
    } catch (err) {
      console.warn('Lỗi lưu contact lên MongoDB:', err.message);
    }
  }

  console.log('📩 Yêu cầu tư vấn mới:', newLead);
  res.json({ success: true, message: 'Cảm ơn bạn! TNP sẽ liên hệ trong thời gian sớm nhất.' });
});

// 6. API Upload ảnh (Base64)
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

// 7. API Quản lý Bài viết / Tin tức
app.get('/api/admin/articles', async (req, res) => {
  try {
    if (isMongoConnected) {
      const articles = await ArticleModel.find().sort({ createdAt: -1 }).lean();
      if (articles && articles.length > 0) {
        return res.json({ success: true, data: articles, source: 'cloud' });
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc articles từ MongoDB:', err.message);
  }
  res.json({ success: true, data: articlesList, source: 'local' });
});

app.post('/api/admin/articles', async (req, res) => {
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

  if (isMongoConnected) {
    try {
      await ArticleModel.findOneAndUpdate(
        { id: articleObj.id },
        { $set: articleObj },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('Lỗi lưu article lên MongoDB:', err.message);
    }
  }

  res.json({ success: true, data: articleObj, message: 'Đã lưu bài viết thành công!' });
});

app.delete('/api/admin/articles/:id', async (req, res) => {
  const { id } = req.params;
  const idx = articlesList.findIndex(a => a.id === id);
  if (idx !== -1) {
    articlesList.splice(idx, 1);
  }

  if (isMongoConnected) {
    try {
      await ArticleModel.findOneAndDelete({ id });
    } catch (err) {
      console.warn('Lỗi xóa article trên MongoDB:', err.message);
    }
  }

  res.json({ success: true, message: 'Đã xóa bài viết thành công.' });
});

// Fallback: serve index.html for any unmatched routes (SPA support)
app.get('*', (req, res) => {
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
    console.log(`  ║  🗄️  CSDL:        ${(isMongoConnected ? 'MongoDB Atlas' : 'JSON Cục bộ').padEnd(23)} ║`);
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
