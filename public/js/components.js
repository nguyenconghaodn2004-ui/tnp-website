/**
 * TRÚC NGUYÊN PHÁT – TNP
 * components.js – Shared Header, Footer, Modals
 * Tự động inject vào mỗi trang qua placeholder divs.
 */

'use strict';

// ══════════════════════════════════════════════
//  NAVIGATION CONFIG
// ══════════════════════════════════════════════
const NAV_LINKS = [
  { href: './index.html', label: 'Trang chủ', key: 'home' },
  { href: './gioi-thieu.html', label: 'Về TNP', key: 'gioi-thieu' },
  {
    href: './tram-bao-hanh.html', label: 'Trạm bảo hành', key: 'tram-bao-hanh',
    dropdown: [
      { href: './tram-bao-hanh.html', icon: 'fas fa-map-marker-alt', label: 'Mạng lưới 80 – 100 Trạm' },
      { href: './tram-bao-hanh.html#quy-trinh', icon: 'fas fa-cogs', label: 'Quy trình 6 bước dịch vụ' },
      { href: './tram-bao-hanh.html#doi-tac', icon: 'fas fa-handshake', label: 'Đối tác bảo hành tiêu biểu' },
      { href: './tram-bao-hanh.html#cam-ket', icon: 'fas fa-shield-alt', label: 'Cam kết chất lượng' },
    ]
  },
  {
    href: './san-pham.html', label: 'Sản phẩm TV', key: 'san-pham',
    dropdown: [
      { href: './tv-hxy.html', icon: 'fas fa-tv', label: 'Smart TV HXY Việt Nam' },
      { href: './tv-hikers.html', icon: 'fas fa-tv', label: 'Smart TV HIKERS Việt Nam' },
      { href: './thuong-hieu.html', icon: 'fas fa-balance-scale', label: 'Bảng so sánh 2 thương hiệu' },
      { href: './san-pham.html', icon: 'fas fa-th-large', label: 'Tất cả sản phẩm TV' },
    ]
  },
  {
    href: './ho-tro.html', label: 'Hỗ trợ', key: 'ho-tro',
    dropdown: [
      { href: './ho-tro.html#faq', icon: 'fas fa-question-circle', label: 'Hỏi đáp FAQ' },
      { href: './ho-tro.html#bao-hanh', icon: 'fas fa-shield-alt', label: 'Chính sách bảo hành' },
    ]
  },
  { href: './lien-he.html', label: 'Liên hệ', key: 'lien-he' },
];

// Detect active page
function getActivePage() {
  const path = window.location.pathname;
  if (path.includes('tv-hxy')) return 'tv-hxy';
  if (path.includes('tv-hikers')) return 'tv-hikers';
  if (path.includes('tram-bao-hanh')) return 'tram-bao-hanh';
  if (path.includes('thuong-hieu')) return 'thuong-hieu';
  if (path.includes('san-pham')) return 'san-pham';
  if (path.includes('cong-nghe')) return 'cong-nghe';
  if (path.includes('gioi-thieu')) return 'gioi-thieu';
  if (path.includes('ho-tro')) return 'ho-tro';
  if (path.includes('lien-he')) return 'lien-he';
  return 'home';
}

// Build nav-link HTML
function buildDesktopNav() {
  const active = getActivePage();
  return NAV_LINKS.map(link => {
    const isActive = (
      (active === 'home' && link.key === 'home') ||
      (active !== 'home' && link.key !== 'home' && active.includes(link.key))
    );
    if (link.dropdown) {
      const items = link.dropdown.map(d =>
        `<a href="${d.href}" role="menuitem"><i class="${d.icon}" aria-hidden="true"></i>${d.label}</a>`
      ).join('');
      return `
        <div class="nav-item">
          <a href="${link.href}" class="nav-link${isActive ? ' active' : ''}">
            ${link.label} <i class="fas fa-chevron-down" aria-hidden="true"></i>
          </a>
          <div class="nav-dropdown" role="menu">${items}</div>
        </div>`;
    }
    return `
      <div class="nav-item">
        <a href="${link.href}" class="nav-link${isActive ? ' active' : ''}">${link.label}</a>
      </div>`;
  }).join('');
}

