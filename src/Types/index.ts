export * from "./TMDB";

import { isKeyed } from "@samueldavis/solidlib";
import type {
  Job,
  SearchTVResponseResult,
  TvSeriesDetailsResponse,
} from "./TMDB";

export type AppTvSeriesSearch = Pick<
  SearchTVResponseResult,
  | "genre_ids"
  | "id"
  | "name"
  | "original_name"
  | "first_air_date"
  | "overview"
  | "poster_path"
>;

export type AppTVSeriesDetails = Pick<
  TvSeriesDetailsResponse,
  | "created_by"
  | "genres"
  | "tagline"
  | "id"
  | "name"
  | "original_name"
  | "first_air_date"
  | "overview"
  | "poster_path"
  | "aggregate_credits"
>;

const castOrderLimit: number = 3 as const;
const interestingJobs: Job[] = [
  "Creator",
  "Producer",
  "Editor",
  "Storyboard",
  "Director",
  "Co-Director",
  "Executive Producer",
] as const;

export function isInterestingCast(
  credit: { order: number } | { episode_count: number },
): boolean {
  return (
    (isKeyed(credit, "order") ? credit.order : credit.episode_count) <
    castOrderLimit
  );
}

export function isInterestingCrew(credit: { job: Job }): boolean {
  return interestingJobs.includes(credit.job);
}
