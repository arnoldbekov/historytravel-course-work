function initAOS() {
  if (window.AOS) {
    AOS.init({ duration: 700, once: true, offset: 100, easing: 'ease-out-cubic', delay: 0 });
  } else {
    setTimeout(() => {
      if (window.AOS) {
        AOS.init({ duration: 700, once: true, offset: 100, easing: 'ease-out-cubic', delay: 0 });
      } else {
        setTimeout(initAOS, 100);
      }
    }, 100);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
});
