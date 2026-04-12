import { isNonNullable, isOf, type ExtendProps } from "@samueldavis/solidlib";
import { splitProps } from "solid-js";
import type { ImgPath, ImgSizes } from "../Types";
import { Configuration } from "../Types/Configuration";

export default function Img<Type extends keyof ImgSizes>(
  props: ExtendProps<
    "img",
    { type: Type; size: ImgSizes[Type][number]; path: ImgPath | undefined },
    "src"
  >,
) {
  const [local, parent] = splitProps(props, [
    "type",
    "size",
    "path",
    "alt",
    "sizes",
  ]);
  const getAlt = (): HTMLImageElement["alt"] => local.alt ?? local.type;
  const getSrc = (): HTMLImageElement["src"] =>
    Configuration.Details.images.secure_base_url +
    (local.size ?? "original") +
    local.path;
  const getSrcSet = (): HTMLImageElement["srcset"] =>
    Configuration.Details.images.sizes[local.type]
      .map((size) => {
        const [orientation, stringValue] = [size.slice(0, 1), size.slice(1)];
        const value = Number(stringValue);
        if (!isOf(orientation, ["w"])) return null;
        const url = `${Configuration.Details.images.secure_base_url}${size}${local.path}`;
        return `${url} ${value}${orientation}`;
      })
      .filter(isNonNullable)
      .concat([
        `${Configuration.Details.images.secure_base_url}original${local.path} 1000w`,
      ])
      .join(", ");
  const getSizes = (): HTMLImageElement["sizes"] => `${local.size.slice(1)}px`;

  return (
    <img
      src={getSrc()}
      srcset={getSrcSet()}
      sizes={getSizes()}
      alt={getAlt()}
      {...parent}
    />
  );
}
