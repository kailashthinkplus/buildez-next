export const NEGATIVE_SOURCE_CORPUS = Object.freeze([
  [
    "dynamic-import",
    "export default async()=>{await import('x');return <div/>}",
  ],
  ["hooks", "export default()=>{useEffect(()=>fetch('/x'),[]);return <div/>}"],
  ["external-import", "import x from 'external';export default()=> <div/>"],
  ["fetch", "export default()=> <div>{fetch('/x')}</div>"],
  ["environment", "export default()=> <div>{process.env.SECRET}</div>"],
  [
    "runtime-conditional",
    "export default({live})=> <div>{live?<b/>:<i/>}</div>",
  ],
  ["computed-class", "export default({tone})=> <div className={'bg-'+tone}/>"],
  ["unsafe-css", "export default()=> <style>{'body{display:none}'}</style>"],
  ["unsafe-url", "export default()=> <img src='https://example.com/x.png'/>"],
  ["unresolved-media", "export default({src})=> <video src={src}/>"],
] as const);
