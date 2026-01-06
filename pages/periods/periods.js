document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.period-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 80}ms`;
  });
});
