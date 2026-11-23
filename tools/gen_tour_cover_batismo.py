"""Capa original (ilustração) do mergulho de batismo com cilindro."""
from PIL import Image, ImageDraw
import random
random.seed(21)
W, H = 1600, 900
def lerp(a, b, t): return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))
img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
for y in range(H): d.line([(0, y), (W, y)], fill=lerp((90, 205, 225), (6, 50, 105), (y/H)**0.8))
d.rectangle([0, 0, W, 60], fill=(160, 235, 240))
for x in range(-40, W, 110): d.arc([x, 30, x+80, 90], 0, 180, fill=(235, 252, 255), width=3)
d.polygon([(0, 800), (350, 770), (800, 810), (1200, 780), (1600, 810), (1600, H), (0, H)], fill=(205, 180, 130))
for x, c in [(110, (240, 110, 100)), (250, (250, 170, 60)), (1180, (220, 90, 140)), (1340, (240, 120, 90)), (1490, (250, 180, 70))]:
    for k in range(5): d.line([(x, 810), (x+random.randint(-60, 60), 810-random.randint(70, 180))], fill=c, width=14)
# mergulhador
mx, my = 760, 430
d.rounded_rectangle([mx-40, my-70, mx+30, my+80], radius=30, fill=(235, 190, 40))  # cilindro
d.rounded_rectangle([mx-10, my-60, mx+130, my+50], radius=40, fill=(30, 40, 60))   # tronco
d.ellipse([mx+120, my-80, mx+200, my], fill=(205, 155, 125)); d.ellipse([mx+150, my-62, mx+196, my-26], fill=(180, 235, 245), outline=(30, 40, 60), width=5)
d.line([(mx+135, my-5), (mx+110, my+70)], fill=(30, 40, 60), width=8)
d.polygon([(mx+110, my+20), (mx+220, my+60), (mx+200, my+95), (mx+100, my+50)], fill=(30, 40, 60))   # braço
d.polygon([(mx-10, my+40), (mx-150, my+110), (mx-200, my+80), (mx-170, my+130), (mx-10, my+75)], fill=(30, 40, 60))  # perna
d.polygon([(mx-190, my+85), (mx-300, my+60), (mx-285, my+140)], fill=(255, 150, 0))  # nadadeira
# instrutor ao lado
ix, iy = 1080, 330
d.rounded_rectangle([ix, iy, ix+130, iy+90], radius=40, fill=(40, 90, 200))
d.ellipse([ix+110, iy-20, ix+175, iy+45], fill=(205, 155, 125)); d.ellipse([ix+132, iy-4, ix+170, iy+24], fill=(180, 235, 245), outline=(40, 90, 200), width=4)
d.polygon([(ix, iy+60), (ix-110, iy+110), (ix-80, iy+140), (ix, iy+90)], fill=(40, 90, 200))
# peixes e bolhas
for _ in range(24):
    x, y = random.randint(60, 1500), random.randint(200, 740)
    c = random.choice([(255, 200, 60), (255, 150, 60), (235, 245, 255)]); s = random.randint(22, 40)
    d.ellipse([x, y, x+s, y+s//2], fill=c); d.polygon([(x+s, y+s//4), (x+s+14, y-4), (x+s+14, y+s//2+4)], fill=c)
for _ in range(40):
    x, y, r = random.randint(940, 1040), random.randint(80, 360), random.randint(4, 13); d.ellipse([x-r, y-r, x+r, y+r], outline=(235, 252, 255), width=2)
img.save('public/passeios/batismo-mergulho-cilindro.jpg', quality=90)
