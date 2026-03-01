import { A } from "@solidjs/router";
import { type ParentProps } from "solid-js";

export default function Layout(props: ParentProps) {
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
            <li>
              <A href="/suggest">Suggest</A>
            </li>
          </ul>
          <ul>
            <li>
              <small>
                <b>M</b>edia <b>R</b>ecommendation <b>E</b>ngine
              </small>
            </li>
          </ul>
        </nav>
      </header>
      <main>{props.children}</main>
    </>
  );
}