// Build mobile nav HTML
function buildMobileNav() {
  const active = getActivePage();
  let idx = 0;
  return NAV_LINKS.map(link => {
    const isActive = (
      (active === 'home' && link.key === 'home') ||
      (active !== 'home' && link.key !== 'home' && active.includes(link.key))
    );
    const iconMap = {
      home: 'fas fa-home',
      'tram-bao-hanh': 'fas fa-map-marker-alt',
      'thuong-hieu': 'fas fa-tv',
      'san-pham': 'fas fa-th-large',
      'cong-nghe': 'fas fa-microchip',
      'gioi-thieu': 'fas fa-building',
      'ho-tro': 'fas fa-shield-alt',
      'lien-he': 'fas fa-phone-alt',
    };
    const icon = iconMap[link.key] || 'fas fa-link';
    if (link.dropdown) {
      idx++;
      const subId = `sub-${link.key}`;
      const items = link.dropdown.map(d =>
        `<a href="${d.href}">${d.label}</a>`
      ).join('');
      return `
        <a href="#" class="mobile-nav-link mobile-nav-toggle${isActive ? ' active' : ''}" data-target="${subId}">
          <span><i class="${icon}" style="width:18px;color:var(--tnp-blue);margin-right:10px;"></i>${link.label}</span>
          <i class="fas fa-chevron-down"></i>
        </a>
        <div class="mobile-submenu" id="${subId}">${items}</div>`;
    }
    return `
      <a href="${link.href}" class="mobile-nav-link${isActive ? ' active' : ''}">
        <span><i class="${icon}" style="width:18px;color:var(--tnp-blue);margin-right:10px;"></i>${link.label}</span>
      </a>`;
  }).join('');
}

// ══════════════════════════════════════════════
//  HEADER HTML
// ══════════════════════════════════════════════
function renderHeader() {
  return `
<!-- TOP BAR -->
<div class="top-bar" role="complementary" aria-label="Thông tin liên hệ">
  <div class="container">
    <div class="top-bar-left">
      <a href="tel:02822422822" class="top-bar-item" aria-label="Gọi hotline">
        <i class="fas fa-phone-alt" aria-hidden="true"></i><span>Hotline: 028 22 422 822</span>
      </a>
      <div class="top-bar-divider" aria-hidden="true"></div>
      <a href="mailto:nguyenhung355@gmail.com" class="top-bar-item" aria-label="Email">
        <i class="fas fa-envelope" aria-hidden="true"></i><span>nguyenhung355@gmail.com</span>
      </a>
      <div class="top-bar-divider" aria-hidden="true"></div>
      <span class="top-bar-item">
        <i class="fas fa-map-marker-alt" aria-hidden="true"></i><span>80 – 100 Trạm bảo hành toàn quốc</span>
      </span>
    </div>
    <div class="top-bar-right">
      <a href="./tram-bao-hanh.html" class="top-bar-item" style="color:#fbbf24;">
        <i class="fas fa-search-location"></i><span>Tra cứu trạm bảo hành</span>
      </a>
      <div class="top-bar-divider" aria-hidden="true"></div>
      <div class="top-bar-social" aria-label="Mạng xã hội">
        <a href="https://zalo.me" target="_blank" aria-label="Zalo TNP"><i class="fas fa-comment-dots" aria-hidden="true"></i></a>
        <a href="tel:02822422822" aria-label="Hotline"><i class="fas fa-phone" aria-hidden="true"></i></a>
      </div>
    </div>
  </div>
</div>

<!-- HEADER -->
<header class="site-header" id="site-header" role="banner">
  <div class="container header-inner">
    <a href="./index.html" class="site-logo" aria-label="Trúc Nguyên Phát – Trang chủ">
      <img src="./images/logo_tnp_care.png" alt="TNP Care Logo" class="logo-tnp-img">
      <div class="logo-text-group">
        <div class="logo-name">
          <span class="logo-tn">TRÚC NGUYÊN</span> <span class="logo-p">PHÁT</span>
        </div>
        <div class="logo-tagline">Giải Pháp &amp; Dịch Vụ Bảo Hành Toàn Quốc</div>
      </div>
    </a>
    <nav class="main-nav" role="navigation" aria-label="Menu chính">
      ${buildDesktopNav()}
    </nav>
    <div class="header-actions">
      <button class="header-search-btn" id="search-btn" aria-label="Tìm kiếm sản phẩm">
        <i class="fas fa-search" aria-hidden="true"></i>
      </button>
      <a href="tel:02822422822" class="btn btn-red btn-sm" style="white-space:nowrap;padding:7px 12px;font-size:13px;">
        <i class="fas fa-phone-alt" aria-hidden="true"></i> 028 22 422 822
      </a>
      <button class="hamburger" id="hamburger" aria-label="Mở menu" aria-expanded="false" aria-controls="mobile-menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>

<!-- MOBILE OVERLAY -->
<div class="mobile-overlay" id="mobile-overlay" aria-hidden="true"></div>

<!-- MOBILE MENU -->
<nav class="mobile-menu" id="mobile-menu" aria-label="Menu di động" aria-hidden="true">
  <div class="mobile-menu-head">
    <div class="mobile-menu-logo">
      <img src="./images/logo_tnp_care.png" alt="TNP Care" style="height:32px;vertical-align:middle;margin-right:8px;">
      TRÚC NGUYÊN <span class="red">PHÁT</span>
    </div>
    <button class="mobile-close" id="mobile-close" aria-label="Đóng menu">
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
  </div>
  <div class="mobile-nav">${buildMobileNav()}</div>
  <div class="mobile-menu-footer">
    <div class="mobile-contact-info">
      <div class="mobile-contact-row"><i class="fas fa-phone-alt"></i><span>028 22 422 822</span></div>
      <div class="mobile-contact-row"><i class="fas fa-envelope"></i><span>nguyenhung355@gmail.com</span></div>
      <div class="mobile-contact-row"><i class="fas fa-map-marker-alt"></i><span>2 Hoàng Ngân, P.16, Q.8, TP.HCM</span></div>
      <div class="mobile-contact-row"><i class="fas fa-shield-alt"></i><span>80 – 100 Trạm bảo hành toàn quốc</span></div>
    </div>
    <a href="./tram-bao-hanh.html" class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:8px;">
      <i class="fas fa-map-marker-alt"></i> Tra cứu 80-100 Trạm bảo hành
    </a>
    <a href="tel:02822422822" class="btn btn-red" style="width:100%;justify-content:center;">
      <i class="fas fa-phone-alt"></i> Gọi Hotline: 028 22 422 822
    </a>
  </div>
</nav>

<!-- SEARCH OVERLAY -->
<div class="search-overlay" id="search-overlay" role="search" aria-label="Tìm kiếm">
  <div class="search-box-wrap">
    <div class="search-input-row">
      <label for="search-input" class="sr-only">Tìm kiếm sản phẩm hoặc trạm bảo hành</label>
      <input type="search" id="search-input" class="search-input"
             placeholder="Tìm TV, linh kiện hoặc tên tỉnh thành trạm bảo hành..." autocomplete="off">
      <button class="btn btn-primary" id="search-close" aria-label="Đóng tìm kiếm">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="search-results" id="search-results" aria-live="polite"></div>
  </div>
</div>`;
}

