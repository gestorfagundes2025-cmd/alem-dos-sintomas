import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = Object.fromEntries(['config','tracking','main'].map(n=>[n,fs.readFileSync(`dist/assets/${n}.js`,'utf8')]));
function setup({closed=false, invalid=false, existing=false}={}) {
  let now=Date.parse(closed?'2026-09-24T00:00:00Z':'2026-09-18T12:00:00Z');
  const listeners={}, inserted=[], timers=[], redirects=[];
  const ctas=['hero','content','ticket','mobile'].map(placement=>({dataset:{location:placement},attrs:{},handlers:{},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},addEventListener(k,v){this.handlers[k]=v}}));
  const window={location:{search:'?utm_source=meta&fbclid=test-click-id&email=not-forwarded',assign(url){redirects.push(url)}},addEventListener(n,f){(listeners[n]??=[]).push(f)},dispatchEvent(e){for(const f of listeners[e.type]||[]) f(e)},setTimeout(f){timers.push(f)},matchMedia(){return {matches:true}}};
  if(existing) {window.fbq=(...args)=>window.fbq.queue.push(args);window.fbq.queue=[];}
  const document={createElement(){return {}},getElementsByTagName(){return [{parentNode:{insertBefore(el){inserted.push(el)}}}]},querySelectorAll(s){return s==='[data-price]'?[]:ctas},getElementById(){return null},querySelector(){return null}};
  const ctx=vm.createContext({window,document,URL,URLSearchParams,Intl,Number,Date:class extends Date {static now(){return now}},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}}});
  vm.runInContext(source.config,ctx);
  if(invalid)window.JORNADA_CONFIG={...window.JORNADA_CONFIG,checkoutUrl:'https://evil.example/'};
  vm.runInContext(source.tracking,ctx);vm.runInContext(source.main,ctx);
  return {window,ctx,ctas,inserted,timers,redirects,advance(){now+=1500},events(){return window.fbq.queue.map(v=>Array.from(v)).filter(v=>v[0]==='trackSingle')},click(i,extra={}){const e={button:0,preventDefault(){this.defaultPrevented=true},...extra};ctas[i].handlers[e.button===1?'auxclick':'click'](e);return e}};
}
for(let i=0;i<4;i++) {
  const x=setup();assert.equal(x.inserted.length,1);assert.equal(x.inserted[0].src,'https://connect.facebook.net/en_US/fbevents.js');
  assert.equal(x.events().length,1);assert.equal(x.events()[0][2],'PageView');
  vm.runInContext(source.tracking,x.ctx);assert.equal(x.events().length,1,'No duplicate initialization');
  x.click(i);x.click(i);assert.equal(x.events().length,2,'Double click counted once');
  const ad=x.events()[1];assert.equal(ad[1],'2283183939189207');assert.equal(ad[2],'AddToCart');assert.equal(ad[3].value,69);assert.equal(ad[3].currency,'BRL');assert.equal(ad[3].contents[0].quantity,1);assert.equal(ad[3].button_location,x.ctas[i].dataset.location);
  assert.equal(x.window.dataLayer[1].event_id,ad[4].eventID);assert.equal(x.window.dataLayer[1].event,'add_to_cart');
  assert.equal(x.timers.length,1);x.timers[0]();assert.equal(x.redirects.length,1);
  const url=new URL(x.redirects[0]);assert.equal(url.hostname,'pay.hub.la');assert.equal(url.searchParams.get('fbclid'),'test-click-id');assert.equal(url.searchParams.get('utm_source'),'meta');assert(!url.searchParams.has('email'));
  x.window.dispatchEvent({type:'pageshow'});x.click(i);assert.equal(x.events().length,3,'Back navigation permits a new action');
}
for(const option of [{closed:true},{invalid:true}]) {const x=setup(option);assert(x.click(0).defaultPrevented);assert.equal(x.events().length,1);assert.equal(x.timers.length,0)}
for(const extra of [{ctrlKey:true},{metaKey:true},{button:1}]) {const x=setup();assert(!x.click(0,extra).defaultPrevented);assert.equal(x.events().length,2);assert.equal(x.timers.length,0)}
const blocked=setup();blocked.click(0);blocked.timers[0]();assert.equal(blocked.redirects.length,1,'Blocked SDK does not block checkout');
const shared=setup({existing:true});assert.equal(shared.inserted.length,0);assert.equal(shared.events().length,1);
assert(!/emit\(['"](?:Purchase|InitiateCheckout|Lead)/.test(source.tracking));
console.log('PASS: all 4 CTAs, PageView/AddToCart, value/currency/IDs, dataLayer, double clicks, repeated init, BFCache return, modified clicks, invalid/closed checkout, blocked Meta, UTMs/fbclid, no Purchase/InitiateCheckout. SDK is mocked; no events or purchases sent.');
