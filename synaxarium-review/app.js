/* ============================================================
   An Anglican Synaxarium — Kalendar Review
   Vanilla JS, no build step, works on GitHub Pages or any
   static host. Decisions autosave to localStorage; use
   Export/Import to move decisions between browsers or commit
   them back into the repo.
   ============================================================ */

const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const STORAGE_KEY = "uo-synaxarium-decisions-v1";

let KALENDAR = null;      // loaded from data/kalendar-data.json
let DECISIONS = loadDecisions();
let state = { month: null, date: null };

// --- Disk-file persistence (File System Access API, Chrome/Edge only) ---
const FS_SUPPORTED = 'showSaveFilePicker' in window;
const IDB_NAME = 'uo-synaxarium-fs';
const IDB_STORE = 'handles';
const IDB_HANDLE_KEY = 'decisionsFile';
let fileHandle = null;      // the live, permitted handle we write to
let pendingHandle = null;   // a remembered handle awaiting permission

const el = (id) => document.getElementById(id);

init();

async function init(){
  try{
    const res = await fetch('data/kalendar-data.json');
    KALENDAR = await res.json();
  }catch(err){
    el('folio').innerHTML = `<div class="folio-empty">Could not load <code>data/kalendar-data.json</code>. If you're opening this file directly from disk, run it through a local server instead (double-clicking index.html won't let the browser fetch local files). See the README for a one-line command.</div>`;
    return;
  }

  // pick first built month with data as default
  state.month = MONTHS.find(m => KALENDAR[m] && KALENDAR[m].built) || MONTHS[0];
  const firstDate = firstDateOf(state.month);
  state.date = firstDate;

  renderMonthTabs();
  renderDayList();
  renderFolio();
  updateProgress();

  el('btnExport').addEventListener('click', exportDecisions);
  el('btnImport').addEventListener('click', () => el('fileImport').click());
  el('fileImport').addEventListener('change', handleImport);

  if (FS_SUPPORTED){
    el('btnConnectFile').addEventListener('click', onConnectFileClick);
    await tryRestoreFileHandle();
  } else {
    el('btnConnectFile').disabled = true;
    el('btnConnectFile').title = 'Your browser (likely Safari or Firefox) does not support saving directly to disk. Use Export / Import instead — your decisions still autosave to this browser in the meantime.';
    setFileStatus('Disk-save not supported in this browser — use Export/Import', 'unsupported');
  }
}

function firstDateOf(month){
  const days = KALENDAR[month].days;
  const keys = Object.keys(days).sort();
  return keys.length ? keys[0] : null;
}

/* ---------------- Month tabs & day list ---------------- */

function renderMonthTabs(){
  const wrap = el('monthTabs');
  wrap.innerHTML = '';
  MONTHS.forEach(m => {
    const data = KALENDAR[m];
    const btn = document.createElement('button');
    btn.className = 'month-tab' + (m === state.month ? ' is-active' : '') + (!data.built ? ' is-unbuilt' : '');
    btn.textContent = data.label.slice(0,3);
    btn.title = data.built ? data.label : `${data.label} — not yet built`;
    if (data.built){
      btn.addEventListener('click', () => {
        state.month = m;
        state.date = firstDateOf(m);
        renderMonthTabs();
        renderDayList();
        renderFolio();
      });
    } else {
      btn.disabled = true;
    }
    wrap.appendChild(btn);
  });
}

function renderDayList(){
  const list = el('dayList');
  list.innerHTML = '';
  const month = KALENDAR[state.month];
  const total = month.days_in_month;

  for (let d = 1; d <= total; d++){
    const dd = String(d).padStart(2,'0');
    const mm = String(MONTHS.indexOf(state.month)+1).padStart(2,'0');
    const dateKey = `${mm}-${dd}`;
    const candidates = month.days[dateKey];
    const decision = DECISIONS[dateKey];

    const li = document.createElement('li');
    const row = document.createElement('button');
    row.className = 'day-row' + (dateKey === state.date ? ' is-selected' : '');

    const dot = document.createElement('span');
    dot.className = 'day-dot' + (decision && decision.chosenLabel ? ' is-decided' : (!candidates ? ' is-empty' : ''));

    const dateSpan = document.createElement('span');
    dateSpan.className = 'day-row-date';
    dateSpan.textContent = dateKey;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'day-row-name' + (!candidates ? ' is-empty' : '');
    nameSpan.textContent = candidates ? candidates[0].candidate : 'no data';

    row.append(dot, dateSpan, nameSpan);
    row.addEventListener('click', () => {
      state.date = dateKey;
      renderDayList();
      renderFolio();
    });

    li.appendChild(row);
    list.appendChild(li);
  }
}