// ══════════════════════════════════════════════
//  FOOTER HTML
// ══════════════════════════════════════════════
function renderFooter() {
  return `
<footer class="site-footer" role="contentinfo">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand-col">
        <div class="footer-logo-row">
          <img src="./images/logo_tnp_care.png" alt="TNP Care Logo" class="footer-tnp-logo-img">
          <div class="footer-logo-name">
            <span class="footer-logo-tn">TRÚC NGUYÊN</span> <span class="footer-logo-p">PHÁT</span>
          </div>
        </div>
        <div class="footer-tagline-text">CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ TRÚC NGUYÊN PHÁT (TNP CARE)</div>
        <p class="footer-desc">
          TNP Care tự hào là đơn vị hàng đầu tại Việt Nam cung cấp giải pháp và dịch vụ bảo hành,
          sửa chữa và lắp đặt hệ thống Smart TV &amp; thiết bị nghe nhìn với mạng lưới <strong>80 – 100 trung tâm bảo hành trên toàn quốc</strong>.
        </p>
        <div class="footer-company-meta">
          <div><i class="fas fa-id-card"></i> Mã số thuế: <strong>0318287851</strong></div>
          <div><i class="fas fa-user-tie"></i> Đại diện pháp luật: <strong>Nguyễn Văn Hùng</strong></div>
          <div><i class="fas fa-building"></i> Trụ sở: 61/67 Võ Văn Kiệt, KP.3, P. An Lạc, Q. Tân Bình, TP.HCM</div>
          <div><i class="fas fa-map-marked-alt"></i> Văn phòng: Số 2 Hoàng Ngân, Phường 16, Quận 8, TP.HCM</div>
          <div><i class="fas fa-phone-alt"></i> Hotline: <a href="tel:02822422822" style="color:#60a5fa;font-weight:700;">028 22 422 822</a></div>
          <div><i class="fas fa-envelope"></i> Email: <a href="mailto:nguyenhung355@gmail.com" style="color:rgba(255,255,255,.8);">nguyenhung355@gmail.com</a></div>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Mạng Lưới Bảo Hành</div>
        <div class="footer-links">
          <a href="./tram-bao-hanh.html" class="footer-link"><strong>80 – 100 Trạm toàn quốc</strong></a>
          <a href="./tram-bao-hanh.html#quy-trinh" class="footer-link">Quy trình 6 bước dịch vụ</a>
          <a href="./tram-bao-hanh.html#doi-tac" class="footer-link">Đối tác bảo hành tiêu biểu</a>
          <a href="./tram-bao-hanh.html#cam-ket" class="footer-link">Cam kết chất lượng dịch vụ</a>
          <a href="./gioi-thieu.html" class="footer-link">Hồ sơ năng lực công ty</a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Sản Phẩm &amp; Dịch Vụ</div>
        <div class="footer-links">
          <a href="./tv-hxy.html" class="footer-link">Smart TV HXY Việt Nam</a>
          <a href="./tv-hikers.html" class="footer-link">Smart TV HIKERS Việt Nam</a>
          <a href="./san-pham.html" class="footer-link">Tất cả sản phẩm TV</a>
          <a href="./tram-bao-hanh.html" class="footer-link">Dịch vụ sửa chữa &amp; bảo hành Smart TV</a>
          <a href="./tram-bao-hanh.html" class="footer-link">Lắp đặt TV treo tường &amp; Dự án</a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Hỗ Trợ Khách Hàng</div>
        <div class="footer-links">
          <a href="tel:02822422822" class="footer-link" style="color:#f87171;font-weight:800;font-size:16px;">
            <i class="fas fa-phone-alt"></i> 028 22 422 822
          </a>
          <a href="./ho-tro.html#faq" class="footer-link">Câu hỏi thường gặp FAQ</a>
          <a href="./ho-tro.html#bao-hanh" class="footer-link">Chính sách bảo hành điện tử</a>
          <a href="./lien-he.html" class="footer-link">Gửi yêu cầu hỗ trợ</a>
          <a href="./tram-bao-hanh.html" class="footer-link">Tra cứu điểm bảo hành gần nhất</a>
        </div>
        <div style="margin-top:16px;">
          <div class="footer-col-title">Đối Tác Tiêu Biểu</div>
          <p style="font-size:12px;color:rgba(255,255,255,.6);line-height:1.6;">
            LG · Samsung · Sony · TCL · Sharp · Panasonic · Toshiba · HXY · HIKERS
          </p>
        </div>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container">
      <div class="footer-copyright">
        © 2026 <strong>CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ TRÚC NGUYÊN PHÁT (TNP CARE)</strong>. MST: 0318287851.
      </div>
      <div class="footer-brands-row">
        <span class="footer-brand-tag">80-100 Trạm Bảo Hành</span>
        <span class="footer-brand-tag">Bảo Hành Smart TV</span>
        <span class="footer-brand-tag">TNP Care</span>
      </div>
    </div>
  </div>
</footer>`;
}

