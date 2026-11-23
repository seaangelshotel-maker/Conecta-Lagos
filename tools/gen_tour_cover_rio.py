"""Capa original (ilustração) do bate e volta Rio x Arraial: ônibus de manhã cedo rumo ao mar."""
from PIL import Image, ImageDraw, ImageFilter
W, H = 1600, 900
def lerp(a, b, t): return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))
img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
hor = 520
for y in range(hor): d.line([(0, y), (W, y)], fill=lerp((255, 150, 90), (90, 150, 220), (1-y/hor)**1.1))
sun = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sun)
for r, a in [(240, 50), (160, 90), (100, 140)]: sd.ellipse([1150-r, 400-r, 1150+r, 400+r], fill=(255, 225, 150, a))
sd.ellipse([1100, 350, 1200, 450], fill=(255, 245, 205, 255))
b = sun.filter(ImageFilter.GaussianBlur(5)); img.paste(b, (0, 0), b); d = ImageDraw.Draw(img)
d.polygon([(0, hor), (0, 330), (140, 300), (230, 360), (360, 280), (520, 380), (640, hor)], fill=(66, 96, 110))
d.polygon([(760, hor), (880, 400), (960, 330), (1030, 420), (1120, hor)], fill=(86, 112, 124))
d.polygon([(1300, hor), (1420, 420), (1600, 380), (1600, hor)], fill=(70, 100, 112))
for y in range(hor, 640): d.line([(0, y), (W, y)], fill=lerp((60, 190, 205), (30, 140, 190), (y-hor)/120))
d.polygon([(0, 640), (W, 600), (W, H), (0, H)], fill=(58, 62, 74))
d.polygon([(0, 640), (W, 600), (W, 612), (0, 652)], fill=(235, 235, 235))
for x in range(40, W, 220): d.polygon([(x, 790), (x+110, 784), (x+110, 794), (x, 800)], fill=(250, 210, 60))
bx, by = 330, 730
d.ellipse([bx-20, by+70, bx+960, by+120], fill=(40, 44, 54))
d.rounded_rectangle([bx, by-250, bx+900, by+70], radius=34, fill=(250, 250, 248))
d.rectangle([bx, by-20, bx+900, by+10], fill=(14, 80, 140))
d.polygon([(bx, by+10), (bx+900, by+10), (bx+900, by+40), (bx, by+40)], fill=(255, 196, 40))
for i in range(9):
    x = bx+40+i*92
    d.rounded_rectangle([x, by-200, x+76, by-70], radius=10, fill=(70, 150, 200))
    d.ellipse([x+22, by-172, x+52, by-142], fill=(214, 160, 120))
d.rounded_rectangle([bx+830, by-210, bx+890, by-60], radius=10, fill=(40, 70, 100))
for wx in (bx+170, bx+700):
    d.ellipse([wx-50, by+20, wx+50, by+120], fill=(30, 30, 36)); d.ellipse([wx-24, by+46, wx+24, by+94], fill=(170, 175, 185))
d.ellipse([bx+884, by-20, bx+900, by-4], fill=(255, 240, 160))
for gx, gy in [(300, 200), (380, 170), (1000, 190)]:
    d.arc([gx, gy, gx+26, gy+16], 190, 350, fill=(60, 60, 70), width=3); d.arc([gx+22, gy, gx+48, gy+16], 190, 350, fill=(60, 60, 70), width=3)
img.save('public/passeios/bate-e-volta-rio-arraial.jpg', quality=90)
