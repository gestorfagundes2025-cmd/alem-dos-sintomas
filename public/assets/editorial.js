/** Progressive enhancement: content never starts hidden; scrolling is never intercepted. */
const header=document.querySelector('.site-header');let ticking=false;
function updateHeader(){header?.classList.toggle('is-scrolled',window.scrollY>24);ticking=false;}
window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(updateHeader);}}, {passive:true});updateHeader();
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');const animations=new Set();let observer;
if('IntersectionObserver' in window&&!motion.matches&&typeof Element.prototype.animate==='function'){
 observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);if(motion.matches)continue;const animation=entry.target.animate([{opacity:.6,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.2,.6,.3,1)'});animations.add(animation);animation.finished.finally(()=>animations.delete(animation)).catch(()=>{});}},{threshold:.1});
 document.querySelectorAll('.section-heading,.method-editorial>div,.video-intro,.journey-grid>div:last-child,.people-grid>div:first-child').forEach(el=>observer.observe(el));
}
motion.addEventListener('change',event=>{if(event.matches){observer?.disconnect();for(const animation of animations)animation.cancel();animations.clear();}});
