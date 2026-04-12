import {
  HTMLIcon,
  isNonNullable,
  type ExtendProps,
  type Targeted,
} from "@samueldavis/solidlib";
import { useSearchParams } from "@solidjs/router";
import {
  createResource,
  ErrorBoundary,
  For,
  Show,
  splitProps,
  Suspense,
} from "solid-js";
import { useApi } from "../AppState";
import ErrorModal from "../Components/ErrorModal";
import Img from "../Components/Img";
import { TVGenres } from "../Types/Configuration";
import { ListToggle } from "../Components/ListToggle";
import type { SearchTVResponseResult } from "../Types";
import { safe } from "../util";

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
  const api = useApi();
  const [searchParams, setSearchParams] = useSearchParams<{ q: string }>();
  const [getSearchResults] = createResource(
    () => searchParams.q,
    async (q) => (await api.searchTV(q)).results,
  );

  function fallback(): void {
    setSearchParams({ q: null });
  }

  return (
    <Suspense fallback={<progress />}>
      <ErrorBoundary fallback={ErrorModal.fallback(fallback)}>
        <ul>
          <For
            each={getSearchResults()}
            fallback={
              <Show when={searchParams.q}>
                {(get) => (
                  <li>
                    No Results found for <q>{get()}</q>.
                  </li>
                )}
              </Show>
            }
          >
            {(data) => (
              <li>
                <SearchResult data={data} />
              </li>
            )}
          </For>
        </ul>
      </ErrorBoundary>
    </Suspense>
  );
}

function SearchResult(
  props: ExtendProps<"article", { data: SearchTVResponseResult }>,
) {
  const [local, parent] = splitProps(props, ["data"]);
  const getGenres = () =>
    safe(local.data.genre_ids, [])
      .map((id) => TVGenres.find((genre) => genre.id === id))
      .filter(isNonNullable);
  const getHref = (): string =>
    `https://www.themoviedb.org/tv/${local.data.id}`;
  const getYear = (): string => local.data.first_air_date?.slice(0, 4) ?? "";

  return (
    <article {...parent}>
      <header>
        <h1 class="mb-0">
          <span>{local.data.name} </span>
          <small class="text-xs align-super">({getYear()})</small>
        </h1>
        <Show when={local.data.original_name}>{(get) => <h2>{get()}</h2>}</Show>
        <ListToggle seriesId={local.data.id} />
      </header>
      <section class="grid gap-(--pico-block-spacing-horizontal) md:grid-cols-2">
        <div>
          <dl>
            <dt>First Aired</dt>
            <dd>{local.data.first_air_date}</dd>
            <dt>Genres</dt>
            <For each={getGenres()}>{(genre) => <dd>{genre.name}</dd>}</For>
          </dl>
          <p>{local.data.overview}</p>
          <a target="_blank" href={getHref()}>
            TMDB <HTMLIcon type="open_in_new" />
          </a>
        </div>
        <Img
          type="poster"
          size="w342"
          path={local.data.poster_path}
          class="place-self-center"
        />
      </section>
      <details>
        <summary>Details</summary>
        <pre>{JSON.stringify(local.data, null, 2)}</pre>
      </details>
    </article>
  );
}
