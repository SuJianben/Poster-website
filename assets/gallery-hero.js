(() => {
  'use strict';

  const initGalleryHero = (hero) => {
    if (hero.dataset.ready === 'true') return;
    hero.dataset.ready = 'true';

    const slides = [...hero.querySelectorAll('[data-gallery-slide]')];
    const copies = [...hero.querySelectorAll('[data-gallery-copy]')];
    const thumbnails = [...hero.querySelectorAll('[data-gallery-thumbnail]')];
    const counters = [...hero.querySelectorAll('[data-gallery-counter]')];
    const previous = hero.querySelector('[data-gallery-previous]');
    const next = hero.querySelector('[data-gallery-next]');
    if (slides.length < 2) return;

    let activeIndex = 0;
    const show = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });
      copies.forEach((copy, copyIndex) => {
        const isActive = copyIndex === activeIndex;
        copy.classList.toggle('is-active', isActive);
        copy.hidden = !isActive;
      });
      thumbnails.forEach((thumbnail, thumbnailIndex) => {
        const isActive = thumbnailIndex === activeIndex;
        thumbnail.classList.toggle('is-active', isActive);
        thumbnail.setAttribute('aria-current', String(isActive));
      });
      counters.forEach((counter) => {
        counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      });
      const image = slides[activeIndex].querySelector('img');
      hero.dispatchEvent(new CustomEvent('poster:hero-change', { bubbles: true, detail: { image } }));
    };

    thumbnails.forEach((thumbnail, index) => thumbnail.addEventListener('click', () => show(index)));
    previous?.addEventListener('click', () => show(activeIndex - 1));
    next?.addEventListener('click', () => show(activeIndex + 1));
    hero.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(activeIndex - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(activeIndex + 1); }
    });
    show(0);
  };

  const initialise = () => document.querySelectorAll('[data-gallery-hero]').forEach(initGalleryHero);
  document.addEventListener('shopify:section:load', (event) => event.target.querySelectorAll?.('[data-gallery-hero]').forEach(initGalleryHero));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
})();
