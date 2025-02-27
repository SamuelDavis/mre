import { useSearchParams } from "@solidjs/router";
import { Suspense, createEffect } from "solid-js";
import { ErrorBoundary, For, createResource } from "solid-js";
import { RenderedError } from "../components";
import { api } from "../http";
import state from "../state";
import TvShow from "../TvShow";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams<{ query: string }>();
  const getQuery = () => searchParams.query ?? "";
  const setQuery = (query: string) => setSearchParams({ query });

  return (
    <article>
      <SearchForm getQuery={getQuery} setQuery={setQuery} />
      <ErrorBoundary fallback={RenderedError}>
        <SearchResults getQuery={getQuery} />
      </ErrorBoundary>
    </article>
  );
}

function SearchForm(props: {
  getQuery: () => string;
  setQuery: (value: string) => void;
}) {
  function onSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = data.get("query")?.toString() ?? "";
    props.setQuery(query);
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        <span>Search</span>
        <input type="search" name="query" value={props.getQuery()} />
      </label>
    </form>
  );
}

function SearchResults(props: { getQuery: () => string }) {
  const [getResults] = createResource(props.getQuery, async (query) =>
    query ? api.searchTv({ query }).then((response) => response.results) : [],
  );

  createEffect(() => {
    state.addShows(getResults() ?? []);
  });

  return (
    <Suspense fallback={<progress />}>
      <For
        each={getResults()}
        fallback={props.getQuery() ? "No results found." : undefined}
      >
        {(show) => <TvShow show={show} />}
      </For>
    </Suspense>
  );
}
