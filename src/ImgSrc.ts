import type { path } from "./types";

export default class ImageSource {
  private readonly base = "https://image.tmdb.org/t/p/";

  constructor(
    private readonly path: path,
    private readonly size = "w500",
  ) {}

  toString(): string {
    return `${this.base}${this.size}${this.path}`;
  }
}
