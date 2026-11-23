"""Capa original (ilustração) do snorkel no Santuário das Tartarugas."""
from PIL import Image, ImageDraw
import random
random.seed(11)
W, H = 1600, 900
def lerp(a, b, t): return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))
img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
for y in range(H): d.line([(0, y), (W, y)], fill=lerp((120, 225, 230), (8, 70, 120), (y/H)**0.85))
for i in range(9):  # raios de luz
    x = 150 + i*190
    d.polygon([(x, 0), (x+60, 0), (x+260, H*0.8), (x+120, H*0.8)], fill=lerp((120, 225, 230), (150, 240, 240), 0.5)) if False else None
d.rectangle([0, 0, W, 70], fill=(170, 240, 240))
for x in range(-40, W, 110): d.arc([x, 40, x+80, 100], 0, 180, fill=(235, 252, 255), width=3)
# fundo de areia e corais
d.polygon([(0, 790), (300, 760), (700, 800), (1100, 770), (1600, 800), (1600, H), (0, H)], fill=(214, 190, 140))
for x, c in [(120, (240, 110, 100)), (260, (250, 170, 60)), (1150, (220, 90, 140)), (1330, (240, 120, 90)), (1480, (250, 180, 70))]:
    for k in range(5): d.line([(x, 800), (x+random.randint(-60, 60), 800-random.randint(70, 170))], fill=c, width=14)
for x in (520, 640, 900): d.ellipse([x, 825, x+50, 855], fill=(150, 90, 110))
# tartaruga
tx, ty = 780, 470
d.ellipse([tx-170, ty-105, tx+170, ty+105], fill=(88, 130, 84))
for dx, dy in [(-90, -30), (0, -40), (90, -30), (-50, 35), (50, 35)]: d.polygon([(tx+dx-45, ty+dy), (tx+dx, ty+dy-34), (tx+dx+45, ty+dy), (tx+dx, ty+dy+34)], fill=(118, 160, 100))
d.ellipse([tx+150, ty-45, tx+250, ty+25], fill=(150, 175, 110)); d.ellipse([tx+215, ty-25, tx+232, ty-8], fill=(20, 30, 30))
d.polygon([(tx+60, ty-70), (tx+170, ty-170), (tx+210, ty-140), (tx+110, ty-60)], fill=(150, 175, 110))
d.polygon([(tx+40, ty+70), (tx+130, ty+170), (tx+170, ty+140), (tx+100, ty+50)], fill=(150, 175, 110))
d.polygon([(tx-60, ty-90), (tx-150, ty-170), (tx-190, ty-140), (tx-100, ty-60)], fill=(150, 175, 110))
d.polygon([(tx-170, ty+10), (tx-230, ty+30), (tx-170, ty+40)], fill=(150, 175, 110))
# snorkelista na superfície
sx, sy = 1180, 190
d.ellipse([sx, sy, sx+80, sy+60], fill=(60, 60, 70)); d.ellipse([sx+8, sy+15, sx+72, sy+55], fill=(200, 150, 120))
d.line([(sx+70, sy+10), (sx+100, sy-60)], fill=(255, 190, 0), width=10)
d.rounded_rectangle([sx-20, sy+55, sx+140, sy+90], radius=14, fill=(40, 90, 200))
d.polygon([(sx+140, sy+70), (sx+260, sy+50), (sx+250, sy+100)], fill=(255, 190, 0))
# peixes e bolhas
for _ in range(22):
    x, y = random.randint(60, 1500), random.randint(260, 740)
    c = random.choice([(255, 200, 60), (255, 150, 60), (235, 245, 255)]); s = random.randint(24, 42)
    d.ellipse([x, y, x+s, y+s//2], fill=c); d.polygon([(x+s, y+s//4), (x+s+14, y-4), (x+s+14, y+s//2+4)], fill=c)
for _ in range(25):
    x, y, r = random.randint(1150, 1300), random.randint(290, 560), random.randint(4, 12); d.ellipse([x-r, y-r, x+r, y+r], outline=(235, 252, 255), width=2)
img.save('public/passeios/snorkel-santuario-das-tartarugas.jpg', quality=90)
