import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=fs.readFileSync('dist/assets/countdown.js','utf8');
const configured={window:{}};
vm.runInNewContext(fs.readFileSync('dist/assets/config.js','utf8'),configured);
const date=configured.window.JORNADA_CONFIG.eventStart;
const target=Date.parse(date);
assert.equal(new Date(target).toISOString(),'2026-09-16T22:00:00.000Z','Brasília offset is explicit');
function run(now, eventStart=date){
  const units=Object.fromEntries(['days','hours','minutes','seconds'].map(key=>[key,{textContent:'--'}]));
  const timer={hidden:false,dataset:{eventStart},querySelector(selector){return units[selector.match(/"(\w+)"/)[1]]}};
  const status={textContent:'Nosso encontro começa em'};
  const state={now,interval:null,ended:0,cleared:0};
  const document={hidden:false,getElementById(id){return id==='event-countdown'?timer:status},addEventListener(type,cb){state[type]=cb}};
  const window={JORNADA_CONFIG:{eventStart},setInterval(cb){state.interval=cb;return 1},clearInterval(){state.cleared++},dispatchEvent(){state.ended++}};
  vm.runInNewContext(code,{document,window,Date:class extends Date{static now(){return state.now}},CustomEvent:class{}});
  return {units,timer,status,state};
}
let t=run(target-(7*86400+3*3600+2*60+4)*1000);
assert.deepEqual(Object.values(t.units).map(x=>x.textContent),['07','03','02','04']);
t.state.now+=61000;t.state.interval();
assert.deepEqual(Object.values(t.units).map(x=>x.textContent),['07','03','01','03'],'Recomputes real time after delayed callbacks');
t.state.now=target+1000;t.state.visibilitychange();
assert(t.timer.hidden&&t.state.cleared===1&&t.state.ended===1,'Resuming after event stops countdown');
assert.deepEqual(Object.values(t.units).map(x=>x.textContent),['00','00','00','00']);
assert.equal(run(target-1).units.seconds.textContent,'01');
for(const now of [target,target+86400000]){
  t=run(now);assert(t.timer.hidden);assert.equal(t.state.interval,null);assert.equal(t.state.ended,1);
}
assert.equal(run(target,'not-a-date').state.interval,null,'Invalid date never runs a misleading timer');
console.log('PASS: Brasília date, daily/hourly rollover, delayed tab, zero and past event without negative numbers or resetting.');
