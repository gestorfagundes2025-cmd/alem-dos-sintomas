import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('src/index.html','utf8');
const css=readFileSync('public/assets/editorial.css','utf8');

test('versão editorial v6 identificada',()=>assert.ok(html.includes('data-editorial-version="6"')));
test('hero mantém a fotografia aprovada e remove bloco lateral redundante',()=>{
  const hero=html.slice(html.indexOf('id="inicio"'),html.indexOf('id="atendimento"'));
  assert.ok(hero.includes('Você não precisa'));
  assert.ok(hero.includes('/assets/atividade-profissional.webp'));
  assert.ok(hero.includes('Quero conhecer a avaliação'));
  assert.ok(hero.includes('Dra. Elizete Kaffer'));
  assert.ok(!hero.includes('A ORIGEM DO NOSSO OLHAR'));
  assert.ok(!hero.includes('class="hero-signature"'));
});
test('oferta continua logo após a abertura',()=>assert.ok(html.indexOf('id="atendimento"')<html.indexOf('id="sinais"')));
test('pilares e frentes práticas permanecem na página',()=>{
  for(const word of ['HÁBITOS','CUIDADOS EM CASA','SERVIÇOS NA CLÍNICA','Remoção, Reposição e Reabilitação']) assert.ok(html.includes(word));
});
test('tecnologia continua com linhas sobre imagem integrada',()=>{
  assert.ok(html.includes('resources-lines'));
  assert.ok(html.includes('resources-backdrop'));
  assert.ok(!html.includes('class="exam"'));
});
test('jornada usa ambiente real da clínica e contraste v6',()=>{
  const journey=html.slice(html.indexOf('id="jornada"'),html.indexOf('id="equipe"'));
  assert.ok(journey.includes('/assets/clinica-recepcao.webp'));
  assert.ok(css.includes('Jornada: fotografia de ambiente real + contraste alto'));
  assert.ok(css.includes('.journey-v5 .journey-shade'));
});
test('seção de espaço usa três fotografias reais do acervo',()=>{
  const space=html.slice(html.indexOf('id="espaco"'),html.indexOf('privacy-strip'));
  for(const src of ['/assets/clinica-recepcao.webp','/assets/clinica-espera.webp','/assets/clinica-corredor.webp']) assert.ok(space.includes(src));
  assert.ok(space.includes('Conheça o espaço'));
});
test('privacidade aparece antes do FAQ e aponta para a política',()=>{
  assert.ok(html.indexOf('privacy-strip')<html.indexOf('id="duvidas"'));
  assert.ok(html.includes('Sua privacidade é respeitada'));
  assert.ok(html.includes('href="/privacidade.html"'));
});
test('v5 preserva remoção de máscaras nas seções integradas',()=>{
  assert.ok(css.includes('V5 remove deliberadamente'));
  assert.ok(css.includes('.resources-v5 *, .journey-v5 *, .authority-v5 *{border-radius:0}'));
});
test('v6 inclui gradientes e responsividade própria',()=>{
  assert.ok(css.includes('V6 · Espaço, privacidade e contraste refinado'));
  assert.ok(css.includes('@media(max-width:600px)'));
  assert.ok(css.includes('.space-v6-gallery'));
  assert.ok(css.includes('.privacy-v6-grid'));
});
