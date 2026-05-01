/**
 * Normalize TMDB `/movie/{id}/watch/providers` for one region.
 * TMDB does not expose per-service deep links; use `tmdbWatchLink` for outbound options.
 */

/**
 * @typedef {{ id: number, name: string, logoPath?: string | null }} WatchProviderRow
 */

/**
 * @typedef {object} WatchProvidersPayload
 * @property {string} regionCode
 * @property {string} tmdbWatchLink
 * @property {WatchProviderRow[]} stream
 * @property {WatchProviderRow[]} rent - shown under "Rent/Buy" (TMDB rent list only)
 * @property {WatchProviderRow[]} ads
 * @property {WatchProviderRow[]} free
 */

/** @param {unknown[]} list */
function normalizeProviderList(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  const seen = new Set();
  for (const row of list) {
    if (!row || typeof row !== "object") continue;
    const id = row.provider_id;
    const name = row.provider_name;
    const logoPath = row.logo_path;
    if (id == null || typeof name !== "string") continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ id, name, logoPath });
  }
  return out;
}

/**
 * @param {Record<string, unknown>} results - TMDB `watch/providers` response.results
 * @param {string} preferredRegion - ISO country code, e.g. US
 */
export function pickWatchRegion(results, preferredRegion) {
  if (!results || typeof results !== "object") return null;
  const upper = String(preferredRegion || "US").toUpperCase();
  if (results[upper]) return { code: upper, data: results[upper] };
  if (results.US) return { code: "US", data: results.US };
  const keys = Object.keys(results);
  if (keys.length === 0) return null;
  const first = keys[0];
  return { code: first, data: results[first] };
}

/**
 * @param {unknown} providersJson - Full TMDB watch/providers JSON
 * @param {string} preferredRegion
 * @returns {WatchProvidersPayload | null}
 */
export function buildWatchProvidersPayload(providersJson, preferredRegion) {
  const results = providersJson?.results;
  const picked = pickWatchRegion(results, preferredRegion);
  if (!picked?.data || typeof picked.data !== "object") return null;

  const data = picked.data;
  const link = typeof data.link === "string" ? data.link : "";
  if (!link) return null;

  const stream = normalizeProviderList(data.flatrate);
  const rent = normalizeProviderList(data.rent);
  const buy = normalizeProviderList(data.buy);
  const ads = normalizeProviderList(data.ads);
  const free = normalizeProviderList(data.free);

  const hasAny =
    stream.length > 0 ||
    rent.length > 0 ||
    buy.length > 0 ||
    ads.length > 0 ||
    free.length > 0;
  if (!hasAny) return null;

  return {
    regionCode: picked.code,
    tmdbWatchLink: link,
    stream,
    rent,
    ads,
    free,
  };
}
