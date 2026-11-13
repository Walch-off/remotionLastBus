"""Эпизод 4: монтаж озвучки, расчёт событий и синтез звуковых дорожек.

Вход:  исходный WAV озвучки (не изменяется), src/data/words4_orig.json (scripts/align4.py).
Выход: public/audio4/{voice_final,sfx,ambience,music}.wav,
       src/data/words4.json — слова с таймкодами финального монтажа,
       src/data/cues4.json  — именованные события (сек) для анимации и звука.

Все эффекты синтезированы здесь программно (numpy/scipy), без внешних библиотек звуков.
Запуск: python scripts/build_audio4.py <путь к исходному WAV>
"""
import json, os, re, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'public/audio4/voice_original.wav')
rng = np.random.default_rng(4)

sr0, v = wavfile.read(SRC)
assert sr0 == SR, sr0
v = v.astype(np.float32) / 32768.0
if v.ndim > 1:
    v = v.mean(axis=1)
words = json.load(open(os.path.join(ROOT, 'src/data/words4_orig.json')))
norm = lambda x: re.sub(r'[^а-яa-z0-9]', '', x.lower().replace('ё', 'е'))


def find(token, start=0):
    for i in range(start, len(words)):
        if norm(words[i]['text']) == norm(token):
            return i
    raise KeyError(token)


