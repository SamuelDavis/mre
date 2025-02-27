import * as d3 from "d3";
import {
  For,
  createEffect,
  onCleanup,
  onMount,
  JSX,
  createSignal,
} from "solid-js";
import state from "../state";
import type { Cast, Crew, Show, ShowCastMap, ShowCrewMap } from "../types";

enum Type {
  Show = "show",
  Cast = "cast",
  Crew = "crew",
}

const typeColorMap: Record<Type, JSX.CSSProperties["color"]> = {
  [Type.Show]: "red",
  [Type.Cast]: "green",
  [Type.Crew]: "blue",
};

type Node = { id: string; type: Type };
type Link = { source: string; target: string };
type GraphData = {
  nodes: { id: string; type: Type }[];
  links: { source: string; target: string }[];
};

export default function Data() {
  let svgRef: undefined | SVGSVGElement;
  let tooltipRef: undefined | HTMLDivElement;

  const getGraphData = (): GraphData => {
    const nodes: Node[] = [];
    const links: Link[] = [];

    const castShowMap: Record<number, number[]> = {};
    const crewShowMap: Record<number, number[]> = {};

    for (const show of state.getShowsInList()) {
      for (const cast of state.getCastByShow(show)) {
        castShowMap[cast.id] = castShowMap[cast.id] ?? [];
        castShowMap[cast.id].push(show.id);
      }
      for (const crew of state.getCrewByShow(show)) {
        crewShowMap[crew.id] = crewShowMap[crew.id] ?? [];
        crewShowMap[crew.id].push(show.id);
      }
    }

    for (const castId in castShowMap) {
      if (castShowMap[castId].length <= 1) delete castShowMap[castId];
    }
    for (const crewId in crewShowMap) {
      if (crewShowMap[crewId].length <= 1) delete crewShowMap[crewId];
    }

    const seenShows: Show["id"][] = [];
    const seenCast: Cast["id"][] = [];
    const seenCrew: Crew["id"][] = [];
    for (const show of state.getShowsInList()) {
      if (!seenShows.includes(show.id)) {
        seenShows.push(show.id);
        nodes.push({ id: show.name, type: Type.Show });
      }
      for (const cast of state.getCastByShow(show)) {
        if (!(cast.id in castShowMap)) continue;
        if (!seenCast.includes(cast.id)) {
          seenCast.push(cast.id);
          nodes.push({ id: cast.name, type: Type.Cast });
        }
        links.push({ source: show.name, target: cast.name });
      }
      for (const crew of state.getCrewByShow(show)) {
        if (!(crew.id in crewShowMap)) continue;
        if (!seenCrew.includes(crew.id)) {
          seenCrew.push(crew.id);
          nodes.push({ id: crew.name, type: Type.Crew });
        }
        links.push({ source: show.name, target: crew.name });
      }
    }

    return { nodes, links };
  };

  createEffect(() => {
    if (!svgRef) return;
    if (!tooltipRef) return;

    svgRef.innerHTML = "";
    tooltipRef.innerHTML = "";

    const container = svgRef.parentElement;
    const width = container?.clientWidth ?? 800;
    const height = Math.max(600, container?.clientHeight ?? 600);

    const graph = getGraphData();

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

    const simulation = d3
      .forceSimulation(graph.nodes)
      .force(
        "link",
        d3
          .forceLink(graph.links)
          .id((d: any) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svgGroup
      .append("g")
      .selectAll("line")
      .data(graph.links)
      .enter()
      .append("line")
      .attr("stroke", "#aaa");

    const node = svgGroup
      .append("g")
      .selectAll("circle")
      .data(graph.nodes)
      .enter()
      .append("circle")
      .attr("r", 8)
      .attr("fill", (d) => typeColorMap[d.type])
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(d.id)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      })
      .on("click", (event, d) => {
        alert(`Clicked on: ${d.id}`);
      })
      .call(
        d3
          .drag()
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
      <div ref={tooltipRef}></div>
    </article>
  );
}
