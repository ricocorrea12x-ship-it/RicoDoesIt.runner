// Render cron caller. Credentials come only from Render's secret settings.
const url=process.env.LAB_SITE_URL;
const siteToken=process.env.SITES_SERVICE_TOKEN;
const runnerSecret=process.env.LAB_RUNNER_SECRET;
if(!url||!siteToken||!runnerSecret||runnerSecret.length<32)throw Error('Missing runner configuration');
const target=new URL('/api/auto/service',url);
if(target.protocol!=='https:'||target.hostname!=='ricodoesit-ai.ricocorrea12x.chatgpt.site')throw Error('Unexpected Site origin');
const response=await fetch(target,{
  method:'POST',
  headers:{'OAI-Sites-Authorization':`Bearer ${siteToken}`,'Authorization':`Bearer ${runnerSecret}`,'Accept':'application/json'},
  signal:AbortSignal.timeout(45_000),
});
if(!response.ok){console.error('paper_check_failed',response.status);process.exitCode=1}
else{
  const result=await response.json();
  if(result?.ok!==true||result?.status!=='verified'){
    console.error('paper_check_unverified');process.exitCode=1;
  }else console.info('paper_check_verified',result.checkedAt,result.quoteSource);
}