def quietest(a, b):
    """самая тихая точка (окно 40 мс) в паузе между a и b, сек"""
    i0, i1 = int(a * SR), int(b * SR)
    seg = v[i0:i1] ** 2
    win = int(0.04 * SR)
    if len(seg) <= win:
        return (a + b) / 2
    e = np.convolve(seg, np.ones(win) / win, mode='valid')
    return (i0 + int(np.argmin(e)) + win // 2) / SR


# --- монтаж: короткие драматические паузы в настоящей тишине между фразами ---
def gap_after(tok, start=0):
    i = find(tok, start)
    return quietest(words[i]['e'], words[i + 1]['s'])

PAUSES = [
    (gap_after('поздно.'), 0.75),        # замах → удар до «Стекло треснуло»
    (gap_after('закончилось.'), 0.6),    # тишина перед стуком
    (gap_after('меня».', find('«Спасибо,')), 0.35),         # голос рядом → автобус качнулся
    (gap_after('открылись.'), 0.5),      # шипение дверей
]
TAIL = 3.2  # финальный экран после последнего слова
PAUSES.sort()


def fmap(t):
    return t + sum(d for (p, d) in PAUSES if p <= t)


parts, prev = [], 0
for p, d in PAUSES:
    parts += [v[prev:int(p * SR)], np.zeros(int(d * SR), np.float32)]
    prev = int(p * SR)
parts.append(v[prev:])
voice = np.concatenate(parts)
end_voice = len(voice) / SR
N = int((end_voice + TAIL) * SR)
voice = np.pad(voice, (0, N - len(voice)))
DUR = N / SR

wout = [{'text': w['text'], 's': round(fmap(w['s']), 3), 'e': round(fmap(w['e']), 3)} for w in words]

# --- именованные события: последовательный поиск слов сценария ---
CUES = [
    ('vote', 'выбрали'), ('hope', 'Надеюсь,'), ('keyHeld', 'Водитель'), ('stare', 'смотрел'), ('aisle', 'прохода'),
    ('voice1', '«Разбей'), ('remember', 'запомнило».'), ('look', 'оглянулся.'), ('hammer', 'Рядом'),
    ('grab', 'схватил'), ('swing', 'замахнулся.'), ('shoutPre', 'впервые'), ('shout', '«Стой!'), ('dont', 'Не'),
    ('late', 'Но'), ('cracked', 'Стекло'), ('lines', 'побежали'), ('then', 'потом'), ('scream', 'крик.'),
    ('recoil', 'отшатнулся.'), ('drop', 'выронил'), ('grabFace', 'схватился'), ('freeze', 'замер.'), ('eyes', 'глаза'),
    ('notLook', 'больше'), ('pick', 'поднял'), ('engine', 'заглох,'), ('wetSteps', 'мокрые'), ('stepsGone', 'исчезли.'),
    ('quiet', 'тихо.'), ('thought', 'подумал,'), ('knockPre', 'Потом'), ('knockWord', 'постучал'),
    ('k1', 'Один'), ('k2', 'Второй.'), ('k3', 'Третий.'), ('between', 'Между'), ('face', 'лицо.'),
    ('otherSide', 'Оно'), ('stood', 'стоял'), ('notIt', 'нет.'), ('palmIn', 'медленно'), ('palmTouch', 'ладонь'),
    ('water', 'толстовке'), ('wetShoulders', 'Мокрые'), ('clear', 'отчётливыми.'), ('bangPre', 'двойник'), ('bang', 'ударил'),
    ('turn', 'обернулся.'), ('shake', 'отчаянно'), ('point', 'показывал'), ('lookBack', 'снова'), ('noFace', 'Лица'),
    ('palmLeft', 'Осталась'), ('butNow', 'теперь'), ('outside', 'снаружи,'), ('mySide', 'моей'),
    ('inhale', 'резко'), ('almost', 'чуть'), ('ask', '«Кто'), ('asked', 'спросил'), ('drvLook', 'посмотрел'),
    ('drvSay', '«Я'), ('voiceNear', 'этот'), ('same', 'тот'), ('near', 'Теперь'), ('thanks', '«Спасибо,'),
    ('rock', 'качнулся.'), ('lampOut', 'погас'), ('dark', 'темноте.'), ('phone', 'телефоне'), ('msgFrom', 'Пришло'),
    ('msg1', '«Не'), ('lookUp', 'глаза.'), ('drvStill', 'Водитель'), ('palmNear', 'рядом'), ('palmAppear', 'появилась'),
    ('notSee', 'видел,'), ('whisper', 'Голос'), ('give', '«Отдай'), ('grip', 'сжал'), ('vib', 'завибрировал'),
    ('newMsg', 'Новое'), ('msg2', '«Если'), ('palmOpen', 'Ладонь'), ('doors', 'Двери'), ('hiss', 'зашипели,'),
    ('notOpen', 'открылись.'), ('q', 'Что'), ('opt1', 'отдать'), ('opt2', 'спрятать'), ('vote2', 'Выбирайте'),
    ('cont', 'Продолжение'),
]
cues, idx, cidx = {}, 0, {}
for name, tok in CUES:
    idx = find(tok, idx)
    cues[name] = wout[idx]['s']
    cidx[name] = idx
cues['strike'] = round(cues['cracked'] - 0.62, 3)      # удар — в добавленной паузе перед «Стекло треснуло»
cues['lastWord'] = wout[-1]['e']
cues['end'] = round(DUR, 3)
cues['pauses'] = [[round(fmap(p) - d, 3), d] for p, d in PAUSES]
json.dump(wout, open(os.path.join(ROOT, 'src/data/words4.json'), 'w'), ensure_ascii=False, indent=0)
json.dump({'cues': cues, 'idx': cidx}, open(os.path.join(ROOT, 'src/data/cues4.json'), 'w'), ensure_ascii=False, indent=1)
C = cues

# ============================ синтез ============================
T = np.arange(N) / SR


def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], 'bandpass', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'lowpass', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'highpass', fs=SR, output='sos'), x)


def noise(n):
    return rng.standard_normal(n).astype(np.float64)


def place(track, t, x, g=1.0):
    i = int(t * SR)
    if i >= len(track):
        return
    x = x[: len(track) - i]
    track[i:i + len(x)] += g * x


def norm_peak(x, p=1.0):
    m = np.max(np.abs(x)) + 1e-9
    return x / m * p


def thud(f=90, dur=0.35, click=0.3):
    n = int(dur * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * f * t * (1 - 0.3 * t / dur)) * env(n, 0.002, dur / 4)
    c = bp(noise(n), 300, 2500) * env(n, 0.001, 0.015) * click
    return norm_peak(body + c)


def metal(freqs, dur=0.6, decay=0.15):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t / (decay * (1 + 0.3 * k))) for k, f in enumerate(freqs))
    return norm_peak(x * np.minimum(1, t / 0.001))


