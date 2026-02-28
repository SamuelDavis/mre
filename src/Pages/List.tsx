import { For } from "solid-js";
import { useAppState } from "../AppState";
import TVSeries from "../Components/TVSeries";

export default function List() {
  const [appState] = useAppState();

  return (
    <article>
      <header>
        <h1>List</h1>
      </header>
      <For each={appState.list}>{(data) => <TVSeries data={data} />}</For>
    </article>
  );
}
