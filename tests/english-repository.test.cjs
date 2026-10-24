const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');

test('English repository: every tracked path is ASCII and every Markdown document is in English',()=>{
 const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
 for(const file of files){
  assert.ok(/^[\x20-\x7e]+$/.test(file),`Non-English repository path: ${file}`);
  if(file.endsWith('.md'))assert.ok(!/\p{Script=Han}/u.test(fs.readFileSync(path.join(root,file),'utf8')),`Untranslated documentation: ${file}`);
 }
 for(const file of ['README.md','PRD.md','DEVELOPMENT_PLAN.md','TEST_RESULTS.md','audio/README.md','source-materials/README.md','mobile/README.md','mobile/IPHONE_INSTALL.md','mobile/ACCEPTANCE_RESULTS.md'])assert.ok(files.includes(file),file);
 assert.ok(files.includes('start-focusden.cmd'));assert.ok(files.includes('mobile/Focusden-mobile.zip'));
});

test('English repository: distributed archive also has English paths and English documentation',()=>{
 const python=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
 const script=`from pathlib import Path
import zipfile,re,json
p=Path(${JSON.stringify(path.join(root,'mobile/Focusden-mobile.zip'))})
with zipfile.ZipFile(p) as z:
 names=z.namelist()
 assert all(n.isascii() and n.startswith('mobile/') for n in names)
 docs=[n for n in names if n.endswith('.md')]
 assert len(docs)>=10
 for n in docs: assert not re.search(r'[\\u3400-\\u9fff]',z.read(n).decode('utf-8')),n
 print(json.dumps({'files':len(names),'documents':len(docs),'verified':True}))
`;
 const result=JSON.parse(execFileSync(python,['-c',script],{encoding:'utf8'}));assert.equal(result.verified,true);
});