def glass_crack(dur=1.4):
    n = int(dur * SR); x = np.zeros(n)
    t0 = 0.0
    for k in range(70):
        t0 += rng.exponential(0.012 + 0.0005 * k)
        if t0 > dur - 0.05:
            break
        m = int(0.004 * SR)
        g = np.exp(-t0 * 2.2) * rng.uniform(0.3, 1)
        place_arr = hp(noise(m), 2500) * np.exp(-np.arange(m) / (0.0012 * SR))
        i = int(t0 * SR); x[i:i + m] += g * place_arr
    tinkle = metal([3100, 4270, 5650, 6900], 1.2, 0.25) * 0.18
    x[:len(tinkle)] += tinkle[:n]
    return norm_peak(x)


def chime(freqs, dur=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for k, f in enumerate(freqs):
        s = int(k * 0.12 * SR)
        tt = t[: n - s]
        x[s:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.18) * np.minimum(1, tt / 0.004)
    return norm_peak(x)


def buzz(dur=0.9, pulses=2):
    n = int(dur * SR); t = np.arange(n) / SR
    gate = np.zeros(n)
    for k in range(pulses):
        a, b = k * dur / pulses, k * dur / pulses + dur / pulses * 0.65
        gate += ((t >= a) & (t < b)) * 1.0
    gate = lp(gate, 40)
    x = (np.sign(np.sin(2 * np.pi * 165 * t)) * 0.4 + np.sin(2 * np.pi * 165 * t)) * gate
    return norm_peak(lp(x, 900))


def hiss(dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    e = np.minimum(1, t / 0.03) * np.exp(-t / 0.55)
    x = hp(noise(n), 2200) * e
    x[: int(0.25 * SR)] += thud(70, 0.25, 0.6)[: int(0.25 * SR)] * 0.6
    return norm_peak(x)


def inhale(dur=0.55):
    n = int(dur * SR); t = np.arange(n) / SR
    e = np.sin(np.pi * np.minimum(1, t / dur)) ** 1.5
    return norm_peak(bp(noise(n), 900, 3800) * e * (0.4 + t / dur))


def drips(n_drops=6, dur=1.6):
    n = int(dur * SR); x = np.zeros(n)
    for k in range(n_drops):
        t0 = rng.uniform(0, dur - 0.15); m = int(0.08 * SR); tt = np.arange(m) / SR
        f = rng.uniform(900, 1600)
        d = np.sin(2 * np.pi * (f + 2500 * tt) * tt) * np.exp(-tt / 0.018)
        i = int(t0 * SR); x[i:i + m] += d * rng.uniform(0.5, 1)
    return norm_peak(x)


def scream_muffled(dur=1.5):
    """приглушённый «крик из-за стекла»: формантный пилообразный тон, фильтрованный и тихий"""
    n = int(dur * SR); t = np.arange(n) / SR
    f0 = 330 + 60 * np.sin(2 * np.pi * 5.5 * t) * (t / dur) + 40 * (t / dur)
    ph = 2 * np.pi * np.cumsum(f0) / SR
    saw = signal.sawtooth(ph)
    x = bp(saw, 600, 1100) * 0.9 + bp(saw, 1500, 2600) * 0.6 + bp(noise(n), 800, 3000) * 0.25
    e = np.minimum(1, t / 0.12) * np.minimum(1, (dur - t) / 0.4)
    x = lp(x * e, 2400)
    # стеклянная «коробка»: короткое эхо
    d = int(0.023 * SR); y = x.copy(); y[d:] += 0.45 * x[:-d]
    return norm_peak(y)


def creak(dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 180 + 60 * np.sin(2 * np.pi * 1.3 * t)
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * t))
    x = bp(x, 300, 1800) * np.sin(np.pi * t / dur)
    low = np.sin(2 * np.pi * 45 * t) * np.sin(np.pi * t / dur)
    return norm_peak(x * 0.5 + low)


def lamp_off(dur=0.8):
    n = int(dur * SR); t = np.arange(n) / SR
    b = (np.sin(2 * np.pi * 100 * t) + 0.5 * np.sin(2 * np.pi * 200 * t)) * (t < 0.35) * (0.5 + 0.5 * (rng.random(n) > 0.4))
    x = lp(b, 1500) * 0.5
    x[int(0.35 * SR):int(0.35 * SR) + int(0.2 * SR)] += thud(140, 0.2, 1.0)[: int(0.2 * SR)]
    return norm_peak(x)


def boom(dur=3.0):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 42 * t) * np.exp(-t / 1.1) + 0.4 * np.sin(2 * np.pi * 61.5 * t) * np.exp(-t / 0.9)
    x += lp(noise(n), 200) * np.exp(-t / 0.4) * 0.6
    return norm_peak(x * np.minimum(1, t / 0.01))


