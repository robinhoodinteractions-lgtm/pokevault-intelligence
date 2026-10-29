'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { handler, normalizeQuote, validMarket, CARD_IDS } = require('../netlify/functions/card-prices');

function response(payload, ok = true, status = 200) {
  return { ok, status, json: async () => payload };
}

function cardPayload(id = 'base1-4', prices = [{
  type: 'raw', condition: 'NM', market: 123.45, currency: 'USD', low: 100, trends: { days_7: { percent_change: -1.5, price_change: -2.1 }, days_30: { percent_change: 3, price_change: 4.25 }, days_90: { percent_change: 'bad', price_change: Infinity } }
}]) {
  return { data: { id, name: 'Example card', variants: [{ name: 'unlimitedHolofoil', prices }] } };
}

test('accepts only finite non-negative numeric market values', () => {
  assert.equal(validMarket(0), true);
  assert.equal(validMarket(1.25), true);
  assert.equal(validMarket(null), false);
  assert.equal(validMarket(''), false);
  assert.equal(validMarket('0'), false);
  assert.equal(validMarket(NaN), false);
  assert.equal(validMarket(-1), false);
});

test('normalizes a matching NM raw quote with source and retrieval timestamp', () => {
  const quote = normalizeQuote(cardPayload(), 'base1-4', '2026-10-29T00:00:00.000Z');
  assert.deepEqual(quote, {
    amount: 123.45,
    currency: 'USD',
    condition: 'NM',
    variant: 'unlimitedHolofoil',
    basis: 'Scrydex raw market estimate',
    source: 'Scrydex',
    checked_at: '2026-10-29T00:00:00.000Z',
    provider_as_of: null,
    trends: { days_7: { percent_change: -1.5, price_change: -2.1 }, days_30: { percent_change: 3, price_change: 4.25 } }
  });
});

test('rejects mismatched card IDs and malformed payloads', () => {
  assert.equal(normalizeQuote(cardPayload('other-id'), 'base1-4', 'now'), null);
  assert.equal(normalizeQuote(null, 'base1-4', 'now'), null);
  assert.equal(normalizeQuote({ data: { id: 'base1-4', variants: 'not-an-array' } }, 'base1-4', 'now'), null);
});

test('rejects null, empty, negative, malformed currency, and non-NM quotes', () => {
  const badPrices = [
    { type: 'raw', condition: 'NM', market: null, currency: 'USD' },
    { type: 'raw', condition: 'NM', market: '', currency: 'USD' },
    { type: 'raw', condition: 'NM', market: -2, currency: 'USD' },
    { type: 'raw', condition: 'NM', market: 4, currency: 'US' },
    { type: 'raw', condition: 'LP', market: 4, currency: 'USD' },
    { type: 'graded', condition: 'NM', market: 4, currency: 'USD' },
    { type: 'raw', condition: 'NM', market: 4, currency: 'USD', is_error: true }
  ];
  for (const price of badPrices) {
    assert.equal(normalizeQuote(cardPayload('base1-4', [price]), 'base1-4', 'now'), null);
  }
});

test('returns a safe unconfigured response without provider credentials', async () => {
  const oldKey = process.env.SCRYDEX_API_KEY;
  const oldTeam = process.env.SCRYDEX_TEAM_ID;
  delete process.env.SCRYDEX_API_KEY;
  delete process.env.SCRYDEX_TEAM_ID;
  try {
    const result = await handler({ httpMethod: 'GET' });
    assert.equal(result.statusCode, 200);
    const body = JSON.parse(result.body);
    assert.equal(body.configured, false);
    assert.deepEqual(body.quotes, {});
  } finally {
    if (oldKey === undefined) delete process.env.SCRYDEX_API_KEY; else process.env.SCRYDEX_API_KEY = oldKey;
    if (oldTeam === undefined) delete process.env.SCRYDEX_TEAM_ID; else process.env.SCRYDEX_TEAM_ID = oldTeam;
  }
});

