(function bibleSourceLaneBrowserHookFactory(root) {
  function adapter() {
    return root.UniversalOfficeBibleSourceLaneAdapter || null;
  }

  function listInternalSourceLanes() {
    const api = adapter();
    return api ? api.listLanes() : [];
  }

  async function resolveInternalSourceLanePassage(request) {
    const api = adapter();
    if (!api) throw new Error("UniversalOfficeBibleSourceLaneAdapter is not loaded");
    return api.resolvePassage(request);
  }

  function install() {
    root.UniversalOfficeBibleSourceLaneBrowser = {
      listInternalSourceLanes,
      resolveInternalSourceLanePassage
    };

    root.dispatchEvent?.(new CustomEvent("universal-office:bible-source-lanes-ready", {
      detail: { lanes: listInternalSourceLanes() }
    }));

    return root.UniversalOfficeBibleSourceLaneBrowser;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
