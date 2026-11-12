"""
Выравнивание текста озвучки по WAV без ASR (модели недоступны офлайн).

Метод: детектируем энергетические группы (речь/пауза по RMS), затем раскладываем
слова сценария по группам динамическим программированием: каждая фраза занимает
1..k подряд идущих групп, стоимость = |фактическая длительность - ожидаемая по
числу символов|. Внутри группы слова получают время пропорционально символам.
Результат: src3/data/words3.json  [{text, s, e, i(sentence)}] + meta.
"""
import wave, json, re, math
import numpy as np

WAV = 'public/audio3/voice3_original.wav'
OUT = 'src3/data/words3.json'

w = wave.open(WAV)
sr, n = w.getframerate(), w.getnframes()
a = np.frombuffer(w.readframes(n), dtype='<i2').astype(np.float32) / 32768
hop = int(sr * 0.01)
frames = a[: len(a) // hop * hop].reshape(-1, hop)
db = 20 * np.log10(np.sqrt((frames ** 2).mean(1)) + 1e-9)

THR = np.percentile(db, 45) - 18.0
GAP = 0.32
voiced = db > THR
segs, i = [], 0
while i < len(voiced):
    if voiced[i]:
        j = i
        while j < len(voiced) and voiced[j]:
            j += 1
        segs.append([i * 0.01, j * 0.01])
        i = j
    else:
        i += 1
segs = [s for s in segs if s[1] - s[0] > 0.05]
groups = []
for s in segs:
    if groups and s[0] - groups[-1][1] < GAP:
        groups[-1][1] = s[1]
    else:
        groups.append(list(s))

text = open('scripts/script3.txt').read().replace('\n\n', ' ')
sents = [x.strip() for x in re.split(r'(?<=[.!?])\s+', text.strip()) if x.strip()]
sents = [re.sub(r'^[-—\s]+', '', s) for s in sents]
sw = [[t for t in s.split() if t] for s in sents]
allwords = [t for s in sw for t in s]
total_chars = sum(len(t) for t in allwords)
speech = sum(g[1] - g[0] for g in groups)
per_char = speech / total_chars
INF = 1e18

# DP: f[i][j] — первые i фраз размещены на первых j группах
G = len(groups); S = len(sents)
f = [[INF] * (G + 1) for _ in range(S + 1)]
back = [[None] * (G + 1) for _ in range(S + 1)]
f[0][0] = 0.0
for i in range(1, S + 1):
    chars = sum(len(t) for t in sw[i - 1])
    expect = chars * per_char
    for j in range(0, G + 1):
        if f[i - 1][j] >= INF:
            continue
        for m in range(1, 5):
            if j + m > G:
                break
            dur = sum(groups[j + k][1] - groups[j + k][0] for k in range(m))
            cost = abs(dur - expect) + 0.25 * (m - 1)
            v = f[i - 1][j] + cost
            if v < f[i][j + m]:
                f[i][j + m] = v
                back[i][j + m] = (j, m)
if f[S][G] >= INF:
    raise SystemExit('alignment failed')
# восстановление
assign = [None] * S
j = G
for i in range(S, 0, -1):
    j0, m = back[i][j]
    assign[i - 1] = (j0, m)
    j = j0

out = []
for i, (j0, m) in enumerate(assign):
    words = sw[i]
    spans = groups[j0:j0 + m]
    tot_ch = sum(len(t) for t in words) or 1
    tot_d = sum(s[1] - s[0] for s in spans) or 0.1
    # слова распределяются по объединённому интервалу пропорционально символам
    t0, t1 = spans[0][0], spans[-1][1]
    cursor = t0
    for k, t in enumerate(words):
        share = len(t) / tot_ch * tot_d
        s0 = cursor
        s1 = cursor + share
        cursor = s1
        out.append({'text': t, 's': round(max(spans[0][0], s0), 3), 'e': round(min(t1, s1), 3), 'i': i})
for k in range(len(out)):
    out[k]['e'] = max(out[k]['e'], round(out[k]['s'] + 0.06, 3))
    if k + 1 < len(out):
        out[k]['e'] = min(out[k]['e'], out[k + 1]['s'] - 0.01)

chips = []
for i, (j0, m) in enumerate(assign):
    ws = [x for x in out if x['i'] == i]
    chips.append({'i': i, 'note': sents[i][:60], 'nwords': len(ws),
                  's': ws[0]['s'], 'e': ws[-1]['e'],
                  'groups': [round(groups[j0 + k][0], 2) for k in range(m)]})
json.dump({'words': out, 'sentences': sents, 'chips': chips,
           'meta': {'sr': sr, 'dur': n / sr, 'perChar': round(per_char, 4),
                    'threshold': round(float(THR), 2), 'groups': G, 'sentences': S}},
          open(OUT, 'w'), ensure_ascii=False, indent=0)
print('groups', G, 'sentences', S, 'words', len(out), 'speech', round(speech, 1))
for i, c in enumerate(chips):
    print(f"{c['s']:7.2f}-{c['e']:7.2f} n={c['nwords']:2d} g={len(c['groups'])} | {c['note']}")
