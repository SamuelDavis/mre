import { useMatch } from "@solidjs/router";
import { For, children, splitProps, type ComponentProps } from "solid-js";

export function Nav(props: ComponentProps<"nav">) {
  const [local, parent] = splitProps(props, ["children"]);
  const getChildren = children(() => local.children).toArray;
  return (
    <nav {...parent}>
      <ul>
        <For each={getChildren()}>{(child) => <li>{child}</li>}</For>
      </ul>
    </nav>
  );
}

export function Link(props: ComponentProps<"a">) {
  const getMatch = useMatch(() => props.href ?? Math.random().toString(36));
  const getIsCurrent = () => Boolean(getMatch());
  return <a aria-current={getIsCurrent()} {...props} />;
}

export function RenderedError(error: unknown | Error) {
  console.error(error);
  if (!(error instanceof Error)) return <h3>Something went wrong.</h3>;
  return (
    <section role="alert">
      <h3>{error.message}</h3>
      <details>
        <summary>Stack Trace</summary>
        <ol>
          <For each={(error.stack ?? "").split("\n")}>
            {(line) => <li>{line}</li>}
          </For>
        </ol>
      </details>
    </section>
  );
}
