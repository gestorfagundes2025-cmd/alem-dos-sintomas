import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../site.config.mjs';
import { getWhatsAppUrl, validateRelease } from '../src/contact.mjs';
import { prepareAssets } from './assets.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const settings = { ...config, whatsapp: process.env.WHATSAPP_OFICIAL || config.whatsapp };
const requestedMode = process.env.SITE_MODE || config.mode;
const live = requestedMode === 'live' && process.env.VERCEL_ENV !== 'preview';
if (live) {
  const missing = validateRelease(settings);
  if (missing.length) throw new Error(`Publicação de campanha bloqueada. Falta: ${missing.join('; ')}.`);
}
await prepareAssets(root);
const dist = resolve(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, 'assets'), { recursive: true });
await cp(resolve(root, 'public'), dist, { recursive: true });
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const values = {
  ROBOTS: live ? 'index,follow' : 'noindex,nofollow',
  YEAR: String(new Date().getFullYear()),
  WHATSAPP_URL: escape(getWhatsAppUrl(settings.whatsapp, settings.message) || '#contato'),
  CANONICAL: live ? `<link rel="canonical" href="${escape(settings.canonicalUrl)}">` : '',
  LEGAL_ENTITY: escape(settings.legalEntity || 'Identificação jurídica em validação para a publicação.'),
  LEGAL_ADDRESS: escape(settings.legalAddress || 'Endereço completo em validação.'),
  PRIVACY_CONTACT: escape(settings.privacyContact || 'Contato de privacidade em validação.')
};
for (const file of ['index.html', 'privacidade.html']) {
  let html = await readFile(resolve(root, 'src', file), 'utf8');
  if (live) html = html.replace(/<!-- REVIEW:START -->[\s\S]*?<!-- REVIEW:END -->/g, '');
  html = html.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Token desconhecido: ${key}`);
    return values[key];
  });
  await writeFile(resolve(dist, file), html);
}
for (const [source, dest] of [['styles.css','styles.css'],['main.js','main.js'],['contact.mjs','contact.mjs']]) {
  await cp(resolve(root, 'src', source), resolve(dist, 'assets', dest));
}
const publicConfig = { whatsapp: settings.whatsapp, message: settings.message, review: !live };
await writeFile(resolve(dist, 'assets/config.js'), `export default ${JSON.stringify(publicConfig).replace(/</g, '\\u003c')};\n`);
await writeFile(resolve(dist, 'robots.txt'), live ? `User-agent: *\nAllow: /\n` : 'User-agent: *\nDisallow: /\n');
await writeFile(resolve(dist, '404.html'), '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Página não encontrada | Saúde Shalon</title><link rel="stylesheet" href="/assets/styles.css"><main class="privacy-page"><h1>Página não encontrada.</h1><p>O endereço solicitado não existe.</p><a class="text-link" href="/">Voltar ao início</a></main></html>');
console.log(`Build concluído: ${live ? 'campanha' : 'revisão'} · saída dist/ · sem pixels ativos.`);
