import type { AssetPath } from "./tmdb";

export type * from "@samueldavis/solidlib";
export * from "./tmdb";

export type MediaItem = {
  id: number;
  type: string;
  name: string;
  originalName: string;
  date: Date;
  poster: AssetPath;
  overview: string;
};

export class ApiError extends Error {
  public constructor(body: {
    success: false;
    status_code: number;
    status_message: string;
  }) {
    super(body.status_message, { cause: body });
  }
}
