import type { Job } from "./TMDB";

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
