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

// Storage keys
const STORAGE_PRODUCTS_KEY = 'tnp_admin_products_override';
const STORAGE_STATIONS_KEY = 'tnp_admin_stations_override';

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

// ══════════════════════════════════════════════
//  RENDER FUNCTIONS
// ══════════════════════════════════════════════
function renderAll() {
  renderStats();
  renderRecentProducts();
  renderProductsTable();
  renderStationsTable();
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

// ══════════════════════════════════════════════
//  CONTACTS & LEADS
// ══════════════════════════════════════════════
async function fetchContactsFromServer() {
  const tbody = document.getElementById('contactsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/contacts');
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        renderContactsTable(json.data);
        return;
      }
    }
  } catch (e) {
    console.warn('Không thể tải contacts từ server, kiểm tra dữ liệu mẫu...');
  }

  // Nếu chưa có contact nào
  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: 40px; color: var(--adm-text-muted);">
        <i class="fas fa-inbox" style="font-size: 32px; display: block; margin-bottom: 8px;"></i>
        Chưa có yêu cầu tư vấn mới nào từ khách hàng.
      </td>
    </tr>
  `;
}

function renderContactsTable(leads) {
  const tbody = document.getElementById('contactsTableBody');
  if (!tbody) return;

  tbody.innerHTML = leads.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${item.name || 'Khách hàng'}</strong></td>
      <td>
        <a href="tel:${item.phone}" style="color: var(--adm-accent); font-weight: 700; text-decoration: none;">
          <i class="fas fa-phone-alt"></i> ${item.phone}
        </a>
      </td>
      <td><span class="badge badge-brand-hxy">${item.product || 'Tư vấn'}</span></td>
      <td><small>${item.message || 'Không có ghi chú'}</small></td>
      <td><small style="color: #64748b;">${item.time || 'Vừa xong'}</small></td>
      <td><span class="badge badge-warning">Chờ liên hệ</span></td>
    </tr>
  `).join('');
}
