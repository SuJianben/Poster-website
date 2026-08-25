(() => {
  const root = document.querySelector('[data-ps-product]');
  const badge = root?.querySelector('[data-ps-sale-badge]');
  const value = badge?.querySelector('[data-ps-sale-badge-value]');
  if (!root || !badge || !value) return;

  const render = (variant) => {
    const price = Number(variant?.price || 0);
    const compareAtPrice = Number(variant?.compare_at_price || 0);
    const hasDiscount = compareAtPrice > price && compareAtPrice > 0;
    badge.classList.toggle('is-hidden', !hasDiscount);
    if (!hasDiscount) return;
    value.textContent = `${Math.round(((compareAtPrice - price) * 100) / compareAtPrice)}%`;
  };

  root.addEventListener('product:variant-change', (event) => render(event.detail?.variant));
})();

