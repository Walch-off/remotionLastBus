"""
Озвучка: голос 1.0 + атмосфера 0.10 + SFX 0.4 (как в эп2).
Все звуки синтезируются здесь же (numpy/scipy), без внешних сэмплов.
Выход: public/audio3/mix.wav (44.1 кГц, 16 бит, стерео).
"""
import wave, json
import numpy as np
from scipy import signal

SR = 44100
VOICE = 'public/audio3/voice3_original.wav'
OUT = 'public/audio3/mix.wav'
DUR = 153.469

w = wave.open(VOICE)
n = w.getnframes()
voice = np.frombuffer(w.readframes(n), dtype='<i2').astype(np.float32) / 32768.0
voice = np.pad(voice, (0, max(0, int(DUR * SR) - len(voice))))

rng = np.random.default_rng(7)


def env_exp(length, tau):
    t = np.arange(int(length * SR)) / SR
    return np.exp(-t / tau)


def noise(length, color='white'):
    m = int(length * SR)
    x = rng.standard_normal(m)
    if color == 'pink':
        b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
        x = signal.lfilter(b, a, x)
    elif color == 'brown':
        x = signal.lfilter([1], [1, -0.995], x)
    return x / (np.max(np.abs(x)) + 1e-9)


def add(buf, at, sig, gain=1.0):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if i >= len(buf):
        return
    buf[i:j] += sig[:j - i] * gain


def lowpass(x, fc, order=4):
    b, a = signal.butter(order, min(fc / (SR / 2), 0.99), 'low')
    return signal.lfilter(b, a, x)


def highpass(x, fc, order=4):
    b, a = signal.butter(order, min(fc / (SR / 2), 0.99), 'high')
    return signal.lfilter(b, a, x)


def bandpass(x, lo, hi, order=4):
    b, a = signal.butter(order, [lo / (SR / 2), min(hi / (SR / 2), 0.99)], 'band')
    return signal.lfilter(b, a, x)


# ---------- атмосфера: дождь + гул двигателя + гул ночи ----------
amb = np.zeros(int(DUR * SR), dtype=np.float32)
rain = bandpass(noise(DUR, 'white'), 700, 6500) * 0.5
# дождь «дышит» — медленная модуляция
tt = np.arange(len(rain)) / SR
rain *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * tt) ** 2
amb += rain * 0.055
# двигатель: включается с 14 с, выключается на 110 с
eng_env = np.clip((tt - 13.8) / 1.6, 0, 1) * np.clip((110.2 - tt) / 2.2, 0, 1)
hum = (np.sin(2 * np.pi * 47 * tt) * 0.5 + np.sin(2 * np.pi * 71 * tt) * 0.25 + np.sin(2 * np.pi * 118 * tt) * 0.12)
hum += lowpass(noise(DUR, 'brown'), 220) * 0.5
amb += (hum * eng_env * 0.05).astype(np.float32)
# низкий ночной гул
amb += lowpass(noise(DUR, 'brown'), 90) * 0.05

# ---------- SFX ----------
sfx = np.zeros(int(DUR * SR), dtype=np.float32)


def door_close(at, gain=1.0):
    d = lowpass(noise(0.5), 900) * env_exp(0.5, 0.08)
    d += np.sin(2 * np.pi * 82 * np.arange(int(0.5 * SR)) / SR) * env_exp(0.5, 0.12) * 0.6
    add(sfx, at, d, 0.5 * gain)
    add(sfx, at + 0.34, lowpass(noise(0.35), 1400) * env_exp(0.35, 0.05), 0.35 * gain)  # щелчок замка


def engine_start(at, gain=1.0):
    L = 2.6
    t = np.arange(int(L * SR)) / SR
    f = 26 + 22 * np.clip(t / 1.2, 0, 1)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * 0.6 + np.sin(ph * 2) * 0.2 + lowpass(noise(L), 300) * 0.3
    s *= np.clip(t / 0.35, 0, 1) * np.clip((L - t) / 1.2, 0, 1)
    add(sfx, at, s, 0.34 * gain)


def light_off(at, gain=1.0):
    # резкий провал: щелчок + низкий удар + шорох реле
    L = 1.2
    t = np.arange(int(L * SR)) / SR
    click = bandpass(noise(0.08), 1800, 6000) * env_exp(0.08, 0.01)
    thud = np.sin(2 * np.pi * 58 * t) * env_exp(L, 0.28)
    add(sfx, at, click, 0.5 * gain)
    add(sfx, at, thud, 0.45 * gain)
    add(sfx, at + 0.05, highpass(noise(0.5), 2500) * env_exp(0.5, 0.09), 0.10 * gain)


