import { For } from "solid-js";
import TvListToggle from "../TvListToggle";
import { tvCast, tvCrew, tvList, tvSeries } from "../state";

export default function List() {
  const getTvSeriesInList = () => {
    const list = tvList.get();
    const series = tvSeries.get();
    return series.filter((series) => list.includes(series.id));
  };
  return (
    <For each={getTvSeriesInList()}>
      {(item) => (
        <article>
          <header>
            <h1>{item.name}</h1>
            <TvListToggle result={item} />
          </header>
          <p>{item.overview}</p>
          <details>
            <summary>Cast</summary>
            <For each={tvCast.getBySeries(item)}>
              {(cast) => (
                <article>
                  <h3>{cast.name}</h3>
                  <h5>{cast.character}</h5>
                </article>
              )}
            </For>
          </details>
          <details>
            <summary>Crew</summary>
            <For each={tvCrew.getBySeries(item)}>
              {(cast) => (
                <article>
                  <h3>{cast.name}</h3>
                  <h5>{cast.job}</h5>
                </article>
              )}
            </For>
          </details>
        </article>
      )}
    </For>
  );
}
