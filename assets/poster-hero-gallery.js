(() => {
  const initGallery = (section) => {
    const items = [...section.querySelectorAll('[data-phg-item]')];
    const copy = section.querySelector('[data-phg-copy]');
    const title = section.querySelector('[data-phg-title]');
    const text = section.querySelector('[data-phg-text]');
    const link = section.querySelector('[data-phg-link]');
    const counter = section.querySelector('[data-phg-counter]');
    const previous = section.querySelector('[data-phg-prev]');
    const next = section.querySelector('[data-phg-next]');
    if (!items.length || !copy || !title || !text || !link || !counter) return;
    let activeIndex = Math.max(0, items.findIndex((item) => item.classList.contains('is-active')));
    let queue = items.map((_, index) => index).filter((index) => index !== activeIndex);
    const setThumbOffsets = () => queue.forEach((index, queueIndex) => items[index].style.setProperty('--phg-offset', String(queueIndex - (queue.length - 1) / 2)));
    const updateCopy = (item, index) => {
      title.textContent = item.dataset.title || ''; text.textContent = item.dataset.text || ''; link.textContent = item.dataset.label || ''; link.href = item.dataset.link || '#'; link.hidden = !item.dataset.link || !item.dataset.label;
      counter.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
      copy.style.animation = 'none'; requestAnimationFrame(() => { copy.style.animation = ''; });
    };
    const goTo = (index) => {
      const nextIndex = (index + items.length) % items.length; if (nextIndex === activeIndex) return;
      const oldIndex = activeIndex; items[oldIndex].classList.remove('is-active'); items[oldIndex].setAttribute('aria-hidden', 'true'); activeIndex = nextIndex; items[activeIndex].classList.add('is-active'); items[activeIndex].setAttribute('aria-hidden', 'false');
      queue = [...queue.filter((itemIndex) => itemIndex !== activeIndex), oldIndex]; setThumbOffsets(); updateCopy(items[activeIndex], activeIndex);
    };
    items.forEach((item, index) => { const control = item.querySelector('[data-phg-go]'); if (control) control.addEventListener('click', () => goTo(index)); });
    previous?.addEventListener('click', () => goTo(queue[queue.length - 1] ?? activeIndex - 1));
    next?.addEventListener('click', () => goTo(queue[0] ?? activeIndex + 1));
    section.addEventListener('keydown', (event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); previous?.click(); } if (event.key === 'ArrowRight') { event.preventDefault(); next?.click(); } });
    setThumbOffsets(); updateCopy(items[activeIndex], activeIndex);
  };
  document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('[data-poster-hero-gallery]').forEach(initGallery));
})();