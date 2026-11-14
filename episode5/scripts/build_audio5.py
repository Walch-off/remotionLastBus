"""Эпизод 5: монтаж озвучки, таймлайн событий, синтез музыки, эффектов и атмосферы.

Вход:  исходный WAV озвучки (не изменяется), src/data/words5_orig.json (scripts/align5.py).
Выход: public/audio5/{voice_final,sfx,ambience,music}.wav,
       src/data/words5.json — слова с таймкодами после монтажа,
       src/data/cues5.json  — события (сек) для анимации и звука.

Музыка и все эффекты синтезированы здесь программно (numpy/scipy) — без сторонних треков и библиотек звуков.
Запуск: python scripts/build_audio5.py <путь к исходному WAV>
"""
import json, os, re, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'public/audio5/voice_original.wav')
rng = np.random.default_rng(5)

sr0, v = wavfile.read(SRC)
assert sr0 == SR, sr0
v = v.astype(np.float32) / 32768.0
if v.ndim > 1:
    v = v.mean(axis=1)
words = json.load(open(os.path.join(ROOT, 'src/data/words5_orig.json')))
norm = lambda x: re.sub(r'[^а-яa-z0-9]', '', x.lower().replace('ё', 'е'))


def find(token, start=0):
    for i in range(start, len(words)):
        if norm(words[i]['text']) == norm(token):
            return i
    raise KeyError(token)


