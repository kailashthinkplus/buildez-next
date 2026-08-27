"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, CalendarDays, Clock3, Download, Eye, Globe2, Loader2, MousePointer2, Radio, RefreshCw, Sparkles, Users, type LucideIcon } from "lucide-react";
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

type AnalyticsData = {
  site: { name: string; slug: string };
  totals: { pageViews: number; visitors: number; pageViewsChange: number; visitorsChange: number; sessions: number; avgSessionSeconds: number; bounceRate: number; clicks: number; conversions: number };
  liveVisitors: number;
  trend: Array<{ date: string; pageViews: number; visitors: number }>;
  pages: Array<{ path: string; pageViews: number; visitors: number }>;
  sources: Array<{ name: string; pageViews: number; visitors: number }>;
  countries: Array<{ country: string; pageViews: number; visitors: number }>;
  devices: Array<{ device: string; pageViews: number }>;
  liveActivity: Array<{ path: string; city: string; country: string; createdAt: string }>;
  clicks: Array<{ path: string; metadata: unknown; createdAt: string }>;
  heatmapPages: Array<{ id: string; title: string; slug: string; screenshotUrl: string | null; liveUrl: string }>;
};
type GlobeLocation = { name: string; country: string; lat: number; lon: number; visitors: number; color: string };
const ranges = { "Last 7 days": 7, "Last 30 days": 30, "Last 90 days": 90 } as const;
type RangeChoice = keyof typeof ranges | "Custom range";
const palette = ["#3b82f6", "#72f6ff", "#ffcf4a", "#a67cff", "#6dff9b", "#ff756d", "#f472b6", "#22d3ee"];
const countryCenters: Record<string, [number, number]> = {
  "United States": [39.8, -98.6], "United Kingdom": [54.7, -3.4], India: [22.6, 79.0], Singapore: [1.35, 103.82], Australia: [-25.3, 133.8], Brazil: [-10.8, -52.9], Canada: [56.1, -106.3], Germany: [51.2, 10.4], France: [46.2, 2.2], Japan: [36.2, 138.3], China: [35.9, 104.2], Netherlands: [52.1, 5.3], Spain: [40.5, -3.7], Italy: [42.8, 12.8], "United Arab Emirates": [23.4, 53.8], Indonesia: [-0.8, 113.9], Philippines: [12.9, 121.8], Malaysia: [4.2, 101.98], "South Africa": [-30.6, 22.9], Mexico: [23.6, -102.5],
};

