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

// Storage keys
const STORAGE_PRODUCTS_KEY = 'tnp_admin_products_override';
const STORAGE_STATIONS_KEY = 'tnp_admin_stations_override';
const STORAGE_BANNERS_KEY = 'tnp_admin_banners_override';
const STORAGE_ARTICLES_KEY = 'tnp_admin_articles_override';
const ADMIN_SESSION_TTL_MS = 5 * 60 * 1000;

// ══════════════════════════════════════════════
//  AUTH GUARD & TOKEN REQUEST WRAPPER
// ══════════════════════════════════════════════
function getStoredAdminAuth() {
  try {
    const authData = localStorage.getItem('tnp_admin_auth');
    if (!authData) return null;
    const auth = JSON.parse(authData);
    const expiresAt = Number(auth?.expiresAt) || (new Date(auth?.loginAt || 0).getTime() + ADMIN_SESSION_TTL_MS);
    if (!auth?.token || !Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
      localStorage.removeItem('tnp_admin_auth');
      return null;
    }
    return { ...auth, expiresAt };
  } catch (e) {
    localStorage.removeItem('tnp_admin_auth');
    return null;
  }
}

function getAdminToken() {
  return getStoredAdminAuth()?.token || '';
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
  const auth = getStoredAdminAuth();
  if (!auth) {
    window.location.replace('./login.html');
    return false;
  }
  try {
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
  scheduleAdminSessionExpiry();
  initAdminTheme();
  initNavigation();
  initSidebarMobile();
  loadData();
  renderAll();
  fetchContactsFromServer();
  loadAnalyticsData();
  checkSystemStatus();
  loadDashboardSummaryStats();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) checkAdminAuth();
});

// ── Navigation tabs ──
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-tab]');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');
      switchTab(targetTab);

      // Close mobile sidebar if open
      document.querySelector('.admin-sidebar').classList.remove('open');
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
    products: 'Quản lý Sản phẩm TV',
    stations: 'Quản lý Trạm bảo hành',
    banners: 'Quản lý Banner & Hero Slide',
    articles: 'Quản lý Bài viết & Hướng dẫn kỹ thuật',
    contacts: 'Yêu cầu tư vấn & Liên hệ',
    users: 'Quản lý Tài khoản & Phân quyền',
    settings: 'Hệ thống & Sao lưu Dữ liệu'
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
  renderProductsTable();
  renderStationsTable();
  renderBannersTable();
  renderArticlesTable();
}

// ── Stats ──
function renderStats() {
  const prodEl = document.getElementById('statTotalProducts');
  const statEl = document.getElementById('statTotalStations');
  const contEl = document.getElementById('statPendingContacts');
  const userEl = document.getElementById('statTotalUsers');

  if (prodEl) prodEl.textContent = productsList.length;
  if (statEl) statEl.textContent = serviceCentersList.length;
  if (contEl) {
    const pending = contactsList.filter(c => c.status !== 'resolved').length;
    contEl.textContent = contactsList.length > 0 ? pending : 0;
  }
  if (userEl && typeof usersList !== 'undefined' && usersList.length > 0) {
    userEl.textContent = usersList.length;
  }
  
  // Badges in sidebar
  const badgeProd = document.getElementById('badgeProductsCount');
  const badgeStat = document.getElementById('badgeStationsCount');
  const badgeCont = document.getElementById('badgeContactsCount');
  if (badgeProd) badgeProd.textContent = productsList.length;
  if (badgeStat) badgeStat.textContent = serviceCentersList.length;
  if (badgeCont && contactsList.length > 0) {
    const pending = contactsList.filter(c => c.status !== 'resolved').length;
    badgeCont.textContent = pending > 0 ? pending : contactsList.length;
  }
}

async function loadDashboardSummaryStats() {
  try {
    const res = await adminFetch('/api/admin/users');
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.data)) {
      usersList = data.data;
      const userEl = document.getElementById('statTotalUsers');
      if (userEl) userEl.textContent = usersList.length;
      const badge = document.getElementById('badgeUsersCount');
      if (badge) badge.textContent = usersList.length;
    }
  } catch (e) {}
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

// ── Stations Table & Filtering Engine ──
let currentStationRegion = 'all';
let currentStationQuery = '';

