import {
  assert,
  isNonNullable,
  isOf,
  isString,
} from "@samueldavis/solidlib";
import {
  mediaTypes,
  type CombinedCredits,
  type Details,
  type Genre,
  type Job,
  type MediaKey,
  type MediaRef,
  type MediaType,
  type PersonId,
  type SearchMovie,
  type SearchMultiResult,
  type SearchTv,
} from "../Types/TMDB";
import { Configuration } from "../Types/Configuration";

export type Settings = {
  castLimit: number;
  jobs: Job[];
  episodeShare: number;
  minEpisodes: number;
  topK: number;
  excludedGenres: GenreId[];
  excludedCredits: CreditFilter[];
};

export type GenreId = Genre["id"];

export const creditFilterNames = [
  "Self",
  "Archive footage",
  "Uncredited",
  "Host",
  "Guest",
] as const;
export type CreditFilter = (typeof creditFilterNames)[number];
export const creditFilters: Record<CreditFilter, RegExp> = {
  Self: /^(self|himself|herself|themselves)\b/i,
  "Archive footage": /\barchive footage\b/i,
  Uncredited: /\buncredited\b/i,
  Host: /\b(host|mc|presenter|panelist)\b/i,
  Guest: /^guest\b|- guest\b/i,
};

export const genres: Genre[] = [
  ...new Map(
    [
      ...Configuration.genres.movie.genres,
      ...Configuration.genres.tv.genres,
    ].map((genre) => [genre.id, genre]),
  ).values(),
].sort((a, b) => a.name.localeCompare(b.name));

export const selectableJobs = [
  "Creator",
  "Director",
  "Writer",
  "Screenplay",
  "Novel",
  "Story",
  "Producer",
  "Executive Producer",
  "Original Music Composer",
  "Director of Photography",
  "Editor",
  "Casting",
] as const satisfies readonly Job[];

export const defaultSettings: Settings = {
  castLimit: 5,
  jobs: [
    "Creator",
    "Director",
    "Writer",
    "Screenplay",
    "Original Music Composer",
    "Director of Photography",
  ],
  episodeShare: 0.2,
  minEpisodes: 4,
  topK: 15,
  excludedGenres: [99, 10402, 10762, 10763, 10764, 10767],
  excludedCredits: [...creditFilterNames],
};

export type Role = { kind: "cast" | "crew"; label: string; episodes?: number };
export type Person = { id: PersonId; name: string; profile_path: null | string };
export type Title = {
  key: MediaKey;
  media: MediaType;
  id: number;
  name: string;
  date: string;
  overview: string;
  poster_path: null | string;
  genre_ids: number[];
  vote_count: number;
};
export type Link = { person: PersonId; title: MediaKey; role: Role };
export type Candidate = { title: Title; score: number; people: PersonId[] };
export type Favorite = { person: Person; weight: number; titles: MediaKey[] };
export type Model = {
  list: Set<MediaKey>;
  titles: Map<MediaKey, Title>;
  people: Map<PersonId, Person>;
  weights: Map<PersonId, number>;
  listLinks: Link[];
  candidateLinks: Link[];
  candidates: Candidate[];
  favorites: Favorite[];
};
export type Selection =
  | { type: "title"; key: MediaKey }
  | { type: "person"; id: PersonId };

type Summary =
  | Pick<
      SearchMovie,
      | "media_type"
      | "id"
      | "title"
      | "release_date"
      | "overview"
      | "poster_path"
      | "genre_ids"
      | "vote_count"
    >
  | Pick<
      SearchTv,
      | "id"
      | "name"
      | "first_air_date"
      | "overview"
      | "poster_path"
      | "genre_ids"
      | "vote_count"
    > & { media_type: "tv" };

export function toKey(media: MediaType, id: number): MediaKey {
  return `${media}:${id}`;
}

export function isMediaKey(value: unknown): value is MediaKey {
  return isString(value) && /^(movie|tv):\d+$/.test(value);
}

export function parseKey(key: MediaKey): MediaRef {
  const [media, id] = key.split(":");
  assert(isOf, media, mediaTypes);
  return { media, id: Number(id) };
}

export function isMediaResult(
  result: SearchMultiResult,
): result is SearchMovie | SearchTv {
  return result.media_type !== "person";
}