export default function AnalyticsPage() {
  const { siteSlug } = useParams<{siteSlug:string}>();
  const [range,setRange] = useState<RangeChoice>("Last 30 days");
  const today = new Date().toISOString().slice(0,10);
  const [from,setFrom] = useState(new Date(Date.now()-29*86400000).toISOString().slice(0,10));
  const [to,setTo] = useState(today);
  const [tab,setTab] = useState<"overview"|"live"|"heatmap">("overview");
  const [device,setDevice] = useState<"Desktop"|"Mobile">("Desktop");
  const [data,setData] = useState<AnalyticsData>();
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const locations = useMemo(() => toGlobeLocations(data?.countries || []), [data?.countries]);
  const [selectedCity,setSelectedCity] = useState<GlobeLocation>();
  useEffect(() => { if (locations.length && !locations.some(location => location.name === selectedCity?.name)) setSelectedCity(locations[0]); }, [locations, selectedCity?.name]);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const query = range === "Custom range"
        ? `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        : `days=${ranges[range]}`;
      const response = await fetch(`/api/analytics/${encodeURIComponent(siteSlug)}?${query}`, { cache: "no-store" });
      const raw = await response.text();
      let payload: AnalyticsData | { error?: string; message?: string } | null = null;
      if (raw) { try { payload = JSON.parse(raw); } catch { throw new Error(`Analytics returned an invalid response (${response.status})`); } }
      if (!response.ok) throw new Error((payload && "message" in payload && payload.message) || (payload && "error" in payload && payload.error) || `Could not load analytics (${response.status})`);
      if (!payload) throw new Error("Analytics returned an empty response. Please retry.");
      setData(payload as AnalyticsData);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load analytics"); }
    finally { setLoading(false); }
  }, [from, range, siteSlug, to]);
  useEffect(() => { void load(); }, [load]);
  const exportCsv = () => {
    if (!data) return;
    const csv = [["Date","Visitors","Page views"], ...data.trend.map(item => [item.date,item.visitors,item.pageViews])].map(row => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${siteSlug}-analytics.csv`; anchor.click(); URL.revokeObjectURL(url);
  };

  return <div className="analytics-engine mx-auto max-w-[1560px] pb-12">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><div className="flex items-center gap-2 text-sm dashboard-muted"><span className="analytics-live-dot"/> AI Analytics <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">TRACKING</span></div><h1 className="mt-1 text-2xl font-semibold tracking-[-.04em]">See your website in motion.</h1><p className="mt-1 text-sm dashboard-muted">Live traffic, audience and behavior intelligence for {data?.site.name || "your website"}.</p></div>
      <div className="flex flex-wrap gap-2"><label className="dashboard-control flex items-center gap-2 border dashboard-border px-3 text-sm"><CalendarDays size={15}/><select value={range} onChange={event=>setRange(event.target.value as RangeChoice)} className="bg-transparent outline-none">{Object.keys(ranges).map(value=><option key={value}>{value}</option>)}<option>Custom range</option></select></label>{range === "Custom range" ? <div className="dashboard-control flex items-center gap-2 border dashboard-border px-3 text-xs"><label className="flex items-center gap-1.5"><span className="dashboard-faint">From</span><input type="date" value={from} max={to} onChange={event=>setFrom(event.target.value)} className="bg-transparent outline-none"/></label><span className="dashboard-faint">—</span><label className="flex items-center gap-1.5"><span className="dashboard-faint">To</span><input type="date" value={to} min={from} max={today} onChange={event=>setTo(event.target.value)} className="bg-transparent outline-none"/></label></div> : null}<button className="dashboard-control flex items-center gap-2 border dashboard-border px-3 text-sm" disabled={!data} onClick={exportCsv}><Download size={15}/> Export CSV</button><button className="dashboard-control border dashboard-border p-2" onClick={()=>void load()} aria-label="Refresh analytics"><RefreshCw size={15}/></button></div>
    </header>

    <nav className="analytics-tabs mb-5 inline-flex rounded-xl border dashboard-border p-1" aria-label="Analytics views">
      {(["overview","live","heatmap"] as const).map(v=><button data-track key={v} onClick={()=>setTab(v)} className={tab===v?"active":""}>{v==="heatmap"?"Behavior heatmap":v[0].toUpperCase()+v.slice(1)}</button>)}
    </nav>

    {error && <div className="mb-5 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-500">{error}</div>}
    {loading ? <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-500"/></div> : data && <div key={tab} className="analytics-view">
    {tab === "heatmap" ? <Heatmap device={device} setDevice={setDevice} clicks={data.clicks} totalClicks={data.totals.clicks} pages={data.heatmapPages || []}/> : <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="Unique visitors" value={formatNumber(data.totals.visitors)} change={data.totals.visitorsChange} color="violet" spark={data.trend.map(item=>item.visitors)}/>
        <Metric icon={Eye} label="Page views" value={formatNumber(data.totals.pageViews)} change={data.totals.pageViewsChange} color="blue" spark={data.trend.map(item=>item.pageViews)}/>
        <Metric icon={Clock3} label="Avg. session" value={formatDuration(data.totals.avgSessionSeconds)} change={null} color="cyan" spark={data.trend.map(item=>item.visitors)}/>
        <Metric icon={MousePointer2} label="Bounce rate" value={`${data.totals.bounceRate}%`} change={null} color="lime" spark={data.trend.map(item=>item.pageViews)}/>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <GlobePanel live={data.liveVisitors} locations={locations} selected={selectedCity} onSelect={setSelectedCity}/>
        <LiveFeed live={data.liveVisitors} rows={data.liveActivity} sessions={data.totals.sessions} visitors={data.totals.visitors}/>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.28fr_.72fr]">
        <TrafficChart trend={data.trend}/>
        <Sources sources={data.sources}/>
      </section>
    </>}
    </div>}
  </div>
}

