import { useSearchParams } from "@solidjs/router";
import * as d3 from "d3";
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import {
  type Accessor,
  ErrorBoundary,
  For,
  type JSX,
  type Setter,
  Show,
  Suspense,
  batch,
  createEffect,
  createResource,
  createRoot,
  createSignal,
} from "solid-js";
import { RenderedError } from "./components";
import {
  ImportantJobs,
  ImportantRoles,
  type Language,
  type ProductionCountry,
  type TvGenre,
  type country,
  type department,
  type job,
  type language,
} from "./constants";
import { type ErrorResponse, isErrorResponse } from "./types";
import {
  createPersistentSignal,
  createPersistentStore,
  preventDefault,
} from "./utilities";
import ImageSource from "./ImgSrc";

type Targeted<
  Ev extends Event,
  El extends Element = Ev extends InputEvent
    ? HTMLInputElement
    : Ev extends SubmitEvent
      ? HTMLFormElement
      : HTMLElement,
> = Ev & { currentTarget: El; target: Element };

enum Gender {
  Unknown = 0,
  Female = 1,
  Male = 2,
}
type int = number;
type datestr =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
type image_path = null | `/${string}`;
type status = "Ended" | string;
type series_type = "Scripted" | string;
type episode_type = "finale" | string;
type production_code = string;

type Paginated<T> = {
  page: 0 | int;
  total_pages: 0 | int;
  total_results: 0 | int;
  results: Array<T>;
};

type SearchTvResult = {
  adult: true | boolean;
  backdrop_path: string;
  genre_ids: TvGenre["id"][];
  id: 0 | int;
  origin_country: country[];
  original_language: language;
  original_name: string;
  overview: string;
  popularity: 0 | number;
  poster_path: string;
  first_air_date: datestr;
  name: string;
  vote_average: 0 | number;
  vote_count: 0 | int;
};

type Cast = {
  adult: true | boolean;
  gender: Gender.Unknown | Gender;
  id: int;
  known_for_department: department;
  name: string;
  original_name: string;
  popularity: 0 | number;
  profile_path: image_path;
  character: string;
  credit_id: string;
  order: 0 | int;
};

type Crew = {
  adult: true | boolean;
  gender: Gender.Unknown | Gender;
  id: int;
  known_for_department: department;
  name: string;
  original_name: string;
  popularity: 0 | number;
  profile_path: image_path;
  credit_id: string;
  department: department;
  job: job;
};

type ProductionCompany = {
  id: 0 | int;
  logo_path: image_path;
  name: string;
  origin_country: country;
};

type Creator = Pick<
  Crew,
  "id" | "credit_id" | "name" | "original_name" | "gender" | "profile_path"
>;

type Network = {
  id: int;
  logo_path: image_path;
  name: string;
  origin_country: country;
};

type Season = {
  air_date: datestr;
  episode_count: 0 | int;
  id: 0 | int;
  name: string;
  overview: string;
  poster_path: image_path;
  season_number: 0 | int;
  vote_average: 0 | number;
};

type Episode = {
  id: int;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: int;
  air_date: datestr;
  episode_number: int;
  episode_type: episode_type;
  production_code: production_code;
  runtime: int;
  season_number: int;
  show_id: int;
  still_path: image_path;
};

type TvSeriesDetails = Pick<
  SearchTvResult,
  | "id"
  | "adult"
  | "backdrop_path"
  | "first_air_date"
  | "name"
  | "origin_country"
  | "original_language"
  | "original_name"
  | "overview"
  | "popularity"
  | "poster_path"
  | "vote_count"
  | "vote_average"
> & {
  created_by: Creator[];
  episode_run_time: int[];
  genres: TvGenre[];
  homepage: string;
  in_production: true | boolean;
  languages: language[];
  last_air_date: datestr;
  last_episode_to_air: null | Episode;
  next_episode_to_air: null | string;
  networks: Network[];
  number_of_episodes: 0 | int;
  number_of_seasons: 0 | int;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: Season[];
  spoken_languages: Language[];
  status: status;
  tagline: string;
  type: series_type;
};

type Credit<AdditionalProperties extends object = object> = {
  adult: true | boolean;
  backdrop_path: string;
  genre_ids: TvGenre["id"][];
  id: int;
  origin_country: country[];
  original_language: language;
  original_name: string;
  overview: string;
  popularity: 0 | number;
  poster_path: string;
  first_air_date: datestr;
  name: string;
  vote_average: 0 | number;
  vote_count: 0 | int;
  credit_id: string;
  episode_count: 0 | int;
} & AdditionalProperties;