export function isExcludedCredit(
  character: string,
  settings: Settings,
): boolean {
  return settings.excludedCredits.some((name) =>
    creditFilters[name].test(character.trim()),
  );
}

export function isExcludedGenre(
  genreIds: readonly number[],
  settings: Settings,
): boolean {
  return genreIds.some((id) => isOf(id, settings.excludedGenres));
}

export function formatRole(role: Role): string {
  return role.episodes ? `${role.label} · ${role.episodes} ep` : role.label;
}

export function titleFromSummary(summary: Summary): Title {
  const common = {
    id: summary.id,
    overview: summary.overview ?? "",
    poster_path: summary.poster_path ?? null,
    genre_ids: summary.genre_ids ?? [],
    vote_count: summary.vote_count ?? 0,
  };
  switch (summary.media_type) {
    case "movie":
      return {
        ...common,
        key: toKey("movie", summary.id),
        media: "movie",
        name: summary.title,
        date: summary.release_date ?? "",
      };
    case "tv":
      return {
        ...common,
        key: toKey("tv", summary.id),
        media: "tv",
        name: summary.name,
        date: summary.first_air_date ?? "",
      };
  }
}

export function titleFromDetails(details: Details): Title {
  const genre_ids = details.data.genres.map((genre) => genre.id);
  switch (details.media) {
    case "movie":
      return titleFromSummary({
        ...details.data,
        media_type: "movie",
        genre_ids,
      });
    case "tv":
      return titleFromSummary({ ...details.data, media_type: "tv", genre_ids });
  }
}

function toPerson(person: Person): Person {
  return {
    id: person.id,
    name: person.name,
    profile_path: person.profile_path ?? null,
  };
}

export function listCredits(
  details: Details,
  settings: Settings,
): { person: Person; role: Role }[] {
  switch (details.media) {
    case "movie": {
      const { cast, crew } = details.data.credits;
      return [
        ...cast
          .filter(
            (c) =>
              c.order < settings.castLimit &&
              !isExcludedCredit(c.character, settings),
          )
          .map((c) => ({
            person: toPerson(c),
            role: { kind: "cast" as const, label: c.character },
          })),
        ...crew
          .filter((c) => isOf(c.job, settings.jobs))
          .map((c) => ({
            person: toPerson(c),
            role: { kind: "crew" as const, label: c.job },
          })),
      ];
    }
    case "tv": {
      const { created_by, number_of_episodes, aggregate_credits } =
        details.data;
      const minEpisodes = number_of_episodes * settings.episodeShare;
      const creators = isOf("Creator", settings.jobs)
        ? created_by.map((c) => ({
            person: toPerson(c),
            role: { kind: "crew" as const, label: "Creator" },
          }))
        : [];
      const leads = aggregate_credits.cast
        .filter(
          (c) =>
            !c.roles.every((r) => isExcludedCredit(r.character, settings)),
        )
        .sort((a, b) => b.total_episode_count - a.total_episode_count)
        .slice(0, settings.castLimit)
        .map((c) => ({
          person: toPerson(c),
          role: {
            kind: "cast" as const,
            label: c.roles.map((r) => r.character).join(" / "),
            episodes: c.total_episode_count,
          },
        }));
      const staff = aggregate_credits.crew.flatMap((c) =>
        c.jobs
          .filter(
            (j) =>
              isOf(j.job, settings.jobs) && j.episode_count >= minEpisodes,
          )
          .map((j) => ({
            person: toPerson(c),
            role: {
              kind: "crew" as const,
              label: j.job,
              episodes: j.episode_count,
            },
          })),
      );
      return [...creators, ...leads, ...staff];
    }
  }
}

