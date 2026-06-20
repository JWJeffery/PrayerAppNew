(function bibleNabreSelectorBridgeFactory(root) {
  const NABRE_VALUE = "NABRE";
  const NABRE_SOURCE_LANE_ID = "NABRE_INTERNAL";
  const NABRE_LABEL = "NABRE";

  function sourceLaneBrowser() {
    return root.UniversalOfficeBibleSourceLaneBrowser || null;
  }

  function normalize(value) {
    return String(value || "").trim().toUpperCase();
  }

  function looksLikeBibleTranslationSelect(select) {
    const text = Array.from(select.options || [])
      .map((option) => `${option.value} ${option.textContent}`)
      .join(" ")
      .toUpperCase();

    if (/NRSV|ROTHERHAM|DRB|DOUAY|TRANSLATION|VERSION/.test(text)) return true;

    const idName = `${select.id || ""} ${select.name || ""} ${select.getAttribute?.("aria-label") || ""}`.toUpperCase();
    return /BIBLE|TRANSLATION|VERSION/.test(idName);
  }

  function findTranslationSelects() {
    return Array.from(document.querySelectorAll("select")).filter(looksLikeBibleTranslationSelect);
  }

  function ensureNabreOption(select) {
    const existing = Array.from(select.options || []).find((option) => normalize(option.value) === NABRE_VALUE || normalize(option.dataset?.sourceLaneId) === NABRE_SOURCE_LANE_ID);
    if (existing) return false;

    const option = document.createElement("option");
    option.value = NABRE_VALUE;
    option.textContent = NABRE_LABEL;
    option.dataset.sourceLane = "true";
    option.dataset.sourceLaneId = NABRE_SOURCE_LANE_ID;
    option.dataset.translationKey = "NABRE";
    select.appendChild(option);
    return true;
  }

  function findReferenceInputs() {
    const candidates = Array.from(document.querySelectorAll("input, textarea, [contenteditable='true']"));
    return candidates.filter((node) => {
      const haystack = `${node.id || ""} ${node.name || ""} ${node.placeholder || ""} ${node.getAttribute?.("aria-label") || ""}`.toUpperCase();
      return /PASSAGE|REFERENCE|VERSE|BIBLE|SEARCH/.test(haystack);
    });
  }

  function parseReference(raw) {
    const text = String(raw || "").trim();
    const match = text.match(/^([1-4]?\s*[A-Za-z][A-Za-z\s]+?)\s+(\d+)\s*:\s*(\d+)(?:\s*[-–]\s*(\d+))?$/);
    if (!match) return null;

    return {
      bookId: match[1].trim().replace(/\s+/g, "_").toUpperCase(),
      chapter: Number(match[2]),
      verseStart: Number(match[3]),
      verseEnd: match[4] ? Number(match[4]) : Number(match[3])
    };
  }

  function resultHost() {
    return (
      document.querySelector("#bible-source-lane-result") ||
      document.querySelector("#bible-results") ||
      document.querySelector("[data-bible-results]") ||
      document.querySelector(".bible-results") ||
      document.querySelector("#bible-browser") ||
      document.querySelector("[data-bible-browser]") ||
      document.querySelector("main") ||
      document.body
    );
  }

  function renderResolved(resolved) {
    const host = resultHost();
    if (!host) return false;

    const wrapper = document.createElement("section");
    wrapper.className = "bible-nabre-selector-bridge-result";
    wrapper.dataset.nabreSelectorBridge = "true";

    const heading = document.createElement("h3");
    heading.textContent = `${resolved.translationKey} — ${resolved.bookId} ${resolved.chapter}:${resolved.verseStart}${resolved.verseEnd !== resolved.verseStart ? `-${resolved.verseEnd}` : ""}`;
    wrapper.appendChild(heading);

    for (const verse of resolved.verses) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = `${verse.verse}. `;
      p.appendChild(strong);
      p.appendChild(document.createTextNode(verse.text));
      wrapper.appendChild(p);
    }

    const prior = host.querySelector?.("[data-nabre-selector-bridge='true']");
    if (prior) prior.remove();

    host.appendChild(wrapper);
    return true;
  }

  async function resolveCurrentNabreSelection(select) {
    if (normalize(select.value) !== NABRE_VALUE && normalize(select.selectedOptions?.[0]?.dataset?.sourceLaneId) !== NABRE_SOURCE_LANE_ID) return false;

    const api = sourceLaneBrowser();
    if (!api) throw new Error("UniversalOfficeBibleSourceLaneBrowser is not loaded");

    const referenceInput = findReferenceInputs()[0];
    const parsed = parseReference(referenceInput?.value || "John 1:1");
    if (!parsed) return false;

    const resolved = await api.resolveInternalSourceLanePassage({
      laneId: NABRE_SOURCE_LANE_ID,
      ...parsed
    });

    return renderResolved(resolved);
  }

  function install() {
    const selects = findTranslationSelects();
    if (!selects.length) return { installed: false, reason: "no translation select found", patchedSelectCount: 0 };

    let patchedSelectCount = 0;

    for (const select of selects) {
      if (ensureNabreOption(select)) patchedSelectCount += 1;

      if (!select.dataset.nabreSelectorBridgeInstalled) {
        select.dataset.nabreSelectorBridgeInstalled = "true";
        select.addEventListener("change", () => {
          resolveCurrentNabreSelection(select).catch((error) => {
            console.error("NABRE selector bridge failed", error);
          });
        });
      }
    }

    root.UniversalOfficeNabreSelectorBridge = {
      installed: true,
      patchedSelectCount,
      selectCount: selects.length,
      resolveCurrentNabreSelection
    };

    return root.UniversalOfficeNabreSelectorBridge;
  }

  function installWhenReady() {
    const first = install();
    if (first.installed) return;

    root.addEventListener?.("universal-office:bible-source-lanes-ready", install, { once: true });

    setTimeout(() => {
      if (!root.UniversalOfficeNabreSelectorBridge?.installed) install();
    }, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installWhenReady, { once: true });
  } else {
    installWhenReady();
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
