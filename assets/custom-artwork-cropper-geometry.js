(() => {
  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

  const fitCrop = (bounds, ratio, coverage = 0.72) => {
    const safeCoverage = clamp(coverage, 0.2, 1);
    let width = bounds.width * safeCoverage;
    let height = width / ratio;
    if (height > bounds.height * safeCoverage) {
      height = bounds.height * safeCoverage;
      width = height * ratio;
    }
    return {
      x: bounds.x + (bounds.width - width) / 2,
      y: bounds.y + (bounds.height - height) / 2,
      width,
      height,
    };
  };

  const moveCrop = (crop, deltaX, deltaY, bounds) => ({
    ...crop,
    x: clamp(crop.x + deltaX, bounds.x, bounds.x + bounds.width - crop.width),
    y: clamp(crop.y + deltaY, bounds.y, bounds.y + bounds.height - crop.height),
  });

  const resizeCrop = (crop, corner, pointer, bounds, ratio, minimumSize = 72) => {
    const fixed = {
      nw: { x: crop.x + crop.width, y: crop.y + crop.height },
      ne: { x: crop.x, y: crop.y + crop.height },
      sw: { x: crop.x + crop.width, y: crop.y },
      se: { x: crop.x, y: crop.y },
    }[corner];
    if (!fixed) return crop;

    const horizontalDirection = corner.endsWith('e') ? 1 : -1;
    const verticalDirection = corner.startsWith('s') ? 1 : -1;
    const maximumWidthX = horizontalDirection > 0
      ? bounds.x + bounds.width - fixed.x
      : fixed.x - bounds.x;
    const maximumHeightY = verticalDirection > 0
      ? bounds.y + bounds.height - fixed.y
      : fixed.y - bounds.y;
    const maximumWidth = Math.min(maximumWidthX, maximumHeightY * ratio);
    const desiredWidthFromX = Math.abs(pointer.x - fixed.x);
    const desiredWidthFromY = Math.abs(pointer.y - fixed.y) * ratio;
    const width = clamp(Math.max(desiredWidthFromX, desiredWidthFromY), minimumSize, maximumWidth);
    const height = width / ratio;

    return {
      x: horizontalDirection > 0 ? fixed.x : fixed.x - width,
      y: verticalDirection > 0 ? fixed.y : fixed.y - height,
      width,
      height,
    };
  };

  const toSourceRect = (crop, displayedImage, naturalWidth, naturalHeight) => {
    const scaleX = naturalWidth / displayedImage.width;
    const scaleY = naturalHeight / displayedImage.height;
    return {
      x: clamp((crop.x - displayedImage.x) * scaleX, 0, naturalWidth),
      y: clamp((crop.y - displayedImage.y) * scaleY, 0, naturalHeight),
      width: clamp(crop.width * scaleX, 1, naturalWidth),
      height: clamp(crop.height * scaleY, 1, naturalHeight),
    };
  };

  globalThis.PosterCropGeometry = { clamp, fitCrop, moveCrop, resizeCrop, toSourceRect };
})();
