(() => {
  const getSelectedFilters = (filters) => filters.reduce((selected, filter) => {
    if (!filter.checked) return selected;

    const key = filter.dataset.filterKey;
    selected[key] = selected[key] || [];
    selected[key].push(filter.value);
    return selected;
  }, {});

  const matchesFilters = (card, selected) => Object.entries(selected).every(([key, values]) => values.includes(card.dataset[key]));

  const initialiseCollection = (section) => {
    const grid = section.querySelector('[data-collection-grid]');
    const filters = [...section.querySelectorAll('[data-collection-filter]')];
    const cards = [...section.querySelectorAll('[data-collection-card]')];
    const count = section.querySelector('[data-collection-count]');
    const empty = section.querySelector('[data-collection-empty]');
    const clear = section.querySelector('[data-collection-clear]');
    const sort = section.querySelector('[data-collection-sort]');
    const mobileFilter = section.querySelector('[data-mobile-filter-toggle]');
    const mobileSortSelect = section.querySelector('[data-mobile-sort-select]');
    const filterPanel = section.querySelector('.collection-showcase__filters');
    const drawerScrim = section.querySelector('[data-mobile-drawer-scrim]');
    const closeMobileDrawer = () => {
      filterPanel?.classList.remove('is-mobile-open');
      if (drawerScrim) drawerScrim.hidden = true;
      mobileFilter?.setAttribute('aria-expanded', 'false');
    };

    if (!grid || !cards.length) return;

    const updateVisibility = () => {
      const selected = getSelectedFilters(filters);
      let visible = 0;

      cards.forEach((card) => {
        const show = matchesFilters(card, selected);
        card.hidden = !show;
        if (show) visible += 1;
      });

      if (count) count.textContent = `${visible} pieces`;
      if (empty) empty.hidden = visible !== 0;
      if (clear) clear.hidden = Object.keys(selected).length === 0;
    };

    const sortCards = () => {
      const mode = sort?.value || 'relevance';
      const ordered = [...cards].sort((first, second) => {
        if (mode === 'title-asc') return first.dataset.title.localeCompare(second.dataset.title);
        if (mode === 'title-desc') return second.dataset.title.localeCompare(first.dataset.title);
        if (mode === 'price-asc') return Number(first.dataset.price) - Number(second.dataset.price);
        if (mode === 'price-desc') return Number(second.dataset.price) - Number(first.dataset.price);
        return 0;
      });

      ordered.forEach((card) => grid.append(card));
    };

    filters.forEach((filter) => filter.addEventListener('change', updateVisibility));
    section.querySelectorAll('[data-filter-show-all]').forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.closest('.collection-filter');
        const extras = [...filter.querySelectorAll('[data-filter-extra]')];
        const expanded = button.getAttribute('aria-expanded') === 'true';
        extras.forEach((item) => { item.hidden = expanded; });
        button.setAttribute('aria-expanded', String(!expanded));
        button.textContent = expanded ? 'Show All' : 'Show Less';
      });
    });
    sort?.addEventListener('change', () => {
      sortCards();
      if (mobileSortSelect) mobileSortSelect.value = sort.value;
    });
    mobileFilter?.addEventListener('click', () => {
      filterPanel?.classList.add('is-mobile-open');
      if (drawerScrim) drawerScrim.hidden = false;
      mobileFilter.setAttribute('aria-expanded', 'true');
    });
    drawerScrim?.addEventListener('click', closeMobileDrawer);
    mobileSortSelect?.addEventListener('change', () => {
      if (!sort) return;
      sort.value = mobileSortSelect.value;
      sort.dispatchEvent(new Event('change', { bubbles: true }));
    });
    clear?.addEventListener('click', () => {
      filters.forEach((filter) => { filter.checked = false; });
      updateVisibility();
    });
  };

  const initialise = () => document.querySelectorAll('[data-collection-showcase]').forEach(initialiseCollection);

  document.addEventListener('shopify:section:load', (event) => {
    event.target.querySelectorAll?.('[data-collection-showcase]').forEach(initialiseCollection);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
})();
