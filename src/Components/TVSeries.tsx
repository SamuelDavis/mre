import {
  HTMLIcon,
  isKeyed,
  isNonNullable,
  type ExtendProps,
} from "@samueldavis/solidlib";
import { Show, For, splitProps, createSignal, createResource } from "solid-js";
import { useApi, useAppState } from "../AppState";
import type {
  AppTVSeriesDetails,
  AppTvSeriesSearch,
  Genre,
  TVSeriesId,
} from "../Types";
import Img from "./Img";
import { TVGenres } from "../Types/Configuration";

export default function TVSeries(
  props:
    | { search: true; data: AppTvSeriesSearch }
    | { search?: false; data: AppTVSeriesDetails },
) {
  const getTagline = (): undefined | string =>
    props.search ? undefined : props.data.tagline;
  const getGenres = (): Genre[] =>
    isKeyed(props.data, "genres")
      ? props.data.genres
      : props.data.genre_ids
          .map((id) => TVGenres.find((genre) => genre.id === id))
          .filter(isNonNullable);
  const getHref = (): string =>
    `https://www.themoviedb.org/tv/${props.data.id}`;
  const getYear = (): string => props.data.first_air_date.slice(0, 4);

  return (
    <article>
      <header>
        <h1 class="mb-0">
          <span>{props.data.name} </span>
          <small class="text-xs align-super">({getYear()})</small>
        </h1>
        <Show when={props.data.original_name}>{(get) => <h2>{get()}</h2>}</Show>
        <ListToggle seriesId={props.data.id} />
      </header>
      <section class="grid gap-(--pico-block-spacing-horizontal) md:grid-cols-2">
        <div>
          <dl>
            <dt>First Aired</dt>
            <dd>{props.data.first_air_date}</dd>
            <dt>Genres</dt>
            <For each={getGenres()}>{(genre) => <dd>{genre.name}</dd>}</For>
          </dl>
          <Show when={getTagline()}>
            {(get) => (
              <q class="block mb-(--pico-block-spacing-vertical)">{get()}</q>
            )}
          </Show>
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
      <a target="_blank" class="float-right" href={getHref()}>
        TMDB <HTMLIcon type="open_in_new" />
      </a>
    </article>
  );
}

function ListToggle(props: ExtendProps<"label", { seriesId: TVSeriesId }>) {
  const [local, parent] = splitProps(props, ["seriesId"]);
  const [appState] = useAppState();
  const request = useApi();
  const [getFetch, setFetch] = createSignal(0);
  const getLabel = (): string =>
    `${appState.isInList(local.seriesId) ? "Remove from" : "Add to"} list`;

  const [getSearchResult] = createResource(getFetch, async (id) => {
    if (!id) return;
    const res = await request.tvSeriesDetails(props.seriesId);
    setFetch(0);
    appState.addToList(res);
  });

  function onClick(id: number): void {
    if (appState.isInList(local.seriesId))
      appState.removeFromList(local.seriesId);
    else setFetch(id);
  }

  return (
    <label {...parent}>
      <input
        type="checkbox"
        role="switch"
        name={`list[${props.seriesId}]`}
        checked={appState.isInList(local.seriesId)}
        onClick={[onClick, props.seriesId]}
        disabled={getSearchResult.loading}
      />
      <span class="ml-(--pico-block-spacing-horizontal)">{getLabel()}</span>
    </label>
  );
}
