"""Ajustes no projeto Android gerado pelo Capacitor: permissões, ícone de notificação e versão."""
import os, re, sys

root = os.path.join(os.path.dirname(__file__), '..', 'android', 'app')
mf = os.path.join(root, 'src', 'main', 'AndroidManifest.xml')
s = open(mf, encoding='utf-8').read()

# Só o necessário (cada permissão declarada precisa ser justificada na Play Store):
perms = [
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
    'android.permission.ACCESS_COARSE_LOCATION',   # "perto de mim" (Guia/Cupons)
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.POST_NOTIFICATIONS',       # avisos (Android 13+)
]
feats = ['android.hardware.location', 'android.hardware.location.gps', 'android.hardware.touchscreen']
add = ''
for p in perms:
    if p not in s: add += f'    <uses-permission android:name="{p}" />\n'
for f in feats:
    if f'"{f}"' not in s: add += f'    <uses-feature android:name="{f}" android:required="false" />\n'
s = s.replace('</manifest>', add + '</manifest>')

meta = ('        <meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@drawable/ic_stat_lagosgo" />\n'
        '        <meta-data android:name="com.google.firebase.messaging.default_notification_color" android:resource="@color/lagosgo_notification" />\n')
if 'default_notification_icon' not in s:
    s = s.replace('</application>', meta + '    </application>')
open(mf, 'w', encoding='utf-8').write(s)

res = os.path.join(root, 'src', 'main', 'res')
os.makedirs(os.path.join(res, 'drawable'), exist_ok=True)
os.makedirs(os.path.join(res, 'values'), exist_ok=True)
# Ícone pequeno da notificação: silhueta branca (pino de mapa) sobre fundo transparente.
open(os.path.join(res, 'drawable', 'ic_stat_lagosgo.xml'), 'w').write('''<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">
  <path android:fillColor="#FFFFFFFF" android:pathData="M12,2C8.13,2 5,5.13 5,9c0,5.25 7,13 7,13s7,-7.75 7,-13c0,-3.87 -3.13,-7 -7,-7zM12,11.5c-1.38,0 -2.5,-1.12 -2.5,-2.5s1.12,-2.5 2.5,-2.5 2.5,1.12 2.5,2.5 -1.12,2.5 -2.5,2.5z"/>
</vector>
''')
open(os.path.join(res, 'values', 'lagosgo_colors.xml'), 'w').write('<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="lagosgo_notification">#1D5FA8</color></resources>\n')

# Versão: versionCode cresce a cada build (Play exige)
code = os.environ.get('VERSION_CODE', '1')
g = os.path.join(root, 'build.gradle')
t = open(g).read()
t = re.sub(r'versionCode \d+', f'versionCode {code}', t)
t = re.sub(r'versionName "[^"]*"', 'versionName "1.0.' + code + '"', t)
open(g, 'w').write(t)
print('patch ok, versionCode', code)

