(function () {
    "use strict";

    const REGISTRY_PATHS = {
        fileManifest: "data/bible/registry/file-manifest.json",
        identityAdjudications: "data/bible/registry/identity-adjudications.json",
        bookIdentities: "data/bible/registry/book-identities.draft.json",
        canonProfileIndex: "data/bible/registry/canon-profiles/index.draft.json",
        canonStatusVocabulary: "data/bible/registry/canon-status-vocabulary.json"
    };

    let registryPromise = null;

    function rootUrl(path) {
        return String(path || "").startsWith("/") ? String(path || "") : `/${path}`;
    }

    async function fetchJson(path) {
        const response = await fetch(rootUrl(path));
        if (!response.ok) {
            throw new Error(`Unable to load Bible registry artifact: ${path} (HTTP ${response.status}).`);
        }
        return response.json();
    }

    function normalizeKey(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[’']/g, "")
            .replace(/[^a-z0-9]+/g, "");
    }

    function fileStem(sourcePath) {
        return String(sourcePath || "")
            .split("/")
            .pop()
            .replace(/\.json$/i, "");
    }

    function buildAliases(fileRecord, adjudication) {
        const aliases = new Set();

        [
            fileRecord && fileRecord.title,
            fileStem(fileRecord && fileRecord.path),
            adjudication && adjudication.preferred_title,
            adjudication && adjudication.identity_id,
            adjudication && adjudication.text_form_id
        ].forEach(value => {
            if (value) aliases.add(String(value));
        });

        return Array.from(aliases)
            .map(value => ({ label: value, normalized: normalizeKey(value) }))
            .filter(alias => alias.normalized);
    }

    function buildBookRecord(fileRecord, adjudication) {
        const sourcePath = fileRecord.path;
        const key = normalizeKey((adjudication && adjudication.identity_id) || fileStem(sourcePath));

        return {
            key,
            name: (adjudication && adjudication.preferred_title) || fileRecord.title || fileStem(sourcePath),
            corpus: fileRecord.legacy_folder || fileRecord.folder || null,
            path: sourcePath,
            aliases: buildAliases(fileRecord, adjudication),
            registry: {
                identityId: (adjudication && adjudication.identity_id) || null,
                textFormId: (adjudication && adjudication.text_form_id) || null,
                workType: (adjudication && adjudication.work_type) || null,
                ordinaryChapterVerseResolverCandidate: Boolean(adjudication && adjudication.ordinary_chapter_verse_resolver_candidate),
                adapterRequired: (adjudication && adjudication.adapter_required) || null,
                profileHints: Array.isArray(adjudication && adjudication.profile_hints) ? adjudication.profile_hints : [],
                sourcePath,
                resolverStatus: fileRecord.resolver_status || null,
                shape: fileRecord.shape || null,
                storageNote: (adjudication && adjudication.storage_note) || null
            }
        };
    }

    async function loadRegistry() {
        if (registryPromise) return registryPromise;

        registryPromise = (async () => {
            const [
                fileManifest,
                identityAdjudications,
                bookIdentities,
                canonProfileIndex,
                canonStatusVocabulary
            ] = await Promise.all([
                fetchJson(REGISTRY_PATHS.fileManifest),
                fetchJson(REGISTRY_PATHS.identityAdjudications),
                fetchJson(REGISTRY_PATHS.bookIdentities),
                fetchJson(REGISTRY_PATHS.canonProfileIndex),
                fetchJson(REGISTRY_PATHS.canonStatusVocabulary)
            ]);

            const adjudications = Array.isArray(identityAdjudications.adjudications)
                ? identityAdjudications.adjudications
                : [];

            const adjudicationByPath = new Map(adjudications.map(row => [row.source_path, row]));
            const records = [];

            for (const fileRecord of fileManifest.files || []) {
                const adjudication = adjudicationByPath.get(fileRecord.path) || null;
                records.push(buildBookRecord(fileRecord, adjudication));
            }

            const recordsByPath = new Map(records.map(record => [record.path, record]));
            const recordsByKey = new Map(records.map(record => [record.key, record]));
            const recordsByAlias = new Map();

            for (const record of records) {
                for (const alias of record.aliases || []) {
                    if (!recordsByAlias.has(alias.normalized)) {
                        recordsByAlias.set(alias.normalized, record);
                    }
                }
            }

            return {
                fileManifest,
                identityAdjudications,
                bookIdentities,
                canonProfileIndex,
                canonStatusVocabulary,
                records,
                recordsByPath,
                recordsByKey,
                recordsByAlias
            };
        })();

        return registryPromise;
    }

    async function getAllBookRecords() {
        const registry = await loadRegistry();
        return registry.records.slice();
    }

    async function getOrdinaryChapterVerseRecords() {
        const records = await getAllBookRecords();
        return records.filter(record => record.registry.ordinaryChapterVerseResolverCandidate);
    }

    async function findBookRecord(value) {
        const registry = await loadRegistry();
        const normalized = normalizeKey(value);

        return registry.recordsByKey.get(normalized)
            || registry.recordsByAlias.get(normalized)
            || registry.recordsByPath.get(String(value || ""))
            || null;
    }

    async function getRecordsForProfile(profileFamilyOrKey) {
        const target = String(profileFamilyOrKey || "").trim();
        if (!target) return [];

        const records = await getAllBookRecords();
        return records.filter(record => {
            return (record.registry.profileHints || []).some(hint => {
                return hint.profile_family === target || hint.profile_key === target;
            });
        });
    }

    window.UniversalOfficeBibleRegistryAdapter = {
        REGISTRY_PATHS,
        normalizeKey,
        loadRegistry,
        getAllBookRecords,
        getOrdinaryChapterVerseRecords,
        findBookRecord,
        getRecordsForProfile
    };
})();
