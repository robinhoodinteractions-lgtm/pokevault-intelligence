'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
if (!/^<!doctype html>/i.test(html.trimStart())) throw new Error('Missing HTML doctype');
if (!/<meta[^>]+name=["']viewport["']/i.test(html)) throw new Error('Missing viewport meta');
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
let inlineCount = 0;
for (const [, attrs, body] of scripts) {
  if (/application\/ld\+json/i.test(attrs)) {
    JSON.parse(body);
    continue;
  }
  if (!body.trim()) continue;
  new vm.Script(body, { filename: 'index.html:inline-script' });
  inlineCount++;
}
for (const id of ['dashboard','market','catalogue','categoryFilter','priceFilter','watchItems','contactForm','formStatus']) {
  if (!html.includes('id="' + id + '"') && !html.includes("id='" + id + "'")) throw new Error('Missing required element: ' + id);
}
console.log('HTML structure and ' + inlineCount + ' inline script(s) passed syntax checks.');
