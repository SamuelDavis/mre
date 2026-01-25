import type { ExtendProps } from "@samueldavis/solidlib";
import { mergeProps, Show, splitProps } from "solid-js";
import type { AssetSizes } from "../types";

export default function ImageAsset<Type extends keyof AssetSizes>(
  props: ExtendProps<
    "img",
    {
      type: Type;
      size?: AssetSizes[Type][number];
      path?: null | string;
    },
    "src" | "srcset"
  >,
) {
  const merged = mergeProps({ size: "original" }, props);
  const [local, parent] = splitProps(merged, ["path", "size"]);
  const getSrc = () =>
    local.path
      ? `https://image.tmdb.org/t/p/${local.size}${local.path}`
      : undefined;

  return (
    <Show when={getSrc()}>{(get) => <img src={get()} {...parent} />}</Show>
  );
}
