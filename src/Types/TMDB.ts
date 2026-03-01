import type { Configuration, TVGenres } from "./Configuration";

export type ImgPath = `/${string}.jpg`;
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
    episode_type: "finale";
    production_code: "";
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: ImgPath;
  };
  name: string;
  next_episode_to_air: null;
  networks: {
    id: number;
    logo_path: "/mZf3Om1VVr2hyKbDEfdVM5Dgvh6.png";
    name: string;
    origin_country: ISOCountry;
  }[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: [ISOCountry];
  original_langauge: ISOLanguage;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: ImgPath;
  production_companies: {
    id: number;
    logo_path: "/yipyNbVGcdyUtss9RtA4i7Zkkey.png";
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
    iso_639_1: "ko";
    name: string;
  }[];
  status: string & "Ended";
  tagline: string;
  type: string & "Scripted";
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

export type PeopleTVCreditsResponse = {
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
  id: PersonId;
};

export type Configuration = typeof Configuration;
export type ImgSizes = Configuration["Details"]["images"]["sizes"];
export type Job = Configuration["Jobs"][number]["jobs"][number];
export type Department = Configuration["Jobs"][number]["department"];
export type ISOLanguage = Configuration["Languages"][number]["iso_639_1"];
export type ISOCountry = Configuration["Countries"][number]["iso_3166_1"];
export type Genre = (typeof TVGenres)[number];
// iso_639_1
// e
