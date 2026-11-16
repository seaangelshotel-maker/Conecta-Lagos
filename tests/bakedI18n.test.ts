import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = (l: string): Record<string, string> => JSON.parse(readFileSync(`services/i18n/${l}.json`, 'utf8'));
const en = load('en'), es = load('es'), fr = load('fr');

test('dicionários prontos têm as mesmas chaves nos três idiomas', () => {
    const k = Object.keys(en).sort();
    assert.deepEqual(Object.keys(es).sort(), k);
    assert.deepEqual(Object.keys(fr).sort(), k);
    assert.ok(k.length > 600);
});

test('dicionários prontos não têm valores vazios', () => {
    for (const d of [en, es, fr]) for (const v of Object.values(d)) assert.ok(v.trim().length > 0);
});

test('traduzem textos conhecidos', () => {
    assert.equal(en['Conversar no WhatsApp'], 'Chat on WhatsApp');
    assert.equal(es['Ver todas as ofertas'], 'Ver todas las ofertas');
    assert.equal(fr['Horário de Funcionamento'], "Horaires d'ouverture");
});
