import { useApiKey } from "../AppState";
import type { Targeted } from "../types";

export default function Home() {
  return (
    <article>
      <header>
        <h1>Home</h1>
      </header>
      <ApiKey />
    </article>
  );
}

function ApiKey() {
  const [getApiKey, setApiKey] = useApiKey();
  const onInput = (event: Targeted<HTMLInputElement>) =>
    setApiKey(event.currentTarget.value);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <label for="api-key">API Key</label>
      <small>
        <a href="https://www.themoviedb.org/settings/api" target="_blank">
          Help
        </a>
      </small>
      <input
        id="api-key"
        name="api-key"
        type="text"
        value={getApiKey()}
        onInput={onInput}
      />
    </form>
  );
}