type CastCredit = Credit<{ character: string }>;

type CrewCredit = Credit<{ department: department; job: job }>;

interface Api {
  searchTv: {
    request: { query: string };
    response: Paginated<SearchTvResult>;
  };
  tvSeriesDetails: {
    request: { series_id: int };
    response: TvSeriesDetails & { credits: { cast: Cast[]; crew: Crew[] } };
  };
  personTvCredits: {
    request: { person_id: int };
    response: {
      cast: CastCredit[];
      crew: CrewCredit[];
      id: int;
    };
  };
}

type ApiFactory = {
  [Key in keyof Api]: (
    request: Api[Key]["request"],
  ) => Promise<Api[Key]["response"]>;
};

type PathFactory = {
  [Key in keyof Api]: (request: Api[Key]["request"]) => URL;
};

function useSearchQuery() {
  const [searchParams, setSearchParams] = useSearchParams<{ query: string }>();
  const getQuery = () => searchParams.query ?? "";
  const setQuery = (query: string) => setSearchParams({ query });
  return [getQuery, setQuery] as const;
}

export default function App() {
  return (
    <article>
      <ApiKeyForm />
      <details>
        <summary>Search</summary>
        <SearchForm />
        <SearchResults />
      </details>
      <details>
        <summary>List</summary>
        <List />
      </details>
      <details>
        <summary>Data</summary>
        <Data />
      </details>
    </article>
  );
}

function List() {
  const getTvSeriesInList = () => {
    const list = tvList.get();
    const series = tvSeries.get();
    return series.filter((series) => list.includes(series.id));
  };
  return (
    <For each={getTvSeriesInList()}>
      {(item) => (
        <article>
          <header>
            <h1>{item.name}</h1>
            <TvListToggle result={item} />
          </header>
          <p>{item.overview}</p>
          <details>
            <summary>Cast</summary>
            <For each={tvCast.getBySeries(item)}>
              {(cast) => (
                <article>
                  <h3>{cast.name}</h3>
                  <h5>{cast.character}</h5>
                </article>
              )}
            </For>
          </details>
          <details>
            <summary>Crew</summary>
            <For each={tvCrew.getBySeries(item)}>
              {(cast) => (
                <article>
                  <h3>{cast.name}</h3>
                  <h5>{cast.job}</h5>
                </article>
              )}
            </For>
          </details>
        </article>
      )}
    </For>
  );
}

function ApiKeyForm() {
  function onUpdateApiKey(event: Targeted<InputEvent>) {
    httpCache.setApiKey(event.currentTarget.value);
  }

  return (
    <form onSubmit={preventDefault}>
      <label>
        <span>Api Key</span>&nbsp;
        <small>
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noreferrer"
          >
            More Info
          </a>
        </small>
        <input
          type="text"
          value={httpCache.getApiKey()}
          onInput={onUpdateApiKey}
        />
      </label>
    </form>
  );
}

function SearchForm() {
  const [getQuery, setQuery] = useSearchQuery();

  function onSearchTv(event: Targeted<SubmitEvent>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = data.get("query")?.toString() ?? "";
    setQuery(query);
  }

  return (
    <form onSubmit={onSearchTv}>
      <label>
        <span>Search</span>
        <input type="search" name="query" value={getQuery()} />
      </label>
    </form>
  );
}

function SearchResults() {
  const [getQuery] = useSearchQuery();
  const [getResults] = createResource(
    () => getQuery(),
    (query) =>
      query
        ? apiFactory.searchTv({ query }).then((results) => results.results)
        : [],
  );

  return (
    <ErrorBoundary fallback={RenderedError}>
      <Suspense fallback={<progress />}>
        <For each={getResults()}>
          {(result) => (
            <article>
              <header>
                <h1>{result.name}</h1>
                <TvListToggle result={result} />
              </header>
              <p>{result.overview}</p>
            </article>
          )}
        </For>
      </Suspense>
    </ErrorBoundary>
  );
}

function TvListToggle(props: { result: Pick<SearchTvResult, "id"> }) {
  const [getLoading, setLoading] = createSignal(false);

  function onToggleInTvList(
    id: SearchTvResult["id"],
    event: Targeted<InputEvent>,
  ) {
    if (getLoading()) return;
    if (tvList.has(id)) return tvList.remove(id);
    tvList.add(id);
    event.currentTarget.checked = tvList.has(id);
    setLoading(true);
    fetchSeriesInfo(id, true).then(() => setLoading(false));
  }

  return (
    <fieldset>
      <label>
        <input
          disabled={getLoading()}
          style={{ "margin-right": "1em" }}
          type="checkbox"
          role="switch"
          checked={tvList.has(props.result.id)}
          aria-checked={tvList.has(props.result.id)}
          onInput={[onToggleInTvList, props.result.id]}
        />
        <span>Add to List</span>
      </label>
      <Show when={getLoading()}>
        <progress />
      </Show>
    </fieldset>
  );
}

