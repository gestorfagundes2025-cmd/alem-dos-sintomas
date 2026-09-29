import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('src/index.html','utf8');
const js=readFileSync('src/main.js','utf8');
const editorial=readFileSync('public/assets/editorial.js','utf8');
const css=readFileSync('public/assets/editorial.css','utf8');
const vercel=JSON.parse(readFileSync('vercel.json','utf8'));
test('primeira dobra usa fotografia integrada da doutora',()=>{const hero=html.slice(html.indexOf('id="inicio"'),html.indexOf('id="atendimento"'));assert.ok(hero.includes('hero-photo-v5'));assert.ok(hero.includes('/assets/atividade-profissional.webp'));assert.ok(hero.includes('hero-shade-v5'));});
test('recursos são linhas sobre imagem integrada, não grade de cards fotográficos',()=>{assert.ok(html.includes('resources-lines'));assert.ok(!html.includes('class="exam"'));});
test('autoridade usa novo acervo de mentoria como fundo',()=>assert.ok(html.includes('/assets/dra-elizete-mentora.webp')));
test('retorno continua explícito e sem preço',()=>{assert.ok(html.includes('O retorno incluído não depende'));assert.ok(!/R\$/.test(html));});
test('scroll e parallax são implementados com redução de movimento',()=>{assert.ok(editorial.includes('updateParallax'));assert.ok(editorial.includes('scroll-reveal'));assert.ok(css.includes('prefers-reduced-motion'));});
test('botões e X possuem microinterações',()=>{assert.ok(css.includes('.button:hover .arrow'));assert.ok(css.includes('.close-dialog:hover'));});
test('YouTube continua sob clique',()=>{assert.ok(!html.includes('<iframe'));assert.ok(html.includes('id="play-video"'));assert.ok(js.includes('youtube-nocookie.com/embed/euDugEHasYg'));});
test('CSP continua sem unsafe-inline',()=>{const policy=vercel.headers.flatMap(x=>x.headers).find(x=>x.key==='Content-Security-Policy').value;assert.ok(!policy.includes("'unsafe-inline'"));});

test('espaço da clínica vem antes das dúvidas',()=>assert.ok(html.indexOf('id="espaco"')<html.indexOf('id="duvidas"')));
test('jornada não usa mais fotografia do equipamento corporal',()=>{const journey=html.slice(html.indexOf('id="jornada"'),html.indexOf('id="equipe"'));assert.ok(!journey.includes('/assets/avaliacao-corporal.jpg'));assert.ok(journey.includes('/assets/clinica-recepcao.webp'));});
test('hero não mantém assinatura lateral duplicada',()=>{const hero=html.slice(html.indexOf('id="inicio"'),html.indexOf('id="atendimento"'));assert.ok(!hero.includes('hero-signature'));});

test('privacidade não ocupa seção própria',()=>{assert.ok(!html.includes('privacy-strip'));assert.ok(html.includes('href="/privacidade.html"'));});
test('correção mobile evita assinatura absoluta da autoridade',()=>{assert.ok(css.includes('@media(max-width:820px)'));assert.ok(css.includes('.authority-v5-signature{\n    position:static;'));});
test('hero mobile possui ajuste focal dedicado',()=>{assert.ok(css.includes('V7 · Correções mobile'));assert.ok(css.includes('object-position:32% 38%'));});
