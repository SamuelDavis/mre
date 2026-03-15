import {
  createEffect,
  createResource,
  For,
  onCleanup,
  onMount,
  Show,
  splitProps,
  type Accessor,
} from "solid-js";
import { useApi, useList } from "../../AppState";
import { rateLimit, useDocumentStyles } from "../../util";
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
  ElementDefinition,
  NodeDefinition,
  StylesheetJsonBlock,
} from "cytoscape";
import type { FcoseLayoutOptions } from "cytoscape-fcose";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import type { ExtendProps } from "@samueldavis/solidlib";

// @ts-ignore
cytoscape.use(fcose);

export default function Suggest() {
  const api = useApi();
  const list = useList();

  const [getCredits, { mutate }] = createResource(
    list.arr,
    async (ids: TVSeriesId[]) => {
      let result = new Map<CreditNode["credit"]["id"], CreditNode>();
      const requests = ids.map((id) => () => api.tvSeriesDetails(id));
      for await (const response of rateLimit(requests)) {
        result = mutate((prev) =>
          tvSeriesToCredits(response).reduce(
            (acc, item) => acc.set(item.credit.id, item),
            new Map(prev),
          ),
        );
      }
      return result;
    },
    { initialValue: new Map() },
  );

  const getElements = () => {
    const elements = new Map<string, ElementDefinition>();

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
      elements.set(personId, personNode);

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
      elements.set(seriesId, seriesNode);

      const creditId: CreditData["id"] = `${personId}-${seriesId}`;
      const creditNode: NodeDefinition & { data: CreditData } = {
        data: {
          _type: "credit",
          _id: credit.credit.id,
          label: credit.credit.name,
          id: creditId,
          source: personId,
          target: seriesId,
        },
      };
      elements.set(creditId, creditNode);
    }

    return [...elements.values()];
  };

  return (
    <article>
      <header>
        <h1>Suggest {getElements().length}</h1>
      </header>
      <Show when={getCredits.loading}>
        <progress />
      </Show>
      <Graph getElements={getElements} />
      <ul>
        <For each={[...getElements().values()]}>
          {(credit) => (
            <li>
              <pre>{JSON.stringify(credit, null, 2)}</pre>
            </li>
          )}
        </For>
      </ul>
    </article>
  );
}

function Graph(
  props: ExtendProps<"div", { getElements: Accessor<ElementDefinition[]> }>,
) {
  const getDocumentStyle = useDocumentStyles();
  const [local, parent] = splitProps(props, ["getElements"]);

  function getSize(_: Node<PersonData | SeriesData>): number {
    return 30;
    // const degree = getDegree().get(node.data("id")) ?? 1;
    // const mod = node.data("type") === "person" ? 30 : 30;
    // return Math.log(degree + 1) * mod;
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
      console.debug(event);
    });
  }

  onMount(render);
  createEffect(render);
  onCleanup(() => cy?.destroy());

  let ref: undefined | HTMLDivElement;
  let cy: undefined | Core;

  const layout: FcoseLayoutOptions = {
    name: "fcose",
    animate: false,
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

/*
const [getCredits, { mutate }] = createResource(
  list.arr,
  async (ids) => {
    let result = new Map<Credit["credit_id"], Credit>();
    const listTvSeriesRequests = ids.map((id) => () => api.tvSeriesDetails(id));
    for await (const tvSeriesResponse of rateLimit(listTvSeriesRequests)) {
      const personCreditRequests = [
        ...tvSeriesResponse.aggregate_credits.cast.map((credit) => credit.id),
        ...tvSeriesResponse.aggregate_credits.crew.map((credit) => credit.id),
      ].map((id) => () => api.personTvCredits(id));

      for await (const creditResponse of rateLimit(personCreditRequests)) {
        const credits = [
          ...creditResponse.cast.filter(isInterestingCast).map(
            (credit): Credit => ({
              _type: "cast" as const,
              person_id: creditResponse.id,
              series_id: tvSeriesResponse.id,
              ...credit,
            }),
          ),
          ...creditResponse.crew.filter(isInterestingCrew).map(
            (credit): Credit => ({
              _type: "crew" as const,
              person_id: creditResponse.id,
              series_id: tvSeriesResponse.id,
              ...credit,
            }),
          ),
        ];

        result = mutate((prev) =>
          credits.reduce(
            (acc, item) => acc.set(item.credit_id, item),
            new Map(prev),
          ),
        );
      }
    }
    return result;
  },
  { initialValue: new Map() },
);
*/
