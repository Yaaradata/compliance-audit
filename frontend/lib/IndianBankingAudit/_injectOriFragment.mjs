import fs from 'fs';
import { fileURLToPath } from 'url';
const mockPath = fileURLToPath(new URL('./mockIndianBankingAuditData.js', import.meta.url));
const fragPath = fileURLToPath(new URL('./_oriFragment.txt', import.meta.url));
let mock = fs.readFileSync(mockPath, { encoding: 'utf8' });
let frag = fs.readFileSync(fragPath, { encoding: 'utf8' }).replace(/^\uFEFF/, '').replace(/\s+$/, '');
const needle = /\n  \]\r?\n\r?\n\};\r?\n\r?\nexport function validateMockData/;
if (!needle.test(mock)) {
  console.error('Injection anchor not found');
  process.exit(1);
}
mock = mock.replace(needle, '\n  ],\n\n' + frag + '\n\n};\n\nexport function validateMockData');
fs.writeFileSync(mockPath, mock, { encoding: 'utf8' });
console.log('Injected OK');