function Metric({icon:Icon,label,value,change,color,spark}:{icon:LucideIcon;label:string;value:string;change:number|null;color:string;spark:number[]}){const positive=(change??0)>=0;return <article className={`analytics-metric metric-glow-${color} dashboard-card rounded-2xl p-5`}><div className="flex items-center justify-between"><span className={`analytics-icon analytics-icon-${color}`}><Icon size={18}/></span>{change!==null&&<span className={`flex items-center text-xs font-semibold ${positive?"text-emerald-600 dark:text-emerald-300":"text-rose-500"}`}>{positive?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>} {Math.abs(change)}%</span>}</div><div className="mt-5 flex items-end justify-between gap-2"><div><strong className="text-2xl tracking-tight">{value}</strong><p className="mt-1 text-xs dashboard-muted">{label}</p></div><MiniSpark data={spark} color={color}/></div></article>}
function MiniSpark({data,color}:{data:number[];color:string}){const values=data.slice(-7),max=Math.max(1,...values),pts=values.length>1?values.map((v,i)=>`${(i/(values.length-1))*78},${36-(v/max)*30}`).join(" "):"0,34 78,34";return <svg viewBox="0 0 80 38" className={`h-10 w-20 spark-${color}`} aria-hidden="true"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}

function GlobePanel({live,locations,selected,onSelect}:{live:number;locations:GlobeLocation[];selected?:GlobeLocation;onSelect:(c:GlobeLocation)=>void}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const rotation=useRef({x:-.18,y:-1.05,v:.0015,drag:false,lastX:0,lastY:0,moved:false});
  useEffect(()=>{
    const el=canvas.current;if(!el)return;const ctx=el.getContext("2d")!;let raf=0;let projected:{city:GlobeLocation,x:number,y:number,z:number}[]=[];
    const point=(lat:number,lon:number,r:number,cx:number,cy:number)=>{const phi=lat*Math.PI/180,theta=lon*Math.PI/180+rotation.current.y;const x=Math.cos(phi)*Math.sin(theta),y=-Math.sin(phi);let z=Math.cos(phi)*Math.cos(theta);const yy=y*Math.cos(rotation.current.x)-z*Math.sin(rotation.current.x);z=y*Math.sin(rotation.current.x)+z*Math.cos(rotation.current.x);return{x:cx+x*r,y:cy+yy*r,z}};
    const draw=()=>{const dpr=Math.min(devicePixelRatio,2),w=el.clientWidth,h=el.clientHeight;if(el.width!==w*dpr||el.height!==h*dpr){el.width=w*dpr;el.height=h*dpr}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);if(!rotation.current.drag)rotation.current.y+=rotation.current.v;const r=Math.min(w,h)*.37,cx=w*.5,cy=h*.51;
      const glow=ctx.createRadialGradient(cx-r*.25,cy-r*.3,r*.06,cx,cy,r*1.16);glow.addColorStop(0,"rgba(94,224,255,.28)");glow.addColorStop(.55,"rgba(104,78,255,.12)");glow.addColorStop(1,"rgba(82,68,255,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,r*1.16,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=document.documentElement.classList.contains("dark")?"rgba(8,12,31,.72)":"rgba(226,245,250,.94)";ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
      for(let lat=-84;lat<=84;lat+=6)for(let lon=-180;lon<180;lon+=6){const p=point(lat,lon,r,cx,cy);if(p.z<0)continue;ctx.fillStyle=`rgba(99,155,196,${.055+p.z*.09})`;ctx.beginPath();ctx.arc(p.x,p.y,.7,0,Math.PI*2);ctx.fill()}
      for(const [lon,lat] of landPoints){const p=point(lat,lon,r,cx,cy);if(p.z<=.015)continue;const alpha=.22+p.z*.58;ctx.fillStyle=document.documentElement.classList.contains("dark")?`rgba(62,190,229,${alpha})`:`rgba(25,151,196,${alpha})`;ctx.beginPath();ctx.arc(p.x,p.y,1.15+p.z*.72,0,Math.PI*2);ctx.fill()}
      projected=locations.map(city=>({city,...point(city.lat,city.lon,r,cx,cy)}));projected.filter(p=>p.z>0).sort((a,b)=>a.z-b.z).forEach(p=>{const chosen=p.city.name===selected?.name,sz=chosen?7:5;ctx.shadowColor=p.city.color;ctx.shadowBlur=chosen?22:14;ctx.fillStyle=p.city.color;ctx.beginPath();ctx.arc(p.x,p.y,sz,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=`${p.city.color}66`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,sz+5+(Math.sin(Date.now()/420)*2),0,Math.PI*2);ctx.stroke();ctx.font=`${chosen?'600':'500'} ${chosen?12:10}px Inter, sans-serif`;const label=p.city.name,tw=ctx.measureText(label).width;ctx.fillStyle=document.documentElement.classList.contains("dark")?"rgba(7,12,25,.82)":"rgba(255,255,255,.9)";ctx.beginPath();ctx.roundRect(p.x+10,p.y-10,tw+12,20,6);ctx.fill();ctx.fillStyle=document.documentElement.classList.contains("dark")?"#eaf4ff":"#17304f";ctx.fillText(label,p.x+16,p.y+4)});raf=requestAnimationFrame(draw)};
    const down=(e:PointerEvent)=>{rotation.current.drag=true;rotation.current.lastX=e.clientX;rotation.current.lastY=e.clientY;rotation.current.moved=false;el.setPointerCapture(e.pointerId)};
    const move=(e:PointerEvent)=>{if(!rotation.current.drag)return;const dx=e.clientX-rotation.current.lastX,dy=e.clientY-rotation.current.lastY;if(Math.abs(dx)+Math.abs(dy)>2)rotation.current.moved=true;rotation.current.y+=dx*.008;rotation.current.x=Math.max(-1.1,Math.min(1.1,rotation.current.x-dy*.006));rotation.current.v=dx*.00015;rotation.current.lastX=e.clientX;rotation.current.lastY=e.clientY};
    const up=(e:PointerEvent)=>{rotation.current.drag=false;if(!rotation.current.moved){const box=el.getBoundingClientRect(),x=e.clientX-box.left,y=e.clientY-box.top;const hit=projected.filter(p=>p.z>0).sort((a,b)=>(a.x-x)**2+(a.y-y)**2-((b.x-x)**2+(b.y-y)**2))[0];if(hit&&Math.hypot(hit.x-x,hit.y-y)<24)onSelect(hit.city)}};
    el.addEventListener("pointerdown",down);el.addEventListener("pointermove",move);el.addEventListener("pointerup",up);draw();return()=>{cancelAnimationFrame(raf);el.removeEventListener("pointerdown",down);el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up)}
  },[locations,onSelect,selected?.name]);
  return <article className="globe-card dashboard-card relative min-h-[500px] overflow-hidden rounded-2xl"><div className="absolute left-5 top-5 z-10 pointer-events-none"><div className="flex items-center gap-2"><Globe2 size={18} className="text-cyan-500"/><h2 className="font-semibold">Visitors worldwide</h2></div><p className="mt-1 text-xs dashboard-muted">Drag to explore · points use recorded visitor countries</p></div><div className="absolute right-5 top-5 z-10 rounded-xl border dashboard-border bg-white/70 px-3 py-2 text-right backdrop-blur-xl dark:bg-black/30"><strong className="text-xl">{live}</strong><p className="text-[10px] dashboard-muted">active in 5 min</p></div><canvas ref={canvas} className="globe-canvas absolute inset-0 h-full w-full" aria-label="Interactive globe showing website visitors"/>{selected?<div className="globe-tooltip absolute bottom-5 left-5 right-5 z-10 flex items-center gap-3 rounded-xl border dashboard-border p-3 backdrop-blur-xl"><span className="h-3 w-3 rounded-full" style={{background:selected.color,boxShadow:`0 0 16px ${selected.color}`}}/><div><p className="text-sm font-semibold">{selected.name}</p><p className="text-[11px] dashboard-muted">Recorded location</p></div><div className="ml-auto text-right"><p className="text-sm font-semibold">{selected.visitors}</p><p className="text-[10px] dashboard-muted">visitors</p></div></div>:<div className="globe-tooltip absolute bottom-5 left-5 right-5 z-10 rounded-xl border dashboard-border p-3 text-center text-xs dashboard-muted backdrop-blur-xl">Visitor locations will appear here as analytics data is collected.</div>}</article>
}

