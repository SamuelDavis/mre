import {
  ImportantJobs,
  ImportantRoles,
  type Language,
  type ProductionCountry,
  type TvGenre,
  type country,
  type department,
  type job,
  type language,
} from "./constants";

export function isImportantCast(person: Cast): boolean {
  return person.order <= ImportantRoles;
}
export function isImportantCrew(person: Crew): boolean {
  return ImportantJobs.includes(person.job);
}

export type ErrorResponse = {
  status_code: int;
  status_message: string;
  success: boolean;
};

export function isErrorResponse(value: unknown): value is ErrorResponse {
  return Boolean(
    value &&
      typeof value === "object" &&
      "success" in value &&
      value.success === false,
  );
}

export type Targeted<
  Ev extends Event,
  El extends Element = Ev extends InputEvent
    ? HTMLInputElement
    : Ev extends SubmitEvent
      ? HTMLFormElement
      : HTMLElement,
> = Ev & { currentTarget: El; target: Element };

export enum Gender {
  Unknown = 0,
  Female = 1,
  Male = 2,
}

export enum Type {
  Show = "show",
  Cast = "cast",
  Crew = "crew",
}

export type int = number;
export type datestr =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
export type image_path = null | `/${string}`;
export type status = "Ended" | string;
export type series_type = "Scripted" | string;
export type episode_type = "finale" | string;
export type production_code = string;

export type Paginated<T> = {
  page: 0 | int;
  total_pages: 0 | int;
  total_results: 0 | int;
  results: Array<T>;
};

export type SearchTvResult = {
  adult: true | boolean;
  backdrop_path: string;
  genre_ids: TvGenre["id"][];
  id: 0 | int;
  origin_country: country[];
  original_language: language;
  original_name: string;
  overview: string;
  popularity: 0 | number;
  poster_path: null | image_path;
  first_air_date: datestr;
  name: string;
  vote_average: 0 | number;
  vote_count: 0 | int;
};

export type Cast = {
  adult: true | boolean;
  gender: Gender.Unknown | Gender;
  id: int;
  known_for_department: department;
  name: string;
  original_name: string;
  popularity: 0 | number;
  profile_path: null | image_path;
  character: string;
  credit_id: string;
  order: 0 | int;
};

export type Crew = {
  adult: true | boolean;
  gender: Gender.Unknown | Gender;
  id: int;
  known_for_department: department;
  name: string;
  original_name: string;
  popularity: 0 | number;
  profile_path: null | image_path;
  credit_id: string;
  department: department;
  job: job;
};

export type ProductionCompany = {
  id: 0 | int;
  logo_path: image_path;
  name: string;
  origin_country: country;
};

export type Creator = Pick<
  Crew,
  "id" | "credit_id" | "name" | "original_name" | "gender" | "profile_path"
>;

export type Network = {
  id: int;
  logo_path: image_path;
  name: string;
  origin_country: country;
};

export type Season = {
  air_date: datestr;
  episode_count: 0 | int;
  id: 0 | int;
  name: string;
  overview: string;
  poster_path: image_path;
  season_number: 0 | int;
  vote_average: 0 | number;
};

export type Episode = {
  id: int;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: int;
  air_date: datestr;
  episode_number: int;
  episode_type: episode_type;
  production_code: production_code;
  runtime: int;
  season_number: int;
  show_id: int;
  still_path: image_path;
};

export type TvSeriesDetails = Pick<
  SearchTvResult,
  | "id"
  | "adult"
  | "backdrop_path"
  | "first_air_date"
  | "name"
  | "origin_country"
  | "original_language"
  | "original_name"
  | "overview"
  | "popularity"
  | "poster_path"
  | "vote_count"
  | "vote_average"
> & {
  created_by: Creator[];
  episode_run_time: int[];
  genres: TvGenre[];
  homepage: string;
  in_production: true | boolean;
  languages: language[];
  last_air_date: datestr;
  last_episode_to_air: null | Episode;
  next_episode_to_air: null | string;
  networks: Network[];
  number_of_episodes: 0 | int;
  number_of_seasons: 0 | int;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: Season[];
  spoken_languages: Language[];
  status: status;
  tagline: string;
  type: series_type;
};

export type Credit<AdditionalProperties extends object = object> = {
  adult: true | boolean;
  backdrop_path: string;
  genre_ids: TvGenre["id"][];
  id: int;
  origin_country: country[];
  original_language: language;
  original_name: string;
  overview: string;
  popularity: 0 | number;
  poster_path: string;
  first_air_date: datestr;
  name: string;
  vote_average: 0 | number;
  vote_count: 0 | int;
  credit_id: string;
  episode_count: 0 | int;
} & AdditionalProperties;

export type CastCredit = Credit<{ character: string }>;

export type CrewCredit = Credit<{ department: department; job: job }>;

export interface Api {
  searchTv: {
    request: { query: string };
    response: Paginated<SearchTvResult>;
  };
  tvSeriesDetails: {
    request: { series_id: int };
    response: TvSeriesDetails & { credits: { cast: Cast[]; crew: Crew[] } };
  };
  personTvCredits: {
    request: { person_id: int };
    response: {
      cast: CastCredit[];
      crew: CrewCredit[];
      id: int;
    };
  };
}

export type ApiFactory = {
  [Key in keyof Api]: (
    request: Api[Key]["request"],
  ) => Promise<Api[Key]["response"]>;
};

export type PathFactory = {
  [Key in keyof Api]: (request: Api[Key]["request"]) => URL;
};
