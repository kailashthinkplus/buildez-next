"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, CalendarDays, ChevronDown, Clock3, Download, Eye, Globe2, MousePointer2, Radio, Sparkles, Users, type LucideIcon } from "lucide-react";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesTopology from "world-atlas/countries-110m.json";

const worldCountries = feature(
  countriesTopology as unknown as Topology,
  countriesTopology.objects.countries as unknown as GeometryCollection,
);

const landPoints: [number, number][] = [];
for (let lat = -84; lat <= 84; lat += 3) {
  for (let lon = -180; lon < 180; lon += 3) {
    if (geoContains(worldCountries, [lon, lat])) landPoints.push([lon, lat]);
  }
}

const cities = [
  { name: "San Francisco", country: "United States", lat: 37.77, lon: -122.42, visitors: 428, color: "#3b82f6" },
  { name: "London", country: "United Kingdom", lat: 51.51, lon: -.13, visitors: 312, color: "#72f6ff" },
  { name: "Mumbai", country: "India", lat: 19.08, lon: 72.88, visitors: 286, color: "#ffcf4a" },
  { name: "Singapore", country: "Singapore", lat: 1.35, lon: 103.82, visitors: 194, color: "#a67cff" },
  { name: "Sydney", country: "Australia", lat: -33.87, lon: 151.21, visitors: 118, color: "#6dff9b" },
  { name: "São Paulo", country: "Brazil", lat: -23.55, lon: -46.63, visitors: 96, color: "#ff756d" },
];

const trend = [22,28,25,34,30,42,39,49,46,57,51,62,59,71,66,79,73,88,82,93,86,98,91,104];
const heatPoints = Array.from({length: 34}, (_,i) => ({ x: 8 + ((i*37)%84), y: 10 + ((i*53)%77), s: 18 + ((i*11)%35), o: .35 + (i%5)*.1 }));

export default function AnalyticsPage() {
  const [range,setRange] = useState("Last 30 days");
  const [tab,setTab] = useState<"overview"|"live"|"heatmap">("overview");
  const [device,setDevice] = useState<"Desktop"|"Mobile">("Desktop");
  const [live,setLive] = useState(138);
  const [selectedCity,setSelectedCity] = useState(cities[2]);
  const [trackedClicks,setTrackedClicks] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setLive(v => Math.max(110, v + Math.round(Math.random()*8-4))), 2600);
    const stored = Number(localStorage.getItem("buildez-analytics-clicks") || 0);
    queueMicrotask(() => setTrackedClicks(stored));
    const track = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-track]")) return;
      setTrackedClicks(v => { const next=v+1; localStorage.setItem("buildez-analytics-clicks",String(next)); return next; });
    };
    document.addEventListener("click",track);
    return () => { window.clearInterval(id); document.removeEventListener("click",track); };
  },[]);

  return <div className="analytics-engine mx-auto max-w-[1560px] pb-12">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><div className="flex items-center gap-2 text-sm dashboard-muted"><span className="analytics-live-dot"/> Analytics engine <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">TRACKING</span></div><h1 className="mt-1 text-2xl font-semibold tracking-[-.04em]">See your website in motion.</h1><p className="mt-1 text-sm dashboard-muted">Traffic, audience and behavior insights in one place.</p></div>
      <div className="flex flex-wrap gap-2"><button data-track className="dashboard-control flex items-center gap-2 border dashboard-border px-3 text-sm"><CalendarDays size={15}/>{range}<ChevronDown size={14}/></button><button data-track className="dashboard-control flex items-center gap-2 border dashboard-border px-3 text-sm" onClick={()=>setRange(range==="Last 30 days"?"Last 7 days":"Last 30 days")}><Download size={15}/> Export</button></div>
    </header>

    <nav className="analytics-tabs mb-5 inline-flex rounded-xl border dashboard-border p-1" aria-label="Analytics views">
      {(["overview","live","heatmap"] as const).map(v=><button data-track key={v} onClick={()=>setTab(v)} className={tab===v?"active":""}>{v==="heatmap"?"Behavior heatmap":v[0].toUpperCase()+v.slice(1)}</button>)}
    </nav>

    <div key={tab} className="analytics-view">
    {tab === "heatmap" ? <Heatmap device={device} setDevice={setDevice} clicks={trackedClicks}/> : <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="Unique visitors" value="48,291" change="18.4%" color="violet" spark={[18,24,21,32,29,44,48]}/>
        <Metric icon={Eye} label="Page views" value="96,842" change="12.1%" color="blue" spark={[12,17,15,24,21,29,34]}/>
        <Metric icon={Clock3} label="Avg. session" value="2m 48s" change="8.6%" color="cyan" spark={[15,19,26,23,35,40,47]}/>
        <Metric icon={MousePointer2} label="Bounce rate" value="38.2%" change="4.1%" color="lime" spark={[35,32,34,29,27,25,22]}/>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <GlobePanel live={live} selected={selectedCity} onSelect={setSelectedCity}/>
        <LiveFeed live={live}/>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.28fr_.72fr]">
        <TrafficChart/>
        <Sources/>
      </section>
    </>}
    </div>
  </div>
}

