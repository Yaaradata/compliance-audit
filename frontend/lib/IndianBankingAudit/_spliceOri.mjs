/**
 * Replace ORI block (rcsaCycles … pacNotes) in mockIndianBankingAuditData.js from _oriFragment.txt.
 * Run after: node _generateOriBackbone.mjs
 */
import fs from 'fs';
import { fileURLToPath } from 'url';

const dir = fileURLToPath(new URL('.', import.meta.url));
const mockPath = `${dir}/mockIndianBankingAuditData.js`;
const fragPath = `${dir}/_oriFragment.txt`;

let mock = fs.readFileSync(mockPath, { encoding: 'utf8' });
const frag = fs.readFileSync(fragPath, { encoding: 'utf8' }).replace(/^\uFEFF/, '').replace(/\s+$/, '');
const start = mock.indexOf('  rcsaCycles:');
const exportIdx = mock.indexOf('export function validateMockData');
if (start === -1 || exportIdx === -1) {
  console.error('Splice anchors not found', { start, exportIdx });
  process.exit(1);
}
mock = mock.slice(0, start) + frag + '\n\n};\n\n' + mock.slice(exportIdx);
fs.writeFileSync(mockPath, mock, { encoding: 'utf8' });
console.log('Spliced ORI block OK');
