(() => {
  'use strict';

  const menu = document.querySelector('[data-mobile-menu]');
  const trigger = document.querySelector('[data-mobile-menu-open]');
  if (!menu || !trigger) return;

  const panel = menu.querySelector('.mobile-menu__panel');
  const setOpen = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    trigger.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('is-mobile-menu-open', open);
    if (open) panel.focus();
  };

  trigger.addEventListener('click', () => setOpen(true));
  menu.addEventListener('click', (event) => {
    if (event.target.closest('[data-mobile-menu-close], .mobile-menu__links a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
  });
})();
