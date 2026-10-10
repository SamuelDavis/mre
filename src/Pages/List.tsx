import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { useCrawl, useList } from "../AppState";
import TitleCard from "../Components/TitleCard";
import type { MediaKey } from "../Types/TMDB";

export default function List() {
  const list = useList();
  const crawl = useCrawl();
  const getTitle = (key: MediaKey) => crawl.getModel().titles.get(key);

  return (
    <article>
      <header>
        <h1>List</h1>
        <p>Titles you liked. Recommendations are built from their credits.</p>
      </header>
      <For
        each={list.arr()}
        fallback={
          <p>
            Your list is empty. <A href="/search">Search</A> for something you
            liked.
          </p>
        }
      >
        {(key) => (
          <Show when={getTitle(key)} fallback={<progress />}>
            {(get) => <TitleCard title={get()} />}
          </Show>
        )}
      </For>
      <Show when={list.arr().length}>
        <A href="/recommend">See recommendations</A>
      </Show>
    </article>
  );
}