function Metric({icon:Icon,label,value,change,color,spark}:{icon:LucideIcon;label:string;value:string;change:string;color:string;spark:number[]}){return <article data-track className={`analytics-metric metric-glow-${color} dashboard-card rounded-2xl p-5`}><div className="flex items-center justify-between"><span className={`analytics-icon analytics-icon-${color}`}><Icon size={18}/></span><span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-300"><ArrowUpRight size={13}/>{change}</span></div><div className="mt-5 flex items-end justify-between gap-2"><div><strong className="text-2xl tracking-tight">{value}</strong><p className="mt-1 text-xs dashboard-muted">{label}</p></div><MiniSpark data={spark} color={color}/></div></article>}
function MiniSpark({data,color}:{data:number[];color:string}){const pts=data.map((v,i)=>`${i*13},${42-v}`).join(" ");return <svg viewBox="0 0 80 38" className={`h-10 w-20 spark-${color}`} aria-hidden="true"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}

function GlobePanel({live,selected,onSelect}:{live:number;selected:typeof cities[number];onSelect:(c:typeof cities[number])=>void}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const rotation=useRef({x:-.18,y:-1.05,v:.0015,drag:false,lastX:0,lastY:0,moved:false});
  useEffect(()=>{
    const el=canvas.current;if(!el)return;const ctx=el.getContext("2d")!;let raf=0;let projected:{city:typeof cities[number],x:number,y:number,z:number}[]=[];
    const point=(lat:number,lon:number,r:number,cx:number,cy:number)=>{const phi=lat*Math.PI/180,theta=lon*Math.PI/180+rotation.current.y;const x=Math.cos(phi)*Math.sin(theta),y=-Math.sin(phi);let z=Math.cos(phi)*Math.cos(theta);const yy=y*Math.cos(rotation.current.x)-z*Math.sin(rotation.current.x);z=y*Math.sin(rotation.current.x)+z*Math.cos(rotation.current.x);return{x:cx+x*r,y:cy+yy*r,z}};
    const draw=()=>{const dpr=Math.min(devicePixelRatio,2),w=el.clientWidth,h=el.clientHeight;if(el.width!==w*dpr||el.height!==h*dpr){el.width=w*dpr;el.height=h*dpr}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);if(!rotation.current.drag)rotation.current.y+=rotation.current.v;const r=Math.min(w,h)*.37,cx=w*.5,cy=h*.51;
      const glow=ctx.createRadialGradient(cx-r*.25,cy-r*.3,r*.06,cx,cy,r*1.16);glow.addColorStop(0,"rgba(94,224,255,.28)");glow.addColorStop(.55,"rgba(104,78,255,.12)");glow.addColorStop(1,"rgba(82,68,255,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,r*1.16,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=document.documentElement.classList.contains("dark")?"rgba(8,12,31,.72)":"rgba(226,245,250,.94)";ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
      for(let lat=-84;lat<=84;lat+=6)for(let lon=-180;lon<180;lon+=6){const p=point(lat,lon,r,cx,cy);if(p.z<0)continue;ctx.fillStyle=`rgba(99,155,196,${.055+p.z*.09})`;ctx.beginPath();ctx.arc(p.x,p.y,.7,0,Math.PI*2);ctx.fill()}
      for(const [lon,lat] of landPoints){const p=point(lat,lon,r,cx,cy);if(p.z<=.015)continue;const alpha=.22+p.z*.58;ctx.fillStyle=document.documentElement.classList.contains("dark")?`rgba(62,190,229,${alpha})`:`rgba(25,151,196,${alpha})`;ctx.beginPath();ctx.arc(p.x,p.y,1.15+p.z*.72,0,Math.PI*2);ctx.fill()}
      projected=cities.map(city=>({city,...point(city.lat,city.lon,r,cx,cy)}));projected.filter(p=>p.z>0).sort((a,b)=>a.z-b.z).forEach(p=>{const chosen=p.city.name===selected.name,sz=chosen?7:5;ctx.shadowColor=p.city.color;ctx.shadowBlur=chosen?22:14;ctx.fillStyle=p.city.color;ctx.beginPath();ctx.arc(p.x,p.y,sz,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=`${p.city.color}66`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,sz+5+(Math.sin(Date.now()/420)*2),0,Math.PI*2);ctx.stroke();ctx.font=`${chosen?'600':'500'} ${chosen?12:10}px Inter, sans-serif`;const label=p.city.name,tw=ctx.measureText(label).width;ctx.fillStyle=document.documentElement.classList.contains("dark")?"rgba(7,12,25,.82)":"rgba(255,255,255,.9)";ctx.beginPath();ctx.roundRect(p.x+10,p.y-10,tw+12,20,6);ctx.fill();ctx.fillStyle=document.documentElement.classList.contains("dark")?"#eaf4ff":"#17304f";ctx.fillText(label,p.x+16,p.y+4)});raf=requestAnimationFrame(draw)};
    const down=(e:PointerEvent)=>{rotation.current.drag=true;rotation.current.lastX=e.clientX;rotation.current.lastY=e.clientY;rotation.current.moved=false;el.setPointerCapture(e.pointerId)};
    const move=(e:PointerEvent)=>{if(!rotation.current.drag)return;const dx=e.clientX-rotation.current.lastX,dy=e.clientY-rotation.current.lastY;if(Math.abs(dx)+Math.abs(dy)>2)rotation.current.moved=true;rotation.current.y+=dx*.008;rotation.current.x=Math.max(-1.1,Math.min(1.1,rotation.current.x-dy*.006));rotation.current.v=dx*.00015;rotation.current.lastX=e.clientX;rotation.current.lastY=e.clientY};
    const up=(e:PointerEvent)=>{rotation.current.drag=false;if(!rotation.current.moved){const box=el.getBoundingClientRect(),x=e.clientX-box.left,y=e.clientY-box.top;const hit=projected.filter(p=>p.z>0).sort((a,b)=>(a.x-x)**2+(a.y-y)**2-((b.x-x)**2+(b.y-y)**2))[0];if(hit&&Math.hypot(hit.x-x,hit.y-y)<24)onSelect(hit.city)}};
    el.addEventListener("pointerdown",down);el.addEventListener("pointermove",move);el.addEventListener("pointerup",up);draw();return()=>{cancelAnimationFrame(raf);el.removeEventListener("pointerdown",down);el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up)}
  },[onSelect,selected.name]);
  return <article className="globe-card dashboard-card relative min-h-[500px] overflow-hidden rounded-2xl"><div className="absolute left-5 top-5 z-10 pointer-events-none"><div className="flex items-center gap-2"><Globe2 size={18} className="text-cyan-500"/><h2 className="font-semibold">Live visitors worldwide</h2></div><p className="mt-1 text-xs dashboard-muted">Drag to explore · click a visitor point</p></div><div className="absolute right-5 top-5 z-10 rounded-xl border dashboard-border bg-white/70 px-3 py-2 text-right backdrop-blur-xl dark:bg-black/30"><strong className="text-xl">{live}</strong><p className="text-[10px] dashboard-muted">active now</p></div><canvas ref={canvas} className="globe-canvas absolute inset-0 h-full w-full" aria-label="Interactive globe showing live website visitors"/><div className="globe-tooltip absolute bottom-5 left-5 right-5 z-10 flex items-center gap-3 rounded-xl border dashboard-border p-3 backdrop-blur-xl"><span className="h-3 w-3 rounded-full" style={{background:selected.color,boxShadow:`0 0 16px ${selected.color}`}}/><div><p className="text-sm font-semibold">{selected.name}</p><p className="text-[11px] dashboard-muted">{selected.country}</p></div><div className="ml-auto text-right"><p className="text-sm font-semibold">{selected.visitors}</p><p className="text-[10px] dashboard-muted">visitors</p></div></div></article>
}

