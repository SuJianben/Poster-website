(() => {
  const overlay = document.querySelector('[data-search-overlay]');
  if (!overlay) return;

  const searchInput = overlay.querySelector('input');
  const productPanels = [...overlay.querySelectorAll('[data-search-overlay-products]')];
  const categories = [...overlay.querySelectorAll('[data-search-overlay-category]')];
  let searchTimer;

  const open = () => {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => searchInput.focus(), 180);
  };

  const close = () => {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
  };

  const selectCategory = (category) => {
    categories.forEach((item) => item.classList.toggle('is-active', item === category));
    productPanels.forEach((panel) => {
      panel.hidden = panel.dataset.searchOverlayProducts !== category.dataset.searchOverlayPanel;
    });
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-search-overlay-open]')) {
      event.preventDefault();
      open();
    }

    if (event.target.closest('[data-search-overlay-close]')) close();

    if (event.target.closest('[data-search-overlay-category]')) event.preventDefault();
  });

  categories.forEach((category) => {
    category.addEventListener('pointerenter', () => selectCategory(category));
    category.addEventListener('focus', () => selectCategory(category));
  });

  searchInput.addEventListener('input', () => {
    window.clearTimeout(searchTimer);
    const query = searchInput.value.trim();
    if (query.length < 2) return;

    searchTimer = window.setTimeout(async () => {
      const products = productPanels.find((panel) => !panel.hidden);
      if (!products) return;

      products.classList.add('is-refreshing');

      try {
        const response = await fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=5`);
        const data = await response.json();
        const items = data.resources.results.products || [];

        if (items.length) {
          products.innerHTML = items.map((item) => `<article class="so-overlay__card"><a class="so-overlay__image" href="${item.url}"><img src="${item.image}" alt="${item.title}"></a><div><a href="${item.url}">${item.title}</a><strong>From ${item.price}</strong></div></article>`).join('');
        }
      } finally {
        products.classList.remove('is-refreshing');
      }
    }, 180);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
})();
