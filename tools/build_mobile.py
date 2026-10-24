"""Build an independent, complete iPhone PWA folder; never edit desktop runtime files."""
from pathlib import Path
import hashlib,json,shutil
from PIL import Image,ImageDraw

root=Path(__file__).resolve().parent.parent
destination=root/'mobile'
template=root/'tools/mobile-template'
destination.mkdir(exist_ok=True)
for folder in ['scenes','audio','assets']:
    for source in (root/folder).rglob('*'):
        if source.is_file() and source.suffix in ['.js','.webp','.wav','.svg','.md']:
            target=destination/source.relative_to(root);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
for name in ['index.html','style.css','app.js']:
    shutil.copyfile(root/name,destination/name)
for name in ['mobile.css','mobile.js','server.cjs']:
    shutil.copyfile(template/name,destination/name)

p=destination/'index.html';html=p.read_text('utf-8')
html=html.replace('width=device-width,initial-scale=1','width=device-width,initial-scale=1,viewport-fit=cover')
html=html.replace('</head>','''<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="assets/icon-180.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="专注乐园"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><link rel="stylesheet" href="mobile.css"></head>''')
html=html.replace('</body>','<script src="mobile.js"></script></body>')
html=html.replace('accept="application/json"','accept=".json,application/json"')
html=html.replace('数据只保存在这台电脑的当前浏览器。','数据只保存在当前设备；可用备份在电脑与手机之间迁移。')
html=html.replace('</div><p class="fine">数据只保存在当前设备；可用备份在电脑与手机之间迁移。</p>', '''</div><p class="fine">数据只保存在当前设备；可用备份在电脑与手机之间迁移。</p><section class="install-card"><p id="offlineStatus" role="status">正在检查离线资源……</p><button id="retryOffline" type="button">重新准备离线资源</button><details id="installHelp"><summary>安装到 iPhone 桌面</summary><ol><li>在 Safari 打开此应用的 HTTPS 地址。</li><li>等上方显示「离线资源已就绪」。</li><li>点 Safari 分享，选择「添加到主屏幕」；若出现「作为 Web App 打开」，请开启。</li><li>从新图标打开，首次确认资源就绪后可断网使用。</li></ol><p>ZIP 仅用于传输和部署，不能从「文件」直接安装。锁屏期间可能没有完成提示音，请返回应用查看；重要记录请定期导出备份。</p></details></section>''')
p.write_text(html,'utf-8')
p=destination/'app.js';s=p.read_text('utf-8').replace('performance.now()','Date.now()')
s=s.replace("window.addEventListener('pagehide'", "document.addEventListener('visibilitychange',()=>{tick();persist();});\n  window.addEventListener('pagehide'")
s=s.replace('可以使用浏览器 F11 进入全屏','在 Safari 分享菜单中添加到主屏幕，可全屏使用')
p.write_text(s,'utf-8')

# Mobile-only scene framing; desktop sources above remain untouched.
p=destination/'scenes/crystal-guitar/renderer.js';s=p.read_text('utf-8')
s=s.replace("scale=Math.min(h*.70,w*.78,850)/1192;left=(w-1192*scale)/2+w*.065;top=h*.23;", "scale=Math.min(h*.70,w*.78,850)/1192;left=(w-1192*scale)/2+w*.065;top=h*.23;if(w<600){scale=Math.min(h*.62,w*.98)/1192;left=(w-1192*scale)/2;top=h*.32;}else if(h<550){scale=Math.min(h*.90,w*.52)/1192;left=w*.75-1192*scale/2;top=h*.12;}")
p.write_text(s,'utf-8')
p=destination/'scenes/book-pages/renderer.js';s=p.read_text('utf-8').replace("left=(w-scene.frameWidth*scale)/2;top=h*.70-210*scale;", "left=(w-scene.frameWidth*scale)/2;top=h*.70-210*scale;if(w<600){scale=Math.min(w*.96,h*.62)/scene.frameWidth;left=(w-scene.frameWidth*scale)/2;top=h*.66-210*scale;}else if(h<550){scale=Math.min(w*.45,h*1.05)/scene.frameWidth;left=w*.75-scene.frameWidth*scale/2;top=h*.5-170*scale;}")
p.write_text(s,'utf-8')
p=destination/'scenes/airplane-window/renderer.js';s=p.read_text('utf-8').replace("top=h*.30;H=Math.min(h*.57,h-115-top,w*.73);W=H*.73;", "top=h*.30;H=Math.min(h*.57,h-115-top,w*.73);if(w<600){top=h*.31;H=Math.min(h*.50,h-150-top,w*1.14);}else if(h<550){top=h*.12;H=h*.72;}W=H*.73;")
s=s.replace("left=(w-W)/2;inset=", "left=(h<550&&w>600?w*.75-W/2:(w-W)/2);inset=")
p.write_text(s,'utf-8')

# Coffee cup with three musical steam notes; opaque home-screen icons.
for size in [180,192,512]:
    high=1024;im=Image.new('RGB',(high,high),'#f5f0e8');draw=ImageDraw.Draw(im);ink='#80668f'
    draw.rounded_rectangle((250,460,695,760),radius=115,outline=ink,width=21)
    draw.rectangle((250,460,695,535),fill='#f5f0e8');draw.line((250,475,695,475),fill=ink,width=21)
    draw.arc((630,485,830,690),-90,90,fill=ink,width=21);draw.line((200,817,774,817),fill=ink,width=20)
    for x,y in [(330,325),(510,265),(680,350)]:
        draw.ellipse((x-32,y-13,x+10,y+17),fill=ink);draw.line((x+8,y,x+8,y-142),fill=ink,width=15);draw.line((x+8,y-142,x+66,y-162),fill=ink,width=15);draw.line((x+66,y-162,x+66,y-110),fill=ink,width=15)
    im.resize((size,size),Image.Resampling.LANCZOS).save(destination/f'assets/icon-{size}.png')
manifest={'id':'./','name':'专注乐园','short_name':'专注乐园','lang':'zh-CN','description':'八套互动风景，陪伴每一段专注时光。','start_url':'./','scope':'./','display':'standalone','background_color':'#f5f0e8','theme_color':'#7f9489','icons':[{'src':f'assets/icon-{size}.png','sizes':f'{size}x{size}','type':'image/png','purpose':'any'} for size in [192,512]]}
(destination/'manifest.webmanifest').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),'utf-8')
core=['index.html','app.js','style.css','mobile.css','mobile.js','manifest.webmanifest']
files=sorted(core+[str(p.relative_to(destination)).replace('\\','/') for folder in ['scenes','audio','assets'] for p in (destination/folder).rglob('*') if p.is_file() and p.suffix in ['.js','.svg','.webp','.wav','.png']])
digest=hashlib.sha256()
for file in files:digest.update(file.encode());digest.update((destination/file).read_bytes())
version=digest.hexdigest()[:16]
sw=(template/'sw-template.js').read_text('utf-8').replace('__CACHE_NAME__',json.dumps('focus-paradise-mobile-'+version)).replace('__FILES__',json.dumps(files,ensure_ascii=False))
(destination/'sw.js').write_text(sw,'utf-8')
(destination/'asset-list.json').write_text(json.dumps(files,ensure_ascii=False,indent=2),'utf-8')
info={'version':version,'runtime_files':len(files),'runtime_bytes':sum((destination/f).stat().st_size for f in files),'desktop_unchanged':True}
(destination/'build-info.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps(info,ensure_ascii=True))
