import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('assetlinks.json: pacote do app e ao menos uma impressão digital SHA-256 válida', () => {
  const j = JSON.parse(readFileSync('public/.well-known/assetlinks.json', 'utf8'));
  const t = j[0].target;
  assert.equal(t.package_name, 'org.lagosgo.app');
  assert.ok(j[0].relation.includes('delegate_permission/common.handle_all_urls'));
  assert.ok(t.sha256_cert_fingerprints.length >= 1);
  for (const f of t.sha256_cert_fingerprints) assert.match(f, /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/);
});
test('patch do Android declara os links verificados do site e o esquema lagosgo://', () => {
  const s = readFileSync('android-app/scripts/patch-android.py', 'utf8');
  assert.match(s, /android:autoVerify="true"/);
  assert.match(s, /android:host="lagosgo\.com\.br"/);
  assert.match(s, /android:scheme="lagosgo"/);
});
