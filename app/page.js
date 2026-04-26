import { Home3DCarousel } from "@/components/Home3DCarousel";
import { posterSrc } from "@/lib/movieDisplay";
import { getPopularMovies } from "@/lib/tmdb";

function mapPopularToCarouselItems(popularResults, limit = 14) {
  return popularResults.slice(0, limit).map((movie) => ({
    id: movie.id,
    title: movie.title || "Untitled",
    poster: posterSrc(movie.poster_path),
  }));
}

export default async function Home() {
  let carouselItems = [];
  try {
    const popular = await getPopularMovies(1);
    const results = Array.isArray(popular?.results) ? popular.results : [];
    carouselItems = mapPopularToCarouselItems(results);
  } catch {
    carouselItems = [];
  }

  return (
    <div className="gmdb-container">
      <div className="welcome-message text-center">
        Search for your
        <br /> favorite movies!
      </div>
      {carouselItems.length > 0 ? <Home3DCarousel items={carouselItems} /> : null}
    </div>
  );
}
