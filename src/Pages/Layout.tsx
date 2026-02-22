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
          </ul>
          <ul>
            <li>
              <b>M</b>edia <b>R</b>ecommendation <b>E</b>ngine
            </li>
          </ul>
        </nav>
      </header>
      <main>{props.children}</main>
    </>
  );
}
