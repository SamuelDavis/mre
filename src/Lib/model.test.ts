import { describe, expect, it } from "vitest";
import {
  buildModel,
  candidateCredits,
  explainPerson,
  explainTitle,
  formatRole,
  isExcludedCredit,
  isExcludedGenre,
  isMediaKey,
  listCredits,
  parseKey,
  selectGraph,
  toKey,
  type Settings,
} from "./model";
import type { CombinedCredits, Details, MediaKey } from "../Types/TMDB";

const settings: Settings = {
  castLimit: 2,
  jobs: ["Director", "Creator"],
  episodeShare: 0.5,
  minEpisodes: 3,
  topK: 10,
  excludedGenres: [99, 10767],
  excludedCredits: ["Self", "Archive footage", "Host"],
};

const names = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F", 7: "G", 8: "H" };
type Id = keyof typeof names;

function person(id: Id) {
  return { id, name: names[id], profile_path: null };
}

function movie(
  id: number,
  cast: [Id, number, string?][],
  crew: [Id, string][],
): Details {
  return {
    media: "movie",
    data: {
      id,
      title: `Movie ${id}`,
      release_date: "2000-01-01",
      overview: "",
      poster_path: null,
      genres: [],
      vote_count: 0,
      credits: {
        cast: cast.map(([p, order, character = "Role"]) => ({
          ...person(p),
          order,
          character,
        })),
        crew: crew.map(([p, job]) => ({ ...person(p), job })),
      },
    },
  } as unknown as Details;
}

function tv(
  id: number,
  episodes: number,
  creators: Id[],
  cast: [Id, number][],
  crew: [Id, string, number][],
): Details {
  return {
    media: "tv",
    data: {
      id,
      name: `Show ${id}`,
      first_air_date: "2010-01-01",
      overview: "",
      poster_path: null,
      genres: [],
      vote_count: 0,
      number_of_episodes: episodes,
      created_by: creators.map(person),
      aggregate_credits: {
        cast: cast.map(([p, total]) => ({
          ...person(p),
          total_episode_count: total,
          roles: [{ character: "Role", episode_count: total }],
        })),
        crew: crew.map(([p, job, count]) => ({
          ...person(p),
          jobs: [{ job, episode_count: count }],
        })),
      },
    },
  } as unknown as Details;
}

type Summary = { id: number; genre_ids?: number[]; vote_count?: number };

function credits(
  id: Id,
  cast: (Summary & ({ order: number } | { episode_count: number }) & {
    character?: string;
  })[],
  crew: (Summary & { job: string; episode_count?: number; tv?: true })[],
): CombinedCredits {
  const summary = (s: Summary, media: "movie" | "tv") => ({
    media_type: media,
    title: `Movie ${s.id}`,
    name: `Show ${s.id}`,
    release_date: "2001-01-01",
    first_air_date: "2011-01-01",
    overview: "",
    poster_path: null,
    genre_ids: [],
    vote_count: 0,
    ...s,
  });
  return {
    id,
    cast: cast.map((c) => ({
      ...summary(c, "order" in c ? "movie" : "tv"),
      character: c.character ?? "Role",
    })),
    crew: crew.map((c) =>
      summary(c, c.tv || "episode_count" in c ? "tv" : "movie"),
    ),
  } as unknown as CombinedCredits;
}

describe("keys", () => {
  it("round-trips media keys", () => {
    expect(toKey("tv", 1396)).toBe("tv:1396");
    expect(parseKey("movie:603")).toEqual({ media: "movie", id: 603 });
    expect(isMediaKey("tv:1")).toBe(true);
    expect(isMediaKey("person:1")).toBe(false);
    expect(isMediaKey(1)).toBe(false);
  });
});

describe("noise filters", () => {
  it("excludes selected credit types", () => {
    expect(isExcludedCredit("Self", settings)).toBe(true);
    expect(isExcludedCredit("Herself - Guest", settings)).toBe(true);
    expect(isExcludedCredit("Neo (archive footage)", settings)).toBe(true);
    expect(isExcludedCredit("MC", settings)).toBe(true);
    expect(isExcludedCredit("Selfridge", settings)).toBe(false);
    expect(isExcludedCredit("Walter White", settings)).toBe(false);
    expect(isExcludedCredit("Hotel Guest", settings)).toBe(false);
    expect(
      isExcludedCredit("Self", { ...settings, excludedCredits: [] }),
    ).toBe(false);
  });

  it("excludes selected genres", () => {
    expect(isExcludedGenre([18, 10767], settings)).toBe(true);
    expect(isExcludedGenre([99], settings)).toBe(true);
    expect(isExcludedGenre([18, 35], settings)).toBe(false);
  });

  it("formats roles with episode counts", () => {
    expect(formatRole({ kind: "cast", label: "Neo" })).toBe("Neo");
    expect(formatRole({ kind: "crew", label: "Director", episodes: 3 })).toBe(
      "Director · 3 ep",
    );
  });
});

