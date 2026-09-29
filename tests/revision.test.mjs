import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync('src/index.html','utf8');
const js=readFileSync('src/main.js','utf8');
const editorial=readFileSync('public/assets/editorial.js','utf8');
const vercel=JSON.parse(readFileSync('vercel.json','utf8'));

test('hero usa recorte integrado da doutora, não card fotográfico',()=>{
  assert.ok(html.includes('class="doctor-cutout"'));
  assert.ok(html.includes('class="hero-doctor-visual"'));
  assert.ok(!html.includes('class="hero-image"'));
});
test('pilares da metodologia preservados',()=>{for(const title of ['Remoção','Reposição','Reabilitação']) assert.ok(html.includes(title));});
test('retorno não depende de continuidade',()=>assert.ok(html.includes('O retorno incluído não depende')));
test('seis avaliações têm fotografia e detalhes',()=>assert.equal((html.match(/class="exam"/g)||[]).length,6));
test('novo acervo não usa grupo aleatório como prova principal',()=>{
  assert.ok(html.includes('/assets/dra-elizete-mentora.jpg'));
  assert.ok(html.includes('/assets/registro-premiacao.jpg'));
  assert.ok(!html.includes('FOTOGRAFIA-130'));
});
test('microinterações estão implementadas',()=>{
  assert.ok(editorial.includes('IntersectionObserver'));
  assert.ok(html.includes('class="hero-proof"'));
  assert.ok(readFileSync('public/assets/editorial.css','utf8').includes('.button:hover .arrow'));
});
test('YouTube não é carregado no HTML inicial',()=>{assert.ok(!html.includes('<iframe'));assert.ok(html.includes('id="play-video"'));assert.ok(js.includes('youtube-nocookie.com/embed/euDugEHasYg'));});
test('CSP permite apenas o host de vídeo selecionado',()=>{const policy=vercel.headers.flatMap(x=>x.headers).find(x=>x.key==='Content-Security-Policy').value;assert.ok(policy.includes('frame-src https://www.youtube-nocookie.com;'));assert.ok(!policy.includes("'unsafe-inline'"));});
test('sem depoimentos fictícios na revisão',()=>{assert.ok(!html.includes('class="proof-placeholder"'));assert.ok(!/John Doe|Lorem ipsum|Rated 5/i.test(html));});
