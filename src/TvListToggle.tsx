import { Show, batch, createSignal } from "solid-js";
import { ImportantJobs, ImportantRoles } from "./constants";
import { apiFactory } from "./http";
import { tvCast, tvCrew, tvList, tvSeries } from "./state";
import {
  type Api,
  type Creator,
  type Crew,
  Gender,
  type SearchTvResult,
  type Targeted,
  type int,
} from "./types";

export default function TvListToggle(props: {
  result: Pick<SearchTvResult, "id">;
}) {
  const [getLoading, setLoading] = createSignal(false);

  function onToggleInTvList(
    id: SearchTvResult["id"],
    event: Targeted<InputEvent>,
  ) {
    if (getLoading()) return;
    if (tvList.has(id)) return tvList.remove(id);
    tvList.add(id);
    event.currentTarget.checked = tvList.has(id);
    setLoading(true);
    fetchSeriesInfo(id, true).then(() => setLoading(false));
  }

  return (
    <fieldset>
      <label>
        <input
          disabled={getLoading()}
          style={{ "margin-right": "1em" }}
          type="checkbox"
          role="switch"
          checked={tvList.has(props.result.id)}
          aria-checked={tvList.has(props.result.id)}
          onInput={[onToggleInTvList, props.result.id]}
        />
        <span>Add to List</span>
      </label>
      <Show when={getLoading()}>
        <progress />
      </Show>
    </fieldset>
  );
}

async function fetchSeriesInfo(series_id: int, withRelated: boolean) {
  const response = await apiFactory.tvSeriesDetails({ series_id });
  const { created_by, credits, ...series } = response;
  batch(() => {
    tvSeries.add(series);
    tvCast.add(series.id, credits.cast);
    tvCrew.add(series.id, credits.crew);
    tvCrew.add(series.id, created_by.map(transformCreatorToCrew));
  });

  if (withRelated) {
    const importantPeople = [
      ...credits.cast.filter((cast) => cast.order <= ImportantRoles),
      ...credits.crew.filter((crew) => ImportantJobs.includes(crew.job)),
    ];

    let peopleResponses: Api["personTvCredits"]["response"][] = [];
    for (const people of chunk(importantPeople, apiFactory.rateLimit)) {
      const requests = people.map((person) =>
        apiFactory.personTvCredits({ person_id: person.id }),
      );
      const responses = await Promise.all(requests);
      peopleResponses = peopleResponses.concat(responses);
      await sleep();
    }

    const relatedSeriesIds = peopleResponses
      .flatMap((response) => [...response.cast, ...response.crew])
      .map((credit) => credit.id);

    const seriesIds = uniq(relatedSeriesIds, (id) => id);
    for (const ids of chunk(seriesIds, apiFactory.rateLimit)) {
      await Promise.all(
        ids.map((series_id) => fetchSeriesInfo(series_id, false)),
      );
      await sleep();
    }
  }

  return series;
}

export function transformCreatorToCrew(creator: Creator): Crew {
  return {
    ...creator,
    adult: true,
    job: "Creator",
    department: "Creator",
    gender: Gender.Unknown,
    known_for_department: "Creator",
    popularity: 0,
  };
}

export async function sleep(): Promise<void> {
  await new Promise((r) => setTimeout(r, Math.random() * 1000 + 1000));
}

export function uniq<T, I = unknown>(
  array: T[],
  identity: (item: T) => I,
): T[] {
  const iterator = array
    .reduce((acc, item) => acc.set(identity(item), item), new Map<I, T>())
    .values();
  return Array.from(iterator);
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    const chunk = arr.slice(i, i + size);
    chunks.push(chunk);
  }
  return chunks;
}
