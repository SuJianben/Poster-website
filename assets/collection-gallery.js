(() => {
  const root = document.querySelector('[data-cg-collection]');
  if (!root) return;

  const drawer = root.querySelector('[data-cg-drawer]');
  const triggers = root.querySelectorAll('[data-cg-open-drawer]');
  const closeButtons = root.querySelectorAll('[data-cg-close-drawer]');
  const controls = root.querySelectorAll('[data-cg-columns], [data-cg-view]');
  const filterInputs = root.querySelectorAll('[data-cg-filter]');
  const cards = root.querySelectorAll('[data-cg-product]');
  const categoryLinks = root.querySelectorAll('.cg-category-nav a');

  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('cg-drawer-active', open);
  };

  const applyFilters = () => {
    const filters = [...filterInputs].filter((input) => input.checked).map((input) => input.value);
    cards.forEach((card) => {
      const types = (card.dataset.cgTypes || '').split('|');
      card.classList.toggle('is-filtered', filters.length > 0 && !filters.some((type) => types.includes(type)));
    });
  };

  triggers.forEach((button) => button.addEventListener('click', () => setDrawer(true)));
  closeButtons.forEach((button) => button.addEventListener('click', () => setDrawer(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setDrawer(false); });

  controls.forEach((control) => control.addEventListener('click', () => {
    const group = control.hasAttribute('data-cg-columns') ? '[data-cg-columns]' : '[data-cg-view]';
    root.querySelectorAll(group).forEach((button) => button.classList.remove('is-active'));
    control.classList.add('is-active');
    if (control.dataset.cgColumns) root.dataset.columns = control.dataset.cgColumns;
    if (control.dataset.cgView) cards.forEach((card, index) => {
      card.classList.toggle('is-lifestyle', control.dataset.cgView === 'lifestyle' && index % 3 === 2);
    });
  }));

  filterInputs.forEach((input) => input.addEventListener('change', applyFilters));
  root.querySelector('[data-cg-clear]')?.addEventListener('click', () => {
    filterInputs.forEach((input) => { input.checked = false; });
    applyFilters();
  });
  root.querySelectorAll('[data-cg-heart]').forEach((button) => button.addEventListener('click', () => {
    button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
  }));
  categoryLinks.forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    categoryLinks.forEach((item) => item.classList.remove('is-current'));
    link.classList.add('is-current');
  }));
})();