def quietest(a, b):
    i0, i1 = int(a * SR), int(b * SR)
    seg = v[i0:i1] ** 2
    win = int(0.04 * SR)
    if len(seg) <= win:
        return (a + b) / 2
    e = np.convolve(seg, np.ones(win) / win, mode='valid')
    return (i0 + int(np.argmin(e)) + win // 2) / SR


def gap_after(tok, start=0):
    i = find(tok, start)
    return quietest(words[i]['e'], words[i + 1]['s'])


# --- монтаж: короткие паузы в настоящей тишине — только на раскрытиях ---
PAUSES = sorted([
    (gap_after('шёл.'), 0.55),                       # фигура в зеркале → «Я резко обернулся»
    (gap_after('Ничего.'), 0.45),                     # ключ не открыл
    (gap_after('стеклу.'), 0.35),                     # ладонь стучит в зеркале
    (gap_after('было.', find('взглянул')), 0.65),     # автобуса уже не было
])
TAIL = 3.8  # финальный выбор остаётся на экране после последнего слова


def fmap(t):
    return t + sum(d for (p, d) in PAUSES if p <= t)


parts, prev = [], 0
for p, d in PAUSES:
    parts += [v[prev:int(p * SR)], np.zeros(int(d * SR), np.float32)]
    prev = int(p * SR)
parts.append(v[prev:])
voice = np.concatenate(parts)
last_e = fmap(words[-1]['e'])
N = int((last_e + TAIL) * SR)
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
DUR = N / SR
wout = [{'text': w['text'], 's': round(fmap(w['s']), 3), 'e': round(fmap(w['e']), 3)} for w in words]

CUES = [
    ('hook', 'Мокрая'), ('notSee', 'видел,'), ('belongs', 'принадлежит.'), ('vote', 'прошлой'), ('yank', 'вырвался'),
    ('pocket', 'сунул'), ('pocketWord', 'карман'), ('palmGone', 'исчезла.'), ('voice', 'голос'), ('whisper', 'прошептал:'),
    ('regret', '«Ты'), ('doorsHiss', 'Двери'), ('silent', 'замолчали.'), ('notMoving', 'Автобус'), ('window', 'За'),
    ('stop', 'остановка,'), ('lampOff', 'погасшим'), ('nobody', 'никого'), ('turnDrv', 'повернулся'), ('drvSits', 'Он'),
    ('myFace', 'лицом.'), ('ask1', '«Что'), ('whyKey', 'почему'), ('raiseHead', 'Водитель'), ('drvAns', '«Потому'),
    ('takePlace', 'занять'), ('stayHere', 'останешься'), ('ask2', '«Откуда'), ('pause', 'помолчал.'), ('once', '«Когда-то'),
    ('heard', 'услышал'), ('lookMirror', 'посмотрел'), ('noFace', 'Среди'), ('darkAisle', 'Только'), ('someone', 'Но'),
    ('walking', 'шёл.'), ('turnBack', 'резко'), ('empty', 'пуст.'), ('msgPhone', 'телефоне'), ('msgText', '«Твой'),
    ('reflection', 'отражение.'), ('warn', 'Оно'), ('lookWin', 'поднял'), ('dblStands', 'Под'), ('pointDoor', 'указал'),
    ('pointPocket', 'затем'), ('pocketW2', 'карман.'), ('askKey', '«Ключ'), ('askedDrv', 'спросил'), ('yes', '«Да.'),
    ('noOne', 'Не'), ('takeOut', 'достал'), ('figBehind', 'И'), ('behind', 'спиной.'), ('touch', 'Холодная'),
    ('rush', 'бросился'), ('keyhole', 'Рядом'), ('insert', 'Ключ'), ('turn1', 'повернул'), ('nothing', 'Ничего.'),
    ('creak', 'Позади'), ('sawMirror', 'увидел'), ('reach', 'тянет'), ('turn2', 'повернул'), ('doorsStart', 'Двери'),
    ('run', '«Бежим!»'), ('jump', 'вскочил'), ('stopped', 'остановились.'), ('gap', 'Щель'), ('grab2', 'Мокрая'),
    ('grip', 'сжал'), ('turnFull', 'упора.'), ('doorsOpen', 'распахнулись.'), ('exit', 'Мы'), ('lookBack', 'обернулся.'),
    ('palmMirror', 'В'), ('tap', 'стучала'), ('close', 'закрыл'), ('takeKey', 'забрал'), ('busJerk', 'Автобус'),
    ('drvStood', 'Водитель'), ('faceNot', 'Теперь'), ('lookBus', 'посмотрел'), ('thanks', '«Спасибо».'), ('lampOn', 'Фонарь'),
    ('road', 'когда'), ('busWord', 'автобуса'), ('thought', 'думал,'), ('vib', 'телефон'), ('msgFrom', 'Сообщение'),
    ('msgFinal', '«На'), ('q', 'Куда'), ('opt1', 'ночную'), ('opt2', 'пустой'), ('vote2', 'Выбирайте'), ('next', 'Следующая'),
]
cues, cidx, idx = {}, {}, 0
for name, tok in CUES:
    idx = find(tok, idx)
    cues[name] = wout[idx]['s']
    cidx[name] = idx
cues['lastWord'] = wout[-1]['e']
cues['end'] = round(DUR, 3)
C = cues
# ритмические события, общие для картинки и звука
C['steps'] = [round(C['someone'] + 0.35 + k * 0.62, 3) for k in range(5)]          # шаги фигуры в зеркале
C['runSteps'] = [round(C['rush'] + 0.12 + k * 0.26, 3) for k in range(4)]          # герой бежит к двери
C['taps'] = [round(C['tap'] - 0.15 + k * 0.72, 3) for k in range(3)]               # ладонь стучит в зеркале
C['lands'] = [round(C['exit'] + 0.25, 3), round(C['exit'] + 0.62, 3)]              # ноги на асфальте
cues['pauses'] = [[round(fmap(p) - d, 3), d] for p, d in PAUSES]
json.dump(wout, open(os.path.join(ROOT, 'src/data/words5.json'), 'w'), ensure_ascii=False, indent=0)
json.dump({'cues': cues, 'idx': cidx}, open(os.path.join(ROOT, 'src/data/cues5.json'), 'w'), ensure_ascii=False, indent=1)

# ============================ инструменты ============================
T = np.arange(N) / SR


def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'lowpass', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'highpass', fs=SR, output='sos'), x)


def noise(n):
    return rng.standard_normal(n)


