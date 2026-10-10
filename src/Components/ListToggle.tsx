import type { ExtendProps } from "@samueldavis/solidlib";
import { splitProps } from "solid-js";
import { useList } from "../AppState";
import type { MediaKey } from "../Types/TMDB";

export default function ListToggle(
  props: ExtendProps<"label", { mediaKey: MediaKey }>,
) {
  const [local, parent] = splitProps(props, ["mediaKey"]);
  const list = useList();
  const getChecked = (): boolean => list.has(local.mediaKey);

  function onChange(): void {
    list.toggle(local.mediaKey);
  }

  return (
    <label {...parent}>
      <input
        type="checkbox"
        role="switch"
        checked={getChecked()}
        onChange={onChange}
      />
      In my list
    </label>
  );
}
