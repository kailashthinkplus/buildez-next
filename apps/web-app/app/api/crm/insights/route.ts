import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import OpenAI from "openai";
import { authorizedSite, notFound } from "../_auth";

type InsightLead = { status: string; score: number; source: string };

function computed(leads: InsightLead[]) {
  const total=leads.length, won=leads.filter(x=>x.status==="WON").length, newCount=leads.filter(x=>x.status==="NEW").length;
  const sources=Object.entries(leads.reduce<Record<string,number>>((a,l)=>(a[l.source]=(a[l.source]||0)+1,a),{})).sort((a,b)=>b[1]-a[1]);
  return [
    { title:"Pipeline health", insight: total ? `${newCount} of ${total} leads still need a first response. Prioritize high-score leads first.` : "Capture your first lead to begin building pipeline intelligence.", action:"Review new leads" },
    { title:"Conversion signal", insight: total ? `${Math.round(won/total*100)}% of recorded leads are won. Keep statuses current for more accurate forecasting.` : "No conversion history yet.", action:"Update lead statuses" },
    { title:"Best source", insight: sources[0] ? `${sources[0][0]} is your largest source with ${sources[0][1]} lead${sources[0][1]===1?"":"s"}.` : "Connect a form or integration to compare acquisition sources.", action:"View integrations" },
  ];
}
export async function GET(req: NextRequest) {
  const siteId=req.nextUrl.searchParams.get("siteId")||""; if(!await authorizedSite(req,siteId)) return notFound();
  const leads=await prisma.crmLead.findMany({where:{siteId},orderBy:{createdAt:"desc"},take:500,select:{status:true,score:true,source:true,createdAt:true,company:true,message:true}});
  const fallback=computed(leads); if(!process.env.OPENAI_API_KEY || leads.length<3) return NextResponse.json({insights:fallback,generatedBy:"analytics"});
  try {
    const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY,timeout:30_000,maxRetries:2});
    const summary={total:leads.length,statuses:leads.reduce<Record<string,number>>((a,l)=>(a[l.status]=(a[l.status]||0)+1,a),{}),sources:leads.reduce<Record<string,number>>((a,l)=>(a[l.source]=(a[l.source]||0)+1,a),{}),averageScore:Math.round(leads.reduce((a,l)=>a+l.score,0)/leads.length)};
    const result=await openai.chat.completions.create({model:process.env.OPENAI_CRM_MODEL||"gpt-4.1-mini",temperature:.2,response_format:{type:"json_object"},messages:[{role:"system",content:"You are a CRM analyst. Return JSON {insights:[{title,insight,action}]} with exactly 3 concise, specific, privacy-safe recommendations. Never invent data."},{role:"user",content:JSON.stringify(summary)}]});
    const parsed=JSON.parse(result.choices[0]?.message?.content||"{}");
    return NextResponse.json({insights:Array.isArray(parsed.insights)?parsed.insights.slice(0,3):fallback,generatedBy:"ai"});
  } catch { return NextResponse.json({insights:fallback,generatedBy:"analytics"}); }
}
