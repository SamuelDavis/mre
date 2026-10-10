import type { ExtendProps } from "@samueldavis/solidlib";
import { Show, splitProps } from "solid-js";
import { Configuration } from "../Types/Configuration";
import type { ImgSize, ImgType } from "../Types/TMDB";

export default function Img<T extends ImgType>(
  props: ExtendProps<
    "img",
    { type: T; size: ImgSize<T>; path: null | string },
    "src"
  >,
) {
  const [local, parent] = splitProps(props, ["type", "size", "path"]);
  const getSrc = (): string =>
    `${Configuration.configuration.images.secure_base_url}${local.size}${local.path}`;

  return (
    <Show when={local.path}>
      <img src={getSrc()} alt={local.type} loading="lazy" {...parent} />
    </Show>
  );
}
