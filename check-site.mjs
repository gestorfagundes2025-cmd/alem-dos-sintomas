import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = path.resolve('dist');
for (const file of ['index.html','privacidade.html']) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${file}: one h1`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: unique ids`);
  for (const [, ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (ref.startsWith('#')) assert(ids.includes(ref.slice(1)), `Missing anchor ${ref}`);
    else if (!/^[a-z]+:/i.test(ref)) assert(fs.existsSync(path.resolve(root, ref)), `Missing asset ${ref}`);
  }
}
const main = fs.readFileSync('dist/assets/main.js', 'utf8');
const run = (url, now = Date.parse('2026-09-09T12:00:00-03:00')) => {
  const cta = {dataset:{location:'test'}, attrs:{'aria-disabled':'true'}, handlers:{}, setAttribute(k,v){this.attrs[k]=v}, removeAttribute(k){delete this.attrs[k]}, addEventListener(k,cb){this.handlers[k]=cb}};
  const price = {};
  const notice = {hidden:false,scrollIntoView(){}};
  const ctx = {URL,URLSearchParams,Intl,Number,Date:class extends Date{static now(){return now}},CustomEvent:class{},window:{JORNADA_CONFIG:{checkoutUrl:url,ticketPrice:69,eventStart:'2026-09-23T19:00:00-03:00'},location:{search:'?utm_source=instagram&unapproved=private'},matchMedia(){return {matches:true}},dispatchEvent(){},addEventListener(){}},document:{querySelectorAll(s){return s==='[data-price]'?[price]:[cta]},getElementById(s){return s==='preview-notice'?notice:null},querySelector(){return null}}};
  vm.runInNewContext(main, ctx);
  return {cta,notice,price};
};
for (const url of ['', 'https://example.com/test', 'javascript:alert(1)', 'https://hub.la.example.com/test', 'http://hub.la/test']) {
  const {cta,notice} = run(url);
  assert.equal(cta.attrs['aria-disabled'],'true');
  let prevented = false;
  cta.handlers.click({preventDefault(){prevented=true}});
  assert(prevented && !notice.hidden);
}
// Mock URL tests only: no request to a checkout or purchase is made.
const {cta,notice,price}=run('https://pay.hub.la/test-only?fixed=yes');
assert(notice.hidden);
assert(!('aria-disabled' in cta.attrs));
const destination = new URL(cta.href);
assert.equal(destination.searchParams.get('fixed'),'yes');
assert.equal(destination.searchParams.get('utm_source'),'instagram');
assert.equal(destination.searchParams.get('unapproved'),null);
assert(price.textContent.includes('69'));
assert(!main.includes('fbq('));
assert(!main.includes('localStorage'));
const closed=run('https://pay.hub.la/test-only',Date.parse('2026-09-23T22:00:00Z'));
assert.equal(closed.cta.attrs['aria-disabled'],'true');
assert.equal(closed.cta.href,'#participar');
let prevented=false;
closed.cta.handlers.click({preventDefault(){prevented=true}});
assert(prevented,'Past event cannot redirect to purchase');
for(const file of ['dist/index.html','dist/privacidade.html']) assert(!/\b(?:Shalom|Chalom)\b/i.test(fs.readFileSync(file,'utf8')),`${file}: brand must end in N`);
const css=fs.readFileSync('dist/assets/style.css','utf8');
for(const [,ref] of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) assert(fs.existsSync(path.resolve('dist/assets',ref)),`Missing CSS asset ${ref}`);
console.log('PASS: local assets, anchors, headings, invalid checkout guard, valid redirect, UTM allowlist and price. No network calls or purchases.');
