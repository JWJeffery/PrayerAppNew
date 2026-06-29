import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_SOURCE_REGISTRY_PATH = 'data/bible/registry/source-registry.json';

export function loadSourceRegistry(options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const registryPath = options.registryPath || DEFAULT_SOURCE_REGISTRY_PATH;
  const registry = JSON.parse(fs.readFileSync(path.resolve(repoRoot, registryPath), 'utf8'));
  const activeSources = Array.isArray(registry.activeSources) ? registry.activeSources : [];
  const registeredIds = new Set();

  for (const item of activeSources) {
    if (item && typeof item.id === 'string' && item.id.trim()) registeredIds.add(item.id.trim());
    if (Array.isArray(item?.aliases)) {
      for (const alias of item.aliases) if (typeof alias === 'string' && alias.trim()) registeredIds.add(alias.trim());
    }
  }

  return {
    registryPath,
    phase: registry.phase || null,
    status: registry.status || null,
    trustAssertionsMade: registry.trustAssertionsMade === true,
    bibleTextMutated: registry.bibleTextMutated === true,
    sourceCollationPerformed: registry.sourceCollationPerformed === true,
    registeredTextMeaning: registry.registeredTextMeaning || null,
    registeredIds,
    isRegistered(id) {
      return typeof id === 'string' && registeredIds.has(id.trim());
    }
  };
}
