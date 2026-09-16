"""UI smoke tests for the revision. No personal or clinical data is entered."""
import json, shutil, subprocess, time
from pathlib import Path
from playwright.sync_api import sync_playwright

out=Path('qa/v2'); out.mkdir(parents=True,exist_ok=True)
server=subprocess.Popen(['node','scripts/serve.mjs'],stdout=subprocess.DEVNULL)
report={'widths':[], 'errors':[], 'image_failures':[], 'fonts':[]}
try:
 time.sleep(1)
 with sync_playwright() as p:
  browser_path=shutil.which('google-chrome') or shutil.which('chromium')
  browser=p.chromium.launch(executable_path=browser_path,headless=True,args=['--no-sandbox'])
  for width in [320,360,390,430,600,768,820,1024,1280,1440]:
   page=browser.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
   page.on('pageerror',lambda error:report['errors'].append(str(error)))
   page.goto('http://127.0.0.1:4173',wait_until='networkidle')
   page.evaluate('document.fonts.ready')
   dimensions=page.evaluate('({viewport:innerWidth,document:document.documentElement.scrollWidth})')
   assert dimensions['viewport']==dimensions['document'],dimensions
   report['widths'].append(dimensions)
   # Lazy images are loaded intentionally before full-page evidence.
   page.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")
   page.wait_for_function("[...document.images].every(i=>i.complete)",timeout=20000)
   failures=page.evaluate("[...document.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src'))")
   report['image_failures']+=failures
   assert not failures,failures
   assert page.locator('iframe').count()==0
   assert page.locator('form').count()==0
   # Preview contact cannot go to a placeholder phone.
   page.locator('[data-placement="hero"]').click()
   assert page.locator('#contact-dialog').evaluate('(e)=>e.open')
   page.keyboard.press('Escape')
   if width<=820:
    page.locator('.menu-toggle').click()
    assert page.locator('#menu-dialog').evaluate('(e)=>e.open')
    page.keyboard.press('Escape')
   page.locator('.faq-list summary').first.click()
   assert page.locator('.faq-list details').first.get_attribute('open') is not None
   page.locator('.faq-list summary').first.click()
   page.locator('.exam summary').first.click()
   assert page.locator('.exam details').first.get_attribute('open') is not None
   page.locator('.exam summary').first.click()
   if width in [390,1440]:
    page.evaluate("scrollTo({top:0,behavior:'instant'})")
    page.wait_for_timeout(200)
    name='mobile' if width==390 else 'desktop'
    page.screenshot(path=str(out/f'{name}.jpg'),type='jpeg',quality=78,full_page=True)
    page.screenshot(path=str(out/f'{name}-top.jpg'),type='jpeg',quality=85)
    report['fonts']=page.evaluate("[...document.fonts].map(f=>({family:f.family,status:f.status}))")
   # Verify consent gate and exact player destination; playback availability is external.
   page.locator('#play-video').click()
   assert 'youtube-nocookie.com/embed/euDugEHasYg' in page.locator('#video-stage iframe').get_attribute('src')
   page.close()
  browser.close()
 assert not report['errors'],report['errors']
 report['result']='passed'
finally:
 server.terminate()
 (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(report,ensure_ascii=False,indent=2))
