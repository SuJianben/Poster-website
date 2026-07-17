(() => {
  'use strict';
  const initCarousel = (section) => {
    if (section.dataset.ready === 'true') return;
    section.dataset.ready = 'true';
    const viewport = section.querySelector('[data-tilted-viewport]');
    const track = section.querySelector('[data-tilted-track]');
    const slides = [...section.querySelectorAll('[data-tilted-slide]')];
    const dots = [...section.querySelectorAll('[data-tilted-dot]')];
    const previous = section.querySelector('[data-tilted-previous]');
    const next = section.querySelector('[data-tilted-next]');
    const productTitle = section.querySelector('[data-tilted-title]');
    const productMeta = section.querySelector('[data-tilted-meta]');
    const productLink = section.querySelector('[data-tilted-link]');
    if (!viewport || !track || !slides.length) return;
    let activeIndex = Math.min(3, slides.length - 1);
    const centerActiveCard = () => {
      const activeSlide = slides[activeIndex];
      const targetOffset = activeSlide.offsetLeft + (activeSlide.offsetWidth / 2) - (viewport.clientWidth / 2);
      track.style.transform = `translate3d(${-targetOffset}px, 0, 0)`;
    };
    const render = () => {
      section.dataset.activeIndex = String(activeIndex);
      section.style.setProperty('--tc-active', String(activeIndex));
      slides.forEach((slide, index) => { const isActive = index === activeIndex; slide.classList.toggle('is-active', isActive); slide.setAttribute('aria-current', String(isActive)); slide.style.setProperty('--tc-index', String(index)); });
      dots.forEach((dot, index) => { const isActive = index === activeIndex; dot.classList.toggle('is-active', isActive); dot.setAttribute('aria-current', String(isActive)); });
      const activeSlide = slides[activeIndex];
      if (productTitle) productTitle.textContent = activeSlide.dataset.title || '';
      if (productMeta) productMeta.textContent = activeSlide.dataset.meta || '';
      if (productLink) productLink.href = activeSlide.dataset.link || '#';
      requestAnimationFrame(centerActiveCard);
    };
    const select = (index) => { activeIndex = Math.max(0, Math.min(index, slides.length - 1)); render(); };
    slides.forEach((slide, index) => slide.querySelector('[data-tilted-select]')?.addEventListener('click', () => select(index)));
    dots.forEach((dot, index) => dot.addEventListener('click', () => select(index)));
    previous?.addEventListener('click', () => select(activeIndex - 1));
    next?.addEventListener('click', () => select(activeIndex + 1));
    section.addEventListener('keydown', (event) => { if (event.key === 'ArrowLeft') select(activeIndex - 1); if (event.key === 'ArrowRight') select(activeIndex + 1); });
    window.addEventListener('resize', centerActiveCard, { passive:true });
    render();
  };
  const initialise = () => document.querySelectorAll('[data-tilted-carousel]').forEach(initCarousel);
  document.addEventListener('shopify:section:load', (event) => event.target.querySelectorAll?.('[data-tilted-carousel]').forEach(initCarousel));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once:true }); else initialise();
})();
