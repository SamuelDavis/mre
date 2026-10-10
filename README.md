# Media Recommendation Engine (MRE)

Reads the credits of movies/TV you liked and recommends unseen titles where the people you like worked together.

## Model

- List: `MediaKey[]` (`movie:603`, `tv:1396`) of liked titles, in localStorage
- Crawl, depth 2: list title details + credits → important people → each person's `combined_credits`
- Importance is binary, same rules on both sides (`./src/Lib/model.ts` `Settings`):
  - cast: movie `order < castLimit`; TV list-side top `castLimit` by `total_episode_count`, candidate-side `episode_count >= minEpisodes`
  - crew: job in `jobs`; TV list-side `episode_count >= episodeShare * number_of_episodes`, candidate-side `>= minEpisodes`
  - excluded (configurable): credit types `creditFilters` (Self, archive footage, host/MC, …), genres (default Documentary, Music, Kids, News, Reality, Talk)
- w(person) = list titles they're in; score(candidate) = Σ w over its people
- candidate shown if ≥2 people or one person with w ≥ 2

## Layout

- `./src/Lib/model.ts`: pure model, graph selection, explanations
- `./src/Lib/crawl.ts`: reactive fetching, batched flush
- `./src/Lib/tmdb.ts`: client; `./src/Lib/cache.ts` Cache API, 7-day TTL; `./src/Lib/limiter.ts` concurrency
- `./src/Components/Graph.tsx`: Cytoscape + fcose, diffed updates, zoom-dependent labels

## Scripts

- `npm test`: vitest
- `npm run gen:types`: `./tmdb-api.json` → `./src/Types/tmdb-api.d.ts`
- `npm run gen:config`: needs `TMDB_KEY`; writes `./src/Types/Configuration.ts`
- `./src/Types/TMDB.ts`: hand-written corrections for the lossy spec
