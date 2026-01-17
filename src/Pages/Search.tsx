import {
  HTMLDate,
  isInstanceOf,
  type ExtendProps,
  type Targeted,
} from "@samueldavis/solidlib";
import { useApiKey, useSearchQuery } from "../AppState";
import { createResource, For, Show, splitProps, Suspense } from "solid-js";
import { ApiError, type AssetPath, type SearchResults } from "../types";
import ErrorModal from "../Components/ErrorModal";
import ImageAsset from "../Components/ImageAsset";

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
  const [getApiKey] = useApiKey();
  const [resource] = createResource(getQuery, async (value) => {
    if (!value) return undefined;

    const url = new URL("https://api.themoviedb.org/3/search/multi");
    url.searchParams.set("query", value);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${getApiKey()}` },
    });
    const text = await response.text();
    const json = JSON.parse(text);

    if (!response.ok) throw new ApiError(json);

    return json as SearchResults;
  });

  function onReset() {
    setQuery();
  }

  return (
    <ErrorModal reset={onReset}>
      <Suspense fallback={<progress />}>
        <ul>
          <For
            each={resource()?.results}
            fallback={<p>No results, try searching for something.</p>}
          >
            {(result) => <SearchResult value={result} />}
          </For>
        </ul>
      </Suspense>
    </ErrorModal>
  );
}

function SearchResult(
  props: ExtendProps<
    "aside",
    { value: SearchResults["results"][number] },
    "children"
  >,
) {
  const [local, parent] = splitProps(props, ["value"]);
  const data = normalizeSearchResult(local.value);

  if (isInstanceOf(data, Error))
    return (
      <aside {...parent}>
        <details>
          <summary>
            <h5>{data.message}</h5>
          </summary>
          <pre>{JSON.stringify(data.cause, null, 2)}</pre>
        </details>
      </aside>
    );

  return (
    <aside {...parent}>
      <header>
        <div role="group">
          <h2>{data.name}</h2>
          <HTMLDate value={data.date} />
        </div>
        <Show when={data.originalName && data.originalName !== data.name}>
          <q>{data.originalName}</q>
        </Show>
      </header>
      <form onSubmit={(e) => e.preventDefault()}>
        <label aria-disabled={false}>
          <input type="checkbox" role="switch" />
          <span>Add to List</span>
        </label>
        <progress />
      </form>
      <section role="group">
        <ImageAsset
          type="poster"
          size="w154"
          path={data.poster}
          style={{ "object-fit": "contain" }}
        />
        <p>{data.overview}</p>
      </section>
    </aside>
  );
}

function normalizeSearchResult(value: SearchResults["results"][number]):
  | Error
  | {
      type: string;
      name: string;
      originalName: string;
      overview: string;
      date: Date;
      poster: AssetPath;
    } {
  switch (value.media_type) {
    case "tv":
      return {
        type: value.media_type,
        name: value.name,
        originalName: value.original_name,
        date: new Date(value.first_air_date),
        poster: value.poster_path,
        overview: value.overview,
      };
    case "movie":
      return {
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
