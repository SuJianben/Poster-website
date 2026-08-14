(() => {
  const root = document.querySelector('[data-ps-product]');
  const preview = root?.querySelector('[data-ps-art-preview]');
  const canvas = preview?.querySelector('[data-pdp-print-preview]');
  const layers = {
    passepartout: preview?.querySelector('[data-ps-framing-layer="passepartout"]'),
    frame: preview?.querySelector('[data-ps-framing-layer="frame"]'),
  };
  if (!root || !preview || !canvas || !layers.passepartout || !layers.frame) return;

  let state = { passepartout: null, frame: null, active: false };

  const orientation = () => preview.dataset.psPreviewOrientation || preview.dataset.orientation || 'portrait';
  const updateLayerScale = (layer, currentOrientation) => {
    const compensation = currentOrientation === 'square' && layer.naturalWidth > 0
      ? layer.naturalHeight / layer.naturalWidth
      : 1;
    layer.style.setProperty('--ps-framing-layer-scale', String(compensation));
  };

  const render = () => {
    const currentOrientation = orientation();
    Object.entries(layers).forEach(([kind, layer]) => {
      const selected = state[kind];
      const url = selected?.preview?.[currentOrientation] || selected?.preview?.portrait || '';
      if (!state.active || !selected || !url) {
        layer.hidden = true;
        layer.removeAttribute('src');
        return;
      }
      layer.onload = () => updateLayerScale(layer, currentOrientation);
      layer.src = url;
      layer.hidden = false;
      if (layer.complete) updateLayerScale(layer, currentOrientation);
    });
    canvas.dataset.hasPassepartout = String(Boolean(state.active && state.passepartout));
    canvas.dataset.hasFrame = String(Boolean(state.active && state.frame));
  };

  root.addEventListener('product:preview-orientation', render);
  root.productFramePreview = {
    update(nextState = {}) {
      state = { ...state, ...nextState };
      render();
    },
  };
  render();
})();
