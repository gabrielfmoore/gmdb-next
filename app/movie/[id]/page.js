import Link from "next/link";
import { MovieHeroPane } from "@/components/MovieHeroPane";
import { MovieRecommendationsStrip } from "@/components/MovieRecommendationsStrip";
import {
  directorsFromCrew,
  directorsFromCrewList,
  genreNames,
  topCastList,
  writersFromCrew,
  writersFromCrewList,
} from "@/lib/movieFacts";
import { fetchOmdbByImdbId, parseOmdbRatings } from "@/lib/omdb";
import { getMovieByTmdbId } from "@/lib/tmdb";
import { formatRuntimeMinutes, posterSrc, releaseYear } from "@/lib/movieDisplay";

export default async function Movie({ params }) {
  const { id } = await params;
  const movie = await getMovieByTmdbId(id);
  const title = movie.title || "Movie";
  const src = posterSrc(movie.poster_path);
  const year = releaseYear(movie.release_date);
  const runtimeLabel = formatRuntimeMinutes(movie.runtime);
  const imdbId =
    movie.external_ids?.imdb_id ||
    (typeof movie.imdb_id === "string" && movie.imdb_id.startsWith("tt")
      ? movie.imdb_id
      : null);
  const imdbHref = imdbId ? `https://www.imdb.com/title/${imdbId}/` : null;

  const omdbJson = imdbId ? await fetchOmdbByImdbId(imdbId) : null;
  const omdbRatings = parseOmdbRatings(omdbJson);

  const genres = genreNames(movie.genres);
  const director = directorsFromCrew(movie.credits?.crew);
  const writers = writersFromCrew(movie.credits?.crew);
  const directorPeople = directorsFromCrewList(movie.credits?.crew);
  const writerPeople = writersFromCrewList(movie.credits?.crew);
  const cast = topCastList(movie.credits?.cast, 10);
  const recommendations = Array.isArray(movie.recommendations?.results)
    ? movie.recommendations.results.slice(0, 10)
    : [];

  const tmdbVote =
    movie.vote_average != null && Number.isFinite(Number(movie.vote_average))
      ? `${Number(movie.vote_average).toFixed(1)}/10`
      : null;
  const tmdbVotes =
    movie.vote_count != null && Number.isFinite(Number(movie.vote_count))
      ? Number(movie.vote_count)
      : null;

  return (
    <main>
      <div className="gmdb-container w-full text-white">
        <div className="flex flex-col justify-center items-center w-full max-w-4xl self-stretch mx-auto mt-4 px-4 sm:px-6">
          <MovieHeroPane
            src={src}
            title={title}
            year={year}
            tagline={movie.tagline}
            genres={genres}
            runtimeLabel={runtimeLabel}
            imdbHref={imdbHref}
            omdbRatings={omdbRatings}
            showOmdbHint={!process.env.OMDB_API_KEY && Boolean(imdbHref)}
            cast={cast}
          />
          <h2 className="text-2xl font-bold">Overview</h2>
          {movie.overview ? (
            <p className="text-sm text-gray-300 mx-[5vw] lg:mx-0">
              {movie.overview}
            </p>
          ) : null}
          <div className="w-auto mt-3 mx-[6vw] lg:mx-3 self-start flex flex-col items-start justify-start text-left">
            {director ? (
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-gray-400">Director:</span>{" "}
                {directorPeople.length > 0
                  ? directorPeople.map((person, index) => (
                      <span key={person.id}>
                        {index > 0 ? ", " : ""}
                        <Link
                          href={`/person/${person.id}`}
                          className="text-gray-300 hover:text-white"
                        >
                          {person.name}
                        </Link>
                      </span>
                    ))
                  : director}
              </p>
            ) : null}
            {writers ? (
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-gray-400">Writer:</span>{" "}
                {writerPeople.length > 0
                  ? writerPeople.map((person, index) => (
                      <span key={person.id}>
                        {index > 0 ? ", " : ""}
                        <Link
                          href={`/person/${person.id}`}
                          className="text-gray-300 hover:text-white"
                        >
                          {person.name}
                        </Link>
                      </span>
                    ))
                  : writers}
              </p>
            ) : null}
          </div>

          {recommendations.length > 0 ? (
            <MovieRecommendationsStrip recommendations={recommendations} />
          ) : null}
        </div>
      </div>
    </main>
  );
}
