import { useSearchParams } from "@solidjs/router";
import { ErrorBoundary, For, Suspense, createResource } from "solid-js";
import TvListToggle from "../TvListToggle";
import { RenderedError } from "../components";
import { apiFactory } from "../http";
import type { Targeted } from "../types";

export default function Search() {
  return (
    <article>
      <SearchForm />
      <SearchResults />
    </article>
  );
}

function SearchForm() {
  const [getQuery, setQuery] = useSearchQuery();

  function onSearchTv(event: Targeted<SubmitEvent>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = data.get("query")?.toString() ?? "";
    setQuery(query);
  }

  return (
    <form onSubmit={onSearchTv}>
      <label>
        <span>Search</span>
        <input type="search" name="query" value={getQuery()} />
      </label>
    </form>
  );
}

function SearchResults() {
  const [getQuery] = useSearchQuery();
  const [getResults] = createResource(
    () => getQuery(),
    (query) =>
      query
        ? apiFactory.searchTv({ query }).then((results) => results.results)
        : [],
  );

  return (
    <ErrorBoundary fallback={RenderedError}>
      <Suspense fallback={<progress />}>
        <For each={getResults()}>
          {(result) => (
            <article>
              <header>
                <h1>{result.name}</h1>
                <TvListToggle result={result} />
              </header>
              <p>{result.overview}</p>
            </article>
          )}
        </For>
      </Suspense>
    </ErrorBoundary>
  );
}

function useSearchQuery() {
  const [searchParams, setSearchParams] = useSearchParams<{ query: string }>();
  const getQuery = () => searchParams.query ?? "";
  const setQuery = (query: string) => setSearchParams({ query });
  return [getQuery, setQuery] as const;
}
