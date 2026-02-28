export type ImgPath = `/${string}.jpg`;
export type DateString = `${number}-${number}-${number}`;

export type Paginated<T> = {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
};

export type TVSearchResult = {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: ImgPath;
  genre_ids: Genre["id"][];
  first_air_date: DateString;
  data: any;
};

export type TVSeriesDetails = {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: ImgPath;
  genres: Genre[];
  first_air_date: DateString;
  tagline: string;
  data: any;
};

export const configuration = {
  images: {
    root: "https://image.tmdb.org/t/p/",
    sizes: {
      backdrop: ["w300", "w780", "w1280"],
      logo: ["w45", "w92", "w154", "w185", "w300", "w500"],
      poster: ["w92", "w154", "w185", "w342", "w500", "w780"],
      profile: ["w45", "w185", "h632"],
      still: ["w92", "w185", "w300"],
    },
  },
} as const;
export type Configuration = typeof configuration;

export const tvGenres = [
  {
    id: 10759,
    name: "Action & Adventure",
  },
  {
    id: 16,
    name: "Animation",
  },
  {
    id: 35,
    name: "Komödie",
  },
  {
    id: 80,
    name: "Krimi",
  },
  {
    id: 99,
    name: "Dokumentarfilm",
  },
  {
    id: 18,
    name: "Drama",
  },
  {
    id: 10751,
    name: "Familie",
  },
  {
    id: 10762,
    name: "Kids",
  },
  {
    id: 9648,
    name: "Mystery",
  },
  {
    id: 10763,
    name: "News",
  },
  {
    id: 10764,
    name: "Reality",
  },
  {
    id: 10765,
    name: "Sci-Fi & Fantasy",
  },
  {
    id: 10766,
    name: "Soap",
  },
  {
    id: 10767,
    name: "Talk",
  },
  {
    id: 10768,
    name: "War & Politics",
  },
  {
    id: 37,
    name: "Western",
  },
] as const;
export type Genre = (typeof tvGenres)[number];