const apiFactory = new Proxy(
  {},
  {
    get<Key extends keyof Api>(
      _target: never,
      p: Key | "rateLimit",
      _receiver: never,
    ) {
      if (p === "rateLimit") return 25;
      return (request: Api[Key]["request"]) => {
        const path = urlFactory[p](request);
        const url = new URL(`${path}`);
        for (const key in request)
          url.searchParams.set(key, String(request[key]));
        return cachingFetch<Api[Key]["response"]>(url);
      };
    },
  },
) as ApiFactory & { rateLimit: number };

const urlFactory: PathFactory = {
  searchTv() {
    return new URL("https://api.themoviedb.org/3/search/tv");
  },
  tvSeriesDetails(request) {
    return new URL(
      `https://api.themoviedb.org/3/tv/${request.series_id}?append_to_response=credits`,
    );
  },
  personTvCredits(request) {
    return new URL(
      `https://api.themoviedb.org/3/person/${request.person_id}/tv_credits?append_to_response=credits`,
    );
  },
};

async function cachingFetch<Data extends object>(url: URL): Promise<Data> {
  const apiKey = httpCache.getApiKey();
  const key = url.toString();
  const body =
    httpCache.getRequest(key) ??
    (await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    }).then((res) => res.text()));

  if (!(typeof body === "string")) throw new TypeError();
  const data: ErrorResponse | Data = JSON.parse(body);

  if (isErrorResponse(data)) throw new Error(data.status_message);
  // httpCache.setRequest(key, body);
  return data;
}

const httpCache = createRoot(() => {
  const [getApiKey, setApiKey] = createPersistentSignal({
    key: "api-key",
    reviver: "",
  });
  const [requestPathResponseMap, setRequests] = createPersistentStore<
    Record<string, unknown>
  >({ key: "requests", reviver: {} });

  function setRequest(path: string, value: unknown): void {
    setRequests((requests) => ({ ...requests, [path]: value }));
  }

  function getRequest(path: string) {
    return requestPathResponseMap[path];
  }

  return { getApiKey, setApiKey, getRequest, setRequest };
});

const tvList = createRoot(() => {
  const [get, set] = createPersistentSignal<SearchTvResult["id"][]>({
    key: "tv-list",
    reviver: [],
  });

  function add(id: SearchTvResult["id"]): void {
    set((list) => (list.includes(id) ? list : [...list, id]));
  }

  function remove(id: SearchTvResult["id"]): void {
    set((list) => {
      const index = list.indexOf(id);
      return index in list
        ? [...list.slice(0, index), ...list.slice(index + 1)]
        : list;
    });
  }

  function has(id: SearchTvResult["id"]): boolean {
    return get().includes(id);
  }

  return { add, remove, has, get };
});

const tvSeries = createRoot(() => {
  type TvSeries = Omit<TvSeriesDetails, "created_by">;
  const [get, set] = createPersistentSignal<TvSeries[]>({
    key: "tv-series",
    reviver: [],
  });

  function add(series: TvSeries): void {
    set((existing) => {
      return existing.some((existing) => existing.id === series.id)
        ? existing
        : [...existing, series];
    });
  }

  function getById(id: TvSeriesDetails["id"]) {
    return get().find((item) => item.id === id);
  }

  return { add, get, getById };
});

function getPeople<T extends { series_id: TvSeriesDetails["id"] }>(
  series_id: TvSeriesDetails["id"],
  get: Accessor<T[]>,
): T[] {
  return get().filter((person) => person.series_id === series_id);
}

function addPeople<T extends Cast | Crew>(
  id: TvSeriesDetails["id"],
  people: T[],
  set: Setter<(T & { series_id: TvSeriesDetails["id"] })[]>,
): void {
  set((members) => {
    const toAdd = people
      .filter(
        (person) =>
          !members.some(
            (member) => member.id === person.id && member.series_id === id,
          ),
      )
      .map((person) => ({ ...person, series_id: id }));
    return toAdd.length === 0 ? members : [...members, ...toAdd];
  });
}

