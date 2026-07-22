import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

async function main(){
const runId=process.argv[2]??`rc3-6-${new Date().toISOString().replace(/[:.]/g,"-")}`;
const parent=join(process.cwd(),"test-results","ai-v10-production-certification");mkdirSync(parent,{recursive:true});const root=join(parent,runId);mkdirSync(root,{recursive:false});
const write=(name:string,value:unknown)=>writeFileSync(join(root,name),`${JSON.stringify(value,null,2)}\n`,{flag:"wx"});
const prompt="Create a premium luxury residential developer website for Sanjeevini Group. The experience should feel architectural, editorial, calm, nature-led, credible, and designed for property discovery and consultation.";
const input={generationRunId:runId,prompt,context:{companyName:"Sanjeevini Group",industry:"real_estate",audience:"luxury residential property buyers",offer:"premium residential developments and consultation"},route:"/api/builder-v2/ai/generate-v10",requestedAt:new Date().toISOString()};
const keyPresent=Boolean(process.env.OPENAI_API_KEY);const databasePresent=Boolean(process.env.DATABASE_URL);const mediaPersistencePresent=Boolean(process.env.R2_ENDPOINT&&process.env.R2_ACCESS_KEY_ID&&process.env.R2_SECRET_ACCESS_KEY&&process.env.R2_BUCKET);
const providerConfiguration={textProvider:keyPresent?"OpenAI":"unavailable",textModel:process.env.OPENAI_V10_WEBSITE_MODEL||"gpt-5.6-sol",imageProvider:keyPresent?"OpenAI Images":"unavailable",imageModel:process.env.OPENAI_V10_IMAGE_MODEL||"gpt-image-2",forensicMode:process.env.AI_V10_FORENSIC_TRACE==="1",deterministicFixtureActive:false,persistenceEnabled:databasePresent&&mediaPersistencePresent,environmentSource:"apps/web-app/.env.local via normal Next.js environment loading",keyPresent,secretValuesRecorded:false};
write("00-input.json",input);write("01-provider-configuration.json",providerConfiguration);
let routeStatus:number|undefined;let routeError="";
try{const response=await fetch(`${process.env.CERTIFICATION_BASE_URL||"http://127.0.0.1:3000"}/api/builder-v2/ai/generate-v10`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({pageId:process.env.CERTIFICATION_PAGE_ID||"rc3-6-auth-probe",prompt,context:{...input.context,generationRunId:runId}})});routeStatus=response.status;const payload=await response.json().catch(()=>({}));routeError=typeof payload?.error==="string"?payload.error:"";}catch(error){routeError=error instanceof Error?error.message:String(error);}
const authPassed=routeStatus!==401;const configurationPassed=keyPresent&&databasePresent&&mediaPersistencePresent&&!providerConfiguration.forensicMode&&!providerConfiguration.deterministicFixtureActive;
const blocker=!configurationPassed?"provider-or-persistence-configuration":!authPassed?"production-route-authentication":routeStatus&&routeStatus>=400?"production-route-request":"none";
const skipped={status:"not-executed",blockedBy:blocker,reason:"Certification stops before providers when the authenticated normal production route is unavailable."};
for(const name of ["02-art-direction.json","03-component-selection.json","04-widget-population.json","05-hydration-diagnostics.json","06-media-slot-discovery.json","07-media-generation-results.json","08-population-gate.json","09-final-blueprint.json","10-persisted-blueprint.json","11-reloaded-blueprint.json","12-runtime-diagnostics.json"])write(name,skipped);
const summary={runId,passed:false,firstFailureStage:blocker,routeStatus,routeError:routeError||undefined,providerRequests:{text:0,image:0},persistenceAttempted:false,runtimeCaptureAttempted:false,configurationPassed,authPassed,retryInstruction:"Run from an authenticated Builder session with a real tenant-owned page; do not inject fixture dependencies or bypass getUser().",gateWeakened:false};write("13-certification-summary.json",summary);process.stdout.write(`${JSON.stringify({artifactDirectory:root,...summary})}\n`);if(!summary.passed)process.exitCode=2;
}
main().catch((error)=>{console.error(error);process.exitCode=1;});
