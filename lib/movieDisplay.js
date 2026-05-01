export const NO_POSTER = "/images/no-poster.svg";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

/** Watch-provider logos (TMDB); keep small for badges. */
export function tmdbLogoSrc(logoPath, size = "w45") {
  if (logoPath == null || typeof logoPath !== "string") return "";
  const normalized = logoPath.trim();
  if (normalized === "") return "";
  const pathPart = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `https://image.tmdb.org/t/p/${size}${pathPart}`;
}

/**
 * Poster URL from search (`Poster`: full URL or "N/A") or TMDB detail (`poster_path`).
 */
export function posterSrc(value) {
  if (value == null) return NO_POSTER;
  if (typeof value !== "string") return NO_POSTER;
  const normalized = value.trim();
  if (normalized === "" || normalized === "N/A") return NO_POSTER;
  if (normalized.startsWith("http")) return normalized;
  return `${TMDB_IMAGE_BASE}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}

export function releaseYear(releaseDate) {
  if (releaseDate == null || typeof releaseDate !== "string") return "";
  const y = releaseDate.trim().slice(0, 4);
  return /^\d{4}$/.test(y) ? y : "";
}

/** TMDB `runtime` is total minutes → always `Xh XXm` (two-digit minutes). */
export function formatRuntimeMinutes(totalMinutes) {
  const n = Number(totalMinutes);
  if (!Number.isFinite(n) || n <= 0) return "";
  const hours = Math.floor(n / 60);
  const mins = Math.round(n % 60);
  const mm = String(mins).padStart(2, "0");
  return `${hours}h ${mm}m`;
}
