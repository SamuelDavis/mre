import {
  type Accessor,
  createEffect,
  JSX,
  JSXElement,
  onMount,
} from "solid-js";
import state from "../state";
import * as d3 from "d3";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";

enum Type {
  Show = 0,
  Person = 1,
}

interface Node extends SimulationNodeDatum {
  id: number;
  type: Type;
}
type Link = SimulationLinkDatum<Node>;

export default function Data() {
  let tooltipRef: HTMLDivElement | undefined;
  let svgRef: SVGSVGElement | undefined;
  const peopleShowCountMap = () => {
    const result: Record<number, number> = {};
    for (const { cast, crew } of Object.values(state.showIdPeopleMap)) {
      for (const person of [...cast, ...crew]) {
        result[person.id] = (result[person.id] ?? 0) + 1;
      }
    }
    return result;
  };

  const getData: Accessor<{ nodes: Node[]; links: Link[] }> = () => {
    const shows = state.getShows();
    const showPeopleMap = state.showIdPeopleMap;
    const peopleShowCounts = peopleShowCountMap();

    const nodes: Node[] = [];
    const links: Link[] = [];
    for (const show of shows) {
      nodes.push({ id: show.id, type: Type.Show });
      const { cast = [], crew = [] } = showPeopleMap[show.id] ?? {};
      for (const person of [...cast, ...crew]) {
        if ((peopleShowCounts[person.id] ?? 0) <= 1) continue;
        nodes.push({ id: person.id, type: Type.Person });
        links.push({ source: show.id, target: person.id });
      }
    }

    return { nodes, links };
  };

  onMount(() => {
    if (!svgRef) return;
    if (!tooltipRef) return;
    const data = getData();
    const width = 1000;
    const height = 1000;

    // Create a tooltip element for node hover information
    const tooltip = d3
      .select(tooltipRef)
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("text-align", "center")
      .style("padding", "5px")
      .style("font", "12px sans-serif")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const svg = d3.select(svgRef).attr("width", width).attr("height", height);

    // Define arrow marker for directed links
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M 0,-5 L 10,0 L 0,5")
      .attr("fill", "#999");

    // Create groups for links and nodes
    const linkGroup = svg.append("g").attr("class", "links");
    const nodeGroup = svg.append("g").attr("class", "nodes");

    // Initialize simulation
    const simulation = d3
      .forceSimulation<Node>(data.nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(data.links)
          .id((d) => d.id)
          .distance(150),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // On every tick update positions of nodes and links
    simulation.on("tick", () => {
      linkGroup
        .selectAll("line")
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup
        .selectAll("circle")
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    // Function to update the graph when data changes
    function updateGraph() {
      const data = getData();

      // Update simulation nodes and links
      simulation.nodes(data.nodes);
      (simulation.force("link") as d3.ForceLink<Node, Link>).links(data.links);

      // DATA JOIN for links
      const links = linkGroup
        .selectAll("line")
        .data(data.links, (d: any) => `${d.source}-${d.target}`);

      // Remove exiting links
      links.exit().remove();

      // Append new links
      const linksEnter = links
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-width", 1.5)
        .attr("marker-end", "url(#arrowhead)");

      linksEnter.merge(links);

      // DATA JOIN for nodes
      const nodes = nodeGroup.selectAll("circle").data(data.nodes, (d) => d.id);

      // Remove old nodes
      nodes.exit().remove();

      // Append new nodes
      const nodesEnter = nodes
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", (d) => (d.type === Type.Show ? "#1f77b4" : "#2ca02c"))
        .call(
          d3
            .drag<SVGCircleElement, Node>()
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
        )
        .on("mouseover", (event, d: Node) => {
          const { id, type } = d;
          const html =
            type === Type.Show
              ? state.getShows().find((show) => show.id === id)?.name
              : Object.values(state.showIdPeopleMap)
                  .flatMap(({ cast, crew }) => [...cast, ...crew])
                  .find((person) => person.id === id)?.name;

          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(html)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", () => {
          tooltip.transition().duration(500).style("opacity", 0);
        });
      nodesEnter.merge(nodes);

      // Restart simulation with the new data
      simulation.alpha(1).restart();
    }

    createEffect(updateGraph);
  });

  return (
    <article>
      <div ref={tooltipRef} />
      <svg ref={svgRef} />
    </article>
  );
}
