import type { Job, TvSeriesDetailsResponse } from "./TMDB";

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
  return [
    ...seriesRes.aggregate_credits.cast
      .flatMap((c) =>
        c.roles.map((e) => ({ ...c, ...e, type: "cast" as const })),
      )
      .filter((c) => c.order <= castOrderLimit),
    ...seriesRes.aggregate_credits.crew
      .flatMap((c) =>
        c.jobs.map((e) => ({ ...c, ...e, type: "crew" as const })),
      )
      .filter((c) => interestingJobs.includes(c.job)),
  ].map(
    (credit) =>
      ({ _id: credit.id, _type: "person", id: `${credit.id}:person` }) as const,
  );
}

export function getCreditsData(seriesRes: TvSeriesDetailsResponse) {
  return [
    ...seriesRes.aggregate_credits.cast
      .flatMap((c) =>
        c.roles.map((e) => ({ ...c, ...e, type: "cast" as const })),
      )
      .filter((c) => c.order <= castOrderLimit),
    ...seriesRes.aggregate_credits.crew
      .flatMap((c) =>
        c.jobs.map((e) => ({ ...c, ...e, type: "crew" as const })),
      )
      .filter((c) => interestingJobs.includes(c.job)),
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
