(() => {
  const page = document.querySelector('[data-content-page]');
  if (!page) return;

  page.querySelector('[data-cp-print]')?.addEventListener('click', () => window.print());
  page.querySelector('[data-cp-copy]')?.addEventListener('click', async (event) => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      event.currentTarget.setAttribute('aria-label', 'Page link copied');
      window.setTimeout(() => event.currentTarget.setAttribute('aria-label', 'Copy page link'), 1600);
    } catch (_) {
      event.currentTarget.setAttribute('aria-label', 'Could not copy page link');
    }
  });
})();