export function candidateCredits(
  credits: CombinedCredits,
  settings: Settings,
): { title: Title; role: Role }[] {
  const cast = credits.cast
    .filter(
      (c) =>
        !isExcludedCredit(c.character, settings) &&
        (c.media_type === "movie"
          ? c.order < settings.castLimit
          : c.episode_count >= settings.minEpisodes),
    )
    .map((c) => ({
      title: titleFromSummary(c),
      role: {
        kind: "cast" as const,
        label: c.character,
        episodes: c.media_type === "tv" ? c.episode_count : undefined,
      },
    }));
  const crew = credits.crew
    .filter(
      (c) =>
        isOf(c.job, settings.jobs) &&
        (c.media_type === "movie" ||
          (c.episode_count ?? Infinity) >= settings.minEpisodes),
    )
    .map((c) => ({
      title: titleFromSummary(c),
      role: {
        kind: "crew" as const,
        label: c.job,
        episodes: c.media_type === "tv" ? c.episode_count : undefined,
      },
    }));
  return [...cast, ...crew].filter(
    (credit) => !isExcludedGenre(credit.title.genre_ids, settings),
  );
}

function groupBy<K, V>(
  links: readonly Link[],
  key: (link: Link) => K,
  value: (link: Link) => V,
): Map<K, Set<V>> {
  const groups = new Map<K, Set<V>>();
  for (const link of links) {
    const group = groups.get(key(link)) ?? new Set<V>();
    group.add(value(link));
    groups.set(key(link), group);
  }
  return groups;
}

export function buildModel(
  list: readonly MediaKey[],
  details: ReadonlyMap<MediaKey, Details>,
  credits: ReadonlyMap<PersonId, CombinedCredits>,
  settings: Settings,
): Model {
  const titles = new Map<MediaKey, Title>();
  const people = new Map<PersonId, Person>();
  const listLinks: Link[] = [];
  const candidateLinks: Link[] = [];

  for (const key of list) {
    const detail = details.get(key);
    if (!detail) continue;
    titles.set(key, titleFromDetails(detail));
    for (const { person, role } of listCredits(detail, settings)) {
      people.set(person.id, person);
      listLinks.push({ person: person.id, title: key, role });
    }
  }

  const personTitles = groupBy(
    listLinks,
    (link) => link.person,
    (link) => link.title,
  );
  const weights = new Map(
    [...personTitles].map(([id, keys]) => [id, keys.size]),
  );

  for (const id of people.keys()) {
    const credit = credits.get(id);
    if (!credit) continue;
    for (const { title, role } of candidateCredits(credit, settings)) {
      if (list.includes(title.key)) continue;
      titles.set(title.key, title);
      candidateLinks.push({ person: id, title: title.key, role });
    }
  }

  const candidates = [
    ...groupBy(
      candidateLinks,
      (link) => link.title,
      (link) => link.person,
    ),
  ]
    .map(([key, ids]) => {
      const contributors = [...ids].sort(
        (a, b) => (weights.get(b) ?? 0) - (weights.get(a) ?? 0),
      );
      const score = contributors.reduce(
        (sum, id) => sum + (weights.get(id) ?? 0),
        0,
      );
      const title = titles.get(key);
      assert(isNonNullable, title);
      return { title, score, people: contributors };
    })
    .filter(
      (candidate) =>
        candidate.people.length >= 2 ||
        candidate.people.some((id) => (weights.get(id) ?? 0) >= 2),
    )
    .sort(
      (a, b) => b.score - a.score || b.title.vote_count - a.title.vote_count,
    );

  const favorites = [...personTitles]
    .filter(([, keys]) => keys.size >= 2)
    .map(([id, keys]) => {
      const person = people.get(id);
      assert(isNonNullable, person);
      return { person, weight: keys.size, titles: [...keys] };
    })
    .sort(
      (a, b) => b.weight - a.weight || a.person.name.localeCompare(b.person.name),
    );

  return {
    list: new Set(list),
    titles,
    people,
    weights,
    listLinks,
    candidateLinks,
    candidates,
    favorites,
  };
}

export type GraphNode = {
  id: string;
  kind: "list" | "candidate" | "person";
  label: string;
  size: number;
  selection: Selection;
};
export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  kind: Role["kind"];
  label: string;
};
export type Graph = { nodes: GraphNode[]; edges: GraphEdge[] };

export function personNodeId(id: PersonId): string {
  return `person:${id}`;
}

