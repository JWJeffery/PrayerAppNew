(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.RomanBreviary1960DevSlice=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const DATA_ROOT='data/roman-breviary-1960-1962';

  // Latin is the lane's native language and keeps its original flat file paths
  // (units/${year}.json, manifests/${year}.json) for backward compatibility --
  // English (and any language added later) lives in its own subdirectory
  // (units/en/${year}.json) so adding a language can never collide with or
  // silently alter Latin's own already-shipped files.
  const SUPPORTED_LANGUAGES=Object.freeze({la:'Latin',en:'English'});
  function normalizeLanguage(language){
    return SUPPORTED_LANGUAGES[language]?language:'la';
  }
  function unitsPathFor(year,language){
    return language==='la'?`${DATA_ROOT}/units/${year}.json`:`${DATA_ROOT}/units/${language}/${year}.json`;
  }
  function manifestPathFor(year,language){
    return language==='la'?`${DATA_ROOT}/manifests/${year}.json`:`${DATA_ROOT}/manifests/${language}/${year}.json`;
  }

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

    // rubric-heading matches applyExplanationLayer()'s own selector (js/office-ui.js) -- the same
    // class Horologion's section headings already carry, for the same reason: a structural label,
    // not a per-element gloss target (.rubric-text), so it gets structural notes but not micro
    // tooltips meant for shorter inline labels. See data/explanations/latin.json.
    return `<section class="rb1960-block" data-role="${esc(block.role)}"><${headingTag} class="rubric-heading">${esc(block.native_label||block.label||block.role)}</${headingTag}>${unitHtml}${childHtml}</section>`;
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

  function renderNavHtml(date,hour,language){
    const hourOptionsHtml=HOUR_OPTIONS.map(([key,label])=>
      `<option value="${esc(key)}"${key===hour?' selected':''}>${esc(label)}</option>`
    ).join('');
    const languageOptionsHtml=Object.keys(SUPPORTED_LANGUAGES).map(code=>
      `<option value="${esc(code)}"${code===language?' selected':''}>${esc(SUPPORTED_LANGUAGES[code])}</option>`
    ).join('');
    return `<form class="rb1960-nav" onsubmit="return false;">`+
      `<label>Date <input type="date" class="rb1960-nav-date" value="${esc(date)}" min="2026-01-01" max="2027-12-31"></label>`+
      `<label>Hour <select class="rb1960-nav-hour">${hourOptionsHtml}</select></label>`+
      `<label>Language <select class="rb1960-nav-language">${languageOptionsHtml}</select></label>`+
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
      renderNavHtml(envelope.context.date,envelope.context.hour,normalizeLanguage(envelope.language))+
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
    const language=normalizeLanguage(options.language);
    const [unitsData,manifestData]=await Promise.all([
      fetchJson(unitsPathFor(year,language)),
      fetchJson(manifestPathFor(year,language))
    ]);

    return composeResolvedOffice({unitsData,manifestData,date,hour});
  }

  async function mountDevSlice(targetId='office-display',options={}){
    const target=document.getElementById(targetId);
    if(!target) throw new Error('Target element not found: '+targetId);
    // Called whenever the user picks a language from the in-page selector, so the shell can
    // persist it as the lane's own stored default (js/office-ui.js's user-profile system) --
    // this module has no localStorage access of its own and shouldn't grow one just for this.
    const onLanguageChange=typeof options.onLanguageChange==='function'?options.onLanguageChange:null;

    async function renderFor(opts){
      target.innerHTML=`<div class="office-container"><h3>Loading...</h3></div>`;
      let envelope;
      try{
        envelope=await resolveDevSliceOffice(opts);
      }catch(err){
        target.innerHTML=`<div class="office-container"><h3>Roman Breviary dev slice failed</h3><p>${esc(err.message)}</p></div>`;
        throw err;
      }
      target.innerHTML=renderResolvedOfficeHtml(envelope);
      // Every render path here (initial mount, Go, and the immediate language switch below) goes
      // straight to innerHTML and never returns through js/office-ui.js's own selectMode()/
      // requestRender() flow, which is where every other lane's own render path already calls this
      // -- so this lane has to call it itself, or the explanatory-depth layer (data/explanations/
      // latin.json) would never attach to anything rendered here. Guarded: harmless no-op if the
      // shell hasn't loaded it (or the user has explanations off) — see applyExplanationLayer()'s
      // own early returns.
      if(typeof window!=='undefined' && typeof window.applyExplanationLayer==='function'){
        window.applyExplanationLayer(targetId);
      }
      // FIXED 2026-09-28: this lane never published a shell envelope, so "The
      // Order" rail permanently showed its placeholder ("...once the lane
      // emits its blocks") for every Roman Breviary render -- reported live
      // via a screenshot. Same reason and same reused window.AnglicanEnvelope.
      // publish() call as Coptic/East Syriac/Horologion (js/office-ui.js) --
      // a plain, tradition-neutral event dispatch, not Anglican-specific
      // logic. `envelope.blocks` here is already flat (Nocturnus grouping is
      // a passthrough label, not real nesting -- confirmed against the actual
      // manifest data, not assumed), so it needs no flattening pass before
      // publishing, unlike Horologion's own tree-shaped payload.
      if(typeof window!=='undefined' && window.AnglicanEnvelope){
        try{
          window.AnglicanEnvelope.publish({
            tradition:'LAT',
            officeFamily:envelope.context.hour||null,
            context:{
              calendarSummary:envelope.context.calendarSummary||null,
              rankSummary:envelope.context.rankSummary||null
            },
            blocks:envelope.blocks||[],
            overlays:envelope.overlays||[],
            diagnostics:envelope.diagnostics||[]
          });
        }catch(e){
          // Never let envelope publication break a rendered office.
        }
      }
      const dateInput=target.querySelector('.rb1960-nav-date');
      const hourSelect=target.querySelector('.rb1960-nav-hour');
      const languageSelect=target.querySelector('.rb1960-nav-language');
      const goBtn=target.querySelector('.rb1960-nav-go');
      const currentOpts=()=>({date:dateInput.value||opts.date,hour:hourSelect.value||opts.hour,language:languageSelect.value||opts.language});
      if(goBtn) goBtn.addEventListener('click',()=>{
        renderFor(currentOpts()).catch(()=>{}); // failure already rendered into `target` above
      });
      // Immediate switch, not gated behind "Go" -- date/hour stay Go-gated (matches the
      // existing, already-shipped behavior above) but a language choice is a single discrete
      // pick, not something a user fine-tunes before submitting.
      if(languageSelect) languageSelect.addEventListener('change',()=>{
        if(onLanguageChange) onLanguageChange(languageSelect.value);
        renderFor(currentOpts()).catch(()=>{});
      });
      return envelope;
    }

    return renderFor({...options,language:normalizeLanguage(options.language)});
  }

  return {
    composeResolvedOffice,
    renderResolvedOfficeHtml,
    resolveDevSliceOffice,
    mountDevSlice
  };
});
