'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const docs = fs.readFileSync(path.join(__dirname, '..', 'ENVIRONMENT_VARIABLES.md'), 'utf8');

test('pricing methodology clearly separates provider estimates from observed sales', () => {
  assert.match(html, /Scrydex pricing docs/);
  assert.match(html, /official pricing-field documentation/i);
  assert.match(html, /not a completed sale, appraisal, or guaranteed sale price/i);
  assert.match(html, /retrieval time must not be read as the date the market estimate was calculated/i);
  assert.match(html, /multiple variants have valid prices[\s\S]*withholds the quote/i);
  assert.match(html, /PokéVault does not currently store its own dated price observations/i);
  assert.match(html, /https:\/\/scrydex\.com\/docs\/pokemon\/price-history/);
  assert.match(docs, /checked_at.*retrieved the response, not the date the provider market estimate was calculated/i);
});
