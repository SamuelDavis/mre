import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  splitProps,
  Suspense,
  type ComponentProps,
  type Signal,
} from "solid-js";
import { useApi, useDocumentStyles, useList } from "../AppState";
import type {
  Core,
  EdgeDefinition,
  NodeDataDefinition,
  NodeDefinition,
  StylesheetJsonBlock,
} from "cytoscape";
import fcose, { type FcoseLayoutOptions } from "cytoscape-fcose";
import cytoscape from "cytoscape";
import { waitUntil } from "../util";
import {
  HTMLIcon,
  isArray,
  Modal,
  type ExtendProps,
} from "@samueldavis/solidlib";
import Img from "../Components/Img";
import {
  isInterestingCast,
  isInterestingCrew,
  type Department,
  type PersonId,
  type TvSeriesDetailsResponse,
  type TVSeriesId,
  type Node,
} from "../Types";

export default function Suggest() {
  const list = useList();
  const api = useApi();
  const getDocumentStyle = useDocumentStyles();
  const [getElement, setElement] = createSignal<NodeDataDefinition>();

  const fontSize = Number(getDocumentStyle("font-size").replace(/\D+/, ""));

  const [getElements, { mutate }] = createResource(
    list.arr,
    async function (ids): Promise<{
      nodes: Map<string, NodeDefinition>;
      edges: Map<string, EdgeDefinition>;
    }> {
      const nodes = new Map<string, NodeDefinition>();
      const edges = new Map<string, EdgeDefinition>();

      const seriesReqs = ids.map((id) => api.tvSeriesDetails(id));
      for await (const seriesRes of seriesReqs) {
        const seriesId: string = `${seriesRes.id}:series`;
        const seriesNode: NodeDefinition = { data: { id: seriesId } };
        nodes.set(seriesId, seriesNode);

        const personReqs = getPeopleIds(seriesRes).map((id) =>
          api.personDetails(id),
        );
        for await (const personRes of personReqs) {
          const personId: string = `${personRes.id}:person`;
          const personNode: NodeDefinition = { data: { id: personId } };
          nodes.set(personId, personNode);

          const seriesReqs = [
            ...personRes.tv_credits.cast,
            ...personRes.tv_credits.crew,
          ].map((credit) => api.tvSeriesDetails(credit.id));

          for await (const seriesRes of seriesReqs) {
            const seriesId: string = `${seriesRes.id}:series`;
            const seriesNode: NodeDefinition = { data: { id: seriesId } };
            nodes.set(seriesId, seriesNode);

            for (const credit of seriesRes.aggregate_credits.cast.flatMap(
              (credit) => credit.roles.map((role) => ({ ...credit, ...role })),
            )) {
              if (!isInterestingCast(credit)) continue;
              const personId: string = `${credit.id}:person`;
              const personNode: NodeDefinition = { data: { id: personId } };
              nodes.set(personId, personNode);

              const creditId: string = `${credit.credit_id}:cast`;
              const department: Department = "Actors";
              const job = credit.character;
              const creditNode: EdgeDefinition = {
                data: {
                  id: creditId,
                  source: personId,
                  target: seriesId,
                  department,
                  job,
                },
              };
              edges.set(creditId, creditNode);
            }
            for (const credit of seriesRes.aggregate_credits.crew.flatMap(
              (credit) => credit.jobs.map((job) => ({ ...credit, ...job })),
            )) {
              if (!isInterestingCrew(credit)) continue;
              const personId: string = `${credit.id}:person`;
              const personNode: NodeDefinition = { data: { id: personId } };
              nodes.set(personId, personNode);

              const creditId: string = `${credit.credit_id}:crew`;
              const creditNode: EdgeDefinition = {
                data: {
                  id: creditId,
                  source: personId,
                  target: seriesId,
                  department: credit.department,
                  job: credit.job,
                },
              };
              edges.set(creditId, creditNode);
            }
          }

          await waitUntil(animationDuration);
          mutate({ nodes, edges });
        }
      }

      for (let i = 0; i < 12; i++) {
        const degree = new Map<string, number>();
        for (const { data } of edges.values())
          for (const node of [data.source, data.target])
            degree.set(node, (degree.get(node) ?? 0) + 1);

        for (const [edge, { data }] of edges) {
          for (const node of [data.source, data.target])
            if ((degree.get(node) ?? 0) <= 1) {
              nodes.delete(node);
              edges.delete(edge);
            }
        }

        outer: for (const node of nodes.keys()) {
          for (const { data } of edges.values()) {
            if ([data.source, data.target].includes(node)) continue outer;
          }
          nodes.delete(node);
        }
      }

      await waitUntil(animationDuration * 2);
      return { nodes, edges };
    },
    { initialValue: { nodes: new Map(), edges: new Map() } },
  );

  const getListSeriesIds = createMemo(
    (): Set<TVSeriesId> => new Set(list.arr()),
  );

  const getListPeopleIds = createMemo((): Set<PersonId> => {
    const { edges } = getElements();
    const seriesIds = getListSeriesIds();
    const peopleIds = new Set<number>();
    for (const { data } of edges.values()) {
      const { source, target } = data;
      const personId = Number(source.split(":")[0]);
      const seriesId = Number(target.split(":")[0]);
      if (seriesIds.has(seriesId)) peopleIds.add(personId);
    }
    return peopleIds;
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

  function getSize(node: Node): number {
    const degree = getElementDegrees().get(node.data("id") ?? "") ?? 1;
    const mod =
      node.data("type") === "person" ? fontSize * 0.6 : fontSize * 1.3;
    return Math.log(degree + 1) * mod * 1.5;
  }

  onMount(() => {
    // @ts-ignore
    cytoscape.use(fcose);
    cy = cytoscape({
      container,
      style,
    })
      .on("tap", "node", (event) => {
        setElement(event.target.data());
      })
      .on("tap", "edge", (event) => {
        console.debug(event.target.data());
      });

    onCleanup(() => cy?.destroy());
  });

  createEffect(() => {
    const { nodes, edges } = getElements();
    cy?.json({
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

  const layout: FcoseLayoutOptions = {
    name: "fcose",
    animate: true,
    animationDuration,
    randomize: true,
    nodeRepulsion: (node) =>
      1000 * (getElementDegrees().get(node.data().id) ?? 1) + 10000,
    idealEdgeLength: (node) =>
      (getElementDegrees().get(node.data().id) ?? 1) * 120,
    edgeElasticity: 0.2,
  };

  const style: StylesheetJsonBlock[] = [
    {
      selector: "node, edge",
      style: {
        color: getDocumentStyle("color"),
        "font-family": getDocumentStyle("font-family"),
        "font-weight": getDocumentStyle("font-weight"),
        "font-size": `${fontSize}px`,
      },
    },
    {
      selector: "node",
      style: {
        label: (node: Node) =>
          String(getElementDegrees().get(node.data()?.id ?? "") ?? 0),
        "text-halign": "center",
        "text-valign": "center",
        width: getSize,
        height: getSize,
        "background-color": (node) => {
          const [, type] = node.id().split(":");
          switch (type) {
            case "person":
              return "red";
            case "series":
              return "blue";
            default:
              throw new TypeError();
          }
        },
        "border-color": "white",
        "border-style": "solid",
        "border-width": (node: Node) => {
          const [id, type] = node.id().split(":");
          switch (type) {
            case "person":
              return getListPeopleIds().has(Number(id)) ? "12px" : undefined;
            case "series":
              return getListSeriesIds().has(Number(id)) ? "12px" : undefined;
            default:
              throw new TypeError();
          }
        },
      },
    },
    {
      selector: "edge",
      style: {
        label: (node) => {
          const { id, job } = node.data();
          const [, type] = id.split(":");
          return type === "crew" ? job : undefined;
        },
        "text-rotation": "autorotate",
        "curve-style": "bezier",
        "line-color": (node) => {
          const [, type] = node.id().split(":");
          switch (type) {
            case "cast":
              return "gold";
            case "crew":
              return "silver";
            default:
              throw new TypeError();
          }
        },
      },
    },
  ];

  return (
    <article>
      <header>
        <h1>Suggest</h1>
        <h2>{getElements().nodes.size} nodes found.</h2>
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
    props: ExtendProps<
      "article",
      { data: Signal<undefined | NodeDataDefinition> }
    >,
  ) {
    type Details = {
      id: number;
      type: string;
      name: string;
      overview: string;
      img:
        | ComponentProps<typeof Img<"poster">>
        | ComponentProps<typeof Img<"profile">>;
      extra: { key: string; value: number | string | string[] }[];
    };

    const [local, parent] = splitProps(props, ["data"]);
    const [get, set] = local.data;
    const api = useApi();
    const onClose = () => set(undefined);
    const [getDetails] = createResource(get, async (el): Promise<Details> => {
      const [id = "", type = ""] = el.id?.split(":") ?? [];
      switch (type) {
        case "series": {
          const res = await api.tvSeriesDetails(Number(id));
          const img: ComponentProps<typeof Img<"poster">> = {
            type: "poster",
            size: "w185",
            path: res.poster_path,
          };
          return {
            id: res.id,
            type,
            name: res.name,
            overview: res.overview,
            img,
            extra: [
              { key: "release", value: res.first_air_date },
              { key: "episodes", value: res.number_of_episodes },
              { key: "seasons", value: res.seasons.length },
              { key: "genres", value: res.genres.map((genre) => genre.name) },
            ],
          };
        }
        case "person": {
          const res = await api.personDetails(Number(id));
          const img: ComponentProps<typeof Img<"profile">> = {
            type: "profile",
            size: "w185",
            path: res.profile_path,
          };
          return {
            id: res.id,
            type,
            name: res.name,
            overview: res.biography,
            img,
            extra: [
              { key: "birthday", value: res.birthday },
              {
                key: "gender",
                value: ["female", "male"][res.gender - 1] ?? "?",
              },
              { key: "known for", value: res.known_for_department },
            ],
          };
        }
      }
      throw new TypeError();
    });
    const getDegree = () => {
      const id = get()?.id ?? "";
      return getElementDegrees().get(id) ?? 0;
    };

    return (
      <Modal onClose={onClose}>
        <article {...parent}>
          <Suspense fallback={<progress />}>
            <header class="flex justify-between">
              <div class="flex gap-4">
                <h1>
                  ({getDegree()}) {getDetails()?.name}
                </h1>
              </div>
              <HTMLIcon type="close" onClick={onClose} class="h-8 w-8" />
            </header>
            <section class="flex justify-between">
              <div>
                <small>
                  {getDetails()?.type} {getDetails()?.id}
                </small>
                <dl>
                  <For each={getDetails()?.extra}>
                    {({ key, value }) => (
                      <>
                        <dt>{key}</dt>
                        <Show
                          when={isArray(value) ? value : undefined}
                          fallback={<dd>{value}</dd>}
                        >
                          {(get) => (
                            <For each={get()}>{(get) => <dd>{get}</dd>}</For>
                          )}
                        </Show>
                      </>
                    )}
                  </For>
                </dl>
              </div>
              <Show when={getDetails()?.img}>
                {(get) => <Img {...get()} />}
              </Show>
            </section>
            <p>{getDetails()?.overview || "No overview available."}</p>
          </Suspense>
        </article>
      </Modal>
    );
  }

  function getPeopleIds(series: TvSeriesDetailsResponse): number[] {
    return [
      ...series.aggregate_credits.cast
        .flatMap((credit) =>
          credit.roles.map((role) => ({ ...credit, ...role })),
        )
        .filter(isInterestingCast),
      ...series.aggregate_credits.crew
        .flatMap((credit) => credit.jobs.map((job) => ({ ...credit, ...job })))
        .filter(isInterestingCrew),
    ].map((credit) => credit.id);
  }
}
