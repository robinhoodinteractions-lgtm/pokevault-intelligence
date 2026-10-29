'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const netlify = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'ci.yml'), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');

test('deployment configuration is buildable, private by default, and secret-safe', async (t) => {
  await t.test('Netlify builds the static output and discovers serverless functions', () => {
    assert.match(netlify, /command\s*=\s*"npm run build"/);
    assert.match(netlify, /publish\s*=\s*"dist"/);
    assert.match(netlify, /functions\s*=\s*"netlify\/functions"/);
    assert.match(netlify, /NODE_VERSION\s*=\s*"22"/);
    assert.match(workflow, /node-version:\s*22/);
    assert.equal(packageJson.engines.node, '>=22');
  });

  await t.test('security headers allow only the required same-origin and Formspree flows', () => {
    assert.match(netlify, /X-Content-Type-Options\s*=\s*"nosniff"/);
    assert.match(netlify, /X-Frame-Options\s*=\s*"DENY"/);
    assert.match(netlify, /Referrer-Policy\s*=\s*"strict-origin-when-cross-origin"/);
    assert.match(netlify, /Content-Security-Policy\s*=\s*"default-src 'self';/);
    assert.match(netlify, /connect-src 'self' https:\/\/formspree\.io/);
    assert.match(netlify, /form-action 'self' https:\/\/formspree\.io/);
    assert.match(netlify, /object-src 'none'/);
    assert.match(netlify, /frame-ancestors 'none'/);
  });

  await t.test('local environment secrets remain excluded from Git', () => {
    assert.match(gitignore, /^\.env$/m);
    assert.match(gitignore, /^\.env\.\*$/m);
    assert.match(gitignore, /^!\.env\.example$/m);
  });
});
