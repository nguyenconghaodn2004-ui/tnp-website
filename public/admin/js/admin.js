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
//  AUTH GUARD & TOKEN REQUEST WRAPPER
// ══════════════════════════════════════════════
function getAdminToken() {
  try {
    const authData = localStorage.getItem('tnp_admin_auth');
    if (!authData) return '';
    const auth = JSON.parse(authData);
    return auth?.token || '';
  } catch (e) {
    return '';
  }
}

async function adminFetch(url, options = {}) {
  const token = getAdminToken();
  const headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${token}`
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem('tnp_admin_auth');
    alert('Phiên làm việc quản trị đã hết hạn. Vui lòng đăng nhập lại!');
    window.location.href = './login.html';
    throw new Error('Unauthorized');
  }
  return response;
}

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
      const displayName = auth.user.fullName || auth.user.name || auth.user.username || 'Quản Trị Viên';
      if (nameEl) nameEl.textContent = displayName;

      const roleNames = {
        superadmin: 'Quản Trị Tối Cao',
        station_manager: 'Quản Lý Trạm & SP',
        editor: 'Biên Tập Viên',
        support: 'Hỗ Trợ & CSKH'
      };
      const displayRole = roleNames[auth.user.role] || auth.user.role || 'Quản Trị';
      if (roleEl) roleEl.textContent = `${displayRole} (${auth.user.username || auth.user.email})`;
      if (avatarEl) {
        avatarEl.textContent = displayName.substring(0, 2).toUpperCase();
        if (auth.user.role === 'superadmin') {
          avatarEl.style.background = '#ef4444';
        }
      }

      // Áp dụng phân quyền hiển thị giao diện theo vai trò
      applyRolePermissions(auth.user.role || 'editor');
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
  initAdminTheme();
  initNavigation();
  initSidebarMobile();
  initQuickSearch();
  loadData();
  renderAll();
  fetchContactsFromServer();
  loadAnalyticsData();
  checkSystemStatus();
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
    users: 'Quản lý Tài khoản & Phân quyền',
    settings: 'Cài đặt hệ thống'
  };

  const titleText = titles[tabId] || 'Quản trị';
  document.getElementById('pageTitle').textContent = titleText;
  document.getElementById('breadcrumbCurrent').textContent = titleText;

  if (tabId === 'users') {
    loadUsersList();
  }
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
      if (typeof TNP_SERVICE_CENTERS !== 'undefined' && Array.isArray(TNP_SERVICE_CENTERS)) {
        const existingIds = new Set(serviceCentersList.map(s => s.id));
        const missing = TNP_SERVICE_CENTERS.filter(s => !existingIds.has(s.id));
        if (missing.length > 0) {
          serviceCentersList = [...serviceCentersList, ...missing];
          localStorage.setItem(STORAGE_STATIONS_KEY, JSON.stringify(serviceCentersList));
        }
      }
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
    await adminFetch('/api/admin/products', {
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
    await adminFetch('/api/admin/stations', {
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
  if (typeof homepageConfig !== 'undefined' && homepageConfig) {
    homepageConfig.heroBanners = [...bannersList];
    try {
      localStorage.setItem(STORAGE_HOMEPAGE_KEY, JSON.stringify(homepageConfig));
      await adminFetch('/api/admin/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homepageConfig)
      });
    } catch (e) {}
  }
  try {
    await adminFetch('/api/admin/banners', {
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

  let filtered = serviceCentersList || [];
  if (filterQuery) {
    const q = filterQuery.toLowerCase();
    filtered = filtered.filter(s => 
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.province && s.province.toLowerCase().includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color: var(--adm-text-muted);">Không tìm thấy trạm bảo hành nào. Bấm "Thêm Trạm Mới" để tạo.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.slice(0, 100).map((s, idx) => `
    <tr>
      <td style="font-weight: 600; color: var(--adm-text-secondary);">${idx + 1}</td>
      <td>
        <strong>${s.name}</strong>
        ${s.note ? `<br><small style="color: #64748b;">${s.note}</small>` : ''}
      </td>
      <td>
        <span class="badge badge-secondary">${s.province || 'Chưa cập nhật'}</span>
        ${s.region ? `<br><small style="color: #94a3b8; font-size: 11px;">${s.region === 'north' ? 'Miền Bắc' : s.region === 'central' ? 'Miền Trung' : 'Miền Nam'}</small>` : ''}
      </td>
      <td><small style="color: var(--adm-text);">${s.address}</small></td>
      <td>
        <a href="tel:${(s.phone || '028 22 422 822').replace(/\s+/g, '')}" style="color: var(--adm-accent); text-decoration: none; font-weight: 600;">
          ${s.phone || '028 22 422 822'}
        </a>
        ${s.hours ? `<br><small style="color: #64748b; font-size: 11px;">${s.hours}</small>` : ''}
      </td>
      <td>
        <div class="action-btn-group" style="justify-content: center;">
          <button class="btn-icon" title="Chỉnh sửa trạm" onclick="openEditStationModal('${s.id}')">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn-icon btn-icon-delete" title="Xóa trạm" onclick="deleteStation('${s.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddStationModal() {
  document.getElementById('stationId').value = '';
  document.getElementById('stationName').value = '';
  document.getElementById('stationProvince').value = '';
  document.getElementById('stationRegion').value = 'north';
  document.getElementById('stationAddress').value = '';
  document.getElementById('stationPhone').value = '028 22 422 822';
  document.getElementById('stationHours').value = '8h00 - 18h00 (Thứ 2 - Thứ 7)';
  document.getElementById('stationNote').value = '';

  const titleEl = document.getElementById('modalStationTitle');
  if (titleEl) titleEl.innerHTML = '<i class="fas fa-map-marker-alt"></i> Thêm Trạm Bảo Hành Mới';

  const modal = document.getElementById('modalStation');
  if (modal) modal.classList.add('open');
}

function openEditStationModal(id) {
  const station = serviceCentersList.find(s => String(s.id) === String(id));
  if (!station) {
    alert('Không tìm thấy thông tin trạm bảo hành này.');
    return;
  }

  document.getElementById('stationId').value = station.id || '';
  document.getElementById('stationName').value = station.name || '';
  document.getElementById('stationProvince').value = station.province || '';
  document.getElementById('stationRegion').value = station.region || 'north';
  document.getElementById('stationAddress').value = station.address || '';
  document.getElementById('stationPhone').value = station.phone || '';
  document.getElementById('stationHours').value = station.hours || '8h00 - 18h00 (Thứ 2 - Thứ 7)';
  document.getElementById('stationNote').value = station.note || '';

  const titleEl = document.getElementById('modalStationTitle');
  if (titleEl) titleEl.innerHTML = '<i class="fas fa-edit"></i> Chỉnh Sửa Trạm Bảo Hành';

  const modal = document.getElementById('modalStation');
  if (modal) modal.classList.add('open');
}

function closeStationModal() {
  const modal = document.getElementById('modalStation');
  if (modal) modal.classList.remove('open');
}

function saveStationForm(e) {
  e.preventDefault();
  const id = document.getElementById('stationId').value.trim();
  const name = document.getElementById('stationName').value.trim();
  const province = document.getElementById('stationProvince').value.trim();
  const region = document.getElementById('stationRegion').value;
  const address = document.getElementById('stationAddress').value.trim();
  const phone = document.getElementById('stationPhone').value.trim();
  const hours = document.getElementById('stationHours').value.trim();
  const note = document.getElementById('stationNote').value.trim();

  if (!name || !province || !address) {
    alert('Vui lòng nhập đầy đủ tên trạm, tỉnh thành và địa chỉ.');
    return;
  }

  const existingIdx = serviceCentersList.findIndex(s => String(s.id) === String(id));
  const stationObj = {
    id: id || `station-${Date.now()}`,
    name,
    province,
    region,
    address,
    phone: phone || '028 22 422 822',
    hours: hours || '8h00 - 18h00 (Thứ 2 - Thứ 7)',
    note
  };

  if (existingIdx >= 0) {
    serviceCentersList[existingIdx] = stationObj;
    showToast(`Đã cập nhật trạm "${name}"`, 'success');
  } else {
    serviceCentersList.unshift(stationObj);
    showToast(`Đã thêm trạm mới "${name}"`, 'success');
  }

  closeStationModal();
  saveStations();
}

function deleteStation(id) {
  const station = serviceCentersList.find(s => String(s.id) === String(id));
  const name = station ? station.name : 'trạm này';
  if (confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi hệ thống?`)) {
    serviceCentersList = serviceCentersList.filter(s => String(s.id) !== String(id));
    saveStations();
    showToast(`Đã xóa "${name}"`, 'info');
  }
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
  const b = (bannersList && bannersList.find(item => item.id === id)) ||
            (typeof homepageConfig !== 'undefined' && homepageConfig && homepageConfig.heroBanners && homepageConfig.heroBanners.find(item => item.id === id));
  if (!b) {
    alert('Không tìm thấy banner để chỉnh sửa.');
    return;
  }

  document.getElementById('bannerModalTitle').textContent = 'Chỉnh sửa Banner Hero';
  document.getElementById('bannerId').value = b.id;
  document.getElementById('bannerTitle').value = b.title || '';
  document.getElementById('bannerBadge').value = b.badge || '';
  document.getElementById('bannerOrder').value = b.order || 1;
  document.getElementById('bannerImage').value = b.image || b.bgImage || '';
  document.getElementById('bannerDesc').value = b.desc || '';
  document.getElementById('bannerLinkPrimary').value = b.link || (b.primaryBtn ? b.primaryBtn.link : '');
  const isCurrentlyActive = b.active !== false && b.active !== 'false';
  document.getElementById('bannerActive').value = isCurrentlyActive ? 'true' : 'false';

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
  let bannerObj;
  if (existingIdx >= 0) {
    bannerObj = {
      ...bannersList[existingIdx],
      id,
      title,
      badge,
      order,
      image,
      bgImage: image,
      desc,
      link,
      active
    };
    bannersList[existingIdx] = bannerObj;
  } else {
    bannerObj = {
      id,
      title,
      badge,
      order,
      image,
      bgImage: image,
      desc,
      link,
      active
    };
    bannersList.push(bannerObj);
  }

  // Đồng bộ sang homepageConfig.heroBanners
  if (typeof homepageConfig !== 'undefined' && homepageConfig) {
    if (!homepageConfig.heroBanners) homepageConfig.heroBanners = [];
    const hpIdx = homepageConfig.heroBanners.findIndex(b => b.id === id);
    if (hpIdx >= 0) {
      homepageConfig.heroBanners[hpIdx] = { ...homepageConfig.heroBanners[hpIdx], ...bannerObj };
    } else {
      homepageConfig.heroBanners.push(bannerObj);
    }
  }

  closeBannerModal();
  saveBanners();
}

function deleteBanner(id) {
  if (confirm('Bạn có chắc chắn muốn xóa Banner này?')) {
    bannersList = bannersList.filter(b => b.id !== id);
    if (typeof homepageConfig !== 'undefined' && homepageConfig && homepageConfig.heroBanners) {
      homepageConfig.heroBanners = homepageConfig.heroBanners.filter(b => b.id !== id);
    }
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
    const res = await adminFetch(`/api/admin/contacts?_t=${Date.now()}`);
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

  // Chỉ sử dụng dữ liệu tin nhắn thực tế từ khách hàng, loại bỏ dữ liệu ảo
  if (Array.isArray(contactsList)) {
    contactsList = contactsList.filter(c => c && c.id && !c.id.includes('sample'));
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

function filterContactsByStatus(status) {
  if (!status || status === 'all') {
    renderContactsTable(contactsList);
    return;
  }
  const filtered = contactsList.filter(c => c.status === status);
  renderContactsTable(filtered);
}

function exportContactsCSV() {
  if (!contactsList || contactsList.length === 0) {
    showToast('Chưa có danh sách liên hệ để xuất file!', 'warning');
    return;
  }
  let csv = '\uFEFF'; // UTF-8 BOM cho Excel mở tiếng Việt không bị lỗi font
  csv += 'STT,Họ và tên khách hàng,Số điện thoại,Dòng TV quan tâm,Nội dung lời nhắn,Thời gian gửi,Trạng thái,Ghi chú CSKH\n';
  contactsList.forEach((c, idx) => {
    const name = `"${(c.name || '').replace(/"/g, '""')}"`;
    const phone = `"${(c.phone || '').replace(/"/g, '""')}"`;
    const product = `"${(c.product || '').replace(/"/g, '""')}"`;
    const message = `"${(c.message || '').replace(/"/g, '""')}"`;
    const time = `"${(c.time || '').replace(/"/g, '""')}"`;
    let statusLabel = 'Chờ liên hệ';
    if (c.status === 'in_progress' || c.status === 'contacting') statusLabel = 'Đang tư vấn';
    else if (c.status === 'completed' || c.status === 'resolved') statusLabel = 'Đã hoàn tất';
    const notes = `"${(c.notes || '').replace(/"/g, '""')}"`;
    csv += `${idx + 1},${name},${phone},${product},${message},${time},"${statusLabel}",${notes}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tnp_khach_hang_lien_he_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Đã xuất danh sách liên hệ ra file Excel / CSV thành công!', 'success');
}

// ── BỘ LỌC VÙNG MIỀN & XUẤT EXCEL CHO TRẠM BẢO HÀNH ──
let currentStationRegion = 'all';

function filterStationsByRegion(region) {
  currentStationRegion = region;
  ['all', 'bac', 'trung', 'nam'].forEach(r => {
    const btn = document.getElementById(`filterStationRegion${r.charAt(0).toUpperCase() + r.slice(1)}`);
    if (btn) btn.classList.toggle('active', r === region);
  });
  
  if (region === 'all') {
    renderStationsTable(serviceCentersList);
    return;
  }
  
  const bacProvinces = ['Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Bắc Ninh', 'Hải Dương', 'Hưng Yên', 'Nam Định', 'Thái Bình', 'Ninh Bình', 'Hà Nam', 'Vĩnh Phúc', 'Phú Thọ', 'Thái Nguyên', 'Bắc Giang', 'Lạng Sơn', 'Cao Bằng', 'Bắc Kạn', 'Tuyên Quang', 'Hà Giang', 'Yên Bái', 'Lào Cai', 'Điện Biên', 'Lai Châu', 'Sơn La', 'Hòa Bình'];
  const trungProvinces = ['Đà Nẵng', 'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Kon Tum', 'Gia Lai', 'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng'];
  
  const filtered = serviceCentersList.filter(s => {
    const loc = (s.city || s.province || s.address || '').toLowerCase();
    if (region === 'bac') {
      return bacProvinces.some(p => loc.includes(p.toLowerCase()));
    } else if (region === 'trung') {
      return trungProvinces.some(p => loc.includes(p.toLowerCase()));
    } else if (region === 'nam') {
      return !bacProvinces.some(p => loc.includes(p.toLowerCase())) && !trungProvinces.some(p => loc.includes(p.toLowerCase()));
    }
    return true;
  });
  renderStationsTable(filtered);
}

function exportStationsCSV() {
  if (!serviceCentersList || serviceCentersList.length === 0) {
    showToast('Chưa có dữ liệu trạm bảo hành để xuất file!', 'warning');
    return;
  }
  let csv = '\uFEFF';
  csv += 'STT,Tên trạm bảo hành,Tỉnh Thành,Địa chỉ chi tiết,Hotline\n';
  serviceCentersList.forEach((s, idx) => {
    const name = `"${(s.name || '').replace(/"/g, '""')}"`;
    const city = `"${(s.city || s.province || '').replace(/"/g, '""')}"`;
    const address = `"${(s.address || '').replace(/"/g, '""')}"`;
    const phone = `"${(s.phone || '').replace(/"/g, '""')}"`;
    csv += `${idx + 1},${name},${city},${address},${phone}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tnp_tram_bao_hanh_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Đã xuất danh sách trạm bảo hành ra file Excel / CSV thành công!', 'success');
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
    contacting: { label: 'Đang tư vấn', class: 'badge-brand-hxy' },
    completed: { label: 'Đã hoàn tất', class: 'badge-success' },
    resolved: { label: 'Đã hoàn tất', class: 'badge-success' },
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
    await adminFetch(`/api/admin/contacts/${id}`, {
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
    await adminFetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
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
    await adminFetch('/api/admin/articles', {
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
    await adminFetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
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
      const response = await adminFetch('/api/admin/upload', {
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
    if (json.success && json.data) {
      const serverData = json.data;
      const defaultData = getDefaultHomepageConfig();

      // Đảm bảo không bị thiếu các khối bố cục chuẩn
      if (!serverData.layout || serverData.layout.length < defaultData.layout.length) {
        const existingIds = (serverData.layout || []).map(s => s.id);
        const missing = defaultData.layout.filter(s => !existingIds.includes(s.id));
        serverData.layout = [...(serverData.layout || []), ...missing];
        serverData.layout.forEach((s, idx) => { s.order = idx + 1; });
      }

      homepageConfig = serverData;

      // Đồng bộ bannersList từ heroBanners
      if (homepageConfig.heroBanners && homepageConfig.heroBanners.length > 0) {
        bannersList = [...homepageConfig.heroBanners];
        localStorage.setItem(STORAGE_BANNERS_KEY, JSON.stringify(bannersList));
      }

      localStorage.setItem(STORAGE_HOMEPAGE_KEY, JSON.stringify(homepageConfig));
      renderHomepageCMS();
      renderBannersTable();
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
          <button type="button" class="layout-nav-btn" title="Chỉnh sửa tên & mô tả khối" 
                  onclick="openEditLayoutSectionModal(${idx})">
            <i class="fas fa-pen"></i>
          </button>
          <button type="button" class="layout-nav-btn btn-del" title="Xóa khối khỏi trang chủ" 
                  onclick="deleteLayoutSection(${idx})" style="color: #ef4444;">
            <i class="fas fa-trash"></i>
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

function openAddLayoutSectionModal() {
  document.getElementById('layoutSecIndex').value = '';
  document.getElementById('layoutSecId').value = 'section-' + Date.now();
  document.getElementById('layoutSecName').value = '';
  document.getElementById('layoutSecDesc').value = '';
  document.getElementById('layoutSecEnabled').value = 'true';

  const titleEl = document.getElementById('modalLayoutTitle');
  if (titleEl) titleEl.innerHTML = '<i class="fas fa-plus-circle"></i> Thêm Khối Bố Cục Mới';

  const modal = document.getElementById('modalLayoutSection');
  if (modal) modal.classList.add('open');
}

function openEditLayoutSectionModal(index) {
  if (!homepageConfig || !homepageConfig.layout || !homepageConfig.layout[index]) return;
  const sec = homepageConfig.layout[index];

  document.getElementById('layoutSecIndex').value = index;
  document.getElementById('layoutSecId').value = sec.id || '';
  document.getElementById('layoutSecName').value = sec.name || '';
  document.getElementById('layoutSecDesc').value = sec.desc || '';
  document.getElementById('layoutSecEnabled').value = sec.enabled !== false ? 'true' : 'false';

  const titleEl = document.getElementById('modalLayoutTitle');
  if (titleEl) titleEl.innerHTML = '<i class="fas fa-pen"></i> Chỉnh Sửa Khối Bố Cục';

  const modal = document.getElementById('modalLayoutSection');
  if (modal) modal.classList.add('open');
}

function closeLayoutModal() {
  const modal = document.getElementById('modalLayoutSection');
  if (modal) modal.classList.remove('open');
}

function saveLayoutSectionForm(e) {
  e.preventDefault();
  const idxVal = document.getElementById('layoutSecIndex').value;
  const id = document.getElementById('layoutSecId').value.trim();
  const name = document.getElementById('layoutSecName').value.trim();
  const desc = document.getElementById('layoutSecDesc').value.trim();
  const enabled = document.getElementById('layoutSecEnabled').value === 'true';

  if (!id || !name) {
    alert('Vui lòng nhập đầy đủ mã ID và tên khối bố cục.');
    return;
  }

  if (!homepageConfig.layout) homepageConfig.layout = [];

  if (idxVal !== '') {
    const idx = parseInt(idxVal, 10);
    if (homepageConfig.layout[idx]) {
      homepageConfig.layout[idx].id = id;
      homepageConfig.layout[idx].name = name;
      homepageConfig.layout[idx].desc = desc;
      homepageConfig.layout[idx].enabled = enabled;
      showToast(`Đã cập nhật khối "${name}"`, 'success');
    }
  } else {
    homepageConfig.layout.push({
      id,
      name,
      desc,
      enabled,
      order: homepageConfig.layout.length + 1
    });
    showToast(`Đã thêm khối mới "${name}"`, 'success');
  }

  closeLayoutModal();
  renderLayoutManager();
  saveHomepageConfig();
}

function deleteLayoutSection(index) {
  if (!homepageConfig || !homepageConfig.layout || !homepageConfig.layout[index]) return;
  const sec = homepageConfig.layout[index];
  if (confirm(`Bạn có chắc chắn muốn xóa khối "${sec.name}" khỏi bố cục trang chủ?`)) {
    homepageConfig.layout.splice(index, 1);
    homepageConfig.layout.forEach((s, idx) => { s.order = idx + 1; });
    renderLayoutManager();
    showToast(`Đã xóa khối "${sec.name}"`, 'info');
    saveHomepageConfig();
  }
}

function resetLayoutDefault() {
  if (confirm('Khôi phục danh sách và thứ tự khối trang chủ về mặc định chuẩn?')) {
    const def = getDefaultHomepageConfig();
    homepageConfig.layout = def.layout;
    renderLayoutManager();
    showToast('Đã khôi phục bố cục trang chủ về mặc định.', 'success');
    saveHomepageConfig();
  }
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
  showToast('Đã đổi thứ tự khối và lưu áp dụng!', 'success');
  saveHomepageConfig();
}

function toggleLayoutSection(index, isChecked) {
  if (!homepageConfig.layout[index]) return;
  homepageConfig.layout[index].enabled = isChecked;
  renderLayoutManager();
  const secName = homepageConfig.layout[index].name;
  showToast((isChecked ? 'Đã BẬT: ' : 'Đã ẨN: ') + secName, 'info');
  // Tự động lưu ngay lập tức để đồng bộ realtime với trang chủ
  saveHomepageConfig();
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
          <button class="btn-icon" title="Chỉnh sửa slide" onclick="openEditBannerModal('${b.id}')">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn-icon btn-icon-delete" title="Xóa slide" onclick="deleteBanner('${b.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── 3. Brands Strip CMS ──
function renderCmsBrands() {
  const chipsContainer = document.getElementById('cmsBrandChipsList');
  const tbody = document.getElementById('cmsBrandsTableBody');
  const labelInput = document.getElementById('cmsBrandsLabel');
  if (!homepageConfig) return;

  if (homepageConfig.brandsStrip) {
    if (labelInput && homepageConfig.brandsStrip.label) {
      labelInput.value = homepageConfig.brandsStrip.label;
    }
  } else {
    homepageConfig.brandsStrip = { label: 'Thương hiệu đồng hành', brands: [] };
  }

  const brands = homepageConfig.brandsStrip.brands || [];

  // 1. Render chips nếu có container
  if (chipsContainer) {
    chipsContainer.innerHTML = brands.map((b, idx) => `
      <span class="badge-brand-chip">
        <span class="dot ${b.color || 'blue'}"></span>
        <span>${b.name}</span>
        <i class="fas fa-times badge-brand-chip-del" title="Xóa thương hiệu này" onclick="removeBrandChip(${idx})"></i>
      </span>
    `).join('');
  }

  // 2. Render bảng chi tiết với nút Sửa & Xóa
  if (tbody) {
    if (brands.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--adm-text-muted);">Chưa có thương hiệu nào. Nhấn "+ Thêm Thương Hiệu Mới" để tạo.</td></tr>`;
    } else {
      const colorNames = { blue: 'Xanh dương', red: 'Đỏ', green: 'Xanh lá', amber: 'Vàng hổ phách' };
      tbody.innerHTML = brands.map((b, idx) => `
        <tr>
          <td style="font-weight: 600; color: var(--adm-text-secondary); text-align: center;">${idx + 1}</td>
          <td><strong>${b.name}</strong></td>
          <td>
            <span class="dot ${b.color || 'blue'}" style="display:inline-block; vertical-align:middle; margin-right:6px;"></span>
            <span style="font-size: 12px; color: var(--adm-text-secondary);">${colorNames[b.color] || b.color}</span>
          </td>
          <td>
            <code style="font-size: 11.5px; color: #0284c7;">${b.link || '(Không gắn link)'}</code>
          </td>
          <td style="text-align: center;">
            <div class="action-btn-group" style="justify-content: center;">
              <button type="button" class="btn-icon" title="Chỉnh sửa thương hiệu" onclick="openEditBrandModal(${idx})">
                <i class="fas fa-pen"></i>
              </button>
              <button type="button" class="btn-icon btn-icon-delete" title="Xóa thương hiệu" onclick="removeBrandChip(${idx})">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }
}

function openAddBrandModal() {
  document.getElementById('brandIndex').value = '';
  document.getElementById('brandModalName').value = '';
  document.getElementById('brandModalColor').value = 'blue';
  document.getElementById('brandModalLink').value = '';

  const titleEl = document.getElementById('modalBrandTitle');
  if (titleEl) titleEl.innerHTML = '<i class="fas fa-plus-circle"></i> Thêm Thương Hiệu Đối Tác Mới';

  const modal = document.getElementById('modalBrand');
  if (modal) modal.classList.add('open');
}

function openEditBrandModal(index) {
  if (!homepageConfig || !homepageConfig.brandsStrip || !homepageConfig.brandsStrip.brands[index]) return;
  const b = homepageConfig.brandsStrip.brands[index];

  document.getElementById('brandIndex').value = index;
  document.getElementById('brandModalName').value = b.name || '';
  document.getElementById('brandModalColor').value = b.color || 'blue';
  document.getElementById('brandModalLink').value = b.link || '';

  const titleEl = document.getElementById('modalBrandTitle');
  if (titleEl) titleEl.innerHTML = '<i class="fas fa-pen"></i> Chỉnh Sửa Thương Hiệu';

  const modal = document.getElementById('modalBrand');
  if (modal) modal.classList.add('open');
}

function closeBrandModal() {
  const modal = document.getElementById('modalBrand');
  if (modal) modal.classList.remove('open');
}

function saveBrandModalForm(e) {
  e.preventDefault();
  const idxVal = document.getElementById('brandIndex').value;
  const name = document.getElementById('brandModalName').value.trim();
  const color = document.getElementById('brandModalColor').value || 'blue';
  const link = document.getElementById('brandModalLink').value.trim();

  if (!name) {
    alert('Vui lòng nhập tên thương hiệu.');
    return;
  }

  if (!homepageConfig.brandsStrip) homepageConfig.brandsStrip = { label: 'Thương hiệu đồng hành', brands: [] };

  if (idxVal !== '') {
    const idx = parseInt(idxVal, 10);
    if (homepageConfig.brandsStrip.brands[idx]) {
      homepageConfig.brandsStrip.brands[idx] = { name, color, link };
      showToast(`Đã cập nhật thương hiệu "${name}"`, 'success');
    }
  } else {
    homepageConfig.brandsStrip.brands.push({ name, color, link });
    showToast(`Đã thêm thương hiệu "${name}"`, 'success');
  }

  closeBrandModal();
  renderCmsBrands();
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

    renderDeepdiveFeaturesInputs('cmsHxyFeaturesWrap', bd.hxy.features || [], 'hxy');
    renderDeepdiveModels('hxy');
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

    renderDeepdiveFeaturesInputs('cmsHikersFeaturesWrap', bd.hikers.features || [], 'hikers');
    renderDeepdiveModels('hikers');
  }
}

function renderDeepdiveFeaturesInputs(wrapId, features, brandKey) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;

  if (!features || features.length === 0) {
    wrap.innerHTML = `<p style="font-size: 12px; color: var(--adm-text-muted); margin: 6px 0;">Chưa có thế mạnh nào. Bấm "+ Thêm thế mạnh" để tạo.</p>`;
    return;
  }

  wrap.innerHTML = features.map((f, idx) => `
    <div style="background: #f8fafc; border: 1px solid var(--adm-border); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 8px;">
      <div style="display: flex; gap: 8px; margin-bottom: 6px; align-items: center;">
        <input type="text" class="form-control feat-icon-${brandKey}" value="${f.icon || 'fas fa-tv'}" placeholder="Icon fa" style="width: 140px; font-size: 12px;">
        <input type="text" class="form-control feat-title-${brandKey}" value="${f.title || ''}" placeholder="Tiêu đề thế mạnh" style="flex: 1; font-weight: 600; font-size: 12.5px;">
        <button type="button" class="btn-icon btn-icon-delete" title="Xóa thế mạnh này" onclick="deleteDeepdiveFeature('${brandKey}', ${idx})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      <textarea class="form-control feat-desc-${brandKey}" rows="2" placeholder="Mô tả chi tiết" style="font-size: 12px;">${f.desc || ''}</textarea>
    </div>
  `).join('');
}

function addDeepdiveFeature(brandKey) {
  collectCmsDeepdiveForm();
  if (!homepageConfig.brandDeepdive) homepageConfig.brandDeepdive = {};
  if (!homepageConfig.brandDeepdive[brandKey]) homepageConfig.brandDeepdive[brandKey] = {};
  if (!homepageConfig.brandDeepdive[brandKey].features) homepageConfig.brandDeepdive[brandKey].features = [];

  homepageConfig.brandDeepdive[brandKey].features.push({
    icon: 'fas fa-check-circle',
    title: 'Thế mạnh công nghệ mới',
    desc: 'Mô tả chi tiết công nghệ, tính năng hoặc giải pháp nổi bật...'
  });

  const wrapId = brandKey === 'hxy' ? 'cmsHxyFeaturesWrap' : 'cmsHikersFeaturesWrap';
  renderDeepdiveFeaturesInputs(wrapId, homepageConfig.brandDeepdive[brandKey].features, brandKey);
}

function deleteDeepdiveFeature(brandKey, index) {
  collectCmsDeepdiveForm();
  if (!homepageConfig.brandDeepdive || !homepageConfig.brandDeepdive[brandKey] || !homepageConfig.brandDeepdive[brandKey].features) return;
  homepageConfig.brandDeepdive[brandKey].features.splice(index, 1);
  const wrapId = brandKey === 'hxy' ? 'cmsHxyFeaturesWrap' : 'cmsHikersFeaturesWrap';
  renderDeepdiveFeaturesInputs(wrapId, homepageConfig.brandDeepdive[brandKey].features, brandKey);
  showToast('Đã xóa thế mạnh.', 'info');
}

// TV Models Tag CRUD
function renderDeepdiveModels(brandKey) {
  const wrapId = brandKey === 'hxy' ? 'cmsHxyModelsWrap' : 'cmsHikersModelsWrap';
  const wrap = document.getElementById(wrapId);
  if (!wrap || !homepageConfig || !homepageConfig.brandDeepdive) return;
  const brand = homepageConfig.brandDeepdive[brandKey];
  const models = (brand && brand.models) ? brand.models : [];

  if (models.length === 0) {
    wrap.innerHTML = `<span style="font-size: 12px; color: var(--adm-text-muted);">Chưa có Model TV nào. Nhấn "+ Thêm Model TV" để tạo tag.</span>`;
    return;
  }

  wrap.innerHTML = models.map((m, idx) => `
    <span class="badge" style="background: #ffffff; border: 1px solid var(--adm-border); color: var(--adm-text); font-size: 12px; padding: 6px 10px; display: inline-flex; align-items: center; gap: 6px; border-radius: 20px;">
      <i class="fas fa-tv" style="color: ${brandKey === 'hxy' ? 'var(--hxy-blue)' : 'var(--hikers-red)'};"></i>
      <strong>${m.name}</strong>
      ${m.id ? `<small style="color: #64748b;">(${m.id})</small>` : ''}
      <i class="fas fa-pen" style="cursor: pointer; color: #0284c7; margin-left: 4px;" title="Sửa Model" onclick="openEditTvModelModal('${brandKey}', ${idx})"></i>
      <i class="fas fa-times" style="cursor: pointer; color: #ef4444;" title="Xóa Model" onclick="deleteTvModel('${brandKey}', ${idx})"></i>
    </span>
  `).join('');
}

function openAddTvModelModal(brandKey) {
  document.getElementById('tvModelBrandKey').value = brandKey;
  document.getElementById('tvModelIndex').value = '';
  document.getElementById('tvModelName').value = '';
  document.getElementById('tvModelProductId').value = '';

  const titleEl = document.getElementById('modalTvModelTitle');
  if (titleEl) titleEl.innerHTML = `<i class="fas fa-tv"></i> Thêm Model TV (${brandKey.toUpperCase()})`;

  const modal = document.getElementById('modalTvModel');
  if (modal) modal.classList.add('open');
}

function openEditTvModelModal(brandKey, index) {
  if (!homepageConfig.brandDeepdive || !homepageConfig.brandDeepdive[brandKey] || !homepageConfig.brandDeepdive[brandKey].models) return;
  const m = homepageConfig.brandDeepdive[brandKey].models[index];
  if (!m) return;

  document.getElementById('tvModelBrandKey').value = brandKey;
  document.getElementById('tvModelIndex').value = index;
  document.getElementById('tvModelName').value = m.name || '';
  document.getElementById('tvModelProductId').value = m.id || '';

  const titleEl = document.getElementById('modalTvModelTitle');
  if (titleEl) titleEl.innerHTML = `<i class="fas fa-edit"></i> Chỉnh Sửa Model TV (${brandKey.toUpperCase()})`;

  const modal = document.getElementById('modalTvModel');
  if (modal) modal.classList.add('open');
}

function closeTvModelModal() {
  const modal = document.getElementById('modalTvModel');
  if (modal) modal.classList.remove('open');
}

function saveTvModelForm(e) {
  e.preventDefault();
  const brandKey = document.getElementById('tvModelBrandKey').value;
  const idxVal = document.getElementById('tvModelIndex').value;
  const name = document.getElementById('tvModelName').value.trim();
  const id = document.getElementById('tvModelProductId').value.trim();

  if (!name) {
    alert('Vui lòng nhập tên hiển thị Model TV.');
    return;
  }

  if (!homepageConfig.brandDeepdive) homepageConfig.brandDeepdive = {};
  if (!homepageConfig.brandDeepdive[brandKey]) homepageConfig.brandDeepdive[brandKey] = {};
  if (!homepageConfig.brandDeepdive[brandKey].models) homepageConfig.brandDeepdive[brandKey].models = [];

  const modelObj = { id: id || `model-${Date.now()}`, name };

  if (idxVal !== '') {
    const idx = parseInt(idxVal, 10);
    homepageConfig.brandDeepdive[brandKey].models[idx] = modelObj;
    showToast(`Đã cập nhật model "${name}"`, 'success');
  } else {
    homepageConfig.brandDeepdive[brandKey].models.push(modelObj);
    showToast(`Đã thêm model "${name}"`, 'success');
  }

  closeTvModelModal();
  renderDeepdiveModels(brandKey);
}

function deleteTvModel(brandKey, index) {
  if (!homepageConfig.brandDeepdive || !homepageConfig.brandDeepdive[brandKey] || !homepageConfig.brandDeepdive[brandKey].models) return;
  const m = homepageConfig.brandDeepdive[brandKey].models[index];
  if (confirm(`Bạn có chắc chắn muốn xóa model tag "${m.name}"?`)) {
    homepageConfig.brandDeepdive[brandKey].models.splice(index, 1);
    renderDeepdiveModels(brandKey);
    showToast('Đã xóa model tag.', 'info');
  }
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

  const rows = ct.rows || [];
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: var(--adm-text-muted);">Chưa có tiêu chí so sánh nào. Nhấn "+ Thêm tiêu chí" để tạo.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((r, idx) => `
    <tr>
      <td><textarea class="cmp-criteria" rows="2" style="font-weight: 600;">${r.criteria || ''}</textarea></td>
      <td><textarea class="cmp-hxy" rows="2">${r.hxy || ''}</textarea></td>
      <td><textarea class="cmp-hikers" rows="2">${r.hikers || ''}</textarea></td>
      <td style="text-align: center;">
        <div class="action-btn-group" style="justify-content: center;">
          <button type="button" class="btn-icon" onclick="moveCompareRow(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="Di chuyển lên">
            <i class="fas fa-arrow-up"></i>
          </button>
          <button type="button" class="btn-icon" onclick="moveCompareRow(${idx}, 1)" ${idx === rows.length - 1 ? 'disabled' : ''} title="Di chuyển xuống">
            <i class="fas fa-arrow-down"></i>
          </button>
          <button type="button" class="btn-icon btn-icon-delete" onclick="deleteCompareRow(${idx})" title="Xóa dòng tiêu chí này">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function addCompareRow() {
  if (!homepageConfig.comparisonTable) homepageConfig.comparisonTable = { rows: [] };
  collectCmsCompareForm();
  homepageConfig.comparisonTable.rows.push({
    criteria: 'Tiêu chí so sánh mới',
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

function moveCompareRow(index, direction) {
  collectCmsCompareForm();
  const targetIndex = index + direction;
  const rows = homepageConfig.comparisonTable.rows || [];
  if (targetIndex < 0 || targetIndex >= rows.length) return;

  const temp = rows[index];
  rows[index] = rows[targetIndex];
  rows[targetIndex] = temp;

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
  if (stats.length === 0) {
    wrap.innerHTML = `<p style="color: var(--adm-text-muted); padding: 15px;">Chưa có chỉ số nào. Nhấn "+ Thêm chỉ số thống kê" để tạo.</p>`;
    return;
  }

  wrap.innerHTML = stats.map((s, idx) => `
    <div class="cms-card-box" style="flex: 1; min-width: 220px; position: relative;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-weight: 700; font-size: 13px; color: var(--adm-accent);">Chỉ số #${idx + 1}</span>
        <button type="button" class="btn-icon btn-icon-delete" title="Xóa chỉ số này" onclick="deleteStatItem(${idx})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      <div class="form-group" style="margin-bottom: 8px;">
        <label class="form-label" style="font-size: 12px;">Số liệu hiển thị</label>
        <input type="text" class="form-control cms-stat-num" value="${s.number || ''}" placeholder="VD: 80-100, 63, 100%">
      </div>
      <div class="form-group" style="margin-bottom: 0;">
        <label class="form-label" style="font-size: 12px;">Nhãn mô tả</label>
        <input type="text" class="form-control cms-stat-lbl" value="${s.label || ''}" placeholder="VD: Trạm bảo hành toàn quốc">
      </div>
    </div>
  `).join('');
}

function addStatItem() {
  collectCmsStats();
  if (!homepageConfig.stats) homepageConfig.stats = [];
  homepageConfig.stats.push({
    number: '100+',
    label: 'Chỉ số mới'
  });
  renderCmsStats();
}

function deleteStatItem(index) {
  collectCmsStats();
  if (!homepageConfig.stats) return;
  homepageConfig.stats.splice(index, 1);
  renderCmsStats();
  showToast('Đã xóa chỉ số thống kê.', 'info');
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

  if (!homepageConfig) return;
  const fp = homepageConfig.featuredProducts || { productIds: [] };

  if (badgeEl && fp.badge) badgeEl.value = fp.badge;
  if (titleEl && fp.title) titleEl.value = fp.title;
  if (descEl && fp.desc) descEl.value = fp.desc;

  // Render danh sách các sản phẩm đang được ghim (có thứ tự & nút xóa)
  renderPinnedFeaturedList();

  if (!grid) return;
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

function renderPinnedFeaturedList() {
  const container = document.getElementById('cmsPinnedProductsList');
  if (!container || !homepageConfig) return;

  const fp = homepageConfig.featuredProducts || { productIds: [] };
  const pinnedIds = fp.productIds || [];

  if (pinnedIds.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 15px; color: var(--adm-text-muted); background: #f8fafc; border-radius: var(--radius-sm); font-size: 13px;">Chưa có sản phẩm TV nào được ghim. Hãy tích chọn sản phẩm ở danh sách dưới.</div>`;
    return;
  }

  container.innerHTML = pinnedIds.map((pid, idx) => {
    const p = (productsList || []).find(prod => String(prod.id) === String(pid)) || {
      id: pid,
      name: `Sản phẩm (${pid})`,
      brand: 'TV',
      model: pid,
      thumbnail: '../images/products/placeholder.svg'
    };

    const isFirst = idx === 0;
    const isLast = idx === pinnedIds.length - 1;

    return `
      <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid var(--adm-border); border-radius: var(--radius-sm); padding: 8px 12px; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <span style="font-weight: 700; color: var(--adm-accent); font-size: 13px; min-width: 24px;">#${idx + 1}</span>
          <img src="${p.thumbnail || '../images/products/placeholder.svg'}" alt="${p.name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 4px; border: 1px solid var(--adm-border);" onerror="this.src='../images/products/placeholder.svg'">
          <div style="min-width: 0;">
            <div style="font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
            <div style="font-size: 11px; color: #64748b;">${p.brand} · ${p.model || ''}</div>
          </div>
        </div>
        <div class="action-btn-group" style="flex-shrink: 0;">
          <button type="button" class="btn-icon" title="Đẩy lên trước" onclick="movePinnedProduct(${idx}, -1)" ${isFirst ? 'disabled' : ''}>
            <i class="fas fa-arrow-up"></i>
          </button>
          <button type="button" class="btn-icon" title="Đẩy xuống sau" onclick="movePinnedProduct(${idx}, 1)" ${isLast ? 'disabled' : ''}>
            <i class="fas fa-arrow-down"></i>
          </button>
          <button type="button" class="btn-icon btn-icon-delete" title="Bỏ ghim (Xóa khỏi nổi bật)" onclick="unpinFeaturedProduct('${pid}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function movePinnedProduct(index, direction) {
  if (!homepageConfig.featuredProducts || !homepageConfig.featuredProducts.productIds) return;
  const ids = homepageConfig.featuredProducts.productIds;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= ids.length) return;

  const temp = ids[index];
  ids[index] = ids[targetIndex];
  ids[targetIndex] = temp;

  renderCmsFeaturedPicker();
}

function unpinFeaturedProduct(productId) {
  if (!homepageConfig.featuredProducts || !homepageConfig.featuredProducts.productIds) return;
  homepageConfig.featuredProducts.productIds = homepageConfig.featuredProducts.productIds.filter(id => String(id) !== String(productId));
  renderCmsFeaturedPicker();
  showToast('Đã bỏ ghim sản phẩm khỏi trang chủ.', 'info');
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
    const res = await adminFetch('/api/admin/homepage', {
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

// ══════════════════════════════════════════════
//  ANALYTICS ENGINE & CHART.JS RENDERING
// ══════════════════════════════════════════════
let analyticsData = null;
let trafficChartInstance = null;
let currentAnalyticsDays = 7;

async function loadAnalyticsData() {
  const refreshIcon = document.getElementById('analyticsRefreshIcon');
  if (refreshIcon) refreshIcon.classList.add('fa-spin');

  try {
    const res = await adminFetch(`/api/admin/analytics?_t=${Date.now()}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        analyticsData = json.data;
        renderAnalyticsUI(analyticsData);
      }
    }
  } catch (err) {
    console.warn('Không thể tải analytics từ server:', err);
  } finally {
    if (refreshIcon) {
      setTimeout(() => refreshIcon.classList.remove('fa-spin'), 500);
    }
  }
}

function renderAnalyticsUI(data) {
  if (!data) return;

  // 1. Cập nhật 4 thẻ thống kê
  const today = data.today || { views: 0, uniques: 0, diffPercent: 0 };
  const statTodayViews = document.getElementById('statTodayViews');
  const statTodayUniques = document.getElementById('statTodayUniques');
  const statTodayTrend = document.getElementById('statTodayTrend');
  const stat7DaysViews = document.getElementById('stat7DaysViews');
  const statMonthViews = document.getElementById('statMonthViews');
  const statTotalViews = document.getElementById('statTotalViews');

  if (statTodayViews) statTodayViews.textContent = (today.views || 0).toLocaleString('vi-VN');
  if (statTodayUniques) statTodayUniques.textContent = (today.uniques || 0).toLocaleString('vi-VN');
  if (statTodayTrend) {
    const isUp = (today.diffPercent || 0) >= 0;
    statTodayTrend.className = `stat-trend ${isUp ? 'trend-up' : 'trend-down'}`;
    statTodayTrend.innerHTML = `<i class="fas fa-arrow-${isUp ? 'up' : 'down'}"></i> ${Math.abs(today.diffPercent || 0)}%`;
  }
  if (stat7DaysViews) stat7DaysViews.textContent = (data.last7Days || 0).toLocaleString('vi-VN');
  if (statMonthViews) statMonthViews.textContent = (data.thisMonth || 0).toLocaleString('vi-VN');
  if (statTotalViews) statTotalViews.textContent = (data.totalVisits || 0).toLocaleString('vi-VN');

  // 2. Vẽ biểu đồ biến động
  renderTrafficChart(currentAnalyticsDays === 7 ? data.history7Days : data.history30Days);

  // 3. Phân bổ thiết bị
  const devices = data.devices || { desktop: 0, mobile: 0, tablet: 0, desktopPercent: 0, mobilePercent: 0, tabletPercent: 0 };
  const mobPercent = devices.mobilePercent || 0;
  const dskPercent = devices.desktopPercent || 0;
  const tabPercent = devices.tabletPercent || 0;

  const mobBar = document.getElementById('deviceMobileBar');
  const dskBar = document.getElementById('deviceDesktopBar');
  const tabBar = document.getElementById('deviceTabletBar');

  if (mobBar) mobBar.style.width = `${mobPercent}%`;
  if (dskBar) dskBar.style.width = `${dskPercent}%`;
  if (tabBar) tabBar.style.width = `${tabPercent}%`;

  const mobPercentEl = document.getElementById('deviceMobilePercent');
  const dskPercentEl = document.getElementById('deviceDesktopPercent');
  const tabPercentEl = document.getElementById('deviceTabletPercent');

  if (mobPercentEl) mobPercentEl.textContent = `${mobPercent}%`;
  if (dskPercentEl) dskPercentEl.textContent = `${dskPercent}%`;
  if (tabPercentEl) tabPercentEl.textContent = `${tabPercent}%`;

  const mobCount = document.getElementById('deviceMobileCount');
  const dskCount = document.getElementById('deviceDesktopCount');
  const tabCount = document.getElementById('deviceTabletCount');

  if (mobCount) mobCount.textContent = `${(devices.mobile || 0).toLocaleString('vi-VN')} lượt xem`;
  if (dskCount) dskCount.textContent = `${(devices.desktop || 0).toLocaleString('vi-VN')} lượt xem`;
  if (tabCount) tabCount.textContent = `${(devices.tablet || 0).toLocaleString('vi-VN')} lượt xem`;

  // 4. Top trang xem nhiều nhất
  renderTopPagesTable(data.topPages || []);
}

function renderTrafficChart(history) {
  const canvas = document.getElementById('trafficChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const labels = (history || []).map(h => h.label || h.date);
  const viewsData = (history || []).map(h => h.views || 0);
  const uniquesData = (history || []).map(h => h.uniques || 0);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  if (trafficChartInstance) {
    trafficChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  
  const gradientViews = ctx.createLinearGradient(0, 0, 0, 240);
  gradientViews.addColorStop(0, 'rgba(37, 99, 235, 0.35)');
  gradientViews.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

  trafficChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Lượt xem trang (Pageviews)',
          data: viewsData,
          borderColor: '#2563eb',
          backgroundColor: gradientViews,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#2563eb',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Khách duy nhất (Unique Visitors)',
          data: uniquesData,
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [4, 4],
          tension: 0.35,
          fill: false,
          pointBackgroundColor: '#10b981',
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: textColor,
            font: { size: 12, family: 'Inter' },
            boxWidth: 12,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: isDark ? '#1e293b' : '#0f172a',
          titleColor: '#fff',
          bodyColor: '#cbd5e1',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          usePointStyle: true
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 11, family: 'Inter' } }
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 11, family: 'Inter' }, precision: 0 }
        }
      }
    }
  });
}

