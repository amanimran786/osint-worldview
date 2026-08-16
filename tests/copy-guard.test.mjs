import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const prohibited = /DEFCON|PizzINT|Pentagon Pizza|TOP SECRET|NOFORN|ASTRAL INTEL|WorldView Monitor|AI-powered real-time|435\+|45 map layers|45 layers|Realtime intelligence platform|Upgrade to WorldView|join.*waitlist/i;

for (const relativePath of [
  'index.html',
  'src/app/panel-layout.ts',
  'src/config/variant-meta.ts',
  '.github/GITHUB_ORGANIZATION.md',
  'docs/guides/HOW_IT_WORKS.md',
]) {
  test(`${relativePath} contains no prohibited promotional or off-purpose copy`, () => {
    const source = readFileSync(join(root, relativePath), 'utf8');
    assert.doesNotMatch(source, prohibited);
  });
}

test('the version endpoint fallback stays aligned with package.json', () => {
  const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const versionSource = readFileSync(join(root, 'api/version.js'), 'utf8');
  assert.match(versionSource, new RegExp(`CURRENT_VERSION = ['\"]${packageJson.version.replace(/\./g, '\\.')}['\"]`));
});
