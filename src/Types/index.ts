export * from "./TMDB";

import { isKeyed } from "@samueldavis/solidlib";
import type {
  CreditId,
  Department,
  ImgPath,
  Job,
  PersonId,
  SearchTVResponseResult,
  TvSeriesDetailsResponse,
  TVSeriesId,
} from "./TMDB";
import type { EdgeDataDefinition, NodeDataDefinition } from "cytoscape";

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

export type PersonData = NodeDataDefinition & {
  type: "person";
  id: `person:${PersonId}`;
  label: string;
  img: ImgPath;
};
export type SeriesData = NodeDataDefinition & {
  type: "series";
  id: `series:${TVSeriesId}`;
  label: string;
  img: ImgPath;
};
export type CreditData = EdgeDataDefinition & {
  type: "credit";
  id: `credit:${CreditId}`;
  label: string;
  job: Job;
  department: Department;
  img: ImgPath;
};
export type NodeData = PersonData | SeriesData | CreditData;
export type Node<T extends NodeData = NodeData> = {
  data(): T;
  data<K extends keyof T>(key: K): T[K];
};
