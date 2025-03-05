import { httpCache } from "../state";
import type { Targeted } from "../types";
import { preventDefault } from "../utilities";

export default function Home() {
  return (
    <main>
      <header>
        <ApiKeyForm />
      </header>
    </main>
  );
}

function ApiKeyForm() {
  function onUpdateApiKey(event: Targeted<InputEvent>) {
    httpCache.setApiKey(event.currentTarget.value);
  }

  return (
    <form onSubmit={preventDefault}>
      <label>
        <span>Api Key</span>&nbsp;
        <small>
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noreferrer"
          >
            More Info
          </a>
        </small>
        <input
          type="text"
          value={httpCache.getApiKey()}
          onInput={onUpdateApiKey}
        />
      </label>
    </form>
  );
}
