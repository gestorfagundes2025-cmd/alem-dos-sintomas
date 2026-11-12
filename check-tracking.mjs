import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = Object.fromEntries(['config','tracking','main'].map(n=>[n,fs.readFileSync(`dist/assets/${n}.js`,'utf8')]));
function setup({closed=false, invalid=false, existing=false, paused=false, invalidDate=false, beforeStartMs=null}={}) {
  let now=Date.parse(closed?'2026-11-19T00:00:00Z':'2026-11-12T12:00:00Z');
  if (beforeStartMs !== null) now = Date.parse('2026-11-18T22:00:00Z') - beforeStartMs;
  const listeners={}, inserted=[], timers=[], redirects=[];
  const ctas=['hero','content','ticket','mobile'].map(placement=>({dataset:{location:placement},attrs:{},handlers:{},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},addEventListener(k,v){this.handlers[k]=v}}));
  const window={location:{search:'?utm_source=meta&fbclid=test-click-id&email=not-forwarded',assign(url){redirects.push(url)}},addEventListener(n,f){(listeners[n]??=[]).push(f)},dispatchEvent(e){for(const f of listeners[e.type]||[]) f(e)},setTimeout(f){timers.push(f)},matchMedia(){return {matches:true}}};
  if(existing) {window.fbq=(...args)=>window.fbq.queue.push(args);window.fbq.queue=[];}
  const document={createElement(){return {}},getElementsByTagName(){return [{parentNode:{insertBefore(el){inserted.push(el)}}}]},querySelectorAll(s){return s==='[data-price]'?[]:ctas},getElementById(){return null},querySelector(){return null}};
  const ctx=vm.createContext({window,document,URL,URLSearchParams,Intl,Number,Date:class extends Date {static now(){return now}},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}}});
  vm.runInContext(source.config,ctx);
  // Exercise the real configuration; pause only for the unavailable-offer case.
  if(paused)window.JORNADA_CONFIG={...window.JORNADA_CONFIG,checkoutEnabled:false};
  if(invalid)window.JORNADA_CONFIG={...window.JORNADA_CONFIG,checkoutUrl:'https://evil.example/'};
  if(invalidDate)window.JORNADA_CONFIG={...window.JORNADA_CONFIG,eventStart:'invalid'};
  vm.runInContext(source.tracking,ctx);vm.runInContext(source.main,ctx);
  return {window,ctx,ctas,inserted,timers,redirects,advance(ms=1500){now+=ms},events(){return window.fbq.queue.map(v=>Array.from(v)).filter(v=>v[0]==='trackSingle')},click(i,extra={}){const e={button:0,preventDefault(){this.defaultPrevented=true},...extra};ctas[i].handlers[e.button===1?'auxclick':'click'](e);return e}};
}
for(let i=0;i<4;i++) {
  const x=setup();assert.equal(x.inserted.length,1);assert.equal(x.inserted[0].src,'https://connect.facebook.net/en_US/fbevents.js');
  assert.equal(x.events().length,1);assert.equal(x.events()[0][2],'PageView');
  vm.runInContext(source.tracking,x.ctx);assert.equal(x.events().length,1,'No duplicate initialization');
  vm.runInContext(source.main,x.ctx);
  x.click(i);x.click(i);assert.equal(x.events().length,2,'Double click counted once');
  const ad=x.events()[1];assert.equal(ad[1],'2283183939189207');assert.equal(ad[2],'AddToCart');assert.equal(ad[3].value,69);assert.equal(ad[3].currency,'BRL');assert.equal(ad[3].contents[0].quantity,1);assert.equal(ad[3].button_location,x.ctas[i].dataset.location);
  assert.equal(x.window.dataLayer[1].event_id,ad[4].eventID);assert.equal(x.window.dataLayer[1].event,'add_to_cart');
  assert.equal(ad[3].event_edition,'jornada_20261118_edicao2');
  assert.equal(ad[3].content_ids[0],'jornada_16092026','Commercial product ID is preserved pending Hubla confirmation');
  assert.equal(x.timers.length,1);x.timers[0]();assert.equal(x.redirects.length,1);
  const url=new URL(x.redirects[0]);assert.equal(url.origin+url.pathname,'https://pay.hub.la/qvT6cLhJVdKNMx8nD0Cm');assert.equal(url.searchParams.get('fbclid'),'test-click-id');assert.equal(url.searchParams.get('utm_source'),'meta');assert(!url.searchParams.has('email'));
  x.window.dispatchEvent({type:'pageshow'});x.click(i);assert.equal(x.events().length,3,'Back navigation permits a new action');
}
for(const option of [{closed:true},{invalid:true},{paused:true},{invalidDate:true}]) {
  for(let i=0;i<4;i++) {
    const x=setup(option);
    assert.equal(x.ctas[i].attrs['aria-disabled'],'true');
    assert.equal(x.ctas[i].href,'#participar');
    assert(x.click(i).defaultPrevented);
    assert(x.click(i,{button:1}).defaultPrevented);
    assert.equal(x.events().length,1);assert.equal(x.timers.length,0);
  }
}
const paused=setup({paused:true});
paused.window.dispatchEvent({type:'jornada:checkout-click',detail:{placement:'hero'}});
assert.equal(paused.events().length,1,'Paused offer does not emit conversions even if another script dispatches the UI event');
const boundary=setup({beforeStartMs:200});boundary.click(0);boundary.advance(350);boundary.timers[0]();
assert.equal(boundary.redirects.length,0,'A delayed navigation must not redirect after the deadline');
const suspended=setup({beforeStartMs:200});suspended.advance(500);suspended.click(0);
assert.equal(suspended.events().length,1,'A suspended tab cannot sell or emit AddToCart past the deadline');
for(const extra of [{ctrlKey:true},{metaKey:true},{button:1}]) {const x=setup();assert(!x.click(0,extra).defaultPrevented);assert.equal(x.events().length,2);assert.equal(x.timers.length,0)}
const blocked=setup();blocked.click(0);blocked.timers[0]();assert.equal(blocked.redirects.length,1,'Blocked SDK does not block checkout');
const shared=setup({existing:true});assert.equal(shared.inserted.length,0);assert.equal(shared.events().length,1);
assert(!/emit\(['"](?:Purchase|InitiateCheckout|Lead)/.test(source.tracking));
console.log('PASS: all 4 CTAs, PageView/AddToCart, value/currency/IDs, dataLayer, double clicks, repeated init, BFCache return, modified clicks, invalid/closed checkout, blocked Meta, UTMs/fbclid, no Purchase/InitiateCheckout. SDK is mocked; no events or purchases sent.');
