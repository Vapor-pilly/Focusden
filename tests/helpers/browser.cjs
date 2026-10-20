const {before,after,beforeEach,afterEach}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const base='http://127.0.0.1:8765';

function playwright(){
  try{return require('playwright');}catch{
    return require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
  }
}
function executable(){
  const paths=[process.env.BROWSER_EXECUTABLE,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe'];
  return paths.find(p=>p&&fs.existsSync(p));
}
async function healthy(){
  try{return await (await fetch(base+'/health',{signal:AbortSignal.timeout(1000)})).text()==='yiyu-garden';}
  catch{return false;}
}
// Every test gets a private, fresh browser context. Personal localStorage is never used.
function browserSuite(){
  const suite={};let browser,server;
  before(async()=>{
    if(!await healthy()){
      server=spawn(process.execPath,['server.cjs'],{cwd:root,windowsHide:true,stdio:'pipe'});
      let logs='';server.stderr.on('data',b=>logs+=b);
      for(let i=0;i<50&&!await healthy();i++){
        if(server.exitCode!==null)throw Error('Local server failed: '+logs);
        await new Promise(r=>setTimeout(r,100));
      }
      assert.ok(await healthy(),'Local server must be available');
    }
    browser=await playwright().chromium.launch({headless:true,executablePath:executable()});
    fs.mkdirSync(path.join(root,'.preview'),{recursive:true});
  });
  beforeEach(async()=>{
    suite.context=await browser.newContext({viewport:{width:1440,height:900}});
    suite.page=await suite.context.newPage();suite.errors=[];suite.external=[];
    suite.page.on('pageerror',e=>suite.errors.push(e.message));
    suite.page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))suite.external.push(r.url());});
    await suite.page.goto(base);
  });
  afterEach(async()=>{
    try{assert.deepEqual(suite.errors,[],'No runtime errors');assert.deepEqual(suite.external,[],'No external requests');}
    finally{await suite.context?.close();}
  });
  after(async()=>{await browser?.close();server?.kill();});
  suite.screenshot=name=>suite.page.screenshot({path:path.join(root,'.preview',name),animations:'disabled'});
  return suite;
}
module.exports={browserSuite};
