import type { BuilderBlueprint } from "../../types/blueprint";
import { evaluateRenderedVisualQuality,type RenderedScreenshot,type RenderedVisualEvaluation } from "./RenderedVisualQualityGate";
import { compileRenderedVisualRepairs } from "./RenderedVisualRepairCompiler";

export type RenderBlueprintForVisualQuality=(blueprint:BuilderBlueprint,iteration:number)=>Promise<readonly RenderedScreenshot[]>;
export type RenderedVisualIteration=Readonly<{iteration:number;evaluation:RenderedVisualEvaluation;actionIds:readonly string[]}>;
export type RenderedVisualQualityLoopResult=Readonly<{status:"passed"|"max-iterations";blueprint:BuilderBlueprint;evaluation:RenderedVisualEvaluation;iterations:readonly RenderedVisualIteration[];maxIterations:3;sourceBlueprintMutated:false;deterministic:true}>;

export async function runRenderedVisualQualityLoop(input:{blueprint:BuilderBlueprint;render:RenderBlueprintForVisualQuality;maxIterations?:number}):Promise<RenderedVisualQualityLoopResult>{
  const maximum=Math.max(1,Math.min(3,input.maxIterations??3));let blueprint=input.blueprint;const iterations:RenderedVisualIteration[]=[];let evaluation:RenderedVisualEvaluation|undefined;
  for(let iteration=1;iteration<=maximum;iteration++){const screenshots=await input.render(blueprint,iteration);evaluation=evaluateRenderedVisualQuality({blueprint,screenshots});const actions=evaluation.passed?[]:evaluation.repairActions;iterations.push(Object.freeze({iteration,evaluation,actionIds:Object.freeze(actions.map((item)=>item.id))}));if(evaluation.passed||iteration===maximum)break;blueprint=compileRenderedVisualRepairs(blueprint,actions);}
  return Object.freeze({status:evaluation!.passed?"passed":"max-iterations",blueprint,evaluation:evaluation!,iterations:Object.freeze(iterations),maxIterations:3,sourceBlueprintMutated:false,deterministic:true});
}

