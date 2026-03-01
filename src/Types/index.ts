export * from "./TMDB";

import type { DateString, ImgPath, TVSeriesId, Genre } from "./TMDB";

export type AppTVSeries = {
  genres: Genre[];
  tagline?: string;
  id: TVSeriesId;
  name: string;
  original_name: string;
  first_air_date: DateString;
  overview: string;
  poster_path: ImgPath;
};
