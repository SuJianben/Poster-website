(() => {
  'use strict';

  const toggleSelector = '[data-header-submenu-toggle]';
  const submenuSelector = '[data-header-submenu]';

  const getSubmenu = (toggle) => {
    const submenuId = toggle.getAttribute('aria-controls');
    return submenuId ? document.getElementById(submenuId) : null;
  };

  const track = (event, details) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...details });
  };

  const setOpen = (toggle, open, shouldTrack = false) => {
    const submenu = getSubmenu(toggle);
    if (!submenu) return;

    toggle.setAttribute('aria-expanded', String(open));
    submenu.hidden = !open;

    if (open && shouldTrack) {
      track('header_menu_open', {
        menu_name: toggle.dataset.menuTitle || toggle.textContent.trim(),
        menu_context: toggle.closest('[data-header-navigation]')?.dataset.headerNavigation || 'unknown',
      });
    }
  };

  const closeAll = (exceptToggle = null) => {
    document.querySelectorAll(toggleSelector).forEach((toggle) => {
      if (toggle !== exceptToggle) setOpen(toggle, false);
    });
  };

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest(toggleSelector);
    if (toggle) {
      event.preventDefault();
      const shouldOpen = toggle.getAttribute('aria-expanded') !== 'true';
      closeAll(toggle);
      setOpen(toggle, shouldOpen, shouldOpen);
      return;
    }

    const submenuLink = event.target.closest('[data-header-submenu-link]');
    if (submenuLink) {
      track('header_submenu_navigate', {
        menu_name: submenuLink.dataset.parentMenu || '',
        link_text: submenuLink.textContent.trim(),
        link_url: submenuLink.getAttribute('href') || '',
        menu_context: submenuLink.closest('[data-header-navigation]')?.dataset.headerNavigation || 'unknown',
      });
      closeAll();
      return;
    }

    if (event.target.closest('[data-mobile-menu-close]') || !event.target.closest('[data-header-navigation]')) {
      closeAll();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    const expandedToggle = document.querySelector(`${toggleSelector}[aria-expanded='true']`);
    if (!expandedToggle) return;

    closeAll();
    expandedToggle.focus();
  });

  document.addEventListener('focusin', (event) => {
    if (!event.target.closest('[data-header-navigation]')) closeAll();
  });

  document.addEventListener('shopify:section:unload', closeAll);

  document.querySelectorAll(submenuSelector).forEach((submenu) => {
    submenu.hidden = true;
  });
})();
