import type { ComponentProps, ValidComponent } from "solid-js";

export type ExtendProps<
  Parent extends ValidComponent,
  Props extends Record<string, unknown> = Record<string, unknown>,
  Except extends keyof ComponentProps<Parent> = never,
> = Omit<ComponentProps<Parent>, keyof Props & Except> & Props;

type int = number;
type language = string | ("en" | "ko" | "ja");
type country = string | ("US" | "JP" | "KR");
export type path = string | "/${string}";
type date =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
type department = string | "Acting";
type job = string | "Visual Effects";
type gender = int;

export type ErrorResponse = {
  status_code: int;
  status_message: string;
  success: boolean;
};

type Paginated<T> = {
  page: number;
  total_pages: int;
  total_results: int;
  results: T[];
};

export type Show = {
  adult: boolean;
  backdrop_path: string;
  genre_ids: int[];
  id: int;
  origin_country: country[];
  original_language: language[];
  original_name: null | string;
  overview: string | "";
  popularity: number;
  poster_path: path | null;
  first_air_date: date;
  name: string;
  vote_average: number;
  vote_count: int;
};
export type Genre = { id: int; name: string };
export type Role = {
  credit_id: string;
  character: string;
  episode_count: int;
};
export type Job = {
  credit_id: string;
  job: job;
  episode_count: int;
};
export type Cast = {
  adult: boolean;
  gender: gender;
  id: int;
  known_for_department: department;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: null | path;
  roles: Role[];
  total_episode_count: int;
  order: int;
};
export type Crew = {
  adult: boolean;
  gender: gender;
  id: int;
  known_for_department: department;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: null | path;
  jobs: Job[];
  department: department;
  total_episode_count: number;
};
export type ShowCastMap = Record<Show["id"], Cast["id"][]>;
export type ShowCrewMap = Record<Show["id"], Cast["id"][]>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function isErrorResponse(value: any): value is ErrorResponse {
  return (
    value &&
    typeof value === "object" &&
    "success" in value &&
    value.success === false
  );
}

export interface Api {
  searchTv: {
    request: {
      query: string;
      first_air_date_year?: int;
      include_adult?: boolean;
      language?: language;
      page?: int;
      year?: int;
    };
    response: Paginated<Show>;
  };
  tvGenres: {
    request: void;
    response: {
      genres: Genre[];
    };
  };
  tvPeople: {
    request: {
      series_id: int;
      language?: language;
    };
    response: {
      id: int;
      cast: Cast[];
      crew: Crew[];
    };
  };
}

export type ApiFactory = {
  [Key in keyof Api]: (
    request: Api[Key]["request"],
  ) => Promise<Api[Key]["response"]>;
};

export const paths: {
  [Key in keyof Api]: path | ((request: Api[Key]["request"]) => path);
} = {
  searchTv: "/search/tv",
  tvGenres: "/genre/tv/list",
  tvPeople: (request) => `/tv/${request.series_id}/aggregate_credits`,
};
