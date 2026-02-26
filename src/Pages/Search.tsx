import type { Targeted } from "@samueldavis/solidlib";
import { useSearchParams } from "@solidjs/router";
import { createResource, ErrorBoundary, For, Show, Suspense } from "solid-js";
import { useAppState } from "../AppState";
import ErrorModal from "../Components/ErrorModal";
import Img from "../Components/Img";
import { tvGenres, type TVSearchResult } from "../types";
import { produce } from "solid-js/store";

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
  const [appState] = useAppState();
  const [searchParams, setSearchParams] = useSearchParams<{ q: string }>();
  const [getSearchResults] = createResource(
    () => searchParams.q,
    async (q) => {
      const url = new URL("https://api.themoviedb.org/3/search/tv");
      url.searchParams.set("query", q);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${appState.apiKey}` },
      });
      const data = await res.json();

      if (res.status !== 200 || data.success === false)
        throw new Error(
          (data.status_message ?? res.statusText) || "Something went wrong.",
          { cause: data },
        );

      return data.results ?? [];
    },
  );

  function fallback(): void {
    setSearchParams({ q: null });
  }

  return (
    <Suspense fallback={<progress />}>
      <ErrorBoundary fallback={ErrorModal.fallback(fallback)}>
        <ul>
          <For each={getSearchResults()}>
            {(searchResult) => (
              <li>
                <SearchResult data={searchResult} />
              </li>
            )}
          </For>
        </ul>
      </ErrorBoundary>
    </Suspense>
  );
}

function SearchResult(props: { data: TVSearchResult }) {
  const [appState, setAppState] = useAppState();
  const getLabel = (): string =>
    `${appState.list.includes(props.data.id) ? "Remove from" : "Add to"} list`;

  function onClick(id: number): void {
    setAppState(
      produce((state) => {
        if (state.list.includes(id))
          state.list = state.list.filter((item) => item !== id);
        else state.list.push(id);
      }),
    );
  }

  return (
    <article>
      <header>
        <h1 class="mb-0">
          <span>{props.data.name} </span>
          <small class="text-xs align-super">
            ({props.data.first_air_date.slice(0, 4)})
          </small>
        </h1>
        <Show when={props.data.original_name}>{(get) => <h2>{get()}</h2>}</Show>
        <label>
          <input
            type="checkbox"
            role="switch"
            name={`list[${props.data.id}]`}
            checked={appState.list.includes(props.data.id)}
            onClick={[onClick, props.data.id]}
          />
          <span class="ml-(--pico-block-spacing-horizontal)">{getLabel()}</span>
        </label>
      </header>
      <section class="grid gap-(--pico-block-spacing-horizontal) md:grid-cols-2">
        <div>
          <dl>
            <dt>First Aired</dt>
            <dd>{props.data.first_air_date}</dd>
            <dt>Genres</dt>
            <For each={props.data.genre_ids}>
              {(id) => (
                <dd>{tvGenres.find((genre) => genre.id === id)?.name}</dd>
              )}
            </For>
          </dl>
          <p>{props.data.overview}</p>
        </div>
        <Img
          type="poster"
          size="w342"
          path={props.data.poster_path}
          class="place-self-center"
        />
      </section>
      <details>
        <summary>Details</summary>
        <pre>{JSON.stringify(props.data, null, 2)}</pre>
      </details>
    </article>
  );
}