/* ---------------- Folio (day detail) ---------------- */

function classifyTradition(tradition){
  const t = tradition || '';
  const isGreater = /Great Church|Greater Church|Roman Catholic|Eastern Orthodox|Oriental Orthodox/i.test(t);
  const isAnglican = /^Anglican(?!\s*-received Great Church)/i.test(t) || (/Anglican/i.test(t) && !isGreater);
  return isGreater ? 'greater' : (isAnglican ? 'anglican' : 'greater');
}

function renderFolio(){
  const month = KALENDAR[state.month];
  const dateKey = state.date;
  const candidates = dateKey ? month.days[dateKey] : null;
  const decision = DECISIONS[dateKey] || {};

  const dayNum = parseInt(dateKey.split('-')[1], 10);
  const idx = MONTHS.indexOf(state.month);

  const folio = el('folio');
  folio.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'folio-header';
  header.innerHTML = `
    <div>
      <span class="folio-eyebrow">${month.label} &middot; Day ${dayNum} of ${month.days_in_month}</span>
      <h2 class="folio-date">${month.label} ${dayNum}</h2>
    </div>
    <div class="folio-nav">
      <button class="btn btn-outline" id="btnPrev">&larr; Previous day</button>
      <button class="btn btn-outline" id="btnNext">Next day &rarr;</button>
    </div>
  `;
  folio.appendChild(header);

  if (!candidates){
    const empty = document.createElement('div');
    empty.className = 'no-alternates';
    empty.textContent = 'No candidate data recorded for this day yet.';
    folio.appendChild(empty);
  } else {
    const dayNotices = (month.day_notices && month.day_notices[dateKey]) || [];
    if (dayNotices.length){
      folio.appendChild(renderHarmonizationBlock(dayNotices, dateKey, true));
    }

    const list = document.createElement('div');
    list.className = 'candidate-list';

    candidates.forEach((c, i) => {
      const isChosen = decision.chosenKey === candidateKey(c, i) && !decision.isCustom;
      const card = document.createElement('article');
      card.className = 'candidate-card' + (isChosen ? ' is-chosen' : '');
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', String(isChosen));

      const trad = classifyTradition(c.tradition);
      const tradTagClass = trad === 'anglican' ? 'tag-anglican' : 'tag-greater';

      card.innerHTML = `
        <div class="candidate-top">
          <div class="rank-badge ${c.rank === '1' ? 'rank-1' : ''}">${c.rank || '?'}</div>
          <div class="candidate-headline">
            <p class="candidate-name">${escapeHtml(c.candidate)}</p>
            <p class="candidate-sub">${escapeHtml(c.designation)}${c.year_or_period ? ' &middot; ' + escapeHtml(c.year_or_period) : ''}</p>
          </div>
          ${isChosen ? '<span class="chosen-mark">Chosen</span>' : ''}
        </div>
        <div class="tag-row">
          <span class="tag ${tradTagClass}">${escapeHtml(c.tradition)}</span>
          ${c.source_tier ? `<span class="tag tag-tier">${escapeHtml(c.source_tier)}</span>` : ''}
        </div>
        <div class="sin-row">
          ${renderSinBadge(c)}
        </div>
        <div class="candidate-body">
          ${c.ranking_rationale ? `<p class="rationale">${escapeHtml(c.ranking_rationale)}</p>` : ''}
          ${renderFlags(c.review_flags)}
          ${c.source_witnesses ? `<p class="note"><strong>Sources:</strong> ${escapeHtml(c.source_witnesses)}</p>` : ''}
          ${c.notes ? `<p class="note">${escapeHtml(c.notes)}</p>` : ''}
        </div>
        ${c.harmonization && c.harmonization.length ? renderHarmonizationHtml(c.harmonization) : ''}
      `;

      card.addEventListener('click', () => chooseCandidate(dateKey, c, i));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); chooseCandidate(dateKey, c, i); }
      });

      list.appendChild(card);
    });

    folio.appendChild(list);

    // "no alternates recorded" hint
    if (candidates.length === 1){
      const hint = document.createElement('div');
      hint.className = 'no-alternates';
      hint.style.marginTop = '-6px';
      hint.style.marginBottom = '20px';
      hint.textContent = 'Only a rank-1 candidate has been recorded for this day so far — no alternates have been built out yet.';
      folio.appendChild(hint);
    }
  }

  folio.appendChild(renderDecisionPanel(dateKey, candidates, decision));

  el('btnPrev').addEventListener('click', () => shiftDay(-1));
  el('btnNext').addEventListener('click', () => shiftDay(1));
}

