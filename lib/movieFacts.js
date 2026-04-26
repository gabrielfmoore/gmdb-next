/**
 * @param {{ job?: string; name?: string }[] | undefined} crew
 */
export function directorsFromCrew(crew) {
  if (!Array.isArray(crew)) return "";
  const names = crew
    .filter((c) => c && c.job === "Director" && typeof c.name === "string" && c.name.trim())
    .map((c) => c.name.trim());
  return [...new Set(names)].join(", ");
}

const WRITING_JOBS = new Set([
  "Writer",
  "Screenplay",
  "Story",
  "Teleplay",
  "Novel",
  "Characters",
]);

/**
 * @param {{ job?: string; name?: string; department?: string }[] | undefined} crew
 */
export function writersFromCrew(crew) {
  if (!Array.isArray(crew)) return "";
  const seen = new Set();
  const names = [];
  for (const c of crew) {
    if (!c || typeof c.name !== "string") continue;
    const name = c.name.trim();
    if (!name || seen.has(name)) continue;
    const dept = c.department || "";
    const job = c.job || "";
    if (dept === "Writing" || WRITING_JOBS.has(job)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names.join(", ");
}

/**
 * @param {{ name?: string; character?: string; profile_path?: string | null; order?: number }[] | undefined} cast
 * @param {number} limit
 */
export function topCastList(cast, limit = 10) {
  if (!Array.isArray(cast)) return [];
  const sorted = [...cast].sort(
    (a, b) => (Number(a?.order) || 999) - (Number(b?.order) || 999),
  );
  return sorted.slice(0, limit).map((c) => ({
    name: typeof c?.name === "string" ? c.name : "",
    character: typeof c?.character === "string" ? c.character : "",
    profilePath: typeof c?.profile_path === "string" ? c.profile_path : null,
  }));
}

/**
 * @param {{ name?: string }[] | undefined} genres
 */
export function genreNames(genres) {
  if (!Array.isArray(genres)) return [];
  return genres
    .map((g) => (typeof g?.name === "string" ? g.name.trim() : ""))
    .filter(Boolean);
}
