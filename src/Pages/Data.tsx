import type { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import * as d3 from "d3";
import { type JSX, type Ref, Show, createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import ImageSource from "../ImgSrc";
import { tvCast, tvCrew, tvList, tvSeries } from "../state";
import { Type, type int, isImportantCast, isImportantCrew } from "../types";

type Color = Exclude<JSX.CSSProperties["color"], undefined>;

type Node = SimulationNodeDatum & {
  uuid: string;
  id: number;
  type: Type;
  list: boolean;
};
type Link = SimulationLinkDatum<Node> & {
  source: string & Node;
  target: string & Node;
};

type GraphData = {
  nodes: Node[];
  links: Link[];
};

function isNode(value: any): value is Node {
  return (
    value &&
    typeof value === "object" &&
    ["id", "type", "list"].every((property) => property in value)
  );
}

function getGraphData(): GraphData {
  const nodes: GraphData["nodes"] = [];
  const links: GraphData["links"] = [];

  const listSeriesIds = tvList.get();
  const seriesInList = tvSeries
    .get()
    .filter((series) => listSeriesIds.includes(series.id));

  for (const series of seriesInList) {
    const seriesNode: Node = {
      id: series.id,
      type: Type.Show,
      uuid: `${Type.Show}:${series.id}`,
      list: true,
    };
    nodes.push(seriesNode);

    const importantCast = tvCast.getBySeries(series).filter(isImportantCast);
    for (const person of importantCast) {
      const node: Node = {
        id: person.id,
        type: Type.Cast,
        uuid: `${Type.Cast}:${person.id}`,
        list: true,
      };
      links.push({ source: seriesNode.uuid, target: node.uuid } as any);
      if (nodes.some((n) => n.uuid === node.uuid)) continue;
      nodes.push(node);
    }

    const importantCrew = tvCrew.getBySeries(series).filter(isImportantCrew);
    for (const person of importantCrew) {
      const node: Node = {
        id: person.id,
        type: Type.Crew,
        uuid: `${Type.Crew}:${person.id}`,
        list: true,
      };
      links.push({ source: seriesNode.uuid, target: node.uuid } as any);
      if (nodes.some((n) => n.uuid === node.uuid)) continue;
      nodes.push(node);
    }
  }

  return { nodes, links };
}

export default function Data() {
  let svgRef: undefined | SVGSVGElement;
  let tooltipRef: undefined | HTMLElement;

  const [getNode, setNode] = createSignal<undefined | Node>();

  const [config, _setConfig] = createStore({
    linkDistance: 30, // How far apart linked nodes should be
    chargeStrength: -30, // Strength of the charge (repulsion if negative)
    nodeRadius: 5, // Radius of the node circles
    linkStrokeWidth: 1, // Thickness of the link lines
    minZoomScale: 0.1,
    maxZoomScale: 10.0,
    tooltipCursorOffet: 10,
    maxRadius: 15,
    minRadius: 5,
  });

  createEffect(() => {
    if (!svgRef) return;

    const width = svgRef.clientWidth;
    const height = svgRef.clientHeight;
    const graphData = getGraphData();

    // Implement highlighting
    function isConnected(a: Node, b: Node): boolean {
      return (
        a.uuid === b.uuid ||
        graphData.links.some(
          (l) =>
            (l.source.uuid === a.uuid && l.target.uuid === b.uuid) ||
            (l.source.uuid === b.uuid && l.target.uuid === a.uuid),
        )
      );
    }

    function getNodeColor(node: Node, other?: Node | number): Color {
      if (isNode(other)) if (isConnected(node, other)) return "orange";
      switch (node.type) {
        case Type.Show:
          return "red";
        case Type.Cast:
          return "green";
        case Type.Crew:
          return "blue";
      }
    }

    function getLinkColor(link: Link, other?: Node | number): Color {
      if (isNode(other)) {
        if (link.source.uuid === other.uuid || link.target.uuid === other.uuid)
          return "orange";
      }
      return "gray";
    }

    // Scale Node Size
    const degrees = new Map<Node["uuid"], Node["uuid"][]>();
    for (const n of graphData.nodes) {
      degrees.set(
        n.uuid,
        graphData.links
          .filter((l) => l.source === n.uuid || l.target === n.uuid)
          .map((l) => l.target),
      );
    }
    const nodesWithDegreeOne = Array.from(degrees.entries())
      .filter(([, v]) => v.length === 1)
      .map(([k]) => k);
    for (const key of degrees.keys()) {
      degrees.set(
        key,
        degrees
          .get(key)
          ?.filter((uuid) => !nodesWithDegreeOne.includes(uuid)) ?? [],
      );
    }

    const values = Array.from(degrees.values()).map((v) => v.length);
    const minDegree = d3.min(values) ?? 0;
    const maxDegree = d3.max(values) ?? 0;
    const sizeScale = d3
      .scaleLinear()
      .domain([minDegree, maxDegree])
      .range([config.minRadius, config.maxRadius]);

    // Initialize the Container
    const graphContainer = d3.select(svgRef);

    // Initialize Zooming+Panning Container & Behavior
    const zoomContainer = graphContainer.append("g");
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([config.minZoomScale, config.maxZoomScale])
      .on("zoom", (event) => zoomContainer.attr("transform", event.transform));
    graphContainer.call(zoomBehavior);

    // Render nodes & links
    const link = zoomContainer
      .selectAll<SVGLineElement, Link>("line")
      .data(graphData.links)
      .enter()
      .append("line")
      .attr("stroke", getLinkColor)
      .attr("stroke-width", config.linkStrokeWidth);

    const node = zoomContainer
      .selectAll<SVGCircleElement, Node>("circle")
      .data(graphData.nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => sizeScale(degrees.get(d.uuid)?.length ?? 0))
      .attr("fill", getNodeColor);

    // Run simulation
    const simulation = d3
      .forceSimulation<Node>(graphData.nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(graphData.links)
          .id((d) => d.uuid)
          .distance(config.linkDistance),
      )
      .force("charge", d3.forceManyBody().strength(config.chargeStrength))
      .force("center", d3.forceCenter(width / 2, height / 2));

    simulation.on("tick", () => {
      link
        .attr("x1", (l) => l.source.x ?? 0)
        .attr("y1", (l) => l.source.y ?? 0)
        .attr("x2", (l) => l.target.x ?? 0)
        .attr("y2", (l) => l.target.y ?? 0);
      node.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);
    });

    // Implement tooltip
    node
      .on("mouseover", (_event, d) => setNode(d))
      .on("mouseout", (_event, _d) => setNode(undefined))
      .on("mousemove", (event, _d) => {
        if (!tooltipRef) return;
        d3.select(tooltipRef)
          .style("position", "absolute")
          .style("left", `${event.pageX + config.tooltipCursorOffet}px`)
          .style("top", `${event.pageY + config.tooltipCursorOffet}px`);
      });

    node.on("mouseover.highlight", (_event, d) => {
      link.attr("stroke", (l) => getLinkColor(l, d));
      node.attr("fill", (n) => getNodeColor(n, d));
    });
    node.on("mouseout.highlight", (_event, _d) => {
      link.attr("stroke", getLinkColor);
      node.attr("fill", getNodeColor);
    });
  });

  return (
    <article style={{ "aspect-ratio": "1/1" }}>
      <svg ref={svgRef} width="100%" height="100%" />
      <Show when={getNode()}>
        {(getNode) => {
          const node = getNode();
          const [, id] = node.uuid.split(":");
          return <Tooltip ref={tooltipRef} type={node.type} id={Number(id)} />;
        }}
      </Show>
    </article>
  );
}

function Tooltip(props: { ref: Ref<any>; type: Type; id: int }) {
  const getItem = ():
    | undefined
    | { name: string; label?: string; img: ImageSource } => {
    switch (props.type) {
      case Type.Show: {
        const item = tvSeries.getById(props.id);
        if (item)
          return {
            name: item.name,
            img: new ImageSource("poster", item.poster_path, "w154"),
          };
        break;
      }
      case Type.Cast: {
        const item = tvCast.getById(props.id);
        if (item)
          return {
            name: item.name,
            label: item.character,
            img: new ImageSource("profile", item.profile_path, "w185"),
          };
        break;
      }
      case Type.Crew: {
        const item = tvCrew.getById(props.id);
        if (item)
          return {
            name: item.name,
            label: item.job,
            img: new ImageSource("profile", item.profile_path, "w185"),
          };
        break;
      }
    }
    return undefined;
  };

  const item = getItem();

  if (!item) return null;

  return (
    <aside ref={props.ref}>
      <header>
        <strong>{item.name}</strong>
        <br />
        <small>
          {props.type}:{props.id}
        </small>
        <br />
        <Show when={item.label}>
          {(getLabel) => <small>{getLabel()}</small>}
        </Show>
      </header>
      <img src={item.img.toString()} alt={item.img.type} />
    </aside>
  );
}