function renderFlags(flagsStr){
  if (!flagsStr) return '';
  const flags = flagsStr.split(';').map(s => s.trim()).filter(Boolean);
  if (!flags.length) return '';
  return `<div class="flags">${flags.map(f => `<span class="flag">${escapeHtml(f)}</span>`).join('')}</div>`;
}

function renderSinBadge(c){
  if (c.sin_status === 'ok' && c.sin && c.sin.sin){
    const ctx = c.sin.source === 'rank1'
      ? `rank-1 control &middot; ${escapeHtml(c.sin.audit_result || 'audited')}`
      : `alternate row &middot; ${escapeHtml(c.sin.entity_type || 'entry')}`;
    return `<span class="sin-badge">${escapeHtml(c.sin.sin)}</span><span class="sin-context">${ctx}</span>`;
  }
  return `<span class="sin-missing">No SIN found — join failure, needs governance attention</span>`;
}

function renderHarmonizationHtml(hits){
  return `<div class="harmonization-block">${hits.map(h => `
    <div class="harmonization-item">
      <p class="harmonization-title">Cross-date harmonization flag</p>
      <p class="harmonization-text">${escapeHtml(h.notes)}</p>
      <p class="harmonization-meta">Also seen: ${escapeHtml((h.dates || []).join('; '))} &middot; files: ${escapeHtml(h.files_seen)} &middot; status: ${escapeHtml(h.qc_status)}${h.this_date_annotation ? ` &middot; this date: ${escapeHtml(h.this_date_annotation)}` : ''}</p>
    </div>
  `).join('')}</div>`;
}

function renderHarmonizationBlock(entries, dateKey, isDayLevel){
  const wrap = document.createElement('div');
  wrap.className = 'day-notice-banner';
  wrap.innerHTML = `
    <p class="harmonization-title">${isDayLevel ? 'Harmonization notice for this day (no specific candidate row matched)' : 'Cross-date harmonization flag'}</p>
    ${entries.map(h => `
      <div class="harmonization-item">
        <p class="harmonization-text"><strong>${escapeHtml(h.candidate_or_group)}</strong> — ${escapeHtml(h.notes)}</p>
        <p class="harmonization-meta">Also seen: ${escapeHtml((h.dates || []).join('; '))} &middot; files: ${escapeHtml(h.files_seen)} &middot; status: ${escapeHtml(h.qc_status)}</p>
      </div>
    `).join('')}
  `;
  return wrap;
}

function candidateKey(c, i){
  return `${i}:${c.candidate}`;
}

function decisionTypeLabel(type){
  if (type === 'concur_rank1') return ' (concurred with rank 1)';
  if (type === 'select_alternate') return ' (selected alternate)';
  if (type === 'custom') return ' (none of the above)';
  return '';
}