def place(track, t, x, g=1.0):
    i = int(t * SR)
    if i < 0:
        x = x[-i:]; i = 0
    if i >= len(track):
        return
    x = x[: len(track) - i]
    track[i:i + len(x)] += g * x


def norm_peak(x, p=1.0):
    return x / (np.max(np.abs(x)) + 1e-9) * p


def thud(f=90, dur=0.35, click=0.3):
    n = int(dur * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * f * t * (1 - 0.3 * t / dur)) * env(n, 0.002, dur / 4)
    return norm_peak(body + bp(noise(n), 300, 2500) * env(n, 0.001, 0.015) * click)


def metal(freqs, dur=0.6, decay=0.15):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t / (decay * (1 + 0.3 * k))) for k, f in enumerate(freqs))
    return norm_peak(x * np.minimum(1, t / 0.001))


def click(f=2800, dur=0.05):
    n = int(dur * SR)
    return norm_peak(bp(noise(n), f * 0.6, min(f * 1.6, 18000)) * env(n, 0.0005, 0.006) + 0.5 * thud(400, dur, 0.0)[:n])


def jingle(n_hits=4, dur=0.5):
    x = np.zeros(int(dur * SR))
    for k in range(n_hits):
        place(x, rng.uniform(0, dur * 0.6), metal([rng.uniform(2800, 4200), rng.uniform(5200, 6800)], 0.25, 0.035), rng.uniform(0.4, 1))
    return norm_peak(x)


def rustle(dur=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    am = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * t + rng.uniform(0, 3)))
    return norm_peak(bp(noise(n), 1200, 6000) * am * np.sin(np.pi * t / dur) ** 0.8)


def whoosh(dur=0.4, lo=300, hi=2500):
    n = int(dur * SR)
    return norm_peak(bp(noise(n), lo, hi) * np.hanning(n))


def drips(n_drops=6, dur=1.6):
    n = int(dur * SR); x = np.zeros(n)
    for _ in range(n_drops):
        m = int(0.08 * SR); tt = np.arange(m) / SR; f = rng.uniform(900, 1600)
        d = np.sin(2 * np.pi * (f + 2500 * tt) * tt) * np.exp(-tt / 0.018)
        place(x, rng.uniform(0, dur - 0.15), d, rng.uniform(0.5, 1))
    return norm_peak(x)


def squelch(dur=0.5):
    """мокрая ладонь: влажное «чавк» + капли"""
    n = int(dur * SR); t = np.arange(n) / SR
    f = 160 + 500 * np.exp(-t / 0.05)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.003, 0.07)
    x += bp(noise(n), 500, 2500) * env(n, 0.002, 0.05) * 0.6
    x[: len(drips(3, dur))] += drips(3, dur)[:n] * 0.35
    return norm_peak(x)


def hiss(dur=1.6, decay=0.55):
    n = int(dur * SR); t = np.arange(n) / SR
    x = hp(noise(n), 2200) * np.minimum(1, t / 0.03) * np.exp(-t / decay)
    x[: int(0.25 * SR)] += thud(70, 0.25, 0.6)[: int(0.25 * SR)] * 0.6
    return norm_peak(x)


def motor(dur=1.5, f0=95, strain=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (1 + 0.15 * np.sin(2 * np.pi * 3 * t) * strain + 0.3 * strain * t / dur)
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) ** 0.5
    return norm_peak(lp(x, 900))


def creak(dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 180 + 60 * np.sin(2 * np.pi * 1.3 * t)
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * t))
    return norm_peak(bp(x, 300, 1800) * np.sin(np.pi * t / dur) * 0.5 + np.sin(2 * np.pi * 45 * t) * np.sin(np.pi * t / dur))


def step(wet=0.5, f=110):
    x = thud(f, 0.22, 0.9)
    s = bp(noise(len(x)), 1500, 7000) * env(len(x), 0.002, 0.04) * wet
    return norm_peak(x + s)


def glass_tap():
    return norm_peak(thud(220, 0.25, 1.0) * 0.6 + metal([1900, 3100, 4700], 0.25, 0.04) * 0.5)


