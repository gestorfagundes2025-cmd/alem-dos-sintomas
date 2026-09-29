"""Browser checks for the generated page. Never contacts a real WhatsApp number."""
import json, shutil, subprocess, time, re
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path('qa/v3');out.mkdir(parents=True,exist_ok=True)
server=subprocess.Popen(['node','scripts/serve.mjs'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
report={'widths':[], 'errors':[], 'image_failures':[], 'fonts':[], 'checks':[]}
try:
 time.sleep(1)
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  for width in [320,360,375,390,430,600,768,820,1024,1280,1440,1920]:
   page=browser.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
   page.on('pageerror',lambda error:report['errors'].append(str(error)))
   page.goto('http://127.0.0.1:4173',wait_until='networkidle')
   page.evaluate('document.fonts.ready');page.wait_for_timeout(450)
   dimensions=page.evaluate('({viewport:innerWidth,document:document.documentElement.scrollWidth})')
   assert dimensions['viewport']==dimensions['document'],dimensions
   hero=page.locator('.editorial-hero .hero-copy').bounding_box();image=page.locator('.editorial-visual .hero-photo').bounding_box()
   overlap=max(0,min(hero['x']+hero['width'],image['x']+image['width'])-max(hero['x'],image['x']))*max(0,min(hero['y']+hero['height'],image['y']+image['height'])-max(hero['y'],image['y']))
   assert overlap==0,{'width':width,'overlap':overlap}
   report['widths'].append({**dimensions,'hero_image_text_overlap_px2':overlap})
   assert page.locator('h1').count()==1
   assert page.locator('form,iframe').count()==0
   assert page.locator('main>section').nth(1).get_attribute('id')=='atendimento'
   assert not re.search(r'R\$',page.locator('main').inner_text())
   for selector in ['.hero-description','.signal p','.care-path article p:last-child','.faq-list details>div p']:
    size=page.locator(selector).first.evaluate('(e)=>parseFloat(getComputedStyle(e).fontSize)');assert size>=16,(width,selector,size)
   page.locator('[data-placement="hero"]').click();assert page.locator('#contact-dialog').evaluate('(e)=>e.open')
   page.keyboard.press('Escape');page.wait_for_timeout(50)
   assert page.locator('[data-placement="hero"]').evaluate('(e)=>document.activeElement===e')
   if width<=820:
    page.locator('.menu-toggle').click();assert page.locator('#menu-dialog').evaluate('(e)=>e.open');page.keyboard.press('Escape')
   for selector in ['.faq-list summary','.exam summary']:
    page.locator(selector).first.click();assert page.locator(selector).first.evaluate('(e)=>e.parentElement.open');page.locator(selector).first.click()
   page.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")
   page.wait_for_function("[...document.images].every(i=>i.complete)",timeout=30000)
   failures=page.evaluate("[...document.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src'))");assert not failures,failures
   if width in [390,1440]:
    page.evaluate("scrollTo({top:0,behavior:'instant'})");page.wait_for_timeout(600)
    name='mobile' if width==390 else 'desktop'
    page.screenshot(path=str(out/f'{name}.jpg'),type='jpeg',quality=82,full_page=True)
    page.screenshot(path=str(out/f'{name}-top.jpg'),type='jpeg',quality=88)
    report['fonts']=page.evaluate("[...document.fonts].map(f=>({family:f.family,status:f.status}))")
   page.emulate_media(reduced_motion='reduce');assert page.evaluate("getComputedStyle(document.documentElement).scrollBehavior")=='auto'
   page.locator('#play-video').click();assert 'youtube-nocookie.com/embed/euDugEHasYg' in page.locator('#video-stage iframe').get_attribute('src')
   page.close()
  browser.close()
 assert not report['errors'],report['errors']
 report['result']='passed'
 report['checks']=['12 larguras sem overflow','hero sem sobreposição','texto principal >=16px','um H1','oferta em segunda seção','sem preços/formulário','WhatsApp sem número abre aviso','Escape devolve foco','menu móvel','FAQ','detalhes de recursos','imagens','movimento reduzido','YouTube só após clique']
finally:
 server.terminate();(out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('UI_REPORT '+json.dumps(report,ensure_ascii=False))
