import type { paths } from "./tmdb-api";
import type { Configuration } from "./Configuration";

type Get<P extends keyof paths> = paths[P] extends {
  get: { responses: { 200: { content: { "application/json": infer B } } } };
}
  ? B
  : never;

type Fix<T> = T extends readonly (infer I)[]
  ? Fix<I>[]
  : T extends object
    ? {
        [K in keyof T]: K extends `${string}_path` ? null | string : Fix<T[K]>;
      }
    : T;

type Item<T> = T extends readonly (infer I)[] ? I : never;

export type Body<P extends keyof paths> = Fix<Get<P>>;

export const mediaTypes = ["movie", "tv"] as const;
export type MediaType = (typeof mediaTypes)[number];
export type MediaKey = `${MediaType}:${number}`;
export type MediaRef = { media: MediaType; id: number };
export type PersonId = number;

export type MovieDetails = Body<"/3/movie/{movie_id}"> & {
  credits: Body<"/3/movie/{movie_id}/credits">;
};
export type TvDetails = Body<"/3/tv/{series_id}"> & {
  aggregate_credits: Body<"/3/tv/{series_id}/aggregate_credits">;
};
export type DetailsOf = { movie: MovieDetails; tv: TvDetails };
export type Details = {
  [M in MediaType]: { media: M; data: DetailsOf[M] };
}[MediaType];

export type MovieCast = Item<
  Body<"/3/person/{person_id}/movie_credits">["cast"]
> & { media_type: "movie" };
export type MovieCrew = Item<
  Body<"/3/person/{person_id}/movie_credits">["crew"]
> & { media_type: "movie" };
export type TvCast = Item<Body<"/3/person/{person_id}/tv_credits">["cast"]> & {
  media_type: "tv";
};
export type TvCrew = Omit<
  Item<Body<"/3/person/{person_id}/tv_credits">["crew"]>,
  "episode_count"
> & { media_type: "tv"; episode_count?: number };
export type CombinedCredits = {
  id: PersonId;
  cast: (MovieCast | TvCast)[];
  crew: (MovieCrew | TvCrew)[];
};

export type SearchMovie = Item<Body<"/3/search/movie">["results"]> & {
  media_type: "movie";
};
export type SearchTv = Item<Body<"/3/search/tv">["results"]> & {
  media_type: "tv";
};
export type SearchPerson = { media_type: "person"; id: PersonId };
export type SearchMultiResult = SearchMovie | SearchTv | SearchPerson;
export type SearchMulti = Omit<Body<"/3/search/multi">, "results"> & {
  results: SearchMultiResult[];
};

type Config = typeof Configuration;
export type Job = Config["jobs"][number]["jobs"][number];
export type Genre = Config["genres"][MediaType]["genres"][number];
export type ImgType = "backdrop" | "logo" | "poster" | "profile" | "still";
export type ImgSize<T extends ImgType> =
  Config["configuration"]["images"][`${T}_sizes`][number];
