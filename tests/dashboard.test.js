'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('research analytics are visible, derived, and scoped to the local catalogue', async (t) => {
  await t.test('dashboard includes catalogue, quote coverage, and watchlist breakdowns', () => {
    for (const id of ['researchAnalytics', 'catalogueCategoryAnalytics', 'quoteCoverageAnalytics', 'watchCategoryAnalytics', 'watchAnalyticsNote']) {
      assert.ok(html.includes('id="' + id + '"') || html.includes("id='" + id + "'"), 'missing analytics element ' + id);
    }
    assert.match(html, /Counts describe this curated catalogue only/);
    assert.match(html, /no valuation or historical performance is calculated/i);
    assert.match(html, /--green:#00e699/i);
  });

  await t.test('category and quote counts are calculated only from supplied records', () => {
    const start = html.indexOf('function categoryGroup(card){');
    const end = html.indexOf('function renderBarList(id,entries,emptyMessage){', start);
    assert.notEqual(start, -1, 'categoryGroup function should exist');
    assert.notEqual(end, -1, 'analytics helper boundary should exist');
    const source = html.slice(start, end) + '\nthis.calculateAnalytics = calculateAnalytics;';
    const context = {
      hasUsableQuote(price) {
        return !!price && typeof price.amount === 'number' && Number.isFinite(price.amount) &&
          price.amount >= 0 && typeof price.currency === 'string' && /^[A-Z]{3}$/.test(price.currency);
      }
    };
    vm.runInNewContext(source, context);
    const records = [
      { id: 'a', name: 'Charizard', set: 'Base Set', number: '4/102', category: 'Vintage · holo' },
      { id: 'b', name: 'Umbreon Gold Star', set: 'POP Series 5', number: '17/17', category: 'Gold Star · holo' },
      { id: 'c', name: 'Booster Box', set: 'Vintage Set', number: 'Box', category: 'Sealed · authenticity' },
      { id: 'd', name: 'Pikachu Illustrator', set: 'Promo', number: 'Promo', category: 'Trophy · provenance' }
    ];
    const result = JSON.parse(JSON.stringify(context.calculateAnalytics(
      records,
      ['Charizard — Base Set 4/102', 'Pikachu Illustrator — Promo Promo', 'Removed / unknown'],
      {
        a: { amount: 100, currency: 'USD' },
        b: { amount: null, currency: 'USD' },
        c: { amount: 25, currency: 'USD' }
      }
    )));
    assert.deepEqual(result.catalogue, { Vintage: 1, 'Gold Star': 1, Sealed: 1, 'Trophy / promo': 1 });
    assert.deepEqual(result.quoteCoverage, { Vintage: 1, Sealed: 1 });
    assert.deepEqual(result.watchlist, { Vintage: 1, 'Trophy / promo': 1, 'Other / unlisted': 1 });
    assert.equal(result.watchlistMatched, 2);
  });

  await t.test('empty watchlists and unavailable quotes remain zero-count states', () => {
    const start = html.indexOf('function categoryGroup(card){');
    const end = html.indexOf('function renderBarList(id,entries,emptyMessage){', start);
    const context = {
      hasUsableQuote(price) {
        return !!price && typeof price.amount === 'number' && Number.isFinite(price.amount) &&
          price.amount >= 0 && typeof price.currency === 'string' && /^[A-Z]{3}$/.test(price.currency);
      }
    };
    vm.runInNewContext(html.slice(start, end) + '\nthis.calculateAnalytics = calculateAnalytics;', context);
    const result = JSON.parse(JSON.stringify(context.calculateAnalytics(
      [{ id: 'a', name: 'Pikachu', set: 'Base Set', number: '58/102', category: 'Vintage · comparison' }],
      [],
      {}
    )));
    assert.deepEqual(result.catalogue, { Vintage: 1 });
    assert.deepEqual(result.quoteCoverage, {});
    assert.deepEqual(result.watchlist, {});
    assert.equal(result.watchlistMatched, 0);
  });
});
