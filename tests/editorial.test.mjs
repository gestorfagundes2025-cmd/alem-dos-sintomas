import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('src/index.html','utf8');
const css=readFileSync('public/assets/editorial.css','utf8');

test('versão editorial v4 identificada',()=>assert.ok(html.includes('data-editorial-version="4"')));
test('oferta antecede sinais e método',()=>{
  assert.ok(html.indexOf('id="atendimento"')<html.indexOf('id="sinais"'));
  assert.ok(html.indexOf('id="atendimento"')<html.indexOf('id="metodo"'));
});
test('conteúdo aprovado da abertura preservado',()=>{
  assert.ok(html.includes('seu caso merece atenção por inteiro.'));
  assert.ok(html.includes('Falar com a equipe no WhatsApp'));
});
test('frentes práticas não substituem pilares',()=>{
  for(const word of ['HÁBITOS','CUIDADOS EM CASA','SERVIÇOS NA CLÍNICA','Remoção, Reposição e Reabilitação']) assert.ok(html.includes(word));
});
test('hero reintegra a doutora como autoridade sem prometer atendimento pessoal',()=>{
  const hero=html.slice(html.indexOf('id="inicio"'),html.indexOf('id="atendimento"'));
  assert.ok(hero.includes('class="doctor-cutout"'));
  assert.ok(hero.includes('/assets/dra-elizete.webp'));
  assert.ok(hero.includes('Médica e criadora da metodologia'));
  assert.ok(!hero.includes('consulta pessoal com a doutora'));
});
test('novo acervo reforça mentoria, equipe e registro institucional',()=>{
  for(const asset of ['/assets/dra-elizete-mentora.jpg','/assets/dra-elizete-mentora-mobile.jpg','/assets/equipe-saude-shalon.jpg','/assets/registro-premiacao.jpg']) assert.ok(html.includes(asset));
});
test('interações respeitam preferência de movimento reduzido',()=>assert.ok(css.includes('prefers-reduced-motion')));