def wet_step(at, gain=1.0, wet=1.0):
    L = 0.34
    s = bandpass(noise(L), 400, 3200) * env_exp(L, 0.055)
    s += lowpass(noise(L), 200) * env_exp(L, 0.09) * 0.7
    # «чавканье» воды
    s += bandpass(noise(L), 900, 2200) * env_exp(L, 0.16) * 0.35 * wet
    add(sfx, at, s, 0.34 * gain)


def flashlight_click(at, gain=1.0):
    L = 0.12
    s = bandpass(noise(L), 2200, 7000) * env_exp(L, 0.008)
    add(sfx, at, s, 0.55 * gain)
    add(sfx, at + 0.02, bandpass(noise(0.06), 1500, 4000) * env_exp(0.06, 0.006), 0.3 * gain)


def handrail_bump(at, gain=1.0):
    L = 0.7
    t = np.arange(int(L * SR)) / SR
    # металлический звон: несколько негармонических мод
    bell = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(523, 0.5), (1187, 0.3), (1741, 0.2), (2460, 0.12)])
    bell *= env_exp(L, 0.22)
    add(sfx, at, bell, 0.22 * gain)
    add(sfx, at, lowpass(noise(0.2), 700) * env_exp(0.2, 0.04), 0.3 * gain)


def stinger(at, gain=1.0, base=48, length=3.2):
    # «зеркальный» стингер: низкий нарастающий хор + металлический шорох
    L = length
    t = np.arange(int(L * SR)) / SR
    s = np.zeros_like(t)
    for k, (mul, a) in enumerate([(1.0, 0.5), (1.5, 0.28), (2.0, 0.18), (3.0, 0.1)]):
        vibr = 1 + 0.004 * np.sin(2 * np.pi * (3 + k) * t)
        s += np.sin(2 * np.pi * base * mul * t * vibr) * a
    s *= np.clip(t / 0.7, 0, 1) * np.clip((L - t) / 1.4, 0, 1)
    s += bandpass(noise(L), 1200, 5200) * np.clip(t / 1.2, 0, 1) * np.clip((L - t) / 1.2, 0, 1) * 0.12
    add(sfx, at, s, 0.3 * gain)


def flicker_buzz(at, length=1.1, gain=1.0):
    L = length
    t = np.arange(int(L * SR)) / SR
    buzz = np.sin(2 * np.pi * 100 * t) * 0.5 + np.sin(2 * np.pi * 200 * t) * 0.25
    gate = (np.sin(2 * np.pi * 11 * t) > 0.1).astype(np.float32)
    gate = signal.lfilter([0.02], [1, -0.98], gate)
    add(sfx, at, buzz * gate, 0.16 * gain)


def glass_tap(at, gain=1.0):
    L = 0.45
    t = np.arange(int(L * SR)) / SR
    s = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(1650, 0.5), (2870, 0.3), (4120, 0.15)])
    s *= env_exp(L, 0.08)
    add(sfx, at, s, 0.24 * gain)
    add(sfx, at, bandpass(noise(0.06), 1500, 6000) * env_exp(0.06, 0.01), 0.2 * gain)


def key_clink(at, gain=1.0):
    L = 0.5
    t = np.arange(int(L * SR)) / SR
    s = np.sin(2 * np.pi * 2100 * t) * env_exp(L, 0.12) + np.sin(2 * np.pi * 3300 * t) * env_exp(L, 0.09) * 0.6
    add(sfx, at, s, 0.26 * gain)


def accent(at, gain=1.0):
    L = 2.6
    t = np.arange(int(L * SR)) / SR
    s = np.sin(2 * np.pi * 41 * t) * np.exp(-t / 0.9)
    s += np.sin(2 * np.pi * 61.5 * t) * np.exp(-t / 0.7) * 0.5
    s += bandpass(noise(L), 200, 1600) * np.exp(-t / 0.5) * 0.25
    add(sfx, at, s, 0.4 * gain)


def whoosh(at, length=1.6, gain=1.0):
    L = length
    t = np.arange(int(L * SR)) / SR
    s = bandpass(noise(L), 300, 2600)
    s *= np.clip(t / (L * 0.4), 0, 1) * np.clip((L - t) / (L * 0.6), 0, 1)
    add(sfx, at, s, 0.2 * gain)


