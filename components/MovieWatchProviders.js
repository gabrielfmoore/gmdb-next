import { tmdbLogoSrc } from "@/lib/movieDisplay";

/** @param {{ watch: object | null }} props */
export function MovieWatchProviders({ watch }) {
  if (!watch) return null;

  const { regionCode, tmdbWatchLink, stream, rent, ads, free } = watch;

  const sections = [
    { key: "stream", title: "Stream", providers: stream },
    { key: "free", title: "Free", providers: free },
    { key: "ads", title: "Free with ads", providers: ads },
    ...(rent.length > 0
      ? [{ key: "rent", title: "Rent/Buy", providers: rent }]
      : []),
  ].filter((s) => s.providers.length > 0);

  return (
    <section className="mt-8 w-full max-w-4xl text-left" aria-labelledby="where-to-watch-heading">
      <h2 id="where-to-watch-heading" className="text-2xl font-bold mb-1">
        Where to watch
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Region: {regionCode}. Availability from{" "}
        <span className="text-gray-400">JustWatch</span> via TMDB — select a service on TMDB for
        direct links.
      </p>

      <div className="flex flex-col gap-5">
        {sections.map(({ key, title, providers }) => (
          <div key={key}>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{title}</h3>
            <ul className="flex flex-wrap gap-2">
              {providers.map((p) => (
                <li key={`${key}-${p.id}`}>
                  <a
                    href={tmdbWatchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-600/80 px-2 py-1.5 text-sm text-gray-200 transition-colors"
                  >
                    {p.logoPath ? (
                      <img
                        src={tmdbLogoSrc(p.logoPath, "w45")}
                        alt=""
                        width={36}
                        height={36}
                        className="rounded shrink-0"
                      />
                    ) : null}
                    <span>{p.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        <a
          href={tmdbWatchLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-200/90 hover:text-amber-100 underline underline-offset-2"
        >
          Open full watch options on The Movie Database
        </a>
      </p>
      <p className="mt-2 text-[11px] text-gray-600 leading-snug">
        Streaming availability data provided by{" "}
        <a
          href="https://www.justwatch.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-400 underline underline-offset-2"
        >
          JustWatch
        </a>
        .
      </p>
    </section>
  );
}
