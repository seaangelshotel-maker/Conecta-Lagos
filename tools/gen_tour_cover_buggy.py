"""Capas originais (ilustrações) do passeio de buggy, roteiro Arubinha / Ponta da Alcaíra."""
from PIL import Image, ImageDraw, ImageFilter
import random, math
W, H = 1600, 900
def lerp(a, b, t): return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))
def buggy(d, x, y, s=1.0):
    d.ellipse([x-10*s, y+60*s, x+330*s, y+95*s], fill=(160, 140, 105))
    d.rounded_rectangle([x+30*s, y+10*s, x+300*s, y+55*s], radius=int(16*s), fill=(250, 190, 40))
    d.line([(x+80*s, y+10*s), (x+110*s, y-70*s), (x+240*s, y-70*s), (x+265*s, y+10*s)], fill=(50, 54, 64), width=int(9*s))
    d.line([(x+110*s, y-70*s), (x+110*s, y+10*s)], fill=(50, 54, 64), width=int(7*s))
    d.rounded_rectangle([x+120*s, y-12*s, x+200*s, y+20*s], radius=int(10*s), fill=(50, 54, 64))
    d.ellipse([x+140*s, y-72*s, x+182*s, y-30*s], fill=(214, 160, 120)); d.rounded_rectangle([x+128*s, y-36*s, x+196*s, y+4*s], radius=int(10*s), fill=(220, 60, 50))
    for wx, r in ((x+15*s, 50*s), (x+255*s, 55*s)):
        d.ellipse([wx-6*s, y+95*s-2*r, wx+2*r-6*s, y+95*s], fill=(34, 34, 40)); d.ellipse([wx+r*0.45, y+95*s-1.55*r, wx+r*1.5, y+95*s-0.45*r], fill=(120, 124, 132))
# 1) capa: faixa de areia entre a lagoa e o mar
random.seed(8)
img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
hor = 380
for y in range(hor): d.line([(0, y), (W, y)], fill=lerp((200, 232, 250), (80, 160, 230), (1-y/hor)**1.2))
for cx, cy in [(300, 120), (900, 80), (1350, 170)]:
    for ox, oy in [(-60, 0), (-20, -14), (25, -10), (60, 4)]: d.ellipse([cx+ox-48, cy+oy-20, cx+ox+48, cy+oy+20], fill=(255, 255, 255))
for y in range(hor, 600): d.line([(0, y), (W, y)], fill=lerp((90, 220, 215), (40, 170, 200), (y-hor)/220))
d.polygon([(0, 560), (500, 520), (1100, 540), (1600, 500), (1600, 600), (0, 640)], fill=(60, 200, 205))
d.polygon([(0, 620), (600, 590), (1100, 610), (1600, 570), (1600, H), (0, H)], fill=(238, 214, 162))
d.polygon([(500, H), (700, 640), (900, 636), (1300, H)], fill=(222, 196, 142))
for x in range(0, W, 90): d.arc([x, 600, x+70, 612], 190, 350, fill=(230, 250, 250), width=2)
d.polygon([(0, 440), (300, 420), (600, 450), (900, 430), (1200, 445), (1600, 425), (1600, 460), (0, 470)], fill=(110, 150, 110))
buggy(d, 640, 700, 1.4)
img.save('public/passeios/buggy-arubinha.jpg', quality=90)
# 2) galeria: coração natural visto de cima
img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
for y in range(H): d.line([(0, y), (W, y)], fill=lerp((40, 170, 200), (20, 120, 170), y/H))
pts = []
for i in range(360):
    t = math.radians(i)
    x = 16*math.sin(t)**3; y = 13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t)
    pts.append((800+x*26, 430-y*26))
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
gd.polygon([(800+(px-800)*1.12, 430+(py-430)*1.12) for px, py in pts], fill=(120, 235, 225, 190))
g = glow.filter(ImageFilter.GaussianBlur(14)); img.paste(g, (0, 0), g); d = ImageDraw.Draw(img)
d.polygon(pts, fill=(246, 226, 178))
for _ in range(60):
    x, y = random.randint(500, 1100), random.randint(250, 640)
    if d.im.getpixel((x, y))[:3] == (246, 226, 178): d.ellipse([x, y, x+7, y+4], fill=(222, 196, 142))
buggy(d, 690, 380, 0.8)
for x in range(0, W, 120): d.arc([x, 40+(x//120 % 2)*90, x+80, 56+(x//120 % 2)*90], 190, 350, fill=(220, 250, 250), width=2)
img.save('public/passeios/buggy-coracao-novo-arraial.jpg', quality=90)
