import type { Targeted } from "@samueldavis/solidlib";
import { useSearchParams } from "@solidjs/router";
import { createResource, For, Show } from "solid-js";
import { useTmdb } from "../AppState";
import TitleCard from "../Components/TitleCard";
import { isMediaResult, titleFromSummary, type Title } from "../Lib/model";

export default function Search() {
  const tmdb = useTmdb();
  const [searchParams, setSearchParams] = useSearchParams<{ q: string }>();
  const [getResults] = createResource(
    () => searchParams.q,
    async (query): Promise<Title[]> =>
      (await tmdb.search(query)).results
        .filter(isMediaResult)
        .map(titleFromSummary),
  );

  function onSubmit(event: Targeted<HTMLFormElement, SubmitEvent>): void {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q")).trim();
    setSearchParams({ q: q || undefined });
  }

  return (
    <article>
      <header>
        <h1>Search</h1>
      </header>
      <form role="search" onSubmit={onSubmit}>
        <input
          type="search"
          name="q"
          placeholder="Movies and TV"
          value={searchParams.q ?? ""}
        />
        <input type="submit" value="Search" />
      </form>
      <Show when={!getResults.error} fallback={<p>{String(getResults.error)}</p>}>
        <Show when={!getResults.loading} fallback={<progress />}>
          <For
            each={getResults()}
            fallback={
              <Show when={searchParams.q}>
                <p>
                  No results for <q>{searchParams.q}</q>.
                </p>
              </Show>
            }
          >
            {(title) => <TitleCard title={title} />}
          </For>
        </Show>
      </Show>
    </article>
  );
}
