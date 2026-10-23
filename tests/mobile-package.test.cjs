const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const folder=path.resolve(__dirname,'../专注乐园移动端');
test('mobile package: transport ZIP is complete, readable, byte-exact and contains no repository or original videos',()=>{
 const archive=path.join(folder,'专注乐园移动端.zip'),data=fs.readFileSync(archive);
 const info=JSON.parse(fs.readFileSync(path.join(folder,'压缩包校验.json'),'utf8'));
 assert.equal(crypto.createHash('sha256').update(data).digest('hex'),info.sha256);assert.equal(info.bytes,data.length);
 const python=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
 const script=`import pathlib,zipfile,json
p=pathlib.Path(${JSON.stringify(folder)});files=[f for f in p.rglob('*') if f.is_file() and f.suffix!='.zip' and f.name!='压缩包校验.json']
with zipfile.ZipFile(p/'专注乐园移动端.zip') as z:
 assert z.testzip() is None
 assert len(z.namelist())==len(files)
 assert not any('/.git/' in n or n.endswith('.mp4') for n in z.namelist())
 for f in files: assert z.read('专注乐园移动端/'+f.relative_to(p).as_posix())==f.read_bytes(),str(f)
 print(json.dumps({'files':len(files),'verified':True}))
`;
 const result=JSON.parse(execFileSync(python,['-c',script],{encoding:'utf8'}));assert.equal(result.files,info.files);assert.equal(result.verified,true);
});
