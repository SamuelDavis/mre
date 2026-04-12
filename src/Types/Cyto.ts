import { isOf } from "@samueldavis/solidlib";
import type { Job, TvSeriesDetailsResponse } from "./TMDB";
import { safe } from "../util";

export const castOrderLimit: number = 1 as const;
export const interestingJobs: Job[] = [
  // "Creator",
  "Writer",
  "Director",
  // "Storyboard",
  // "Producer",
  // "Editor",
  // "Co-Director",
  // "Executive Producer",
] as const;

export function getPeopleData(seriesRes: TvSeriesDetailsResponse) {
  const cast = safe(seriesRes.aggregate_credits.cast, [])
    .flatMap((c) =>
      safe(c.roles, []).map((e) => ({ ...c, ...e, type: "cast" as const })),
    )
    .filter((c) => c.order <= castOrderLimit);
  const crew = safe(seriesRes.aggregate_credits.crew, [])
    .flatMap((c) =>
      safe(c.jobs, []).map((e) => ({ ...c, ...e, type: "crew" as const })),
    )
    .filter((c) => isOf(c.job, interestingJobs));
  return [...cast, ...crew].map(
    (credit) =>
      ({ _id: credit.id, _type: "person", id: `${credit.id}:person` }) as const,
  );
}

export function getCreditsData(seriesRes: TvSeriesDetailsResponse) {
  return [
    ...safe(seriesRes.aggregate_credits.cast, [])
      .flatMap((c) =>
        safe(c.roles, []).map((e) => ({ ...c, ...e, type: "cast" as const })),
      )
      .filter((c) => c.order <= castOrderLimit),
    ...safe(seriesRes.aggregate_credits.crew, [])
      .flatMap((c) =>
        safe(c.jobs, []).map((e) => ({ ...c, ...e, type: "crew" as const })),
      )
      .filter((c) => isOf(c.job, interestingJobs)),
  ].map(
    (credit) =>
      ({
        _id: credit.credit_id,
        _type: credit.type,
        id: `${credit.credit_id}:credit`,
        source: `${seriesRes.id}:series`,
        target: `${credit.id}:person`,
      }) as const,
  );
}
