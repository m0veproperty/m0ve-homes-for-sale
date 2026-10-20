import {attachLocationSearch,loadLocations,destination,normalise} from './location-search.js';
const boot=document.querySelector('script[data-m0ve-page]');
const page=document.querySelector('meta[name="m0ve-page"]')?.content||boot?.dataset.m0vePage||'city';
const isStreet=page==='street'||page==='street-alt';
const descriptions={'Council':'Planning, local services and council information.','Local statistics':'Population, housing and local-area statistics.','Sold prices':'Recorded transactions from HM Land Registry.','Energy certificates':'Energy ratings and certificate details.'};
const configUrl=new URL('./local-resources.json',import.meta.url);
function landingDestination(record,mode='price'){
 if(mode==='sale'&&(record.name==='Coventry'||record.city==='Coventry')&&record.sale)return 'https://m0ve-homes-for-sale.vercel.app/?location='+encodeURIComponent(record.kind==='city'?'Coventry':record.name)+'#homes';
 if(mode==='price'){
  if(record.kind==='city'&&record.name==='Coventry')return 'https://m0ve-city-home-page.vercel.app/';
  if(record.kind==='district'&&record.name==='CV4')return 'https://m0ve-district-postcode-variation-2.vercel.app/';
  if(record.kind==='district'&&record.name==='CV5')return 'https://m0ve-district-postcode-variation-1.vercel.app/';
  if(record.kind==='street'&&record.name==='Merynton Avenue')return 'https://m0ve-street-level-1.vercel.app/';
 }
 return destination(record,mode);
}
async function start(){
 const main=document.querySelector('main');if(!main)return false;
 if(!document.querySelector('#m0ve-resources')){
  const section=document.createElement('section');section.id='m0ve-resources';section.className='m0ve-resources';section.setAttribute('aria-labelledby','m0ve-resources-title');
  const place=page==='home'?'your next move':isStreet?'Merynton Avenue':page==='district'?'CV5':page==='district-alt'?'CV4':'Coventry';
  section.innerHTML=`<p class="m0ve-kicker">Go a little deeper</p><h2 id="m0ve-resources-title">The sources behind ${place}.</h2><p>${page==='home'?'Explore public property records and local information before your next move.':'A clearer picture starts with the original information. Explore public records and local services alongside your property research.'}</p><div class="m0ve-resource-grid" aria-live="polite"><p>Loading useful sources…</p></div><div class="m0ve-explore"><label for="m0ve-explore-input">Explore another place</label><form><input id="m0ve-explore-input" placeholder="City, postcode district or local area" aria-describedby="m0ve-explore-status"><select aria-label="Search purpose"><option value="price">House prices</option><option value="sale">Homes for sale</option></select><button type="submit">Explore ↗</button></form><p role="status" id="m0ve-explore-status">Start with two characters, then choose a location.</p></div>`;
  main.append(section);
  const input=section.querySelector('input'),form=section.querySelector('form'),status=section.querySelector('[role=status]');
  const search=attachLocationSearch(input,{onSelect:r=>{status.textContent=r.label+' selected. Choose Explore to open its M0VE page.';}});
  form.addEventListener('submit',async e=>{e.preventDefault();const query=input.value;const purpose=section.querySelector('select').value;const records=await loadLocations().catch(()=>[]);if(input.value!==query||section.querySelector('select').value!==purpose)return;const selected=search.selected||exact(records,input.value);if(!selected){status.textContent='Choose a suggested location before continuing.';input.focus();return;}const url=landingDestination(selected,purpose);if(!url){status.textContent='A homes-for-sale destination has not been supplied for this street. Choose its city or postcode district.';return;}location.assign(url)});
  try{
   const r=await fetch(configUrl);if(!r.ok)throw Error();const data=await r.json();
   const links=page==='home'?[
    {kind:'Council',label:'Find your local council',url:'https://www.gov.uk/find-local-council'},
    {kind:'Local statistics',label:'ONS local statistics',url:'https://www.ons.gov.uk/explore-local-statistics/'},
    {kind:'Sold prices',label:'HM Land Registry sold prices',url:'https://www.gov.uk/search-house-prices'},
    {kind:'Energy certificates',label:'Find an energy certificate',url:'https://www.gov.uk/find-energy-certificate'}
   ]:data.city.map(link=>link.kind==='Energy certificates'?{...link,label:isStreet?'Merynton Avenue energy certificates':'Find an energy certificate',url:isStreet?data.streetEpc:'https://www.gov.uk/find-energy-certificate'}:link);
   const grid=section.querySelector('.m0ve-resource-grid');grid.replaceChildren();
   for(const link of links){const a=document.createElement('a');a.href=link.url;a.target='_blank';a.rel='noopener noreferrer nofollow';const kind=document.createElement('span'),title=document.createElement('strong'),desc=document.createElement('small');kind.textContent=link.kind+' ↗';title.textContent=link.label;desc.textContent=descriptions[link.kind]+' Opens in a new tab.';a.append(kind,title,desc);grid.append(a);}
  }catch{section.querySelector('.m0ve-resource-grid').innerHTML='<a href="https://www.gov.uk/search-house-prices" target="_blank" rel="noopener noreferrer"><strong>Search HM Land Registry sold prices ↗</strong><small>Other sources could not load. Please reload to try again.</small></a>'}
 }
 bindExisting();return true;
}
function exact(records,query){const n=normalise(query);return records.find(r=>normalise(r.label)===n)||records.find(r=>normalise(r.name)===n);}
function bindExisting(){
 for(const input of document.querySelectorAll('#mj-location,#location[name=q]')){
  if(input.dataset.m0veAutocomplete)continue;
  const widget=input.closest('.mj-widget');
  const mode=()=>widget?[...widget.querySelectorAll('[role=tab]')].findIndex(t=>t.getAttribute('aria-selected')==='true'):1;
  const search=attachLocationSearch(input,{enabled:()=>mode()!==0});
  const form=input.closest('form');if(!form)continue;
  const status=widget?.querySelector('[role=status]')||document.querySelector('#search-help');
  widget?.querySelectorAll('[role=tab]').forEach(t=>t.addEventListener('click',()=>search.close()));
  form.addEventListener('submit',async e=>{
   if(mode()===0)return;
   e.preventDefault();e.stopImmediatePropagation();
   const query=input.value,purpose=mode();
   try{
    const records=await loadLocations();const selected=search.selected||exact(records,input.value);
    if(query!==input.value||purpose!==mode())return;
    if(!selected){if(status)status.textContent='Choose a location from the suggestions, or enter its full name.';input.focus();return;}
    const target=landingDestination(selected,purpose===2?'sale':'price');
    if(target)location.assign(target);else if(status)status.textContent='Choose a city or postcode district to browse homes for sale.';
   }catch{if(status)status.textContent='Location suggestions are unavailable. Please try again.';}
  },true);
 }
}
// Wait for client-rendered pages without replacing their components or filter state.
let queued=false;
const observer=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;if(!document.querySelector('#m0ve-resources'))start();else bindExisting();})});
observer.observe(document.body,{childList:true,subtree:true});
start();

