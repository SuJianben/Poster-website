(() => {
  const POINTER_RETURN_DELAY = 500;

  const trackHoverPreview = (card, index) => {
    if (!card.classList.contains('has-hover-image') || card.dataset.hoverTracked === 'true') return;
    card.dataset.hoverTracked = 'true';
    const detail = {
      event: 'editorial_product_hover_image',
      product_handle: card.dataset.productHandle || '',
      card_position: index + 1
    };
    window.dataLayer?.push(detail);
    document.dispatchEvent(new CustomEvent('posterandform:analytics', { detail }));
  };

  const setupDepthCard = (card, index) => {
    if (card.dataset.depthReady === 'true') return;
    card.dataset.depthReady = 'true';
    const surface = card.querySelector('.editorial-depth-card__surface');
    if (!surface) return;

    const supportsPointerHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let leaveTimer = null;

    const cancelReturn = () => {
      if (leaveTimer === null) return;
      window.clearTimeout(leaveTimer);
      leaveTimer = null;
    };

    const resetPointerState = () => {
      card.classList.remove('is-pointer-hovered');
      card.style.setProperty('--depth-rotate-x', '0deg');
      card.style.setProperty('--depth-rotate-y', '0deg');
      card.style.setProperty('--depth-image-x', '0px');
      card.style.setProperty('--depth-image-y', '0px');
      leaveTimer = null;
    };

    card.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch') return;
      trackHoverPreview(card, index);
      if (!supportsPointerHover) return;
      cancelReturn();
      card.classList.add('is-pointer-hovered');
    }, { passive: true });

    card.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'touch' || !supportsPointerHover) return;
      cancelReturn();
      leaveTimer = window.setTimeout(resetPointerState, POINTER_RETURN_DELAY);
    }, { passive: true });

    if (prefersReducedMotion) return;

    card.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch' || !supportsPointerHover) return;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;

      cancelReturn();
      card.style.setProperty('--depth-rotate-y', `${x * 30}deg`);
      card.style.setProperty('--depth-rotate-x', `${y * -30}deg`);
      card.style.setProperty('--depth-image-x', `${x * -40}px`);
      card.style.setProperty('--depth-image-y', `${y * -40}px`);
    });
  };

  const setupCards = (scope = document) => {
    scope.querySelectorAll('[data-depth-card]').forEach(setupDepthCard);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setupCards(), { once: true });
  } else {
    setupCards();
  }
  document.addEventListener('shopify:section:load', (event) => setupCards(event.target));
})();