# --- раскладка по таймлайну (совпадает с монтажным листом) ---
accent(0.2, 0.7)                 # старт серии
whoosh(0.9, 1.2, 0.7)
door_close(7.6, 1.0)             # двери закрываются
engine_start(9.2, 0.9)           # двигатель
for i, t0 in enumerate([16.9, 22.3, 27.8, 33.4, 40.1, 45.6]):   # полосы остановок за стеклом
    whoosh(t0, 1.4, 0.35)
door_close(8.2, 0.5)
light_off(35.9, 0.9)             # фонарь гаснет
stinger(36.0, 0.6, base=42, length=2.6)
whoosh(39.1, 2.2, 0.5)           # возвращение автобуса
flicker_buzz(42.2, 1.6, 0.8)     # свет возвращается
for i, t0 in enumerate([52.6, 53.3, 54.0]):  # шаги по мокрым ступеням
    wet_step(t0, 0.8, 1.0)
stinger(53.9, 0.7, base=46, length=2.4)      # появление двойника
stinger(58.4, 0.5, base=52, length=2.0)      # улыбка
for i, t0 in enumerate([61.3, 63.9, 64.7, 65.6]):  # поднятие руки
    wet_step(t0, 0.25, 0.4)
glass_tap(66.6, 0.6)
light_off(73.4, 1.0)             # свет гаснет в салоне
stinger(73.6, 0.8, base=38, length=3.0)
for i, t0 in enumerate([75.9, 76.9, 77.9, 79.0, 80.0]):     # мокрые шаги по салону
    wet_step(t0, 0.75, 1.0)
flashlight_click(69.2, 1.0)      # фонарик вкл
flashlight_click(77.4, 0.8)      # фонарик выкл
handrail_bump(77.6, 1.0)         # рука на поручне
stinger(83.8, 0.9, base=44, length=3.4)      # отражение поднимает руку
stinger(90.6, 0.8, base=41, length=2.8)      # надпись на стекле
glass_tap(92.0, 0.5)
glass_tap(96.2, 0.5)
stinger(99.0, 0.6, base=47, length=2.2)
stinger(102.1, 0.5, base=50, length=1.8)     # голос водителя
whoosh(110.3, 1.4, 0.5)                      # автобус встал
door_close(111.8, 0.8)
for i, t0 in enumerate([118.9, 119.5, 120.1, 120.7, 121.3]):  # стук по стеклу
    glass_tap(t0, 0.75)
stinger(123.4, 0.7, base=49, length=2.4)     # улыбка в зеркале
key_clink(136.4, 1.0)                        # ключ на панели
key_clink(136.9, 0.6)
stinger(131.2, 0.5, base=43, length=2.0)     # «разбей зеркало»
accent(143.2, 0.8)                           # финальное голосование
accent(148.3, 0.6)

# ---------- микс ----------
n_all = min(len(voice), len(amb), len(sfx))
v = voice[:n_all]
a = amb[:n_all]
s = sfx[:n_all]
# лёгкий «карман» для голоса: атмосферу чуть приглушаем в местах речи
env = np.abs(signal.lfilter([1e-4], [1, -0.9999], np.abs(v)))
env /= (np.max(env) + 1e-9)
a *= (1 - 0.45 * env)
mix = v * 1.0 + a * 0.10 + s * 0.4
# ограничитель
peak = np.max(np.abs(mix)) + 1e-9
mix = mix / peak * 0.94
mix = np.tanh(mix * 1.15) * 0.92
# фейд-ин/аут
fade_in = int(0.12 * SR)
fade_out = int(0.5 * SR)
mix[:fade_in] *= np.linspace(0, 1, fade_in)
mix[-fade_out:] *= np.linspace(1, 0, fade_out)
stereo = np.stack([mix, mix], axis=1)
pcm = (np.clip(stereo, -1, 1) * 32767).astype('<i2')
o = wave.open(OUT, 'wb')
o.setnchannels(2)
o.setsampwidth(2)
o.setframerate(SR)
o.writeframes(pcm.tobytes())
o.close()
print('mix:', OUT, round(len(mix) / SR, 2), 's; peak', round(float(peak), 3),
      'voice', round(float(np.sqrt((v ** 2).mean())), 4),
      'amb', round(float(np.sqrt((a ** 2).mean())), 4),
      'sfx', round(float(np.sqrt((s ** 2).mean())), 4))
