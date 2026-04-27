import Link from "next/link";
import { PersonHeroPane } from "@/components/PersonHeroPane";
import { getPersonByTmdbId } from "@/lib/tmdb";
import { posterSrc } from "@/lib/movieDisplay";

function creditedMovieCards(combinedCredits, limit = 24) {
  const cast = Array.isArray(combinedCredits?.cast) ? combinedCredits.cast : [];
  const crew = Array.isArray(combinedCredits?.crew) ? combinedCredits.crew : [];
  const all = cast
    .concat(crew)
    .filter((row) => row && row.media_type === "movie" && Number.isFinite(Number(row.id)));

  const dedupedById = new Map();
  for (const row of all) {
    if (!dedupedById.has(row.id)) dedupedById.set(row.id, row);
  }

  return [...dedupedById.values()]
    .sort((a, b) => {
      const aPopularity = Number(a?.popularity) || 0;
      const bPopularity = Number(b?.popularity) || 0;
      return bPopularity - aPopularity;
    })
    .slice(0, limit)
    .map((row) => ({
      id: Number(row.id),
      title: row.title || "Untitled",
      poster: posterSrc(row.poster_path),
    }));
}

function personRoleLabels(combinedCredits) {
  const roles = new Set();
  const cast = Array.isArray(combinedCredits?.cast) ? combinedCredits.cast : [];
  const crew = Array.isArray(combinedCredits?.crew) ? combinedCredits.crew : [];

  if (cast.length > 0) roles.add("Actor");

  for (const row of crew) {
    if (!row) continue;
    const job = typeof row.job === "string" ? row.job.trim() : "";
    const department = typeof row.department === "string" ? row.department.trim() : "";
    if (job === "Director") {
      roles.add("Director");
      continue;
    }
    if (job === "Writer" || job === "Screenplay" || department === "Writing") {
      roles.add("Writer");
      continue;
    }
    if (job) roles.add(job);
    else if (department) roles.add(department);
  }

  const ordered = [];
  for (const core of ["Actor", "Director", "Writer"]) {
    if (roles.has(core)) {
      ordered.push(core);
      roles.delete(core);
    }
  }
  ordered.push(...Array.from(roles));
  return ordered.slice(0, 8);
}

export default async function PersonPage({ params }) {
  const { id } = await params;
  const person = await getPersonByTmdbId(id);
  const name = person.name || "Person";
  const imageSrc = posterSrc(person.profile_path);
  const bio = typeof person.biography === "string" ? person.biography.trim() : "";
  const roles = personRoleLabels(person.combined_credits);
  const credits = creditedMovieCards(person.combined_credits);

  return (
    <main>
      <div className="gmdb-container w-full text-white min-h-[calc(100vh-64px)]">
        <div className="flex flex-col justify-center items-center w-full max-w-4xl self-stretch mx-auto mt-4 px-4 sm:px-6">
          <PersonHeroPane imageSrc={imageSrc} name={name} roles={roles} bio={bio} />

          <section className="mb-10 mx-[5vw] lg:mx-0 w-full">
            <h2 className="text-xl font-bold mb-3 mx-[5vw] lg:mx-0 mt-4">Credited titles</h2>
            {credits.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {credits.map((credit) => (
                  <Link
                    key={credit.id}
                    href={`/movie/${credit.id}`}
                    className="shrink-0 w-28 text-center text-xs text-gray-200 hover:text-white"
                  >
                    <div className="mb-1 w-full aspect-[2/3] bg-zinc-800 rounded-md overflow-hidden">
                      <img
                        src={credit.poster}
                        alt={credit.title}
                        className="block w-full h-full rounded-md object-contain"
                      />
                    </div>
                    <span className="line-clamp-2">{credit.title}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No credited movie titles.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