const tvCast = createRoot(() => {
  type TvCast = Cast & { series_id: TvSeriesDetails["id"] };
  const [get, set] = createPersistentSignal<TvCast[]>({
    key: "tv-cast",
    reviver: [],
  });

  function add(id: TvSeriesDetails["id"], people: Cast[]): void {
    addPeople(id, people, set);
  }

  function getBySeries(series: Pick<TvSeriesDetails, "id">) {
    return getPeople(series.id, get);
  }

  function getById(id: TvCast["id"]) {
    return get().find((person) => person.id === id);
  }

  return { add, getBySeries, getById };
});

const tvCrew = createRoot(() => {
  type TvCrew = Crew & { series_id: TvSeriesDetails["id"] };
  const [get, set] = createPersistentSignal<TvCrew[]>({
    key: "tv-crew",
    reviver: [],
  });

  function add(id: TvSeriesDetails["id"], people: Crew[]): void {
    addPeople(id, people, set);
  }

  function getBySeries(series: Pick<TvSeriesDetails, "id">) {
    return getPeople(series.id, get);
  }

  function getById(id: TvCrew["id"]) {
    return get().find((person) => person.id === id);
  }

  return { add, getBySeries, getById };
});

function transformCreatorToCrew(creator: Creator): Crew {
  return {
    ...creator,
    adult: true,
    job: "Creator",
    department: "Creator",
    gender: Gender.Unknown,
    known_for_department: "Creator",
    popularity: 0,
  };
}

function uniq<T, I = unknown>(array: T[], identity: (item: T) => I): T[] {
  const iterator = array
    .reduce((acc, item) => acc.set(identity(item), item), new Map<I, T>())
    .values();
  return Array.from(iterator);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    const chunk = arr.slice(i, i + size);
    chunks.push(chunk);
  }
  return chunks;
}

async function fetchSeriesInfo(series_id: int, withRelated: boolean) {
  const response = await apiFactory.tvSeriesDetails({ series_id });
  const { created_by, credits, ...series } = response;
  batch(() => {
    tvSeries.add(series);
    tvCast.add(series.id, credits.cast);
    tvCrew.add(series.id, credits.crew);
    tvCrew.add(series.id, created_by.map(transformCreatorToCrew));
  });

  if (withRelated) {
    const importantPeople = [
      ...credits.cast.filter((cast) => cast.order <= ImportantRoles),
      ...credits.crew.filter((crew) => ImportantJobs.includes(crew.job)),
    ];

    let peopleResponses: Api["personTvCredits"]["response"][] = [];
    for (const people of chunk(importantPeople, apiFactory.rateLimit)) {
      const requests = people.map((person) =>
        apiFactory.personTvCredits({ person_id: person.id }),
      );
      const responses = await Promise.all(requests);
      peopleResponses = peopleResponses.concat(responses);
      await sleep();
    }

    const relatedSeriesIds = peopleResponses
      .flatMap((response) => [...response.cast, ...response.crew])
      .map((credit) => credit.id);

    const seriesIds = uniq(relatedSeriesIds, (id) => id);
    for (const ids of chunk(seriesIds, apiFactory.rateLimit)) {
      await Promise.all(
        ids.map((series_id) => fetchSeriesInfo(series_id, false)),
      );
      await sleep();
    }
  }

  return series;
}

async function sleep(): Promise<void> {
  await new Promise((r) => setTimeout(r, Math.random() * 1000 + 1000));
}

enum Type {
  Show = "show",
  Cast = "cast",
  Crew = "crew",
}

