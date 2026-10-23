"""Produce a transport ZIP inside the requested mobile folder, excluding itself."""
from pathlib import Path
import zipfile,json,hashlib

root=Path(__file__).resolve().parent.parent
folder=(root/'专注乐园移动端').resolve()
if folder.parent!=root.resolve():raise RuntimeError('Unexpected mobile output path')
archive=folder/'专注乐园移动端.zip'
files=sorted(p for p in folder.rglob('*') if p.is_file() and p.suffix!='.zip' and p.name!='压缩包校验.json')
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=7) as output:
    for file in files:output.write(file,Path('专注乐园移动端')/file.relative_to(folder))
with zipfile.ZipFile(archive) as output:
    if output.testzip() is not None:raise RuntimeError('ZIP verification failed')
    for file in files:
        if output.read(str(Path('专注乐园移动端')/file.relative_to(folder)).replace('\\','/'))!=file.read_bytes():raise RuntimeError('ZIP file mismatch')
info={'file':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'files':len(files),'verified':True}
(folder/'压缩包校验.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps(info,ensure_ascii=True))
