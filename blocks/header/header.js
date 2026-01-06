function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  if (!menuToggle || !mainNav) return;
  if (menuToggle.dataset.initialized === 'true') return;
  menuToggle.dataset.initialized = 'true';
  const toggleMenu = (open) => {
    menuToggle.setAttribute('aria-expanded', String(open));
    mainNav.setAttribute('aria-expanded', String(open));
    if (open) {
      mainNav.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
    } else {
      mainNav.classList.remove('menu-open');
      document.body.style.overflow = '';
    }
  };
  const handleToggleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    toggleMenu(!isExpanded);
  };
  const handleDocumentClick = (e) => {
    if (menuToggle.contains(e.target)) {
      return;
    }
    if (!mainNav.contains(e.target)) {
      if (mainNav.classList.contains('menu-open')) {
        toggleMenu(false);
      }
    }
  };
  const handleEscape = (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('menu-open')) {
      toggleMenu(false);
    }
  };
  menuToggle.addEventListener('click', handleToggleClick);
  const navLinks = mainNav.querySelectorAll('.header__nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleEscape);
}
export { initMobileMenu };
