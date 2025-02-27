import {
  ErrorBoundary,
  For,
  createResource,
  createEffect,
  createSignal,
  Show,
  Suspense,
} from "solid-js";
import { api } from "./http";
import { RenderedError } from "./components";
import type { Show as TShow } from "./types";
import state from "./state";

export default function SearchResult(props: { show: TShow }) {
  const getGenres = () => {
    const genres = props.show.genre_ids.map((id) => {
      const genre = state.getGenreNameById(id);
      if (genre) return genre;
      throw new Error(`Genre ${id} not found.`);
    });
    return genres.length ? genres : undefined;
  };

  return (
    <article>
      <header>
        <h1>{props.show.name}</h1>
        <Show when={props.show.original_name !== props.show.name}>
          <h5>{props.show.original_name}</h5>
        </Show>
        <ToggleInList value={props.show} />
      </header>
      <dl>
        <Show when={getGenres()}>
          {(getGenres) => (
            <>
              <dt>Genres</dt>
              <dd>
                <ul role="group">
                  <For each={getGenres()}>
                    {(genre) => <li>{genre.name}</li>}
                  </For>
                </ul>
              </dd>
            </>
          )}
        </Show>
        <dt>First Aired</dt>
        <dd>{props.show.first_air_date}</dd>
      </dl>
      <blockquote>{props.show.overview}</blockquote>
    </article>
  );
}

function ToggleInList(props: { value: TShow }) {
  const [getAdded, setAdded] = createSignal(state.inList(props.value));
  const [request] = createResource(
    () => getAdded() || undefined,
    async () => {
      const tvPeople = await api.tvPeople({ series_id: props.value.id });
      state.addCast(props.value.id, tvPeople.cast);
      state.addCrew(props.value.id, tvPeople.crew);
      return null;
    },
  );

  createEffect(() => {
    if (getAdded()) state.addToList(props.value);
    else state.removeFromList(props.value);
  });

  function onInput(event: { currentTarget: HTMLInputElement }) {
    setAdded(event.currentTarget.checked);
  }

  return (
    <label>
      <span>Add to List</span>
      <input
        type="checkbox"
        role="switch"
        checked={getAdded()}
        aria-checked={getAdded()}
        onInput={onInput}
      />
      <ErrorBoundary fallback={RenderedError}>
        <Suspense fallback={<progress />}>{request()}</Suspense>
      </ErrorBoundary>
    </label>
  );
}
