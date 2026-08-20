(() => {
  const ratios = Object.freeze({
    landscape: Math.SQRT2,
    square: 1,
    portrait: 1 / Math.SQRT2,
  });

  const isPreset = (option) => Object.prototype.hasOwnProperty.call(ratios, option);

  const select = (option, supportsFreeform = false) => {
    if (option === 'freeform' && supportsFreeform) {
      return { cropMode: 'freeform', orientation: 'custom' };
    }
    if (!isPreset(option)) return null;
    return { cropMode: 'fixed', orientation: option };
  };

  const selectedOption = (state) => state?.cropMode === 'freeform' ? 'freeform' : state?.orientation || '';
  const isFreeform = (state) => state?.cropMode === 'freeform';
  const outputOrientation = (state) => isFreeform(state) ? 'custom' : state?.orientation || 'custom';

  globalThis.PosterCropMode = {
    ratios,
    isPreset,
    select,
    selectedOption,
    isFreeform,
    outputOrientation,
  };
})();