function LiveFeed({live}:{live:number}){const rows=[{city:"Mumbai",page:"/services",time:"Now",color:"#ffcf4a"},{city:"London",page:"/blog/design-systems",time:"4s",color:"#72f6ff"},{city:"New York",page:"/contact",time:"12s",color:"#3b82f6"},{city:"Singapore",page:"/work",time:"18s",color:"#a67cff"},{city:"Sydney",page:"/",time:"31s",color:"#6dff9b"}];return <article className="dashboard-card rounded-2xl p-5"><div className="flex items-center justify-between"><div><h2 className="flex items-center gap-2 font-semibold"><Radio size={16} className="text-blue-500"/>Live activity</h2><p className="mt-1 text-xs dashboard-muted">Page views as they happen</p></div><span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-500">{live}</span></div><div className="mt-5 space-y-1">{rows.map((r)=><div key={r.city} className="live-row flex items-center gap-3 rounded-xl p-3"><span className="relative h-2.5 w-2.5 rounded-full" style={{background:r.color,boxShadow:`0 0 10px ${r.color}`}}/><div className="min-w-0"><p className="text-sm font-medium">{r.city}</p><p className="truncate text-[11px] dashboard-muted">Viewed {r.page}</p></div><span className="ml-auto text-[10px] dashboard-faint">{r.time}</span></div>)}</div><div className="mt-4 grid grid-cols-2 gap-2"><SmallStat label="Pages per session" value="2.4"/><SmallStat label="New visitors" value="72%"/></div></article>}
function SmallStat({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-black/[.035] p-3 dark:bg-white/[.04]"><p className="text-lg font-semibold">{value}</p><p className="text-[10px] dashboard-muted">{label}</p></div>}

function TrafficChart(){const max=Math.max(...trend),points=trend.map((v,i)=>`${(i/(trend.length-1))*100},${100-(v/max)*82}`).join(" ");return <article className="dashboard-card rounded-2xl p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">Visitor trends</h2><p className="mt-1 text-xs dashboard-muted">Visitors and page views over time</p></div><div className="flex gap-4 text-xs"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-violet-500"/>Visitors</span><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-400"/>Page views</span></div></div><div className="mt-8 h-56"><svg viewBox="0 0 100 105" preserveAspectRatio="none" className="h-full w-full overflow-visible"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8b5cf6" stopOpacity=".35"/><stop offset="1" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient></defs>{[20,40,60,80,100].map(y=><line key={y} x1="0" x2="100" y1={y} y2={y} className="chart-grid"/>)}<polygon points={`0,100 ${points} 100,100`} fill="url(#area)"/><polyline points={points} fill="none" stroke="#9b78ff" strokeWidth="1.7" vectorEffect="non-scaling-stroke"/><polyline points={trend.map((v,i)=>`${(i/(trend.length-1))*100},${104-(v/max)*68-(i%4)*3}`).join(" ")} fill="none" stroke="#41d9ef" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/></svg></div><div className="mt-2 flex justify-between text-[10px] dashboard-faint"><span>Jun 15</span><span>Jun 22</span><span>Jun 29</span><span>Jul 6</span><span>Jul 14</span></div></article>}
function Sources(){const sources=[['Organic search','18,442','38%',38,'#a67cff'],['Direct','12,806','27%',27,'#41d9ef'],['Social','8,492','18%',18,'#2563eb'],['Email','4,821','10%',10,'#ffcf4a'],['Referrals','3,730','7%',7,'#6dff9b']];return <article className="dashboard-card rounded-2xl p-5"><div className="flex items-start justify-between"><div><h2 className="font-semibold">Traffic sources</h2><p className="mt-1 text-xs dashboard-muted">Where customers discover you</p></div><MousePointer2 size={17} className="dashboard-muted"/></div><div className="mt-5 space-y-4">{sources.map(s=><div key={s[0] as string}><div className="mb-1.5 flex text-xs"><span className="font-medium">{s[0]}</span><span className="ml-auto dashboard-muted">{s[1]} · {s[2]}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/[.05]"><div className="h-full rounded-full" style={{width:`${s[3]}%`,background:s[4] as string,boxShadow:`0 0 10px ${s[4]}`}}/></div></div>)}</div></article>}

function Heatmap({device,setDevice,clicks}:{device:"Desktop"|"Mobile";setDevice:(d:"Desktop"|"Mobile")=>void;clicks:number}){return <section className="grid gap-5 xl:grid-cols-[1fr_290px]"><article className="dashboard-card rounded-2xl p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold"><MousePointer2 size={17} className="text-blue-500"/>Click heatmap</h2><p className="mt-1 text-xs dashboard-muted">See exactly where visitors engage</p></div><div className="flex rounded-lg bg-black/[.04] p-1 dark:bg-white/[.04]">{(['Desktop','Mobile'] as const).map(d=><button data-track key={d} onClick={()=>setDevice(d)} className={`heat-device ${device===d?'active':''}`}>{d}</button>)}</div></div><div className={`heatmap-browser relative mx-auto mt-6 overflow-hidden rounded-xl border dashboard-border ${device==='Mobile'?'mobile':''}`}><div className="flex h-9 items-center gap-1.5 border-b dashboard-border px-3"><i/><i/><i/><span>yourstore.com</span></div><div className="heat-page"><div className="heat-nav"><b>FORMA</b><span>Shop &nbsp; New arrivals &nbsp; Stories</span><button>Bag (2)</button></div><div className="heat-hero"><p>NEW SEASON / 2026</p><h3>Objects for<br/>everyday rituals.</h3><button>Shop collection</button></div><div className="heat-products"><div/><div/><div/></div></div>{heatPoints.map((p,i)=><span key={i} className="heat-spot" style={{left:`${p.x}%`,top:`${p.y}%`,width:p.s,height:p.s,opacity:p.o}}/>)}</div></article><aside className="space-y-4"><div className="dashboard-card rounded-2xl p-5"><p className="text-xs dashboard-muted">Tracked interactions</p><p className="mt-2 text-3xl font-semibold">{(2847+clicks).toLocaleString()}</p><p className="mt-2 flex items-center text-xs text-emerald-500"><ArrowUpRight size={13}/> 16.3% this period</p></div><div className="dashboard-card rounded-2xl p-5"><h3 className="text-sm font-semibold">Engagement signals</h3><Signal label="Primary CTA" value="32.8%" hot/><Signal label="Product cards" value="24.1%"/><Signal label="Navigation" value="18.6%"/><Signal label="Dead clicks" value="4.2%" down/></div><div className="heat-insight rounded-2xl border p-5"><Sparkles size={17}/><h3 className="mt-3 text-sm font-semibold">AI insight</h3><p className="mt-2 text-xs leading-5">Your primary CTA gets 2.4× more clicks when visible above the fold. Consider moving the product grid higher on mobile.</p></div></aside></section>}
function Signal({label,value,hot,down}:{label:string;value:string;hot?:boolean;down?:boolean}){return <div className="mt-4 flex items-center text-xs"><span className="dashboard-muted">{label}</span><span className={`ml-auto flex items-center font-semibold ${hot?'text-blue-500':down?'text-amber-500':''}`}>{down?<ArrowDownRight size={12}/>:null}{value}</span></div>}
