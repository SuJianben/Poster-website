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
    const mobileFilterClose = section.querySelector('[data-mobile-filter-close]');
    const mobileSort = section.querySelector('[data-mobile-sort-toggle]');
    const mobileSortMenu = section.querySelector('[data-mobile-sort-menu]');
    const mobileSortClose = section.querySelector('[data-mobile-sort-close]');
    const filterPanel = section.querySelector('.collection-showcase__filters');

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
      if (mobileSort) mobileSort.textContent = sort.options[sort.selectedIndex].text.replace('Sort by: ', '');
    });
    mobileFilter?.addEventListener('click', () => {
      filterPanel?.classList.add('is-mobile-open');
      mobileFilter.setAttribute('aria-expanded', 'true');
    });
    mobileFilterClose?.addEventListener('click', () => {
      filterPanel?.classList.remove('is-mobile-open');
      mobileFilter?.setAttribute('aria-expanded', 'false');
    });
    mobileSort?.addEventListener('click', () => {
      mobileSort.setAttribute('aria-expanded', 'true');
      if (mobileSortMenu) {
        mobileSortMenu.hidden = false;
        mobileSortMenu.classList.add('is-mobile-open');
      }
    });
    mobileSortClose?.addEventListener('click', () => {
      mobileSortMenu?.classList.remove('is-mobile-open');
      if (mobileSortMenu) mobileSortMenu.hidden = true;
      mobileSort?.setAttribute('aria-expanded', 'false');
    });
    section.querySelectorAll('[data-mobile-sort-value]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!sort) return;
        sort.value = button.dataset.mobileSortValue;
        sort.dispatchEvent(new Event('change', { bubbles: true }));
        mobileSortMenu.classList.remove('is-mobile-open');
        mobileSortMenu.hidden = true;
        mobileSort?.setAttribute('aria-expanded', 'false');
      });
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
