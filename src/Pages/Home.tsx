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
  function setApiKey(key: string) {
    if (key) localStorage.setItem("api-key", JSON.stringify(key));
    else localStorage.removeItem("api-key");
  }

  function getApiKey(): null | string {
    return JSON.parse(localStorage.getItem("api-key") || "null");
  }

  function onSetApiKey(event: { currentTarget: HTMLInputElement }) {
    setApiKey(event.currentTarget.value);
  }

  function preventDefault(event: SubmitEvent) {
    event.preventDefault();
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
        <input type="text" value={getApiKey() ?? ""} onInput={onSetApiKey} />
      </label>
    </form>
  );
}
