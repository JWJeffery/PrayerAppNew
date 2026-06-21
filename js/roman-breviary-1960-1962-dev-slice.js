(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.RomanBreviary1960DevSlice=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const DATA_ROOT='data/roman-breviary-1960-1962';

  function esc(v){
    return String(v??'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function composeResolvedOffice({unitsData,manifestData,date='2026-11-02',hour='matins'}={}){
    const unitsIndex=unitsData&&unitsData.units;
    const day=manifestData&&manifestData.days&&manifestData.days[date];
    const h=day&&day.hours&&day.hours[hour];

    if(!unitsIndex||!day||!h) {
      throw new Error('Roman Breviary dev slice fixture missing required data.');
    }

    const diagnostics=[
      ...(h.diagnostics||[]),
      {type:'coverage-gap',message:'Full Roman Breviary 2026/2027 manifests are not generated yet.'}
    ];

    function composeBlock(block){
      const childBlocks=(block.blocks||[]).map(composeBlock);
      const units=(block.unit_refs||[]).map(key=>{
        if(!unitsIndex[key]) throw new Error('Missing unit '+key);
        const unit=unitsIndex[key];
        if(Array.isArray(unit.display_diagnostics)) diagnostics.push(...unit.display_diagnostics);
        return unit;
      });

      return {
        role:block.role||'other',
        label:block.label||block.role,
        native_label:block.label||block.role,
        unit_refs:block.unit_refs||[],
        units,
        blocks:childBlocks
      };
    }

    const blocks=(h.blocks||[]).map(composeBlock);

    return {
      schema_version:'universal_office_resolved_envelope_v0_dev',
      tradition:manifestData.tradition,
      office_family:manifestData.office_family,
      edition_or_recension:manifestData.edition_or_recension,
      language:manifestData.language,
      source_pin:manifestData.source_pin,
      context:{
        date,
        hour,
        calendar_scope:manifestData.calendar_scope,
        native_label:day.liturgical_context&&day.liturgical_context.native_label,
        rank:day.liturgical_context&&day.liturgical_context.rank,
        hour_label:h.label||hour
      },
      blocks,
      overlays:[],
      diagnostics
    };
  }

  function renderUnitTextHtml(text){
    const lines=String(text||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
    if(!lines.length) return '';
    return `<div class="rb1960-unit-body">${lines.map(line=>`<p>${esc(line)}</p>`).join('')}</div>`;
  }

  function renderUnitHtml(unit){
    return `<article class="rb1960-unit" data-unit-key="${esc(unit.key)}">${unit.citation?`<div class="rb1960-unit-citation">${esc(unit.citation)}</div>`:''}${renderUnitTextHtml(unit.text)}</article>`;
  }

  function renderBlockHtml(block, depth=0){
    const headingTag=depth===0?'h3':'h4';
    const childHtml=(block.blocks||[]).map(child=>renderBlockHtml(child,depth+1)).join('');
    const unitHtml=(block.units||[]).map(renderUnitHtml).join('');
    const className=block.role==='nocturn'?'rb1960-block rb1960-nocturn':'rb1960-block';

    return `<section class="${className}" data-role="${esc(block.role)}"><${headingTag}>${esc(block.native_label||block.label||block.role)}</${headingTag}>${unitHtml}${childHtml}</section>`;
  }

  function renderResolvedOfficeHtml(envelope){
    const blocksHtml=(envelope.blocks||[]).map(block=>renderBlockHtml(block,0)).join('');
    return `<div class="office-container rb1960-dev-slice"><h2>Roman Breviary 1960/1962 — ${esc(envelope.context.hour_label)}</h2><p class="rb1960-context"><strong>${esc(envelope.context.native_label||'')}</strong></p>${blocksHtml}</div>`;
  }

  async function fetchJson(path){
    const response=await fetch(path,{cache:'no-store'});
    if(!response.ok) throw new Error('Failed to fetch '+path);
    return response.json();
  }

  async function resolveDevSliceOffice(options={}){
    const year=options.year||2026;
    const [unitsData,manifestData]=await Promise.all([
      fetchJson(`${DATA_ROOT}/units/dev-vertical-slice.json`),
      fetchJson(`${DATA_ROOT}/manifests/${year}.json`)
    ]);

    return composeResolvedOffice({
      unitsData,
      manifestData,
      date:options.date||'2026-11-02',
      hour:options.hour||'matins'
    });
  }

  async function mountDevSlice(targetId='office-display',options={}){
    const envelope=await resolveDevSliceOffice(options);
    const target=document.getElementById(targetId);
    if(!target) throw new Error('Target element not found: '+targetId);
    target.innerHTML=renderResolvedOfficeHtml(envelope);
    return envelope;
  }

  return {
    composeResolvedOffice,
    renderResolvedOfficeHtml,
    resolveDevSliceOffice,
    mountDevSlice
  };
});
