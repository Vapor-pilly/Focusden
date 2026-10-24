"""Extract the exact clean book animation, without the surrounding phone UI."""
from pathlib import Path
import subprocess
import numpy as np
import random
import wave

root=Path(__file__).resolve().parent.parent
destination=root/'scenes/book-pages'
destination.mkdir(exist_ok=True)
ffmpeg=root/'.tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
subprocess.run([str(ffmpeg),'-v','error','-y','-t','6.6','-i',str(root/'source-materials/book-pages.mp4'),'-vf','crop=480:330:50:380,fps=30,tile=6x11','-frames:v','3','-c:v','libwebp','-f','image2','-quality','92',str(destination/'sheet-%d.webp')],check=True)

# Original paper rustle: soft, short, non-tonal noise with two brushing gestures.
rate=22050
rng=random.Random(793)
t=np.arange(int(rate*.58))/rate
noise=np.array([rng.uniform(-1,1) for _ in t])
smooth=np.convolve(noise,np.ones(7)/7,mode='same')
envelope=np.exp(-((t-.16)/.095)**2)*.15+np.exp(-((t-.34)/.075)**2)*.11
signal=smooth*envelope*(1+.22*np.sin(t*180))
with wave.open(str(root/'audio/page-turn.wav'),'wb') as out:
    out.setnchannels(1);out.setsampwidth(2);out.setframerate(rate)
    out.writeframes((signal*32767).astype('<i2').tobytes())
print('Book: 3 source atlases, 198 frames, 2.2-second original cadence; paper sound generated.')
