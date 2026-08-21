(() => {
  const init = () => {
  const drawer = document.querySelector('[data-cart-drawer]');
  if (!drawer) return;

  const panel = drawer.querySelector('.cd-drawer__panel');
  const content = drawer.querySelector('[data-cart-drawer-content]');
  const footer = drawer.querySelector('[data-cart-drawer-footer]');
  const count = drawer.querySelector('[data-cart-drawer-count]');
  const paymentIconsTemplate = drawer.querySelector('[data-cart-drawer-payment-icons]');
  const paymentIconsMarkup = paymentIconsTemplate?.innerHTML.trim() || '';
  let latestCart = null;
  let addedRefreshToken = 0;
  const money = (cents) => new Intl.NumberFormat(document.documentElement.lang || 'en', { style: 'currency', currency: window.Shopify?.currency?.active || 'USD' }).format(cents / 100);
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  const fetchCart = async () => {
    const response = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Could not load cart');
    return response.json();
  };

  const open = () => {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-cart-drawer-open');
    window.setTimeout(() => panel?.focus(), 30);
  };
  const showLoading = () => {
    addedRefreshToken += 1;
    content.innerHTML = '<div class="cd-drawer__empty cd-drawer__loading"><p>Loading your cart…</p></div>';
    footer.hidden = true;
    open();
  };
  const showError = () => {
    addedRefreshToken += 1;
    content.innerHTML = '<div class="cd-drawer__empty cd-drawer__error" role="alert"><p>We couldn’t add this item to your cart. Please try again.</p><button type="button" data-cart-drawer-close>Close</button></div>';
    footer.hidden = true;
    open();
  };
  const showAddedFallback = () => {
    content.innerHTML = '<div class="cd-drawer__empty cd-drawer__added" role="status"><p>Added to cart.</p><a href="/cart">View cart</a><button type="button" data-cart-drawer-close>Continue shopping</button></div>';
    footer.hidden = true;
  };
  const showAdded = async (quantity = 1) => {
    const addedQuantity = Math.max(1, Number(quantity) || 1);
    const currentCount = Math.max(0, Number(document.querySelector('.cart-count')?.textContent || count?.textContent || 0));
    const nextCount = currentCount + addedQuantity;
    if (count) count.textContent = nextCount;
    document.querySelectorAll('.cart-count').forEach((badge) => { badge.textContent = nextCount; badge.hidden = false; });
    content.innerHTML = '<div class="cd-drawer__empty cd-drawer__loading" role="status"><p>Added to cart. Loading your cart…</p></div>';
    footer.hidden = true;
    open();
    const refreshToken = ++addedRefreshToken;
    const retryDelays = [800, 1600, 3000, 5000, 8000];
    for (let attempt = 0; attempt < retryDelays.length; attempt += 1) {
      await wait(retryDelays[attempt]);
      if (refreshToken !== addedRefreshToken) return null;
      try {
        const cart = await fetchCart();
        if (refreshToken !== addedRefreshToken) return null;
        render(cart);
        window.dataLayer?.push({ event: 'cart_drawer_refresh_recovered', retry_attempt: attempt + 1 });
        return cart;
      } catch (error) {
        // A confirmed cart addition must not be submitted again. Only the
        // read request is retried while Shopify or the edge limiter recovers.
      }
    }
    if (refreshToken === addedRefreshToken) {
      showAddedFallback();
      window.dataLayer?.push({ event: 'cart_drawer_refresh_deferred', retry_attempts: retryDelays.length });
    }
    return null;
  };
  const close = () => {
    addedRefreshToken += 1;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-cart-drawer-open');
  };
  const optionText = (item) => item.variant_title && item.variant_title !== 'Default Title' ? `<p class="cd-drawer__variant">${escapeHtml(item.variant_title)}</p>` : '';
  const artworkImage = (item) => typeof item.properties?.['Custom artwork'] === 'string' && item.properties['Custom artwork'].trim()
    ? item.properties['Custom artwork']
    : item.image || '';
  const propertyText = (item) => Object.entries(item.properties || {})
    .filter(([key, value]) => value && !key.startsWith('_') && !['Custom artwork', 'Passepartout', 'Frame'].includes(key))
    .map(([key, value]) => `<p class="cd-drawer__properties">${escapeHtml(key)}: ${escapeHtml(value)}</p>`).join('');
  const priceText = (item) => item.original_line_price > item.final_line_price ? `<s>${money(item.original_line_price)}</s><strong>${money(item.final_line_price)}</strong>` : money(item.final_line_price);
  const isFramingComponent = (item) => Boolean(item.properties?._framing_component);
  const visibleCount = (cart) => cart.items.filter((item) => !isFramingComponent(item)).reduce((total, item) => total + item.quantity, 0);
  const childItems = (cart, parent) => {
    const configurationId = parent.properties?._framing_config;
    return configurationId ? cart.items.filter((item) => isFramingComponent(item) && item.properties?._framing_config === configurationId) : [];
  };
  const componentText = (children) => children.map((item) => {
    const kind = item.properties?._framing_component === 'passepartout' ? 'Passepartout' : 'Frame';
    const style = item.properties?._framing_style || item.product_title;
    const size = item.properties?._framing_size || item.variant_title;
    return `<div class="cd-drawer__component"><span><b>${escapeHtml(kind)}</b> · ${escapeHtml(style)} · ${escapeHtml(size)}</span><strong>${money(item.final_line_price)}</strong></div>`;
  }).join('');
  const render = (cart) => {
    addedRefreshToken += 1;
    latestCart = cart;
    const displayCount = visibleCount(cart);
    if (count) count.textContent = displayCount;
    document.querySelectorAll('.cart-count').forEach((badge) => { badge.textContent = displayCount; badge.hidden = displayCount === 0; });
    if (!displayCount) {
      content.innerHTML = '<div class="cd-drawer__empty"><p>Your cart is empty.</p><a href="/collections/all" data-cart-drawer-close>Continue shopping</a></div>';
      footer.hidden = true;
      return;
    }
    content.innerHTML = cart.items.filter((item) => !isFramingComponent(item)).map((item) => {
      const children = childItems(cart, item);
      const configuredLinePrice = children.reduce((total, child) => total + child.final_line_price, item.final_line_price);
      return `<article class="cd-drawer__item" data-cart-line="${escapeHtml(item.key)}"><img class="cd-drawer__image" src="${escapeHtml(artworkImage(item))}" alt="${escapeHtml(item.product_title)}"><div class="cd-drawer__item-copy"><a class="cd-drawer__item-title" href="${escapeHtml(item.url)}">${escapeHtml(item.product_title)}</a>${optionText(item)}${propertyText(item)}${componentText(children)}<div class="cd-drawer__item-bottom"><div class="cd-drawer__quantity"><button type="button" data-cart-quantity="-1" aria-label="Decrease quantity">−</button><output>${item.quantity}</output><button type="button" data-cart-quantity="1" aria-label="Increase quantity">+</button></div><div class="cd-drawer__price">${money(configuredLinePrice)}</div></div></div><button class="cd-drawer__remove" type="button" data-cart-remove aria-label="Remove ${escapeHtml(item.product_title)}">×</button></article>`;
    }).join('');
    footer.hidden = false;
    footer.innerHTML = `<div class="cd-drawer__totals"><div class="cd-drawer__total-row"><span>Subtotal</span><span>${money(cart.total_price)}</span></div><div class="cd-drawer__total-row"><span>Shipping</span><span>Calculated at checkout</span></div></div><p class="cd-drawer__tax-note">Tax included. Shipping and discounts calculated at checkout.</p><a class="cd-drawer__checkout" href="/checkout"><span class="cd-drawer__lock" aria-hidden="true"></span><span class="cd-drawer__checkout-label">SECURE CHECKOUT</span></a><p class="cd-drawer__guarantee">Order without risk - 100% money-back guarantee</p>${paymentIconsMarkup}`;
  };
  const changeLine = async (key, quantity) => {
    drawer.classList.add('is-busy');
    try {
      const parent = latestCart?.items.find((item) => item.key === key);
      const group = parent ? [parent, ...childItems(latestCart, parent)] : [];
      const updates = Object.fromEntries((group.length ? group : [{ key }]).map((item) => [item.key, quantity]));
      const response = await fetch('/cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ updates }) });
      if (!response.ok) throw new Error('Could not update cart');
      const cart = await response.json();
      render(cart);
      window.dataLayer?.push({ event: 'cart_framing_quantity_changed', cart_line_key: key, quantity, component_count: Math.max(0, group.length - 1) });
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
    } finally { drawer.classList.remove('is-busy'); }
  };

  // Product forms use this small public bridge after Shopify confirms a cart add.
  // Keeping the render and open behavior here prevents page modules duplicating drawer state.
  window.CartDrawer = {
    open(cart) {
      if (cart) render(cart);
      open();
    },
    openLoading() {
      showLoading();
    },
    openError() {
      showError();
    },
    openAdded(quantity) {
      return showAdded(quantity);
    },
    refresh: async () => {
      const cart = await fetchCart();
      render(cart);
      return cart;
    }
  };

  drawer.addEventListener('click', (event) => {
    const closeControl = event.target.closest('[data-cart-drawer-close]');
    if (closeControl) { close(); return; }
    const item = event.target.closest('[data-cart-line]');
    if (!item) return;
    if (event.target.closest('[data-cart-remove]')) changeLine(item.dataset.cartLine, 0);
    const quantityControl = event.target.closest('[data-cart-quantity]');
    if (quantityControl) { const current = Number(item.querySelector('output')?.textContent || 1); changeLine(item.dataset.cartLine, Math.max(0, current + Number(quantityControl.dataset.cartQuantity))); }
  });
  document.addEventListener('click', async (event) => {
    const trigger = event.target.closest('[data-cart-drawer-open]');
    if (!trigger) return;
    event.preventDefault();
    showLoading();
    try { render(await fetchCart()); } catch (error) { console.error(error); showError(); }
  });
  document.addEventListener('cart:updated', (event) => { if (event.detail?.cart) window.CartDrawer.open(event.detail.cart); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && drawer.classList.contains('is-open')) close(); });
  };

  // The drawer markup is rendered at the bottom of the layout while this
  // deferred asset is loaded in the head. Initialise only after that markup
  // exists so product-page AJAX adds and the header link share one drawer.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();



