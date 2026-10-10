import { isInstanceOf, type Targeted } from "@samueldavis/solidlib";
import { createSignal, Show } from "solid-js";
import { useApiKey, useTmdb } from "../AppState";

export default function ApiKeyForm() {
  const [, setApiKey] = useApiKey();
  const tmdb = useTmdb();
  const [getError, setError] = createSignal<string>();
  const [getBusy, setBusy] = createSignal(false);

  async function onSubmit(event: Targeted<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    const token = String(new FormData(event.currentTarget).get("token")).trim();
    setBusy(true);
    setError(undefined);
    try {
      await tmdb.authenticate(token);
      setApiKey(token);
    } catch (error) {
      setError(isInstanceOf(error, Error) ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article>
      <header>
        <h1>TMDB Access Token</h1>
      </header>
      <form onSubmit={onSubmit}>
        <label>
          API Read Access Token
          <input
            type="password"
            name="token"
            required
            autocomplete="off"
            aria-invalid={getError() ? true : undefined}
            aria-describedby="token-help"
          />
          <small id="token-help">
            <Show
              when={getError()}
              fallback={
                <>
                  Find it in your{" "}
                  <a
                    target="_blank"
                    href="https://www.themoviedb.org/settings/api"
                  >
                    TMDB API settings
                  </a>
                  . It's stored only in this browser.
                </>
              }
            >
              {getError()}
            </Show>
          </small>
        </label>
        <input type="submit" value="Save" aria-busy={getBusy()} />
      </form>
    </article>
  );
}