def buzz(dur=0.9, pulses=2):
    n = int(dur * SR); t = np.arange(n) / SR
    gate = np.zeros(n)
    for k in range(pulses):
        a = k * dur / pulses
        gate += ((t >= a) & (t < a + dur / pulses * 0.65)) * 1.0
    x = (np.sign(np.sin(2 * np.pi * 165 * t)) * 0.4 + np.sin(2 * np.pi * 165 * t)) * lp(gate, 40)
    return norm_peak(lp(x, 900))


def chime(freqs=(1318, 1760), dur=0.6):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for k, f in enumerate(freqs):
        s = int(k * 0.12 * SR); tt = t[: n - s]
        x[s:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.2) * np.minimum(1, tt / 0.004)
    return norm_peak(x)


def boom(dur=2.5, f=42):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.9) + lp(noise(n), 200) * np.exp(-t / 0.3) * 0.5
    return norm_peak(x * np.minimum(1, t / 0.01))


def breath(dur=1.4):
    n = int(dur * SR); t = np.arange(n) / SR
    return norm_peak(bp(noise(n), 400, 2600) * np.sin(np.pi * t / dur) ** 2)


def lamp_on(dur=0.9):
    n = int(dur * SR); t = np.arange(n) / SR
    flick = (np.sin(2 * np.pi * 100 * t) + 0.5 * np.sin(2 * np.pi * 200 * t)) * (rng.random(n) > 0.35)
    x = lp(flick, 1500) * 0.5 * np.minimum(1, t / 0.05)
    place(x, 0.05, click(1800, 0.05), 0.8)
    return norm_peak(x)


# ============================ эффекты ============================
sfx = np.zeros(N)
# крючок: ладонь хватает — тихо, чтобы не заглушить первые слова
place(sfx, 0.0, squelch(0.6), 0.32)
place(sfx, 0.02, boom(1.8, 48), 0.22)
place(sfx, C['yank'] + 0.02, whoosh(0.35, 400, 3000), 0.4)
place(sfx, C['yank'] + 0.12, squelch(0.4), 0.22)
place(sfx, C['pocket'] + 0.2, rustle(0.7), 0.28)
place(sfx, C['pocket'] + 0.75, jingle(3, 0.4), 0.14)
place(sfx, C['palmGone'] - 0.1, drips(6, 1.4), 0.18)
place(sfx, C['voice'] - 0.2, breath(1.6), 0.12)
place(sfx, C['doorsHiss'] + 0.15, hiss(1.2, 0.35), 0.35)
place(sfx, C['silent'] + 0.2, thud(70, 0.3, 0.5), 0.25)
place(sfx, C['raiseHead'] + 0.2, creak(0.8), 0.12)
for t in C['steps']:
    place(sfx, t, step(0.8, 95), 0.22)
place(sfx, C['turnBack'] - 0.05, whoosh(0.3, 300, 2000), 0.35)
place(sfx, C['msgPhone'] + 0.1, buzz(0.6, 2), 0.2)
place(sfx, C['msgText'] - 0.3, chime(), 0.26)
place(sfx, C['takeOut'] + 0.2, rustle(0.5), 0.25)
place(sfx, C['takeOut'] + 0.65, jingle(4, 0.45), 0.2)
place(sfx, C['figBehind'] + 0.6, boom(2.6, 38), 0.45)
place(sfx, C['touch'] + 0.1, squelch(0.5), 0.3)
place(sfx, C['touch'] + 0.15, drips(4, 1.0), 0.15)
for t in C['runSteps']:
    place(sfx, t, step(0.4, 120), 0.3)
