import {
  createEffect,
  createMemo,
  createResource,
  onCleanup,
  onMount,
  Show,
  splitProps,
  type Accessor,
} from "solid-js";
import { useApi, useList, useDocumentStyles } from "../../AppState";
import {
  type PersonData,
  type SeriesData,
  type TVSeriesId,
  type Node,
  tvSeriesToCredits,
  type CreditNode,
  type CreditData,
} from "../../Types";
import type {
  Core,
  EdgeDefinition,
  ElementDefinition,
  NodeDefinition,
  StylesheetJsonBlock,
} from "cytoscape";
import type { FcoseLayoutOptions } from "cytoscape-fcose";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import { type ExtendProps } from "@samueldavis/solidlib";

// @ts-ignore
cytoscape.use(fcose);

export default function Suggest() {
  const api = useApi();
  const list = useList();

  const [getCredits, { mutate }] = createResource(
    list.arr,
    async (ids: TVSeriesId[]) => {
      let result = new Map<CreditNode["credit"]["id"], CreditNode>();
      const requests = ids.map((id) => api.tvSeriesDetails(id));
      for await (const response of requests) {
        const interestingPeople = tvSeriesToCredits(response).map(
          (credit) => credit.person.id,
        );
        const requests = interestingPeople.map((id) => api.personTvCredits(id));
        for await (const response of requests) {
          const requests = [
            ...response.cast.map((credit) => credit.id),
            ...response.crew.map((credit) => credit.id),
          ].map((id) => api.tvSeriesDetails(id));

          for await (const response of requests) {
            for (const item of tvSeriesToCredits(response))
              if (interestingPeople.includes(item.person.id))
                result.set(item.credit.id, item);
            mutate(new Map(result));
          }
        }
      }

      return new Map(result);
    },
    { initialValue: new Map() },
  );

  const getNodes = () => {
    const personNodes = new Map<
      PersonData["id"],
      NodeDefinition & { data: PersonData }
    >();
    const seriesNodes = new Map<
      SeriesData["id"],
      NodeDefinition & { data: SeriesData }
    >();
    const creditNodes = new Map<
      CreditData["id"],
      EdgeDefinition & { data: CreditData }
    >();

    for (const credit of getCredits().values()) {
      const personId: PersonData["id"] = `${credit.person.id}:person`;
      const personNode: NodeDefinition & { data: PersonData } = {
        data: {
          _type: "person",
          _id: credit.person.id,
          label: credit.person.name,
          img: credit.person.img,
          id: personId,
        },
      };
      personNodes.set(personId, personNode);

      const seriesId: SeriesData["id"] = `${credit.series.id}:series`;
      const seriesNode: NodeDefinition & { data: SeriesData } = {
        data: {
          _type: "series",
          _id: credit.series.id,
          label: credit.series.name,
          img: credit.series.img,
          id: seriesId,
        },
      };
      seriesNodes.set(seriesId, seriesNode);

      const creditId: CreditData["id"] = `${personId}-${seriesId}`;
      const creditNode: EdgeDefinition & {
        data: CreditData;
      } = {
        data: {
          _type: "credit",
          _id: credit.credit.id,
          label: credit.credit.name,
          id: creditId,
          source: personId,
          target: seriesId,
        },
      };
      creditNodes.set(creditId, creditNode);
    }

    return [personNodes, seriesNodes, creditNodes] as const;
  };

  const getElements = () => {
    const [personNodes, seriesNodes, creditNodes] = getNodes();

    const count = (id: PersonData["id"] | SeriesData["id"]): number => {
      let n = 0;
      for (const credit of creditNodes.values())
        if (credit.data.source === id || credit.data.target === id) n++;
      return n;
    };

    for (let i = 0; i < 2; i++) {
      for (const credit of creditNodes.values()) {
        const { id: creditId, source: personId } = credit.data;
        if (count(personId) <= 1) {
          personNodes.delete(personId);
          creditNodes.delete(creditId);
        }
      }

      for (const credit of creditNodes.values()) {
        const { id: creditId, target: seriesId } = credit.data;
        if (count(seriesId) <= 1) {
          seriesNodes.delete(seriesId);
          creditNodes.delete(creditId);
        }
      }
    }

    for (const person of personNodes.values())
      if (count(person.data.id) === 0) personNodes.delete(person.data.id);
    for (const series of seriesNodes.values())
      if (count(series.data.id) === 0) seriesNodes.delete(series.data.id);

    return [
      ...personNodes.values(),
      ...seriesNodes.values(),
      ...creditNodes.values(),
    ];
  };

  const getNodeCount = () =>
    getNodes().reduce((acc, nodes) => acc + nodes.size, 0);
  const getIntersectionCount = () =>
    getElements().filter((el) => el.data._type !== "credit").length;

  return (
    <article>
      <header>
        <h1>Suggest</h1>
        <small>
          Found {getNodeCount()} nodes with
          <span> {getIntersectionCount() || "no"} </span>intersections.
        </small>
      </header>
      <Show when={getCredits.loading}>
        <progress />
      </Show>
      <Graph getElements={getElements} />
    </article>
  );
}

