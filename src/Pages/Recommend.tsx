import { A } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { useCrawl, useList, useSettings } from "../AppState";
import GraphView from "../Components/Graph";
import Inspect from "../Components/Inspect";
import SettingsPanel from "../Components/SettingsPanel";
import {
  selectGraph,
  type Candidate,
  type Model,
  type Selection,
} from "../Lib/model";

export default function Recommend() {
  const crawl = useCrawl();
  const list = useList();
  const [getSettings] = useSettings();
  const selection = createSignal<Selection>();
  const getModel = crawl.getModel;
  const getGraph = createMemo(() =>
    selectGraph(getModel(), getSettings().topK),
  );
  const getCandidates = () =>
    getModel().candidates.slice(0, getSettings().topK);
  const getIsLoading = () =>
    list.arr().some((key) => !crawl.getDetails().has(key));

  function onSelect(value: Selection): void {
    selection[1](value);
  }

  return (
    <article>
      <header>
        <h1>Recommend</h1>
        <SettingsPanel />
      </header>
      <Show
        when={list.arr().length}
        fallback={
          <p>
            <A href="/search">Add some titles</A> you liked first.
          </p>
        }
      >
        <Show when={getIsLoading()}>
          <progress />
        </Show>
        <GraphView data={getGraph()} onSelect={onSelect} />
        <p>
          <small>
            Solid blue bubbles are titles you liked, faded ones are
            recommendations, pink ones are people. Bigger means more connected.
            Zoom in to read names and roles; tap anything to see why it's here.
          </small>
        </p>
        <section>
          <h2>Recommended</h2>
          <ol>
            <For
              each={getCandidates()}
              fallback={<li>Nothing yet: add more titles you liked.</li>}
            >
              {(candidate) => (
                <li>
                  <CandidateItem
                    candidate={candidate}
                    model={getModel()}
                    onSelect={onSelect}
                  />
                </li>
              )}
            </For>
          </ol>
        </section>
        <section>
          <h2>People you like</h2>
          <ol>
            <For
              each={getModel().favorites}
              fallback={<li>No one appears in more than one of your titles.</li>}
            >
              {(favorite) => (
                <li>
                  <button
                    type="button"
                    class="link"
                    onClick={[onSelect, { type: "person", id: favorite.person.id }]}
                  >
                    {favorite.person.name}
                  </button>{" "}
                  <small>in {favorite.weight} of your titles</small>
                </li>
              )}
            </For>
          </ol>
        </section>
      </Show>
      <Inspect selection={selection} />
    </article>
  );
}

function CandidateItem(props: {
  candidate: Candidate;
  model: Model;
  onSelect: (selection: Selection) => void;
}) {
  const getReasons = (): string =>
    props.candidate.people
      .map(
        (id) =>
          `${props.model.people.get(id)?.name} (${props.model.weights.get(id)})`,
      )
      .join(", ");

  return (
    <>
      <button
        type="button"
        class="link"
        onClick={[
          props.onSelect,
          { type: "title", key: props.candidate.title.key },
        ]}
      >
        {props.candidate.title.name}
      </button>{" "}
      <small>
        {props.candidate.title.date.slice(0, 4)} · {props.candidate.title.media}{" "}
        · score {props.candidate.score}
      </small>
      <br />
      <small>{getReasons()}</small>
    </>
  );
}
