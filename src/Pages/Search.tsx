import { type Targeted } from "@samueldavis/solidlib";
import { useSearchParams } from "@solidjs/router";
import { createResource, ErrorBoundary, For, Suspense } from "solid-js";
import { useApi } from "../AppState";
import ErrorModal from "../Components/ErrorModal";
import TVSeries from "../Components/TVSeries";

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
            {(searchResult) => (
              <li>
                <TVSeries data={{ ...searchResult }} search />
              </li>
            )}
          </For>
        </ul>
      </ErrorBoundary>
    </Suspense>
  );
}
