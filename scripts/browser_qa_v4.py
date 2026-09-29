"""Browser QA for Saúde Shalon LP v4. Never contacts a real WhatsApp number."""
import json, shutil, subprocess, time, re
from pathlib import Path
from playwright.sync_api import sync_playwright

out=Path('qa/v4'); out.mkdir(parents=True,exist_ok=True)
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
            page.evaluate('document.fonts.ready'); page.wait_for_timeout(500)
            dimensions=page.evaluate('({viewport:innerWidth,document:document.documentElement.scrollWidth})')
            assert dimensions['viewport']==dimensions['document'],dimensions
            hero=page.locator('.editorial-hero .hero-copy').bounding_box()
            doctor=page.locator('.doctor-cutout').bounding_box()
            assert hero and doctor and doctor['width']>180 and doctor['height']>180,(width,hero,doctor)
            assert page.locator('.hero-proof').count()==4
            assert page.locator('h1').count()==1
            assert page.locator('form,iframe').count()==0
            assert page.locator('main>section').nth(1).get_attribute('id')=='atendimento'
            assert not re.search(r'R\$',page.locator('main').inner_text())
            for selector in ['.hero-description','.signal p','.care-path article p:last-child','.faq-list details>div p']:
                size=page.locator(selector).first.evaluate('(e)=>parseFloat(getComputedStyle(e).fontSize)')
                assert size>=16,(width,selector,size)
            # CTA animation
            cta=page.locator('[data-placement="hero"]')
            arrow=cta.locator('.arrow')
            before=arrow.evaluate('(e)=>getComputedStyle(e).transform')
            cta.hover(); page.wait_for_timeout(360)
            after=arrow.evaluate('(e)=>getComputedStyle(e).transform')
            assert before!=after,(width,before,after)
            cta.click(); assert page.locator('#contact-dialog').evaluate('(e)=>e.open')
            close=page.locator('#contact-dialog .close-dialog')
            x_before=close.evaluate("(e)=>getComputedStyle(e,'::before').transform")
            close.hover(); page.wait_for_timeout(380)
            x_after=close.evaluate("(e)=>getComputedStyle(e,'::before').transform")
            assert x_before!=x_after,(width,x_before,x_after)
            page.keyboard.press('Escape'); page.wait_for_timeout(50)
            assert cta.evaluate('(e)=>document.activeElement===e')
            if width<=820:
                page.locator('.menu-toggle').click()
                assert page.locator('#menu-dialog').evaluate('(e)=>e.open')
                page.keyboard.press('Escape')
            for selector in ['.faq-list summary','.exam summary']:
                page.locator(selector).first.click()
                assert page.locator(selector).first.evaluate('(e)=>e.parentElement.open')
                page.locator(selector).first.click()
            page.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")
            page.wait_for_function("[...document.images].every(i=>i.complete)",timeout=30000)
            failures=page.evaluate("[...document.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src'))")
            assert not failures,failures
            for asset in ['dra-elizete-mentora.jpg','equipe-saude-shalon.jpg','registro-premiacao.jpg']:
                assert page.locator(f'img[src*="{asset}"]').count()==1,asset
            report['widths'].append({**dimensions,'doctor_width':round(doctor['width'],1),'doctor_height':round(doctor['height'],1)})
            if width in [390,1440]:
                page.evaluate("scrollTo({top:0,behavior:'instant'})"); page.wait_for_timeout(650)
                name='mobile' if width==390 else 'desktop'
                page.screenshot(path=str(out/f'{name}.jpg'),type='jpeg',quality=82,full_page=True)
                page.screenshot(path=str(out/f'{name}-top.jpg'),type='jpeg',quality=88)
                report['fonts']=page.evaluate("[...document.fonts].map(f=>({family:f.family,status:f.status}))")
            page.emulate_media(reduced_motion='reduce')
            assert page.evaluate("getComputedStyle(document.documentElement).scrollBehavior")=='auto'
            page.locator('#play-video').click()
            assert 'youtube-nocookie.com/embed/euDugEHasYg' in page.locator('#video-stage iframe').get_attribute('src')
            page.close()
        browser.close()
    assert not report['errors'],report['errors']
    report['result']='passed'
    report['checks']=['12 larguras sem overflow','hero com Dra. Elizete integrada','4 ícones de prova','texto principal >=16px','um H1','oferta em segunda seção','sem preços/formulário','animação de CTA','X animado','WhatsApp sem número abre aviso','Escape devolve foco','menu móvel','FAQ','recursos','novo acervo carregado','movimento reduzido','YouTube sob clique']
finally:
    server.terminate()
    (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('UI_REPORT '+json.dumps(report,ensure_ascii=False))
