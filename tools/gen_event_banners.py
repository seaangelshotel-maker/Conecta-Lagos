"""Gera os banners (arte original, sem foto de terceiros) dos eventos da varredura.
Uso: python3 tools/gen_event_banners.py  (lê /tmp/events.json gerado por tools/dump_extra_events.ts)"""
import json, math, random, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, S = 1200, 800, 2
FB = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'
FM = '/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf'
FL = '/usr/share/fonts/truetype/google-fonts/Poppins-Regular.ttf'
MES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
CITY = {'arraial-do-cabo':'ARRAIAL DO CABO','cabo-frio':'CABO FRIO','buzios':'BÚZIOS','saquarema':'SAQUAREMA'}

THEMES = {
 'reveillon': dict(top=(7,16,48), bot=(28,40,110), accent=(255,205,90), accent2=(255,120,160), sea=(10,22,62)),
 'reveillon_praia': dict(top=(10,20,60), bot=(120,50,110), accent=(255,190,80), accent2=(255,140,100), sea=(12,24,66)),
 'natal': dict(top=(10,52,40), bot=(150,28,40), accent=(255,225,140), accent2=(255,255,255), sea=(8,40,32)),
 'cultura': dict(top=(60,25,10), bot=(214,120,30), accent=(255,214,120), accent2=(120,200,150), sea=(40,16,8)),
 'esporte': dict(top=(0,70,100), bot=(0,170,190), accent=(255,255,255), accent2=(255,214,90), sea=(0,50,80)),
 'gospel': dict(top=(30,30,80), bot=(230,170,90), accent=(255,245,210), accent2=(255,255,255), sea=(24,24,64)),
}

# id-fragmento -> (tema, kicker, linhas do título, subtítulo, rodapé)
SPEC = [
 ('tuca-fernandes', 'reveillon_praia', 'RÉVEILLON 2027', ['TUCA','FERNANDES'], 'Show da virada', 'Praia Grande'),
 ('imaginasamba', 'reveillon_praia', 'RÉVEILLON 2027', ['IMAGINA','SAMBA'], 'Show da virada', 'Monte Alto'),
 ('arlindinho', 'reveillon_praia', 'RÉVEILLON 2027', ['ARLINDINHO'], 'Show da virada', 'Figueira'),
 ('felipe-araujo', 'reveillon_praia', 'RÉVEILLON 2027', ['FELIPE','ARAÚJO'], 'Primeiro show do ano', 'Praia Grande'),
 ('yan-no', 'reveillon_praia', 'RÉVEILLON 2027', ['YAN'], 'Encerramento da festa', 'Praia Grande'),
 ('noite-gospel', 'gospel', 'RÉVEILLON 2027', ['NOITE','GOSPEL'], 'Abertura da programação', 'Praia do Forte'),
 ('roupa-nova', 'reveillon', 'RÉVEILLON 2027', ['ROUPA','NOVA'], 'Show na Praia do Forte', 'Praia do Forte'),
 ('ze-neto', 'reveillon', 'RÉVEILLON 2027', ['ZÉ NETO','& CRISTIANO'], 'Show da virada com fogos', 'Praia do Forte'),
 ('pixote', 'reveillon_praia', 'RÉVEILLON 2027', ['PIXOTE'], 'Sunset', 'Praia do Forte'),
 ('jota-quest', 'reveillon', 'RÉVEILLON 2027', ['JOTA','QUEST'], 'Encerramento da programação', 'Praia do Forte'),
 ('consciencia-negra', 'cultura', 'CABO FRIO', ['SEMANA DA','CONSCIÊNCIA','NEGRA'], 'Programação cultural em vários locais', 'Tamoios · Costa Azul · Casa de Cultura'),
 ('parafina', 'esporte', 'BÚZIOS', ['PARAFINA'], 'Búzios', 'Confira a programação'),
 ('natal-de-luz-de-buzios', 'natal', 'BÚZIOS', ['NATAL','DE LUZ'], 'Todo o mês de dezembro', 'Búzios'),
 ('meia-maratona', 'esporte', 'BÚZIOS', ['MEIA','MARATONA'], 'Corrida de rua', 'Búzios'),
 ('cantata', 'natal', 'BÚZIOS', ['CANTATA','DE NATAL'], 'Música e tradição natalina', 'Búzios'),
 ('all-inclusive', 'reveillon', 'BÚZIOS', ['RÉVEILLON','ALL INCLUSIVE'], 'Bar dos Pescadores e Le Sancerre', 'Porto da Barra · 21h às 2h'),
 ('natal-de-luz-de-saquarema', 'natal', 'SAQUAREMA', ['NATAL','DE LUZ'], 'Programação de fim de ano', 'Saquarema'),
]

