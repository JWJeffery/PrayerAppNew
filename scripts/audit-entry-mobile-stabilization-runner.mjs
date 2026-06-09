#!/usr/bin/env node
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const browserSweep = fs.readFileSync("scripts/browser-qc-entry-mobile-stabilization-sweep.js", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const index = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("css/office.css", "utf8");
const tooltip = fs.readFileSync("js/tooltip.js", "utf8");
const releaseScript = fs.readFileSync("scripts/prepare-web-release.mjs", "utf8");
const officeUi = fs.readFileSync("js/office-ui.js", "utf8");

const failures = [];
let checks = 0;

function check(label, condition) {
    checks += 1;
    if (!condition) failures.push(label);
}

function requireIncludes(label, text, markers) {
    for (const marker of markers) {
        check(label + " includes " + marker, text.includes(marker));
    }
}

requireIncludes("entry/mobile browser sweep core", browserSweep, [
    "window.runEntryMobileStabilizationSweep",
    "window.__lastEntryMobileStabilizationSweep",
    "[Entry/Mobile QC]",
    "verifyEntrySurfaces",
    "verifySidebarToggle",
    "verifySharedSelectorOverflow",
    "verifyTooltipContainment",
    "verifyMobileLabelBounds",
    "rectWithinViewport",
    "console.table(results)"
]);

requireIncludes("entry/mobile browser sweep mode coverage", browserSweep, [
    "BCP Daily Office",
    "Oriental Orthodoxy / Ethiopian Sa'atat",
    "Church of the East",
    "Eastern Orthodoxy / Horologion",
    "settings-panel",
    "ethiopian-settings",
    "east-syriac-settings",
    "generic-settings"
]);

requireIncludes("mobile tooltip engine source markers", tooltip, [
    "function positionTooltipFromPoint(clientX, clientY)",
    "viewportWidth() - 24",
    "clamp(left, margin",
    "document.addEventListener('click'",
    "document.addEventListener('scroll', hideTooltip, true)"
]);

requireIncludes("mobile close rail CSS markers", css, [
    "Mobile sidebar close rail visibility",
    "body.office-active #sidebar-toggle",
    "position: fixed !important",
    "z-index: 900 !important",
    "left: 42px !important"
]);

requireIncludes("hour-selector internal-scroll removal markers", css, [
    "Shared office hour selector internal-scroll removal",
    ".shared-office-nav-options",
    "max-height: none !important",
    "overflow-y: visible !important"
]);

requireIncludes("advanced selector gate markers", index, [
    "data-advanced-only=\"true\" hidden aria-hidden=\"true\"",
    "id=\"user-profile-defaults\" class=\"app-profile-defaults app-advanced-only\""
]);

check("release allowlists entry/mobile browser QC script", releaseScript.includes("const browserQcReleaseFiles = [") && releaseScript.includes("scripts/browser-qc-entry-mobile-stabilization-sweep.js") && releaseScript.includes("browserQcReleaseFiles: copiedBrowserQcReleaseFiles"));

check("selectMode enforces office drawer exclusivity", officeUi.includes("Mode transition invariant: exactly one office drawer is active for the selected mode.") && officeUi.includes("const esySettings   = document.getElementById('east-syriac-settings');") && officeUi.includes("const genSettings   = document.getElementById('generic-settings');") && officeUi.includes("toggleSidebar()\n    // cannot target a stale drawer after cross-tradition navigation."));

check("browser QC asserts drawer exclusivity", browserSweep.includes("function assertExclusiveOfficeDrawer(test)") && browserSweep.includes("stale drawer remained active") && browserSweep.includes("stale drawer remained open"));

check("package exposes audit script", packageJson.scripts?.["audit:entry-mobile-stabilization"] === "node scripts/audit-entry-mobile-stabilization-runner.mjs");

execFileSync("node", ["--check", "scripts/browser-qc-entry-mobile-stabilization-sweep.js"], { stdio: "pipe" });

if (failures.length) {
    console.error("FAIL entry/mobile stabilization audit");
    for (const failure of failures) console.error(" - " + failure);
    process.exit(1);
}

console.log("PASS entry/mobile stabilization audit: " + checks + " check(s) passed.");
