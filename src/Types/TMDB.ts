import type { Configuration, TVGenres } from "./Configuration";
import type { paths } from "./tmdb-api";

type ApiPath = keyof paths;
type Body<T extends ApiPath> = paths[T] extends {
  get: { responses: { "200": { content: { "application/json": unknown } } } };
}
  ? paths[T]["get"]["responses"]["200"]["content"]["application/json"]
  : never;

export type ImgPath = string | `/${string}.${string}`;
export type Href = `http${string}`;
export type DateString = `${number}-${number}-${number}`;
export type Gender = 1 | 2;
export type TVSeriesId = number;
export type PersonId = number;
export type CreditId = string;

export type SearchTVResponse = Body<"/3/search/tv">;
export type SearchTVResponseResult = NonNullable<
  SearchTVResponse["results"]
>[number];
export type TvSeriesDetailsResponse = Body<"/3/tv/{series_id}"> & {
  aggregate_credits: Body<"/3/tv/{series_id}/aggregate_credits">;
};
export type PeopleDetailsResponse = Body<"/3/person/{person_id}"> & {
  tv_credits: Body<"/3/person/{person_id}/tv_credits">;
};

export type CreditsDetailsResponse = Body<"/3/credit/{credit_id}">;

export type Configuration = typeof Configuration;
export type ImgSizes = Configuration["Details"]["images"]["sizes"];
export type Department = Configuration["Jobs"][number]["department"];
export type Job<D extends Department = Department> = Extract<
  Configuration["Jobs"][number],
  { department: D }
>["jobs"][number];
export type ISOLanguage = Configuration["Languages"][number]["iso_639_1"];
export type ISOCountry = Configuration["Countries"][number]["iso_3166_1"];
export type EnglishCountry = Configuration["Countries"][number]["english_name"];
export type Genre = (typeof TVGenres)[number];