function Data() {
  let svgRef: undefined | SVGSVGElement;
  let tooltipRef: undefined | HTMLDivElement;

  const inListTypeColorMap: Record<
    Type,
    Exclude<JSX.CSSProperties["color"], undefined>
  > = {
    [Type.Show]: "red",
    [Type.Cast]: "green",
    [Type.Crew]: "blue",
  };
  const notListTypeColorMap: Record<
    Type,
    Exclude<JSX.CSSProperties["color"], undefined>
  > = {
    [Type.Show]: "yellow",
    [Type.Cast]: "teal",
    [Type.Crew]: "purple",
  };

  type Node = SimulationNodeDatum & {
    id: string;
    type: Type;
    list: boolean;
  };
  type Link = SimulationLinkDatum<Node> & {
    source: string;
    target: string;
  };
  type GraphData = { nodes: Node[]; links: Link[] };

  const getGraphData = (): GraphData => {
    const nodes: Node[] = [];
    const links: Link[] = [];

    const listSeries = tvList.get();
    const listCast = listSeries
      .flatMap((id) => tvCast.getBySeries({ id }))
      .map((person) => person.id);
    const listCrew = listSeries
      .flatMap((id) => tvCrew.getBySeries({ id }))
      .map((person) => person.id);

    for (const series of tvSeries.get()) {
      const seriesId = `${Type.Show}:${series.id}`;
      nodes.push({
        id: seriesId,
        type: Type.Show,
        list: listSeries.includes(series.id),
      });
      for (const person of tvCast.getBySeries(series)) {
        if (person.order > ImportantRoles) continue;
        const personId = `${Type.Cast}:${person.id}`;
        if (!nodes.some((node) => node.id === personId))
          nodes.push({
            id: personId,
            type: Type.Cast,
            list: listCast.includes(person.id),
          });
        links.push({ source: seriesId, target: personId });
      }
      for (const person of tvCrew.getBySeries(series)) {
        if (!ImportantJobs.includes(person.job)) continue;
        const personId = `${Type.Crew}:${person.id}`;
        if (!nodes.some((node) => node.id === personId))
          nodes.push({
            id: personId,
            type: Type.Crew,
            list: listCrew.includes(person.id),
          });
        links.push({ source: seriesId, target: personId });
      }
    }

    return { nodes, links };
  };

  const [getTargetId, setTargetId] = createSignal<undefined | string>();

  createEffect(() => {
    if (!svgRef) return;
    if (!tooltipRef) return;

    svgRef.innerHTML = "";
    tooltipRef.innerHTML = "";

    const container = svgRef.parentElement;
    const width = container?.clientWidth ?? 800;
    const height = Math.max(600, container?.clientHeight ?? 600);

    const graphData = getGraphData();
    console.debug(graphData);

    const svg = d3
      .select(svgRef)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "100%")
      .call(
        d3
          .zoom()
          .scaleExtent([0.1, 3])
          .on("zoom", ({ transform }) => {
            svgGroup.attr("transform", transform);
          }),
      );

    const svgGroup = svg.append("g");

    const tooltip = d3
      .select(tooltipRef)
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid black")
      .style("padding", "5px")
      .style("display", "none");

    const nodeDegree: Record<string, number> = {};
    for (const link of graphData.links)
      for (const key of [link.source, link.target])
        nodeDegree[key] = (nodeDegree[key] ?? 0) + 1;

    const sizeScale = d3
      .scaleLinear()
      .domain([1, d3.max(Object.values(nodeDegree)) || 1])
      .range([6, 20]);

    const simulation = d3
      .forceSimulation(graphData.nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(graphData.links)
          .id((d) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svgGroup
      .append("g")
      .selectAll("line")
      .data(graphData.links)
      .enter()
      .append("line")
      .attr("stroke", "#aaa");

    const node = svgGroup
      .append("g")
      .selectAll("circle")
      .data(graphData.nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => sizeScale(nodeDegree[d.id] ?? 1))
      .attr("fill", (d) =>
        d.list ? inListTypeColorMap[d.type] : notListTypeColorMap[d.type],
      )
      .attr("opacity", (d) => (d.list ? 1 : 0.5))
      .on("mouseover", (event, d) => {
        setTargetId(d.id);
        tooltip
          .style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", () => {
        setTargetId(undefined);
        tooltip.style("display", "none");
      })
      .on("click", (_event, d) => {
        alert(`Clicked on: ${d.id}`);
      })
      .call(
        d3
          .drag<any, Node>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
    });
  });

  return (
    <article>
      <svg ref={svgRef} />
      <div ref={tooltipRef}>
        <Show when={getTargetId()}>
          {(getId) => {
            const [type, id] = getId().split(":");
            return <RenderType type={type as Type} id={Number(id)} />;
          }}
        </Show>
      </div>
    </article>
  );
}

function RenderType(props: { type: Type; id: int }) {
  switch (props.type) {
    case Type.Show: {
      const item = tvSeries.getById(props.id);
      if (item)
        return (
          <aside>
            <h4>
              {item.name} ({props.type})
            </h4>
            <img
              src={new ImageSource(item.poster_path, "w154").toString()}
              alt="poster"
            />
          </aside>
        );
      break;
    }
    case Type.Crew:
    case Type.Cast: {
      const item =
        props.type === Type.Crew
          ? tvCrew.getById(props.id)
          : tvCast.getById(props.id);
      if (item)
        return (
          <aside>
            <h4>
              {item.name} ({props.type})
            </h4>
            <img
              src={new ImageSource(item.profile_path ?? "", "w185").toString()}
              alt="profile"
            />
          </aside>
        );
      break;
    }
  }
}
