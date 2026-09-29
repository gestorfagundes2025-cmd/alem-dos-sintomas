/** Progressive enhancement: conteúdo permanece visível sem JavaScript. */
const header=document.querySelector('.site-header');
let ticking=false;
function updateHeader(){header?.classList.toggle('is-scrolled',window.scrollY>24);ticking=false;}
window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(updateHeader);}}, {passive:true});
updateHeader();

const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const running=new Set();
let observer;
const revealTargets=[
  '.section-heading',
  '.offer-grid-v2 > article',
  '.signal',
  '.method-editorial > div',
  '.exam',
  '.video-intro',
  '.journey-grid > div',
  '.journey-list li',
  '.authority-copy',
  '.mentor-photo',
  '.team-orbit',
  '.award-mark',
  '.faq-list > details'
].flatMap(selector=>[...document.querySelectorAll(selector)]);

if('IntersectionObserver' in window&&!reduced.matches&&typeof Element.prototype.animate==='function'){
  const order=new Map(revealTargets.map((el,index)=>[el,index]));
  observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if(reduced.matches) continue;
      const index=order.get(entry.target)||0;
      const animation=entry.target.animate(
        [{opacity:.12,transform:'translateY(24px) scale(.988)'},{opacity:1,transform:'translateY(0) scale(1)'}],
        {duration:520,delay:(index%4)*55,easing:'cubic-bezier(.2,.72,.2,1)',fill:'both'}
      );
      running.add(animation);
      animation.finished.finally(()=>running.delete(animation)).catch(()=>{});
    }
  },{threshold:.08,rootMargin:'0px 0px -4% 0px'});
  revealTargets.forEach(el=>observer.observe(el));
}
reduced.addEventListener('change',event=>{
  if(event.matches){
    observer?.disconnect();
    for(const animation of running) animation.cancel();
    running.clear();
  }
});