def lerp(a,b,t): return tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))
def font(p, s): return ImageFont.truetype(p, int(s*S))

def date_label(start, end):
    y,m,d = map(int, start.split('-'))
    if end and end != start:
        y2,m2,d2 = map(int, end.split('-'))
        return f'{d:02d}/{m:02d} a {d2:02d}/{m2:02d}'
    return f'{d:02d}/{m:02d}/{y}' if False else f'{d:02d} {MES[m-1].upper()}'

def background(th, seed):
    rnd = random.Random(seed)
    img = Image.new('RGB', (W*S, H*S))
    px = ImageDraw.Draw(img)
    for y in range(H*S):
        px.line([(0,y),(W*S,y)], fill=lerp(th['top'], th['bot'], (y/(H*S))**1.2))
    return img, rnd

def fireworks(img, th, rnd, n=7):
    glow = Image.new('RGBA', img.size, (0,0,0,0)); g = ImageDraw.Draw(glow)
    for _ in range(n):
        cx, cy = rnd.randint(640,1120)*S, rnd.randint(70,330)*S
        col = rnd.choice([th['accent'], th['accent2'], (255,255,255)])
        r = rnd.randint(55,120)*S; rays = rnd.randint(14,22)
        for k in range(rays):
            a = 2*math.pi*k/rays
            x1,y1 = cx+math.cos(a)*r*0.35, cy+math.sin(a)*r*0.35
            x2,y2 = cx+math.cos(a)*r, cy+math.sin(a)*r
            g.line([(x1,y1),(x2,y2)], fill=col+(170,), width=3*S)
            g.ellipse([x2-4*S,y2-4*S,x2+4*S,y2+4*S], fill=col+(230,))
    soft = glow.filter(ImageFilter.GaussianBlur(10*S))
    img.paste(soft, (0,0), soft); img.paste(glow, (0,0), glow)

def sea(img, th):
    d = ImageDraw.Draw(img, 'RGBA')
    base = int(H*0.80*S)
    d.rectangle([0, base, W*S, H*S], fill=th['sea']+(255,))
    for i,al in enumerate((70,50,35)):
        y0 = base + i*28*S
        pts = [(x, y0 + math.sin(x/(90*S)+i)*8*S) for x in range(0, W*S+20, 20)]
        d.line(pts, fill=th['accent']+(al,), width=3*S)
    # sol/lua
    d.ellipse([(W-260)*S, (H*0.80-70)*S, (W-190)*S, (H*0.80)*S], fill=th['accent']+(40,))

def lights(img, th, rnd):
    d = ImageDraw.Draw(img, 'RGBA')
    pts = [(x, 40*S + math.sin(x/(110*S))*26*S) for x in range(0, W*S+30, 30)]
    d.line(pts, fill=(255,255,255,90), width=2*S)
    cols = [(255,90,90),(255,225,140),(120,220,160),(255,255,255)]
    for i,(x,y) in enumerate(pts[::3]):
        c = cols[i%4]; d.ellipse([x-9*S,y-9*S+14*S,x+9*S,y+9*S+14*S], fill=c+(230,))
    glow = Image.new('RGBA', img.size, (0,0,0,0)); gd = ImageDraw.Draw(glow)
    for i,(x,y) in enumerate(pts[::3]):
        c = cols[i%4]; gd.ellipse([x-24*S,y-24*S+14*S,x+24*S,y+24*S+14*S], fill=c+(90,))
    glow = glow.filter(ImageFilter.GaussianBlur(14*S)); img.paste(glow,(0,0),glow)

