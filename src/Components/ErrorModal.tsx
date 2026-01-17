import {
  type ExtendProps,
  assert,
  isInstanceOf,
  Modal,
  HTMLIcon,
} from "@samueldavis/solidlib";
import { splitProps, ErrorBoundary } from "solid-js";

export default function ErrorModal(
  props: ExtendProps<typeof ErrorBoundary, { reset?: () => void }, "fallback">,
) {
  const [local, parent] = splitProps(props, ["reset"]);

  function fallback(error: any, reset: () => void) {
    console.error(error);
    assert(isInstanceOf, error, Error);

    function onClose() {
      local.reset?.();
      reset();
    }

    return (
      <Modal onClose={onClose}>
        <article>
          <header>
            <h3>Something went wrong...</h3>
            <p></p>
          </header>
          <q>{error.message}</q>
          <footer>
            <button onClick={onClose}>
              <HTMLIcon type="close" />
              Close
            </button>
          </footer>
        </article>
      </Modal>
    );
  }

  return <ErrorBoundary fallback={fallback} {...parent} />;
}
