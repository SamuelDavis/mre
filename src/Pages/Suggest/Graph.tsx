import { type ExtendProps } from "@samueldavis/solidlib";
import { useApi, useList } from "../../AppState";
import {
  isInterestingCast,
  isInterestingCrew,
  type CreditData,
  type PersonData,
  type SeriesData,
  type Node,
} from "../../Types";
import {
  createEffect,
  createMemo,
  createResource,
  onCleanup,
  onMount,
  splitProps,
} from "solid-js";
import { rateLimit, useDocumentStyles } from "../../util";
import { type FcoseLayoutOptions } from "cytoscape-fcose";
import type { Core, ElementDefinition, StylesheetJsonBlock } from "cytoscape";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";

// @ts-ignore
cytoscape.use(fcose);

export default function Graph(
  props: ExtendProps<
    "div",
    {
      onSelectNode: (node: { originalEvent: MouseEvent; target: Node }) => void;
    }
  >,
) {
  const request = useApi();
  const list = useList();
  const [local, parent] = splitProps(props, ["onSelectNode"]);
  const getDocumentStyle = useDocumentStyles();

  const [getElements] = createResource(
    list.arr,
    async (): Promise<ElementDefinition[]> => {
      const personNodes = new Map<PersonData["id"], PersonData>();
      const seriesNodes = new Map<SeriesData["id"], SeriesData>();
      const edges = new Map<CreditData["id"], CreditData>();

      const requests = rateLimit(
        list.arr().map((id) => () => request.tvSeriesDetails(id)),
      );

      for await (const result of requests) {
        for (const series of result) {
          const seriesId: SeriesData["id"] = `series:${series.id}`;
          seriesNodes.set(seriesId, {
            type: "series",
            id: seriesId,
            label: series.name,
            img: series.poster_path,
          });

          for (const person of series.aggregate_credits.cast) {
            const personId: PersonData["id"] = `person:${person.id}`;
            for (const role of person.roles) {
              if (!isInterestingCast({ ...person, ...role })) continue;
              const creditId: CreditData["id"] = `credit:${role.credit_id}`;
              personNodes.set(personId, {
                type: "person",
                id: personId,
                label: person.name,
                img: person.profile_path,
              });
              edges.set(creditId, {
                type: "credit",
                id: creditId,
                label: role.character,
                department: "Actors",
                job: "Actor",
                img: person.profile_path,
                source: personId,
                target: seriesId,
              });
            }
          }
          for (const person of series.aggregate_credits.crew) {
            const personId: PersonData["id"] = `person:${person.id}`;
            for (const job of person.jobs) {
              if (!isInterestingCrew({ ...person, ...job })) continue;
              const creditId: CreditData["id"] = `credit:${job.credit_id}`;
              personNodes.set(personId, {
                type: "person",
                id: personId,
                label: person.name,
                img: person.profile_path,
              });
              edges.set(creditId, {
                type: "credit",
                id: creditId,
                label: job.job,
                department: person.department,
                job: job.job,
                img: person.profile_path,
                source: personId,
                target: seriesId,
              });
            }
          }
        }
      }

      return [
        ...personNodes.values(),
        ...seriesNodes.values(),
        ...edges.values(),
      ].map((data): ElementDefinition => ({ data }));
    },
    { initialValue: [] },
  );

  const getDegree = createMemo(() =>
    getElements().reduce((map, element) => {
      const { id, source, target } = element.data;
      if (!id || !source || !target || !id.startsWith("credit")) return map;
      map.set(source, (map.get(source) ?? 0) + 1);
      map.set(target, (map.get(target) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  );

  let ref: undefined | HTMLDivElement;
  let cy: undefined | Core;

  onMount(render);
  createEffect(render);
  onCleanup(() => cy?.destroy());

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
          switch (node.data("type")) {
            case "person":
              return "red";
            case "series":
              return "blue";
            default:
              throw new TypeError();
          }
        },
        width: (node: Node<PersonData | SeriesData>) =>
          (getDegree().get(node.data("id")) ?? 1) * 10,
        height: (node: Node<PersonData | SeriesData>) =>
          (getDegree().get(node.data("id")) ?? 1) * 10,
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

  function render() {
    cy?.destroy();
    cy = cytoscape({
      container: ref,
      elements: getElements(),
      style,
      layout,
    });

    cy.on("tap", "node, edge", (event) => {
      local.onSelectNode(event);
    });
  }

  return (
    <div
      class="aspect-video touch-none bg-(--pico-background-color)"
      ref={ref}
      {...parent}
    />
  );
}