sfx = np.zeros(N)
# сцена 1–2: молоток снимают с креплений, замах
place(sfx, C['grab'] + 0.15, metal([1250, 1830, 2650], 0.4, 0.06), 0.35)
place(sfx, C['grab'] + 0.2, thud(160, 0.15, 0.8), 0.25)
place(sfx, C['swing'] + 0.1, bp(noise(int(0.35 * SR)), 300, 1500) * np.hanning(int(0.35 * SR)), 0.18)
# удар по зеркалу и трещины
place(sfx, C['strike'] - 0.18, bp(noise(int(0.2 * SR)), 400, 2500) * np.hanning(int(0.2 * SR)), 0.25)
place(sfx, C['strike'], thud(110, 0.5, 1.0), 0.75)
place(sfx, C['strike'], glass_crack(1.5), 0.55)
place(sfx, C['lines'], glass_crack(1.8) * 0.6, 0.35)
place(sfx, C['scream'] - 0.35, scream_muffled(1.7), 0.32)
# ключ падает
for k, (dt, g) in enumerate([(0.0, 0.5), (0.17, 0.3), (0.29, 0.16)]):
    place(sfx, C['drop'] + 0.35 + dt, metal([2350, 3410, 5120], 0.35, 0.05), g)
# поднимает ключ; молоток кладут на пол
place(sfx, C['pick'] + 0.33, thud(120, 0.25, 0.9), 0.3)
place(sfx, C['pick'] + 1.15, metal([2600, 3900], 0.2, 0.03), 0.18)
# двигатель глохнет
place(sfx, C['engine'], thud(55, 0.9, 0.2), 0.45)
place(sfx, C['engine'] + 0.05, creak(0.7) * 0.4, 0.2)
# три удара изнутри зеркала
for k in ('k1', 'k2', 'k3'):
    place(sfx, C[k], thud(95, 0.4, 0.5), 0.7)
    place(sfx, C[k] + 0.01, glass_crack(0.25) * 0.35, 0.25)
# ладонь у зеркала изнутри (скрип пальцев по стеклу), вода на толстовке
place(sfx, C['palmTouch'] - 0.2, bp(noise(int(0.6 * SR)), 1800, 5000) * np.hanning(int(0.6 * SR)), 0.1)
place(sfx, C['water'], drips(7, 2.2), 0.22)
# двойник бьёт по окну
place(sfx, C['bang'] + 0.05, thud(80, 0.5, 0.9), 0.75)
place(sfx, C['bang'] + 0.06, metal([780, 1170, 1900], 0.6, 0.12), 0.18)
place(sfx, C['bang'] + 0.45, thud(80, 0.4, 0.9), 0.45)
# влажная ладонь на зеркале (капли)
place(sfx, C['palmLeft'], drips(3, 1.0), 0.15)
# водитель резко вдыхает
place(sfx, C['inhale'] - 0.4, inhale(0.55), 0.45)
place(sfx, C['almost'] + 0.1, metal([2400, 3600], 0.25, 0.04), 0.15)
# автобус качнулся, фонарь гаснет
place(sfx, C['rock'] - 0.2, creak(1.4), 0.4)
place(sfx, C['lampOut'] - 0.1, lamp_off(0.8), 0.35)
# телефон: загорается и сообщение
place(sfx, C['phone'] + 0.1, buzz(0.7, 2), 0.22)
place(sfx, C['msgFrom'] + 0.1, chime([1318, 1760]), 0.28)
# мокрая ладонь появляется
place(sfx, C['palmAppear'] - 0.4, drips(5, 2.0), 0.2)
place(sfx, C['palmAppear'] - 0.5, lp(noise(int(2.2 * SR)), 300) * np.hanning(int(2.2 * SR)), 0.12)
place(sfx, C['grip'], bp(noise(int(0.25 * SR)), 300, 1200) * np.hanning(int(0.25 * SR)), 0.12)
# вторая вибрация и сообщение
place(sfx, C['vib'], buzz(1.0, 3), 0.25)
place(sfx, C['newMsg'] + 0.1, chime([1318, 1760]), 0.28)
# ладонь раскрывается, двери шипят и не открываются
place(sfx, C['palmOpen'], drips(3, 0.8), 0.15)
place(sfx, C['hiss'] - 0.15, hiss(1.6), 0.4)
place(sfx, C['hiss'] + 0.9, thud(70, 0.3, 0.5), 0.3)
# финальный акцент
place(sfx, C['q'] - 0.2, boom(3.0), 0.5)
place(sfx, C['cont'] - 0.1, boom(3.0), 0.35)

