import { ErrorBoundary, type ParentProps } from "solid-js";
import { Link, Nav, RenderedError } from "../components";

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
      <ErrorBoundary fallback={RenderedError}>{props.children}</ErrorBoundary>
    </main>
  );
}
