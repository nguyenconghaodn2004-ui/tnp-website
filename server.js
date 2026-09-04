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

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve product data as API endpoint
app.get('/api/products', (req, res) => {
  try {
    const { products } = require('./data/products');
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Không thể tải dữ liệu sản phẩm.' });
  }
});

// Handle form submissions (contact / consultation)
app.post('/api/contact', (req, res) => {
  const { name, phone, product, message } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ họ tên và số điện thoại.' });
  }
  // In production: save to database or send email
  console.log('📩 Yêu cầu tư vấn mới:', { name, phone, product, message, time: new Date().toLocaleString('vi-VN') });
  res.json({ success: true, message: 'Cảm ơn bạn! TNP sẽ liên hệ trong thời gian sớm nhất.' });
});

// Fallback: serve index.html for any unmatched routes (SPA support)
app.get('*', (req, res) => {
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
