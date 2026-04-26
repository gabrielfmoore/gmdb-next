/**
 * @param {{ job?: string; name?: string }[] | undefined} crew
 */
export function directorsFromCrew(crew) {
  return directorsFromCrewList(crew)
    .map((p) => p.name)
    .join(", ");
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
  return writersFromCrewList(crew)
    .map((p) => p.name)
    .join(", ");
}

/**
 * @param {{ id?: number; job?: string; name?: string }[] | undefined} crew
 */
export function directorsFromCrewList(crew) {
  if (!Array.isArray(crew)) return [];
  const seen = new Set();
  const people = [];
  for (const c of crew) {
    const id = Number(c?.id);
    const name = typeof c?.name === "string" ? c.name.trim() : "";
    if (!name || !Number.isFinite(id) || seen.has(id) || c?.job !== "Director") continue;
    seen.add(id);
    people.push({ id, name });
  }
  return people;
}

/**
 * @param {{ id?: number; job?: string; name?: string; department?: string }[] | undefined} crew
 */
export function writersFromCrewList(crew) {
  if (!Array.isArray(crew)) return [];
  const seen = new Set();
  const people = [];
  for (const c of crew) {
    if (!c || typeof c.name !== "string") continue;
    const name = c.name.trim();
    const id = Number(c?.id);
    if (!name || !Number.isFinite(id) || seen.has(id)) continue;
    const dept = c.department || "";
    const job = c.job || "";
    if (dept === "Writing" || WRITING_JOBS.has(job)) {
      seen.add(id);
      people.push({ id, name });
    }
  }
  return people;
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
    id: Number.isFinite(Number(c?.id)) ? Number(c.id) : null,
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
