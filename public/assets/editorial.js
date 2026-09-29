/** Progressive enhancement: conteúdo continua legível e funcional sem JavaScript. */
const header=document.querySelector('.site-header');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let ticking=false;

function updateHeader(){
  header?.classList.toggle('is-scrolled',window.scrollY>24);
}

const revealGroups=[
  '.section-heading',
  '.offer-grid-v2 > article',
  '.signal',
  '.method-editorial > div',
  '.resources-v5-intro',
  '.resources-lines > details',
  '.journey-v5-copy',
  '.journey-v5-list > li',
  '.authority-v5-copy',
  '.authority-v5-signature',
  '.faq-list > details'
];
const revealTargets=revealGroups.flatMap(selector=>[...document.querySelectorAll(selector)]);
revealTargets.forEach((el,index)=>{
  el.classList.add('scroll-reveal');
  el.dataset.delay=String(index%4);
});

let revealObserver;
function enableReveal(){
  if(reduced.matches||!('IntersectionObserver' in window)){
    revealTargets.forEach(el=>el.classList.add('is-visible'));
    return;
  }
  revealObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  },{threshold:.11,rootMargin:'0px 0px -7% 0px'});
  revealTargets.forEach(el=>revealObserver.observe(el));
}

const parallaxImages=[...document.querySelectorAll('.parallax-media img')];
function updateParallax(){
  if(reduced.matches){
    parallaxImages.forEach(img=>img.style.setProperty('--parallax-y','0px'));
    ticking=false;
    return;
  }
  const vh=window.innerHeight;
  for(const img of parallaxImages){
    const host=img.closest('.parallax-media')||img;
    const rect=host.getBoundingClientRect();
    if(rect.bottom<0||rect.top>vh) continue;
    const center=rect.top+rect.height/2;
    const delta=(vh/2-center)*.042;
    const y=Math.max(-30,Math.min(30,delta));
    img.style.setProperty('--parallax-y',`${y.toFixed(1)}px`);
  }
  ticking=false;
}
function onScroll(){
  if(ticking) return;
  ticking=true;
  requestAnimationFrame(()=>{updateHeader();updateParallax();});
}
window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('resize',onScroll,{passive:true});
reduced.addEventListener('change',()=>{
  revealObserver?.disconnect();
  revealTargets.forEach(el=>el.classList.toggle('is-visible',true));
  updateParallax();
});
updateHeader();
enableReveal();
updateParallax();
