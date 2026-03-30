/**
 * Base collector interface
 * All collectors must export: async function collect(config) => items[]
 */

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function truncate(text, maxLen = 150) {
  if (!text) return '';
  text = text.replace(/\s+/g, ' ').trim();
  return text.length > maxLen ? text.substring(0, maxLen) + '…' : text;
}

export function createRawOutput(collectorId, items) {
  return {
    collector_id: collectorId,
    collected_at: new Date().toISOString(),
    items
  };
}