describe("listCredits", () => {
  it("keeps lead movie cast and important jobs", () => {
    const details = movie(1, [[1, 0], [2, 1], [3, 2], [5, 0, "Himself"]], [
      [4, "Director"],
      [6, "Producer"],
    ]);
    const ids = listCredits(details, settings).map((c) => c.person.id);
    expect(ids).toEqual([1, 2, 4]);
  });

  it("keeps tv creators, top cast by episodes, and regular crew", () => {
    const details = tv(2, 10, [4], [[5, 8], [1, 10], [6, 1]], [
      [7, "Director", 6],
      [8, "Director", 2],
    ]);
    const credits = listCredits(details, settings);
    expect(credits.map((c) => [c.person.id, c.role.label])).toEqual([
      [4, "Creator"],
      [1, "Role"],
      [5, "Role"],
      [7, "Director"],
    ]);
  });

  it("drops creators when Creator is not an important job", () => {
    const details = tv(2, 10, [4], [], []);
    expect(listCredits(details, { ...settings, jobs: [] })).toEqual([]);
  });
});

describe("candidateCredits", () => {
  it("applies the same importance rules to the candidate side", () => {
    const result = candidateCredits(
      credits(
        1,
        [
          { id: 10, order: 0 },
          { id: 12, order: 9 },
          { id: 11, episode_count: 5 },
          { id: 16, episode_count: 1 },
          { id: 17, episode_count: 9, character: "Self" },
          { id: 13, episode_count: 50, genre_ids: [10767] },
        ],
        [
          { id: 14, job: "Creator", tv: true },
          { id: 18, job: "Director", episode_count: 1 },
          { id: 19, job: "Producer" },
        ],
      ),
      settings,
    );
    expect(result.map((c) => c.title.key)).toEqual([
      "movie:10",
      "tv:11",
      "tv:14",
    ]);
  });
});

function scenario() {
  const list: MediaKey[] = ["movie:1", "tv:2"];
  const details = new Map<MediaKey, Details>([
    ["movie:1", movie(1, [[1, 0], [2, 1], [3, 5]], [[4, "Director"]])],
    ["tv:2", tv(2, 10, [4], [[1, 10], [5, 8], [6, 1]], [[7, "Director", 6]])],
  ]);
  const people = new Map<number, CombinedCredits>([
    [
      1,
      credits(
        1,
        [
          { id: 10, order: 0, character: "X" },
          { id: 10, order: 1, character: "Y" },
          { id: 11, episode_count: 5 },
          { id: 1, order: 0 },
          { id: 12, order: 9 },
          { id: 13, episode_count: 50, genre_ids: [10767] },
        ],
        [],
      ),
    ],
    [
      4,
      credits(4, [], [
        { id: 10, job: "Director" },
        { id: 14, job: "Creator", tv: true, vote_count: 100 },
      ]),
    ],
    [2, credits(2, [{ id: 10, order: 1 }, { id: 15, order: 0 }], [])],
    [5, credits(5, [{ id: 11, episode_count: 20, character: "Herself" }], [])],
  ]);
  return buildModel(list, details, people, settings);
}

describe("buildModel", () => {
  const model = scenario();

  it("weights people by how many list titles they're in", () => {
    expect(Object.fromEntries(model.weights)).toEqual({
      1: 2,
      2: 1,
      4: 2,
      5: 1,
      7: 1,
    });
  });

  it("scores unseen titles by summed weights and drops weak links", () => {
    expect(
      model.candidates.map((c) => [c.title.key, c.score, c.people]),
    ).toEqual([
      ["movie:10", 5, [1, 4, 2]],
      ["tv:14", 2, [4]],
      ["tv:11", 2, [1]],
    ]);
  });

  it("never recommends list titles", () => {
    expect(model.candidates.some((c) => model.list.has(c.title.key))).toBe(
      false,
    );
  });

  it("ranks favorite people", () => {
    expect(model.favorites.map((f) => [f.person.name, f.weight])).toEqual([
      ["A", 2],
      ["D", 2],
    ]);
  });
});

describe("selectGraph", () => {
  const graph = selectGraph(scenario(), 1);

  it("shows the top candidates, their people, and connected list titles", () => {
    expect(graph.nodes.map((n) => [n.id, n.kind, n.size]).sort()).toEqual(
      [
        ["movie:1", "list", 3],
        ["tv:2", "list", 2],
        ["movie:10", "candidate", 5],
        ["person:1", "person", 2],
        ["person:2", "person", 1],
        ["person:4", "person", 2],
      ].sort(),
    );
  });

  it("merges a person's roles on one title into one edge per kind", () => {
    const edge = graph.edges.find((e) => e.id === "person:1>movie:10>cast");
    expect(edge?.label).toBe("X / Y");
  });
});

describe("explanations", () => {
  const model = scenario();

  it("explains a candidate by its contributors", () => {
    const explanation = explainTitle(model, "movie:10");
    expect(explanation.isList).toBe(false);
    expect(explanation.score).toBe(5);
    expect(explanation.rows.map((r) => r.person.name)).toEqual(["A", "D", "B"]);
    expect(explanation.rows[0].titles.map((t) => t.key)).toEqual([
      "movie:1",
      "tv:2",
    ]);
  });

  it("explains a person by their list roles and recommendations", () => {
    const explanation = explainPerson(model, 4);
    expect(
      explanation.listRoles.map((r) => [r.title.key, r.roles[0].label]),
    ).toEqual([
      ["movie:1", "Director"],
      ["tv:2", "Creator"],
    ]);
    expect(explanation.candidateRoles.map((r) => r.title.key)).toEqual([
      "movie:10",
      "tv:14",
    ]);
  });
});