test('rejects non-GET methods', async () => {
  const result = await handler({ httpMethod: 'POST' });
  assert.equal(result.statusCode, 405);
  assert.equal(result.headers.Allow, 'GET');
});

test('queries the provider with required auth headers and includes no fabricated prices', async () => {
  const oldKey = process.env.SCRYDEX_API_KEY;
  const oldTeam = process.env.SCRYDEX_TEAM_ID;
  process.env.SCRYDEX_API_KEY = 'test-key';
  process.env.SCRYDEX_TEAM_ID = 'test-team';
  const calls = [];
  const oldFetch = global.fetch;
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    const id = CARD_IDS.find(cardId => url.includes('/' + cardId + '?'));
    return id === 'base1-4' ? response(cardPayload(id)) : response({ data: { id, variants: [] } });
  };
  try {
    const result = await handler({ httpMethod: 'GET' });
    assert.equal(result.statusCode, 200);
    const body = JSON.parse(result.body);
    assert.equal(body.configured, true);
    assert.equal(body.quotes['base1-4'].amount, 123.45);
    assert.equal(body.quotes['base1-4'].source, 'Scrydex');
    assert.equal(body.quotes['base1-4'].provider_as_of, null);
    assert.equal(body.quotes['pop5-17'], undefined);
    assert.equal(calls.length, 3);
    assert.ok(calls.every(call => call.options.headers['X-Api-Key'] === 'test-key'));
    assert.ok(calls.every(call => call.options.headers['X-Team-ID'] === 'test-team'));
    assert.ok(calls.every(call => call.url.includes('?include=prices')));
  } finally {
    global.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.SCRYDEX_API_KEY; else process.env.SCRYDEX_API_KEY = oldKey;
    if (oldTeam === undefined) delete process.env.SCRYDEX_TEAM_ID; else process.env.SCRYDEX_TEAM_ID = oldTeam;
  }
});

test('provider failures are represented as unavailable rather than fake zeroes', async () => {
  const oldKey = process.env.SCRYDEX_API_KEY;
  const oldTeam = process.env.SCRYDEX_TEAM_ID;
  const oldFetch = global.fetch;
  process.env.SCRYDEX_API_KEY = 'test-key';
  process.env.SCRYDEX_TEAM_ID = 'test-team';
  global.fetch = async () => response({}, false, 503);
  try {
    const result = await handler({ httpMethod: 'GET' });
    const body = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(Object.keys(body.quotes).length, 0);
    assert.equal(body.unavailable.length, 3);
    assert.ok(body.unavailable.every(item => item.reason === 'provider_error'));
  } finally {
    global.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.SCRYDEX_API_KEY; else process.env.SCRYDEX_API_KEY = oldKey;
    if (oldTeam === undefined) delete process.env.SCRYDEX_TEAM_ID; else process.env.SCRYDEX_TEAM_ID = oldTeam;
  }
});

test('keeps only finite provider trend values and never invents missing windows', () => {
  const quote = normalizeQuote(cardPayload(), 'base1-4', 'now');
  assert.deepEqual(quote.trends, {
    days_7: { percent_change: -1.5, price_change: -2.1 },
    days_30: { percent_change: 3, price_change: 4.25 }
  });
  const noTrends = normalizeQuote(cardPayload('base1-4', [{
    type: 'raw', condition: 'NM', market: 10, currency: 'USD'
  }]), 'base1-4', 'now');
  assert.deepEqual(noTrends.trends, {});
});

test('refuses to select arbitrarily between multiple priced variants', () => {
  const payload = { data: { id: 'base1-4', variants: [
    { name: 'unlimitedHolofoil', prices: [{ type: 'raw', condition: 'NM', market: 10, currency: 'USD' }] },
    { name: 'firstEditionShadowlessHolofoil', prices: [{ type: 'raw', condition: 'NM', market: 20, currency: 'USD' }] }
  ] } };
  assert.equal(normalizeQuote(payload, 'base1-4', 'now'), null);
});
