const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const folder=path.resolve(__dirname,'../mobile');
test('mobile package: retained transport ZIP is complete and intact independently of website updates',()=>{
 const archive=path.join(folder,'Focusden-mobile.zip'),data=fs.readFileSync(archive);
 const info=JSON.parse(fs.readFileSync(path.join(folder,'archive-checksums.json'),'utf8'));
 assert.equal(crypto.createHash('sha256').update(data).digest('hex'),info.sha256);assert.equal(info.bytes,data.length);
 const python=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
 const script=`import pathlib,zipfile,json
p=pathlib.Path(${JSON.stringify(folder)})
with zipfile.ZipFile(p/'Focusden-mobile.zip') as z:
 assert z.testzip() is None
 names=z.namelist();assert len(names)==len(set(names))
 assert all(n.startswith('mobile/') and '..' not in pathlib.PurePosixPath(n).parts for n in names)
 assert not any('/.git/' in n or n.endswith('.mp4') for n in names)
 resources=json.loads(z.read('mobile/asset-list.json'));build=json.loads(z.read('mobile/build-info.json'))
 assert len(resources)==build['runtime_files']
 assert all('mobile/'+n in names for n in resources)
 assert sum(len(z.read('mobile/'+n)) for n in resources)==build['runtime_bytes']
 for required in ['index.html','mobile.css','mobile.js','sw.js','manifest.webmanifest','README.md','IPHONE_INSTALL.md']:
  assert 'mobile/'+required in names
 # A retained transport snapshot is intentionally independent of the live website.
 if build['version']==json.loads((p/'build-info.json').read_text('utf-8'))['version']:
  files=[f for f in p.rglob('*') if f.is_file() and f.suffix!='.zip' and f.name!='archive-checksums.json']
  assert len(names)==len(files)
  for f in files: assert z.read('mobile/'+f.relative_to(p).as_posix())==f.read_bytes(),str(f)
 print(json.dumps({'files':len(names),'verified':True}))
`;
 const result=JSON.parse(execFileSync(python,['-c',script],{encoding:'utf8'}));assert.equal(result.files,info.files);assert.equal(result.verified,true);
});
