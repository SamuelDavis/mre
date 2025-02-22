import { createSignal, For } from "solid-js";
import state from "../state";
import TvShow from "../TvShow";

export default function List() {
  const [getSearch, setSearch] = createSignal("");
  const getShows = () => {
    const shows = state.getShows();
    const search = getSearch();

    if (!search.trim()) return shows;

    const regexp = new RegExp(search, "i");
    return shows.filter((show) =>
      regexp.test(`${show.name}\n${show.overview}`),
    );
  };

  return (
    <article>
      <h1>Saved Shows</h1>
      <header>
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="search"
            value={getSearch()}
            onInput={(e) => setSearch(e.target.value)}
          />
        </form>
      </header>
      <ul>
        <For each={getShows()}>
          {(data) => {
            return <TvShow data={data} />;
          }}
        </For>
      </ul>
    </article>
  );
}