# --- атмосфера: дождь + гул автобуса до остановки двигателя ---
rain = hp(lp(noise(N), 6000), 500) * 0.25
for k in range(int(DUR * 7)):
    m = int(0.02 * SR); i = int(rng.uniform(0, DUR - 0.05) * SR)
    rain[i:i + m] += hp(noise(m), 3000) * np.exp(-np.arange(m) / (0.003 * SR)) * rng.uniform(0.1, 0.5)
hum = (np.sin(2 * np.pi * 48 * T) + 0.5 * np.sin(2 * np.pi * 96 * T) + 0.25 * np.sin(2 * np.pi * 144 * T)) * (1 + 0.1 * np.sin(2 * np.pi * 0.3 * T))
hum = hum * 0.35 + lp(noise(N), 160) * 0.5
eng = np.clip(1 - (T - C['engine']) / 1.4, 0, 1)
pitch_drop = np.where(T > C['engine'], 1 - 0.35 * np.clip((T - C['engine']) / 1.4, 0, 1), 1)
hum_drop = np.sin(2 * np.pi * np.cumsum(48 * pitch_drop) / SR) * 0.5
hum = (hum * 0.6 + hum_drop * 0.4) * eng
amb = rain * 0.55 + hum * 0.5
# после того как гаснет фонарь дождь чуть глуше
amb *= np.where(T > C['lampOut'], 0.8, 1.0)
amb *= np.clip(T / 0.8, 0, 1) * np.clip((DUR - T) / 1.0, 0, 1)

# --- музыка: низкий тревожный дрон, напряжение растёт к финалу ---
def pad(f, amp):
    return amp * (np.sin(2 * np.pi * f * T) + 0.3 * np.sin(2 * np.pi * 2.003 * f * T))
drone = pad(55, 1.0) + pad(58.27, 0.55) + pad(82.4, 0.35)
drone *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * T) ** 2
lvl = np.interp(T, [0, C['strike'], C['strike'] + 0.1, C['quiet'], C['knockPre'], C['thanks'], C['q'], DUR],
                [0.5, 0.65, 0.25, 0.15, 0.6, 0.85, 1.0, 0.0])
music = lp(drone, 400) * lvl

# --- сведение: голос главный, всё остальное с дакингом под речь ---
venv = np.abs(voice)
venv = lp(np.convolve(venv, np.ones(int(0.05 * SR)) / int(0.05 * SR), mode='same'), 4)
duck = 1 - 0.45 * np.clip(venv / 0.04, 0, 1)

def to_dbfs_peak(x, db):
    return norm_peak(x, 10 ** (db / 20))

stems = {
    'voice_final': voice,
    'sfx': to_dbfs_peak(sfx, -6) * (0.75 + 0.25 * duck),
    'ambience': to_dbfs_peak(amb, -26) * duck,
    'music': to_dbfs_peak(music, -24) * duck,
}
os.makedirs(os.path.join(ROOT, 'public/audio4'), exist_ok=True)
for k, x in stems.items():
    wavfile.write(os.path.join(ROOT, f'public/audio4/{k}.wav'), SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
print(json.dumps({'duration': DUR, 'pauses': PAUSES, 'voice_end': end_voice}, ensure_ascii=False))
