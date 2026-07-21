(() => {
  'use strict';
  const initGallery = (section) => {
    if (section.dataset.ready === 'true') return;
    section.dataset.ready = 'true';
    const items = [...section.querySelectorAll('[data-phg-item]')];
    const copy = section.querySelector('[data-phg-copy]');
    const title = section.querySelector('[data-phg-title]');
    const text = section.querySelector('[data-phg-text]');
    const counter = section.querySelector('[data-phg-counter]');
    const previous = section.querySelector('[data-phg-prev]');
    const next = section.querySelector('[data-phg-next]');
    const thumbnails = [...section.querySelectorAll('[data-phg-thumbnail]')];
    if (!items.length || !copy || !title || !text || !counter) return;
    let activeIndex = Math.max(0, items.findIndex((item) => item.classList.contains('is-active')));
    const updateThumbnails = () => {
      const visibleIndexes = [
        (activeIndex - 1 + items.length) % items.length,
        activeIndex,
        (activeIndex + 1) % items.length
      ];
      items.forEach((item) => item.querySelector('.phg__slide')?.style.removeProperty('filter'));
      items[activeIndex].querySelector('.phg__slide')?.style.setProperty('filter', 'brightness(1)', 'important');
      thumbnails.forEach((thumbnail, index) => {
        const slot = visibleIndexes.indexOf(index);
        thumbnail.hidden = slot === -1;
        thumbnail.tabIndex = slot === -1 ? -1 : 0;
        thumbnail.classList.toggle('is-visible', slot !== -1);
        thumbnail.classList.toggle('is-current', index === activeIndex);
        thumbnail.classList.remove('is-slot-0', 'is-slot-1', 'is-slot-2');
        if (slot !== -1) thumbnail.classList.add(`is-slot-${slot}`);
      });
    };
    const updateCopy = (item, index) => {
      title.textContent = item.dataset.title || '';
      text.textContent = item.dataset.text || '';
      counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      copy.style.animation = 'none'; requestAnimationFrame(() => { copy.style.animation = ''; });
    };
    const goTo = (index) => {
      const nextIndex = (index + items.length) % items.length;
      if (nextIndex === activeIndex) return;
      const oldIndex = activeIndex;
      items[oldIndex].classList.remove('is-active'); items[oldIndex].setAttribute('aria-hidden', 'true');
      activeIndex = nextIndex;
      items[activeIndex].classList.add('is-active'); items[activeIndex].setAttribute('aria-hidden', 'false');
      updateThumbnails(); updateCopy(items[activeIndex], activeIndex);
      section.dispatchEvent(new CustomEvent('poster:hero-change', { bubbles:true, detail:{ image:items[activeIndex].querySelector('img') } }));
    };
    thumbnails.forEach((thumbnail, index) => thumbnail.addEventListener('click', () => goTo(index)));
    previous?.addEventListener('click', () => goTo(activeIndex - 1));
    next?.addEventListener('click', () => goTo(activeIndex + 1));
    section.addEventListener('keydown', (event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); previous?.click(); } if (event.key === 'ArrowRight') { event.preventDefault(); next?.click(); } });
    updateThumbnails(); updateCopy(items[activeIndex], activeIndex);
  };
  const initialise = () => document.querySelectorAll('[data-poster-hero-gallery]').forEach(initGallery);
  document.addEventListener('shopify:section:load', (event) => event.target.querySelectorAll?.('[data-poster-hero-gallery]').forEach(initGallery));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once:true }); else initialise();
})();
