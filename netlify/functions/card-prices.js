'use strict';

const CARD_IDS = Object.freeze(['base1-4', 'pop5-17', 'base1-58']);
const API_ROOT = 'https://api.scrydex.com/pokemon/v1/cards/';
const TIMEOUT_MS = 7000;

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

function validMarket(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function validCurrency(value) {
  return typeof value === 'string' && /^[A-Z]{3}$/.test(value);
}

function extractCard(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const card = payload.data && !Array.isArray(payload.data) && typeof payload.data === 'object'
    ? payload.data
    : payload.card && typeof payload.card === 'object'
      ? payload.card
      : payload;
  return card && typeof card === 'object' && !Array.isArray(card) ? card : null;
}

function normalizeQuote(payload, requestedId, checkedAt) {
  const card = extractCard(payload);
  if (!card || card.id !== requestedId || !Array.isArray(card.variants)) return null;

  // Keep the variant attached to its price. If the provider returns valid
  // prices for multiple variants, refuse to choose one arbitrarily.
  const candidates = card.variants.flatMap(variant => {
    if (!variant || typeof variant.name !== 'string' || !Array.isArray(variant.prices)) return [];
    return variant.prices
      .filter(price =>
        price &&
        price.type === 'raw' &&
        price.condition === 'NM' &&
        price.is_error !== true &&
        validMarket(price.market) &&
        validCurrency(price.currency)
      )
      .map(price => ({ ...price, variant_name: variant.name }));
  });

  if (candidates.length !== 1) return null;
  const candidate = candidates[0];

  const trends = {};
  for (const window of ['days_7', 'days_30', 'days_90']) {
    const trend = candidate.trends && candidate.trends[window];
    if (!trend || typeof trend !== 'object') continue;
    const clean = {};
    if (typeof trend.percent_change === 'number' && Number.isFinite(trend.percent_change)) clean.percent_change = trend.percent_change;
    if (typeof trend.price_change === 'number' && Number.isFinite(trend.price_change)) clean.price_change = trend.price_change;
    if (Object.keys(clean).length) trends[window] = clean;
  }

  return {
    amount: candidate.market,
    currency: candidate.currency,
    condition: 'NM',
    variant: candidate.variant_name,
    basis: 'Scrydex raw market estimate',
    source: 'Scrydex',
    checked_at: checkedAt,
    provider_as_of: null,
    trends
  };
}

async function fetchCard(id, apiKey, teamId, fetchImpl, checkedAt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetchImpl(API_ROOT + encodeURIComponent(id) + '?include=prices', {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'X-Team-ID': teamId,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    if (!response || !response.ok) {
      return { id, quote: null, reason: response && response.status === 429 ? 'rate_limited' : 'provider_error' };
    }
    let payload;
    try {
      payload = await response.json();
    } catch (_) {
      return { id, quote: null, reason: 'invalid_json' };
    }
    const quote = normalizeQuote(payload, id, checkedAt);
    return { id, quote, reason: quote ? null : 'quote_unavailable' };
  } catch (error) {
    return { id, quote: null, reason: error && error.name === 'AbortError' ? 'timeout' : 'provider_error' };
  } finally {
    clearTimeout(timer);
  }
}

exports.handler = async function handler(event = {}) {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return json(405, { error: 'method_not_allowed' }, { Allow: 'GET' });
  }

  const apiKey = process.env.SCRYDEX_API_KEY;
  const teamId = process.env.SCRYDEX_TEAM_ID;
  if (!apiKey || !teamId) {
    return json(200, {
      configured: false,
      checkedAt: new Date().toISOString(),
      quotes: {},
      message: 'Pricing provider is not configured.'
    });
  }

  const fetchImpl = typeof fetch === 'function' ? fetch : null;
  if (!fetchImpl) return json(503, { error: 'fetch_unavailable', quotes: {} });

  const checkedAt = new Date().toISOString();
  const results = await Promise.all(CARD_IDS.map(id => fetchCard(id, apiKey, teamId, fetchImpl, checkedAt)));
  const quotes = {};
  const unavailable = [];
  for (const result of results) {
    if (result.quote) quotes[result.id] = result.quote;
    else unavailable.push({ id: result.id, reason: result.reason || 'quote_unavailable' });
  }

  return json(200, {
    configured: true,
    source: 'Scrydex',
    checkedAt,
    quotes,
    unavailable
  });
};

exports.CARD_IDS = CARD_IDS;
exports.normalizeQuote = normalizeQuote;
exports.validMarket = validMarket;
