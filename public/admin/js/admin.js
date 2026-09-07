/**
 * TRÚC NGUYÊN PHÁT – TNP CARE
 * Admin Dashboard Logic – admin.js
 */

'use strict';

// ══════════════════════════════════════════════
//  STATE MANAGEMENT
// ══════════════════════════════════════════════
let currentTab = 'dashboard';
let productsList = [];
let serviceCentersList = [];
let bannersList = [];
let contactsList = [];
let articlesList = [];
let homepageConfig = null;

// Storage keys
const STORAGE_PRODUCTS_KEY = 'tnp_admin_products_override';
const STORAGE_STATIONS_KEY = 'tnp_admin_stations_override';
const STORAGE_BANNERS_KEY = 'tnp_admin_banners_override';
const STORAGE_ARTICLES_KEY = 'tnp_admin_articles_override';
const STORAGE_HOMEPAGE_KEY = 'tnp_admin_homepage_override';

// ══════════════════════════════════════════════
//  AUTH GUARD
// ══════════════════════════════════════════════
function checkAdminAuth() {
  const authData = localStorage.getItem('tnp_admin_auth');
  if (!authData) {
    window.location.href = './login.html';
    return false;
  }
  try {
    const auth = JSON.parse(authData);
    if (!auth || !auth.token) {
      window.location.href = './login.html';
      return false;
    }
    // Update user display in sidebar
    if (auth.user) {
      const nameEl = document.getElementById('sidebarUserName');
      const roleEl = document.getElementById('sidebarUserRole');
      const avatarEl = document.getElementById('sidebarUserAvatar');
      if (nameEl) nameEl.textContent = auth.user.name || 'Quản Trị Viên';
      if (roleEl) roleEl.textContent = auth.user.email || 'admin@tnpcare.vn';
      if (avatarEl && auth.user.name) {
        avatarEl.textContent = auth.user.name.substring(0, 2).toUpperCase();
      }
    }
    return true;
  } catch (e) {
    window.location.href = './login.html';
    return false;
  }
}

function handleAdminLogout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?')) {
    localStorage.removeItem('tnp_admin_auth');
    window.location.href = './login.html';
  }
}

// ══════════════════════════════════════════════
//  INITIALIZATION
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  if (!checkAdminAuth()) return;
  initNavigation();
  initSidebarMobile();
  loadData();
  renderAll();
  fetchContactsFromServer();
});

// ── Navigation tabs ──
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const pageTitle = document.getElementById('pageTitle');
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');
      switchTab(targetTab);

      // Close mobile sidebar if open
      document.querySelector('.admin-sidebar').classList.remove('open');
    });
  });

  // CMS Subtabs navigation
  const cmsSubtabBtns = document.querySelectorAll('.cms-subtab-btn[data-subtab]');
  cmsSubtabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSubtab = btn.getAttribute('data-subtab');
      cmsSubtabBtns.forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.cms-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `cms-panel-${targetSubtab}`);
      });
    });
  });
}

function switchTab(tabId) {
  currentTab = tabId;

  // Update active nav item
  document.querySelectorAll('.nav-item[data-tab]').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-tab') === tabId);
  });

  // Update active panel
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabId}`);
  });

  // Update title & breadcrumb
  const titles = {
    dashboard: 'Tổng quan hệ thống',
    homepage: 'Quản lý Toàn Bộ Bố Cục & Nội Dung Trang Chủ',
    products: 'Quản lý Sản phẩm TV',
    stations: 'Quản lý Trạm bảo hành',
    banners: 'Quản lý Banner & Hero Slide',
    articles: 'Quản lý Bài viết & Hướng dẫn kỹ thuật',
    contacts: 'Yêu cầu tư vấn & Liên hệ',
    settings: 'Cài đặt hệ thống'
  };

  const titleText = titles[tabId] || 'Quản trị';
  document.getElementById('pageTitle').textContent = titleText;
  document.getElementById('breadcrumbCurrent').textContent = titleText;
}

// ── Mobile Sidebar Toggle ──
function initSidebarMobile() {
  const toggleBtn = document.getElementById('btnToggleSidebar');
  const sidebar = document.querySelector('.admin-sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

// ── Data Loading & Merging ──
function loadData() {
  // Load products (prioritize localStorage, then global window variable from public/data/products.js)
  const savedProducts = localStorage.getItem(STORAGE_PRODUCTS_KEY);
  if (savedProducts) {
    try {
      productsList = JSON.parse(savedProducts);
    } catch (e) {
      productsList = typeof products !== 'undefined' ? [...products] : [];
    }
  } else if (typeof products !== 'undefined') {
    productsList = [...products];
  } else if (typeof TNP_PRODUCTS !== 'undefined') {
    productsList = [...TNP_PRODUCTS];
  }

  // Load service centers (prioritize localStorage, then global window variable from service_centers.js)
  const savedStations = localStorage.getItem(STORAGE_STATIONS_KEY);
  if (savedStations) {
    try {
      serviceCentersList = JSON.parse(savedStations);
    } catch (e) {
      serviceCentersList = typeof TNP_SERVICE_CENTERS !== 'undefined' ? [...TNP_SERVICE_CENTERS] : [];
    }
  } else if (typeof TNP_SERVICE_CENTERS !== 'undefined') {
    serviceCentersList = [...TNP_SERVICE_CENTERS];
  }

  // Load banners
  const savedBanners = localStorage.getItem(STORAGE_BANNERS_KEY);
  if (savedBanners) {
    try {
      bannersList = JSON.parse(savedBanners);
    } catch (e) {
      bannersList = getDefaultBanners();
    }
  } else {
    bannersList = getDefaultBanners();
  }

  // Load articles
  const savedArticles = localStorage.getItem(STORAGE_ARTICLES_KEY);
  if (savedArticles) {
    try {
      articlesList = JSON.parse(savedArticles);
    } catch (e) {
      articlesList = getDefaultArticles();
    }
    articlesList = getDefaultArticles();
  }

  // Load homepage config
  const savedHomepage = localStorage.getItem(STORAGE_HOMEPAGE_KEY);
  if (savedHomepage) {
    try {
      homepageConfig = JSON.parse(savedHomepage);
    } catch (e) {
      homepageConfig = getDefaultHomepageConfig();
    }
  } else {
    homepageConfig = getDefaultHomepageConfig();
  }

  // Tự động đồng bộ thêm từ server nếu có
  fetchHomepageFromServer();
}

function getDefaultBanners() {
  return [
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
}

function getDefaultArticles() {
  return [
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
}

async function saveProducts() {
  localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(productsList));
  try {
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productsList)
    });
  } catch (e) {}
  showToast('Đã lưu dữ liệu sản phẩm vĩnh viễn!', 'success');
  renderAll();
}

async function saveStations() {
  localStorage.setItem(STORAGE_STATIONS_KEY, JSON.stringify(serviceCentersList));
  try {
    await fetch('/api/admin/stations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceCentersList)
    });
  } catch (e) {}
  showToast('Đã lưu danh sách trạm bảo hành vĩnh viễn!', 'success');
  renderAll();
}

async function saveBanners() {
  localStorage.setItem(STORAGE_BANNERS_KEY, JSON.stringify(bannersList));
  try {
    await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bannersList)
    });
  } catch (e) {}
  showToast('Đã lưu danh sách Banner Hero vĩnh viễn!', 'success');
  renderAll();
}

function saveArticles() {
  localStorage.setItem(STORAGE_ARTICLES_KEY, JSON.stringify(articlesList));
  showToast('Đã lưu danh sách bài viết thành công!', 'success');
  renderAll();
}

// ══════════════════════════════════════════════
//  RENDER FUNCTIONS
// ══════════════════════════════════════════════
function renderAll() {
  renderStats();
  renderRecentProducts();
  renderProductsTable();
  renderStationsTable();
  renderBannersTable();
  renderArticlesTable();
  renderHomepageCMS();
}

// ── Stats ──
function renderStats() {
  const hxyCount = productsList.filter(p => p.brand === 'HXY').length;
  const hikersCount = productsList.filter(p => p.brand === 'HIKERS').length;

  document.getElementById('statTotalProducts').textContent = productsList.length;
  document.getElementById('statTotalStations').textContent = serviceCentersList.length;
  document.getElementById('statBrandRatio').textContent = `${hxyCount} / ${hikersCount}`;
  
  // Badges in sidebar
  const badgeProd = document.getElementById('badgeProductsCount');
  const badgeStat = document.getElementById('badgeStationsCount');
  if (badgeProd) badgeProd.textContent = productsList.length;
  if (badgeStat) badgeStat.textContent = serviceCentersList.length;
}

// ── Recent products on dashboard ──
function renderRecentProducts() {
  const tbody = document.getElementById('dashboardProductsBody');
  if (!tbody) return;

  const recents = productsList.slice(0, 5);
  tbody.innerHTML = recents.map((p, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>
        <img src="${p.thumbnail || '../images/products/placeholder.svg'}" 
             alt="${p.name}" 
             class="table-product-thumb"
             onerror="this.src='../images/products/placeholder.svg'">
      </td>
      <td>
        <strong>${p.name}</strong><br>
        <small class="text-muted">${p.model} · ${p.sizeLabel || p.size + ' inch'}</small>
      </td>
      <td>
        <span class="badge ${p.brand === 'HXY' ? 'badge-brand-hxy' : 'badge-brand-hikers'}">
          ${p.brand}
        </span>
      </td>
      <td>${p.panel || 'LED'}</td>
      <td><span class="badge badge-success">Đang phân phối</span></td>
    </tr>
  `).join('');
}