place(sfx, C['insert'] + 0.25, metal([3300, 5100], 0.15, 0.02), 0.25)
place(sfx, C['insert'] + 0.55, click(2600), 0.35)
place(sfx, C['turn1'] + 0.25, click(1800), 0.35)
place(sfx, C['nothing'] - 0.05, thud(160, 0.2, 0.8), 0.25)
place(sfx, C['creak'] + 0.1, creak(1.4), 0.4)
place(sfx, C['turn2'] + 0.3, click(1600), 0.4)
place(sfx, C['doorsStart'] - 0.1, hiss(1.8, 0.8), 0.4)
place(sfx, C['doorsStart'], motor(2.2, 90, 0.2), 0.16)
place(sfx, C['jump'] + 0.1, creak(0.6), 0.2)
place(sfx, C['jump'] + 0.3, step(0.2, 100), 0.22)
place(sfx, C['stopped'] - 0.15, thud(80, 0.4, 1.0), 0.45)
place(sfx, C['stopped'] - 0.1, motor(2.0, 80, 1.0), 0.18)
place(sfx, C['grab2'] + 0.05, squelch(0.6), 0.35)
place(sfx, C['grip'] + 0.6, click(1500), 0.45)
place(sfx, C['turnFull'] - 0.2, metal([900, 1350], 0.3, 0.05), 0.2)
place(sfx, C['doorsOpen'] - 0.05, hiss(1.6, 0.6), 0.55)
place(sfx, C['doorsOpen'] + 0.1, thud(65, 0.5, 0.6), 0.45)
for k, t in enumerate(C['lands']):
    place(sfx, t, step(1.0, 100 + 20 * k), 0.4)
    place(sfx, t + 0.02, drips(4, 0.5), 0.2)
place(sfx, C['lookBack'] - 0.05, whoosh(0.3, 300, 2000), 0.2)
for t in C['taps']:
    place(sfx, t, glass_tap(), 0.35)
place(sfx, C['close'] + 0.15, click(2600), 0.3)
place(sfx, C['close'] + 0.5, hiss(1.0, 0.3), 0.35)
place(sfx, C['close'] + 1.05, thud(75, 0.4, 0.8), 0.45)
place(sfx, C['takeKey'] + 0.1, jingle(3, 0.4), 0.22)
place(sfx, C['busJerk'] + 0.05, motor(0.9, 60, 0.6), 0.35)
place(sfx, C['busJerk'] + 0.1, creak(1.1), 0.25)
place(sfx, C['lampOn'] + 0.05, lamp_on(0.9), 0.3)
place(sfx, C['vib'] + 0.25, buzz(1.0, 3), 0.25)
place(sfx, C['msgFinal'] - 0.4, chime(), 0.26)
place(sfx, C['q'] - 0.2, boom(3.0, 45), 0.28)

# ============================ атмосфера ============================
# внутри: дождь по крыше (глухой), гул ламп; снаружи: открытый дождь
rain_raw = hp(lp(noise(N), 7000), 400)
drops_layer = np.zeros(N)
for _ in range(int(DUR * 8)):
    m = int(0.02 * SR)
    place(drops_layer, rng.uniform(0, DUR - 0.05), hp(noise(m), 3000) * np.exp(-np.arange(m) / (0.003 * SR)), rng.uniform(0.1, 0.5))
outside = np.clip((T - C['exit']) / 0.4, 0, 1)
rain_in = lp(rain_raw, 1200) * 0.6 + lp(drops_layer, 2500) * 0.4
rain_out = rain_raw * 0.35 + drops_layer * 0.6
hum = (np.sin(2 * np.pi * 100 * T) * 0.3 + np.sin(2 * np.pi * 200 * T) * 0.1) * (1 - outside)
amb = rain_in * (1 - outside) * 0.8 + rain_out * outside + hum * 0.25
amb *= np.clip(T / 0.3, 0, 1) * np.clip((DUR - T) / 1.5, 0, 1)

# ============================ музыка ============================
# Ре минор. Аккорды по 4 с, плавные переходы; уровни слоёв меняются по сценам.
NOTE = {'D2': 73.42, 'A2': 110.0, 'Bb2': 116.54, 'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.0,
        'G3': 196.0, 'A3': 220.0, 'Bb3': 233.08, 'C#4': 277.18, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.0, 'A4': 440.0}
