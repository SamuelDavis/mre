import { HTMLIcon, type Targeted } from "@samueldavis/solidlib";
import { A } from "@solidjs/router";
import { useAppState } from "../AppState";
import { produce } from "solid-js/store";

export default function Home() {
  return (
    <article>
      <header>
        <h1>Home</h1>
      </header>
      <ApiKeyInput />
    </article>
  );
}

function ApiKeyInput() {
  const [appState, setAppState] = useAppState();

  function onInput(event: Targeted<HTMLInputElement>): void {
    setAppState(produce((state) => (state.apiKey = event.currentTarget.value)));
  }

  return (
    <label>
      <span>The Movie Database Api Key </span>
      <A
        target="_blank"
        href="https://developer.themoviedb.org/docs/getting-started"
      >
        <HTMLIcon type="help" />
      </A>
      <input type="text" onInput={onInput} value={appState.apiKey} />
    </label>
  );
}
