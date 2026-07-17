(() => {
  const initFlow = (section) => {
    const viewport = section.querySelector('[data-featured-viewport]');
    const track = section.querySelector('[data-featured-track]');
    const cards = [...section.querySelectorAll('[data-featured-card]')];
    const title = section.querySelector('[data-featured-title]');
    const meta = section.querySelector('[data-featured-meta]');
    const link = section.querySelector('[data-featured-link]');
    if (!viewport || !track || !cards.length) return;

    let selected = Math.floor(cards.length / 2);
    let dragging = false;
    let dragged = false;
    let startX = 0;
    let startScroll = 0;
    let raf = 0;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const update = () => {
      raf = 0;
      const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
      let closestIndex = selected;
      let closestDistance = Infinity;
      cards.forEach((card, index) => {
        const center = card.offsetLeft + card.offsetWidth / 2;
        const distance = (center - viewportCenter) / card.offsetWidth;
        const absDistance = Math.abs(distance);
        if (absDistance < closestDistance) { closestDistance = absDistance; closestIndex = index; }
        const offset = clamp(distance, -3, 3);
        // The angle remains tied to a card's relative position; only its horizontal spacing is compressed in CSS.
        const angle = clamp(offset * -25, -52, 52);
        const scale = Math.max(.68, 1.14 - absDistance * .17);
        card.style.transform = `perspective(1700px) rotateY(${angle}deg) translateZ(${Math.max(0, 80 - absDistance * 42)}px) scale(${scale})`;
        card.style.opacity = String(Math.max(.4, 1 - absDistance * .17));
      });
      if (!dragging && closestIndex !== selected) setSelected(closestIndex, false);
    };

    const setSelected = (index, scrollIntoView = true) => {
      selected = clamp(index, 0, cards.length - 1);
      const card = cards[selected];
      cards.forEach((item, itemIndex) => item.setAttribute('aria-current', itemIndex === selected ? 'true' : 'false'));
      if (title) title.textContent = card.dataset.title || '';
      if (meta) meta.textContent = card.dataset.meta || '';
      if (link) link.href = card.dataset.link || '#categories';
      if (card.dataset.image) section.style.setProperty('--ff-background', `url("${card.dataset.image.replace(/"/g, '\\"')}")`);
      section.classList.add('is-ready');
      if (scrollIntoView) viewport.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - viewport.clientWidth / 2, behavior: 'smooth' });
      if (!raf) raf = requestAnimationFrame(update);
    };

    viewport.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    viewport.addEventListener('wheel', (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      viewport.scrollLeft += event.deltaY;
    }, { passive: false });
    viewport.addEventListener('pointerdown', (event) => {
      dragging = true; dragged = false; startX = event.clientX; startScroll = viewport.scrollLeft;
      viewport.setPointerCapture(event.pointerId); viewport.classList.add('is-dragging');
    });
    viewport.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 4) dragged = true;
      viewport.scrollLeft = startScroll - delta;
    });
    const finishDrag = (event) => {
      if (!dragging) return;
      dragging = false; viewport.classList.remove('is-dragging');
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      if (!raf) raf = requestAnimationFrame(update);
    };
    viewport.addEventListener('pointerup', finishDrag);
    viewport.addEventListener('pointercancel', finishDrag);
    cards.forEach((card, index) => card.addEventListener('click', (event) => {
      event.preventDefault();
      if (!dragged) setSelected(index);
    }));
    viewport.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') setSelected(selected - 1);
      if (event.key === 'ArrowRight') setSelected(selected + 1);
      if (event.key === 'Home') setSelected(0);
      if (event.key === 'End') setSelected(cards.length - 1);
    });
    window.addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    setSelected(selected, false);
    // Start on the middle card so the selected item has neighbouring cards on
    // both sides, matching the intended converging cover-flow composition.
    requestAnimationFrame(() => setSelected(selected, true));
  };

  document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('[data-featured-flow]').forEach(initFlow));
})();