CH = {'Dm': ['D3', 'F3', 'A3'], 'Bb': ['Bb2', 'D3', 'F3'], 'Gm': ['G3', 'Bb3', 'D4'], 'A': ['A2', 'C#4', 'E4'],
      'F': ['F3', 'A3', 'C4'], 'C': ['C3', 'E3', 'G3'], 'D': ['D3', 'F#3', 'A3'], 'Asus': ['A2', 'D4', 'E4'], 'Gm6': ['G3', 'Bb3', 'E4']}


def prog(t):
    if t < C['exit']:
        return ['Dm', 'Bb', 'Gm', 'A'][int(t // 4) % 4]
    if t < C['lampOn']:
        return ['Dm', 'Gm6', 'Dm', 'A'][int(t // 4) % 4]
    if t < C['q']:
        return ['F', 'C', 'Dm', 'D'][int(t // 4) % 4]
    return ['Bb', 'Asus'][int(t // 4) % 2]


def osc_pad(f, n):
    t = np.arange(n) / SR
    x = sum(signal.sawtooth(2 * np.pi * f * (1 + d) * t + rng.uniform(0, 6)) for d in (-0.004, 0.0, 0.0045)) / 3
    return x * 0.7 + 0.5 * np.sin(2 * np.pi * f / 2 * t)


pad = np.zeros(N)
seg = 4.0
for k in range(int(DUR // seg) + 1):
    s = k * seg
    names = CH[prog(s + 0.01)]
    n = int((seg + 2.0) * SR)
    e = np.minimum(1, np.arange(n) / (1.4 * SR)) * np.clip((seg + 2.0 - np.arange(n) / SR) / 2.0, 0, 1)
    chord = sum(osc_pad(NOTE[nm], n) for nm in names) * e
    place(pad, s, lp(chord, 1100), 1.0)

arp = np.zeros(N)
pattern = [0, 2, 1, 2, 0, 1, 2, 1]
t = 0.0
k = 0
while t < DUR - 1:
    names = CH[prog(t)]
    f = NOTE[names[pattern[k % 8]]] * (4 if NOTE[names[pattern[k % 8]]] < 200 else 2)
    n = int(1.6 * SR); tt = np.arange(n) / SR
    note = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt) + 0.08 * np.sin(2 * np.pi * 5.4 * f * tt) * np.exp(-tt / 0.1)) * np.exp(-tt / 0.7) * np.minimum(1, tt / 0.004)
    if (k % 8) not in (3, 7) or k % 16 < 8:
        place(arp, t, note, 0.6 + 0.4 * ((k % 4) == 0))
    t += 0.75
    k += 1

beat = 60 / 68
pulse = np.zeros(N)
t = 0.0
while t < DUR:
    place(pulse, t, thud(52, 0.3, 0.05), 1.0)
    place(pulse, t + 0.2, thud(48, 0.25, 0.05), 0.6)
    t += beat
pulse_fast = np.zeros(N)
t = C['figBehind']
while t < C['doorsOpen']:
    place(pulse_fast, t, thud(55, 0.22, 0.05), 1.0)
    t += 60 / 96

trem_src = sum(signal.sawtooth(2 * np.pi * f * T) for f in (440.0, 466.16, 587.33)) / 3
trem = bp(trem_src, 400, 2400) * (0.55 + 0.45 * np.sin(2 * np.pi * 7 * T))
drone = np.sin(2 * np.pi * 73.42 * T) * 0.6 + lp(noise(N), 140) * 1.5


def lev(keys):
    ts, vs = zip(*keys)
    return np.interp(T, ts, vs)


c = C
L_pad = lev([(0, 0.35), (c['doorsHiss'], 0.55), (c['someone'], 0.4), (c['walking'], 0.0), (c['empty'] + 0.4, 0.0), (c['msgText'], 0.45),
             (c['figBehind'], 0.3), (c['nothing'], 0.1), (c['creak'], 0.35), (c['doorsOpen'], 0.6), (c['exit'] + 0.2, 0.15), (c['lookBack'], 0.25),
             (c['lampOn'], 0.6), (c['road'], 0.5), (c['busWord'] + 0.3, 0.0), (c['thought'] + 0.5, 0.0), (c['vib'], 0.25), (c['q'], 0.55),
             (DUR - 1.5, 0.45), (DUR, 0.0)])
L_arp = lev([(0, 0.0), (c['doorsHiss'], 0.0), (c['turnDrv'], 0.35), (c['lookMirror'], 0.3), (c['someone'], 0.0), (c['msgText'] + 1, 0.0),
             (c['dblStands'], 0.35), (c['figBehind'], 0.0), (c['lampOn'], 0.0), (c['lampOn'] + 1.5, 0.45), (c['busWord'], 0.0), (c['q'], 0.0),
             (c['q'] + 1.0, 0.5), (DUR - 1.5, 0.4), (DUR, 0.0)])
L_pulse = lev([(0, 0.6), (c['doorsHiss'], 0.3), (c['turnDrv'], 0.0), (c['lookMirror'], 0.0), (c['someone'], 0.45), (c['walking'], 0.0),
               (c['figBehind'], 0.0), (DUR, 0.0)])
L_fast = lev([(0, 0.0), (c['figBehind'], 0.0), (c['figBehind'] + 0.6, 0.55), (c['nothing'], 0.2), (c['creak'], 0.6), (c['stopped'], 0.8),
              (c['doorsOpen'], 0.9), (c['doorsOpen'] + 0.3, 0.0), (DUR, 0.0)])
L_trem = lev([(0, 0.25), (c['voice'], 0.35), (c['doorsHiss'], 0.0), (c['lookMirror'], 0.1), (c['someone'], 0.45), (c['walking'], 0.0),
              (c['figBehind'], 0.4), (c['sawMirror'], 0.6), (c['doorsOpen'], 0.75), (c['exit'], 0.0), (c['tap'], 0.25), (c['close'] + 1, 0.0), (DUR, 0.0)])
L_drone = lev([(0, 0.6), (c['lampOn'], 0.5), (c['lampOn'] + 2, 0.15), (c['busWord'], 0.35), (c['thought'], 0.2), (DUR, 0.0)])

def unit(x):
    return x / (np.sqrt(np.mean(x ** 2)) + 1e-9)

music = (unit(pad) * L_pad * 1.0 + unit(arp) * L_arp * 0.55 + unit(pulse) * L_pulse * 0.8 + unit(pulse_fast) * L_fast * 0.8
         + unit(trem) * L_trem * 0.35 + unit(drone) * L_drone * 0.45)
music = lp(music, 5000)

# ============================ сведение ============================
venv = np.abs(voice)
venv = lp(np.convolve(venv, np.ones(int(0.05 * SR)) / int(0.05 * SR), mode='same'), 4)
speech = np.clip(venv / 0.03, 0, 1)
duck = 1 - 0.5 * speech


def peak_db(x, db):
    return norm_peak(x, 10 ** (db / 20))

stems = {
    'voice_final': voice,
    'sfx': peak_db(sfx, -7) * (0.7 + 0.3 * duck),
    'ambience': peak_db(amb, -23) * (0.6 + 0.4 * duck),
    'music': peak_db(music, -7.5) * duck,
}
MASTER = 10 ** (3.0 / 20)  # общий уровень: громче для телефона, но без клиппинга (проверяется ниже)
stems = {k: x * MASTER for k, x in stems.items()}
for k, x in stems.items():
    assert np.max(np.abs(x)) < 0.99, (k, np.max(np.abs(x)))
mix = sum(stems.values())
os.makedirs(os.path.join(ROOT, 'public/audio5'), exist_ok=True)
for k2, x in stems.items():
    wavfile.write(os.path.join(ROOT, f'public/audio5/{k2}.wav'), SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
print(json.dumps({'duration': round(DUR, 3), 'pauses': PAUSES, 'mix_peak_dbfs': round(20 * np.log10(np.max(np.abs(mix)) + 1e-9), 2)}))
