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

    const diagnostics=[...(h.diagnostics||[])];

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
        blocks:childBlocks,
        // Lane-native passthrough fields (Core Contract §6) -- not part of the closed role
        // taxonomy, just carried through so the renderer can still group/label Nocturnus I/II/III
        // without a `nocturn` block/role of its own. See build-roman-breviary-1960-dev-slice.mjs.
        nocturn:block.nocturn,
        nocturnLabel:block.nocturnLabel
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
      context:(function(){
        // Core Contract §4's illustrative envelope shape uses calendarSummary/rankSummary; this
        // lane's own rank line (from Divinum Officium's own rendered output, e.g. "Feria secunda
        // infra Hebdomadam III post Octavam Pentecostes ~ IV. classis") already carries both
        // pieces together, tilde-separated, in the lane's own Latin vocabulary (Core Contract §4
        // rule 1 -- the shell doesn't parse this apart, so a best-effort split for display is a
        // dev-slice convenience, not a contract requirement).
        const rankLine=day.rank||(day.liturgical_context&&day.liturgical_context.native_label)||'';
        const parts=rankLine.split(' ~ ');
        return {
          date,hour,
          calendar_scope:manifestData.calendar_scope,
          calendarSummary:parts[0]||rankLine,
          rankSummary:parts[1]||rankLine,
          native_label:rankLine,
          hour_label:h.label||hour
        };
      })(),
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

    return `<section class="rb1960-block" data-role="${esc(block.role)}"><${headingTag}>${esc(block.native_label||block.label||block.role)}</${headingTag}>${unitHtml}${childHtml}</section>`;
  }

  // Nocturnus I/II/III is a structural grouping, not a liturgical unit -- it carries no role of
  // its own (Core Contract §7 rule 1), so it isn't a block in envelope.blocks at all. Its label
  // survives as each grouped block's own `nocturnLabel` passthrough field instead. Group here by
  // consecutive `nocturn` value and render one heading per group, exactly the visual structure
  // the old (non-conformant) `role: 'nocturn'` container used to provide.
  function groupByNocturn(blocks){
    const groups=[];
    let current=null;
    for(const block of blocks){
      if(block.nocturn!=null && current && current.nocturn===block.nocturn){
        current.blocks.push(block);
      } else {
        current={nocturn:block.nocturn,nocturnLabel:block.nocturnLabel,blocks:[block]};
        groups.push(current);
      }
    }
    return groups;
  }

  const HOUR_OPTIONS=[
    ['matins','Matins'],['lauds','Lauds'],['prime','Prime'],['terce','Terce'],
    ['sext','Sext'],['none','None'],['vespers','Vespers'],['compline','Compline']
  ];

  function renderNavHtml(date,hour){
    const hourOptionsHtml=HOUR_OPTIONS.map(([key,label])=>
      `<option value="${esc(key)}"${key===hour?' selected':''}>${esc(label)}</option>`
    ).join('');
    return `<form class="rb1960-nav" onsubmit="return false;">`+
      `<label>Date <input type="date" class="rb1960-nav-date" value="${esc(date)}" min="2026-01-01" max="2027-12-31"></label>`+
      `<label>Hour <select class="rb1960-nav-hour">${hourOptionsHtml}</select></label>`+
      `<button type="button" class="rb1960-nav-go">Go</button>`+
      `</form>`;
  }

  function renderResolvedOfficeHtml(envelope){
    const groups=groupByNocturn(envelope.blocks||[]);
    const groupsHtml=groups.map(group=>{
      // Ungrouped blocks (invitatory, conclusio) render at the same top level (h3) as before.
      // Grouped blocks render one level down (h4), same as when they used to be a nocturn
      // container's own nested `.blocks` -- only how that nesting is expressed has changed.
      if(group.nocturn==null) return group.blocks.map(block=>renderBlockHtml(block,0)).join('');
      const blocksHtml=group.blocks.map(block=>renderBlockHtml(block,1)).join('');
      return `<div class="rb1960-nocturn-group"><h3 class="rb1960-nocturn-heading">${esc(group.nocturnLabel)}</h3>${blocksHtml}</div>`;
    }).join('');
    return `<div class="office-container rb1960-dev-slice">`+
      `<h2>Roman Breviary 1960/1962 — ${esc(envelope.context.hour_label)}</h2>`+
      renderNavHtml(envelope.context.date,envelope.context.hour)+
      `<p class="rb1960-context"><strong>${esc(envelope.context.native_label||'')}</strong></p>${groupsHtml}</div>`;
  }

  async function fetchJson(path){
    const response=await fetch(path,{cache:'no-store'});
    if(!response.ok) throw new Error('Failed to fetch '+path);
    return response.json();
  }

  async function resolveDevSliceOffice(options={}){
    const date=options.date||'2026-11-02';
    const hour=options.hour||'matins';
    const year=options.year||Number(date.slice(0,4))||2026;
    const [unitsData,manifestData]=await Promise.all([
      fetchJson(`${DATA_ROOT}/units/${year}.json`),
      fetchJson(`${DATA_ROOT}/manifests/${year}.json`)
    ]);

    return composeResolvedOffice({unitsData,manifestData,date,hour});
  }

  async function mountDevSlice(targetId='office-display',options={}){
    const target=document.getElementById(targetId);
    if(!target) throw new Error('Target element not found: '+targetId);

    async function renderFor(opts){
      target.innerHTML=`<div class="office-container"><h3>Loading...</h3></div>`;
      const envelope=await resolveDevSliceOffice(opts);
      target.innerHTML=renderResolvedOfficeHtml(envelope);
      const goBtn=target.querySelector('.rb1960-nav-go');
      if(goBtn) goBtn.addEventListener('click',()=>{
        const dateInput=target.querySelector('.rb1960-nav-date');
        const hourSelect=target.querySelector('.rb1960-nav-hour');
        renderFor({date:dateInput.value||opts.date,hour:hourSelect.value||opts.hour}).catch(err=>{
          target.innerHTML=`<div class="office-container"><h3>Roman Breviary dev slice failed</h3><p>${esc(err.message)}</p></div>`;
        });
      });
      return envelope;
    }

    return renderFor(options);
  }

  return {
    composeResolvedOffice,
    renderResolvedOfficeHtml,
    resolveDevSliceOffice,
    mountDevSlice
  };
});
