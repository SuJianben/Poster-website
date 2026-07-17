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
    let settleTimer = 0;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const getClosestIndex = () => {
      const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
      let closestIndex = selected;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const center = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(center - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    };

    const update = () => {
      raf = 0;
      const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;

      cards.forEach((card) => {
        const center = card.offsetLeft + card.offsetWidth / 2;
        const distance = (center - viewportCenter) / card.offsetWidth;
        const absDistance = Math.abs(distance);
        const offset = clamp(distance, -3, 3);
        const angle = clamp(offset * -25, -52, 52);
        const scale = Math.max(.68, 1.14 - absDistance * .17);

        card.style.transform = `perspective(1700px) rotateY(${angle}deg) translateZ(${Math.max(0, 80 - absDistance * 42)}px) scale(${scale})`;
        card.style.opacity = String(Math.max(.4, 1 - absDistance * .17));
        card.style.zIndex = String(Math.max(1, Math.round(100 - absDistance * 12)));
      });
    };

    const commitSelection = (index) => {
      selected = clamp(index, 0, cards.length - 1);
      const card = cards[selected];

      cards.forEach((item, itemIndex) => item.setAttribute('aria-current', itemIndex === selected ? 'true' : 'false'));
      if (title) title.textContent = card.dataset.title || '';
      if (meta) meta.textContent = card.dataset.meta || '';
      if (link) link.href = card.dataset.link || '#categories';
      if (card.dataset.image) section.style.setProperty('--ff-background', `url("${card.dataset.image.replace(/"/g, '\\\"')}")`);
      section.classList.add('is-ready');

      if (!raf) raf = requestAnimationFrame(update);
    };

    const queueSettle = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => commitSelection(getClosestIndex()), 130);
    };

    const goTo = (index) => {
      const nextIndex = clamp(index, 0, cards.length - 1);
      const card = cards[nextIndex];

      // Update the copy once per deliberate navigation; scroll events only redraw the card positions.
      commitSelection(nextIndex);
      viewport.scrollTo({
        left: card.offsetLeft + card.offsetWidth / 2 - viewport.clientWidth / 2,
        behavior: 'smooth'
      });
      queueSettle();
    };

    viewport.addEventListener('scroll', () => {
      if (!raf) raf = requestAnimationFrame(update);
      if (!dragging) queueSettle();
    }, { passive: true });

    viewport.addEventListener('wheel', (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      viewport.scrollLeft += event.deltaY;
    }, { passive: false });

    viewport.addEventListener('pointerdown', (event) => {
      dragging = true;
      dragged = false;
      startX = event.clientX;
      startScroll = viewport.scrollLeft;
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-dragging');
    });

    viewport.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 4) dragged = true;
      viewport.scrollLeft = startScroll - delta;
    });

    const finishDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove('is-dragging');
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      if (!raf) raf = requestAnimationFrame(update);
      queueSettle();
    };

    viewport.addEventListener('pointerup', finishDrag);
    viewport.addEventListener('pointercancel', finishDrag);

    cards.forEach((card, index) => card.addEventListener('click', (event) => {
      event.preventDefault();
      if (!dragged) goTo(index);
    }));

    viewport.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') goTo(selected - 1);
      if (event.key === 'ArrowRight') goTo(selected + 1);
      if (event.key === 'Home') goTo(0);
      if (event.key === 'End') goTo(cards.length - 1);
    });

    window.addEventListener('resize', () => {
      if (!raf) raf = requestAnimationFrame(update);
      queueSettle();
    }, { passive: true });

    const initialIndex = selected;
    commitSelection(initialIndex);

    // Wait for poster dimensions to resolve, then position the initial card without
    // triggering an intermediate scroll animation.
    window.setTimeout(() => {
      const initialCard = cards[initialIndex];
      viewport.scrollLeft = initialCard.offsetLeft + initialCard.offsetWidth / 2 - viewport.clientWidth / 2;
      commitSelection(initialIndex);
      update();
    }, 80);
  };

  document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('[data-featured-flow]').forEach(initFlow));
})();
