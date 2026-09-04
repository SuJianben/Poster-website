const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'assets', 'custom-artwork-cropper-geometry.js'), 'utf8');
vm.runInThisContext(source, { filename: 'custom-artwork-cropper-geometry.js' });
const geometry = globalThis.PosterCropGeometry;

const bounds = { x: 20, y: 30, width: 600, height: 420 };
const landscape = geometry.fitCrop(bounds, Math.SQRT2, 0.72);
assert.ok(Math.abs(landscape.width / landscape.height - Math.SQRT2) < 1e-9);

const moved = geometry.moveCrop(landscape, 10000, -10000, bounds);
assert.equal(moved.x + moved.width, bounds.x + bounds.width);
assert.equal(moved.y, bounds.y);

const resized = geometry.resizeCrop(landscape, 'se', { x: 610, y: 440 }, bounds, Math.SQRT2);
assert.ok(Math.abs(resized.width / resized.height - Math.SQRT2) < 1e-9);
assert.ok(resized.x >= bounds.x && resized.y >= bounds.y);
assert.ok(resized.x + resized.width <= bounds.x + bounds.width + 1e-9);
assert.ok(resized.y + resized.height <= bounds.y + bounds.height + 1e-9);

const sourceRect = geometry.toSourceRect(
  { x: 170, y: 100, width: 300, height: 212.132 },
  { x: 20, y: 30, width: 600, height: 420 },
  6000,
  4200,
);
assert.equal(sourceRect.x, 1500);
assert.equal(sourceRect.y, 700);
assert.equal(sourceRect.width, 3000);
assert.ok(Math.abs(sourceRect.height - 2121.32) < 0.01);

console.log('Custom artwork crop geometry runtime checks passed.');
