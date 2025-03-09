import type { ImageSize, ImageType } from "./constants";
import type { image_path } from "./types";

export default class ImageSource<T extends ImageType = ImageType> {
  private readonly base = "https://image.tmdb.org/t/p/";

  constructor(
    public readonly type: T,
    private readonly path: image_path,
    private readonly size: ImageSize<T>,
  ) {}

  toString(): string {
    return `${this.base}${this.size}${this.path}`;
  }
}
