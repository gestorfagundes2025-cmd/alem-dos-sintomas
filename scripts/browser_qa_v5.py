"""Browser QA for Saúde Shalon LP v5."""
import json, shutil, subprocess, time, re
from pathlib import Path
from playwright.sync_api import sync_playwright

out=Path('qa/v5'); out.mkdir(parents=True,exist_ok=True)
server=subprocess.Popen(['node','scripts/serve.mjs'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
report={'viewports':[], 'errors':[], 'fonts':[], 'checks':[]}
try:
    time.sleep(1)
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
        viewports=[(320,720),(360,800),(390,844),(430,860),(768,900),(1024,768),(1280,800),(1440,768),(1440,900),(1920,1080)]
        for width,height in viewports:
            page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
            page.on('pageerror',lambda error:report['errors'].append(str(error)))
            page.goto('http://127.0.0.1:4173',wait_until='networkidle')
            page.evaluate('document.fonts.ready'); page.wait_for_timeout(500)
            dims=page.evaluate('({viewport:innerWidth,document:document.documentElement.scrollWidth})')
            assert dims['viewport']==dims['document'],(width,height,dims)

            hero=page.locator('.hero-v5')
            assert hero.count()==1
            assert page.locator('.hero-photo-v5 img').get_attribute('src')=='/assets/atividade-profissional.jpg'
            assert page.locator('h1').count()==1
            assert page.locator('form,iframe').count()==0
            assert not re.search(r'R\$',page.locator('main').inner_text())

            cta=page.locator('[data-placement="hero"]')
            cta_box=cta.bounding_box()
            assert cta_box,(width,height)
            # Primary CTA must be visible in the first viewport in the critical desktop/mobile review sizes.
            if (width,height) in [(390,844),(1024,768),(1440,768),(1440,900)]:
                assert cta_box['y']+cta_box['height'] <= height,(width,height,cta_box)

            # Core copy maintains readable size.
            for selector in ['.hero-description','.signal p','.faq-list details>div p']:
                size=page.locator(selector).first.evaluate('(e)=>parseFloat(getComputedStyle(e).fontSize)')
                assert size>=15,(width,height,selector,size)

            # No organic rounded masks remain in the integrated image sections.
            for selector in ['.resources-v5','.journey-v5','.authority-v5']:
                radius=page.locator(selector).evaluate('(e)=>getComputedStyle(e).borderRadius')
                assert radius in ('0px',''),(width,height,selector,radius)

            # Background treatment is native to sections.
            for selector in ['.resources-backdrop img','.journey-backdrop img','.authority-background img']:
                assert page.locator(selector).count()==1
                assert page.locator(selector).evaluate('(e)=>e.complete && e.naturalWidth>0')

            # Scroll reveal is visibly active and resolves after entry.
            target=page.locator('.resources-v5-intro')
            assert 'scroll-reveal' in (target.get_attribute('class') or '')
            target.scroll_into_view_if_needed(); page.wait_for_timeout(900)
            assert 'is-visible' in (target.get_attribute('class') or '')

            # Parallax variable changes after scroll on capable layouts.
            if width>=768:
                bg=page.locator('.resources-backdrop img')
                before=bg.evaluate("(e)=>e.style.getPropertyValue('--parallax-y')")
                page.evaluate("window.scrollBy(0,180)")
                page.wait_for_timeout(160)
                after=bg.evaluate("(e)=>e.style.getPropertyValue('--parallax-y')")
                assert before!=after,(width,height,before,after)

            # Button hover and modal X animation on desktop pointer layouts.
            if width>=1024:
                page.evaluate('scrollTo(0,0)'); page.wait_for_timeout(100)
                arrow=cta.locator('.arrow')
                before=arrow.evaluate('(e)=>getComputedStyle(e).transform')
                cta.hover(); page.wait_for_timeout(320)
                after=arrow.evaluate('(e)=>getComputedStyle(e).transform')
                assert before!=after,(width,height,before,after)
            cta.click(); assert page.locator('#contact-dialog').evaluate('(e)=>e.open')
            if width>=1024:
                close=page.locator('#contact-dialog .close-dialog')
                x_before=close.evaluate("(e)=>getComputedStyle(e,'::before').transform")
                close.hover(); page.wait_for_timeout(340)
                x_after=close.evaluate("(e)=>getComputedStyle(e,'::before').transform")
                assert x_before!=x_after,(width,height,x_before,x_after)
            page.keyboard.press('Escape'); page.wait_for_timeout(50)

            if width<=820:
                page.locator('.menu-toggle').click()
                assert page.locator('#menu-dialog').evaluate('(e)=>e.open')
                page.keyboard.press('Escape')

            page.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")
            page.wait_for_function("[...document.images].every(i=>i.complete)",timeout=30000)
            failures=page.evaluate("[...document.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src'))")
            assert not failures,(width,height,failures)

            if (width,height)==(390,844):
                page.evaluate("scrollTo({top:0,behavior:'instant'})"); page.wait_for_timeout(450)
                page.screenshot(path=str(out/'mobile-top.jpg'),type='jpeg',quality=90)
                page.screenshot(path=str(out/'mobile.jpg'),type='jpeg',quality=82,full_page=True)
            if (width,height)==(1440,768):
                page.evaluate("scrollTo({top:0,behavior:'instant'})"); page.wait_for_timeout(450)
                page.screenshot(path=str(out/'desktop-top.jpg'),type='jpeg',quality=90)
            if (width,height)==(1440,900):
                page.evaluate("scrollTo({top:0,behavior:'instant'})"); page.wait_for_timeout(450)
                page.screenshot(path=str(out/'desktop.jpg'),type='jpeg',quality=82,full_page=True)
                report['fonts']=page.evaluate("[...document.fonts].map(f=>({family:f.family,status:f.status}))")

            page.emulate_media(reduced_motion='reduce')
            page.locator('#play-video').click()
            assert 'youtube-nocookie.com/embed/euDugEHasYg' in page.locator('#video-stage iframe').get_attribute('src')
            report['viewports'].append({'width':width,'height':height,'cta_bottom':round(cta_box['y']+cta_box['height'],1)})
            page.close()
        browser.close()
    assert not report['errors'],report['errors']
    report['result']='passed'
    report['checks']=['10 viewports sem overflow','CTA visível na primeira dobra crítica','foto sorrindo restaurada no hero','sem máscaras orgânicas','imagens nativas de seção','scroll reveal','parallax','hover de CTA','X animado','menu mobile','imagens carregadas','YouTube sob clique']
finally:
    server.terminate()
    (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('UI_REPORT '+json.dumps(report,ensure_ascii=False))
