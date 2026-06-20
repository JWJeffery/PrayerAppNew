(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RomanBreviary1960DevSlice=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
const DATA_ROOT='data/roman-breviary-1960-1962';
function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function composeResolvedOffice({unitsData,manifestData,date='2026-11-02',hour='matins'}={}){
  const unitsIndex=unitsData&&unitsData.units;
  const day=manifestData&&manifestData.days&&manifestData.days[date];
  const h=day&&day.hours&&day.hours[hour];
  if(!unitsIndex||!day||!h) throw new Error('Roman Breviary dev slice fixture missing required data.');
  const diagnostics=[...(h.diagnostics||[]),{type:'coverage-gap',message:'Full Roman Breviary 2026/2027 manifests are not generated yet.'}];
  const blocks=(h.blocks||[]).map(b=>{
    const units=(b.unit_refs||[]).map(k=>{
      if(!unitsIndex[k])throw new Error('Missing unit '+k);
      const unit=unitsIndex[k];
      if(Array.isArray(unit.display_diagnostics)) diagnostics.push(...unit.display_diagnostics);
      return unit;
    });
    return {role:b.role||'other',label:b.label||b.role,native_label:b.label||b.role,unit_refs:b.unit_refs||[],units};
  });
  return {schema_version:'universal_office_resolved_envelope_v0_dev',tradition:manifestData.tradition,office_family:manifestData.office_family,edition_or_recension:manifestData.edition_or_recension,language:manifestData.language,source_pin:manifestData.source_pin,context:{date,hour,calendar_scope:manifestData.calendar_scope,native_label:day.liturgical_context&&day.liturgical_context.native_label,rank:day.liturgical_context&&day.liturgical_context.rank,hour_label:h.label||hour},blocks,overlays:[],diagnostics};
}
function renderUnitTextHtml(text){
  const lines=String(text||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  if(!lines.length)return '';
  return `<div class="rb1960-unit-body">${lines.map(line=>`<p>${esc(line)}</p>`).join('')}</div>`;
}
function renderResolvedOfficeHtml(e){
  const blocksHtml=(e.blocks||[]).map(b=>`<section class="rb1960-block" data-role="${esc(b.role)}"><h3>${esc(b.native_label||b.label||b.role)}</h3>${(b.units||[]).map(u=>`<article class="rb1960-unit" data-unit-key="${esc(u.key)}">${u.citation?`<div class="rb1960-unit-citation">${esc(u.citation)}</div>`:''}${renderUnitTextHtml(u.text)}</article>`).join('')}</section>`).join('');
  const diagnosticsHtml=(e.diagnostics||[]).map(d=>`<li><strong>${esc(d.type)}</strong>: ${esc(d.message)}</li>`).join('');
  return `<div class="office-container rb1960-dev-slice"><h2>Roman Breviary 1960/1962 — ${esc(e.context.hour_label)}</h2><p class="rb1960-context"><strong>${esc(e.context.native_label||'')}</strong></p>${blocksHtml}<details class="rb1960-diagnostics"><summary>Diagnostics (${(e.diagnostics||[]).length})</summary><ul>${diagnosticsHtml}</ul></details></div>`;
}
async function fetchJson(p){const r=await fetch(p,{cache:'no-store'});if(!r.ok)throw new Error('Failed to fetch '+p);return r.json();}
async function resolveDevSliceOffice(o={}){const y=o.year||2026;const [u,m]=await Promise.all([fetchJson(`${DATA_ROOT}/units/dev-vertical-slice.json`),fetchJson(`${DATA_ROOT}/manifests/${y}.json`)]);return composeResolvedOffice({unitsData:u,manifestData:m,date:o.date||'2026-11-02',hour:o.hour||'matins'});}
async function mountDevSlice(targetId='office-display',o={}){const e=await resolveDevSliceOffice(o);const t=document.getElementById(targetId);if(!t)throw new Error('Target element not found: '+targetId);t.innerHTML=renderResolvedOfficeHtml(e);return e;}
return {composeResolvedOffice,renderResolvedOfficeHtml,resolveDevSliceOffice,mountDevSlice};
});