export function selectGraph(model: Model, topK: number): Graph {
  const candidates = model.candidates.slice(0, topK);
  const candidateKeys = new Set(candidates.map((c) => c.title.key));
  const personIds = new Set([
    ...candidates.flatMap((c) => c.people),
    ...model.favorites.map((f) => f.person.id),
  ]);
  const links = [
    ...model.listLinks,
    ...model.candidateLinks.filter((link) => candidateKeys.has(link.title)),
  ].filter((link) => personIds.has(link.person));

  const titlePeople = groupBy(
    links,
    (link) => link.title,
    (link) => link.person,
  );
  const scores = new Map(candidates.map((c) => [c.title.key, c.score]));

  const titleNodes = [...titlePeople].map(([key, ids]): GraphNode => {
    const title = model.titles.get(key);
    assert(isNonNullable, title);
    const isList = model.list.has(key);
    return {
      id: key,
      kind: isList ? "list" : "candidate",
      label: title.name,
      size: isList ? ids.size : (scores.get(key) ?? 0),
      selection: { type: "title", key },
    };
  });
  const personNodes = [...personIds].map((id): GraphNode => {
    const person = model.people.get(id);
    assert(isNonNullable, person);
    return {
      id: personNodeId(id),
      kind: "person",
      label: person.name,
      size: model.weights.get(id) ?? 0,
      selection: { type: "person", id },
    };
  });

  const edges = new Map<string, GraphEdge>();
  for (const link of links) {
    const id = `${personNodeId(link.person)}>${link.title}>${link.role.kind}`;
    const existing = edges.get(id);
    const label = formatRole(link.role);
    edges.set(id, {
      id,
      source: personNodeId(link.person),
      target: link.title,
      kind: link.role.kind,
      label: existing ? `${existing.label} / ${label}` : label,
    });
  }

  return { nodes: [...titleNodes, ...personNodes], edges: [...edges.values()] };
}

export type TitleExplanation = {
  title: Title;
  isList: boolean;
  score: number;
  rows: { person: Person; weight: number; roles: Role[]; titles: Title[] }[];
};

export function explainTitle(model: Model, key: MediaKey): TitleExplanation {
  const title = model.titles.get(key);
  assert(isNonNullable, title);
  const isList = model.list.has(key);
  const links = (isList ? model.listLinks : model.candidateLinks).filter(
    (link) => link.title === key,
  );
  const roles = groupBy(
    links,
    (link) => link.person,
    (link) => link.role,
  );
  const rows = [...roles]
    .map(([id, personRoles]) => {
      const person = model.people.get(id);
      assert(isNonNullable, person);
      return {
        person,
        weight: model.weights.get(id) ?? 0,
        roles: [...personRoles],
        titles: listTitlesOf(model, id),
      };
    })
    .sort((a, b) => b.weight - a.weight);
  const score = isList
    ? 0
    : rows.reduce((sum, row) => sum + row.weight, 0);
  return { title, isList, score, rows };
}

export type PersonExplanation = {
  person: Person;
  weight: number;
  listRoles: { title: Title; roles: Role[] }[];
  candidateRoles: { title: Title; score: number; roles: Role[] }[];
};

export function explainPerson(model: Model, id: PersonId): PersonExplanation {
  const person = model.people.get(id);
  assert(isNonNullable, person);
  const listRoles = [...rolesByTitle(model.listLinks, id)].map(([key, roles]) => {
    const title = model.titles.get(key);
    assert(isNonNullable, title);
    return { title, roles: [...roles] };
  });
  const candidateRolesByTitle = rolesByTitle(model.candidateLinks, id);
  const candidateRoles = model.candidates
    .filter((candidate) => candidateRolesByTitle.has(candidate.title.key))
    .map((candidate) => ({
      title: candidate.title,
      score: candidate.score,
      roles: [...(candidateRolesByTitle.get(candidate.title.key) ?? [])],
    }));
  return {
    person,
    weight: model.weights.get(id) ?? 0,
    listRoles,
    candidateRoles,
  };
}

function rolesByTitle(
  links: readonly Link[],
  id: PersonId,
): Map<MediaKey, Set<Role>> {
  return groupBy(
    links.filter((link) => link.person === id),
    (link) => link.title,
    (link) => link.role,
  );
}

function listTitlesOf(model: Model, id: PersonId): Title[] {
  const keys = new Set(
    model.listLinks
      .filter((link) => link.person === id)
      .map((link) => link.title),
  );
  return [...keys].map((key) => {
    const title = model.titles.get(key);
    assert(isNonNullable, title);
    return title;
  });
}