function getFilteredStations() {
  let list = serviceCentersList || [];

  // 1. Lọc theo vùng miền (Miền Bắc / Miền Trung / Miền Nam)
  if (currentStationRegion && currentStationRegion !== 'all') {
    const bacProvinces = ['hà nội', 'hải phòng', 'quảng ninh', 'bắc ninh', 'hải dương', 'hưng yên', 'nam định', 'thái bình', 'ninh bình', 'hà nam', 'vĩnh phúc', 'phú thọ', 'thái nguyên', 'bắc giang', 'lạng sơn', 'cao bằng', 'bắc kạn', 'tuyên quang', 'hà giang', 'yên bái', 'lào cai', 'điện biên', 'lai châu', 'sơn la', 'hòa bình'];
    const trungProvinces = ['đà nẵng', 'thanh hóa', 'nghệ an', 'hà tĩnh', 'quảng bình', 'quảng trị', 'thừa thiên huế', 'quảng nam', 'quảng ngãi', 'bình định', 'phú yên', 'khánh hòa', 'ninh thuận', 'bình thuận', 'kon tum', 'gia lai', 'đắk lắk', 'đắk nông', 'lâm đồng'];
    const namProvinces = ['hồ chí minh', 'tp.hcm', 'tp. hồ chí minh', 'sài gòn', 'bình dương', 'đồng nai', 'bà rịa - vũng tàu', 'tây ninh', 'bình phước', 'long an', 'tiền giang', 'bến tre', 'trà vinh', 'vĩnh long', 'đồng tháp', 'an giang', 'kiên giang', 'cần thơ', 'hậu giang', 'sóc trăng', 'bạc liêu', 'cà mau'];

    list = list.filter(s => {
      if (!s) return false;
      const reg = (s.region || '').toLowerCase();
      const lbl = (s.regionLabel || '').toLowerCase();
      const prov = (s.province || s.city || '').toLowerCase();

      if (currentStationRegion === 'bac') {
        return reg === 'north' || lbl.includes('bắc') || bacProvinces.some(p => prov.includes(p));
      }
      if (currentStationRegion === 'trung') {
        return reg === 'central' || lbl.includes('trung') || trungProvinces.some(p => prov.includes(p));
      }
      if (currentStationRegion === 'nam') {
        return reg === 'south' || lbl.includes('nam') || namProvinces.some(p => prov.includes(p));
      }
      return true;
    });
  }

  // 2. Lọc theo từ khóa tìm kiếm (tên trạm, tỉnh thành, địa chỉ, số điện thoại)
  if (currentStationQuery) {
    const q = currentStationQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(s =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.province && s.province.toLowerCase().includes(q)) ||
        (s.city && s.city.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q))
      );
    }
  }

  return list;
}

function renderStationsTable(customListOrQuery) {
  const tbody = document.getElementById('stationsTableBody');
  if (!tbody) return;

  if (typeof customListOrQuery === 'string') {
    currentStationQuery = customListOrQuery;
  }

  const filtered = Array.isArray(customListOrQuery) ? customListOrQuery : getFilteredStations();

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color: var(--adm-text-muted);">Không tìm thấy trạm bảo hành nào phù hợp bộ lọc. Bấm "Thêm Trạm Mới" để tạo.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((s, idx) => `
    <tr>
      <td style="font-weight: 600; color: var(--adm-text-secondary);">${idx + 1}</td>
      <td>
        <strong>${s.name}</strong>
        ${s.note ? `<br><small style="color: #64748b;">${s.note}</small>` : ''}
      </td>
      <td>
        <span class="badge badge-secondary">${s.province || s.city || 'Chưa cập nhật'}</span>
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

function filterStations(query) {
  currentStationQuery = query || '';
  renderStationsTable();
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
  const b = bannersList && bannersList.find(item => item.id === id);
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
function filterStationsByRegion(region) {
  currentStationRegion = region;
  ['all', 'bac', 'trung', 'nam'].forEach(r => {
    const btn = document.getElementById(`filterStationRegion${r.charAt(0).toUpperCase() + r.slice(1)}`);
    if (btn) btn.classList.toggle('active', r === region);
  });
  renderStationsTable();
}

function exportStationsCSV() {
  const exportList = getFilteredStations();
  if (!exportList || exportList.length === 0) {
    showToast('Chưa có dữ liệu trạm bảo hành để xuất file!', 'warning');
    return;
  }
  let csv = '\uFEFF';
  csv += 'STT,Tên trạm bảo hành,Tỉnh Thành,Vùng Miền,Địa chỉ chi tiết,Hotline\n';
  exportList.forEach((s, idx) => {
    const name = `"${(s.name || '').replace(/"/g, '""')}"`;
    const city = `"${(s.province || s.city || '').replace(/"/g, '""')}"`;
    const regionName = s.region === 'north' ? 'Miền Bắc' : s.region === 'central' ? 'Miền Trung' : 'Miền Nam';
    const address = `"${(s.address || '').replace(/"/g, '""')}"`;
    const phone = `"${(s.phone || '').replace(/"/g, '""')}"`;
    csv += `${idx + 1},${name},${city},"${regionName}",${address},${phone}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `danh_sach_tram_bao_hanh_tnp_${currentStationRegion}_${new Date().toISOString().split('T')[0]}.csv`;
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
//  TRAFFIC ANALYTICS & STATS ENGINE
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

function scheduleAdminSessionExpiry() {
  const auth = getStoredAdminAuth();
  if (!auth) return;
  window.setTimeout(() => {
    localStorage.removeItem('tnp_admin_auth');
    alert('Phiên làm việc quản trị đã hết hạn sau 5 phút. Vui lòng đăng nhập lại!');
    window.location.replace('./login.html');
  }, Math.max(0, auth.expiresAt - Date.now()));
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

