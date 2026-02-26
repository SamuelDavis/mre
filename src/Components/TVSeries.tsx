import type { ExtendProps } from "@samueldavis/solidlib";
import { Show, For, splitProps, createSignal, createResource } from "solid-js";
import { useAppState } from "../AppState";
import { tvGenres, type TVSearchResult, type TVSeriesDetails } from "../types";
import Img from "./Img";

export default function TVSeries(props: { data: TVSearchResult }) {
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
        <ListToggle mediaId={props.data.id} />
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

function ListToggle(props: ExtendProps<"label", { mediaId: number }>) {
  const [local, parent] = splitProps(props, ["mediaId"]);
  const [appState] = useAppState();
  const [getFetch, setFetch] = createSignal(0);
  const getLabel = (): string =>
    `${appState.isInList(local.mediaId) ? "Remove from" : "Add to"} list`;

  const [getSearchResult] = createResource(getFetch, async (id) => {
    if (!id) return;
    const res = await appState.request<TVSeriesDetails>(`/tv/${props.mediaId}`);
    setFetch(0);
    appState.addToList(res);
  });

  function onClick(id: number): void {
    if (appState.isInList(local.mediaId))
      appState.removeFromList(local.mediaId);
    else setFetch(id);
  }

  return (
    <label {...parent}>
      <input
        type="checkbox"
        role="switch"
        name={`list[${props.mediaId}]`}
        checked={appState.isInList(local.mediaId)}
        onClick={[onClick, props.mediaId]}
        disabled={getSearchResult.loading}
      />
      <span class="ml-(--pico-block-spacing-horizontal)">{getLabel()}</span>
    </label>
  );
}
