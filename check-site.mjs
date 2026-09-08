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
const run = (url) => {
  const cta = {dataset:{location:'test'}, attrs:{'aria-disabled':'true'}, handlers:{}, removeAttribute(k){delete this.attrs[k]}, addEventListener(k,cb){this.handlers[k]=cb}};
  const price = {};
  const notice = {hidden:false,scrollIntoView(){}};
  const ctx = {URL,URLSearchParams,Intl,Number,CustomEvent:class{},window:{JORNADA_CONFIG:{checkoutUrl:url,ticketPrice:69},location:{search:'?utm_source=instagram&unapproved=private'},matchMedia(){return {matches:true}},dispatchEvent(){}},document:{querySelectorAll(s){return s==='[data-price]'?[price]:[cta]},getElementById(s){return s==='preview-notice'?notice:null},querySelector(){return null}}};
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
console.log('PASS: local assets, anchors, headings, invalid checkout guard, valid redirect, UTM allowlist and price. No network calls or purchases.');
