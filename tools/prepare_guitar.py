"""Pixel-preserving cutouts from the supplied guitar photo; original stays untouched."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import wave

root=Path(__file__).resolve().parent.parent
dest=root/'scenes/crystal-guitar'
dest.mkdir(exist_ok=True)
source=Image.open(root/'source-materials/guitar.jpg').convert('RGB')
source.save(dest/'reference.webp',quality=96)

# Masks follow the original object contours. No replacement guitar is generated.
outlines={
 'guitar':[(144,754),(179,700),(239,650),(331,620),(392,563),(399,517),(428,485),(405,467),(373,449),(369,422),(389,409),(424,425),(425,392),(439,370),(469,360),(497,367),(520,396),(496,384),(474,385),(459,405),(464,428),(490,421),(519,434),(537,461),(532,483),(579,502),(805,255),(815,197),(833,179),(847,176),(851,162),(874,155),(887,142),(909,144),(906,128),(925,125),(943,136),(944,113),(958,95),(974,97),(981,119),(977,135),(1001,119),(1025,117),(1046,132),(1058,158),(1060,183),(1031,199),(1013,206),(994,222),(987,258),(967,280),(934,291),(901,301),(587,645),(587,668),(617,687),(649,688),(688,672),(696,689),(682,716),(662,733),(638,739),(611,753),(604,777),(632,787),(653,805),(663,831),(662,858),(649,880),(621,893),(599,897),(577,944),(534,985),(509,1010),(477,1029),(435,1038),(393,1033),(348,1019),(302,996),(263,969),(224,931),(189,887),(163,844),(146,801)],
 'butterfly-left':[(339,532),(357,515),(379,512),(391,526),(410,541),(413,559),(402,573),(382,571),(367,581),(350,569),(356,550)],
 'butterfly-right':[(713,564),(734,568),(749,562),(767,567),(787,583),(794,602),(785,620),(788,645),(778,662),(774,686),(781,714),(795,736),(774,726),(751,699),(733,668),(725,638),(718,612)],
 'ring-back':[(125,567),(143,550),(166,550),(197,558),(244,576),(295,605),(349,641),(405,683),(469,738),(524,798),(572,858),(614,921),(638,974),(641,1018),(632,1053),(611,1086),(581,1100),(545,1102),(503,1089),(453,1062),(403,1027),(349,981),(294,926),(244,864),(198,798),(161,732),(136,670),(124,614)],
 'ring-front':[(286,462),(301,438),(354,418),(347,445),(324,469),(296,486),(270,476),(243,480),(217,495),(202,523),(196,562),(202,612),(216,675),(239,738),(270,805),(308,873),(352,939),(402,999),(450,1046),(499,1076),(543,1090),(575,1088),(602,1074),(618,1048),(627,1018),(627,987),(615,952),(595,938),(581,914),(595,896),(620,897),(634,914),(624,939),(637,975),(645,1012),(638,1049),(621,1080),(598,1098),(565,1108),(530,1104),(484,1084),(431,1046),(382,997),(337,942),(293,877),(253,806),(220,732),(195,659),(181,593),(181,542),(191,503),(210,481),(240,467)],
}

# Estimate only the low-frequency pink/white background from empty areas on both sides.
a=np.asarray(source).astype(float)
height,width=a.shape[:2]
bg=np.full_like(a,255)
yy,xx=np.mgrid[:height,:width]
glow=np.exp(-(((xx-615)/320)**2+((yy-605)/355)**2))
bg[:,:,1]-=49*glow;bg[:,:,2]-=3*glow
Image.fromarray(np.clip(bg,0,255).astype('uint8')).save(dest/'background.webp',quality=95)

def mask(points):
    im=Image.new('L',source.size);ImageDraw.Draw(im).polygon(points,fill=255)
    return np.asarray(im.filter(ImageFilter.GaussianBlur(.55))).astype(float)/255

body=mask(outlines['guitar'])
butterflies=[mask(outlines[n]) for n in ['butterfly-left','butterfly-right']]
for name,points in outlines.items():
    alpha=mask(points)
    if name=='ring-front':
        # Follow the narrow original silver ribbon instead of selecting its empty interior.
        ribbon=Image.new('L',source.size);d=ImageDraw.Draw(ribbon)
        pts=[]
        def curve(p0,p1,p2,p3):
            for t in np.linspace(0,1,120):
                pts.append(tuple((1-t)**3*np.array(p0)+3*(1-t)**2*t*np.array(p1)+3*(1-t)*t*t*np.array(p2)+t**3*np.array(p3)))
        curve((330,475),(165,420),(117,592),(310,894))
        curve((310,894),(475,1161),(701,1196),(609,929))
        d.line(pts,fill=255,width=13,joint='curve')
        d.polygon([(288,454),(302,437),(353,420),(344,449),(320,471),(300,483)],fill=255)
        d.polygon([(585,917),(597,897),(623,898),(633,915),(614,940)],fill=255)
        alpha=np.asarray(ribbon.filter(ImageFilter.GaussianBlur(.55))).astype(float)/255
    if name=='ring-back':
        ribbon=Image.new('L',source.size);d=ImageDraw.Draw(ribbon)
        d.line([(147,693),(126,616),(128,575),(145,553),(171,553),(229,574),(298,615)],fill=255,width=3)
        alpha=np.asarray(ribbon.filter(ImageFilter.GaussianBlur(.4))).astype(float)/255
    if name=='guitar':
        for b in butterflies:alpha*=1-b
    rgba=np.dstack([a,np.clip(alpha*255,0,255)]).astype('uint8')
    Image.fromarray(rgba).save(dest/(name+'.webp'),lossless=True)

# Seven locally synthesized plucked strings, physically modelled by a damped delay line.
rate=22050;rng=np.random.default_rng(712)
for name,freq in zip('CDEFGAB',[261.6256,293.6648,329.6276,349.2282,391.9954,440,493.8833]):
    n=int(rate/freq);buffer=rng.uniform(-1,1,n)
    signal=np.empty(round(rate*2.8))
    for i in range(len(signal)):
        j=i%n;v=buffer[j];buffer[j]=.496*(buffer[j]+buffer[(j+1)%n]);signal[i]=v
    t=np.arange(len(signal))/rate
    signal*=np.minimum(t/.005,1)*np.minimum((2.8-t)/.12,1)
    signal*=.36/max(abs(signal))
    with wave.open(str(root/'audio'/('guitar-'+name+'.wav')),'wb') as out:
        out.setnchannels(1);out.setsampwidth(2);out.setframerate(rate)
        out.writeframes((signal*32767).astype('<i2').tobytes())
print('Original guitar layers and seven plucked notes prepared.')
