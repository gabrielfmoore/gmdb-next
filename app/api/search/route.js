import { NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

function mapTmdbSearchResultToListItem(tmdbResult) {
  return {
    tmdbId: tmdbResult.id,
    imdbID: `tmdb-${tmdbResult.id}`,
    Title: tmdbResult.title || "Untitled",
    Year: tmdbResult.release_date ? tmdbResult.release_date.slice(0, 4) : "N/A",
    Poster: tmdbResult.poster_path
      ? `https://image.tmdb.org/t/p/w500${tmdbResult.poster_path}`
      : "N/A",
    imdbRating: String(tmdbResult.vote_average ?? 0),
    Ratings: [],
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("q")?.trim() || "";
    const pageNumber = Number(searchParams.get("page") || "1");

    if (!searchQuery) {
      return NextResponse.json({
        Search: [],
        totalResults: "0",
        Response: "True",
      });
    }

    const tmdbJson = await searchMovies(searchQuery, pageNumber);
    const searchListItems = (tmdbJson.results || []).map(mapTmdbSearchResultToListItem);

    return NextResponse.json({
      Search: searchListItems,
      totalResults: String(tmdbJson.total_results ?? 0),
      total_pages: tmdbJson.total_pages,
      page: tmdbJson.page,
      Response: "True",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 },
    );
  }
}
