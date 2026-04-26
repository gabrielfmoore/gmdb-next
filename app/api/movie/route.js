import { NextResponse } from "next/server";
import { getMovieByTmdbId } from "@/lib/tmdb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawIdParam = searchParams.get("id")?.trim();

    if (!rawIdParam) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const tmdbIdString = rawIdParam.startsWith("tmdb-") ? rawIdParam.slice(5) : rawIdParam;
    if (!/^\d+$/.test(tmdbIdString)) {
      return NextResponse.json(
        { error: "Invalid id; use a TMDB numeric id (e.g. id=550)" },
        { status: 400 },
      );
    }

    const tmdbMovie = await getMovieByTmdbId(tmdbIdString);
    const imdbIdFromTmdb = tmdbMovie.external_ids?.imdb_id;
    const imdbIdForImdbCom =
      typeof imdbIdFromTmdb === "string" && imdbIdFromTmdb.startsWith("tt") ? imdbIdFromTmdb : null;
    return NextResponse.json({
      tmdbId: tmdbMovie.id,
      imdbID: imdbIdForImdbCom,
      Title: tmdbMovie.title,
      Year: tmdbMovie.release_date ? tmdbMovie.release_date.slice(0, 4) : "N/A",
      Poster: tmdbMovie.poster_path
        ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
        : "N/A",
      imdbRating: String(tmdbMovie.vote_average ?? 0),
      Ratings: [],
      overview: tmdbMovie.overview,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Movie lookup failed" },
      { status: 500 },
    );
  }
}