function LiveFeed({live,rows,sessions,visitors}:{live:number;rows:AnalyticsData["liveActivity"];sessions:number;visitors:number}){return <article className="dashboard-card rounded-2xl p-5"><div className="flex items-center justify-between"><div><h2 className="flex items-center gap-2 font-semibold"><Radio size={16} className="text-blue-500"/>Live activity</h2><p className="mt-1 text-xs dashboard-muted">Recorded page views from the last five minutes</p></div><span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-500">{live}</span></div><div className="mt-5 space-y-1">{rows.length?rows.slice(0,7).map((row,index)=><div key={`${row.createdAt}-${index}`} className="live-row flex items-center gap-3 rounded-xl p-3"><span className="relative h-2.5 w-2.5 rounded-full" style={{background:palette[index%palette.length],boxShadow:`0 0 10px ${palette[index%palette.length]}`}}/><div className="min-w-0"><p className="text-sm font-medium">{row.city||row.country}</p><p className="truncate text-[11px] dashboard-muted">Viewed {row.path}</p></div><span className="ml-auto text-[10px] dashboard-faint">{relativeTime(row.createdAt)}</span></div>):<p className="py-16 text-center text-xs dashboard-muted">No visitors active in the last five minutes.</p>}</div><div className="mt-4 grid grid-cols-2 gap-2"><SmallStat label="Sessions" value={formatNumber(sessions)}/><SmallStat label="Unique visitors" value={formatNumber(visitors)}/></div></article>}
function SmallStat({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-black/[.035] p-3 dark:bg-white/[.04]"><p className="text-lg font-semibold">{value}</p><p className="text-[10px] dashboard-muted">{label}</p></div>}

function TrafficChart({trend}:{trend:AnalyticsData["trend"]}){const max=Math.max(1,...trend.flatMap(item=>[item.visitors,item.pageViews])),position=(value:number,index:number)=>`${trend.length>1?(index/(trend.length-1))*100:0},${100-(value/max)*82}`,visitorPoints=trend.map((item,index)=>position(item.visitors,index)).join(" "),viewPoints=trend.map((item,index)=>position(item.pageViews,index)).join(" ");const labels=[trend[0],trend[Math.floor((trend.length-1)/2)],trend[trend.length-1]].filter(Boolean);return <article className="dashboard-card rounded-2xl p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">Visitor trends</h2><p className="mt-1 text-xs dashboard-muted">Recorded visitors and page views over time</p></div><div className="flex gap-4 text-xs"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-violet-500"/>Visitors</span><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-400"/>Page views</span></div></div><div className="mt-8 h-56"><svg viewBox="0 0 100 105" preserveAspectRatio="none" className="h-full w-full overflow-visible"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8b5cf6" stopOpacity=".35"/><stop offset="1" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient></defs>{[20,40,60,80,100].map(y=><line key={y} x1="0" x2="100" y1={y} y2={y} className="chart-grid"/>)}<polygon points={`0,100 ${visitorPoints} 100,100`} fill="url(#area)"/><polyline points={visitorPoints} fill="none" stroke="#9b78ff" strokeWidth="1.7" vectorEffect="non-scaling-stroke"/><polyline points={viewPoints} fill="none" stroke="#41d9ef" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/></svg></div><div className="mt-2 flex justify-between text-[10px] dashboard-faint">{labels.map(item=><span key={item.date}>{formatDate(item.date)}</span>)}</div></article>}
function Sources({sources}:{sources:AnalyticsData["sources"]}){const total=Math.max(1,sources.reduce((sum,item)=>sum+item.pageViews,0));return <article className="dashboard-card rounded-2xl p-5"><div className="flex items-start justify-between"><div><h2 className="font-semibold">Traffic sources</h2><p className="mt-1 text-xs dashboard-muted">Where visitors discover you</p></div><MousePointer2 size={17} className="dashboard-muted"/></div><div className="mt-5 space-y-4">{sources.length?sources.slice(0,6).map((source,index)=>{const share=Math.round((source.pageViews/total)*100);const color=palette[index%palette.length];return <div key={source.name}><div className="mb-1.5 flex text-xs"><span className="font-medium">{source.name}</span><span className="ml-auto dashboard-muted">{formatNumber(source.pageViews)} · {share}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/[.05]"><div className="h-full rounded-full" style={{width:`${share}%`,background:color,boxShadow:`0 0 10px ${color}`}}/></div></div>}):<p className="py-16 text-center text-xs dashboard-muted">No source data recorded yet.</p>}</div></article>}

function Heatmap({device,setDevice,clicks,totalClicks,pages}:{device:"Desktop"|"Mobile";setDevice:(d:"Desktop"|"Mobile")=>void;clicks:AnalyticsData["clicks"];totalClicks:number;pages:AnalyticsData["heatmapPages"]}) {
  const byPath=new Map<string,number>();
  clicks.forEach(click=>byPath.set(click.path,(byPath.get(click.path)||0)+1));
  const top=[...byPath].sort((a,b)=>b[1]-a[1]).slice(0,4);
  const [pageId,setPageId]=useState("");
  const selectedPage=pages.find(page=>page.id===pageId) || pages.find(page=>top[0]?.[0].endsWith(page.slug)) || pages[0];
  const pageClicks=selectedPage ? clicks.filter(click=>selectedPage.slug==="home" ? click.path===selectedPage.liveUrl || click.path.endsWith(`/published-preview/${selectedPage.id}`) : click.path.endsWith(`/${selectedPage.slug}`)) : clicks;
  const points=pageClicks.map(click=>click.metadata).filter((value):value is Record<string,unknown>=>Boolean(value)&&typeof value==="object").map(value=>({x:Number(value.xPercent),y:Number(value.yPercent)})).filter(point=>Number.isFinite(point.x)&&Number.isFinite(point.y));
  return <section className="grid gap-5 xl:grid-cols-[1fr_290px]">
    <article className="dashboard-card rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold"><MousePointer2 size={17} className="text-blue-500"/>Click heatmap</h2><p className="mt-1 text-xs dashboard-muted">Real published-page imagery with recorded click positions</p></div><div className="flex items-center gap-2">{pages.length ? <select value={selectedPage?.id||""} onChange={event=>setPageId(event.target.value)} className="dashboard-input rounded-lg px-2 py-1.5 text-xs">{pages.map(page=><option key={page.id} value={page.id}>{page.title}</option>)}</select> : null}<div className="flex rounded-lg bg-black/[.04] p-1 dark:bg-white/[.04]">{(['Desktop','Mobile'] as const).map(d=><button key={d} onClick={()=>setDevice(d)} className={`heat-device ${device===d?'active':''}`}>{d}</button>)}</div></div></div>
      <div className={`heatmap-browser relative mx-auto mt-6 overflow-hidden rounded-xl border dashboard-border ${device==='Mobile'?'mobile':''}`}>
        <div className="flex h-9 items-center gap-1.5 border-b dashboard-border px-3"><i/><i/><i/><span className="truncate">{selectedPage?.title || "Published website"}</span></div>
        <div className="relative aspect-[3/4] overflow-hidden bg-white sm:aspect-[16/10]">
          {selectedPage?.screenshotUrl ? <img src={selectedPage.screenshotUrl} alt={`${selectedPage.title} website screenshot`} className="h-full w-full object-cover object-top"/> : selectedPage ? <iframe src={selectedPage.liveUrl} title={`${selectedPage.title} live website snapshot`} className="pointer-events-none h-[200%] w-[200%] origin-top-left scale-50 border-0 bg-white"/> : <div className="grid h-full place-items-center p-8 text-center text-sm dashboard-muted">Publish a page to create its heatmap surface.</div>}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(15,23,42,.06))]"/>
          {points.map((point,index)=><span key={index} className="heat-spot" style={{left:`${point.x}%`,top:`${point.y}%`,width:34,height:34,opacity:.62}}/>)}
          {!points.length&&selectedPage&&<div className="absolute inset-x-4 bottom-4 rounded-xl bg-slate-950/75 p-3 text-center text-xs text-white backdrop-blur">No position-aware clicks recorded for this page in the selected period.</div>}
        </div>
      </div>
    </article>
    <aside className="space-y-4"><div className="dashboard-card rounded-2xl p-5"><p className="text-xs dashboard-muted">Tracked interactions</p><p className="mt-2 text-3xl font-semibold">{formatNumber(totalClicks)}</p><p className="mt-2 text-xs dashboard-muted">During the selected period</p></div><div className="dashboard-card rounded-2xl p-5"><h3 className="text-sm font-semibold">Most-clicked pages</h3>{top.length?top.map(([path,count],index)=><Signal key={path} label={path} value={String(count)} hot={index===0}/>):<p className="mt-4 text-xs dashboard-muted">No click events recorded yet.</p>}</div><div className="heat-insight rounded-2xl border p-5"><Sparkles size={17}/><h3 className="mt-3 text-sm font-semibold">AI insight</h3><p className="mt-2 text-xs leading-5">{top[0]?`${top[0][0]} receives the most recorded clicks. Review this page first when optimizing the visitor journey.`:"Collect click activity to unlock page-specific behavior recommendations."}</p></div></aside>
  </section>;
}
function Signal({label,value,hot,down}:{label:string;value:string;hot?:boolean;down?:boolean}){return <div className="mt-4 flex items-center text-xs"><span className="dashboard-muted">{label}</span><span className={`ml-auto flex items-center font-semibold ${hot?'text-blue-500':down?'text-amber-500':''}`}>{down?<ArrowDownRight size={12}/>:null}{value}</span></div>}

function toGlobeLocations(countries: AnalyticsData["countries"]): GlobeLocation[] { return countries.flatMap((item,index)=>{const center=countryCenters[item.country];return center?[{name:item.country,country:item.country,lat:center[0],lon:center[1],visitors:item.visitors,color:palette[index%palette.length]}]:[];}); }
function formatNumber(value:number){return new Intl.NumberFormat("en",{notation:value>=10000?"compact":"standard",maximumFractionDigits:1}).format(value)}
function formatDuration(seconds:number){const minutes=Math.floor(seconds/60),remaining=seconds%60;return minutes?`${minutes}m ${remaining}s`:`${remaining}s`}
function formatDate(value:string){return new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(new Date(`${value}T00:00:00`))}
function relativeTime(value:string){const seconds=Math.max(0,Math.round((Date.now()-new Date(value).getTime())/1000));return seconds<10?"Now":seconds<60?`${seconds}s`: `${Math.floor(seconds/60)}m`}
