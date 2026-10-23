"""Original continuous study rain: stereo, non-tonal and seamlessly periodic."""
from pathlib import Path
import numpy as np
import wave
root=Path(__file__).resolve().parent.parent
rate=22050;duration=32;count=rate*duration
rng=np.random.default_rng(2918)
f=np.fft.rfftfreq(count,1/rate)
# Broad rainfall spectrum, with softened extreme hiss and no resonant droplets.
shape=(1-np.exp(-(f/95)**2))/np.sqrt(1+(f/1350)**1.45)*np.exp(-(f/6400)**4)
def rain():
    sound=np.fft.irfft(np.fft.rfft(rng.normal(size=count))*shape,n=count)
    return sound/np.sqrt(np.mean(sound**2))
common=rain();t=np.arange(count)/rate
swell=.96+.025*np.sin(2*np.pi*t/16)+.015*np.sin(2*np.pi*t/32+.4)
channels=[]
for side in range(2):
    signal=(.78*common+.36*rain())*swell
    signal*=.052/np.sqrt(np.mean(signal**2))
    channels.append(signal)
signal=np.stack(channels,axis=1)
# Circular spectral construction already loops; gentle wrap interpolation avoids a click.
fade=256
for channel in range(2):
    center=(signal[0,channel]+signal[-1,channel])/2
    signal[:fade,channel]=center+(signal[:fade,channel]-center)*np.linspace(0,1,fade)
    signal[-fade:,channel]=center+(signal[-fade:,channel]-center)*np.linspace(1,0,fade)
with wave.open(str(root/'audio/rain.wav'),'wb') as out:
    out.setnchannels(2);out.setsampwidth(2);out.setframerate(rate)
    out.writeframes((np.clip(signal,-1,1)*32767).astype('<i2').tobytes())
print(f'Study rain: {duration}s stereo, peak={np.max(np.abs(signal)):.4f}, RMS={np.sqrt(np.mean(signal**2)):.4f}')
