import {
  type ExtendProps,
  Modal,
  HTMLIcon,
  isInstanceOf,
} from "@samueldavis/solidlib";
import { splitProps } from "solid-js";

export default function ErrorModal(
  props: ExtendProps<
    typeof Modal,
    {
      error: Error;
      reset: () => void;
    }
  >,
) {
  const [local, parent] = splitProps(props, ["reset", "error"]);
  console.error(local.error);

  function onClick() {
    local.reset();
  }

  return (
    <Modal {...parent}>
      <article>
        <header class="flex content-center items-center justify-between">
          <h1>{local.error.name}</h1>
          <HTMLIcon type="close" onClick={onClick} />
        </header>
        <p>{local.error.message}</p>
        <details>
          <summary>Details</summary>
          <pre>{JSON.stringify(local.error.cause, null, 2)}</pre>
        </details>
      </article>
    </Modal>
  );
}

ErrorModal.fallback =
  (userReset?: () => void) => (error: any, reset: () => void) => {
    if (!isInstanceOf(error, Error))
      throw new TypeError("!Error", { cause: error });

    return (
      <ErrorModal
        error={error}
        reset={() => {
          userReset?.();
          reset();
        }}
      />
    );
  };
