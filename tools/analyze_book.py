import subprocess
from pathlib import Path
import numpy as np

root=Path(__file__).resolve().parent.parent
exe=root/'.tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
raw=subprocess.check_output([str(exe),'-v','error','-i',str(root/'source-materials/book-pages.mp4'),'-t','6.6','-vf','crop=480:330:50:380','-f','rawvideo','-pix_fmt','rgb24','-'])
frames=np.frombuffer(raw,np.uint8).reshape(-1,330,480,3)
scores=((frames[:,50:125,140:335,:].mean(axis=3)<235)).sum(axis=(1,2))
print([(round(i/30,2),int(scores[i])) for i in range(0,len(scores),3)])
