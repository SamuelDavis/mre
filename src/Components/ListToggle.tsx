import type { ExtendProps } from "@samueldavis/solidlib";
import { splitProps } from "solid-js";
import { useList } from "../AppState";
import type { TVSeriesId } from "../Types";

export function ListToggle(
  props: ExtendProps<"label", { seriesId: TVSeriesId }>,
) {
  const [local, parent] = splitProps(props, ["seriesId"]);
  const list = useList();
  const getLabel = (): string =>
    `${list.has(local.seriesId) ? "Remove from" : "Add to"} list`;

  function onClick(): void {
    list.has(local.seriesId)
      ? list.del(local.seriesId)
      : list.add(local.seriesId);
  }

  return (
    <label {...parent}>
      <input
        type="checkbox"
        role="switch"
        name={`list[${props.seriesId}]`}
        checked={list.has(local.seriesId)}
        onClick={onClick}
      />
      <span class="ml-(--pico-block-spacing-horizontal)">{getLabel()}</span>
    </label>
  );
}
