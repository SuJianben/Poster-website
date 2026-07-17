(() => {
  const setupDepthCard = (card) => {
    const surface = card.querySelector('.editorial-depth-card__surface');
    if (!surface || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let leaveTimer;
    const reset = () => {
      card.style.setProperty('--depth-rotate-x', '0deg');
      card.style.setProperty('--depth-rotate-y', '0deg');
      card.style.setProperty('--depth-image-x', '0px');
      card.style.setProperty('--depth-image-y', '0px');
    };

    card.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;

      clearTimeout(leaveTimer);
      card.style.setProperty('--depth-rotate-y', `${x * 30}deg`);
      card.style.setProperty('--depth-rotate-x', `${y * -30}deg`);
      card.style.setProperty('--depth-image-x', `${x * -40}px`);
      card.style.setProperty('--depth-image-y', `${y * -40}px`);
    });

    card.addEventListener('pointerleave', () => {
      leaveTimer = window.setTimeout(reset, 1000);
    });
    card.addEventListener('blur', reset);
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-depth-card]').forEach(setupDepthCard);
  });
})();
