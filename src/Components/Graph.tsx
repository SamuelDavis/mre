import { HTMLIcon, type ExtendProps } from "@samueldavis/solidlib";
import cytoscape, {
  type Core,
  type ElementDefinition,
  type EventObject,
  type Layouts,
  type NodeSingular,
  type Position,
  type StylesheetJsonBlock,
} from "cytoscape";
import fcose, { type FcoseLayoutOptions } from "cytoscape-fcose";
import { createEffect, onCleanup, onMount, splitProps } from "solid-js";
import type { Graph, GraphNode, Selection } from "../Lib/model";

cytoscape.use(fcose);

export default function GraphView(
  props: ExtendProps<
    "div",
    { data: Graph; onSelect: (selection: Selection) => void }
  >,
) {
  const [local, parent] = splitProps(props, ["data", "onSelect"]);
  let container!: HTMLDivElement;
  let cy: undefined | Core;
  let layout: undefined | Layouts;

  onMount(() => {
    cy = cytoscape({
      container,
      style: createStyle(getComputedStyle(container)),
      minZoom: 0.05,
      maxZoom: 5,
    });
    cy.on("tap", "node", onTapNode);
    cy.on("tap", onTapBackground);
    onCleanup(onDestroy);
  });

  createEffect(() => update(local.data));

  function update(data: Graph): void {
    if (!cy) return;
    const core = cy;
    const ids = new Set([...data.nodes, ...data.edges].map((el) => el.id));
    const stale = core.elements().filter((el) => !ids.has(el.id()));
    const additions: ElementDefinition[] = [];

    core.batch(() => {
      stale.remove();
      for (const node of data.nodes) {
        const existing = core.getElementById(node.id);
        if (existing.nonempty()) existing.data(node);
        else
          additions.push({
            group: "nodes",
            data: node,
            position: getSeedPosition(core, data, node),
          });
      }
      for (const edge of data.edges) {
        const existing = core.getElementById(edge.id);
        if (existing.nonempty()) existing.data(edge);
        else additions.push({ group: "edges", data: edge });
      }
      core.add(additions);
    });

    if (additions.length || stale.nonempty())
      runLayout(core.nodes().length === additions.length);
  }

  function runLayout(randomize: boolean): void {
    layout?.stop();
    const options: FcoseLayoutOptions = { ...layoutOptions, randomize };
    layout = cy?.layout(options).run();
  }

  function onTapNode(event: EventObject): void {
    const node: NodeSingular = event.target;
    cy?.elements().addClass("faded");
    node.closedNeighborhood().removeClass("faded");
    local.onSelect(node.data("selection"));
  }

  function onTapBackground(event: EventObject): void {
    if (event.target === cy) cy?.elements().removeClass("faded");
  }

  function onRecenter(): void {
    cy?.animate({ fit: { eles: cy.elements(), padding: 20 } });
  }

  function onDestroy(): void {
    layout?.stop();
    cy?.destroy();
  }

  return (
    <div
      ref={container}
      class="relative aspect-square touch-none bg-(--pico-card-background-color) sm:aspect-video"
      {...parent}
    >
      <HTMLIcon
        type="recenter"
        onClick={onRecenter}
        class="absolute right-0 bottom-0 z-1 rounded-full"
      />
    </div>
  );
}

const layoutOptions: FcoseLayoutOptions = {
  name: "fcose",
  quality: "proof",
  animate: true,
  animationDuration: 400,
  nodeDimensionsIncludeLabels: false,
  idealEdgeLength: 80,
  nodeRepulsion: getRepulsion,
  numIter: 2500,
};

function getDiameter(node: NodeSingular): number {
  return 16 + 14 * Math.sqrt(node.data("size"));
}

function getFontSize(node: NodeSingular): number {
  return Math.max(6, getDiameter(node) / 4);
}

function getRepulsion(node: NodeSingular): number {
  return 4000 + 1500 * getDiameter(node);
}

function getSeedPosition(core: Core, data: Graph, node: GraphNode): Position {
  for (const edge of data.edges) {
    const neighbor =
      edge.source === node.id
        ? edge.target
        : edge.target === node.id
          ? edge.source
          : undefined;
    const existing = neighbor ? core.getElementById(neighbor) : undefined;
    if (existing?.nonempty()) {
      const { x, y } = existing.position();
      return { x: x + Math.random() * 40 - 20, y: y + Math.random() * 40 - 20 };
    }
  }
  return { x: Math.random() * 400, y: Math.random() * 400 };
}

function readProperty(css: CSSStyleDeclaration, name: string): string {
  return css.getPropertyValue(name).trim();
}

function createStyle(css: CSSStyleDeclaration): StylesheetJsonBlock[] {
  const read = readProperty.bind(null, css);
  return [
    {
      selector: "node",
      style: {
        label: "data(label)",
        width: getDiameter,
        height: getDiameter,
        "font-size": getFontSize,
        "font-family": read("--pico-font-family"),
        color: read("--pico-color"),
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": "120px",
        "text-outline-color": read("--pico-background-color"),
        "text-outline-width": 2,
        "min-zoomed-font-size": 10,
        "background-color": read("--graph-media"),
        "border-color": read("--pico-background-color"),
        "border-width": 1,
      },
    },
    {
      selector: 'node[kind = "candidate"]',
      style: { "background-opacity": 0.35 },
    },
    {
      selector: 'node[kind = "person"]',
      style: { "background-color": read("--graph-person") },
    },
    {
      selector: "edge",
      style: {
        label: "data(label)",
        "font-size": 5,
        "font-family": read("--pico-font-family"),
        color: read("--pico-color"),
        "text-rotation": "autorotate",
        "text-outline-color": read("--pico-background-color"),
        "text-outline-width": 1,
        "min-zoomed-font-size": 10,
        "curve-style": "bezier",
        width: 1.5,
        "line-color": read("--graph-crew"),
      },
    },
    {
      selector: 'edge[kind = "cast"]',
      style: { "line-color": read("--graph-cast") },
    },
    {
      selector: ".faded",
      style: { opacity: 0.15 },
    },
  ];
}