function renderDecisionPanel(dateKey, candidates, decision){
  const panel = document.createElement('section');
  panel.className = 'decision-panel';

  const hasCandidates = !!candidates;
  const rank1 = hasCandidates ? candidates[0] : null;

  panel.innerHTML = `
    <h2>Decision for this day</h2>
    <label class="custom-toggle">
      <input type="checkbox" id="customToggle" ${decision.isCustom ? 'checked' : ''} ${hasCandidates ? '' : 'disabled'}>
      None of the above — record a different saint or commemoration
    </label>
    <input type="text" class="custom-name-input ${decision.isCustom ? 'is-visible' : ''}" id="customName"
      placeholder="Name the saint or commemoration you're choosing instead"
      value="${escapeAttr(decision.customText || '')}">
    <textarea class="comment-box" id="commentBox" placeholder="Notes on this decision (optional) — why you concurred, overrode, or want this flagged for later review.">${escapeHtml(decision.comment || '')}</textarea>
    <div class="decision-footer">
      <span class="decision-status-text ${decision.chosenLabel ? '' : 'is-pending'}">
        ${decision.chosenLabel ? `Decided: ${escapeHtml(decision.chosenLabel)}${decisionTypeLabel(decision.decisionType)}${decision.selectedSin ? ` &middot; ${escapeHtml(decision.selectedSin)}` : ''}` : 'Not yet decided'}
      </span>
      <div class="decision-buttons">
        ${hasCandidates ? `<button class="btn btn-outline" id="btnConcur">Concur with rank 1</button>` : ''}
        <button class="btn btn-primary" id="btnConfirm">Confirm &amp; next day</button>
      </div>
    </div>
  `;

  const customToggle = panel.querySelector('#customToggle');
  const customName = panel.querySelector('#customName');
  customToggle && customToggle.addEventListener('change', () => {
    const d = getDecision(dateKey);
    d.isCustom = customToggle.checked;
    if (d.isCustom) {
      d.chosenKey = null;
      d.decisionType = 'custom';
      d.selectedSin = null;
      d.candidateSnapshot = null;
    }
    saveDecisions();
    renderFolio();
  });

  if (hasCandidates){
    panel.querySelector('#btnConcur').addEventListener('click', () => {
      chooseCandidate(dateKey, rank1, 0, { autoLabel: true });
    });
  }

  panel.querySelector('#btnConfirm').addEventListener('click', async () => {
    const d = getDecision(dateKey);
    d.comment = panel.querySelector('#commentBox').value;
    if (d.isCustom){
      d.customText = customName.value.trim();
      d.chosenLabel = d.customText || null;
    }
    if (!d.chosenLabel){
      showToast('Choose a candidate, concur with rank 1, or name an alternative before confirming.');
      return;
    }
    d.timestamp = new Date().toISOString();
    saveDecisions();
    if (fileHandle) await writeToFile();
    playSeal();
    renderDayList();
    updateProgress();
    setTimeout(() => shiftDay(1), 550);
  });

  return panel;
}

function chooseCandidate(dateKey, candidate, index){
  const d = getDecision(dateKey);
  d.isCustom = false;
  d.chosenKey = candidateKey(candidate, index);
  d.chosenLabel = candidate.candidate;
  d.decisionType = candidate.rank === '1' ? 'concur_rank1' : 'select_alternate';
  d.selectedSin = (candidate.sin && candidate.sin.sin) || null;
  d.candidateSnapshot = candidate;
  saveDecisions();
  renderFolio();
}

function getDecision(dateKey){
  if (!DECISIONS[dateKey]) DECISIONS[dateKey] = {};
  return DECISIONS[dateKey];
}

function shiftDay(delta){
  const month = KALENDAR[state.month];
  const keys = Object.keys(month.days).sort();
  let idx = keys.indexOf(state.date);
  if (idx === -1) idx = 0;
  const nextIdx = idx + delta;

  if (nextIdx >= 0 && nextIdx < keys.length){
    state.date = keys[nextIdx];
    renderDayList();
    renderFolio();
    return;
  }
  // roll into next/previous built month
  const monthIdx = MONTHS.indexOf(state.month);
  const dir = delta > 0 ? 1 : -1;
  let m = monthIdx + dir;
  while (m >= 0 && m < 12){
    if (KALENDAR[MONTHS[m]].built){
      state.month = MONTHS[m];
      const k = Object.keys(KALENDAR[state.month].days).sort();
      state.date = dir > 0 ? k[0] : k[k.length-1];
      renderMonthTabs();
      renderDayList();
      renderFolio();
      return;
    }
    m += dir;
  }
  showToast(dir > 0 ? "You've reached the end of the built kalendar." : "You're at the start of the built kalendar.");
}

/* ---------------- Progress ---------------- */