def pattern(img, th):
    d = ImageDraw.Draw(img, 'RGBA')
    for r in range(80, 900, 90):
        d.ellipse([(W-120-r)*S,(H*0.78-r)*S,(W-120+r)*S,(H*0.78+r)*S], outline=th['accent']+(55,), width=4*S)
    for i in range(0, 14):
        x = (80+i*92)*S; d.polygon([(x,H*S),(x+46*S,(H-90)*S),(x+92*S,H*S)], fill=th['accent2']+(50,))

def stripes(img, th):
    d = ImageDraw.Draw(img, 'RGBA')
    for i in range(-6, 16):
        x = i*110*S; d.polygon([(x,H*S),(x+60*S,H*S),(x+360*S,0),(x+300*S,0)], fill=th['accent']+(28,))

def text_block(img, th, kicker, lines, sub, foot, date, city):
    d = ImageDraw.Draw(img, 'RGBA')
    # data em pílula (canto sup. esquerdo)
    f = font(FB, 30); tw = d.textlength(date, font=f)
    d.rounded_rectangle([60*S, 70*S, 60*S+tw+60*S, 70*S+64*S], radius=32*S, fill=th['accent']+(255,))
    d.text((90*S, 70*S+10*S), date, font=f, fill=th['top'])
    # kicker + cidade
    d.text((60*S, 168*S), f'{kicker}  ·  {city}' if kicker != city else city, font=font(FM, 26), fill=(255,255,255,230))
    # título
    size = 128 if max(len(l) for l in lines) <= 8 else 108 if max(len(l) for l in lines) <= 11 else 88
    if len(lines) == 3: size = min(size, 96)
    y = 215
    for l in lines:
        fs = font(FB, size)
        while d.textlength(l, font=fs) > (W-120)*S and size > 40:
            size -= 4; fs = font(FB, size)
        d.text((62*S, y*S+3*S), l, font=fs, fill=(0,0,0,110))
        d.text((60*S, y*S), l, font=fs, fill=(255,255,255,255))
        y += int(size*1.04)
    d.text((60*S, (y+24)*S), sub, font=font(FM, 32), fill=th['accent']+(255,))
    d.text((60*S, (H-78)*S), foot, font=font(FL, 28), fill=(255,255,255,235))
    # marca
    m = 'LAGOS GO'; fm = font(FB, 24); mw = d.textlength(m, font=fm)
    d.text(((W-60)*S-mw, (H-74)*S), m, font=fm, fill=(255,255,255,200))

def make(ev, spec):
    key, theme, kicker, lines, sub, foot = spec
    th = THEMES[theme]
    img, rnd = background(th, ev['id'])
    if theme.startswith('reveillon') or theme == 'gospel':
        fireworks(img, th, rnd, 8 if theme!='gospel' else 3); sea(img, th)
    elif theme == 'natal': lights(img, th, rnd); sea(img, th)
    elif theme == 'cultura': pattern(img, th)
    else: stripes(img, th); sea(img, th)
    text_block(img, th, kicker, lines, sub, foot, date_label(ev['start'], ev.get('end')), CITY[ev['city']])
    out = img.convert('RGB').resize((W,H), Image.LANCZOS)
    out.save(f"public/eventos/{ev['id']}.jpg", quality=86, optimize=True, progressive=True)

if __name__ == '__main__':
    evs = json.load(open('/tmp/events.json'))
    for ev in evs:
        sp = next((s for s in SPEC if s[0] in ev['id']), None)
        if not sp: print('SEM SPEC', ev['id']); sys.exit(1)
        make(ev, sp)
    print(len(evs), 'banners')
