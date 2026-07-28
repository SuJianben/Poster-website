(() => {
  const page = document.querySelector('[data-cart-page]');
  if (!page) return;

  const money = (cents) => new Intl.NumberFormat(document.documentElement.lang || 'en', {
    style: 'currency', currency: window.Shopify?.currency?.active || 'USD'
  }).format(cents / 100);
  const refreshCartUi = (cart) => {
    document.querySelectorAll('.cart-count').forEach((badge) => { badge.textContent = cart.item_count; badge.hidden = cart.item_count === 0; });
    const titleCount = page.querySelector('[data-cart-page-count]');
    if (titleCount) titleCount.textContent = cart.item_count;
    const total = page.querySelector('[data-cart-page-total]');
    if (total) total.textContent = money(cart.total_price);
    cart.items.forEach((item) => {
      const row = page.querySelector(`[data-cart-page-line="${CSS.escape(item.key)}"]`);
      if (!row) return;
      const quantity = row.querySelector('[data-cart-page-quantity]');
      const lineTotal = row.querySelector('[data-cart-page-line-total]');
      if (quantity) quantity.value = item.quantity;
      if (lineTotal) lineTotal.textContent = money(item.final_line_price);
    });
  };
  const changeLine = async (row, quantity) => {
    if (!row || row.classList.contains('is-updating')) return;
    row.classList.add('is-updating');
    try {
      const response = await fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ id: row.dataset.cartPageLine, quantity }) });
      if (!response.ok) throw new Error('Cart update failed');
      const cart = await response.json();
      if (!cart.item_count || quantity === 0) { row.remove(); if (!cart.item_count) window.location.reload(); }
      refreshCartUi(cart);
    } catch (error) { console.error(error); } finally { row.classList.remove('is-updating'); }
  };
  document.addEventListener('click', (event) => {
    const control = event.target.closest('[data-cart-page-change]');
    if (control) { const row = control.closest('[data-cart-page-line]'); const input = row?.querySelector('[data-cart-page-quantity]'); const delta = Number(control.dataset.cartPageChange); changeLine(row, delta === 0 ? 0 : Math.max(0, Number(input?.value || 1) + delta)); return; }
    const scroll = event.target.closest('[data-cart-recent-scroll]');
    if (scroll) page.querySelector('[data-cart-recent-rail]')?.scrollBy({ left: (scroll.dataset.cartRecentScroll === 'next' ? 1 : -1) * 960, behavior: 'smooth' });
  });
  page.addEventListener('change', (event) => { if (event.target.matches('[data-cart-page-quantity]')) changeLine(event.target.closest('[data-cart-page-line]'), Math.max(0, Number(event.target.value || 0))); });
})();
