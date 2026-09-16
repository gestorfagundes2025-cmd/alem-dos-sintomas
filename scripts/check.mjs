import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
const html = await readFile('dist/index.html', 'utf8');
const failures = [];
if (new RegExp('sha'+'lo'+'m','i').test(html)) failures.push('Grafia de marca incorreta. O nome obrigatório é Shalon.');
if ((html.match(/<h1[\s>]/g) || []).length !== 1) failures.push('A página precisa de um único H1.');
if (/R\$|\b(?:1\.900|4\.900|6\.800)\b/.test(html)) failures.push('A landing page não pode mostrar valores.');
if (/<form\b/i.test(html)) failures.push('O fluxo aprovado é WhatsApp, não formulário.');
if (/fbq\(|gtag\(|googletagmanager\.com|connect\.facebook\.net/.test(html)) failures.push('Há tag de publicidade indevida.');
if (/\{\{[A-Z_]+\}\}/.test(html)) failures.push('Há um token de build não resolvido.');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
if (new Set(ids).size !== ids.length) failures.push('Há IDs duplicados.');
for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!ids.includes(m[1])) failures.push(`Âncora inválida: ${m[1]}`);
for (const m of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
  try { await access(resolve('dist', '.'+m[1])); } catch { failures.push(`Asset ausente: ${m[1]}`); }
}
for (const m of html.matchAll(/<img\b[^>]*>/g)) {
  if (!/\balt="[^"]+"/.test(m[0])) failures.push('Imagem sem alternativa textual.');
  if (!/\bwidth="\d+"/.test(m[0]) || !/\bheight="\d+"/.test(m[0])) failures.push('Imagem sem dimensão explícita.');
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode=1; }
else console.log('Verificação estática aprovada: marca, oferta sem preços, CTA, estrutura, âncoras e imagens.');
