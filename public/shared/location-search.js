export const normalise = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[-,]/g, ' ').replace(/\s+/g, ' ').trim();
const compact = value => normalise(value).replace(/\s/g, '');
const postcode = value => /^[a-z]{1,2}\d[a-z\d]?(?:\s*\d[a-z]{2})?$/i.test(value.trim());
function distance(a,b) {
 let prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=next;}return prev[b.length];
}
export function suggestLocations(records, query, limit=8) {
 const q=normalise(query);if(q.length<2)return [];
 const isPostcode=postcode(query),cq=compact(query);
 const outcode=cq.replace(/^([a-z]{1,2}\d[a-z\d]?)\d[a-z]{2}$/,'$1');
 const matches=[];
 for(const r of records){
  const n=normalise(r.name),l=normalise(r.label), aliases=r.name==='Newcastle upon Tyne'?['newcastle']:r.name==='Manchester'?['manch']:r.name==='Birmingham'?['brum']:[];
  let quality=n===q||l===q?0:n.startsWith(q)||l.startsWith(q)||aliases.some(a=>a.startsWith(q))?1:n.includes(q)||l.includes(q)?2:9;
  const districtMatch=isPostcode&&r.kind==='district'&&(compact(r.name)===outcode||compact(r.name).startsWith(cq));
  if(districtMatch)quality=0;
  if(quality===9&&q.length>=3&&r.kind==='city'&&Math.abs(n.length-q.length)<=2&&distance(n,q)<=(q.length>5?2:1))quality=3;
  if(quality===9)continue;
  const tier=r.kind==='city'?(r.tier==='Tier 1'?100:80):r.kind==='district'?60:r.kind==='locality'?40:20;
  matches.push({...r,fuzzy:quality===3,_quality:quality,_tier:districtMatch?200:tier});
 }
 return matches.sort((a,b)=>(Number(a.fuzzy)-Number(b.fuzzy))||(b._tier-a._tier)||(a._quality-b._quality)||((b.name==='London')-(a.name==='London'))||(a.name.length-b.name.length)||a.label.localeCompare(b.label,'en-GB')).slice(0,limit);
}
export function destination(record, mode='price') {
 if(mode==='sale')return record.sale||'';
 return record.price||'';
}
let pending;
export async function loadCompressed(url) {
 const r=await fetch(url);if(!r.ok)throw Error('Resource unavailable');
 const bytes=new Uint8Array(await r.arrayBuffer());
 const text=bytes[0]===31&&bytes[1]===139
  ?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text()
  :new TextDecoder().decode(bytes);
 return JSON.parse(text);
}
export function loadLocations() {
 if(!pending)pending=loadCompressed(new URL('./locations.json.gz',import.meta.url)).catch(e=>{pending=null;throw e});
 return pending;
}
let serial=0;
export function attachLocationSearch(input,{onSelect=()=>{},enabled=()=>true,records=loadLocations,kind=null}={}) {
 if(input.dataset.m0veAutocomplete)return;
 input.dataset.m0veAutocomplete='true';
 const id='m0ve-options-'+(++serial),list=document.createElement('div');
 list.id=id;list.className='m0ve-suggestions';list.role='listbox';list.setAttribute('aria-label','Suggested locations');list.hidden=true;
 const status=document.createElement('span');status.className='m0ve-sr';status.role='status';status.setAttribute('aria-live','polite');
 document.body.append(list,status);
 input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-controls',id);input.setAttribute('aria-expanded','false');input.autocomplete='off';
 let found=[],active=-1,timer,version=0,selected=null;
 function close(){list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;}
 function position(){const r=input.getBoundingClientRect();list.style.left=Math.max(12,Math.min(r.left,innerWidth- Math.min(r.width,innerWidth-24)-12))+'px';list.style.width=Math.min(Math.max(r.width,280),innerWidth-24)+'px';const room=innerHeight-r.bottom;list.style.top='auto';list.style.bottom='auto';if(room<230){list.style.bottom=(innerHeight-r.top+6)+'px';list.style.maxHeight=Math.max(120,r.top-24)+'px'}else{list.style.top=(r.bottom+6)+'px';list.style.maxHeight=Math.min(380,room-20)+'px'}}
 function choose(i){const r=found[i];if(!r)return;selected=r;input.value=r.label;close();status.textContent=r.label+' selected';onSelect(r);}
 function highlight(){[...list.children].forEach((e,i)=>{e.setAttribute('aria-selected',String(i===active));});if(active>=0){input.setAttribute('aria-activedescendant',id+'-'+active);list.children[active]?.scrollIntoView({block:'nearest'});}else input.removeAttribute('aria-activedescendant');}
 async function update(){
  const v=++version,query=input.value;if(!enabled()||query.trim().length<2){close();status.textContent='';return;}
  status.textContent='Finding locations…';
  try {const all=await records();if(v!==version||input.value!==query||!input.isConnected)return;found=suggestLocations(kind?all.filter(r=>r.kind===kind):all,query);
   list.replaceChildren();active=-1;input.removeAttribute('aria-activedescendant');
   for(const [i,r] of found.entries()){const option=document.createElement('div');option.id=id+'-'+i;option.role='option';option.setAttribute('aria-selected','false');const strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=(r.fuzzy?'Did you mean ':'')+r.label;small.textContent={city:'City / town',district:'Postcode district',locality:'Local area',street:'Street'}[r.kind];option.append(strong,small);option.addEventListener('pointerdown',e=>e.preventDefault());option.addEventListener('click',()=>choose(i));list.append(option);}
   status.textContent=found.length?found.length+' suggestions. Use arrow keys to choose a location.':'No matching locations. Try a city name or postcode district.';
   if(found.length){position();list.hidden=false;input.setAttribute('aria-expanded','true');}else close();
  }catch{status.textContent='Location suggestions are unavailable. Please try again.';close();}
 }
 input.addEventListener('input',()=>{selected=null;version++;clearTimeout(timer);timer=setTimeout(update,180)});
 input.addEventListener('focus',()=>{if(input.value.trim().length>=2)update();else records().catch(()=>{});});
 input.addEventListener('blur',()=>{version++;close()});
 input.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.stopPropagation();version++;close();}
  if(!list.hidden&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();active=(active+(e.key==='ArrowDown'?1:-1)+found.length)%found.length;highlight();}
  if(!list.hidden&&e.key==='Enter'&&active>=0){e.preventDefault();e.stopImmediatePropagation();choose(active);}
 });
 const reposition=()=>{if(!list.hidden)position()};window.addEventListener('resize',reposition);window.addEventListener('scroll',reposition,true);
 return {get selected(){return selected&&input.value===selected.label?selected:null;},close,destroy(){version++;clearTimeout(timer);list.remove();status.remove();window.removeEventListener('resize',reposition);window.removeEventListener('scroll',reposition,true);}};
}
