"""Galeria original (ilustrações) do passeio de escuna em Arraial do Cabo."""
from PIL import Image, ImageDraw, ImageFilter
import random
W, H = 1600, 900
def lerp(a, b, t): return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))
def gradient(d, y0, y1, c0, c1, p=1.0):
    for y in range(y0, y1):
        d.line([(0, y), (W, y)], fill=lerp(c0, c1, ((y-y0)/max(1, y1-y0))**p))
def cloud(d, cx, cy, s=1.0):
    for ox, oy in [(-60, 0), (-20, -14), (25, -10), (60, 4), (0, 8)]:
        d.ellipse([cx+ox*s-48*s, cy+oy*s-20*s, cx+ox*s+48*s, cy+oy*s+20*s], fill=(255, 255, 255))
def waves(d, y0, y1, col=(235, 250, 255), step=110, gap=30):
    for row, y in enumerate(range(y0, y1, gap)):
        for x in range(-40 + (row % 2)*50, W, step):
            d.arc([x, y, x+70, y+14], 200, 340, fill=col, width=2)
def blur_paste(img, layer, r):
    b = layer.filter(ImageFilter.GaussianBlur(r)); img.paste(b, (0, 0), b)

# 1) Mergulho na Ilha do Farol
random.seed(3)
img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
hor = 420
gradient(d, 0, hor, (110, 190, 240), (210, 238, 250))
for c in [(260, 120, 1.1), (900, 80, 0.9), (1350, 170, 1.2)]: cloud(d, *c)
d.polygon([(560, hor), (640, 330), (760, 300), (880, 340), (1010, hor)], fill=(92, 130, 100))
d.polygon([(640, 332), (700, 318), (760, 300), (820, 322), (760, 345)], fill=(120, 160, 120))
d.rectangle([742, 190, 776, 305], fill=(250, 250, 250)); d.rectangle([742, 225, 776, 240], fill=(200, 50, 50)); d.rectangle([742, 262, 776, 277], fill=(200, 50, 50))
d.rectangle([736, 176, 782, 192], fill=(60, 70, 85)); d.polygon([(736, 176), (759, 152), (782, 176)], fill=(200, 50, 50))
gradient(d, hor, H, (70, 215, 215), (6, 70, 120), 0.8)
waves(d, hor+20, 560)
for i in range(18):  # peixes
    x, y = random.randint(80, 1500), random.randint(600, 860); c = random.choice([(255, 200, 60), (255, 150, 60), (230, 240, 255)])
    d.ellipse([x, y, x+34, y+14], fill=c); d.polygon([(x+34, y+7), (x+48, y-3), (x+48, y+17)], fill=c)
for x, y in [(420, 520), (560, 560), (1040, 500), (1180, 545)]:  # mergulhadores na superfície
    d.ellipse([x, y, x+34, y+30], fill=(60, 60, 70)); d.ellipse([x+4, y+8, x+30, y+26], fill=(190, 140, 110))
    d.line([(x+32, y+6), (x+52, y-20)], fill=(255, 180, 0), width=6)
    d.arc([x-30, y+26, x+70, y+52], 0, 180, fill=(255, 255, 255), width=3)
img.save('public/passeios/escuna-ilha-do-farol.jpg', quality=90)

# 2) Toboágua
random.seed(5)
img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
hor = 560
gradient(d, 0, hor, (70, 165, 235), (200, 232, 250))
for c in [(300, 150, 1.2), (1200, 110, 1.0)]: cloud(d, *c)
gradient(d, hor, H, (60, 205, 210), (10, 100, 160), 0.8)
waves(d, hor+20, H, step=130, gap=34)
d.polygon([(0, 700), (1000, 700), (940, 780), (60, 780)], fill=(250, 250, 248))
d.rectangle([0, 724, 980, 738], fill=(14, 80, 140))
d.rectangle([60, 470, 640, 700], fill=(236, 240, 244))
for i in range(5): d.rectangle([90+i*108, 520, 170+i*108, 600], fill=(60, 140, 190))
d.line([(540, 150), (900, 470), (1130, 650)], fill=(255, 196, 40), width=34)
d.line([(540, 122), (900, 442), (1130, 622)], fill=(230, 160, 20), width=6)
for t in (0.18, 0.5, 0.82):
    x = int(540 + (1130-540)*t); y = int(150 + (650-150)*t); d.line([(x, y), (x, min(y+300, 700))], fill=(210, 214, 220), width=8)
d.ellipse([640, 215, 690, 265], fill=(214, 160, 120)); d.rectangle([640, 262, 690, 320], fill=(230, 60, 70))
splash = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(splash)
for _ in range(70):
    x, y, r = random.randint(1080, 1340), random.randint(560, 720), random.randint(6, 26)
    sd.ellipse([x-r, y-r, x+r, y+r], fill=(255, 255, 255, 220))
img.paste(splash, (0, 0), splash)
d = ImageDraw.Draw(img)
for _ in range(5): d.ellipse([1180+random.randint(-60, 60), 640+random.randint(-10, 20), 1240+random.randint(-60, 60), 690], outline=(255, 255, 255), width=4)
img.save('public/passeios/escuna-toboagua.jpg', quality=90)

# 3) Prainhas do Pontal do Atalaia
random.seed(9)
img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
hor = 300
gradient(d, 0, hor, (255, 170, 110), (255, 226, 170), 0.9)
d.ellipse([1180, 190, 1300, 310], fill=(255, 245, 205))
d.polygon([(0, hor), (0, 240), (200, 210), (420, 260), (600, hor)], fill=(150, 120, 100))
d.polygon([(1100, hor), (1300, 250), (1600, 220), (1600, hor)], fill=(120, 100, 90))
gradient(d, hor, 720, (25, 150, 190), (90, 225, 220), 0.9)
waves(d, hor+20, 600, col=(220, 248, 250))
d.polygon([(0, 700), (300, 640), (700, 610), (1100, 620), (1600, 660), (1600, H), (0, H)], fill=(246, 226, 180))
d.polygon([(0, 700), (300, 640), (700, 610), (1100, 620), (1600, 660), (1600, 690), (1100, 650), (700, 640), (300, 670), (0, 730)], fill=(160, 230, 225))
for _ in range(12):
    x, y = random.randint(40, 1560), random.randint(720, 880); d.ellipse([x, y, x+random.randint(8, 18), y+6], fill=(214, 190, 140))
for bx, by, s in [(300, 470, 0.7), (1150, 440, 0.55)]:
    d.polygon([(bx, by), (bx+200*s, by), (bx+170*s, by+40*s), (bx+30*s, by+40*s)], fill=(250, 250, 248))
    d.rectangle([bx+40*s, by-60*s, bx+150*s, by], fill=(236, 240, 244)); d.rectangle([bx+30*s, by-68*s, bx+160*s, by-58*s], fill=(14, 80, 140))
for x in (450, 700, 980, 1330):
    d.line([(x, 760), (x, 820)], fill=(110, 90, 70), width=5)
    d.polygon([(x-60, 760), (x+60, 760), (x, 720)], fill=random.choice([(230, 70, 70), (255, 196, 40), (60, 150, 210)]))
img.save('public/passeios/escuna-prainhas.jpg', quality=90)
