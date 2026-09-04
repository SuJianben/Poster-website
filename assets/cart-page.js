(() => {
  const page = document.querySelector('[data-cart-page]');
  if (!page) return;

  const money = (cents) => new Intl.NumberFormat(document.documentElement.lang || 'en', {
    style: 'currency', currency: window.Shopify?.currency?.active || 'USD',
  }).format(cents / 100);
  const isFramingComponent = (item) => Boolean(item.properties?._framing_component);
  const visibleItems = (cart) => cart.items.filter((item) => !isFramingComponent(item));
  const visibleCount = (cart) => visibleItems(cart).reduce((total, item) => total + item.quantity, 0);
  const childItems = (cart, parent) => {
    const configurationId = parent.properties?._framing_config;
    return configurationId ? cart.items.filter((item) => isFramingComponent(item) && item.properties?._framing_config === configurationId) : [];
  };
  const fetchCart = async () => {
    const response = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Cart could not be loaded.');
    return response.json();
  };

  const refreshCartUi = (cart) => {
    const displayCount = visibleCount(cart);
    document.querySelectorAll('.cart-count').forEach((badge) => {
      badge.textContent = displayCount;
      badge.hidden = displayCount === 0;
    });
    const count = page.querySelector('[data-cart-page-count]');
    if (count) count.textContent = displayCount;
    const total = page.querySelector('[data-cart-page-total]');
    if (total) total.textContent = money(cart.total_price);

    visibleItems(cart).forEach((item) => {
      const row = page.querySelector(`[data-cart-page-line="${CSS.escape(item.key)}"]`);
      if (!row) return;
      const input = row.querySelector('[data-cart-page-quantity]');
      if (input) input.value = item.quantity;
      const configuredLinePrice = childItems(cart, item).reduce((sum, child) => sum + child.final_line_price, item.final_line_price);
      const lineTotal = row.querySelector('[data-cart-page-line-total]');
      if (lineTotal) lineTotal.textContent = money(configuredLinePrice);
    });
  };

  const changeGroup = async (row, quantity) => {
    if (!row || row.classList.contains('is-updating')) return;
    row.classList.add('is-updating');
    try {
      const before = await fetchCart();
      const parent = before.items.find((item) => item.key === row.dataset.cartPageLine);
      if (!parent) throw new Error('Configured cart item was not found.');
      const group = [parent, ...childItems(before, parent)];
      const updates = Object.fromEntries(group.map((item) => [item.key, quantity]));
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (!response.ok) throw new Error('Cart update failed.');
      const cart = await response.json();
      if (quantity === 0) row.remove();
      if (!visibleCount(cart)) window.location.reload();
      refreshCartUi(cart);
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
      window.dataLayer?.push({
        event: 'cart_framing_quantity_changed', cart_line_key: parent.key,
        quantity, component_count: Math.max(0, group.length - 1),
      });
    } catch (error) {
      console.error(error);
    } finally {
      row.classList.remove('is-updating');
    }
  };

  const rail = page.querySelector('[data-cart-recent-rail]');
  const progress = page.querySelector('[data-cart-recent-progress]');
  const previous = page.querySelector('[data-cart-recent-scroll="prev"]');
  const next = page.querySelector('[data-cart-recent-scroll="next"]');
  const updateCarousel = () => {
    if (!rail) return;
    const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const ratio = max ? rail.scrollLeft / max : 0;
    if (progress) progress.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
    if (previous) previous.disabled = rail.scrollLeft < 2;
    if (next) next.disabled = rail.scrollLeft >= max - 2;
  };

  page.addEventListener('click', (event) => {
    const change = event.target.closest('[data-cart-page-change]');
    if (change) {
      const row = change.closest('[data-cart-page-line]');
      const input = row?.querySelector('[data-cart-page-quantity]');
      const delta = Number(change.dataset.cartPageChange);
      changeGroup(row, delta === 0 ? 0 : Math.max(0, Number(input?.value || 1) + delta));
      return;
    }
    const control = event.target.closest('[data-cart-recent-scroll]');
    if (control && rail) {
      const card = rail.querySelector('.cp-recent__card');
      rail.scrollBy({ left: (control.dataset.cartRecentScroll === 'next' ? 1 : -1) * ((card?.getBoundingClientRect().width || 260) + 26), behavior: 'smooth' });
    }
  });
  page.addEventListener('change', (event) => {
    if (event.target.matches('[data-cart-page-quantity]')) {
      changeGroup(event.target.closest('[data-cart-page-line]'), Math.max(0, Number(event.target.value || 0)));
    }
  });
  if (rail) {
    rail.addEventListener('scroll', updateCarousel, { passive: true });
    window.addEventListener('resize', updateCarousel);
    updateCarousel();
  }
})();
