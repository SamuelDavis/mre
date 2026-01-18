import { A } from "@solidjs/router";
import { type ParentProps } from "solid-js";
import { useAppState } from "../AppState";

export default function Layout(props: ParentProps) {
  const [state] = useAppState();

  function onLogState(): void {
    console.info(JSON.parse(JSON.stringify(state)));
  }

  return (
    <>
      <header>
        <nav>
          <ul>
            <li>
              <A href="/">Home</A>
            </li>
            <li>
              <A href="/search">Search</A>
            </li>
            <li>
              <A href="/list">List</A>
            </li>
          </ul>
          <ul>
            <li>
              <b>M</b>edia <b>R</b>ecommendation <b>E</b>ngine
            </li>
            <li>
              <button onClick={onLogState}>Log State</button>
            </li>
          </ul>
        </nav>
      </header>
      <main>{props.children}</main>
    </>
  );
}
