function waitForPlacesData(maxAttempts = 100, interval = 100) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const checkData = () => {
      attempts++;
      const places = window.appState?.places || window.places || [];
      if (Array.isArray(places) && places.length > 0) {
        resolve(places);
      } else if (attempts >= maxAttempts) {
        reject(new Error('Данные не загрузились в течение ожидаемого времени'));
      } else {
        setTimeout(checkData, interval);
      }
    };
    checkData();
  });
}
document.addEventListener('DOMContentLoaded', () => {
  try {
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (window.AOS && !isMobile) {
      AOS.init({ duration: 800, once: true, offset: 100 });
    }
    if (typeof initMobileMenu === 'function') {
      initMobileMenu();
    }
    waitForPlacesData()
      .then(() => {
        initFavoritesPage();
      })
      .catch((error) => {
        console.error('Ошибка при ожидании данных:', error);
        if (window.places && Array.isArray(window.places) && window.places.length > 0) {
          initFavoritesPage();
        } else {
          console.warn('Данные не загружены, инициализация с пустым массивом');
          window.places = window.places || [];
          initFavoritesPage();
        }
      });
  } catch (error) {
    console.error('Ошибка при инициализации страницы избранного:', error);
    if (window.places && Array.isArray(window.places) && window.places.length > 0) {
      initFavoritesPage();
    } else {
      window.places = window.places || [];
      initFavoritesPage();
    }
  }
});
function initFavoritesPage() {
  if (typeof setupFavoritesTabs === 'function') {
    setupFavoritesTabs();
  }
  renderFavoritesPlaces();
  renderFavoritesRoutes();
  if (typeof setupModals === 'function') {
    setupModals();
  }
  const saveRouteBtn = document.getElementById('saveRoute');
  if (saveRouteBtn && typeof saveCustomRoute === 'function') {
    saveRouteBtn.addEventListener('click', saveCustomRoute);
  }
}
function setupFavoritesTabs() {
  const tabs = document.querySelectorAll('.favorites__tab-btn');
  const contents = document.querySelectorAll('.favorites__tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      contents.forEach(content => {
        content.style.display = 'none';
      });
      const targetContent = document.getElementById(`favorites${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}`);
      if (targetContent) {
        targetContent.style.display = 'block';
      }
    });
  });
}
function renderFavoritesPlaces() {
  const grid = document.getElementById('favoritesPlacesGrid');
  const emptyMsg = document.getElementById('emptyPlaces');
  if (!grid) return;
  const placesData = typeof places !== 'undefined' ? places : (window.places || []);
  if (!Array.isArray(placesData) || placesData.length === 0) {
    console.error('Данные о местах не загружены');
    grid.style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }
  if (typeof getFavorites !== 'function') {
    console.error('Функция getFavorites не найдена');
    return;
  }
  const favorites = getFavorites();
  const favoritePlaces = placesData.filter(p => favorites.places.includes(p.id));
  if (favoritePlaces.length === 0) {
    grid.style.display = 'none';
    emptyMsg.style.display = 'block';
    return;
  }
  grid.style.display = 'grid';
  emptyMsg.style.display = 'none';
  const getPeriodNameFunc = typeof getPeriodName === 'function' ? getPeriodName : (p) => p || '';
  const getTypeNameFunc = typeof getTypeName === 'function' ? getTypeName : (t) => t || '';
  const normalizeImagePathFunc = typeof normalizeImagePath === 'function' ? normalizeImagePath : (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    let isPageContext = false;
    try {
      const pathname = window.location.pathname || '';
      const href = window.location.href || '';
      const pathSegments = pathname.split('/').filter(s => s);
      isPageContext = pathname.includes('/pages/') || 
                      pathname.includes('pages\\') || 
                      href.includes('/pages/') || 
                      href.includes('pages\\') ||
                      (pathSegments.length > 1 && pathSegments[pathSegments.length - 2] === 'pages');
    } catch (e) {
      isPageContext = false;
    }
    const basePath = isPageContext ? '../../' : '';
    if (path.startsWith('/images/')) {
      return basePath + path.substring(1);
    }
    if (path.startsWith('image/')) {
      if (path.includes('logo.png')) {
        return basePath + 'images/interface/logo.png';
      }
      return basePath + path.replace('image/', 'images/content/historical/');
    }
    if (path.startsWith('images/')) {
      return basePath + path;
    }
    if (path.startsWith('img/')) {
      return basePath + path.replace('img/', 'images/');
    }
    return basePath + path;
  };
  grid.innerHTML = favoritePlaces.map(place => {
    const hasImage = place.images && place.images.now && place.images.now.trim() !== '';
    const hasOldImage = place.images && place.images.old && place.images.old.trim() !== '';
    const hasBothImages = hasOldImage && hasImage;
    return `
      <article class="gallery-card" itemscope itemtype="https://schema.org/TouristAttraction" tabindex="0" aria-label="${hasBothImages ? 'Сравнить тогда и сейчас' : 'Просмотреть фото'}: ${place.name || ''}">
        ${hasImage ? `
        <div class="gallery-thumb">
          <img src="${normalizeImagePathFunc(place.images.now)}" alt="${place.name || ''}" loading="lazy" onerror="this.style.display='none'">
          <button class="favorite-btn gallery-favorite active" data-id="${place.id}" data-type="place" aria-label="Убрать из избранного" title="Убрать из избранного">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        ` : ''}
        <h3 itemprop="name">${place.name || ''}</h3>
        <p itemprop="temporalCoverage">${getPeriodNameFunc(place.period)} • ${getTypeNameFunc(place.type)}</p>
        ${place.address ? `<meta itemprop="address" content="${place.address}">` : ''}
        <button type="button" class="btn-secondary" data-id="${place.id}" data-has-old="${hasOldImage}">${hasBothImages ? 'Тогда и сейчас' : 'Просмотреть фото'}</button>
      </article>
    `;
  }).join('');
  grid.querySelectorAll('button.btn-secondary[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const placesData = typeof places !== 'undefined' ? places : (window.places || []);
      const place = placesData.find(p => p.id === id);
      if (place) {
        if (btn.dataset.hasOld === 'true') {
          if (typeof window.openCompareModal === 'function') {
            window.openCompareModal(place);
          }
        } else {
          if (typeof window.openSingleImageModal === 'function') {
            window.openSingleImageModal(place);
          }
        }
      }
    });
  });
  grid.querySelectorAll('.favorite-btn[data-type="place"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      if (typeof togglePlaceFavorite === 'function') {
        togglePlaceFavorite(id);
        renderFavoritesPlaces();
      }
    });
  });
}
function renderFavoritesRoutes() {
  const container = document.getElementById('favoritesRoutesList');
  const emptyMsg = document.getElementById('emptyRoutes');
  if (!container) return;
  if (typeof getFavorites !== 'function') {
    console.error('Функция getFavorites не найдена');
    return;
  }
  const favorites = getFavorites();
  const allRoutes = JSON.parse(localStorage.getItem('heritage_routes_v1') || '[]');
  const favoriteRoutes = allRoutes.filter(r => favorites.routes.includes(r.id));
  if (favoriteRoutes.length === 0) {
    container.style.display = 'none';
    emptyMsg.style.display = 'block';
    return;
  }
  container.style.display = 'block';
  emptyMsg.style.display = 'none';
  const estimateDurationFunc = typeof estimateDuration === 'function' ? estimateDuration : (count) => (count * 0.5).toFixed(1);
  container.innerHTML = favoriteRoutes.map(route => {
    const count = route.placeIds?.length || 0;
    const duration = route.durationHours || estimateDurationFunc(count);
    return `
      <article class="saved-route">
        <div>
          <h4>${route.name}</h4>
          <p>${count} объектов, примерно ${duration} ч.</p>
        </div>
        <div class="saved-route-actions">
          <button class="favorite-btn active" type="button" data-id="${route.id}" data-type="route" aria-label="Убрать из избранного" title="Убрать из избранного">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button type="button" data-id="${route.id}" data-action="show">Показать на карте</button>
          <button type="button" data-id="${route.id}" data-action="delete">Удалить</button>
        </div>
      </article>
    `;
  }).join('');
  container.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      const route = favoriteRoutes.find(r => r.id === id);
      if (action === 'show' && route) {
        localStorage.setItem('show_route_on_load', JSON.stringify({ 
          routeId: id, 
          routeName: route.name, 
          placeIds: route.placeIds || [],
          startPointId: route.startPointId || null,
          startPointCoords: route.startPointCoords || null
        }));
        window.location.href = '../../index.html#map';
      } else if (action === 'delete' && route) {
        const allRoutes = JSON.parse(localStorage.getItem('heritage_routes_v1') || '[]');
        const updated = allRoutes.filter(r => r.id !== id);
        localStorage.setItem('heritage_routes_v1', JSON.stringify(updated));
        renderFavoritesRoutes();
      }
    });
  });
  container.querySelectorAll('.favorite-btn[data-type="route"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      if (typeof toggleRouteFavorite === 'function') {
        toggleRouteFavorite(id);
        renderFavoritesRoutes();
      }
    });
  });
}
