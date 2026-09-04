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

// Storage keys
const STORAGE_PRODUCTS_KEY = 'tnp_admin_products_override';
const STORAGE_STATIONS_KEY = 'tnp_admin_stations_override';
const STORAGE_BANNERS_KEY = 'tnp_admin_banners_override';

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

function saveProducts() {
  localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(productsList));
  showToast('Đã lưu dữ liệu sản phẩm thành công!', 'success');
  renderAll();
}

function saveStations() {
  localStorage.setItem(STORAGE_STATIONS_KEY, JSON.stringify(serviceCentersList));
  showToast('Đã lưu danh sách trạm bảo hành thành công!', 'success');
  renderAll();
}

function saveBanners() {
  localStorage.setItem(STORAGE_BANNERS_KEY, JSON.stringify(bannersList));
  showToast('Đã lưu danh sách Banner Hero thành công!', 'success');
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
