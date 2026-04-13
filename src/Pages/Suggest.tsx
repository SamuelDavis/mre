import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  type JSX,
  onCleanup,
  onMount,
  Show,
  splitProps,
  type ComponentProps,
  type Signal,
} from "solid-js";
import { useApi, useDocumentStyles, useList } from "../AppState";
import type {
  Core,
  EdgeDefinition,
  Layouts,
  NodeDefinition,
  StylesheetJsonBlock,
} from "cytoscape";
import fcose, { type FcoseLayoutOptions } from "cytoscape-fcose";
import cytoscape from "cytoscape";
import {
  HTMLIcon,
  isArray,
  isString,
  Modal,
  type ExtendProps,
} from "@samueldavis/solidlib";
import Img from "../Components/Img";
import { type Href, getCreditsData, getPeopleData } from "../Types";
import { safe, waitUntil } from "../util";

type ElData = {
  _id: string | number;
  _type: "series" | "person" | "cast" | "crew";
  id: string;
};
type Cyto = { data(): ElData };

export default function Suggest() {
  const list = useList();
  const api = useApi();
  const getDocumentStyle = useDocumentStyles();
  const [getElement, setElement] = createSignal<ElData>();

  const [getElements, { mutate }] = createResource(
    list.arr,
    async (
      ids,
    ): Promise<{
      nodes: Map<string, NodeDefinition>;
      edges: Map<string, EdgeDefinition>;
    }> => {
      const nodes = new Map<string, NodeDefinition>();
      const edges = new Map<string, EdgeDefinition>();

      const seriesReqs = ids.map((id) => api.tvSeriesDetails(id));
      for await (const seriesRes of seriesReqs) {
        const seriesData = {
          _id: seriesRes.id,
          _type: "series",
          id: `${seriesRes.id}:series`,
        } as const;
        nodes.set(seriesData.id, { data: seriesData });

        const creditsData = getCreditsData(seriesRes);
        const peopleData = getPeopleData(seriesRes);

        for (const creditData of creditsData)
          edges.set(creditData.id, { data: creditData });

        for (const personData of peopleData)
          nodes.set(personData.id, { data: personData });

        const peopleReqs = peopleData.map((data) =>
          api.personDetails(data._id),
        );
        for await (const { tv_credits } of peopleReqs) {
          const seriesReqs = [
            ...safe(tv_credits.cast, []),
            ...safe(tv_credits.crew, []),
          ].map((credit) => api.tvSeriesDetails(credit.id));
          for await (const seriesRes of seriesReqs) {
            const seriesData = {
              _id: seriesRes.id,
              _type: "series",
              id: `${seriesRes.id}:series`,
            } as const;
            nodes.set(seriesData.id, { data: seriesData });

            for (const creditData of getCreditsData(seriesRes))
              edges.set(creditData.id, { data: creditData });
            for (const personData of getPeopleData(seriesRes))
              nodes.set(personData.id, { data: personData });
          }

          await waitUntil(animationDuration);
          mutate({ nodes, edges });
        }
      }

      for (let i = 0; i < 10; i++) {
        const elementDegrees = new Map<string, number>();
        for (const { data } of edges.values())
          if (data.source && data.target)
            for (const node of [data.source, data.target])
              elementDegrees.set(node, (elementDegrees.get(node) ?? 0) + 1);

        for (const [edge, { data }] of edges) {
          for (const node of [data.source, data.target])
            if ((elementDegrees.get(node) ?? 0) <= 1) edges.delete(edge);
        }

        nextNode: for (const node of nodes.keys()) {
          for (const { data } of edges.values())
            if ([data.source, data.target].includes(node)) continue nextNode;
          nodes.delete(node);
        }

        await waitUntil(animationDuration);
      }

      return { nodes, edges };
    },
    { initialValue: { nodes: new Map(), edges: new Map() } },
  );

  const getListEdges = createMemo(() => {
    const listSeries = list.arr().map((id) => `${id}:series`);
    const edges = getElements().edges;
    return [...edges.values()].filter((edge) =>
      listSeries.includes(edge.data.source),
    );
  });

  const getElementDegrees = createMemo(() => {
    const elementDegrees = new Map<string, number>();
    const { edges } = getElements();
    for (const { data } of edges.values())
      if (data.source && data.target)
        for (const node of [data.source, data.target])
          elementDegrees.set(node, (elementDegrees.get(node) ?? 0) + 1);

    return elementDegrees;
  });

  function getSize(node: Cyto): number {
    const { id, _type } = node.data();
    const degree = getElementDegrees().get(id) ?? 0;
    let mod = 1;
    if (_type === "series")
      mod = getListEdges().some((edge) => edge.data.source === id) ? 4 : 2;
    else if (_type === "person")
      mod = getListEdges().some((edge) => edge.data.target === id) ? 4 : 2;
    else throw new TypeError();
    return Math.log(degree + 1) * mod * 10;
  }

  function getColor(node: Cyto): NonNullable<JSX.CSSProperties["color"]> {
    const { _type } = node.data();
    switch (_type) {
      case "series":
        return "cyan";
      case "person":
        return "magenta";
      case "cast":
        return "yellow";
      case "crew":
        return "gray";
    }
  }

  onMount(() => {
    // @ts-ignore
    cytoscape.use(fcose);
    cy = cytoscape({
      container,
      style,
    }).on("tap", "node, edge", (event) => {
      const target: Cyto = event.target;
      setElement(target.data());
    });

    onCleanup(() => cy?.destroy());
  });

  createEffect(() => {
    const { nodes, edges } = getElements();
    layout.randomize = !currentLayout;
    currentLayout = cy
      ?.json({
        elements: { nodes: [...nodes.values()], edges: [...edges.values()] },
      })
      .layout(layout)
      .run();
  });

  function onRecenter(): void {
    cy?.animate({
      fit: { eles: cy.elements(), padding: 0 },
    });
  }

  const animationDuration = 250;

  let container: undefined | HTMLDivElement;
  let cy: undefined | Core;
  let currentLayout: undefined | Layouts;

  const layout: FcoseLayoutOptions = {
    name: "fcose",
    quality: "proof",
    numIter: 4000,
    randomize: true,
    animate: true,
    animationDuration,
  };

  const style: StylesheetJsonBlock[] = [
    {
      selector: "node, edge",
      style: {
        color: getDocumentStyle("color"),
        "font-family": getDocumentStyle("font-family"),
        "font-weight": getDocumentStyle("font-weight"),
        "font-size": getDocumentStyle("font-size"),
      },
    },
    {
      selector: "node",
      style: {
        label: (node: Cyto): string => {
          const { id } = node.data();
          const degrees = getElementDegrees();
          const degree = degrees.get(id) ?? 0;
          return String(degree);
        },
        "text-halign": "center",
        "text-valign": "center",
        width: getSize,
        height: getSize,
        "background-color": getColor,
        "border-color": "white",
        "border-style": "solid",
        "border-width": "1px",
      },
    },
    {
      selector: "edge",
      style: {
        "text-rotation": "autorotate",
        "curve-style": "bezier",
        "line-color": getColor,
      },
    },
  ];

  return (
    <article>
      <header>
        <h1>Suggest</h1>
        <h2>
          {getElements().nodes.size} nodes, {getElements().edges.size} edges
          found.
        </h2>
      </header>
      <section>
        <div
          ref={container}
          class="relative aspect-video touch-none bg-(--pico-background-color)"
        >
          <HTMLIcon
            type="recenter"
            onClick={onRecenter}
            class="z-1 absolute bottom-0 right-0 rounded-full"
          />
          <Show when={getElements.loading}>
            <progress class="absolute top-0 left-0" />
          </Show>
        </div>
      </section>
      <Show when={getElement()}>
        {(get) => <DetailsModal data={[get, setElement]} />}
      </Show>
    </article>
  );

  function DetailsModal(
    props: ExtendProps<"article", { data: Signal<undefined | ElData> }>,
  ) {
    type Details = {
      id: number;
      type: string;
      name: string;
      overview?: string;
      img:
        | ComponentProps<typeof Img<"poster">>
        | ComponentProps<typeof Img<"profile">>;
      href?: Href;
      extra: { key: string; value: number | string | string[] }[];
    };

    const [local, parent] = splitProps(props, ["data"]);
    const [get, set] = local.data;
    const api = useApi();
    const onClose = () => set(undefined);
    const [getDetails] = createResource(get, async (el): Promise<Details> => {
      const { _id, _type } = el;
      switch (_type) {
        case "series": {
          const res = await api.tvSeriesDetails(Number(_id));
          const img: ComponentProps<typeof Img<"poster">> = {
            type: "poster",
            size: "w185",
            path: res.poster_path,
          };
          return {
            id: res.id,
            type: _type,
            name: res.name ?? "",
            overview: res.overview,
            img,
            href: `https://www.themoviedb.org/tv/${res.id}`,
            extra: [
              { key: "release", value: res.first_air_date ?? "" },
              { key: "episodes", value: res.number_of_episodes },
              { key: "seasons", value: safe(res.seasons, []).length },
              {
                key: "genres",
                value: safe(res.genres, [])
                  .map((genre) => genre.name)
                  .filter(isString),
              },
            ],
          };
        }
        case "person": {
          const res = await api.personDetails(Number(_id));
          const img: ComponentProps<typeof Img<"profile">> = {
            type: "profile",
            size: "w185",
            path: res.profile_path,
          };
          return {
            id: res.id,
            type: _type,
            name: res.name ?? "",
            overview: res.biography,
            img,
            href: `https://www.themoviedb.org/person/${res.id}`,
            extra: [
              { key: "birthday", value: res.birthday ?? "" },
              {
                key: "gender",
                value: ["female", "male"][res.gender - 1] ?? "?",
              },
              { key: "known for", value: res.known_for_department ?? "" },
            ],
          };
        }
        case "cast":
        case "crew": {
          const res = await api.creditDetails(String(_id));
          const { media, person } = res;

          const img: ComponentProps<typeof Img<"profile">> = {
            type: "profile",
            size: "w185",
            path: person?.profile_path ?? "",
          };

          return {
            id: person?.id ?? 0,
            type: _type,
            name: person?.name ?? "",
            img,
            extra: [
              { key: "Department", value: res.department ?? "" },
              media?.character
                ? { key: "Character", value: media.character ?? "" }
                : { key: "Job", value: res.job ?? "" },
              {
                key: "gender",
                value: ["female", "male"][safe(person?.gender, 0) - 1] ?? "?",
              },
            ],
          };
        }
      }
    });
    const getDegree = () => {
      const id = get()?.id ?? "";
      return getElementDegrees().get(id) ?? 0;
    };

    return (
      <Modal onClose={onClose}>
        <article {...parent}>
          <Show when={getDetails()} fallback={<progress />}>
            {(getDetails) => (
              <>
                <header class="flex justify-between">
                  <div>
                    <h1>{getDetails().name}</h1>
                    <Show when={getDegree()}>
                      {(get) => <h2>{get()} Nodes</h2>}
                    </Show>
                  </div>
                  <HTMLIcon type="close" onClick={onClose} class="h-8 w-8" />
                </header>
                <section class="flex justify-between">
                  <div>
                    <small>
                      {getDetails().type} {getDetails().id}
                    </small>
                    <dl>
                      <For each={getDetails().extra}>
                        {({ key, value }) => (
                          <>
                            <dt>{key}</dt>
                            <Show
                              when={isArray(value) ? value : undefined}
                              fallback={<dd>{value}</dd>}
                            >
                              {(get) => (
                                <For each={get()}>
                                  {(get) => <dd>{get}</dd>}
                                </For>
                              )}
                            </Show>
                          </>
                        )}
                      </For>
                    </dl>
                  </div>
                  <Show when={getDetails().img}>
                    {(get) => <Img {...get()} />}
                  </Show>
                </section>
                <Show when={getDetails().overview}>
                  {(get) => <p>{get()}</p>}
                </Show>
                <Show when={getDetails().href}>
                  {(get) => (
                    <a target="_blank" href={get()}>
                      TMDB <HTMLIcon type="open_in_new" />
                    </a>
                  )}
                </Show>
              </>
            )}
          </Show>
        </article>
      </Modal>
    );
  }
}
