// Render cron caller. Credentials come only from Render's secret settings.
import {pathToFileURL} from 'node:url';

const retryDelayMs=45_000;

function configuration(){
  const url=process.env.LAB_SITE_URL;
  const siteToken=process.env.SITES_SERVICE_TOKEN;
  const runnerSecret=process.env.LAB_RUNNER_SECRET;
  if(!url||!siteToken||!runnerSecret||runnerSecret.length<32)throw Error('Missing runner configuration');
  const target=new URL('/api/auto/service',url);
  if(target.protocol!=='https:'||target.hostname!=='ricodoesit-ai.ricocorrea12x.chatgpt.site')throw Error('Unexpected Site origin');
  return {target,siteToken,runnerSecret};
}

async function requestCheck(fetchImpl){
  const {target,siteToken,runnerSecret}=configuration();
  const response=await fetchImpl(target,{
    method:'POST',
    headers:{'OAI-Sites-Authorization':`Bearer ${siteToken}`,'Authorization':`Bearer ${runnerSecret}`,'Accept':'application/json'},
    signal:AbortSignal.timeout(45_000),
  });
  let result=null;
  try{result=await response.json()}catch{}
  return {response,result};
}

export async function runPaperCheck({fetchImpl=fetch,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
  let outcome=await requestCheck(fetchImpl);
  if(outcome.response.status===503&&outcome.result?.status==='slot_unclaimed'){
    console.info('paper_check_retrying_slot',retryDelayMs);
    await wait(retryDelayMs);
    outcome=await requestCheck(fetchImpl);
  }
  if(!outcome.response.ok){console.error('paper_check_failed',outcome.response.status);return false}
  if(outcome.result?.ok!==true||outcome.result?.status!=='verified'){
    console.error('paper_check_unverified');return false;
  }
  console.info('paper_check_verified',outcome.result.checkedAt,outcome.result.quoteSource);
  return true;
}

const direct=process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href;
if(direct&&!await runPaperCheck())process.exitCode=1;
