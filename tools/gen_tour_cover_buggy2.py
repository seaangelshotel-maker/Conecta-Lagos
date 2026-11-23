"""Capa original (ilustração) do passeio de buggy de 2 horas: paradas de praia e pôr do sol."""
from PIL import Image, ImageDraw, ImageFilter
import random
random.seed(21)
W, H = 1600, 900
def lerp(a, b, t): return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))
img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
hor = 470
for y in range(hor): d.line([(0, y), (W, y)], fill=lerp((255, 150, 80), (90, 120, 200), (1-y/hor)**1.0))
L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(L)
for k, a in [(2.6, 40), (1.7, 80)]: sd.ellipse([1150-60*k, 440-60*k, 1150+60*k, 440+60*k], fill=(255, 220, 150, a))
sd.ellipse([1090, 380, 1210, 500], fill=(255, 244, 205, 255))
b = L.filter(ImageFilter.GaussianBlur(5)); img.paste(b, (0, 0), b); d = ImageDraw.Draw(img)
for y in range(hor, 640): d.line([(0, y), (W, y)], fill=lerp((250, 150, 120), (40, 150, 190), (y-hor)/170))
for i in range(22):
    y = hor+8+i*7; w = 120-i*4
    if w > 4: d.line([(1150-w, y), (1150+w, y)], fill=(255, 225, 170), width=2)
d.polygon([(0, 470), (180, 440), (420, 470), (0, 480)], fill=(100, 80, 100))
d.polygon([(0, 600), (700, 570), (1300, 590), (1600, 560), (1600, H), (0, H)], fill=(238, 208, 156))
d.polygon([(0, 600), (700, 570), (1300, 590), (1600, 560), (1600, 580), (1300, 608), (700, 590), (0, 620)], fill=(110, 200, 200))
for x in range(0, W, 100): d.arc([x, 640+(x//100 % 2)*18, x+70, 652+(x//100 % 2)*18], 190, 350, fill=(250, 235, 220), width=2)
def buggy(x, y, s):
    d.ellipse([x-10*s, y+60*s, x+330*s, y+95*s], fill=(170, 140, 100))
    d.rounded_rectangle([x+30*s, y+10*s, x+300*s, y+55*s], radius=int(16*s), fill=(60, 160, 120))
    d.line([(x+80*s, y+10*s), (x+110*s, y-70*s), (x+240*s, y-70*s), (x+265*s, y+10*s)], fill=(50, 54, 64), width=int(9*s))
    for dx, c in ((140, (214, 160, 120)), (190, (190, 135, 100))):
        d.ellipse([x+dx*s, y-72*s, x+(dx+40)*s, y-32*s], fill=c); d.rounded_rectangle([x+(dx-10)*s, y-36*s, x+(dx+50)*s, y+4*s], radius=int(10*s), fill=(230, 80, 70) if dx == 140 else (40, 90, 200))
    for wx, r in ((x+15*s, 50*s), (x+255*s, 55*s)):
        d.ellipse([wx-6*s, y+95*s-2*r, wx+2*r-6*s, y+95*s], fill=(34, 34, 40)); d.ellipse([wx+r*0.45, y+95*s-1.55*r, wx+r*1.5, y+95*s-0.45*r], fill=(120, 124, 132))
buggy(430, 690, 1.3)
for gx, gy in [(260, 210), (330, 180), (900, 230)]:
    d.arc([gx, gy, gx+26, gy+16], 190, 350, fill=(60, 60, 70), width=3); d.arc([gx+22, gy, gx+48, gy+16], 190, 350, fill=(60, 60, 70), width=3)
img.save('public/passeios/buggy-2-horas-por-do-sol.jpg', quality=90)
