"""Original sparse, soft raindrops. Run locally; no recordings or network needed."""
from pathlib import Path
import numpy as np
import wave

root=Path(__file__).resolve().parent.parent
rate=22050
duration=32
count=rate*duration
rng=np.random.default_rng(2917)
frequencies=np.fft.rfftfreq(count,1/rate)
bed=np.fft.irfft(np.fft.rfft(rng.normal(size=count))*np.exp(-(frequencies/850)**2),n=count)
bed=bed/np.sqrt(np.mean(bed**2))*.00075
signal=bed.copy()
start=.9
while start<duration:
    u=np.arange(int(rate*.8))/rate
    envelope=(1-np.exp(-u/.02))*np.exp(-u/.12)
    pitch=rng.uniform(275,345)
    phase=2*np.pi*(pitch*u+10*(1-np.exp(-u*9)))
    brush=np.convolve(rng.normal(size=u.size),np.ones(13)/13,mode='same')
    drop=rng.uniform(.10,.14)*envelope*(np.sin(phase)+.16*np.sin(phase*1.97))
    drop+=brush*envelope*.009
    later=np.maximum(0,u-.13)
    drop+=(u>.13)*.025*(1-np.exp(-later/.025))*np.exp(-later/.09)*np.sin(2*np.pi*190*later)
    indices=(int(start*rate)+np.arange(u.size))%count
    signal[indices]+=drop
    start+=rng.uniform(1.9,3.2)
with wave.open(str(root/'audio/rain.wav'),'wb') as out:
    out.setnchannels(1);out.setsampwidth(2);out.setframerate(rate)
    out.writeframes((np.clip(signal,-1,1)*32767).astype('<i2').tobytes())
print(f'Soft rain: {duration}s, peak={np.max(np.abs(signal)):.4f}, RMS={np.sqrt(np.mean(signal**2)):.4f}')
