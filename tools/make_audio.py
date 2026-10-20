"""Generate original, offline ambient audio. No downloaded recordings or dependencies."""
import math
import random
import struct
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'audio'
ROOT.mkdir(exist_ok=True)
RATE = 22050

def save(name, values):
    with wave.open(str(ROOT / (name + '.wav')), 'wb') as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(RATE)
        out.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, x)) * 32767)) for x in values))

for index, name in enumerate(['rain', 'waves', 'forest']):
    rng = random.Random(124 + index)
    duration = 16
    data = []
    low = mid = 0
    for i in range(RATE * (duration + 1)):
        t = i / RATE
        noise = rng.uniform(-1, 1)
        low = .994 * low + .006 * noise
        mid = .86 * mid + .14 * noise
        if name == 'rain':
            value = mid * .7 + noise * .085
        elif name == 'waves':
            envelope = .35 + .65 * (.5 + .5 * math.sin(2 * math.pi * t / 8)) ** 2
            value = (low * 3 + mid * .35) * envelope
        else:
            envelope = .6 + .4 * math.sin(2 * math.pi * t / 16) ** 2
            value = (low * 2.5 + mid * .25) * envelope
        data.append(value)
    # Overlap the final second into the first for an unobtrusive loop seam.
    for i in range(RATE):
        a = i / RATE
        data[i] = data[duration * RATE + i] * (1-a) + data[i] * a
    save(name, data[:duration * RATE])

rng = random.Random(42)
data = []
low = 0
for i in range(int(RATE * .8)):
    t = i / RATE
    low = low * .8 + rng.uniform(-1, 1) * .2
    env = min(1, t * 40) * math.exp(-t * 6)
    data.append(env * (low * .15 + math.sin(2 * math.pi * (620*t + 80*math.exp(-t*8))) * .12))
save('water', data)
data = []
for i in range(RATE * 3):
    t = i / RATE
    value = 0
    for start, freq in [(0, 523.25), (.28, 659.25), (.56, 783.99)]:
        u = t - start
        if u >= 0:
            value += .18 * min(1, u * 70) * math.exp(-u * 2.8) * (math.sin(2*math.pi*freq*u) + .18*math.sin(2*math.pi*freq*2*u))
    data.append(value)
save('complete', data)
print('Generated five original local audio files.')
