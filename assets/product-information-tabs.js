(() => {
  const initialiseTabs = (root) => {
    if (root.dataset.psTabsInitialised === 'true') return;
    root.dataset.psTabsInitialised = 'true';

    root.querySelectorAll('[data-ps-description-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.psDescriptionTab;
        if (tab.getAttribute('aria-selected') === 'true') return;

        root.querySelectorAll('[data-ps-description-tab]').forEach((item) => {
          const isActive = item === tab;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-selected', String(isActive));
        });

        root.querySelectorAll('[data-ps-description-panel]').forEach((panel) => {
          const isActive = panel.dataset.psDescriptionPanel === key;
          panel.classList.toggle('is-active', isActive);
          panel.hidden = !isActive;
        });

        root.dispatchEvent(new CustomEvent('ps:information-tab-changed', {
          bubbles: true,
          detail: { productHandle: root.dataset.productHandle, tab: key }
        }));

        if (Array.isArray(window.dataLayer)) {
          window.dataLayer.push({
            event: 'product_information_tab_changed',
            product_handle: root.dataset.productHandle,
            information_tab: key
          });
        }
      });
    });
  };

  const initialiseAllTabs = (scope = document) => {
    if (scope.matches?.('[data-ps-information-tabs]')) initialiseTabs(scope);
    scope.querySelectorAll?.('[data-ps-information-tabs]').forEach(initialiseTabs);
  };

  initialiseAllTabs();
  document.addEventListener('shopify:section:load', (event) => initialiseAllTabs(event.target));
})();
