import { createResource, ErrorBoundary, For, Show, splitProps } from "solid-js";
import { useApi, useList } from "../AppState";
import { HTMLIcon, type ExtendProps } from "@samueldavis/solidlib";
import Img from "../Components/Img";
import { ListToggle } from "../Components/ListToggle";
import { A } from "@solidjs/router";
import type { TvSeriesDetailsResponse } from "../Types";
import ErrorModal from "../Components/ErrorModal";

export default function List() {
  const list = useList();
  const api = useApi();

  const [getTvSeries, { mutate }] = createResource(
    list.arr,
    async function (ids) {
      let data: TvSeriesDetailsResponse[] = [];
      for await (const result of ids.map((id) => api.tvSeriesDetails(id))) {
        data = [...data, result];
        mutate(data);
      }
      return data;
    },
    { initialValue: [] },
  );

  return (
    <article>
      <header>
        <h1>List</h1>
      </header>
      <Show when={list.arr().length === 0}>
        <p class="flex gap-1">
          <span>You have no media in your list.</span>
          <span>
            Try <A href="/search">searching for something</A>.
          </span>
        </p>
      </Show>
      <Show when={getTvSeries.loading}>
        <progress />
      </Show>
      <ErrorBoundary fallback={ErrorModal.fallback()}>
        <For each={getTvSeries()}>
          {(data) => <TvSeriesListItem data={data} />}
        </For>
      </ErrorBoundary>
    </article>
  );
}

function TvSeriesListItem(
  props: ExtendProps<"article", { data: TvSeriesDetailsResponse }>,
) {
  const [local, parent] = splitProps(props, ["data"]);
  const getYear = () => local.data.first_air_date?.slice(0, 4);
  const getHref = (): string =>
    `https://www.themoviedb.org/tv/${local.data.id}`;
  const getOriginalName = () =>
    local.data.original_name && local.data.original_name !== local.data.name
      ? local.data.original_name
      : undefined;

  return (
    <article {...parent}>
      <header>
        <h1 class="mb-0">
          <span>{local.data.name} </span>
          <small class="text-xs align-super">({getYear()})</small>
        </h1>
        <Show when={getOriginalName()}>{(get) => <h2>{get()}</h2>}</Show>
        <ListToggle seriesId={local.data.id} />
      </header>
      <section class="grid gap-(--pico-block-spacing-horizontal) md:grid-cols-2">
        <div>
          <dl>
            <dt>First Aired</dt>
            <dd>{local.data.first_air_date}</dd>
            <dt>Genres</dt>
            <For each={local.data.genres} fallback={<dd>None</dd>}>
              {(genre) => <dd>{genre.name}</dd>}
            </For>
          </dl>
          <Show when={local.data.tagline}>
            {(get) => (
              <q class="block mb-(--pico-block-spacing-vertical)">{get()}</q>
            )}
          </Show>
          <p>{local.data.overview}</p>
        </div>
        <Img
          type="poster"
          size="w342"
          path={local.data.poster_path}
          class="place-self-center"
        />
      </section>
      <details>
        <summary>Details</summary>
        <pre>{JSON.stringify(local.data, null, 2)}</pre>
      </details>
      <a target="_blank" class="float-right" href={getHref()}>
        TMDB <HTMLIcon type="open_in_new" />
      </a>
    </article>
  );
}