function Graph(
  props: ExtendProps<"div", { getElements: Accessor<ElementDefinition[]> }>,
) {
  const getDocumentStyle = useDocumentStyles();
  const [local, parent] = splitProps(props, ["getElements"]);
  const getDegree = createMemo(() => {
    const degrees = new Map<PersonData["id"] | SeriesData["id"], number>();
    for (const element of local.getElements())
      if (element.data._type === "credit") {
        const { source: personId, target: seriesId } = element.data;
        degrees.set(personId, (degrees.get(personId) ?? 0) + 1);
        degrees.set(seriesId, (degrees.get(seriesId) ?? 0) + 1);
      }
    return degrees;
  });

  function getSize(node: Node<PersonData | SeriesData>): number {
    const degree = getDegree().get(node.data("id")) ?? 1;
    const mod = node.data("type") === "person" ? 30 : 30;
    return Math.log(degree + 1) * mod;
  }

  function render() {
    cy?.destroy();
    cy = cytoscape({
      container: ref,
      elements: local.getElements(),
      style,
      layout,
    });

    cy.on("tap", "node, edge", (event) => {
      console.debug(event.target.data());
    });
  }

  onMount(render);
  createEffect(render);
  onCleanup(() => cy?.destroy());

  let ref: undefined | HTMLDivElement;
  let cy: undefined | Core;

  const layout: FcoseLayoutOptions = {
    name: "fcose",
  };

  const style: StylesheetJsonBlock[] = [
    {
      selector: "node, edge",
      style: {
        color: getDocumentStyle("--pico-contrast"),
        "font-family": getDocumentStyle("--pico-font-family"),
        "font-weight": getDocumentStyle("--pico-font-weight"),
      },
    },
    {
      selector: "node",
      style: {
        label: (node: Node<PersonData | SeriesData>) => node.data("label"),
        "background-color": (node: Node<PersonData | SeriesData>) => {
          switch (node.data("_type")) {
            case "person":
              return "red";
            case "series":
              return "blue";
            default:
              throw new TypeError();
          }
        },
        width: getSize,
        height: getSize,
        // @ts-ignore
        "text-max-width": 10,
        "text-wrap": "wrap",
        "text-halign": "center",
        "text-valign": (node: Node<PersonData | SeriesData>) =>
          node.data("type") === "series" ? "center" : "top",
      },
    },
    {
      selector: "edge",
      style: {
        label: (node: Node<CreditData>) => node.data("label"),
        "line-color": (node: Node<CreditData>) => {
          switch (node.data("department")) {
            case "Actors":
              return "gold";
            default:
              return "silver";
          }
        },
        "text-rotation": "autorotate",
        "curve-style": "bezier",
      },
    },
  ];

  return (
    <div
      class="aspect-video touch-none bg-(--pico-background-color)"
      ref={ref}
      {...parent}
    />
  );
}
