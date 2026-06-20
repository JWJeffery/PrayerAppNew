(function bibleSourceLaneUiHookFactory(root) {
  const PANEL_ID = "bible-source-lane-panel";
  const RESULT_ID = "bible-source-lane-result";

  function sourceLaneApi() {
    return root.UniversalOfficeBibleSourceLaneBrowser || null;
  }

  function createElement(tag, attrs = {}, text = "") {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "className") el.className = value;
      else if (key === "dataset") Object.assign(el.dataset, value);
      else el.setAttribute(key, value);
    });
    if (text) el.textContent = text;
    return el;
  }

  function findHost() {
    return (
      document.querySelector("#bible-browser") ||
      document.querySelector("[data-bible-browser]") ||
      document.querySelector(".bible-browser") ||
      document.querySelector("main") ||
      document.body
    );
  }

  function setResult(message, kind = "info") {
    const result = document.getElementById(RESULT_ID);
    if (!result) return;
    result.dataset.status = kind;
    result.textContent = message;
  }

  function renderVerses(resolved) {
    const result = document.getElementById(RESULT_ID);
    if (!result) return;

    result.dataset.status = "ok";
    result.innerHTML = "";

    const heading = createElement(
      "div",
      { className: "source-lane-result-heading" },
      `${resolved.label} — ${resolved.bookId} ${resolved.chapter}:${resolved.verseStart}${resolved.verseEnd !== resolved.verseStart ? `-${resolved.verseEnd}` : ""}`
    );

    const body = createElement("div", { className: "source-lane-result-body" });

    resolved.verses.forEach((verse) => {
      const row = createElement("p", { className: "source-lane-result-verse" });
      const marker = createElement("strong", {}, `${verse.verse}. `);
      row.appendChild(marker);
      row.appendChild(document.createTextNode(verse.text));
      body.appendChild(row);
    });

    result.appendChild(heading);
    result.appendChild(body);
  }

  async function resolveFromPanel() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;

    const api = sourceLaneApi();
    if (!api) {
      setResult("Source-lane adapter is not loaded.", "error");
      return;
    }

    const laneSelect = panel.querySelector("[name='sourceLaneId']");
    const selectedOption = laneSelect?.selectedOptions?.[0];
    const laneId = selectedOption?.dataset?.sourceLaneId || laneSelect?.value;
    const bookId = panel.querySelector("[name='sourceLaneBook']")?.value;
    const chapter = Number(panel.querySelector("[name='sourceLaneChapter']")?.value);
    const verseStart = Number(panel.querySelector("[name='sourceLaneVerseStart']")?.value);
    const verseEndRaw = panel.querySelector("[name='sourceLaneVerseEnd']")?.value;
    const verseEnd = verseEndRaw ? Number(verseEndRaw) : verseStart;

    if (!laneId || !bookId || !Number.isFinite(chapter) || !Number.isFinite(verseStart)) {
      setResult("Enter lane, book, chapter, and verse.", "error");
      return;
    }

    setResult("Loading passage…");

    try {
      const resolved = await api.resolveInternalSourceLanePassage({
        laneId,
        bookId,
        chapter,
        verseStart,
        verseEnd
      });

      if (!resolved.verses.length) {
        setResult("No text found for that reference.", "error");
        return;
      }

      renderVerses(resolved);
    } catch (error) {
      setResult(error.message || String(error), "error");
    }
  }

  function installPanel() {
    if (document.getElementById(PANEL_ID)) return document.getElementById(PANEL_ID);

    const api = sourceLaneApi();
    if (!api) return null;

    const lanes = api.listInternalSourceLanes();
    if (!lanes.length) return null;

    const panel = createElement("section", {
      id: PANEL_ID,
      className: "bible-source-lane-panel",
      "data-internal-bible-source-lanes": "true"
    });

    const title = createElement("h2", { className: "source-lane-title" }, "Bible Translation");

    const controls = createElement("div", { className: "source-lane-controls" });

    const laneSelect = createElement("select", { name: "sourceLaneId", "aria-label": "Source lane" });
    lanes.forEach((lane) => {
      const optionValue = lane.id === "NABRE_INTERNAL" ? "NABRE" : lane.id;
      const option = createElement("option", {
        value: optionValue,
        dataset: { sourceLaneId: lane.id }
      }, lane.label || lane.translationKey);
      laneSelect.appendChild(option);
    });

    const bookInput = createElement("input", {
      name: "sourceLaneBook",
      value: "JOHN",
      placeholder: "BOOK_ID",
      "aria-label": "Book ID"
    });

    const chapterInput = createElement("input", {
      name: "sourceLaneChapter",
      type: "number",
      min: "1",
      value: "1",
      "aria-label": "Chapter"
    });

    const verseStartInput = createElement("input", {
      name: "sourceLaneVerseStart",
      type: "number",
      min: "1",
      value: "1",
      "aria-label": "Start verse"
    });

    const verseEndInput = createElement("input", {
      name: "sourceLaneVerseEnd",
      type: "number",
      min: "1",
      placeholder: "end",
      "aria-label": "End verse"
    });

    const button = createElement("button", { type: "button" }, "Load Passage");
    button.addEventListener("click", resolveFromPanel);

    controls.append(laneSelect, bookInput, chapterInput, verseStartInput, verseEndInput, button);

    const result = createElement("div", {
      id: RESULT_ID,
      className: "bible-source-lane-result",
      "aria-live": "polite"
    }, "Select a Bible translation and load a passage.");

    panel.append(title, controls, result);

    const host = findHost();
    host.appendChild(panel);

    return panel;
  }

  function installWhenReady() {
    const installed = installPanel();
    if (installed) return;

    root.addEventListener?.("universal-office:bible-source-lanes-ready", installPanel, { once: true });

    setTimeout(() => {
      if (!document.getElementById(PANEL_ID)) installPanel();
    }, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installWhenReady, { once: true });
  } else {
    installWhenReady();
  }

  root.UniversalOfficeBibleSourceLaneUi = {
    installPanel,
    resolveFromPanel
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
