function initAOS() {
  if (window.AOS) {
    try {
      AOS.init({ duration: 700, once: true, offset: 100, easing: 'ease-out-cubic', delay: 0 });
    } catch (e) {
      console.error('AOS init failed on about page', e);
    }
  } else {
    setTimeout(() => {
      if (window.AOS) {
        try {
          AOS.init({ duration: 700, once: true, offset: 100, easing: 'ease-out-cubic', delay: 0 });
        } catch (e) {
          console.error('AOS init failed on about page (retry)', e);
        }
      } else {
        setTimeout(initAOS, 100);
      }
    }, 100);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
});
