import { HTMLIcon, isNonNullable, type Targeted } from "@samueldavis/solidlib";
import { useSearchParams } from "@solidjs/router";
import { createResource, ErrorBoundary, For, Show, Suspense } from "solid-js";
import { useApi } from "../AppState";
import ErrorModal from "../Components/ErrorModal";
import Img from "../Components/Img";
import { TVGenres } from "../Types/Configuration";
import { ListToggle } from "../Components/ListToggle";

export default function Search() {
  return (
    <article>
      <header>
        <h1>Search</h1>
      </header>
      <SearchForm />
      <SearchResultList />
    </article>
  );
}

function SearchForm() {
  const [searchParams, setSearchParams] = useSearchParams<{ q: string }>();

  function onSubmit(event: Targeted<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const q = data.get("q")?.toString();
    setSearchParams({ q });
  }

  return (
    <form onSubmit={onSubmit} role="search">
      <input type="search" name="q" value={searchParams.q || ""} />
      <input type="submit" value="Search" />
    </form>
  );
}

function SearchResultList() {
  const request = useApi();
  const [searchParams, setSearchParams] = useSearchParams<{ q: string }>();
  const [getSearchResults] = createResource(
    () => searchParams.q,
    async (q) => (await request.searchTV(q)).results,
  );

  function fallback(): void {
    setSearchParams({ q: null });
  }

  return (
    <Suspense fallback={<progress />}>
      <ErrorBoundary fallback={ErrorModal.fallback(fallback)}>
        <ul>
          <For each={getSearchResults()}>
            {(data) => {
              const getGenres = () =>
                data.genre_ids
                  .map((id) => TVGenres.find((genre) => genre.id === id))
                  .filter(isNonNullable);
              const getHref = (): string =>
                `https://www.themoviedb.org/tv/${data.id}`;
              const getYear = (): string => data.first_air_date.slice(0, 4);

              return (
                <li>
                  <article>
                    <header>
                      <h1 class="mb-0">
                        <span>{data.name} </span>
                        <small class="text-xs align-super">({getYear()})</small>
                      </h1>
                      <Show when={data.original_name}>
                        {(get) => <h2>{get()}</h2>}
                      </Show>
                      <ListToggle seriesId={data.id} />
                    </header>
                    <section class="grid gap-(--pico-block-spacing-horizontal) md:grid-cols-2">
                      <div>
                        <dl>
                          <dt>First Aired</dt>
                          <dd>{data.first_air_date}</dd>
                          <dt>Genres</dt>
                          <For each={getGenres()}>
                            {(genre) => <dd>{genre.name}</dd>}
                          </For>
                        </dl>
                        <p>{data.overview}</p>
                      </div>
                      <Img
                        type="poster"
                        size="w342"
                        path={data.poster_path}
                        class="place-self-center"
                      />
                    </section>
                    <details>
                      <summary>Details</summary>
                      <pre>{JSON.stringify(data, null, 2)}</pre>
                    </details>
                    <a target="_blank" class="float-right" href={getHref()}>
                      TMDB <HTMLIcon type="open_in_new" />
                    </a>
                  </article>
                </li>
              );
            }}
          </For>
        </ul>
      </ErrorBoundary>
    </Suspense>
  );
}
