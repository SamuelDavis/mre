import { For, Show } from "solid-js";
import { useList, useTvSeries } from "../AppState";
import { HTMLIcon, isNonNullable } from "@samueldavis/solidlib";
import Img from "../Components/Img";
import { ListToggle } from "../Components/ListToggle";
import { TVGenres } from "../Types/Configuration";
import { A } from "@solidjs/router";

export default function List() {
  const list = useList();
  const tvSeries = useTvSeries();

  return (
    <article>
      <header>
        <h1>List</h1>
      </header>
      <For
        each={list.arr()}
        fallback={
          <p>
            <div>You have no media in your list.</div>
            Try <A href="/search">searching for something</A>.
          </p>
        }
      >
        {(id) => {
          const data = tvSeries.get(id);
          if (!data) return null;
          const getYear = () => data.first_air_date?.slice(0, 4);
          const getGenres = () =>
            data.genre_ids
              ?.map((id) => TVGenres.find((genre) => genre.id === id))
              .filter(isNonNullable);
          const getHref = (): string =>
            `https://www.themoviedb.org/tv/${data.id}`;
          const getOriginalName = () =>
            data.original_name && data.original_name !== data.name
              ? data.original_name
              : undefined;

          return (
            <article>
              <header>
                <h1 class="mb-0">
                  <span>{data.name} </span>
                  <small class="text-xs align-super">({getYear()})</small>
                </h1>
                <Show when={getOriginalName()}>
                  {(get) => <h2>{get()}</h2>}
                </Show>
                <ListToggle seriesId={data.id} />
              </header>
              <section class="grid gap-(--pico-block-spacing-horizontal) md:grid-cols-2">
                <div>
                  <dl>
                    <dt>First Aired</dt>
                    <dd>{data.first_air_date}</dd>
                    <dt>Genres</dt>
                    <For each={getGenres()}>
                      {(genre) => <dd>{genre.name}</dd>}
                    </For>
                  </dl>
                  <Show when={data.tagline}>
                    {(get) => (
                      <q class="block mb-(--pico-block-spacing-vertical)">
                        {get()}
                      </q>
                    )}
                  </Show>
                  <p>{data.overview}</p>
                </div>
                <Img
                  type="poster"
                  size="w342"
                  path={data.poster_path}
                  class="place-self-center"
                />
              </section>
              <details>
                <summary>Details</summary>
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </details>
              <a target="_blank" class="float-right" href={getHref()}>
                TMDB <HTMLIcon type="open_in_new" />
              </a>
            </article>
          );
        }}
      </For>
    </article>
  );
}
