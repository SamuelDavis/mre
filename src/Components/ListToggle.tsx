import type { ExtendProps } from "@samueldavis/solidlib";
import { splitProps, createSignal, createResource } from "solid-js";
import { useApi, useList, useTvSeries } from "../AppState";
import type { TVSeriesId } from "../Types";

export function ListToggle(
  props: ExtendProps<"label", { seriesId: TVSeriesId }>,
) {
  const [local, parent] = splitProps(props, ["seriesId"]);
  const list = useList();
  const tvSeries = useTvSeries();
  const request = useApi();
  const [getFetch, setFetch] = createSignal(0);
  const getLabel = (): string =>
    `${list.has(local.seriesId) ? "Remove from" : "Add to"} list`;

  const [getSearchResult] = createResource(getFetch, async (id) => {
    if (!id) return;
    const res = await request.tvSeriesDetails(props.seriesId);
    setFetch(0);
    list.add(res.id);
    tvSeries.set({
      id: res.id,
      name: res.name,
      original_name: res.original_name,
      poster_path: res.poster_path,
      first_air_date: res.first_air_date,
      overview: res.overview,
      tagline: res.tagline,
      genre_ids: res.genres.map((genre) => genre.id),
    });
  });

  function onClick(id: number): void {
    if (list.has(local.seriesId)) list.del(local.seriesId);
    else setFetch(id);
  }

  return (
    <label {...parent}>
      <input
        type="checkbox"
        role="switch"
        name={`list[${props.seriesId}]`}
        checked={list.has(local.seriesId)}
        onClick={[onClick, props.seriesId]}
        disabled={getSearchResult.loading}
      />
      <span class="ml-(--pico-block-spacing-horizontal)">{getLabel()}</span>
    </label>
  );
}