function switchAnalyticsTimeframe(days) {
  currentAnalyticsDays = days;
  const btn7 = document.getElementById('btnTf7');
  const btn30 = document.getElementById('btnTf30');
  if (btn7) btn7.classList.toggle('active', days === 7);
  if (btn30) btn30.classList.toggle('active', days === 30);

  if (analyticsData) {
    renderTrafficChart(days === 7 ? analyticsData.history7Days : analyticsData.history30Days);
  }
}

function renderTopPagesTable(pages) {
  const tbody = document.getElementById('topPagesTableBody');
  if (!tbody) return;

  if (!pages || pages.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--adm-text-muted);">Chưa có dữ liệu trang xem.</td></tr>`;
    return;
  }

  const maxViews = Math.max(...pages.map(p => p.views || 1), 1);

  tbody.innerHTML = pages.map((item, idx) => {
    const percent = Math.round((item.views / maxViews) * 100);
    return `
      <tr>
        <td><strong>${idx + 1}</strong></td>
        <td>
          <strong>${item.title || item.path}</strong>
        </td>
        <td>
          <code style="background: var(--adm-border-light); padding: 2px 6px; border-radius: 4px; font-size: 11.5px;">${item.path}</code>
        </td>
        <td style="text-align: right;">
          <strong style="color: var(--adm-accent);">${item.views.toLocaleString('vi-VN')}</strong> lượt
        </td>
        <td>
          <div class="device-progress-bg" style="height: 6px;">
            <div class="device-progress-bar" style="width: ${percent}%; background: var(--adm-accent);"></div>
          </div>
        </td>
        <td style="text-align: center;">
          <a href="..${item.path === '/' ? '/index.html' : item.path}" target="_blank" class="btn btn-secondary btn-sm" style="padding: 3px 8px;" title="Mở trang trong tab mới">
            <i class="fas fa-external-link-alt"></i>
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

// ══════════════════════════════════════════════
//  DARK / LIGHT THEME TOGGLE
// ══════════════════════════════════════════════
function initAdminTheme() {
  const savedTheme = localStorage.getItem('tnp_admin_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleAdminTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('tnp_admin_theme', next);
  updateThemeIcon(next);
  if (analyticsData) {
    renderTrafficChart(currentAnalyticsDays === 7 ? analyticsData.history7Days : analyticsData.history30Days);
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// ══════════════════════════════════════════════
//  QUICK SEARCH SPOTLIGHT (CTRL + K)
// ══════════════════════════════════════════════
function initQuickSearch() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openQuickSearchModal();
    }
    if (e.key === 'Escape') {
      closeQuickSearchModal();
    }
  });
}

function openQuickSearchModal() {
  const modal = document.getElementById('quickSearchModal');
  if (!modal) return;
  modal.classList.add('open');
  const input = document.getElementById('quickSearchInput');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 80);
  }
  handleQuickSearchInput('');
}

function closeQuickSearchModal() {
  const modal = document.getElementById('quickSearchModal');
  if (modal) modal.classList.remove('open');
}

function handleQuickSearchBackdropClick(e) {
  if (e.target.id === 'quickSearchModal') {
    closeQuickSearchModal();
  }
}

function handleQuickSearchInput(query) {
  const resultsContainer = document.getElementById('quickSearchResults');
  if (!resultsContainer) return;

  const q = (query || '').trim().toLowerCase();
  if (!q) {
    resultsContainer.innerHTML = `
      <div class="quicksearch-group-title">Lối tắt nhanh</div>
      <div class="quicksearch-item" onclick="quickNav('dashboard')">
        <div class="quicksearch-item-left">
          <div class="quicksearch-item-icon"><i class="fas fa-chart-pie"></i></div>
          <div>
            <div class="quicksearch-item-title">Tổng quan hệ thống &amp; Thống kê lưu lượng</div>
            <div class="quicksearch-item-sub">Xem báo cáo truy cập, tổng sản phẩm, số trạm</div>
          </div>
        </div>
        <i class="fas fa-arrow-right text-muted"></i>
      </div>
      <div class="quicksearch-item" onclick="quickNav('products')">
        <div class="quicksearch-item-left">
          <div class="quicksearch-item-icon"><i class="fas fa-tv"></i></div>
          <div>
            <div class="quicksearch-item-title">Danh sách TV HXY &amp; HIKERS</div>
            <div class="quicksearch-item-sub">Quản lý thêm, sửa giá, model, thông số</div>
          </div>
        </div>
        <i class="fas fa-arrow-right text-muted"></i>
      </div>
      <div class="quicksearch-item" onclick="quickNav('stations')">
        <div class="quicksearch-item-left">
          <div class="quicksearch-item-icon"><i class="fas fa-map-marker-alt"></i></div>
          <div>
            <div class="quicksearch-item-title">Mạng lưới Trạm bảo hành</div>
            <div class="quicksearch-item-sub">80 - 100 trạm trên 63 tỉnh thành</div>
          </div>
        </div>
        <i class="fas fa-arrow-right text-muted"></i>
      </div>
      <div class="quicksearch-item" onclick="quickNav('contacts')">
        <div class="quicksearch-item-left">
          <div class="quicksearch-item-icon"><i class="fas fa-headset"></i></div>
          <div>
            <div class="quicksearch-item-title">Yêu cầu liên hệ từ khách hàng</div>
            <div class="quicksearch-item-sub">Xem danh sách số điện thoại, xuất Excel</div>
          </div>
        </div>
        <i class="fas fa-arrow-right text-muted"></i>
      </div>
    `;
    return;
  }

  const matchedProducts = (productsList || []).filter(p => 
    (p.name && p.name.toLowerCase().includes(q)) ||
    (p.model && p.model.toLowerCase().includes(q)) ||
    (p.brand && p.brand.toLowerCase().includes(q))
  ).slice(0, 4);

  const matchedStations = (serviceCentersList || []).filter(s => 
    (s.name && s.name.toLowerCase().includes(q)) ||
    (s.city && s.city.toLowerCase().includes(q)) ||
    (s.address && s.address.toLowerCase().includes(q))
  ).slice(0, 4);

  const matchedArticles = (articlesList || []).filter(a => 
    (a.title && a.title.toLowerCase().includes(q)) ||
    (a.category && a.category.toLowerCase().includes(q))
  ).slice(0, 3);

  let html = '';

  if (matchedProducts.length > 0) {
    html += `<div class="quicksearch-group-title">Sản phẩm TV (${matchedProducts.length})</div>`;
    matchedProducts.forEach(p => {
      html += `
        <div class="quicksearch-item" onclick="quickNavProduct('${p.id}')">
          <div class="quicksearch-item-left">
            <div class="quicksearch-item-icon"><i class="fas fa-tv"></i></div>
            <div>
              <div class="quicksearch-item-title">${p.name}</div>
              <div class="quicksearch-item-sub">${p.brand} · ${p.model} · ${p.size} inch</div>
            </div>
          </div>
          <span class="badge ${p.brand === 'HXY' ? 'badge-brand-hxy' : 'badge-brand-hikers'}">${p.brand}</span>
        </div>
      `;
    });
  }

  if (matchedStations.length > 0) {
    html += `<div class="quicksearch-group-title">Trạm bảo hành (${matchedStations.length})</div>`;
    matchedStations.forEach(s => {
      html += `
        <div class="quicksearch-item" onclick="quickNavStation('${s.id}')">
          <div class="quicksearch-item-left">
            <div class="quicksearch-item-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div>
              <div class="quicksearch-item-title">${s.name}</div>
              <div class="quicksearch-item-sub">${s.city || s.province} · ${s.phone || 'TNP Care'}</div>
            </div>
          </div>
          <span class="badge badge-secondary">${s.city || 'Toàn quốc'}</span>
        </div>
      `;
    });
  }

  if (matchedArticles.length > 0) {
    html += `<div class="quicksearch-group-title">Bài viết &amp; Hướng dẫn (${matchedArticles.length})</div>`;
    matchedArticles.forEach(a => {
      html += `
        <div class="quicksearch-item" onclick="quickNavArticle('${a.id}')">
          <div class="quicksearch-item-left">
            <div class="quicksearch-item-icon"><i class="fas fa-newspaper"></i></div>
            <div>
              <div class="quicksearch-item-title">${a.title}</div>
              <div class="quicksearch-item-sub">${a.categoryLabel || 'Tin tức'} · ${a.date}</div>
            </div>
          </div>
          <i class="fas fa-arrow-right text-muted"></i>
        </div>
      `;
    });
  }

  if (!html) {
    html = `<div class="quicksearch-empty">Không tìm thấy kết quả nào phù hợp với từ khóa "<strong>${query}</strong>"</div>`;
  }

  resultsContainer.innerHTML = html;
}

function quickNav(tabId) {
  closeQuickSearchModal();
  switchTab(tabId);
}

function quickNavProduct(prodId) {
  closeQuickSearchModal();
  switchTab('products');
  setTimeout(() => {
    openEditProductModal(prodId);
  }, 120);
}

function quickNavStation(stationId) {
  closeQuickSearchModal();
  switchTab('stations');
  setTimeout(() => {
    const sInput = document.querySelector('#tab-stations .search-input-wrap input');
    const s = serviceCentersList.find(x => x.id === stationId);
    if (sInput && s) {
      sInput.value = s.name;
      filterStations(s.name);
    }
  }, 120);
}

function quickNavArticle(artId) {
  closeQuickSearchModal();
  switchTab('articles');
  setTimeout(() => {
    openEditArticleModal(artId);
  }, 120);
}

// ══════════════════════════════════════════════
//  BACKUP, RESTORE & SYSTEM STATUS
// ══════════════════════════════════════════════
async function downloadBackupJson() {
  try {
    showToast('Đang tạo bản sao lưu dữ liệu hệ thống...', 'info');
    const res = await adminFetch('/api/admin/backup');
    if (!res.ok) throw new Error('Backup failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tnp_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Đã tải về bản sao lưu toàn bộ cơ sở dữ liệu thành công!', 'success');
  } catch (err) {
    showToast('Lỗi khi tải bản sao lưu!', 'error');
  }
}

function triggerRestoreUpload() {
  const input = document.getElementById('restoreFileInput');
  if (input) input.click();
}

async function handleRestoreFileSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!confirm(`Bạn có chắc chắn muốn khôi phục dữ liệu từ tệp "${file.name}"? Dữ liệu hiện tại sẽ được cập nhật đồng bộ.`)) {
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const backupData = JSON.parse(e.target.result);
      const res = await adminFetch('/api/admin/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup: backupData })
      });
      const json = await res.json();
      if (json.success) {
        showToast('Đã khôi phục cơ sở dữ liệu thành công! Đang làm mới trang...', 'success');
        setTimeout(() => window.location.reload(), 1400);
      } else {
        showToast(json.message || 'Lỗi khôi phục dữ liệu!', 'error');
      }
    } catch (err) {
      showToast('Tệp sao lưu không hợp lệ hoặc lỗi định dạng JSON!', 'error');
    }
  };
  reader.readAsText(file);
}

async function checkSystemStatus() {
  try {
    const res = await fetch('/api/status');
    if (res.ok) {
      const json = await res.json();
      const statusEl = document.getElementById('topbarDbStatus');
      if (statusEl) {
        if (json.database === 'mongodb_atlas') {
          statusEl.textContent = 'Cloud Atlas Online';
        } else {
          statusEl.textContent = 'Local JSON Online';
        }
      }
    }
  } catch (err) {}
}

// ══════════════════════════════════════════════
//  ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSIONS
// ══════════════════════════════════════════════
function getRoleBadge(role) {
  switch (role) {
    case 'superadmin':
      return '<span class="badge" style="background:#fee2e2;color:#b91c1c;font-weight:600;"><i class="fas fa-crown"></i> Super Admin</span>';
    case 'station_manager':
      return '<span class="badge" style="background:#dbeafe;color:#1d4ed8;font-weight:600;"><i class="fas fa-tools"></i> Quản lý Trạm</span>';
    case 'editor':
      return '<span class="badge" style="background:#f3e8ff;color:#7e22ce;font-weight:600;"><i class="fas fa-feather-alt"></i> Biên tập viên</span>';
    case 'support':
      return '<span class="badge" style="background:#dcfce7;color:#15803d;font-weight:600;"><i class="fas fa-headset"></i> CSKH & Hỗ trợ</span>';
    default:
      return `<span class="badge" style="background:#f1f5f9;color:#475569;">${role || 'Thành viên'}</span>`;
  }
}

function applyRolePermissions(role) {
  const roleTabs = {
    superadmin: ['dashboard', 'products', 'stations', 'banners', 'articles', 'contacts', 'users', 'settings'],
    station_manager: ['dashboard', 'products', 'stations'],
    editor: ['dashboard', 'banners', 'articles'],
    support: ['dashboard', 'contacts']
  };

  const allowedTabs = roleTabs[role] || ['dashboard'];

  // Ẩn / hiện các mục trong sidebar theo quyền hạn
  document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
    const tabName = item.getAttribute('data-tab');
    if (allowedTabs.includes(tabName)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });

  // Nếu tab hiện tại không được phép, chuyển về dashboard an toàn
  if (!allowedTabs.includes(currentTab)) {
    switchTab('dashboard');
  }
}

// ══════════════════════════════════════════════
//  QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN (USERS CRUD)
// ══════════════════════════════════════════════
let usersList = [];

async function loadUsersList() {
  const tbody = document.getElementById('usersTableBody');
  const icon = document.getElementById('usersRefreshIcon');
  if (icon) icon.classList.add('fa-spin');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 32px;"><i class="fas fa-spinner fa-spin"></i> Đang nạp danh sách tài khoản...</td></tr>';
  }

  try {
    const res = await adminFetch('/api/admin/users');
    const data = await res.json();
    if (res.ok && data.success) {
      usersList = data.data || [];
      renderUsersTable();
      const badge = document.getElementById('badgeUsersCount');
      if (badge) badge.textContent = usersList.length;
    } else {
      if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #dc2626; padding: 24px;">${data.message || 'Bạn không có quyền xem danh sách này.'}</td></tr>`;
    }
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #dc2626; padding: 24px;">Lỗi kết nối máy chủ khi nạp tài khoản.</td></tr>';
  } finally {
    if (icon) icon.classList.remove('fa-spin');
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  if (usersList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--adm-text-muted); padding: 32px;">Chưa có tài khoản người dùng nào.</td></tr>';
    return;
  }

  const authData = localStorage.getItem('tnp_admin_auth');
  let currentUserId = '';
  if (authData) {
    try { currentUserId = JSON.parse(authData)?.user?.id || ''; } catch (e) {}
  }

  tbody.innerHTML = usersList.map((user, idx) => {
    const roleBadge = getRoleBadge(user.role);
    const isSelf = user.id === currentUserId;
    const isLocked = user.status === 'locked';
    const statusBadge = isLocked
      ? '<span class="badge" style="background:#fee2e2;color:#dc2626;font-weight:600;"><i class="fas fa-lock"></i> Đã khóa</span>'
      : '<span class="badge" style="background:#dcfce7;color:#16a34a;font-weight:600;"><i class="fas fa-check-circle"></i> Hoạt động</span>';

    const lastLoginText = user.lastLogin 
      ? new Date(user.lastLogin).toLocaleString('vi-VN')
      : '<span style="color: var(--adm-text-muted); font-style: italic;">Chưa từng</span>';

    return `
      <tr>
        <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="user-avatar" style="width: 34px; height: 34px; font-size: 13px; background: ${user.role === 'superadmin' ? '#ef4444' : 'var(--adm-accent)'};">
              ${(user.fullName || user.username).substring(0, 2).toUpperCase()}
            </div>
            <div>
              <strong style="color: var(--adm-text); font-size: 14px;">${user.fullName}</strong>
              ${isSelf ? '<span style="margin-left: 6px; font-size: 11px; background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Bạn</span>' : ''}
            </div>
          </div>
        </td>
        <td><code style="font-size: 13px; color: var(--adm-accent); font-weight: 600;">${user.username}</code></td>
        <td><span style="font-size: 13px; color: var(--adm-text-secondary);">${user.email}</span></td>
        <td>${roleBadge}</td>
        <td>${statusBadge}</td>
        <td style="font-size: 12px; color: var(--adm-text-secondary);">${lastLoginText}</td>
        <td style="text-align: center;">
          <div style="display: flex; justify-content: center; gap: 6px;">
            <button class="btn btn-secondary btn-sm" onclick="openEditUserModal('${user.id}')" title="Sửa thông tin hoặc đổi mật khẩu">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}', '${user.username}')" title="Xóa tài khoản" ${isSelf ? 'disabled style="opacity: 0.35; cursor: not-allowed;"' : ''}>
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddUserModal() {
  document.getElementById('modalUserTitle').innerHTML = '<i class="fas fa-user-plus"></i> Thêm Tài Khoản Quản Trị Mới';
  document.getElementById('userId').value = '';
  document.getElementById('userFullName').value = '';
  document.getElementById('userUsername').value = '';
  document.getElementById('userUsername').readOnly = false;
  document.getElementById('userEmail').value = '';
  document.getElementById('userPassword').value = '';
  document.getElementById('userPassword').required = true;
  document.getElementById('userPasswordLabel').textContent = 'Mật khẩu khởi tạo * (tối thiểu 6 ký tự)';
  document.getElementById('userPasswordHelp').style.display = 'none';
  document.getElementById('userRole').value = 'editor';
  document.getElementById('userStatus').value = 'active';

  document.getElementById('modalUser').classList.add('open');
}

function openEditUserModal(id) {
  const user = usersList.find(u => u.id === id);
  if (!user) return;

  document.getElementById('modalUserTitle').innerHTML = '<i class="fas fa-user-edit"></i> Chỉnh Sửa Tài Khoản';
  document.getElementById('userId').value = user.id;
  document.getElementById('userFullName').value = user.fullName || '';
  document.getElementById('userUsername').value = user.username || '';
  document.getElementById('userUsername').readOnly = true;
  document.getElementById('userEmail').value = user.email || '';
  document.getElementById('userPassword').value = '';
  document.getElementById('userPassword').required = false;
  document.getElementById('userPasswordLabel').textContent = 'Đổi mật khẩu mới (nếu muốn)';
  document.getElementById('userPasswordHelp').style.display = 'block';
  document.getElementById('userRole').value = user.role || 'editor';
  document.getElementById('userStatus').value = user.status || 'active';

  document.getElementById('modalUser').classList.add('open');
}

function closeUserModal() {
  document.getElementById('modalUser').classList.remove('open');
}

async function saveUserForm(e) {
  e.preventDefault();
  const id = document.getElementById('userId').value;
  const fullName = document.getElementById('userFullName').value.trim();
  const username = document.getElementById('userUsername').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const password = document.getElementById('userPassword').value;
  const role = document.getElementById('userRole').value;
  const status = document.getElementById('userStatus').value;

  const btn = document.getElementById('btnSaveUser');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

  try {
    let res;
    if (!id) {
      if (password.length < 6) {
        showToast('Mật khẩu phải từ 6 ký tự trở lên!', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Lưu tài khoản';
        return;
      }
      res = await adminFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, username, email, password, role, status })
      });
    } else {
      const payload = { fullName, email, role, status };
      if (password && password.trim().length >= 6) {
        payload.password = password.trim();
      }
      res = await adminFetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message || 'Lưu tài khoản thành công!', 'success');
      closeUserModal();
      loadUsersList();
    } else {
      showToast(data.message || 'Lỗi lưu tài khoản!', 'error');
    }
  } catch (err) {
    showToast(err.message || 'Lỗi kết nối máy chủ!', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check"></i> Lưu tài khoản';
  }
}

async function deleteUser(id, username) {
  if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản [${username}]? Thao tác này không thể hoàn tác!`)) {
    return;
  }

  try {
    const res = await adminFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message || 'Đã xóa tài khoản thành công!', 'success');
      loadUsersList();
    } else {
      showToast(data.message || 'Không thể xóa tài khoản này!', 'error');
    }
  } catch (err) {
    showToast(err.message || 'Lỗi xóa tài khoản!', 'error');
  }
}

