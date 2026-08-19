(() => {
  const root = document.querySelector('[data-cg-collection]');
  if (!root) return;

  const drawer = root.querySelector('[data-cg-drawer]');
  const triggers = root.querySelectorAll('[data-cg-open-drawer]');
  const closeButtons = root.querySelectorAll('[data-cg-close-drawer]');
  const controls = root.querySelectorAll('[data-cg-columns], [data-cg-view]');

  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('cg-drawer-active', open);
  };

  triggers.forEach((button) => button.addEventListener('click', () => setDrawer(true)));
  closeButtons.forEach((button) => button.addEventListener('click', () => setDrawer(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setDrawer(false); });

  const applyView = (view, track = false) => {
    const previousView = root.dataset.view;
    root.dataset.view = view;
    root.querySelectorAll('[data-cg-view]').forEach((button) => {
      const isActive = button.dataset.cgView === view;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    if (!track || previousView === view) return;

    root.dispatchEvent(new CustomEvent('cg:view-changed', {
      bubbles: true,
      detail: { collectionHandle: root.dataset.cgCollectionHandle, view }
    }));

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: 'collection_view_changed',
        collection_handle: root.dataset.cgCollectionHandle,
        gallery_view: view
      });
    }
  };

  controls.forEach((control) => control.addEventListener('click', () => {
    const group = control.hasAttribute('data-cg-columns') ? '[data-cg-columns]' : '[data-cg-view]';
    if (control.dataset.cgColumns) {
      root.querySelectorAll(group).forEach((button) => button.classList.remove('is-active'));
      control.classList.add('is-active');
      root.dataset.columns = control.dataset.cgColumns;
    }
    if (control.dataset.cgView) applyView(control.dataset.cgView, true);
  }));

})();

