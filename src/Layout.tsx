import type { ParentProps } from "solid-js";
import { Link, Nav } from "./components";
import state from "./state";

export default function Layout(props: ParentProps) {
  return (
    <main>
      <header>
        <Nav>
          <Link href="/">Home</Link>
          <Link href="/search">Search</Link>
          <Link href="/list">List</Link>
          <Link href="/data">Data</Link>
        </Nav>
        <label>
          <span>API Key</span>
          <input
            type="text"
            value={state.getApiKey()}
            onInput={(e) => state.setApiKey(e.target.value)}
          />
        </label>
      </header>
      {props.children}
    </main>
  );
}
