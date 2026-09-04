/**
 * TNP Care - Interactive City-to-Station Selector Component
 * Hỗ trợ tra cứu theo tỉnh/thành phố, bấm chọn tỉnh thành để xem danh sách trạm chi tiết
 */

(function(window) {
  'use strict';

  function initStationSelector(config) {
    const {
      searchInputId = 'city-search-input',
      clearBtnId = 'clear-search-btn',
      regionTabsSelector = '.region-pill',
      cityListWrapId = 'city-list-wrap',
      cityCountBadgeId = 'city-count-badge',
      selectedCityTitleId = 'current-selected-city-title',
      selectedCityCountId = 'current-selected-city-count',
      stationsListWrapId = 'current-city-stations-list',
      bookingFormInputId = 'service-target-station'
    } = config || {};

    if (typeof TNP_SERVICE_CENTERS === 'undefined') {
      console.warn('TNP_SERVICE_CENTERS data not found');
      return;
    }

    // 1. Group data by Province
    const provinceMap = new Map();
    TNP_SERVICE_CENTERS.forEach(item => {
      const p = item.province;
      if (!provinceMap.has(p)) {
        provinceMap.set(p, {
          province: p,
          region: item.region,
          regionLabel: item.regionLabel,
          stations: []
        });
      }
      provinceMap.get(p).stations.push(item);
    });

    const allProvinces = Array.from(provinceMap.values());
    let currentRegion = 'all';
    let searchQuery = '';
    let selectedProvinceName = 'Hà Nội'; // Default to Hà Nội as requested by user

    const searchInput = document.getElementById(searchInputId);
    const clearBtn = document.getElementById(clearBtnId);
    const cityListWrap = document.getElementById(cityListWrapId);
    const cityCountBadge = document.getElementById(cityCountBadgeId);
    const selectedCityTitle = document.getElementById(selectedCityTitleId);
    const selectedCityCount = document.getElementById(selectedCityCountId);
    const stationsListWrap = document.getElementById(stationsListWrapId);

    // Filter provinces based on region & search query
    function getFilteredProvinces() {
      const q = searchQuery.toLowerCase().trim();
      return allProvinces.filter(p => {
        const matchesRegion = currentRegion === 'all' || p.region === currentRegion;
        const matchesQuery = !q || 
          p.province.toLowerCase().includes(q) ||
          p.stations.some(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
        return matchesRegion && matchesQuery;
      });
    }

    // Render left column: City list
    function renderCityList() {
      if (!cityListWrap) return;
      const filtered = getFilteredProvinces();

      if (cityCountBadge) {
        cityCountBadge.textContent = `${filtered.length} Tỉnh/Thành`;
      }

      if (filtered.length === 0) {
        cityListWrap.innerHTML = `
          <div style="padding:24px;text-align:center;color:#94a3b8;font-size:13.5px;">
            <i class="fas fa-search" style="font-size:20px;margin-bottom:8px;display:block;"></i>
            Không có tỉnh thành nào phù hợp
          </div>
        `;
        renderStationsList(null);
        return;
      }

      // Check if selected province is still in filtered list
      const isSelectedVisible = filtered.some(p => p.province === selectedProvinceName);
      if (!isSelectedVisible && filtered.length > 0) {
        selectedProvinceName = filtered[0].province;
      }

      cityListWrap.innerHTML = filtered.map(p => {
        const isActive = p.province === selectedProvinceName;
        return `
          <button type="button" class="city-item-btn${isActive ? ' active' : ''}" 
                  onclick="TNP_StationSelector.selectProvince('${p.province}')"
                  aria-selected="${isActive}">
            <div class="city-item-left">
              <div class="city-icon-dot">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <span class="city-name-text">${p.province}</span>
                <span class="city-region-sub">${p.regionLabel}</span>
              </div>
            </div>
            <div class="city-item-right">
              <span class="city-station-badge">${p.stations.length} Trạm</span>
              <i class="fas fa-chevron-right"></i>
            </div>
          </button>
        `;
      }).join('');

      renderStationsList(selectedProvinceName);
    }

    // Render right column: Stations of the selected province
    function renderStationsList(provinceName) {
      if (!stationsListWrap) return;

      if (!provinceName || !provinceMap.has(provinceName)) {
        if (selectedCityTitle) selectedCityTitle.textContent = 'Chọn tỉnh / thành phố';
        if (selectedCityCount) selectedCityCount.textContent = '0 Trạm';
        stationsListWrap.innerHTML = `
          <div style="text-align:center;padding:40px 20px;color:#94a3b8;">
            <i class="fas fa-map-marked-alt" style="font-size:36px;margin-bottom:12px;display:block;"></i>
            <p>Vui lòng chọn một tỉnh thành ở danh sách bên trái để xem các trạm bảo hành.</p>
          </div>
        `;
        return;
      }

      const pData = provinceMap.get(provinceName);
      if (selectedCityTitle) selectedCityTitle.textContent = `Tỉnh / TP. ${pData.province}`;
      if (selectedCityCount) selectedCityCount.textContent = `${pData.stations.length} Trạm kỹ thuật`;

      // Limit initial display on mobile / compact view to avoid stretching the page
      const DEFAULT_LIMIT = 3;
      const totalStations = pData.stations.length;
      const isExpanded = !!expandedProvinces[provinceName];
      const stationsToDisplay = (isExpanded || totalStations <= DEFAULT_LIMIT)
        ? pData.stations
        : pData.stations.slice(0, DEFAULT_LIMIT);

      const cardsHtml = stationsToDisplay.map((s, idx) => `
        <div class="selected-station-card" id="station-card-${s.id}">
          <div class="station-card-top">
            <div>
              <div class="station-card-top-name">${s.name}</div>
              <div style="font-size:12px;color:#64748b;margin-top:2px;">Trực thuộc mạng lưới TNP Care · ${s.regionLabel}</div>
            </div>
            <span class="station-card-province-pill">${s.province}</span>
          </div>

          <div class="station-card-body-row">
            <i class="fas fa-map-marker-alt"></i>
            <div>
              <strong>Địa chỉ trạm:</strong> ${s.address}
            </div>
          </div>

          <div class="station-card-phone-row">
            <i class="fas fa-phone-alt"></i>
            <span>Hotline tiếp nhận: <a href="tel:${s.phone.replace(/\\s/g,'')}" style="color:var(--tnp-blue);text-decoration:underline;">${s.phone}</a> (24/7)</span>
          </div>

          <div class="station-card-action-btns">
            <a href="tel:${s.phone.replace(/\\s/g,'')}" class="btn btn-primary btn-sm">
              <i class="fas fa-phone-alt"></i> Gọi trạm này
            </a>
            <a href="https://www.google.com/maps/search/${encodeURIComponent(s.address)}" 
               target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
              <i class="fas fa-directions"></i> Chỉ đường Maps
            </a>
            <button type="button" class="btn btn-ghost btn-sm" style="color:#16a34a;border:1px solid #bbf7d0;"
                    onclick="TNP_StationSelector.chooseStationForBooking('${s.name}', '${s.province}')">
              <i class="fas fa-check-circle"></i> Chọn trạm này
            </button>
          </div>
        </div>
      `).join('');

      // Show more / Collapse button if more than DEFAULT_LIMIT
      let toggleHtml = '';
      if (totalStations > DEFAULT_LIMIT) {
        if (!isExpanded) {
          const remaining = totalStations - DEFAULT_LIMIT;
          toggleHtml = `
            <div class="station-toggle-wrap">
              <button type="button" class="btn-station-toggle btn-station-more" 
                      onclick="TNP_StationSelector.toggleShowMore('${provinceName}', true)">
                <span>Xem thêm ${remaining} trạm khác tại ${provinceName}</span>
                <i class="fas fa-chevron-down"></i>
              </button>
            </div>
          `;
        } else {
          toggleHtml = `
            <div class="station-toggle-wrap">
              <button type="button" class="btn-station-toggle btn-station-less" 
                      onclick="TNP_StationSelector.toggleShowMore('${provinceName}', false)">
                <span>Thu gọn danh sách trạm (hiển thị ${DEFAULT_LIMIT} trạm)</span>
                <i class="fas fa-chevron-up"></i>
              </button>
            </div>
          `;
        }
      }

      stationsListWrap.innerHTML = cardsHtml + toggleHtml;
    }

    // State to remember user expand preference per province
    const expandedProvinces = {};

    // Public method to select province
    window.TNP_StationSelector = {
      selectProvince(pName) {
        selectedProvinceName = pName;
        renderCityList();
      },

      toggleShowMore(pName, expand) {
        expandedProvinces[pName] = !!expand;
        renderStationsList(pName);
        if (!expand && stationsListWrap) {
          stationsListWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      },

      chooseStationForBooking(stationName, province) {
        // Highlight chosen card
        document.querySelectorAll('.selected-station-card').forEach(c => c.classList.remove('is-chosen'));
        const activeCard = event?.target?.closest('.selected-station-card');
        if (activeCard) activeCard.classList.add('is-chosen');

        // Autofill form if exists
        const formInput = document.getElementById(bookingFormInputId);
        const cityInput = document.getElementById('service-target-city') || document.getElementById('contact-province');
        if (formInput) formInput.value = `${stationName} (${province})`;
        if (cityInput) cityInput.value = province;

        // Scroll to form if on page
        const formEl = document.getElementById('booking-form-box') || document.getElementById('contact') || document.getElementById('lien-he-bao-gia');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        alert(`Đã chọn "${stationName} - ${province}". Vui lòng điền thông tin để kỹ thuật viên TNP Care hỗ trợ ngay!`);
      }
    };

    // Setup search listener
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (clearBtn) clearBtn.style.display = searchQuery ? 'block' : 'none';
        
        // If user typed exact match or partial, auto-select first match
        const q = searchQuery.toLowerCase().trim();
        if (q) {
          const matched = allProvinces.find(p => p.province.toLowerCase().includes(q));
          if (matched) selectedProvinceName = matched.province;
        }
        renderCityList();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearBtn.style.display = 'none';
        renderCityList();
        searchInput.focus();
      });
    }

    // Setup region tab listener & populate live station counts
    const northCount = TNP_SERVICE_CENTERS.filter(s => s.region === 'north').length;
    const centralCount = TNP_SERVICE_CENTERS.filter(s => s.region === 'central').length;
    const southCount = TNP_SERVICE_CENTERS.filter(s => s.region === 'south').length;
    const totalCount = TNP_SERVICE_CENTERS.length;

    const regionButtons = document.querySelectorAll(regionTabsSelector);
    regionButtons.forEach(btn => {
      const reg = btn.dataset.region;
      if (reg === 'all') btn.innerHTML = `<i class="fas fa-globe-asia"></i> Toàn Quốc (${totalCount} Trạm)`;
      else if (reg === 'north') btn.innerHTML = `<i class="fas fa-landmark"></i> Miền Bắc (${northCount})`;
      else if (reg === 'central') btn.innerHTML = `<i class="fas fa-mountain-sun"></i> Miền Trung (${centralCount})`;
      else if (reg === 'south') btn.innerHTML = `<i class="fas fa-city"></i> Miền Nam (${southCount})`;

      btn.addEventListener('click', () => {
        regionButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRegion = btn.dataset.region || 'all';
        renderCityList();
      });
    });

    // Initial render
    renderCityList();
  }

  window.initStationSelector = initStationSelector;

})(window);
