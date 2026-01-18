import { type ExtendProps, type Targeted } from "@samueldavis/solidlib";
import { useApi, useSearchQuery } from "../AppState";
import { createResource, Suspense } from "solid-js";
import { type MediaItem, type SearchResults } from "../types";
import ErrorModal from "../Components/ErrorModal";
import MediaList from "../Components/MediaList";

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

function SearchForm(props: ExtendProps<"form", {}, "children" | "onSubmit">) {
  const [getQuery, setQuery] = useSearchQuery();

  function onSubmit(event: Targeted<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = data.get("q")?.toString().trim() || undefined;
    setQuery(query);
  }

  return (
    <form onSubmit={onSubmit} {...props}>
      <label for="q">Query</label>
      <fieldset role="search">
        <input id="q" name="q" type="search" value={getQuery()} />
        <input type="submit" />
      </fieldset>
    </form>
  );
}

function SearchResultList() {
  const [getQuery, setQuery] = useSearchQuery();
  const request = useApi();
  const [resource] = createResource(getQuery, async (query) => {
    const response = await request<SearchResults>(`/search/multi`, { query });
    return response.results.map(normalizeSearchResult);
  });

  function onReset() {
    setQuery();
  }

  return (
    <ErrorModal reset={onReset}>
      <Suspense fallback={<progress />}>
        <MediaList items={resource()}>
          <p>No results, try searching for something.</p>
        </MediaList>
      </Suspense>
    </ErrorModal>
  );
}

function normalizeSearchResult(
  value: SearchResults["results"][number],
): Error | MediaItem {
  switch (value.media_type) {
    case "tv":
      return {
        id: value.id,
        type: value.media_type,
        name: value.name,
        originalName: value.original_name,
        date: new Date(value.first_air_date),
        poster: value.poster_path,
        overview: value.overview,
      };
    case "movie":
      return {
        id: value.id,
        type: value.media_type,
        name: value.title,
        originalName: value.original_title,
        date: new Date(value.release_date),
        poster: value.poster_path,
        overview: value.overview,
      };
    default:
      return new TypeError(`Unhandled media type "${value.media_type}".`, {
        cause: value,
      });
  }
}
