document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  document.querySelectorAll('.cover-flow').forEach((track) => {
    const applyTransforms = () => {
      const cards = track.querySelectorAll('.cover-flow-item');
      const center = track.scrollLeft + track.clientWidth / 2;
      cards.forEach((card) => {
        const itemCenter = card.offsetLeft + card.offsetWidth / 2;
        const delta = (itemCenter - center) / card.offsetWidth;
        const clamped = Math.max(-2.5, Math.min(2.5, delta));
        card.style.transform = `perspective(1600px) rotateY(${clamped * -30}deg) scale(${Math.max(.7, 1.2 - Math.abs(clamped) * .3)})`;
        card.style.opacity = String(Math.max(.45, 1 - Math.abs(clamped) * .3));
      });
    };
    applyTransforms();
    track.addEventListener('scroll', () => requestAnimationFrame(applyTransforms), { passive: true });
  });
});
