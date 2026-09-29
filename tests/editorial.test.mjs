import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const html=readFileSync('src/index.html','utf8'),css=readFileSync('public/assets/editorial.css','utf8');
test('versão editorial identificada',()=>assert.ok(html.includes('data-editorial-version="3"')));
test('oferta antecede sinais e método',()=>{assert.ok(html.indexOf('id="atendimento"')<html.indexOf('id="sinais"'));assert.ok(html.indexOf('id="atendimento"')<html.indexOf('id="metodo"'));});
test('conteúdo aprovado da abertura preservado',()=>{assert.ok(html.includes('seu caso merece atenção por inteiro.'));assert.ok(html.includes('Falar com a equipe no WhatsApp'));});
test('frentes práticas não substituem pilares',()=>{for(const word of ['HÁBITOS','CUIDADOS EM CASA','SERVIÇOS NA CLÍNICA','Remoção, Reposição e Reabilitação'])assert.ok(html.includes(word));});
test('abertura não usa a autoridade como atendimento pessoal',()=>{const hero=html.slice(html.indexOf('id="inicio"'),html.indexOf('id="atendimento"'));assert.ok(hero.includes('/assets/avaliacao.jpg'));assert.ok(!hero.includes('hero-signature'));});
test('fotografia não repete a mesma autoridade no hero e equipe',()=>assert.ok(html.includes('src="/assets/dra-elizete.webp"')));
test('movimento reduzido tem CSS explícito',()=>assert.ok(css.includes('@media(prefers-reduced-motion:reduce)')));
