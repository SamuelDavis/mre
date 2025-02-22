import { createSignal } from "solid-js";
import { ErrorBoundary, For, Match, Switch, createResource } from "solid-js";
import TvShow from "../TvShow";
import { api } from "../http";

export default function Search() {
  const url = new URL(window.location.toString());
  const value = url.searchParams.get("query")?.toString();

  const [getQuery, setQuery] = createSignal(value ?? "");
  const [results] = createResource(() => {
    const query = getQuery();
    return query ? { query } : undefined;
  }, api.searchTv);

  function onSubmit(event: Event & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = data.get("query")?.toString();

    if (query) url.searchParams.set("query", query);
    else url.searchParams.delete("query");
    window.history.pushState(undefined, "", url.toString());

    setQuery(query ?? "");
  }

  return (
    <>
      <form onSubmit={onSubmit} role="search">
        <input type="search" name="query" id="query" value={value ?? ""} />
        <input type="submit" />
      </form>
      <ErrorBoundary fallback={(err: Error) => <p>{err.message}</p>}>
        <Switch>
          <Match when={results?.loading}>
            <progress />
          </Match>
          <Match when={results()?.results}>
            {(get) => (
              <ul>
                <For each={get()}>
                  {(result) => (
                    <li>
                      <TvShow data={result} />
                    </li>
                  )}
                </For>
              </ul>
            )}
          </Match>
        </Switch>
      </ErrorBoundary>
    </>
  );
}
