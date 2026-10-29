'use strict';
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const source = path.join(root, 'index.html');
const outputDir = path.join(root, 'dist');
if (!fs.existsSync(source)) throw new Error('index.html is missing from the project root.');
fs.mkdirSync(outputDir, { recursive: true });
fs.copyFileSync(source, path.join(outputDir, 'index.html'));
console.log('Built static site into dist/. Serverless functions remain in netlify/functions/.');