// ── Products Table ──
function renderProductsTable(filterQuery = '') {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  let filtered = productsList;
  if (filterQuery) {
    const q = filterQuery.toLowerCase();
    filtered = filtered.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.model && p.model.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: var(--adm-text-muted);">Không tìm thấy sản phẩm nào phù hợp.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((p, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>
        <img src="${p.thumbnail || '../images/products/placeholder.svg'}" 
             alt="${p.name}" 
             class="table-product-thumb"
             onerror="this.src='../images/products/placeholder.svg'">
      </td>
      <td>
        <strong>${p.name}</strong><br>
        <small style="color: #64748b;">Mã: ${p.model} | Độ phân giải: ${p.resolution || '4K'}</small>
      </td>
      <td>
        <span class="badge ${p.brand === 'HXY' ? 'badge-brand-hxy' : 'badge-brand-hikers'}">
          ${p.brand}
        </span>
      </td>
      <td>${p.sizeLabel || p.size + ' inch'}</td>
      <td>${p.warranty || '24 tháng'}</td>
      <td>
        <div class="action-btn-group">
          <button class="btn-icon" title="Chỉnh sửa" onclick="openEditProductModal('${p.id}')">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn-icon btn-icon-delete" title="Xóa" onclick="deleteProduct('${p.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Stations Table ──
function renderStationsTable(filterQuery = '') {
  const tbody = document.getElementById('stationsTableBody');
  if (!tbody) return;

  let filtered = serviceCentersList;
  if (filterQuery) {
    const q = filterQuery.toLowerCase();
    filtered = filtered.filter(s => 
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.province && s.province.toLowerCase().includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color: var(--adm-text-muted);">Không tìm thấy trạm bảo hành nào.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.slice(0, 100).map((s, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${s.name}</strong></td>
      <td><span class="badge badge-secondary">${s.province}</span></td>
      <td><small>${s.address}</small></td>
      <td><a href="tel:${s.phone || '028 22 422 822'}" style="color: var(--adm-accent); text-decoration: none; font-weight: 600;">${s.phone || '028 22 422 822'}</a></td>
      <td>
        <div class="action-btn-group">
          <button class="btn-icon btn-icon-delete" title="Xóa trạm" onclick="deleteStation('${s.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ══════════════════════════════════════════════
//  MODAL & ACTIONS: PRODUCTS
// ══════════════════════════════════════════════
function openAddProductModal() {
  document.getElementById('productModalTitle').textContent = 'Thêm sản phẩm TV mới';
  document.getElementById('prodId').value = 'prod-' + Date.now();
  document.getElementById('prodName').value = '';
  document.getElementById('prodBrand').value = 'HXY';
  document.getElementById('prodModel').value = '';
  document.getElementById('prodSize').value = '55';
  document.getElementById('prodResolution').value = '4K UHD';
  document.getElementById('prodPanel').value = 'QLED';
  document.getElementById('prodThumb').value = '';
  document.getElementById('prodDesc').value = '';

  document.getElementById('productModal').classList.add('open');
}

function openEditProductModal(id) {
  const p = productsList.find(item => item.id === id);
  if (!p) return;

  document.getElementById('productModalTitle').textContent = 'Chỉnh sửa sản phẩm TV';
  document.getElementById('prodId').value = p.id;
  document.getElementById('prodName').value = p.name || '';
  document.getElementById('prodBrand').value = p.brand || 'HXY';
  document.getElementById('prodModel').value = p.model || '';
  document.getElementById('prodSize').value = p.size || 55;
  document.getElementById('prodResolution').value = p.resolution || '4K UHD';
  document.getElementById('prodPanel').value = p.panel || 'LED';
  document.getElementById('prodThumb').value = p.thumbnail || '';
  document.getElementById('prodDesc').value = (p.features && p.features.join('\n')) || '';

  document.getElementById('productModal').classList.add('open');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
}

function saveProductForm(e) {
  e.preventDefault();
  const id = document.getElementById('prodId').value;
  const name = document.getElementById('prodName').value.trim();
  const brand = document.getElementById('prodBrand').value;
  const model = document.getElementById('prodModel').value.trim();
  const size = parseInt(document.getElementById('prodSize').value) || 55;
  const resolution = document.getElementById('prodResolution').value;
  const panel = document.getElementById('prodPanel').value;
  const thumb = document.getElementById('prodThumb').value.trim();
  const desc = document.getElementById('prodDesc').value.trim();

  if (!name || !model) {
    alert('Vui lòng nhập tên sản phẩm và model.');
    return;
  }

  const existingIdx = productsList.findIndex(p => p.id === id);
  const newProductObj = {
    id,
    brand,
    model,
    name,
    size,
    sizeLabel: `${size} inch`,
    resolution,
    panel,
    thumbnail: thumb || '../images/products/placeholder.svg',
    warranty: '24 tháng chính hãng',
    features: desc ? desc.split('\n').filter(Boolean) : ['Độ sắc nét vượt trội', 'Bảo hành chính hãng 24 tháng']
  };

  if (existingIdx >= 0) {
    productsList[existingIdx] = { ...productsList[existingIdx], ...newProductObj };
  } else {
    productsList.unshift(newProductObj);
  }

  closeProductModal();
  saveProducts();
}

function deleteProduct(id) {
  if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách?')) {
    productsList = productsList.filter(p => p.id !== id);
    saveProducts();
  }
}

function deleteStation(id) {
  if (confirm('Bạn có chắc chắn muốn xóa trạm bảo hành này?')) {
    serviceCentersList = serviceCentersList.filter(s => s.id !== id);
    saveStations();
  }
}

// ── Search Handlers ──
function filterProducts(query) {
  renderProductsTable(query);
}

function filterStations(query) {
  renderStationsTable(query);
}

// ── Toast notifications ──
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Banners Table ──
function renderBannersTable() {
  const tbody = document.getElementById('bannersTableBody');
  if (!tbody) return;

  const badgeBanners = document.getElementById('badgeBannersCount');
  if (badgeBanners) badgeBanners.textContent = bannersList.length;

  if (bannersList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: var(--adm-text-muted);">Chưa có banner nào. Nhấn "Thêm Banner Mới" để tạo.</td></tr>`;
    return;
  }

  // Sort by order
  const sorted = [...bannersList].sort((a, b) => (a.order || 99) - (b.order || 99));

  tbody.innerHTML = sorted.map((b, idx) => `
    <tr>
      <td style="font-weight: 700; color: var(--adm-accent);">#${b.order || idx + 1}</td>
      <td>
        <img src="${b.image || '../images/banner_hxy_100.jpg'}" 
             alt="${b.title}" 
             style="width: 120px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid var(--adm-border);"
             onerror="this.src='../images/banner_hxy_100.jpg'">
      </td>
      <td>
        <strong>${b.title}</strong><br>
        <small style="color: #64748b;">${b.desc ? b.desc.substring(0, 60) + '...' : ''}</small>
      </td>
      <td><span class="badge badge-brand-hxy">${b.badge || 'HERO'}</span></td>
      <td><small>${b.link || '#'}</small></td>
      <td>
        <span class="badge ${b.active ? 'badge-success' : 'badge-secondary'}">
          ${b.active ? 'Đang bật' : 'Tạm ẩn'}
        </span>
      </td>
      <td>
        <div class="action-btn-group">
          <button class="btn-icon" title="Chỉnh sửa" onclick="openEditBannerModal('${b.id}')">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn-icon btn-icon-delete" title="Xóa" onclick="deleteBanner('${b.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddBannerModal() {
  document.getElementById('bannerModalTitle').textContent = 'Thêm Banner Hero Mới';
  document.getElementById('bannerId').value = 'banner-' + Date.now();
  document.getElementById('bannerTitle').value = '';
  document.getElementById('bannerBadge').value = 'TV HXY VIỆT NAM';
  document.getElementById('bannerOrder').value = bannersList.length + 1;
  document.getElementById('bannerImage').value = './images/banner_hxy_100.jpg';
  document.getElementById('bannerDesc').value = '';
  document.getElementById('bannerLinkPrimary').value = './tv-hxy.html';
  document.getElementById('bannerActive').value = 'true';

  document.getElementById('bannerModal').classList.add('open');
}

function openEditBannerModal(id) {
  const b = bannersList.find(item => item.id === id);
  if (!b) return;

  document.getElementById('bannerModalTitle').textContent = 'Chỉnh sửa Banner Hero';
  document.getElementById('bannerId').value = b.id;
  document.getElementById('bannerTitle').value = b.title || '';
  document.getElementById('bannerBadge').value = b.badge || '';
  document.getElementById('bannerOrder').value = b.order || 1;
  document.getElementById('bannerImage').value = b.image || '';
  document.getElementById('bannerDesc').value = b.desc || '';
  document.getElementById('bannerLinkPrimary').value = b.link || '';
  document.getElementById('bannerActive').value = b.active !== false ? 'true' : 'false';

  document.getElementById('bannerModal').classList.add('open');
}

function closeBannerModal() {
  document.getElementById('bannerModal').classList.remove('open');
}

function saveBannerForm(e) {
  e.preventDefault();
  const id = document.getElementById('bannerId').value;
  const title = document.getElementById('bannerTitle').value.trim();
  const badge = document.getElementById('bannerBadge').value.trim();
  const order = parseInt(document.getElementById('bannerOrder').value) || 1;
  const image = document.getElementById('bannerImage').value.trim();
  const desc = document.getElementById('bannerDesc').value.trim();
  const link = document.getElementById('bannerLinkPrimary').value.trim();
  const active = document.getElementById('bannerActive').value === 'true';

  if (!title || !image) {
    alert('Vui lòng nhập tiêu đề và link ảnh banner.');
    return;
  }

  const existingIdx = bannersList.findIndex(b => b.id === id);
  const bannerObj = { id, title, badge, order, image, desc, link, active };

  if (existingIdx >= 0) {
    bannersList[existingIdx] = bannerObj;
  } else {
    bannersList.push(bannerObj);
  }

  closeBannerModal();
  saveBanners();
}

function deleteBanner(id) {
  if (confirm('Bạn có chắc chắn muốn xóa Banner này?')) {
    bannersList = bannersList.filter(b => b.id !== id);
    saveBanners();
  }
}

// ══════════════════════════════════════════════
//  CONTACTS & LEADS MANAGEMENT
// ══════════════════════════════════════════════
async function fetchContactsFromServer() {
  const tbody = document.getElementById('contactsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/contacts');
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        contactsList = json.data;
        renderContactsTable(contactsList);
        return;
      }
    }
  } catch (e) {
    console.warn('Không thể tải contacts từ server, hiển thị dữ liệu hiện thời...');
  }

  // Sample lead nếu trống hoàn toàn
  if (contactsList.length === 0) {
    contactsList = [
      {
        id: 'lead-sample-1',
        name: 'Nguyễn Văn Hùng',
        phone: '0908 123 456',
        product: 'Smart TV HXY 100 Inch Cinema',
        message: 'Tôi muốn tư vấn kích thước lắp phòng khách 40m2 và dịch vụ giao hàng tại TP.HCM',
        time: new Date().toLocaleString('vi-VN'),
        status: 'pending',
        notes: ''
      }
    ];
  }

  renderContactsTable(contactsList);
}

function filterContacts(query) {
  if (!query) {
    renderContactsTable(contactsList);
    return;
  }
  const q = query.toLowerCase();
  const filtered = contactsList.filter(c => 
    (c.name && c.name.toLowerCase().includes(q)) ||
    (c.phone && c.phone.includes(q)) ||
    (c.product && c.product.toLowerCase().includes(q))
  );
  renderContactsTable(filtered);
}

function renderContactsTable(leads) {
  const tbody = document.getElementById('contactsTableBody');
  if (!tbody) return;

  const badgeContacts = document.getElementById('badgeContactsCount');
  const pendingCount = leads.filter(l => l.status === 'pending').length;
  if (badgeContacts) badgeContacts.textContent = pendingCount;

  if (leads.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--adm-text-muted);">
          <i class="fas fa-inbox" style="font-size: 32px; display: block; margin-bottom: 8px;"></i>
          Không tìm thấy yêu cầu liên hệ nào.
        </td>
      </tr>
    `;
    return;
  }

  const statusMap = {
    pending: { label: 'Chờ liên hệ', class: 'badge-warning' },
    in_progress: { label: 'Đang tư vấn', class: 'badge-brand-hxy' },
    completed: { label: 'Đã hoàn tất', class: 'badge-success' },
    cancelled: { label: 'Đã hủy', class: 'badge-secondary' }
  };

  tbody.innerHTML = leads.map((item, idx) => {
    const st = statusMap[item.status] || statusMap.pending;
    return `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${item.name || 'Khách hàng'}</strong></td>
        <td>
          <a href="tel:${item.phone}" style="color: var(--adm-accent); font-weight: 700; text-decoration: none;">
            <i class="fas fa-phone-alt"></i> ${item.phone}
          </a>
        </td>
        <td><span class="badge badge-brand-hxy">${item.product || 'Tư vấn chung'}</span></td>
        <td>
          <small>${item.message || 'Không có ghi chú'}</small>
          ${item.notes ? `<div style="color: #0284c7; font-size: 11px; margin-top: 2px;"><strong>CSKH:</strong> ${item.notes}</div>` : ''}
        </td>
        <td><small style="color: #64748b;">${item.time || 'Vừa xong'}</small></td>
        <td><span class="badge ${st.class}">${st.label}</span></td>
        <td>
          <div class="action-btn-group">
            <button class="btn btn-secondary btn-sm" onclick="openLeadModal('${item.id}')" title="Cập nhật trạng thái">
              <i class="fas fa-edit"></i> Xử lý
            </button>
            <button class="btn-icon btn-icon-delete" onclick="deleteLead('${item.id}')" title="Xóa yêu cầu">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openLeadModal(id) {
  const lead = contactsList.find(c => c.id === id);
  if (!lead) return;

  document.getElementById('leadId').value = lead.id;
  document.getElementById('leadCustomerName').value = lead.name || '';
  document.getElementById('leadCustomerPhone').value = lead.phone || '';
  document.getElementById('leadStatusSelect').value = lead.status || 'pending';
  document.getElementById('leadNotes').value = lead.notes || '';

  document.getElementById('leadModal').classList.add('open');
}

function closeLeadModal() {
  document.getElementById('leadModal').classList.remove('open');
}

async function saveLeadStatus(e) {
  e.preventDefault();
  const id = document.getElementById('leadId').value;
  const status = document.getElementById('leadStatusSelect').value;
  const notes = document.getElementById('leadNotes').value.trim();

  const lead = contactsList.find(c => c.id === id);
  if (lead) {
    lead.status = status;
    lead.notes = notes;
  }

  try {
    await fetch(`/api/admin/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
  } catch (err) {}

  closeLeadModal();
  renderContactsTable(contactsList);
  showToast('Đã cập nhật trạng thái tư vấn khách hàng!', 'success');
}

async function deleteLead(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa yêu cầu tư vấn này?')) return;

  contactsList = contactsList.filter(c => c.id !== id);

  try {
    await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
  } catch (err) {}

  renderContactsTable(contactsList);
  showToast('Đã xóa yêu cầu tư vấn thành công.', 'info');
}

// ══════════════════════════════════════════════
//  PHẦN 3: BÀI VIẾT (ARTICLES) & TẢI ẢNH (UPLOADS)
// ══════════════════════════════════════════════

// ── Articles Table ──
function renderArticlesTable(filterQuery = '') {
  const tbody = document.getElementById('articlesTableBody');
  if (!tbody) return;

  const badgeArticles = document.getElementById('badgeArticlesCount');
  if (badgeArticles) badgeArticles.textContent = articlesList.length;

  let filtered = articlesList;
  if (filterQuery) {
    const q = filterQuery.toLowerCase();
    filtered = filtered.filter(a => 
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.summary && a.summary.toLowerCase().includes(q)) ||
      (a.categoryLabel && a.categoryLabel.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: var(--adm-text-muted);">Không tìm thấy bài viết nào.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((a, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>
        <img src="${a.thumbnail || '../images/banner_tnp_care.jpg'}" 
             alt="${a.title}" 
             style="width: 70px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid var(--adm-border);"
             onerror="this.src='../images/banner_tnp_care.jpg'">
      </td>
      <td>
        <strong>${a.title}</strong><br>
        <small style="color: #64748b;">${a.summary ? a.summary.substring(0, 50) + '...' : ''}</small>
      </td>
      <td><span class="badge badge-secondary">${a.categoryLabel || a.category}</span></td>
      <td><small>${a.date || 'Hôm nay'}</small></td>
      <td>
        <span class="badge ${a.status === 'published' ? 'badge-success' : 'badge-warning'}">
          ${a.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
        </span>
      </td>
      <td>
        <div class="action-btn-group">
          <button class="btn-icon" title="Chỉnh sửa bài" onclick="openEditArticleModal('${a.id}')">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn-icon btn-icon-delete" title="Xóa bài" onclick="deleteArticle('${a.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterArticles(query) {
  renderArticlesTable(query);
}

function openAddArticleModal() {
  document.getElementById('articleModalTitle').textContent = 'Viết bài mới';
  document.getElementById('artId').value = 'art-' + Date.now();
  document.getElementById('artTitle').value = '';
  document.getElementById('artCategory').value = 'support';
  document.getElementById('artStatus').value = 'published';
  document.getElementById('artThumbnail').value = './images/banner_tnp_care.jpg';
  document.getElementById('artSummary').value = '';
  document.getElementById('artContent').value = '';

  const preview = document.getElementById('artThumbPreview');
  if (preview) preview.style.display = 'none';

  document.getElementById('articleModal').classList.add('open');
}

function openEditArticleModal(id) {
  const a = articlesList.find(item => item.id === id);
  if (!a) return;

  document.getElementById('articleModalTitle').textContent = 'Chỉnh sửa bài viết';
  document.getElementById('artId').value = a.id;
  document.getElementById('artTitle').value = a.title || '';
  document.getElementById('artCategory').value = a.category || 'support';
  document.getElementById('artStatus').value = a.status || 'published';
  document.getElementById('artThumbnail').value = a.thumbnail || '';
  document.getElementById('artSummary').value = a.summary || '';
  document.getElementById('artContent').value = a.content || '';

  const preview = document.getElementById('artThumbPreview');
  if (preview && a.thumbnail) {
    preview.style.display = 'block';
    preview.querySelector('img').src = a.thumbnail;
  }

  document.getElementById('articleModal').classList.add('open');
}

function closeArticleModal() {
  document.getElementById('articleModal').classList.remove('open');
}

async function saveArticleForm(e) {
  e.preventDefault();
  const id = document.getElementById('artId').value;
  const title = document.getElementById('artTitle').value.trim();
  const category = document.getElementById('artCategory').value;
  const categoryLabels = {
    support: 'Hướng dẫn & Hỗ trợ',
    tech: 'Công nghệ & Đổi mới',
    news: 'Tin tức TNP'
  };
  const categoryLabel = categoryLabels[category] || 'Tin tức';
  const status = document.getElementById('artStatus').value;
  const thumbnail = document.getElementById('artThumbnail').value.trim();
  const summary = document.getElementById('artSummary').value.trim();
  const content = document.getElementById('artContent').value.trim();

  if (!title) {
    alert('Vui lòng nhập tiêu đề bài viết.');
    return;
  }

  const existingIdx = articlesList.findIndex(a => a.id === id);
  const articleObj = {
    id,
    title,
    category,
    categoryLabel,
    author: 'Admin TNP',
    date: new Date().toLocaleDateString('vi-VN'),
    thumbnail: thumbnail || './images/banner_tnp_care.jpg',
    summary,
    content,
    status
  };

  if (existingIdx >= 0) {
    articlesList[existingIdx] = articleObj;
  } else {
    articlesList.unshift(articleObj);
  }

  // Gửi API backend nếu server đang chạy
  try {
    await fetch('/api/admin/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleObj)
    });
  } catch (err) {}

  closeArticleModal();
  saveArticles();
}

async function deleteArticle(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

  articlesList = articlesList.filter(a => a.id !== id);

  try {
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
  } catch (err) {}

  saveArticles();
}

// ── HÀM TẢI ẢNH TRỰC TIẾP TỪ MÁY TÍNH LÊN SERVER ──
async function handleDirectImageUpload(event, inputTargetId, previewTargetId) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn một file hình ảnh hợp lệ (jpg, png, webp).');
    return;
  }

  // Giới hạn 15MB
  if (file.size > 15 * 1024 * 1024) {
    alert('Dung lượng ảnh quá lớn! Vui lòng chọn ảnh dưới 15MB.');
    return;
  }

  showToast('Đang tải ảnh lên...', 'info');

  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64Data = e.target.result;

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          dataUrl: base64Data
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.url) {
        document.getElementById(inputTargetId).value = data.url;

        // Cập nhật preview nếu có
        const previewContainer = document.getElementById(previewTargetId);
        if (previewContainer) {
          previewContainer.style.display = 'block';
          const img = previewContainer.querySelector('img');
          if (img) img.src = data.url;
        }

        showToast('Tải ảnh lên máy chủ thành công!', 'success');
      } else {
        throw new Error(data.message || 'Lỗi lưu file');
      }
    } catch (err) {
      // Fallback lưu cục bộ base64 trực tiếp vào ô input nếu server chưa chạy
      document.getElementById(inputTargetId).value = base64Data;
      const previewContainer = document.getElementById(previewTargetId);
      if (previewContainer) {
        previewContainer.style.display = 'block';
        const img = previewContainer.querySelector('img');
        if (img) img.src = base64Data;
      }
      showToast('Đã lưu ảnh cục bộ thành công!', 'success');
    }
  };

  reader.readAsDataURL(file);
}

// ══════════════════════════════════════════════
//  HOMEPAGE CMS & LAYOUT MANAGEMENT
// ══════════════════════════════════════════════

function getDefaultHomepageConfig() {
  return {
    layout: [
      { id: 'hero-banner', name: 'Banner Hero Showcase (Slide lớn)', desc: 'Slide trình chiếu video/ảnh lớn nổi bật ở đầu trang chủ', enabled: true, order: 1 },
      { id: 'brands-strip', name: 'Dải thương hiệu đồng hành', desc: 'Thanh ngang hiển thị các thương hiệu đối tác tiêu biểu', enabled: true, order: 2 },
      { id: 've-hxy-hikers', name: 'Giới thiệu 2 thương hiệu HXY & HIKERS', desc: 'Khối chi tiết về định vị, thế mạnh công nghệ và TV tiêu biểu', enabled: true, order: 3 },
      { id: 'brand-compare', name: 'Bảng so sánh 2 thương hiệu TV', desc: 'Bảng so sánh trực quan các tiêu chí giữa TV HXY và HIKERS', enabled: true, order: 4 },
      { id: 'stats-bar', name: 'Thanh thống kê năng lực TNP Care', desc: '4 chỉ số số liệu nổi bật về trạm, tỉnh thành, đối tác, linh kiện', enabled: true, order: 5 },
      { id: 'tram-bao-hanh-section', name: 'Tra cứu mạng lưới 80-100 trạm bảo hành', desc: 'Bảng tương tác tra cứu trạm kỹ thuật theo tỉnh/thành phố', enabled: true, order: 6 },
      { id: 'products-featured', name: 'Sản phẩm TV nổi bật ghim trang chủ', desc: 'Lưới các sản phẩm TV tiêu biểu được chọn lọc để ghim', enabled: true, order: 7 },
      { id: 'cta-banner', name: 'Banner kêu gọi hành động & tư vấn (CTA)', desc: 'Khối chân trang kêu gọi liên hệ và số hotline gọi ngay', enabled: true, order: 8 }
    ],
    heroBanners: [
      {
        id: 'banner-1',
        title: 'Smart TV HXY 100 Inch\nQLED Đỉnh Cao Rạp Phim Tại Gia',
        badge: 'TV HXY VIỆT NAM · FLAGSHIP CINEMA',
        image: './images/banner_hxy_100.jpg',
        desc: 'Màn hình vô cực 100 inch chuẩn rạp chiếu phim IMAX thế hệ mới, tấm nền QLED 4K siêu sắc nét, 144Hz VRR cùng âm thanh vòm Dolby Atmos đa chiều bùng nổ.',
        tabBrand: 'HXY',
        tabBrandColor: 'blue',
        tabTitle: 'TV HXY 100" Cinema',
        tabDesc: 'QLED 4K · 144Hz · Dolby Atmos',
        specs: [
          { val: '100"', lbl: 'Màn Hình IMAX' },
          { val: 'QLED 4K', lbl: '1 Tỷ Màu Siêu Thực' },
          { val: '144Hz', lbl: 'VRR Chuyên Game' },
          { val: 'Dolby Atmos', lbl: 'Âm Thanh Đa Hướng' }
        ],
        primaryBtn: { text: 'Khám phá Dòng HXY', link: './san-pham.html?filter=hxy' },
        secondaryBtn: { text: 'Tư vấn & Báo giá', link: './lien-he.html?product=TV+HXY+QLED+100+inch' },
        order: 1,
        active: true
      },
      {
        id: 'banner-2',
        title: 'Smart TV HIKERS Mini LED\n512 Vùng Sáng Loa Siêu Trầm 60W',
        badge: 'TV HIKERS VIỆT NAM · MINI LED ĐẲNG CẤP',
        image: './images/banner_hikers_75.jpg',
        desc: 'Công nghệ đèn nền Mini LED đỉnh cao với 512 vùng làm tối độc lập, độ sáng 1000 nit chói lọi, tương phản tuyệt đối và hệ thống loa rạp hát 2.1 bùng nổ mọi giác quan.',
        tabBrand: 'HIKERS',
        tabBrandColor: 'red',
        tabTitle: 'HIKERS Mini LED 75"',
        tabDesc: '512 Zones · 1000 Nit · Loa 60W',
        specs: [
          { val: '512 Zones', lbl: 'Mini LED Local Dimming' },
          { val: '1000 Nit', lbl: 'Độ Sáng Chói Lọi' },
          { val: 'Sub 60W', lbl: 'Loa Rạp Hát 2.1' },
          { val: 'Google TV', lbl: 'Voice Remote Tiếng Việt' }
        ],
        primaryBtn: { text: 'Khám phá Dòng HIKERS', link: './san-pham.html?filter=hikers' },
        secondaryBtn: { text: 'Tư vấn & Báo giá', link: './lien-he.html?product=TV+HIKERS+Mini+LED+S700' },
        order: 2,
        active: true
      },
      {
        id: 'banner-3',
        title: 'Bảo Hành Chính Hãng 24 Tháng\nAn Tâm Tuyệt Đối Phủ Sóng Toàn Quốc',
        badge: 'TRÚC NGUYÊN PHÁT · HỆ THỐNG TNP CARE',
        image: './images/banner_tnp_care.jpg',
        desc: 'Mạng lưới trạm bảo hành ủy quyền chính hãng trải dài 63 tỉnh thành. Đội ngũ kỹ sư tay nghề cao, hỗ trợ tận nơi nhanh chóng, linh kiện chính hãng chuẩn 100%.',
        tabBrand: 'TNP CARE',
        tabBrandColor: 'green',
        tabTitle: 'Bảo Hành 24 Tháng',
        tabDesc: '63 Tỉnh Thành · Hỗ Trợ Tận Nơi',
        specs: [
          { val: '24 Tháng', lbl: 'Bảo Hành Chính Hãng' },
          { val: '63 Tỉnh', lbl: 'Trạm Tiếp Nhận Toàn Quốc' },
          { val: 'Tận Nơi', lbl: 'Hỗ Trợ Kỹ Thuật Tại Nhà' },
          { val: '100%', lbl: 'Linh Kiện Nhập Khẩu' }
        ],
        primaryBtn: { text: 'Tra Cứu Trạm Bảo Hành', link: './tram-bao-hanh.html' },
        secondaryBtn: { text: 'Chính Sách TNP Care', link: './ho-tro.html' },
        order: 3,
        active: true
      }
    ],
    brandsStrip: {
      label: 'Thương hiệu đồng hành',
      brands: [
        { name: 'HXY TV', color: 'blue', link: './tv-hxy.html' },
        { name: 'HIKERS TV', color: 'red', link: './tv-hikers.html' },
        { name: 'Midea', color: 'blue', link: '' },
        { name: 'Panasonic', color: 'blue', link: '' },
        { name: 'Daikin', color: 'blue', link: '' },
        { name: 'Toshiba', color: 'blue', link: '' },
        { name: '80-100 Trạm Toàn Quốc', color: 'red', link: './tram-bao-hanh.html' }
      ]
    },
    brandDeepdive: {
      sectionHeader: {
        badge: 'Thông tin chi tiết thương hiệu',
        title: 'Tìm hiểu về <span class="blue">TV HXY</span> &amp; <span class="red">TV HIKERS</span>',
        desc: 'Trúc Nguyên Phát (TNP Care) cung cấp giải pháp và dịch vụ bảo hành, bảo trì chính hãng cho hai thương hiệu TV HXY và HIKERS tại Việt Nam. Khám phá định vị, sứ mệnh và các thế mạnh công nghệ độc quyền của từng hãng để chọn mẫu TV ưng ý nhất.'
      },
      hxy: {
        badge: 'THƯƠNG HIỆU TV HXY VIỆT NAM',
        heading: 'HXY TV – Công Nghệ Đỉnh Cao, Giá Trị Đích Thực',
        lead: 'HXY TV là thương hiệu TV thông minh đang bứt phá mạnh mẽ tại thị trường Việt Nam. HXY định hướng phổ cập công nghệ màn hình cao cấp QLED, OLED và 4K UHD với dải kích thước cực kỳ đa dạng từ 32 inch tới siêu phẩm 100 inch chuẩn rạp chiếu phim, tối ưu hóa chi phí cho mọi gia đình và dự án khách sạn.',
        image: './images/brands/hxy_b650.jpg',
        caption: 'Mẫu TV HXY OLED 65" B650 Siêu Mỏng',
        features: [
          { icon: 'fab fa-google', title: 'Google TV Bản Quyền', desc: 'Hệ điều hành Google TV mượt mà, kho 10,000+ ứng dụng, điều khiển tìm kiếm giọng nói Tiếng Việt rảnh tay không cần remote.' },
          { icon: 'fas fa-tv', title: 'QLED & OLED 4K Rực Rỡ', desc: 'Tái tạo 100% dải màu DCI-P3, màu đen sâu thẳm, công nghệ HDR10+ mang đến hình ảnh sống động, độ tương phản ấn tượng.' },
          { icon: 'fas fa-expand-arrows-alt', title: 'Đủ Kích Thước 32" – 100"', desc: 'Dải kích thước rộng nhất: từ TV 32" phòng ngủ, 43"–65" phòng khách đến màn hình khổng lồ 100 inch S950 đẳng cấp rạp phim.' },
          { icon: 'fas fa-shield-alt', title: 'Bảo Hành 24T Tại Nhà', desc: 'Bo mạch nhiệt đới hóa chống ẩm tối ưu cho khí hậu Việt Nam. TNP phân phối chính hãng kèm bảo hành 24 tháng tận nơi.' }
        ],
        models: [
          { id: 'hxy-tv-s950', name: 'HXY 100" S950' },
          { id: 'hxy-tv-q850', name: 'HXY 75" Q850' },
          { id: 'hxy-tv-b650', name: 'HXY 65" B650' },
          { id: 'hxy-tv-p750', name: 'HXY 55" P750' },
          { id: 'hxy-tv-43g1', name: 'HXY 43" Google TV' }
        ],
        primaryBtn: { text: 'Trang chi tiết TV HXY', link: './tv-hxy.html' },
        secondaryBtn: { text: 'Xem toàn bộ TV HXY', link: './san-pham.html?filter=hxy' }
      },
      hikers: {
        badge: 'THƯƠNG HIỆU TV HIKERS VIỆT NAM',
        heading: 'HIKERS TV – Đỉnh Cao Rạp Phim & Tốc Độ Gaming',
        lead: 'HIKERS TV là thương hiệu TV tiên phong định hình trải nghiệm rạp chiếu phim gia đình và thể thao điện tử tốc độ cao. HIKERS tạo dấu ấn vượt trội với công nghệ đèn nền Mini LED 512 vùng độc lập, độ sáng 1000 nit, tần số quét 144Hz chuyên game và dàn loa soundbar 60W chuẩn Dolby Atmos.',
        image: './images/brands/hikers_full_tv.jpg',
        caption: 'Mẫu TV HIKERS Flagship Viền Vô Cực',
        features: [
          { icon: 'fas fa-layer-group', title: 'Mini LED 512 Vùng Sáng', desc: 'Công nghệ Local Dimming 512 vùng độc lập, độ sáng cực đại 1000 nit, kiểm soát bóng tối sâu thẳm, triệt tiêu hoàn toàn quầng sáng.' },
          { icon: 'fas fa-gamepad', title: '144Hz VRR & Cổng HDMI 2.1', desc: 'Tần số quét cao 144Hz, chống giật xé hình VRR FreeSync Premium, phản hồi 1ms siêu tốc, sẵn sàng cho PS5 và các giải đấu thể thao.' },
          { icon: 'fas fa-volume-up', title: 'Loa Vòm 60W Dolby Atmos', desc: 'Tích hợp hệ thống loa Subwoofer siêu trầm 2.1 công suất 60W, tạo hiệu ứng âm thanh 3D vòm bùng nổ chân thực như ngồi tại rạp IMAX.' },
          { icon: 'fas fa-award', title: 'Viền Kim Loại Nguyên Khối', desc: 'Khung vỏ hợp kim Unibody cao cấp, viền mỏng vô cực thanh lịch, tôn vinh vẻ đẹp kiến trúc sang trọng cho phòng khách và căn hộ cao cấp.' }
        ],
        models: [
          { id: 'hikers-dong-s700', name: 'HIKERS Mini LED HK-S700 75"' },
          { id: 'hikers-dong-m600', name: 'HIKERS QLED HK-M600 65"' },
          { id: 'hikers-hk65a500ua', name: 'HIKERS HK65A500UA 65"' },
          { id: 'hikers-hk55a500ua', name: 'HIKERS 55" 4K Google TV' }
        ],
        primaryBtn: { text: 'Trang chi tiết TV HIKERS', link: './tv-hikers.html' },
        secondaryBtn: { text: 'Xem toàn bộ TV HIKERS', link: './san-pham.html?filter=hikers' }
      }
    },
    comparisonTable: {
      title: 'Nên Chọn TV HXY Hay TV HIKERS?',
      desc: 'Bảng tóm tắt nhanh từ Trúc Nguyên Phát – TNP giúp quý khách hàng dễ dàng đưa ra quyết định phù hợp nhất với nhu cầu sử dụng:',
      rows: [
        { criteria: 'Điểm mạnh nổi bật nhất', hxy: 'Đa dạng kích cỡ (32" – 100"), tối ưu chi phí, Google TV chính chủ mượt mà', hikers: 'Mini LED 512 vùng, độ sáng 1000 nit, loa Sub 60W, 144Hz Gaming Pro' },
        { criteria: 'Công nghệ hiển thị', hxy: 'OLED, QLED, 4K UHD Ultra Sharp, HDR10+', hikers: 'Mini LED Local Dimming, QLED 4K, Dolby Vision IQ' },
        { criteria: 'Tần số quét', hxy: '60Hz chuẩn gia đình – 144Hz VRR trên dòng Flagship', hikers: '120Hz – 144Hz Pro chuyên Game & Thể thao' },
        { criteria: 'Hệ thống âm thanh', hxy: 'Dolby Audio Stereo 20W – 30W âm thanh trong trẻo', hikers: 'Loa Subwoofer 60W tích hợp, Dolby Atmos 2.1 uy lực' },
        { criteria: 'Phù hợp nhất cho', hxy: 'Gia đình, phòng ngủ, phòng khách, khách sạn, dự án cần tối ưu ngân sách', hikers: 'Tín đồ mê phim rạp tại gia, thể thao bóng đá, game thủ PS5/PC' },
        { criteria: 'Chính sách TNP', hxy: '100% Phân phối chính hãng · Bảo hành 24 tháng tận nhà · Giao hàng và lắp đặt tận nơi', hikers: '100% Phân phối chính hãng · Bảo hành 24 tháng tận nhà · Giao hàng và lắp đặt tận nơi' }
      ],
      policyText: '100% Phân phối chính hãng · Bảo hành 24 tháng tận nhà · Giao hàng và lắp đặt tận nơi'
    },
    stats: [
      { number: '80-100', label: 'Trạm bảo hành toàn quốc' },
      { number: '63', label: 'Tỉnh thành bao phủ' },
      { number: '15+', label: 'Hãng đối tác uy tín' },
      { number: '100%', label: 'Linh kiện chuẩn hãng' }
    ],
    networkSection: {
      badge: 'MẠNG LƯỚI TOÀN QUỐC',
      title: 'Hệ Thống 80 – 100 Trạm Bảo Hành Trúc Nguyên Phát',
      desc: 'Bấm chọn Tỉnh / Thành phố bạn cần hỗ trợ (như Hà Nội, TP.HCM, Bắc Ninh, Hải Phòng...) hoặc gõ tên vào ô tìm kiếm để hiển thị ngay các trạm tiếp nhận kỹ thuật:',
      hotline: '028 22 422 822',
      primaryBtnText: 'Xem Trang Chi Tiết 80 – 100 Trạm & Quy Trình Dịch Vụ',
      primaryBtnLink: './tram-bao-hanh.html'
    },
    featuredProducts: {
      badge: 'Sản phẩm nổi bật',
      title: 'TV được quan tâm nhiều nhất',
      desc: 'Chọn lọc các mẫu TV nổi bật từ HXY và HIKERS, phù hợp mọi không gian và ngân sách.',
      productIds: ['hxy-tv-s950', 'hikers-dong-s700', 'hxy-tv-b650', 'hikers-dong-m600']
    },
    ctaBanner: {
      badge: 'Tư vấn miễn phí',
      title: 'Tìm chiếc TV phù hợp\ncho không gian của bạn?',
      desc: 'Để TNP tư vấn kích thước và dòng TV phù hợp với nhu cầu, diện tích phòng và ngân sách của bạn. Hoàn toàn miễn phí.',
      primaryBtnText: 'Liên hệ TNP ngay',
      primaryBtnLink: './lien-he.html',
      phone: '028 22 422 822'
    }
  };
}

async function fetchHomepageFromServer() {
  try {
    const res = await fetch('/api/homepage');
    const json = await res.json();
    if (json.success && json.data && json.data.layout) {
      homepageConfig = json.data;
      localStorage.setItem(STORAGE_HOMEPAGE_KEY, JSON.stringify(homepageConfig));
      renderHomepageCMS();
    }
  } catch (e) {}
}

function renderHomepageCMS() {
  if (!homepageConfig) homepageConfig = getDefaultHomepageConfig();
  renderLayoutManager();
  renderCmsHeroTable();
  renderCmsBrands();
  populateCmsDeepdiveForm();
  renderCmsCompareTable();
  renderCmsStats();
  populateCmsNetworkForm();
  renderCmsFeaturedPicker();
  populateCmsCtaForm();
}

// ── 1. Layout Manager ──
function renderLayoutManager() {
  const container = document.getElementById('layoutListContainer');
  if (!container || !homepageConfig || !homepageConfig.layout) return;

  // Sắp xếp theo thứ tự order
  homepageConfig.layout.sort((a, b) => (a.order || 0) - (b.order || 0));

  container.innerHTML = homepageConfig.layout.map((sec, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === homepageConfig.layout.length - 1;
    const isEnabled = sec.enabled !== false;

    return `
      <div class="layout-item ${isEnabled ? '' : 'disabled'}" data-section-id="${sec.id}">
        <div class="layout-left">
          <span class="layout-order-badge">#${idx + 1}</span>
          <div class="layout-info">
            <h4>${sec.name}</h4>
            <p>${sec.desc || 'Khối nội dung trên trang chủ'}</p>
          </div>
        </div>
        <div class="layout-right">
          <button type="button" class="layout-nav-btn" title="Di chuyển lên trên" 
                  onclick="moveLayoutSection(${idx}, -1)" ${isFirst ? 'disabled' : ''}>
            <i class="fas fa-arrow-up"></i>
          </button>
          <button type="button" class="layout-nav-btn" title="Di chuyển xuống dưới" 
                  onclick="moveLayoutSection(${idx}, 1)" ${isLast ? 'disabled' : ''}>
            <i class="fas fa-arrow-down"></i>
          </button>
          <label class="switch-toggle" title="${isEnabled ? 'Đang bật - Nhấn để ẩn' : 'Đang ẩn - Nhấn để bật'}">
            <input type="checkbox" ${isEnabled ? 'checked' : ''} onchange="toggleLayoutSection(${idx}, this.checked)">
            <span class="switch-slider"></span>
          </label>
        </div>
      </div>
    `;
  }).join('');
}

function moveLayoutSection(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= homepageConfig.layout.length) return;

  const temp = homepageConfig.layout[index];
  homepageConfig.layout[index] = homepageConfig.layout[targetIndex];
  homepageConfig.layout[targetIndex] = temp;

  // Cập nhật lại chỉ số order
  homepageConfig.layout.forEach((sec, idx) => {
    sec.order = idx + 1;
  });

  renderLayoutManager();
  showToast('Đã đổi thứ tự khối. Nhấn "Lưu toàn bộ thay đổi" để áp dụng!', 'info');
}

function toggleLayoutSection(index, isChecked) {
  if (!homepageConfig.layout[index]) return;
  homepageConfig.layout[index].enabled = isChecked;
  renderLayoutManager();
  const secName = homepageConfig.layout[index].name;
  showToast((isChecked ? 'Đã BẬT: ' : 'Đã ẨN: ') + secName, 'info');
}

// ── 2. Hero Banner Slider CMS ──
function renderCmsHeroTable() {
  const tbody = document.getElementById('cmsHeroTableBody');
  if (!tbody) return;

  const heroList = homepageConfig.heroBanners || bannersList || [];
  if (heroList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: var(--adm-text-muted);">Chưa có slide nào. Nhấn "Thêm Slide Mới" để tạo.</td></tr>`;
    return;
  }

  tbody.innerHTML = heroList.map((b, idx) => `
    <tr>
      <td style="font-weight: 700; color: var(--adm-accent);">#${b.order || idx + 1}</td>
      <td>
        <img src="${b.image || '../images/banner_hxy_100.jpg'}" 
             alt="${b.title}" 
             style="width: 120px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid var(--adm-border);"
             onerror="this.src='../images/banner_hxy_100.jpg'">
      </td>
      <td>
        <strong>${(b.title || '').replace(/\n/g, ' ')}</strong><br>
        <small style="color: #64748b;">${b.desc ? b.desc.substring(0, 50) + '...' : ''}</small>
      </td>
      <td><span class="badge badge-brand-hxy">${b.badge || 'HERO'}</span></td>
      <td><span class="badge badge-secondary">${b.tabBrand || 'TNP'}</span></td>
      <td>
        <span class="badge ${b.active !== false ? 'badge-success' : 'badge-secondary'}">
          ${b.active !== false ? 'Đang bật' : 'Tạm ẩn'}
        </span>
      </td>
      <td>
        <div class="action-btn-group">
          <button class="btn-icon" title="Chỉnh sửa" onclick="openEditBannerModal('${b.id}')">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn-icon btn-icon-delete" title="Xóa" onclick="deleteBanner('${b.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── 3. Brands Strip CMS ──
function renderCmsBrands() {
  const container = document.getElementById('cmsBrandChipsList');
  const labelInput = document.getElementById('cmsBrandsLabel');
  if (!container || !homepageConfig) return;

  if (homepageConfig.brandsStrip) {
    if (labelInput && homepageConfig.brandsStrip.label) {
      labelInput.value = homepageConfig.brandsStrip.label;
    }
  } else {
    homepageConfig.brandsStrip = { label: 'Thương hiệu đồng hành', brands: [] };
  }

  const brands = homepageConfig.brandsStrip.brands || [];
  container.innerHTML = brands.map((b, idx) => `
    <span class="badge-brand-chip">
      <span class="dot ${b.color || 'blue'}"></span>
      <span>${b.name}</span>
      <i class="fas fa-times badge-brand-chip-del" title="Xóa thương hiệu này" onclick="removeBrandChip(${idx})"></i>
    </span>
  `).join('');
}

function addBrandChip() {
  const nameInput = document.getElementById('cmsNewBrandName');
  const colorSelect = document.getElementById('cmsNewBrandColor');
  const linkInput = document.getElementById('cmsNewBrandLink');

  const name = nameInput.value.trim();
  if (!name) {
    alert('Vui lòng nhập tên thương hiệu.');
    return;
  }

  if (!homepageConfig.brandsStrip) homepageConfig.brandsStrip = { label: 'Thương hiệu đồng hành', brands: [] };
  homepageConfig.brandsStrip.brands.push({
    name,
    color: colorSelect.value || 'blue',
    link: linkInput.value.trim()
  });

  nameInput.value = '';
  linkInput.value = '';
  renderCmsBrands();
  showToast(`Đã thêm thương hiệu "${name}"`, 'success');
}

function removeBrandChip(index) {
  if (!homepageConfig.brandsStrip || !homepageConfig.brandsStrip.brands) return;
  const removed = homepageConfig.brandsStrip.brands.splice(index, 1);
  renderCmsBrands();
  showToast(`Đã xóa "${removed[0] ? removed[0].name : ''}"`, 'info');
}

// ── 4. Brand Deepdive CMS (HXY & HIKERS) ──
function populateCmsDeepdiveForm() {
  if (!homepageConfig || !homepageConfig.brandDeepdive) return;
  const bd = homepageConfig.brandDeepdive;

  // Header
  const bBadge = document.getElementById('cmsDeepdiveBadge');
  const bTitle = document.getElementById('cmsDeepdiveTitle');
  const bDesc  = document.getElementById('cmsDeepdiveDesc');
  if (bBadge && bd.sectionHeader) bBadge.value = bd.sectionHeader.badge || '';
  if (bTitle && bd.sectionHeader) bTitle.value = bd.sectionHeader.title || '';
  if (bDesc  && bd.sectionHeader) bDesc.value  = bd.sectionHeader.desc  || '';

  // HXY
  if (bd.hxy) {
    const elBadge   = document.getElementById('cmsHxyBadge');
    const elHeading = document.getElementById('cmsHxyHeading');
    const elLead    = document.getElementById('cmsHxyLead');
    const elImage   = document.getElementById('cmsHxyImage');
    const elCaption = document.getElementById('cmsHxyCaption');
    if (elBadge) elBadge.value = bd.hxy.badge || '';
    if (elHeading) elHeading.value = bd.hxy.heading || '';
    if (elLead) elLead.value = bd.hxy.lead || '';
    if (elImage) elImage.value = bd.hxy.image || '';
    if (elCaption) elCaption.value = bd.hxy.caption || '';

    // Render 4 features
    renderDeepdiveFeaturesInputs('cmsHxyFeaturesWrap', bd.hxy.features || [], 'hxy');
  }

  // HIKERS
  if (bd.hikers) {
    const elBadge   = document.getElementById('cmsHikersBadge');
    const elHeading = document.getElementById('cmsHikersHeading');
    const elLead    = document.getElementById('cmsHikersLead');
    const elImage   = document.getElementById('cmsHikersImage');
    const elCaption = document.getElementById('cmsHikersCaption');
    if (elBadge) elBadge.value = bd.hikers.badge || '';
    if (elHeading) elHeading.value = bd.hikers.heading || '';
    if (elLead) elLead.value = bd.hikers.lead || '';
    if (elImage) elImage.value = bd.hikers.image || '';
    if (elCaption) elCaption.value = bd.hikers.caption || '';

    // Render 4 features
    renderDeepdiveFeaturesInputs('cmsHikersFeaturesWrap', bd.hikers.features || [], 'hikers');
  }
}

function renderDeepdiveFeaturesInputs(wrapId, features, brandKey) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;

  wrap.innerHTML = features.map((f, idx) => `
    <div style="background: #f8fafc; border: 1px solid var(--adm-border); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 8px;">
      <div style="display: flex; gap: 8px; margin-bottom: 6px;">
        <input type="text" class="form-control feat-icon-${brandKey}" value="${f.icon || 'fas fa-tv'}" placeholder="Icon fa" style="width: 140px; font-size: 12px;">
        <input type="text" class="form-control feat-title-${brandKey}" value="${f.title || ''}" placeholder="Tiêu đề thế mạnh" style="flex: 1; font-weight: 600; font-size: 12.5px;">
      </div>
      <textarea class="form-control feat-desc-${brandKey}" rows="2" placeholder="Mô tả chi tiết" style="font-size: 12px;">${f.desc || ''}</textarea>
    </div>
  `).join('');
}

function collectCmsDeepdiveForm() {
  if (!homepageConfig) return;
  if (!homepageConfig.brandDeepdive) homepageConfig.brandDeepdive = {};
  const bd = homepageConfig.brandDeepdive;

  bd.sectionHeader = {
    badge: (document.getElementById('cmsDeepdiveBadge') || {}).value || '',
    title: (document.getElementById('cmsDeepdiveTitle') || {}).value || '',
    desc:  (document.getElementById('cmsDeepdiveDesc') || {}).value || ''
  };

  // Collect HXY
  if (!bd.hxy) bd.hxy = {};
  bd.hxy.badge   = (document.getElementById('cmsHxyBadge') || {}).value || '';
  bd.hxy.heading = (document.getElementById('cmsHxyHeading') || {}).value || '';
  bd.hxy.lead    = (document.getElementById('cmsHxyLead') || {}).value || '';
  bd.hxy.image   = (document.getElementById('cmsHxyImage') || {}).value || '';
  bd.hxy.caption = (document.getElementById('cmsHxyCaption') || {}).value || '';

  const hxyIcons  = document.querySelectorAll('.feat-icon-hxy');
  const hxyTitles = document.querySelectorAll('.feat-title-hxy');
  const hxyDescs  = document.querySelectorAll('.feat-desc-hxy');
  bd.hxy.features = [];
  hxyIcons.forEach((el, i) => {
    bd.hxy.features.push({
      icon: el.value.trim(),
      title: (hxyTitles[i] ? hxyTitles[i].value.trim() : ''),
      desc: (hxyDescs[i] ? hxyDescs[i].value.trim() : '')
    });
  });

  // Collect HIKERS
  if (!bd.hikers) bd.hikers = {};
  bd.hikers.badge   = (document.getElementById('cmsHikersBadge') || {}).value || '';
  bd.hikers.heading = (document.getElementById('cmsHikersHeading') || {}).value || '';
  bd.hikers.lead    = (document.getElementById('cmsHikersLead') || {}).value || '';
  bd.hikers.image   = (document.getElementById('cmsHikersImage') || {}).value || '';
  bd.hikers.caption = (document.getElementById('cmsHikersCaption') || {}).value || '';

  const hikersIcons  = document.querySelectorAll('.feat-icon-hikers');
  const hikersTitles = document.querySelectorAll('.feat-title-hikers');
  const hikersDescs  = document.querySelectorAll('.feat-desc-hikers');
  bd.hikers.features = [];
  hikersIcons.forEach((el, i) => {
    bd.hikers.features.push({
      icon: el.value.trim(),
      title: (hikersTitles[i] ? hikersTitles[i].value.trim() : ''),
      desc: (hikersDescs[i] ? hikersDescs[i].value.trim() : '')
    });
  });
}

// ── 5. Comparison Table CMS ──
function renderCmsCompareTable() {
  const tbody = document.getElementById('cmsCompareTableBody');
  const titleEl = document.getElementById('cmsCompareTitle');
  const descEl  = document.getElementById('cmsCompareDesc');
  const polEl   = document.getElementById('cmsComparePolicy');

  if (!tbody || !homepageConfig) return;
  const ct = homepageConfig.comparisonTable || { rows: [] };

  if (titleEl && ct.title) titleEl.value = ct.title;
  if (descEl && ct.desc) descEl.value = ct.desc;
  if (polEl && ct.policyText) polEl.value = ct.policyText;

  tbody.innerHTML = (ct.rows || []).map((r, idx) => `
    <tr>
      <td><textarea class="cmp-criteria" rows="2">${r.criteria || ''}</textarea></td>
      <td><textarea class="cmp-hxy" rows="2">${r.hxy || ''}</textarea></td>
      <td><textarea class="cmp-hikers" rows="2">${r.hikers || ''}</textarea></td>
      <td style="text-align: center;">
        <button type="button" class="btn-icon btn-icon-delete" onclick="deleteCompareRow(${idx})" title="Xóa dòng tiêu chí này">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function addCompareRow() {
  if (!homepageConfig.comparisonTable) homepageConfig.comparisonTable = { rows: [] };
  collectCmsCompareForm();
  homepageConfig.comparisonTable.rows.push({
    criteria: 'Tiêu chí mới',
    hxy: '',
    hikers: ''
  });
  renderCmsCompareTable();
}

function deleteCompareRow(index) {
  if (!homepageConfig.comparisonTable || !homepageConfig.comparisonTable.rows) return;
  collectCmsCompareForm();
  homepageConfig.comparisonTable.rows.splice(index, 1);
  renderCmsCompareTable();
}

function collectCmsCompareForm() {
  if (!homepageConfig) return;
  if (!homepageConfig.comparisonTable) homepageConfig.comparisonTable = {};

  homepageConfig.comparisonTable.title = (document.getElementById('cmsCompareTitle') || {}).value || '';
  homepageConfig.comparisonTable.desc  = (document.getElementById('cmsCompareDesc') || {}).value || '';
  homepageConfig.comparisonTable.policyText = (document.getElementById('cmsComparePolicy') || {}).value || '';

  const criterias = document.querySelectorAll('.cmp-criteria');
  const hxys = document.querySelectorAll('.cmp-hxy');
  const hikerss = document.querySelectorAll('.cmp-hikers');

  const rows = [];
  criterias.forEach((el, i) => {
    rows.push({
      criteria: el.value.trim(),
      hxy: hxys[i] ? hxys[i].value.trim() : '',
      hikers: hikerss[i] ? hikerss[i].value.trim() : ''
    });
  });
  homepageConfig.comparisonTable.rows = rows;
}

// ── 6. Stats Bar CMS ──
function renderCmsStats() {
  const wrap = document.getElementById('cmsStatsWrap');
  if (!wrap || !homepageConfig) return;

  const stats = homepageConfig.stats || [];
  wrap.innerHTML = stats.map((s, idx) => `
    <div class="cms-card-box" style="flex: 1; min-width: 200px;">
      <div class="form-group">
        <label class="form-label">Chỉ số số liệu #${idx + 1}</label>
        <input type="text" class="form-control cms-stat-num" value="${s.number || ''}" placeholder="VD: 80-100, 63, 100%">
      </div>
      <div class="form-group">
        <label class="form-label">Nhãn mô tả</label>
        <input type="text" class="form-control cms-stat-lbl" value="${s.label || ''}" placeholder="VD: Trạm bảo hành toàn quốc">
      </div>
    </div>
  `).join('');
}

function collectCmsStats() {
  if (!homepageConfig) return;
  const nums = document.querySelectorAll('.cms-stat-num');
  const lbls = document.querySelectorAll('.cms-stat-lbl');

  const stats = [];
  nums.forEach((el, i) => {
    stats.push({
      number: el.value.trim(),
      label: lbls[i] ? lbls[i].value.trim() : ''
    });
  });
  homepageConfig.stats = stats;
}

// ── 7. Network / Stations Info CMS ──
function populateCmsNetworkForm() {
  if (!homepageConfig || !homepageConfig.networkSection) return;
  const ns = homepageConfig.networkSection;

  const bBadge   = document.getElementById('cmsNetworkBadge');
  const bTitle   = document.getElementById('cmsNetworkTitle');
  const bDesc    = document.getElementById('cmsNetworkDesc');
  const bHotline = document.getElementById('cmsNetworkHotline');
  const bBtnText = document.getElementById('cmsNetworkBtnText');

  if (bBadge)   bBadge.value   = ns.badge || '';
  if (bTitle)   bTitle.value   = ns.title || '';
  if (bDesc)    bDesc.value    = ns.desc  || '';
  if (bHotline) bHotline.value = ns.hotline || '';
  if (bBtnText) bBtnText.value = ns.primaryBtnText || '';
}

function collectCmsNetworkForm() {
  if (!homepageConfig) return;
  homepageConfig.networkSection = {
    badge: (document.getElementById('cmsNetworkBadge') || {}).value || '',
    title: (document.getElementById('cmsNetworkTitle') || {}).value || '',
    desc:  (document.getElementById('cmsNetworkDesc') || {}).value || '',
    hotline: (document.getElementById('cmsNetworkHotline') || {}).value || '',
    primaryBtnText: (document.getElementById('cmsNetworkBtnText') || {}).value || '',
    primaryBtnLink: './tram-bao-hanh.html'
  };
}

// ── 8. Featured Products Picker CMS ──
function renderCmsFeaturedPicker(filterQuery = '') {
  const grid = document.getElementById('cmsFeaturedPickGrid');
  const badgeEl = document.getElementById('cmsFeaturedBadge');
  const titleEl = document.getElementById('cmsFeaturedTitle');
  const descEl  = document.getElementById('cmsFeaturedDesc');

  if (!grid || !homepageConfig) return;
  const fp = homepageConfig.featuredProducts || { productIds: [] };

  if (badgeEl && fp.badge) badgeEl.value = fp.badge;
  if (titleEl && fp.title) titleEl.value = fp.title;
  if (descEl && fp.desc) descEl.value = fp.desc;

  const selectedIds = fp.productIds || [];

  let list = productsList || [];
  if (filterQuery) {
    const q = filterQuery.toLowerCase().trim();
    list = list.filter(p => (p.name && p.name.toLowerCase().includes(q)) || (p.model && p.model.toLowerCase().includes(q)));
  }

  grid.innerHTML = list.map(p => {
    const isSelected = selectedIds.includes(p.id);
    return `
      <div class="featured-pick-card ${isSelected ? 'selected' : ''}" onclick="toggleFeaturedProduct('${p.id}')">
        <img src="${p.thumbnail || '../images/products/placeholder.svg'}" alt="${p.name}" class="featured-pick-thumb" onerror="this.src='../images/products/placeholder.svg'">
        <div class="featured-pick-info">
          <div class="featured-pick-title">${p.name}</div>
          <div class="featured-pick-sub">${p.brand} · ${p.model}</div>
        </div>
        <i class="fas ${isSelected ? 'fa-check-circle' : 'fa-circle'} featured-pick-check"></i>
      </div>
    `;
  }).join('');
}

function filterFeaturedPicker(query) {
  renderCmsFeaturedPicker(query);
}

function toggleFeaturedProduct(productId) {
  if (!homepageConfig.featuredProducts) homepageConfig.featuredProducts = { productIds: [] };
  const ids = homepageConfig.featuredProducts.productIds || [];
  const idx = ids.indexOf(productId);

  if (idx !== -1) {
    ids.splice(idx, 1);
  } else {
    ids.push(productId);
  }

  homepageConfig.featuredProducts.productIds = ids;
  renderCmsFeaturedPicker();
}

function collectCmsFeaturedForm() {
  if (!homepageConfig) return;
  if (!homepageConfig.featuredProducts) homepageConfig.featuredProducts = { productIds: [] };
  homepageConfig.featuredProducts.badge = (document.getElementById('cmsFeaturedBadge') || {}).value || '';
  homepageConfig.featuredProducts.title = (document.getElementById('cmsFeaturedTitle') || {}).value || '';
  homepageConfig.featuredProducts.desc  = (document.getElementById('cmsFeaturedDesc') || {}).value || '';
}

// ── 9. CTA Banner CMS ──
function populateCmsCtaForm() {
  if (!homepageConfig || !homepageConfig.ctaBanner) return;
  const cta = homepageConfig.ctaBanner;

  const bBadge   = document.getElementById('cmsCtaBadge');
  const bTitle   = document.getElementById('cmsCtaTitle');
  const bDesc    = document.getElementById('cmsCtaDesc');
  const bBtnText = document.getElementById('cmsCtaBtnText');
  const bBtnLink = document.getElementById('cmsCtaBtnLink');
  const bPhone   = document.getElementById('cmsCtaPhone');

  if (bBadge)   bBadge.value   = cta.badge || '';
  if (bTitle)   bTitle.value   = cta.title || '';
  if (bDesc)    bDesc.value    = cta.desc  || '';
  if (bBtnText) bBtnText.value = cta.primaryBtnText || '';
  if (bBtnLink) bBtnLink.value = cta.primaryBtnLink || '';
  if (bPhone)   bPhone.value   = cta.phone || '';
}

function collectCmsCtaForm() {
  if (!homepageConfig) return;
  homepageConfig.ctaBanner = {
    badge: (document.getElementById('cmsCtaBadge') || {}).value || '',
    title: (document.getElementById('cmsCtaTitle') || {}).value || '',
    desc:  (document.getElementById('cmsCtaDesc') || {}).value || '',
    primaryBtnText: (document.getElementById('cmsCtaBtnText') || {}).value || '',
    primaryBtnLink: (document.getElementById('cmsCtaBtnLink') || {}).value || '',
    phone: (document.getElementById('cmsCtaPhone') || {}).value || ''
  };
}

// ── SAVE & RESET HOMEPAGE ──
async function saveHomepageConfig() {
  if (!homepageConfig) homepageConfig = getDefaultHomepageConfig();

  // Thu thập dữ liệu từ tất cả các form con
  if (document.getElementById('cmsBrandsLabel')) {
    homepageConfig.brandsStrip.label = document.getElementById('cmsBrandsLabel').value.trim();
  }
  collectCmsDeepdiveForm();
  collectCmsCompareForm();
  collectCmsStats();
  collectCmsNetworkForm();
  collectCmsFeaturedForm();
  collectCmsCtaForm();

  // Đồng bộ heroBanners từ bannersList hiện tại nếu có
  if (bannersList && bannersList.length > 0) {
    homepageConfig.heroBanners = [...bannersList];
  }

  // 1. Lưu cục bộ localStorage để trang chủ đọc ngay lập tức
  localStorage.setItem(STORAGE_HOMEPAGE_KEY, JSON.stringify(homepageConfig));

  // 2. Gửi lên Server API để lưu trữ vĩnh viễn (MongoDB / JSON file)
  try {
    const res = await fetch('/api/admin/homepage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(homepageConfig)
    });
    const json = await res.json();
    if (json.success) {
      showToast('Đã lưu và đồng bộ toàn bộ trang chủ thành công lên Server!', 'success');
    } else {
      showToast('Đã lưu cục bộ: ' + (json.message || 'Lỗi server'), 'info');
    }
  } catch (e) {
    showToast('Đã lưu vào bộ nhớ cục bộ!', 'success');
  }

  // Cập nhật lại giao diện
  renderHomepageCMS();
}

function resetHomepageDefault() {
  if (confirm('Bạn có chắc chắn muốn khôi phục toàn bộ trang chủ về thiết kế và nội dung mặc định ban đầu không?')) {
    homepageConfig = getDefaultHomepageConfig();
    saveHomepageConfig();
    showToast('Đã khôi phục cài đặt mặc định cho trang chủ!', 'success');
  }
}

