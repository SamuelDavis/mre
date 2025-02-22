import type { ParentProps } from "solid-js";
import { Link, Nav } from "../components";

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
      </header>
      {props.children}
    </main>
  );
}
