import { writeFile } from "node:fs/promises";

const token = process.env.TMDB_KEY;
if (!token) throw new Error("TMDB_KEY is not set.");

async function get(path: string): Promise<unknown> {
  const res = await fetch(`https://api.themoviedb.org/3/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${res.statusText}`);
  return res.json();
}

const [configuration, jobs, movieGenres, tvGenres] = await Promise.all([
  get("configuration"),
  get("configuration/jobs"),
  get("genre/movie/list"),
  get("genre/tv/list"),
]);

const Configuration = {
  configuration,
  jobs,
  genres: { movie: movieGenres, tv: tvGenres },
};

const output = process.argv[2] ?? "src/Types/Configuration.ts";
await writeFile(
  output,
  `export const Configuration = ${JSON.stringify(Configuration, null, 2)} as const;\n`,
);
