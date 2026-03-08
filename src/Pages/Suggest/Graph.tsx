import { type ExtendProps } from "@samueldavis/solidlib";
import { useAppState } from "../../AppState";
import {
  isInterestingCast,
  isInterestingCrew,
  type CreditId,
  type Department,
  type Job,
  type PersonId,
  type TVSeriesId,
} from "../../Types";
import { createEffect, createMemo, onCleanup, onMount } from "solid-js";
import { useDocumentStyles } from "../../util";
import { type FcoseLayoutOptions } from "cytoscape-fcose";
import type {
  Core,
  EdgeDataDefinition,
  ElementDefinition,
  NodeDataDefinition,
  StylesheetJsonBlock,
} from "cytoscape";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";

cytoscape.use(fcose);

type PersonData = NodeDataDefinition & {
  type: "person";
  id: `person:${PersonId}`;
  label: string;
};
type SeriesData = NodeDataDefinition & {
  type: "series";
  id: `series:${TVSeriesId}`;
  label: string;
};
type CreditData = EdgeDataDefinition & {
  type: "credit";
  id: `credit:${CreditId}`;
  label: string;
  job: Job;
  department: Department;
};
type Node<T extends PersonData | SeriesData | CreditData> = {
  data(): T;
  data<K extends keyof T>(key: K): T[K];
};

export default function Graph(props: ExtendProps<"div", {}>) {
  const [appState] = useAppState();
  const getDocumentStyle = useDocumentStyles();

  const getElements = (): ElementDefinition[] => {
    const personNodes = new Map<PersonData["id"], PersonData>();
    const seriesNodes = new Map<SeriesData["id"], SeriesData>();
    const edges = new Map<CreditData["id"], CreditData>();

    for (const series of appState.list) {
      const seriesId: SeriesData["id"] = `series:${series.id}`;
      seriesNodes.set(seriesId, {
        type: "series",
        id: seriesId,
        label: series.name,
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
          });
          edges.set(creditId, {
            type: "credit",
            id: creditId,
            label: role.character,
            department: "Actors",
            job: "Actor",
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
          });
          edges.set(creditId, {
            type: "credit",
            id: creditId,
            label: job.job,
            department: person.department,
            job: job.job,
            source: personId,
            target: seriesId,
          });
        }
      }
    }

    return [
      ...personNodes.values(),
      ...seriesNodes.values(),
      ...edges.values(),
    ].map((data): ElementDefinition => ({ data }));
  };

  const getDegree = createMemo(() =>
    getElements().reduce((map, element) => {
      const { id, source, target } = element.data;
      if (!id || !source || !target || !id.startsWith("credit")) return map;
      map.set(source, (map.get(source) ?? 0) + 1);
      map.set(target, (map.get(target) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  );

  createEffect(() => console.debug(getDegree()));

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

    cy.on("tap", "node", (event: { target: Node<SeriesData | PersonData> }) => {
      const data = event.target.data();
      switch (data.type) {
        case "series": {
          console.debug({ series: data });
          break;
        }
        case "person": {
          console.debug({ series: data });
          break;
        }
        default:
          throw new TypeError();
      }
    });
  }

  return (
    <div
      class="aspect-video touch-none bg-(--pico-background-color)"
      ref={ref}
      {...props}
    />
  );
}
