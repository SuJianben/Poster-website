const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const themeRoot = path.resolve(__dirname, '..');
require(path.join(themeRoot, 'assets', 'custom-artwork-cropper-geometry.js'));

const geometry = globalThis.PosterCropGeometry;
assert.ok(geometry, 'Crop geometry API must be available.');

const bounds = { x: 10, y: 20, width: 500, height: 400 };
const crop = { x: 100, y: 100, width: 200, height: 150 };
const freeCrop = geometry.resizeCropFree(crop, 'se', { x: 420, y: 380 }, bounds);
assert.deepEqual(freeCrop, { x: 100, y: 100, width: 320, height: 280 });
assert.notEqual(freeCrop.width / freeCrop.height, Math.SQRT2, 'Free resize must not preserve a preset ratio.');
assert.deepEqual(geometry.resizeCropFree(crop, 'ne', { x: 400, y: 30 }, bounds), { x: 100, y: 30, width: 300, height: 220 });
assert.deepEqual(geometry.resizeCropFree(crop, 'sw', { x: 20, y: 390 }, bounds), { x: 20, y: 100, width: 280, height: 290 });
assert.deepEqual(geometry.resizeCropFree(crop, 'nw', { x: -50, y: -50 }, bounds), { x: 10, y: 20, width: 290, height: 230 });
assert.deepEqual(geometry.resizeCropFree(crop, 'se', { x: 102, y: 102 }, bounds), { x: 100, y: 100, width: 72, height: 72 });

const fixedCrop = geometry.resizeCrop(crop, 'se', { x: 420, y: 380 }, bounds, Math.SQRT2);
assert.ok(Math.abs(fixedCrop.width / fixedCrop.height - Math.SQRT2) < 1e-9, 'Fixed resize must remain available for image framing.');

const ratios = { landscape: Math.SQRT2, square: 1, portrait: 1 / Math.SQRT2 };
assert.equal(geometry.matchRatio(Math.SQRT2, ratios), 'landscape');
assert.equal(geometry.matchRatio(1.005, ratios), 'square');
assert.equal(geometry.matchRatio(1.2, ratios), '', 'A custom ratio must clear all preset selections.');

const cropper = fs.readFileSync(path.join(themeRoot, 'assets', 'custom-artwork-cropper.js'), 'utf8');
const section = fs.readFileSync(path.join(themeRoot, 'sections', 'custom-product-main.liquid'), 'utf8');
const snippet = fs.readFileSync(path.join(themeRoot, 'snippets', 'custom-artwork-cropper.liquid'), 'utf8');

assert.match(cropper, /root\.dataset\.psFramingRenderMode === 'css'/, 'Free resize must be scoped to the CSS custom template.');
assert.match(cropper, /geometry\.resizeCropFree/, 'CSS crop interactions must call the free resize geometry.');
assert.match(cropper, /syncFreeformRatioSelection/, 'Free resize must update preset selection state.');
assert.equal((snippet.match(/data-ps-cropper-ratio=/g) || []).length, 3, 'All three crop presets must remain visible.');
assert.match(snippet, /Drag any corner to resize freely\./, 'CSS crop instructions must describe free resizing.');
assert.match(section, /freeform-crop-v1-20260818/g, 'Cropper assets must use the freeform cache version.');

console.log('Custom artwork cropper freeform checks passed.');
