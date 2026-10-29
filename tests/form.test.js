'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('inquiry form offers an accessible native submission fallback after fetch failure', async (t) => {
  await t.test('fallback is present but hidden until needed, and success does not claim email delivery', () => {
    assert.match(html, /id="directFormFallback"[^>]*hidden/);
    assert.match(html, /fallback\.hidden=false/);
    assert.match(html, /does not confirm email delivery/i);
    assert.match(html, /form\.action/);
    assert.match(html, /setTimeout\(\(\)=>controller\.abort\(\),12000\)/);
  });

  await t.test('native fallback validates the form before submitting', () => {
    const start = html.indexOf('function submitNativeFallback(form,status){');
    const end = html.indexOf('\n$("#directFormFallback")', start);
    assert.notEqual(start, -1, 'native fallback helper should exist');
    assert.notEqual(end, -1, 'native fallback helper boundary should exist');
    const source = html.slice(start, end) + '\nthis.submitNativeFallback = submitNativeFallback;';
    const context = {};
    vm.runInNewContext(source, context);
    let submitted = 0;
    const status = { textContent: '' };
    const invalidForm = { reportValidity: () => false, submit: () => submitted++ };
    context.submitNativeFallback(invalidForm, status);
    assert.equal(submitted, 0, 'invalid form should not submit');
    const validForm = { reportValidity: () => true, submit: () => submitted++ };
    context.submitNativeFallback(validForm, status);
    assert.equal(submitted, 1, 'valid form should use native POST fallback');
    assert.match(status.textContent, /standard form submission/i);
  });
});

test('HTML escaping safely handles unexpected provider values', () => {
  const start = html.indexOf('function escapeHtml(value){');
  const end = html.indexOf('\nfunction renderWatch(){', start);
  assert.notEqual(start, -1, 'escape helper should exist');
  assert.notEqual(end, -1, 'escape helper boundary should exist');
  const context = {};
  vm.runInNewContext(html.slice(start, end) + '\nthis.escapeHtml = escapeHtml;', context);
  assert.equal(context.escapeHtml('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
  assert.equal(context.escapeHtml(null), '');
  assert.equal(context.escapeHtml({ unexpected: 'provider payload' }), '[object Object]');
});
