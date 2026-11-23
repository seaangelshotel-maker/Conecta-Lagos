"""Capa original (ilustração, não foto) do passeio de escuna em Arraial do Cabo."""
from PIL import Image, ImageDraw, ImageFilter
import math, random
W, H = 1600, 900
random.seed(7)
img = Image.new('RGB', (W, H))
d = ImageDraw.Draw(img)
def lerp(a, b, t): return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))
hor = 470
for y in range(hor):
    d.line([(0, y), (W, y)], fill=lerp((255, 196, 120), (70, 160, 225), (1 - y/hor)**0.8))
# sol
sun = Image.new('RGBA', (W, H), (0,0,0,0)); sd = ImageDraw.Draw(sun)
for r, a in [(260, 40), (180, 70), (110, 120)]:
    sd.ellipse([1180-r, 330-r, 1180+r, 330+r], fill=(255, 236, 170, a))
sd.ellipse([1130, 280, 1230, 380], fill=(255, 248, 210, 255))
img.paste(sun.filter(ImageFilter.GaussianBlur(6)), (0, 0), sun.filter(ImageFilter.GaussianBlur(6)))
d = ImageDraw.Draw(img)
# nuvens
for cx, cy in [(300, 130), (760, 90), (1350, 160)]:
    for k in range(6):
        ox, oy = random.randint(-90, 90), random.randint(-14, 14)
        d.ellipse([cx+ox-70, cy+oy-22, cx+ox+70, cy+oy+22], fill=(255, 255, 255))
# ilha e costa (silhuetas)
d.polygon([(0, hor), (0, 400), (120, 360), (260, 380), (420, 330), (560, 395), (700, hor)], fill=(86, 126, 98))
d.polygon([(900, hor), (1000, 420), (1090, 400), (1190, 445), (1260, hor)], fill=(110, 150, 118))
d.polygon([(1330, hor), (1420, 380), (1520, 350), (1600, 370), (1600, hor)], fill=(74, 112, 90))
# mar
for y in range(hor, H):
    t = (y-hor)/(H-hor)
    d.line([(0, y), (W, y)], fill=lerp((60, 205, 205), (8, 92, 150), t**0.7))
# ondas
for row in range(14):
    y = hor + 30 + row*30
    for x in range(-40 + (row % 2)*50, W, 110):
        d.arc([x, y, x+70, y+14], 200, 340, fill=(235, 250, 255), width=2)
# escuna
bx, by = 520, 690
sh = Image.new('RGBA', (W, H), (0,0,0,0)); shd = ImageDraw.Draw(sh)
shd.ellipse([bx-40, by+6, bx+700, by+60], fill=(0, 40, 80, 110))
img.paste(sh.filter(ImageFilter.GaussianBlur(10)), (0,0), sh.filter(ImageFilter.GaussianBlur(10)))
d = ImageDraw.Draw(img)
d.polygon([(bx, by-40), (bx+660, by-40), (bx+600, by+25), (bx+60, by+25)], fill=(250, 250, 248))
d.polygon([(bx+10, by-14), (bx+650, by-14), (bx+640, by+2), (bx+22, by+2)], fill=(14, 80, 140))
d.rectangle([bx+90, by-125, bx+560, by-40], fill=(236, 240, 244))
for i in range(8):
    x = bx+110 + i*56
    d.rectangle([x, by-108, x+38, by-70], fill=(60, 140, 190))
d.rectangle([bx+130, by-200, bx+470, by-125], fill=(248, 248, 246))
d.rectangle([bx+120, by-206, bx+480, by-196], fill=(14, 80, 140))
for i in range(6):
    x = bx+150 + i*52
    d.rectangle([x, by-185, x+34, by-146], fill=(70, 150, 200))
# toboágua
d.line([(bx+470, by-205), (bx+600, by-120), (bx+690, by-60)], fill=(255, 196, 40), width=16)
d.line([(bx+470, by-221), (bx+600, by-136), (bx+690, by-76)], fill=(230, 160, 20), width=4)
for px in (bx+480, bx+560):
    d.line([(px, by-205), (px, by-120)], fill=(210, 214, 220), width=5)
# bandeirola
d.line([(bx+300, by-206), (bx+300, by-270)], fill=(90, 90, 90), width=4)
d.polygon([(bx+302, by-270), (bx+360, by-254), (bx+302, by-238)], fill=(255, 196, 40))
# pessoas
for x in range(bx+150, bx+470, 30):
    d.ellipse([x, by-222, x+14, by-208], fill=(214, 160, 120))
for x in range(bx+120, bx+540, 36):
    d.ellipse([x, by-142, x+16, by-126], fill=(190, 135, 100))
# esteira
for k in range(5):
    d.arc([bx-30-k*70, by+10+k*4, bx+60-k*70, by+40+k*4], 180, 360, fill=(255, 255, 255), width=3)
# gaivotas
for gx, gy in [(260, 210), (330, 170), (1010, 140)]:
    d.arc([gx, gy, gx+26, gy+16], 190, 350, fill=(60, 60, 70), width=3)
    d.arc([gx+22, gy, gx+48, gy+16], 190, 350, fill=(60, 60, 70), width=3)
img.save('public/passeios/escuna-arraial-do-cabo.jpg', quality=90)
