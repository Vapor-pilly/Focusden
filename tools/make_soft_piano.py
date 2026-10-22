"""Original slow piano-style composition with damped string partials and soft hammers."""
from pathlib import Path
import math
import wave
import numpy as np

root=Path(__file__).resolve().parent.parent
rate=22050
duration=64
frames=duration*rate
music=np.zeros((frames,2),np.float64)
cache={}
rng=np.random.default_rng(8031)

def note(midi):
    if midi in cache:
        return cache[midi]
    t=np.arange(rate*8)/rate
    freq=440*2**((midi-69)/12)
    sound=np.zeros_like(t)
    attack=1-np.exp(-t/.016)
    for harmonic in range(1,15):
        stiffness=.000055*(freq/440)**1.2
        f=freq*harmonic*np.sqrt(1+stiffness*harmonic**2)
        decay=(3.8 if midi<60 else 2.65)/(1+.24*(harmonic-1))
        envelope=attack*np.exp(-t/decay)
        strength=harmonic**-1.65*np.exp(-(f/3100)**1.5)
        strings=.5*np.sin(2*np.pi*f*t)+.27*np.sin(2*np.pi*f*1.00065*t+.03)+.23*np.sin(2*np.pi*f*.99945*t-.03)
        sound+=strength*envelope*strings
    hammer=np.convolve(rng.normal(size=t.size),np.ones(9)/9,mode='same')
    sound+=hammer*.018*attack*np.exp(-t/.035)
    sound*=np.minimum(1,(8-t)/.3)**2
    cache[midi]=sound
    return sound

def add(midi,start,gain):
    sound=note(midi)*gain
    pan=np.clip((midi-62)/65,-.3,.3)
    left=math.sqrt((1-pan)/2)
    right=math.sqrt((1+pan)/2)
    indices=(int((start%64)*rate)+np.arange(sound.size))%frames
    music[indices,0]+=sound*left
    music[indices,1]+=sound*right

chords=[(48,4),(45,3),(53,4),(43,4),(52,3),(45,3),(50,3),(43,4),
        (48,4),(53,4),(45,3),(43,4),(53,4),(50,3),(43,4),(48,4)]
melody=[(72,76),(76,72),(72,69),(71,74),(71,67),(69,72),(74,72),(71,67),
        (76,79),(77,76),(76,72),(74,71),(72,69),(69,74),(71,74),(72,None)]
for bar,((bass,third),top) in enumerate(zip(chords,melody)):
    for beat,pitch in enumerate([bass,bass+7,bass+12,bass+12+third]):
        add(pitch,bar*4+beat+rng.uniform(0,.025),(.063 if beat==0 else .036)*rng.uniform(.93,1.03))
    for beat,pitch in zip([.45,2.45],top):
        if pitch is not None:
            add(pitch,bar*4+beat+rng.uniform(-.015,.015),.064*rng.uniform(.94,1.03))

# Short damped room reflections use circular delays, including the loop seam.
dry=music.copy()
for delay,level in [(.075,.14),(.14,.09),(.235,.055)]:
    music+=np.roll(dry[:,::-1],int(rate*delay),axis=0)*level
peak=float(np.max(np.abs(music)))
music*=min(1,.22/peak)
with wave.open(str(root/'audio/piano.wav'),'wb') as out:
    out.setnchannels(2);out.setsampwidth(2);out.setframerate(rate)
    out.writeframes((np.clip(music,-1,1)*32767).astype('<i2').tobytes())
print(f'Original soft piano: {duration}s, stereo, peak={np.max(np.abs(music)):.4f}, RMS={np.sqrt(np.mean(music**2)):.4f}')
