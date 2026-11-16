import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const tour = readFileSync('components/AppTour.tsx', 'utf8');
const nav = readFileSync('components/NavBar.tsx', 'utf8');
const app = readFileSync('App.tsx', 'utf8');
const drawer = readFileSync('components/AppDrawer.tsx', 'utf8');

const targets = [...tour.matchAll(/target: '([a-z]+)'/g)].map(m => m[1]);

test('todo passo do tutorial aponta para um item que existe no menu', () => {
  assert.ok(targets.length >= 5);
  for (const t of targets) {
    const n = (nav.match(new RegExp(`data-tour="${t}"`, 'g')) || []).length;
    assert.ok(n >= 2, `data-tour="${t}" precisa existir no menu do celular e do computador (achou ${n})`);
  }
});

test('o tutorial começa e termina com cartão central e pode ser pulado', () => {
  assert.match(tour, /title: 'Bem-vindo ao Lagos GO'/);
  assert.match(tour, /app-tour-skip/);
  assert.match(tour, /localStorage\.setItem\(TOUR_KEY/);
});

test('o tutorial está ligado ao app e ao "Como funciona" da gaveta', () => {
  assert.match(app, /<AppTour page=\{page\} \/>/);
  assert.match(drawer, /Como funciona/);
  assert.match(drawer, /startAppTour/);
});

test('o convite dos avisos espera o tutorial terminar (não cobre a barra de baixo)', () => {
  const push = readFileSync('components/PushOptIn.tsx', 'utf8');
  assert.match(push, /TOUR_DONE_EVENT/);
  assert.match(push, /tourSeen\(\)/);
  assert.match(tour, /dispatchEvent\(new Event\(TOUR_DONE_EVENT\)\)/);
});
