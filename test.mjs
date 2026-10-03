import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';

const token='fixture-platform-token',secret='fixture-runner-secret-'.repeat(3);
const base={LAB_SITE_URL:'https://ricodoesit-ai.ricocorrea12x.chatgpt.site',SITES_SERVICE_TOKEN:token,LAB_RUNNER_SECRET:secret};
function check(name,config,fetchBody,expected){
  const script=`globalThis.fetch=async(url,options)=>{${fetchBody}}; await import('./check.mjs');`;
  const result=spawnSync(process.execPath,['--input-type=module','--eval',script],{cwd:import.meta.dirname,env:{...process.env,...base,...config},encoding:'utf8'});
  assert.equal(result.status,expected,name);
  const logs=result.stdout+result.stderr;
  assert(!logs.includes(token)&&!logs.includes(secret),`${name}: leaked credentials`);
}
const verified=`if(options.redirect!=='error'||options.method!=='POST'||url.pathname!=='/api/auto/service')throw Error('Unsafe request'); return {ok:true,json:async()=>({ok:true,status:'verified',checkedAt:'2026-10-03T00:00:00Z',quoteSource:'Kraken Spot'})};`;
check('verified request',{},verified,0);
check('missing configuration',{SITES_SERVICE_TOKEN:''},`throw Error('unexpected fetch');`,1);
check('short secret',{LAB_RUNNER_SECRET:'short'},`throw Error('unexpected fetch');`,1);
check('wrong origin',{LAB_SITE_URL:'https://example.com'},`throw Error('unexpected fetch');`,1);
check('HTTP authentication failure',{},`return {ok:false,status:403};`,1);
check('data unavailable',{},`return {ok:false,status:503};`,1);
check('duplicate/unclaimed',{},`return {ok:true,json:async()=>({ok:false,status:'slot_unclaimed'})};`,1);
check('network failure',{},`throw Error('Network failed');`,1);
console.info('8 runner checks passed; credentials absent from output.');
