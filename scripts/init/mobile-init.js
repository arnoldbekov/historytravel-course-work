import { initMobileMenu } from '../../blocks/header/header.js';
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof initMobileMenu === 'function') {
      initMobileMenu();
    }
  });
} else {
  if (typeof initMobileMenu === 'function') {
    initMobileMenu();
  }
}
