(() => {
  const root = document.querySelector('[data-ps-product]');
  const preview = root?.querySelector('[data-ps-art-preview]');
  const canvas = preview?.querySelector('[data-pdp-print-preview]');
  const composition = preview?.querySelector('[data-ps-css-frame]');
  const mat = preview?.querySelector('[data-ps-css-mat]');
  const artwork = preview?.querySelector('[data-ps-css-artwork]');
  const image = preview?.querySelector('[data-ps-main-image]');
  if (!root || !preview || !canvas || !composition || !mat || !artwork || !image) return;

  const colors = {
    beige: '#e6dfca', black: '#111111', blue: '#38558d', brass: '#c3ad73',
    'dark-oak': '#654634', green: '#278e53', grey: '#c9c7bf', lavender: '#d9cbe8',
    'light-blue': '#9fc8db', mint: '#74c79d', oak: '#a77b49', orange: '#ff8038',
    petrol: '#577486', pink: '#ead0c2', plum: '#6e3e4c', red: '#c9584f',
    white: '#ffffff', yellow: '#f4cf65',
  };
  let state = { passepartout: null, frame: null, active: false };
  let resizeFrame = 0;

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const colorFor = (styleSlug = '') => colors[styleSlug]
    || colors[styleSlug.replace(/-(wood|alu)$/, '')]
    || '#b8bbba';
  const materialFor = (styleSlug = '') => styleSlug.endsWith('-alu') ? 'alu' : 'wood';

  const fitComposition = () => {
    resizeFrame = 0;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const hasFrame = Boolean(state.active && state.frame);
    const hasMat = Boolean(state.active && state.passepartout);
    const shortestSide = Math.min(bounds.width, bounds.height);
    const frameWidth = hasFrame ? clamp(shortestSide * .018, 6, 14) : 0;
    const matWidth = hasMat ? clamp(shortestSide * .065, 16, 44) : 0;
    const inset = 2 * (frameWidth + matWidth);
    const availableWidth = Math.max(40, bounds.width * .88 - inset);
    const availableHeight = Math.max(40, bounds.height * .88 - inset);
    const ratio = image.naturalWidth > 0 && image.naturalHeight > 0
      ? image.naturalWidth / image.naturalHeight
      : 1;
    let artWidth = availableWidth;
    let artHeight = artWidth / ratio;
    if (artHeight > availableHeight) {
      artHeight = availableHeight;
      artWidth = artHeight * ratio;
    }
    composition.style.setProperty('--ps-css-mat-box-width', `${Math.round((artWidth + 2 * matWidth) * 100) / 100}px`);
    composition.style.setProperty('--ps-css-mat-box-height', `${Math.round((artHeight + 2 * matWidth) * 100) / 100}px`);
    composition.style.setProperty('--ps-css-frame-width', `${Math.round(frameWidth * 100) / 100}px`);
    mat.style.setProperty('--ps-css-mat-width', `${Math.round(matWidth * 100) / 100}px`);
    root.dispatchEvent(new CustomEvent('product:css-frame-rendered', {
      detail: { artWidth, artHeight, frameWidth, matWidth, ratio },
    }));
  };

  const scheduleFit = () => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(fitComposition);
  };

  const render = () => {
    const hasFrame = Boolean(state.active && state.frame);
    const hasMat = Boolean(state.active && state.passepartout);
    const frameSlug = state.frame?.styleSlug || '';
    const matSlug = state.passepartout?.styleSlug || '';
    composition.dataset.hasFrame = String(hasFrame);
    composition.dataset.frameMaterial = hasFrame ? materialFor(frameSlug) : '';
    composition.dataset.frameStyle = hasFrame ? frameSlug : '';
    composition.style.setProperty('--ps-css-frame-color', colorFor(frameSlug));
    mat.dataset.hasMat = String(hasMat);
    mat.dataset.matStyle = hasMat ? matSlug : '';
    mat.style.setProperty('--ps-css-mat-color', colorFor(matSlug));
    canvas.dataset.hasFrame = String(hasFrame);
    canvas.dataset.hasPassepartout = String(hasMat);
    scheduleFit();
  };

  image.addEventListener('load', scheduleFit);
  root.addEventListener('product:preview-orientation', scheduleFit);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleFit).observe(canvas);
  else window.addEventListener('resize', scheduleFit, { passive: true });

  root.productFramePreview = {
    update(nextState = {}) {
      state = { ...state, ...nextState };
      render();
    },
    fit: scheduleFit,
  };

  render();
})();
