const assert = require('node:assert/strict');
const path = require('node:path');

const { parseSizeLabel, calculateRelativeSizes } = require(path.join('..', 'assets', 'product-size-guide.js'));

assert.deepEqual(parseSizeLabel('A4 (21x29,7 cm)'), { width: 21, height: 29.7 });
assert.deepEqual(parseSizeLabel('30×40 cm'), { width: 30, height: 40 });
assert.equal(parseSizeLabel('Custom size'), null);

const sizes = calculateRelativeSizes(['A4 (21x29,7 cm)', '30x40 cm', '70x100 cm']);
assert.equal(sizes.length, 3);
assert.equal(sizes[2].heightPercent, 86);
assert.ok(sizes[0].heightPercent < sizes[1].heightPercent);
assert.ok(sizes[1].heightPercent < sizes[2].heightPercent);
assert.ok(sizes[0].widthPercent < sizes[2].widthPercent);

console.log('Product size guide geometry checks passed.');
