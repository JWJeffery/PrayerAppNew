#!/usr/bin/env node

/**
 * Conservative repeat-marker migration for Universal Office JSON files.
 *
 * Updated behavior:
 * - walks JSON files under a target directory
 * - finds text items with embedded paragraph-level "(×N)" markers
 * - works for:
 *     1) top-level { type: "text", text: "..." }
 *     2) nested { type: "text", text: "..." } inside sequence.items
 * - converts valid markers into structured repeat metadata
 * - upgrades parent text blobs to { type: "sequence", items: [...] } when needed
 * - normalizes already-partially-migrated sequence children in place
 *
 * Governance rule is NOT applied here at write time.
 * We preserve repeat metadata structurally and let the renderer decide:
 *   1–3  => expand in full
 *   4+   => compress as (×N)
 *
 * Usage:
 *   node js/migrate-repeat-markers.js data/horologion --dry-run
 *   node js/migrate-repeat-markers.js data/horologion
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const targetDir = args.find(a => !a.startsWith('--')) || 'data/horologion';
const dryRun = args.includes('--dry-run');
const noBackup = args.includes('--no-backup');
const verbose = args.includes('--verbose');

const REPEAT_RE = /\s*\(×(\d+)\)\s*$/u;

function walk(dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...walk(full));
        } else if (entry.isFile() && full.toLowerCase().endsWith('.json')) {
            out.push(full);
        }
    }
    return out;
}

function splitParagraphs(text) {
    return String(text).split(/\n{2,}/);
}

function makeChildKey(parentKey, index) {
    return `${parentKey}-${index + 1}`;
}

function parseRepeatedParagraph(text) {
    const trimmed = String(text || '').trim();
    const match = trimmed.match(REPEAT_RE);
    if (!match) return null;

    const repeat = Number(match[1]);
    const cleanText = trimmed.replace(REPEAT_RE, '').trim();
    if (!cleanText) return null;

    return { text: cleanText, repeat };
}

/**
 * Case A:
 * A plain text item contains multiple paragraphs, some with "(×N)".
 * Convert the whole item into a sequence of child text items.
 */
function transformTextBlobToSequence(item, context = {}) {
    if (!item || item.type !== 'text' || typeof item.text !== 'string') {
        return { changed: false, item };
    }

    const paragraphs = splitParagraphs(item.text);
    const childItems = [];
    let foundRepeatMarker = false;

    for (const raw of paragraphs) {
        const trimmed = raw.trim();
        if (!trimmed) continue;

        const repeated = parseRepeatedParagraph(trimmed);
        const childKey = makeChildKey(item.key || 'item', childItems.length);

        if (repeated) {
            childItems.push({
                type: 'text',
                key: childKey,
                text: repeated.text,
                repeat: repeated.repeat
            });
            foundRepeatMarker = true;
        } else {
            childItems.push({
                type: 'text',
                key: childKey,
                text: trimmed
            });
        }
    }

    if (!foundRepeatMarker) {
        return { changed: false, item };
    }

    const sequence = {
        type: 'sequence',
        key: item.key
    };

    if (item.label !== undefined) sequence.label = item.label;
    if (item.note !== undefined) sequence.note = item.note;
    if (item.status !== undefined) sequence.status = item.status;

    sequence.items = childItems;

    if (verbose) {
        console.log(
            `[transform:text->sequence] ${context.file || ''} :: ${context.path || item.key}`
        );
    }

    return { changed: true, item: sequence };
}

/**
 * Case B:
 * A text item already lives inside a sequence, but still contains a single
 * paragraph ending in "(×N)". Normalize that child in place:
 *
 *   { type:"text", text:"Holy God... (×3)" }
 * becomes
 *   { type:"text", text:"Holy God...", repeat:3 }
 *
 * We do NOT replace it with a nested sequence unless it truly contains
 * multiple paragraphs.
 */
function normalizeLeafTextItem(item, context = {}) {
    if (!item || item.type !== 'text' || typeof item.text !== 'string') {
        return { changed: false, item };
    }

    const paragraphs = splitParagraphs(item.text).filter(p => p.trim() !== '');

    if (paragraphs.length !== 1) {
        return { changed: false, item };
    }

    const repeated = parseRepeatedParagraph(paragraphs[0]);
    if (!repeated) {
        return { changed: false, item };
    }

    const next = {
        ...item,
        text: repeated.text,
        repeat: repeated.repeat
    };

    if (verbose) {
        console.log(
            `[normalize:leaf-repeat] ${context.file || ''} :: ${context.path || item.key} -> repeat:${repeated.repeat}`
        );
    }

    return { changed: true, item: next };
}