// ══════════════════════════════════════════════
//  ĐỔI MẬT KHẨU CÁ NHÂN (CHANGE PASSWORD)
// ══════════════════════════════════════════════
function openChangePasswordModal() {
  document.getElementById('cpOldPassword').value = '';
  document.getElementById('cpNewPassword').value = '';
  document.getElementById('cpConfirmPassword').value = '';
  document.getElementById('modalChangePassword').classList.add('open');
}

function closeChangePasswordModal() {
  document.getElementById('modalChangePassword').classList.remove('open');
}

async function saveChangePasswordForm(e) {
  e.preventDefault();
  const oldPassword = document.getElementById('cpOldPassword').value;
  const newPassword = document.getElementById('cpNewPassword').value;
  const confirmPassword = document.getElementById('cpConfirmPassword').value;

  if (newPassword !== confirmPassword) {
    showToast('Xác nhận mật khẩu mới không khớp!', 'error');
    return;
  }
  if (newPassword.length < 6) {
    showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
    return;
  }

  const btn = document.getElementById('btnSaveChangePassword');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đổi mật khẩu...';

  try {
    const res = await adminFetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.', 'success');
      closeChangePasswordModal();
    } else {
      showToast(data.message || 'Mật khẩu cũ không chính xác!', 'error');
    }
  } catch (err) {
    showToast(err.message || 'Lỗi máy chủ khi đổi mật khẩu!', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check"></i> Cập nhật mật khẩu';
  }
}

function toggleModalPwdVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

