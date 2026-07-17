(() => {
  'use strict';
  const initCarousel = (section) => {
    if (section.dataset.ready === 'true') return;
    section.dataset.ready = 'true';
    const track = section.querySelector('[data-tilted-track]');
    const slides = [...section.querySelectorAll('[data-tilted-slide]')];
    const dots = [...section.querySelectorAll('[data-tilted-dot]')];
    const previous = section.querySelector('[data-tilted-previous]');
    const next = section.querySelector('[data-tilted-next]');
    if (!track || !slides.length) return;
    let activeIndex = Math.min(3, slides.length - 1);
    const render = () => {
      section.style.setProperty('--tc-active', String(activeIndex));
      track.style.transform = `translate3d(${-activeIndex * 100 / slides.length}%, 0, 0)`;
      slides.forEach((slide, index) => { const isActive = index === activeIndex; slide.classList.toggle('is-active', isActive); slide.setAttribute('aria-current', String(isActive)); slide.style.setProperty('--tc-index', String(index)); });
      dots.forEach((dot, index) => { const isActive = index === activeIndex; dot.classList.toggle('is-active', isActive); dot.setAttribute('aria-current', String(isActive)); });
      previous.disabled = activeIndex === 0; next.disabled = activeIndex === slides.length - 1;
    };
    const select = (index) => { activeIndex = Math.max(0, Math.min(index, slides.length - 1)); render(); };
    slides.forEach((slide, index) => slide.querySelector('[data-tilted-select]')?.addEventListener('click', () => select(index)));
    dots.forEach((dot, index) => dot.addEventListener('click', () => select(index)));
    previous?.addEventListener('click', () => select(activeIndex - 1));
    next?.addEventListener('click', () => select(activeIndex + 1));
    section.addEventListener('keydown', (event) => { if (event.key === 'ArrowLeft') select(activeIndex - 1); if (event.key === 'ArrowRight') select(activeIndex + 1); });
    render();
  };
  const initialise = () => document.querySelectorAll('[data-tilted-carousel]').forEach(initCarousel);
  document.addEventListener('shopify:section:load', (event) => event.target.querySelectorAll?.('[data-tilted-carousel]').forEach(initCarousel));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once:true }); else initialise();
})();
