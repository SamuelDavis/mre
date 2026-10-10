import { A } from "@solidjs/router";
import { Show, Suspense, type ParentProps } from "solid-js";
import { useApiKey } from "../AppState";
import ApiKeyForm from "../Components/ApiKeyForm";

export default function Layout(props: ParentProps) {
  const [getApiKey, setApiKey] = useApiKey();

  function onForgetKey(): void {
    setApiKey("");
  }

  return (
    <>
      <header>
        <nav>
          <ul>
            <li>
              <strong>MRE</strong>
            </li>
          </ul>
          <ul>
            <li>
              <A href="/search">Search</A>
            </li>
            <li>
              <A href="/list">List</A>
            </li>
            <li>
              <A href="/recommend">Recommend</A>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <Show when={getApiKey()} fallback={<ApiKeyForm />}>
          <Suspense fallback={<progress />}>{props.children}</Suspense>
        </Show>
      </main>
      <footer>
        <small>
          Data from <a href="https://www.themoviedb.org">TMDB</a>.{" "}
          <Show when={getApiKey()}>
            <button type="button" class="link" onClick={onForgetKey}>
              Forget access token
            </button>
          </Show>
        </small>
      </footer>
    </>
  );
}