// ══════════════════════════════════════════════
//  MODALS & FLOATING ELEMENTS HTML
// ══════════════════════════════════════════════
function renderModals() {
  return `
<!-- PRODUCT MODAL -->
<div class="modal-backdrop" id="product-modal" role="dialog" aria-modal="true" aria-labelledby="modal-name">
  <div class="modal">
    <button class="modal-close" id="modal-close" aria-label="Đóng">
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
    <div class="modal-body">
      <div class="modal-gallery">
        <div class="modal-main-img" id="modal-main-img">
          <div class="product-thumb-placeholder">
            <i class="fas fa-tv" style="font-size:64px;"></i>
          </div>
        </div>
      </div>
      <div class="modal-info">
        <div class="modal-brand-badge blue" id="modal-brand">HXY</div>
        <h2 class="modal-product-name" id="modal-name">Tên sản phẩm</h2>
        <p class="modal-product-model" id="modal-model">Model</p>
        <div class="modal-features">
          <h3>Tính năng nổi bật</h3>
          <div class="feature-list" id="modal-features-list"></div>
        </div>
        <div class="modal-specs">
          <h3>Thông số kỹ thuật</h3>
          <div class="specs-table" id="modal-specs-table"></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-red btn-lg" id="modal-inquire-btn">
            <i class="fas fa-headset" aria-hidden="true"></i> Tư vấn &amp; Báo giá
          </button>
          <button class="btn btn-ghost btn-lg" onclick="TNP && TNP.closeModal()">
            <i class="fas fa-times" aria-hidden="true"></i> Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- COMPARE MODAL -->
<div class="modal-backdrop compare-modal" id="compare-modal" role="dialog" aria-modal="true" aria-labelledby="compare-title">
  <div class="modal" style="max-width:960px;">
    <button class="modal-close" id="compare-modal-close" aria-label="Đóng so sánh">
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
    <div style="padding:var(--space-8);">
      <h2 id="compare-title" style="font-size:22px;font-weight:800;margin-bottom:var(--space-6);">
        <i class="fas fa-balance-scale" style="color:var(--tnp-blue);margin-right:10px;"></i>So sánh sản phẩm
      </h2>
      <div class="compare-table-wrap">
        <table class="compare-table" role="table">
          <thead id="compare-table-head"><tr><th style="width:150px;"></th></tr></thead>
          <tbody id="compare-table-body"></tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<!-- COMPARE BAR -->
<div class="compare-bar" id="compare-bar" role="region" aria-label="So sánh sản phẩm" aria-live="polite">
  <div class="container">
    <span class="compare-bar-label">
      <i class="fas fa-balance-scale" aria-hidden="true"></i> So sánh
    </span>
    <div class="compare-slots">
      <div class="compare-slot" id="compare-slot-0">+ Thêm sản phẩm</div>
      <div class="compare-slot" id="compare-slot-1">+ Thêm sản phẩm</div>
      <div class="compare-slot" id="compare-slot-2">+ Thêm sản phẩm</div>
    </div>
    <div class="compare-bar-actions">
      <button class="btn btn-primary" id="compare-btn">
        <i class="fas fa-chart-bar" aria-hidden="true"></i> So sánh ngay
      </button>
      <button class="btn btn-ghost" id="compare-clear" aria-label="Xoá tất cả so sánh">
        <i class="fas fa-trash" aria-hidden="true"></i> Xoá
      </button>
    </div>
  </div>
</div>

<!-- FLOATING CONTACT BUTTONS (CHỈ CÒN ĐIỆN THOẠI & ZALO) -->
<div class="float-btns" aria-label="Liên hệ nhanh">
  <!-- Bong bóng Gọi điện -->
  <a href="tel:02822422822" class="float-btn float-btn-phone float-btn-pulse" aria-label="Gọi hotline 028 22 422 822">
    <i class="fas fa-phone-alt" aria-hidden="true"></i>
    <span class="float-tooltip">Hotline: 028 22 422 822</span>
  </a>

  <!-- Bong bóng Zalo -->
  <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" class="float-btn float-btn-zalo float-btn-pulse" aria-label="Chat Zalo với Trúc Nguyên Phát TNP Care">
    <span class="zalo-icon-badge" aria-hidden="true">Zalo</span>
    <span class="float-tooltip">Chat Zalo tư vấn</span>
  </a>
</div>

<!-- BACK TO TOP -->
<button class="back-top" id="back-top" aria-label="Lên đầu trang">
  <i class="fas fa-chevron-up" aria-hidden="true"></i>
</button>`;
}

// ══════════════════════════════════════════════
//  INJECT INTO PAGE
// ══════════════════════════════════════════════
function injectComponents() {
  const headerEl = document.getElementById('header-placeholder') || document.getElementById('header-root');
  if (headerEl) {
    headerEl.outerHTML = renderHeader();
  }

  const footerEl = document.getElementById('footer-placeholder') || document.getElementById('footer-root');
  if (footerEl) {
    footerEl.outerHTML = renderFooter();
  }

  const modalsEl = document.getElementById('modals-placeholder') || document.getElementById('modals-root');
  if (modalsEl) {
    modalsEl.outerHTML = renderModals();
  }
}

// Run as soon as DOM is interactive
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectComponents);
} else {
  injectComponents();
}