function updateProgress(){
  let totalDecided = 0;
  let totalDays = 0;
  MONTHS.forEach(m => {
    if (!KALENDAR[m].built) return;
    const keys = Object.keys(KALENDAR[m].days);
    totalDays += keys.length;
    keys.forEach(k => { if (DECISIONS[k] && DECISIONS[k].chosenLabel) totalDecided++; });
  });
  el('progressLabel').textContent = `${totalDecided} of ${totalDays} built days decided`;
  el('progressFill').style.width = totalDays ? `${(totalDecided/totalDays)*100}%` : '0%';
}

/* ---------------- Persistence ---------------- */

function loadDecisions(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch(e){ return {}; }
}

function saveDecisions(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DECISIONS));
  }catch(e){
    showToast('Could not autosave to this browser. Export your decisions often.');
  }
}

/* ---------------- Disk-file persistence (Chrome/Edge) ----------------
   Local storage alone disappears if the browser cache is cleared. Where
   the browser supports it, we keep a real file on disk as the durable
   copy: every confirmed day is written straight to it, and on reload we
   read it back in (merging by most-recent timestamp against whatever is
   cached locally, so nothing is silently lost either direction). */

function idbOpen(){
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key, value){
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function idbGet(key){
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tryRestoreFileHandle(){
  let handle;
  try{ handle = await idbGet(IDB_HANDLE_KEY); }catch(e){ return; }
  if (!handle) return;

  try{
    const perm = await handle.queryPermission({ mode: 'readwrite' });
    if (perm === 'granted'){
      fileHandle = handle;
      await loadAndMergeFromFile();
      setFileStatus(handle.name, 'connected');
    } else {
      pendingHandle = handle;
      setFileStatus(handle.name, 'pending');
      el('btnConnectFile').textContent = 'Reconnect decisions file';
    }
  }catch(e){ /* handle no longer valid (file moved/deleted) — ignore, let the person reconnect */ }
}

async function onConnectFileClick(){
  if (pendingHandle){
    // a remembered file just needs permission re-granted (requires this click's user gesture)
    try{
      const perm = await pendingHandle.requestPermission({ mode: 'readwrite' });
      if (perm === 'granted'){
        fileHandle = pendingHandle;
        pendingHandle = null;
        await loadAndMergeFromFile();
        setFileStatus(fileHandle.name, 'connected');
        el('btnConnectFile').textContent = 'Connect decisions file';
        showToast('Decisions file reconnected.');
      } else {
        showToast('Permission was not granted, so nothing was reconnected.');
      }
    }catch(e){ showToast('Could not reconnect that file.'); }
    return;
  }
  await connectNewFile();
}

async function connectNewFile(){
  try{
    const handle = await window.showSaveFilePicker({
      suggestedName: 'synaxarium-decisions.json',
      types: [{ description: 'JSON file', accept: { 'application/json': ['.json'] } }]
    });
    fileHandle = handle;
    await idbSet(IDB_HANDLE_KEY, handle);
    await loadAndMergeFromFile();   // if this is an existing file with prior decisions, pull them in
    await writeToFile();            // then immediately write the merged result back
    setFileStatus(handle.name, 'connected');
    showToast('Decisions file connected. Confirmed days now save here automatically.');
  }catch(err){
    if (err.name !== 'AbortError') showToast('Could not connect a decisions file.');
  }
}

async function loadAndMergeFromFile(){
  if (!fileHandle) return;
  try{
    const file = await fileHandle.getFile();
    const text = await file.text();
    if (!text.trim()) return;
    const payload = JSON.parse(text);
    const fromFile = payload.decisions || payload;
    const converted = {};
    Object.keys(fromFile).forEach(dateKey => {
      const entry = fromFile[dateKey];
      converted[dateKey] = ('selected_candidate' in entry) ? exportEntryToDecision(entry) : entry;
    });
    DECISIONS = mergeDecisions(DECISIONS, converted);
    saveDecisions();
    renderDayList();
    renderFolio();
    updateProgress();
  }catch(e){ /* empty or brand-new file — nothing to merge yet */ }
}

async function writeToFile(){
  if (!fileHandle) return;
  try{
    const writable = await fileHandle.createWritable();
    const decisionsOut = {};
    Object.keys(DECISIONS).forEach(dateKey => {
      decisionsOut[dateKey] = decisionToExportEntry(dateKey, DECISIONS[dateKey]);
    });
    const payload = {
      exported_at: new Date().toISOString(),
      source: 'An Anglican Synaxarium — Kalendar Review',
      format_version: 2,
      decisions: decisionsOut
    };
    await writable.write(JSON.stringify(payload, null, 2));
    await writable.close();
  }catch(e){
    showToast('Could not save to your decisions file. It may have been moved, renamed, or its permission revoked — try reconnecting it.');
  }
}

function mergeDecisions(local, incoming){
  const out = Object.assign({}, local);
  for (const key in incoming){
    const b = incoming[key];
    const a = out[key];
    if (!a){ out[key] = b; continue; }
    const at = a.timestamp ? Date.parse(a.timestamp) : 0;
    const bt = b.timestamp ? Date.parse(b.timestamp) : 0;
    out[key] = bt > at ? b : a;
  }
  return out;
}

function setFileStatus(text, kind){
  const s = el('fileStatus');
  if (!s) return;
  s.textContent = kind === 'connected' ? `Saving to: ${text}` : text;
  s.className = 'file-status' + (kind === 'connected' ? ' is-connected' : kind === 'pending' ? ' is-pending' : '');
}

function decisionToExportEntry(dateKey, d){
  const mm = parseInt(dateKey.split('-')[0], 10);
  const monthName = MONTHS[mm - 1];
  return {
    month: monthName ? monthName.charAt(0).toUpperCase() + monthName.slice(1) : null,
    date: dateKey,
    selected_candidate: d.chosenLabel || null,
    selected_sin: d.selectedSin || null,
    decision_type: d.decisionType || (d.isCustom ? 'custom' : null),
    reviewer_comments: d.comment || '',
    timestamp: d.timestamp || null,
    original_candidate_row: d.candidateSnapshot || null,
    _internal_chosen_key: d.chosenKey || null,
    _internal_is_custom: !!d.isCustom,
    _internal_custom_text: d.customText || ''
  };
}

function exportEntryToDecision(entry){
  return {
    chosenKey: entry._internal_chosen_key || null,
    chosenLabel: entry.selected_candidate || null,
    isCustom: entry._internal_is_custom || entry.decision_type === 'custom',
    customText: entry._internal_custom_text || (entry.decision_type === 'custom' ? entry.selected_candidate : ''),
    comment: entry.reviewer_comments || '',
    timestamp: entry.timestamp || null,
    decisionType: entry.decision_type || null,
    selectedSin: entry.selected_sin || null,
    candidateSnapshot: entry.original_candidate_row || null
  };
}

function exportDecisions(){
  const decisionsOut = {};
  Object.keys(DECISIONS).forEach(dateKey => {
    decisionsOut[dateKey] = decisionToExportEntry(dateKey, DECISIONS[dateKey]);
  });
  const payload = {
    exported_at: new Date().toISOString(),
    source: 'An Anglican Synaxarium — Kalendar Review',
    format_version: 2,
    decisions: decisionsOut
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `synaxarium-decisions-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Decisions exported.');
}

function handleImport(e){
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try{
      const payload = JSON.parse(reader.result);
      const incoming = payload.decisions || payload;
      const converted = {};
      Object.keys(incoming).forEach(dateKey => {
        const entry = incoming[dateKey];
        converted[dateKey] = ('selected_candidate' in entry) ? exportEntryToDecision(entry) : entry;
      });
      DECISIONS = mergeDecisions(DECISIONS, converted);
      saveDecisions();
      if (fileHandle) await writeToFile();
      renderDayList();
      renderFolio();
      updateProgress();
      showToast('Decisions imported and merged.');
    }catch(err){
      showToast('That file could not be read as a decisions export.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

/* ---------------- Small helpers ---------------- */

function showToast(msg){
  const t = el('toast');
  t.textContent = msg;
  t.classList.add('is-visible');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('is-visible'), 2600);
}

function playSeal(){
  const overlay = el('sealOverlay');
  overlay.classList.remove('is-active');
  void overlay.offsetWidth; // restart animation
  overlay.classList.add('is-active');
}

function escapeHtml(str){
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(str){ return escapeHtml(str).replace(/"/g, '&quot;'); }
