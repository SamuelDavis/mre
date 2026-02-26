import { assert, isOf, type ExtendProps } from "@samueldavis/solidlib";
import { splitProps } from "solid-js";
import { type Configuration, configuration, type ImgPath } from "../types";

export default function Img<
  Type extends keyof Configuration["images"]["sizes"],
>(
  props: ExtendProps<
    "img",
    {
      type: Type;
      size: Configuration["images"]["sizes"][Type][number];
      path: ImgPath;
    },
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
    configuration.images.root + (local.size ?? "original") + local.path;
  const getSrcSet = (): HTMLImageElement["srcset"] =>
    configuration.images.sizes[local.type]
      .map((size) => {
        const [orientation, stringValue] = [size.slice(0, 1), size.slice(1)];
        const value = Number(stringValue);
        assert(isOf, orientation, ["w", "h"] as const);
        const url = `${configuration.images.root}${size}${local.path}`;
        return `${url} ${value}${orientation}`;
      })
      .concat([`${configuration.images.root}original${local.path} 1000w`])
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
