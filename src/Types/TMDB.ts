import type { Configuration, TVGenres } from "./Configuration";

export type ImgPath = `/${string}.${string}`;
export type Href = `http${string}`;
export type DateString = `${number}-${number}-${number}`;
export type Gender = 1 | 2;
export type TVSeriesId = number;
export type PersonId = number;
export type CreditId = string;

type Paginated<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type SearchTVResponseResult = {
  adult: boolean;
  backdrop_path: ImgPath;
  genre_ids: Genre["id"][];
  id: TVSeriesId;
  origin_country: [ISOCountry];
  original_langauge: ISOLanguage;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: ImgPath;
  first_air_date: DateString;
  name: string;
  vote_average: number;
  vote_count: number;
};
export type SearchTVResponse = Paginated<SearchTVResponseResult>;

export type TvSeriesDetailsResponse = {
  adult: boolean;
  backdrop_path: ImgPath;
  created_by: {
    id: PersonId;
    credit_id: CreditId;
    name: string;
    original_name: string;
    gender: Gender;
    profile_path: ImgPath;
  }[];
  episode_run_time: number[];
  first_air_date: DateString;
  genres: Genre[];
  homepage: Href;
  id: TVSeriesId;
  in_production: boolean;
  languages: ISOLanguage[];
  last_air_date: DateString;
  last_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: DateString;
    episode_number: number;
    episode_type: "finale" & string;
    production_code: "";
    runtime: number;
    season_number: number;
    show_id: TVSeriesId;
    still_path: ImgPath;
  };
  name: string;
  next_episode_to_air: null;
  networks: {
    id: number;
    logo_path: ImgPath;
    name: string;
    origin_country: ISOCountry;
  }[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: ISOCountry[];
  original_langauge: ISOLanguage;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: ImgPath;
  production_companies: {
    id: number;
    logo_path: ImgPath;
    name: string;
    origin_country: ISOCountry;
  }[];
  production_countries: {
    iso_3166_1: ISOCountry;
    name: string;
  }[];
  seasons: {
    air_date: DateString;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: ImgPath;
    season_number: number;
    vote_average: number;
  }[];
  spoken_languages: {
    english_name: string;
    iso_639_1: ISOLanguage;
    name: string;
  }[];
  status: "Ended" & string;
  tagline: string;
  type: "Scripted" & string;
  vote_average: number;
  vote_count: number;
  aggregate_credits: {
    cast: {
      adult: boolean;
      gender: number;
      id: PersonId;
      known_for_department: Department;
      name: string;
      original_name: string;
      popularity: number;
      profile_path: ImgPath;
      roles: {
        credit_id: CreditId;
        character: string;
        episode_count: number;
      }[];
      total_episode_count: number;
      order: number;
    }[];
    crew: {
      adult: boolean;
      gender: number;
      id: PersonId;
      known_for_department: Department;
      name: string;
      original_name: string;
      popularity: number;
      profile_path: ImgPath;
      jobs: {
        credit_id: CreditId;
        job: Job;
        episode_count: number;
      }[];
      department: Department;
      total_episode_count: number;
    }[];
  };
};

export type PeopleDetailsResponse = {
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: DateString;
  deathday: DateString;
  gender: Gender;
  homepage: Href;
  id: number;
  imdb_id: string;
  known_for_department: Department;
  name: string;
  place_of_birth: EnglishCountry;
  popularity: number;
  profile_path: ImgPath;
  tv_credits: {
    cast: {
      adult: boolean;
      backdrop_path: ImgPath;
      genre_ids: Genre["id"][];
      id: TVSeriesId;
      origin_country: [ISOCountry];
      original_langauge: ISOLanguage;
      original_name: string;
      overview: string;
      popularity: number;
      poster_path: ImgPath;
      first_air_date: DateString;
      name: string;
      vote_average: number;
      vote_count: number;
      character: string;
      credit_id: CreditId;
      episode_count: number;
      first_credit_air_date: DateString;
    }[];
    crew: {
      adult: boolean;
      backdrop_path: ImgPath;
      genre_ids: Genre["id"][];
      id: TVSeriesId;
      origin_country: [ISOCountry];
      original_langauge: ISOLanguage;
      original_name: string;
      overview: string;
      popularity: number;
      poster_path: ImgPath;
      first_air_date: DateString;
      name: string;
      vote_average: number;
      vote_count: number;
      credit_id: CreditId;
      department: Department;
      episode_count: number;
      first_credit_air_date: DateString;
      job: Job;
    }[];
  };
};
type Person = {
  adult: boolean;
  id: PersonId;
  name: string;
  original_name: string;
  media_type: string;
  popularity: number;
  gender: Gender;
  known_for_department: Department;
  profile_path: ImgPath;
};

type Season = {
  id: number;
  name: string;
  overview: string;
  poster_path: ImgPath;
  media_type: "tv_season" & string;
  vote_average: number;
  air_date: DateString;
  season_number: number;
  show_id: number;
  episode_count: number;
};

type Media = {
  adult: boolean;
  backdrop_path: ImgPath;
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: ImgPath;
  media_type: "tv" & string;
  original_language: ISOLanguage;
  genre_ids: Genre["id"][];
  popularity: number;
  first_air_date: DateString;
  vote_average: number;
  vote_count: number;
  origin_country: ISOCountry[];
  episodes: [];
  seasons: Season[];
};

export type CreditsDetailsResponse =
  | {
      credit_type: "cast";
      department: "Acting";
      job: Job<"Actors">;
      media: Media & {
        character: string;
      };
      media_type: "tv" & string;
      id: CreditId;
      person: Person;
    }
  | {
      credit_type: "crew";
      department: Department;
      job: Job;
      media: Media;
      media_type: "tv" & string;
      id: CreditId;
      person: Person;
    };

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
