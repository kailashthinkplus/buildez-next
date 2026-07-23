export function createBuilderRuntimeScript(sessionId: string) {
  return `(() => {
  "use strict";
  const VERSION=1, SESSION=${JSON.stringify(sessionId)}, SELECTOR="[data-buildez-id]";
  const parentOriginParam=new URLSearchParams(location.search).get("__buildez_parent_origin");
  const referrerOrigin=document.referrer?new URL(document.referrer).origin:"";
  const PARENT_ORIGIN=parentOriginParam&&/^https?:\\/\\//.test(parentOriginParam)?new URL(parentOriginParam).origin:referrerOrigin;
  let edit=false, hovered=null, selected=null, editing=null,refreshFrame=0,lastBounds="";
  const hoverBox=box("hover"), selectedBox=box("selected");
  function box(kind){const el=document.createElement("div");el.dataset.buildezOverlay=kind;Object.assign(el.style,{position:"fixed",zIndex:"2147483646",pointerEvents:"none",display:"none",border:kind==="selected"?"2px solid #3b82f6":"1px solid #60a5fa",boxShadow:kind==="selected"?"0 0 0 1px rgba(255,255,255,.85)":""});const label=document.createElement("span");Object.assign(label.style,{position:"absolute",left:"-1px",top:"-22px",padding:"3px 7px",borderRadius:"4px 4px 0 0",background:"#2563eb",color:"#fff",font:"600 11px/16px ui-sans-serif,system-ui",whiteSpace:"nowrap"});el.append(label);document.documentElement.append(el);return el}
  function post(type,payload={}){if(PARENT_ORIGIN)parent.postMessage({version:VERSION,sessionId:SESSION,type,payload},PARENT_ORIGIN)}
  function target(value){return value instanceof Element?value.closest(SELECTOR):null}
  function bounds(el){const r=el.getBoundingClientRect();return {top:r.top,left:r.left,width:r.width,height:r.height}}
  function data(el){const parent=el.parentElement&&el.parentElement.closest(SELECTOR);return {elementId:el.dataset.buildezId,kind:el.dataset.buildezKind||"element",tagName:el.tagName.toLowerCase(),sourceFile:el.dataset.buildezSourceFile,sourceAnchor:el.dataset.buildezSourceAnchor,parentElementId:parent?.dataset.buildezId,textContent:(el.innerText||"").slice(0,2000),className:typeof el.className==="string"?el.className:"",editableCapabilities:(el.dataset.buildezCapabilities||"").split(",").filter(Boolean),projectRevision:Number(el.dataset.buildezRevision||0),bounds:bounds(el)}}
  function paint(box,el){if(!edit||!el||!document.contains(el)){box.style.display="none";return}const r=el.getBoundingClientRect();Object.assign(box.style,{display:"block",transform:"translate("+r.left+"px,"+r.top+"px)",width:r.width+"px",height:r.height+"px"});box.firstElementChild.textContent=el.tagName.toLowerCase()}
  function refresh(){refreshFrame=0;paint(hoverBox,hovered);paint(selectedBox,selected);if(selected){const payload=data(selected),signature=JSON.stringify(payload.bounds);if(signature!==lastBounds){lastBounds=signature;post("BUILDEZ_ELEMENT_BOUNDS_CHANGED",payload)}}else lastBounds=""}
  function scheduleRefresh(){if(!refreshFrame)refreshFrame=requestAnimationFrame(refresh)}
  document.addEventListener("pointerover",e=>{if(!edit||editing)return;const next=target(e.target);if(next===hovered)return;hovered=next;paint(hoverBox,hovered);if(next)post("BUILDEZ_ELEMENT_HOVERED",data(next))},true);
  document.addEventListener("pointerout",e=>{if(!edit)return;if(target(e.relatedTarget)===hovered)return;hovered=null;paint(hoverBox,null)},true);
  document.addEventListener("click",e=>{if(!edit)return;const next=target(e.target);if(!next)return;e.preventDefault();e.stopPropagation();selected=next;paint(selectedBox,selected);post("BUILDEZ_ELEMENT_SELECTED",data(selected))},true);
  document.addEventListener("dblclick",e=>{if(!edit)return;const next=target(e.target);if(!next||(next.dataset.buildezCapabilities||"").split(",").indexOf("text")<0)return;e.preventDefault();editing=next;next.contentEditable="true";next.focus();document.execCommand("selectAll",false);},true);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&editing){editing.textContent=editing.dataset.buildezOriginal||editing.textContent;finish(false)}if((e.metaKey||e.ctrlKey)&&e.key==="Enter"&&editing)finish(true)},true);
  document.addEventListener("focusin",e=>{if(editing===e.target)editing.dataset.buildezOriginal=editing.textContent||""},true);
  document.addEventListener("focusout",e=>{if(editing===e.target)finish(true)},true);
  function finish(commit){if(!editing)return;const el=editing;el.contentEditable="false";editing=null;if(commit)post("BUILDEZ_INLINE_EDIT_COMMITTED",{...data(el),value:el.textContent||""})}
  addEventListener("message",e=>{if(!PARENT_ORIGIN||e.origin!==PARENT_ORIGIN||e.source!==parent)return;const m=e.data;if(!m||m.version!==VERSION||m.sessionId!==SESSION)return;
    if(m.type==="BUILDEZ_EDIT_MODE_CHANGED"){edit=m.payload?.mode==="edit";document.documentElement.dataset.buildezMode=edit?"edit":"preview";if(!edit){hovered=null;selected=null}scheduleRefresh()}
    else if(m.type==="BUILDEZ_REQUEST_PARENT_SELECTION"&&selected){const p=selected.parentElement?.closest(SELECTOR);if(p){selected=p;scheduleRefresh();post("BUILDEZ_ELEMENT_SELECTED",data(p))}}
    else if(m.type==="BUILDEZ_SELECTION_CLEARED"){selected=null;scheduleRefresh();post("BUILDEZ_SELECTION_CLEARED",{})}
    else if(m.type==="BUILDEZ_SCROLL_TO_ELEMENT"&&selected)selected.scrollIntoView({behavior:"smooth",block:"center"})
  });
  new ResizeObserver(scheduleRefresh).observe(document.documentElement);
  new MutationObserver(records=>{if(records.some(record=>!(record.target instanceof Element)||!record.target.closest("[data-buildez-overlay]")))scheduleRefresh()}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["class","src","hidden"]});
  addEventListener("scroll",scheduleRefresh,true);addEventListener("resize",scheduleRefresh);
  post("BUILDEZ_PREVIEW_READY",{route:location.pathname});post("BUILDEZ_ROUTE_CHANGED",{route:location.pathname});
})();`;
}
