import state from "../state";

export default function Home() {
  return (
    <main>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          <span>API Key</span>
          <input
            type="text"
            value={state.getApiKey()}
            onInput={(e) => state.setApiKey(e.target.value)}
          />
        </label>
      </form>
    </main>
  );
}
