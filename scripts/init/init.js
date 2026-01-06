import { appState } from '../utils/data.js';
import { setupTimeline, renderTimelineEvents } from '../../blocks/timeline/timeline.js';
import { setupSearch, applyFilters } from '../../blocks/search/search.js';
import { setupMapInteractions, setupMapInteractionsRoutes, setupHideMapButton, setupMapModal, setupMapModalRoutes } from '../../blocks/map-svg/map-svg.js';
import { setupModals } from '../../blocks/modals/modals.js';
import { buildStats } from '../../blocks/stats/stats.js';
import { buildGallery } from '../../blocks/gallery/gallery.js';
import { checkAndFocusPlaceOnLoad } from '../../blocks/navigation/navigation.js';
import { initMobileMenu } from '../../blocks/header/header.js';
import { renderObjectGrid } from '../../blocks/cards/cards.js';
function initApp() {
  if (typeof initMobileMenu === 'function') {
    const toggle = document.getElementById('menuToggle');
    if (toggle && !toggle.dataset.initialized) {
      initMobileMenu();
      toggle.dataset.initialized = 'true';
    }
  }
  if (typeof window.setupTimeline === 'function') window.setupTimeline();
  if (typeof window.setupSearch === 'function') window.setupSearch();
  if (typeof window.setupMapInteractions === 'function') window.setupMapInteractions();
  if (typeof window.setupMapInteractionsRoutes === 'function') window.setupMapInteractionsRoutes();
  if (typeof window.setupMapModal === 'function') window.setupMapModal();
  if (typeof window.setupMapModalRoutes === 'function') window.setupMapModalRoutes();
  if (typeof window.setupRoutes === 'function') window.setupRoutes();
  if (typeof window.setupModals === 'function') window.setupModals();
  if (typeof window.renderTimelineEvents === 'function') window.renderTimelineEvents();
  if (typeof window.applyFilters === 'function') window.applyFilters();
  if (typeof window.loadSavedRoutes === 'function') window.loadSavedRoutes();
  if (typeof window.buildStats === 'function') window.buildStats();
  const galleryGrid = document.getElementById('galleryGrid');
  if (galleryGrid && typeof window.buildGallery === 'function') {
    const checkAndBuildGallery = (attempt = 0) => {
      const places = appState.places || window.places || [];
      if (Array.isArray(places) && places.length > 0) {
        try {
          window.buildGallery();
        } catch (error) {
          console.error('Error building gallery:', error);
        }
      } else if (attempt < 10) {
        setTimeout(() => checkAndBuildGallery(attempt + 1), 200);
      }
    };
    checkAndBuildGallery();
  }
  if (typeof window.setupHideMapButton === 'function') window.setupHideMapButton();
  const objectsGrid = document.getElementById('objectsGrid');
  if (objectsGrid && typeof window.renderObjectGrid === 'function') {
    const checkAndRenderGrid = (attempt = 0) => {
      const places = appState.places || window.places || [];
      if (Array.isArray(places) && places.length > 0) {
        try {
          window.renderObjectGrid();
        } catch (error) {
          console.error('Error rendering object grid:', error);
        }
      } else if (attempt < 10) {
        setTimeout(() => checkAndRenderGrid(attempt + 1), 200);
      }
    };
    checkAndRenderGrid();
  }
  setTimeout(async () => {
    if (typeof window.loadAndRenderMapZones === 'function') {
      const mapContent = document.getElementById('mapContent');
      const mapContentRoutes = document.getElementById('mapContentRoutes');
      const promises = [];
      if (mapContent) {
        promises.push(window.loadAndRenderMapZones('mapContent'));
      }
      if (mapContentRoutes) {
        promises.push(window.loadAndRenderMapZones('mapContentRoutes'));
      }
      await Promise.all(promises);
      if (typeof window.checkAndFocusPlaceOnLoad === 'function') {
        window.checkAndFocusPlaceOnLoad();
      }
      if (typeof window.checkAndShowSavedRoute === 'function') {
        setTimeout(() => window.checkAndShowSavedRoute(), 200);
      }
    } else {
      setTimeout(() => {
        if (typeof window.checkAndFocusPlaceOnLoad === 'function') {
          window.checkAndFocusPlaceOnLoad();
        }
        if (typeof window.checkAndShowSavedRoute === 'function') {
          window.checkAndShowSavedRoute();
        }
      }, 500);
    }
  }, 100);
  if (window.location.pathname.includes('routes.html')) {
    const mapSection = document.getElementById('map');
    if (mapSection) {
      mapSection.style.display = 'block';
    }
  }
}
export { initApp };
