"""Capas originais (ilustrações) do passeio de quadriciclo em Arraial do Cabo."""
from PIL import Image, ImageDraw, ImageFilter
import random
W, H = 1600, 900
def lerp(a, b, t): return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))
def sky(d, hor, c0, c1):
    for y in range(hor): d.line([(0, y), (W, y)], fill=lerp(c0, c1, (1-y/hor)**1.1))
def sun(img, x, y, r):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(L)
    for k, a in [(2.4, 40), (1.6, 80), (1.0, 255)]: sd.ellipse([x-r*k, y-r*k, x+r*k, y+r*k], fill=(255, 235, 170, a))
    b = L.filter(ImageFilter.GaussianBlur(6)); img.paste(b, (0, 0), b)
def quad(d, x, y, s=1.0):
    d.ellipse([x-20*s, y+60*s, x+330*s, y+95*s], fill=(150, 110, 70))
    d.rounded_rectangle([x+40*s, y-10*s, x+290*s, y+50*s], radius=int(20*s), fill=(220, 60, 50))
    d.rounded_rectangle([x+150*s, y-50*s, x+250*s, y-5*s], radius=int(14*s), fill=(40, 44, 54))
    d.line([(x+250*s, y-30*s), (x+300*s, y-60*s)], fill=(60, 60, 66), width=int(8*s))
    for wx in (x+20*s, x+270*s):
        d.ellipse([wx-6*s, y+20*s, wx+70*s, y+96*s], fill=(34, 34, 40)); d.ellipse([wx+16*s, y+40*s, wx+48*s, y+72*s], fill=(120, 124, 132))
    d.ellipse([x+185*s, y-110*s, x+225*s, y-70*s], fill=(214, 160, 120)); d.rounded_rectangle([x+170*s, y-76*s, x+240*s, y-30*s], radius=int(12*s), fill=(40, 90, 200))
    d.ellipse([x+176*s, y-124*s, x+232*s, y-84*s], fill=(250, 250, 250))
# 1) capa: dunas ao amanhecer
random.seed(2)
img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
sky(d, 500, (255, 160, 100), (100, 150, 225)); sun(img, 1100, 360, 60); d = ImageDraw.Draw(img)
d.polygon([(0, 500), (0, 430), (200, 400), (420, 440), (700, 410), (1000, 450), (1300, 405), (1600, 440), (1600, 500)], fill=(120, 130, 130))
for y in range(500, H): d.line([(0, y), (W, y)], fill=lerp((250, 220, 160), (222, 178, 120), (y-500)/400))
d.polygon([(0, 640), (350, 560), (800, 620), (1200, 540), (1600, 600), (1600, H), (0, H)], fill=(236, 200, 140))
d.polygon([(0, 760), (500, 700), (1000, 740), (1600, 690), (1600, H), (0, H)], fill=(226, 184, 124))
for _ in range(40):
    x, y = random.randint(0, W), random.randint(720, 880); d.arc([x, y, x+60, y+10], 190, 350, fill=(210, 165, 110), width=2)
quad(d, 560, 650, 1.35)
for gx, gy in [(260, 190), (330, 160), (900, 210)]:
    d.arc([gx, gy, gx+26, gy+16], 190, 350, fill=(60, 60, 70), width=3); d.arc([gx+22, gy, gx+48, gy+16], 190, 350, fill=(60, 60, 70), width=3)
img.save('public/passeios/quadriciclo-arraial-do-cabo.jpg', quality=90)
# 2) galeria: lagoa rosada no fim de tarde
random.seed(4)
img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
sky(d, 430, (250, 120, 110), (110, 120, 200)); sun(img, 400, 330, 55); d = ImageDraw.Draw(img)
d.polygon([(0, 430), (0, 390), (300, 370), (700, 400), (1100, 380), (1600, 405), (1600, 430)], fill=(110, 90, 120))
for y in range(430, 700): d.line([(0, y), (W, y)], fill=lerp((250, 150, 170), (215, 110, 150), (y-430)/270))
for i in range(25):
    y = 440+i*10; d.line([(400-130+i*3, y), (400+130-i*3, y)], fill=(255, 220, 190), width=2)
d.polygon([(0, 700), (500, 650), (1100, 690), (1600, 640), (1600, H), (0, H)], fill=(236, 205, 150))
for x in (1050, 1210, 1370):
    d.rectangle([x, 560, x+14, 700], fill=(70, 60, 55)); d.ellipse([x-50, 500, x+64, 580], fill=(70, 110, 80))
quad(d, 780, 700, 0.9)
img.save('public/passeios/quadriciclo-lagoa-rosada.jpg', quality=90)