function transformNode(node, context = {}, parent = null) {
    let changed = false;

    if (Array.isArray(node)) {
        const next = node.map((child, idx) => {
            const res = transformNode(
                child,
                { ...context, path: `${context.path || 'root'}[${idx}]` },
                node
            );
            if (res.changed) changed = true;
            return res.node;
        });
        return { changed, node: next };
    }

    if (!node || typeof node !== 'object') {
        return { changed: false, node };
    }

    // 1. If this is a text item inside an existing sequence, first try leaf normalization.
    if (
        node.type === 'text' &&
        typeof node.text === 'string' &&
        parent &&
        parent.type === 'sequence'
    ) {
        const normalized = normalizeLeafTextItem(node, context);
        if (normalized.changed) {
            return { changed: true, node: normalized.item };
        }
    }

    // 2. For any text item, try converting multi-paragraph blobs into a sequence.
    if (node.type === 'text' && typeof node.text === 'string') {
    const effectiveNode =
        typeof node.key === 'string'
            ? node
            : (typeof context.propKey === 'string'
                ? { ...node, key: context.propKey }
                : node);

    if (typeof effectiveNode.key === 'string') {
        const converted = transformTextBlobToSequence(effectiveNode, context);
        if (converted.changed) {
            // If key was synthesized from the parent property name and the
            // original object did not carry a key, remove it again so we do not
            // mutate fixed-slot schema more than necessary.
            if (typeof node.key !== 'string' && converted.item && converted.item.key === context.propKey) {
                const { key, ...rest } = converted.item;
                return { changed: true, node: rest };
            }
            return { changed: true, node: converted.item };
        }
    }
}

    // 3. Recurse through object properties.
    const out = {};
    for (const [k, v] of Object.entries(node)) {
        const res = transformNode(
    v,
    {
        ...context,
        path: `${context.path || 'root'}.${k}`,
        propKey: k
    },
    node
);
        if (res.changed) changed = true;
        out[k] = res.node;
    }

    return { changed, node: out };
}

function processFile(filePath) {
    let original;
    try {
        original = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        console.error(`[read-error] ${filePath}: ${err.message}`);
        return { changed: false, error: true };
    }

    let parsed;
    try {
        parsed = JSON.parse(original);
    } catch (err) {
        console.error(`[json-error] ${filePath}: ${err.message}`);
        return { changed: false, error: true };
    }

    const result = transformNode(parsed, {
        file: filePath,
        path: 'root'
    });

    if (!result.changed) {
        return { changed: false, error: false };
    }

    const updated = JSON.stringify(result.node, null, 2) + '\n';

    if (dryRun) {
        console.log(`[dry-run] would update ${filePath}`);
        return { changed: true, error: false };
    }

    try {
        if (!noBackup) {
            fs.writeFileSync(`${filePath}.bak`, original, 'utf8');
        }
        fs.writeFileSync(filePath, updated, 'utf8');
        console.log(`[updated] ${filePath}`);
        return { changed: true, error: false };
    } catch (err) {
        console.error(`[write-error] ${filePath}: ${err.message}`);
        return { changed: false, error: true };
    }
}

function main() {
    if (!fs.existsSync(targetDir)) {
    console.error(`Target path does not exist: ${targetDir}`);
    process.exit(1);
}

let files = [];
const stat = fs.statSync(targetDir);

if (stat.isDirectory()) {
    files = walk(targetDir);
    if (!files.length) {
        console.log(`No JSON files found under ${targetDir}`);
        return;
    }
} else if (stat.isFile()) {
    if (!targetDir.toLowerCase().endsWith('.json')) {
        console.log(`Target file is not a JSON file: ${targetDir}`);
        return;
    }
    files = [targetDir];
} else {
    console.log(`Unsupported target path: ${targetDir}`);
    return;
}

    let changedCount = 0;
    let errorCount = 0;

    for (const file of files) {
        const res = processFile(file);
        if (res.changed) changedCount++;
        if (res.error) errorCount++;
    }

    console.log('');
    console.log(`Scanned:  ${files.length} file(s)`);
    console.log(`Changed:  ${changedCount} file(s)`);
    console.log(`Errors:   ${errorCount} file(s)`);
    console.log(`Mode:     ${dryRun ? 'dry-run' : 'write'}`);
}

main();