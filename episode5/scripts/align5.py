"""Сопоставляет слова сценария (точный текст для субтитров) с таймкодами Whisper (src/data/asr5_raw.json).
Пишет src/data/words5_orig.json — слова сценария с таймкодами исходного WAV."""
import json, re, difflib, sys, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
asr = json.load(open(os.path.join(root, 'src/data/asr5_raw.json')))
aw = []
for s in asr:
    for w in s['words']:
        if w['w'].strip().startswith('-') and aw:
            aw[-1] = dict(aw[-1], w=aw[-1]['w'] + w['w'].strip(), e=w['e'])
        elif re.sub(r'[^а-яёa-z0-9]', '', w['w'].lower()):
            aw.append(w)
norm = lambda x: re.sub(r'[^а-яa-z0-9]', '', x.lower().replace('ё', 'е'))
script = open(os.path.join(root, 'scripts/ep5_script.txt')).read()
toks = [t for t in re.split(r'\s+', script) if t and t not in ('—', '-')]
A = [norm(t) for t in toks]; B = [norm(w['w']) for w in aw]
sm = difflib.SequenceMatcher(a=A, b=B, autojunk=False)
m = {}
for op, a0, a1, b0, b1 in sm.get_opcodes():
    if op in ('equal', 'replace') and (a1 - a0) == (b1 - b0):
        for k in range(a1 - a0): m[a0 + k] = b0 + k
    elif op != 'equal':
        print('MISMATCH', op, toks[a0:a1], [aw[j]['w'] for j in range(b0, b1)], file=sys.stderr)
out = []
for i, t in enumerate(toks):
    if i in m:
        w = aw[m[i]]; out.append({'text': t, 's': round(w['s'], 3), 'e': round(w['e'], 3), 'asr': w['w'].strip()})
    else:
        out.append({'text': t, 's': None, 'e': None, 'asr': None})
# интерполяция для несопоставленных
for i, o in enumerate(out):
    if o['s'] is None:
        p = next(out[j]['e'] for j in range(i - 1, -1, -1) if out[j]['e'] is not None)
        n = next(out[j]['s'] for j in range(i + 1, len(out)) if out[j]['s'] is not None)
        o['s'], o['e'] = p, n
json.dump(out, open(os.path.join(root, 'src/data/words5_orig.json'), 'w'), ensure_ascii=False, indent=0)
for i, o in enumerate(out):
    flag = '' if norm(o['text']) == norm(o['asr'] or '') else '  <-- asr: ' + str(o['asr'])
    print(f"{i:3d} {o['s']:7.2f} {o['e']:7.2f} {o['text']}{flag}")
