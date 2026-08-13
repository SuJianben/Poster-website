(() => {
  const root = document.querySelector('[data-cg-collection]');
  if (!root) return;

  const drawer = root.querySelector('[data-cg-drawer]');
  const triggers = root.querySelectorAll('[data-cg-open-drawer]');
  const closeButtons = root.querySelectorAll('[data-cg-close-drawer]');
  const controls = root.querySelectorAll('[data-cg-columns], [data-cg-view]');
  const categoryLinks = root.querySelectorAll('.cg-category-nav a');

  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('cg-drawer-active', open);
  };

  triggers.forEach((button) => button.addEventListener('click', () => setDrawer(true)));
  closeButtons.forEach((button) => button.addEventListener('click', () => setDrawer(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setDrawer(false); });

  const applyView = (view) => {
    root.querySelectorAll('[data-cg-product]').forEach((card, index) => {
      card.classList.toggle('is-lifestyle', view === 'lifestyle' && index % 3 === 2);
    });
  };

  controls.forEach((control) => control.addEventListener('click', () => {
    const group = control.hasAttribute('data-cg-columns') ? '[data-cg-columns]' : '[data-cg-view]';
    root.querySelectorAll(group).forEach((button) => button.classList.remove('is-active'));
    control.classList.add('is-active');
    if (control.dataset.cgColumns) root.dataset.columns = control.dataset.cgColumns;
    if (control.dataset.cgView) applyView(control.dataset.cgView);
  }));

  root.addEventListener('click', (event) => {
    const heart = event.target.closest?.('[data-cg-heart]');
    if (!heart) return;
    heart.setAttribute('aria-pressed', String(heart.getAttribute('aria-pressed') !== 'true'));
  });

  root.addEventListener('cg:results-updated', () => {
    const activeView = root.querySelector('[data-cg-view].is-active')?.dataset.cgView;
    if (activeView) applyView(activeView);
  });

  categoryLinks.forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    categoryLinks.forEach((item) => item.classList.remove('is-current'));
    link.classList.add('is-current');
  }));
})();
