import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkinCheck, distanceMeters, isValidLatLng, isInsideRegion, buildAddressQuery, directionsUrl,
  CHECKIN_RADIUS_M, MAX_ACCURACY_M, parseMapsInput, isShortMapsLink,
} from '../services/geoRules';

const praiaGrande = { lat: -22.9840, lng: -42.0224 };

test('distância em metros é coerente', () => {
  assert.equal(distanceMeters(praiaGrande, praiaGrande), 0);
  // ~0,001° de latitude ≈ 111 m
  const d = distanceMeters(praiaGrande, { lat: praiaGrande.lat + 0.001, lng: praiaGrande.lng });
  assert.ok(d > 100 && d < 120, `d=${d}`);
});

test('check-in vale dentro do raio e com GPS preciso', () => {
  const near = { lat: praiaGrande.lat + 0.0005, lng: praiaGrande.lng, accuracy: 20 };
  const r = checkinCheck(near, praiaGrande);
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.distanceM <= CHECKIN_RADIUS_M);
});

test('check-in falha longe do local', () => {
  const far = { lat: praiaGrande.lat + 0.01, lng: praiaGrande.lng, accuracy: 10 };
  const r = checkinCheck(far, praiaGrande);
  assert.equal(r.ok, false);
  if (!r.ok) { assert.equal(r.reason, 'too_far'); assert.ok((r.distanceM || 0) > CHECKIN_RADIUS_M); }
});

test('check-in falha com GPS impreciso', () => {
  const r = checkinCheck({ ...praiaGrande, accuracy: MAX_ACCURACY_M + 1 }, praiaGrande);
  assert.deepEqual(r, { ok: false, reason: 'low_accuracy' });
});

test('check-in sem localização da empresa ou do usuário', () => {
  assert.deepEqual(checkinCheck(praiaGrande, {}), { ok: false, reason: 'no_business_location' });
  assert.deepEqual(checkinCheck(praiaGrande, undefined), { ok: false, reason: 'no_business_location' });
  assert.deepEqual(checkinCheck({ lat: NaN, lng: 1 }, praiaGrande), { ok: false, reason: 'bad_position' });
  assert.deepEqual(checkinCheck(null, praiaGrande), { ok: false, reason: 'bad_position' });
});

test('ponto (0,0) e valores absurdos não são localização válida', () => {
  assert.equal(isValidLatLng({ lat: 0, lng: 0 }), false);
  assert.equal(isValidLatLng({ lat: 91, lng: 10 }), false);
  assert.equal(isValidLatLng({ lat: '1', lng: 2 }), false);
  assert.equal(isValidLatLng(praiaGrande), true);
});

test('pin do cadastro precisa estar na Região dos Lagos', () => {
  assert.equal(isInsideRegion(praiaGrande), true);
  assert.equal(isInsideRegion({ lat: -22.9068, lng: -43.1729 }), false); // centro do Rio
  assert.equal(isInsideRegion({ lat: -23.5, lng: -41.0 }), false); // mar aberto, longe
});

test('texto de endereço não repete partes', () => {
  assert.equal(
    buildAddressQuery({ address: 'Rua Gen. Osório, 10', neighborhood: 'Centro', city: 'Arraial do Cabo' }),
    'Rua Gen. Osório, 10, Centro, Arraial do Cabo, RJ, Brasil',
  );
  assert.equal(buildAddressQuery({ address: 'Praça Daniel Barreto, Arraial do Cabo', city: 'Arraial do Cabo' }),
    'Praça Daniel Barreto, Arraial do Cabo, RJ, Brasil');
});

test('link de rota usa as coordenadas', () => {
  assert.match(directionsUrl(praiaGrande), /destination=-22\.984,-42\.0224/);
});

test('lê coordenadas coladas e links completos do Google Maps', () => {
  assert.deepEqual(parseMapsInput('-22.9661, -42.0278'), { lat: -22.9661, lng: -42.0278 });
  assert.deepEqual(parseMapsInput('-22.9661 -42.0278'), { lat: -22.9661, lng: -42.0278 });
  assert.deepEqual(parseMapsInput('https://www.google.com/maps/place/Praia+Grande/@-22.9701,-42.0300,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d-22.98401!4d-42.02244'),
    { lat: -22.98401, lng: -42.02244 }); // prefere o pino do lugar ao centro da tela
  assert.deepEqual(parseMapsInput('https://www.google.com/maps/@-22.9701,-42.0300,17z'), { lat: -22.9701, lng: -42.03 });
  assert.deepEqual(parseMapsInput('https://maps.google.com/?q=-22.9,-42.03'), { lat: -22.9, lng: -42.03 });
  assert.deepEqual(parseMapsInput('https://www.google.com/maps/dir/?api=1&destination=-22.984,-42.0224'), { lat: -22.984, lng: -42.0224 });
});

test('texto comum e valores inválidos não viram coordenada', () => {
  assert.equal(parseMapsInput('Rua General Osório, 10'), null);
  assert.equal(parseMapsInput(''), null);
  assert.equal(parseMapsInput('99.5, 10.2'), null);
});

test('detecta link curto do Google Maps', () => {
  assert.equal(isShortMapsLink('https://maps.app.goo.gl/AbCdEf123'), true);
  assert.equal(isShortMapsLink('https://goo.gl/maps/xyz'), true);
  assert.equal(isShortMapsLink('https://www.google.com/maps/@-22.9,-42.0,17z'), false);
});
