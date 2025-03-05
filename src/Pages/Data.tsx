import type {
  DraggedElementBaseType,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from "d3";
import * as d3 from "d3";
import { type JSX, Show, createEffect, createSignal } from "solid-js";
import ImageSource from "../ImgSrc";
import { ImportantJobs, ImportantRoles } from "../constants";
import { tvCast, tvCrew, tvList, tvSeries } from "../state";
import { Type, type int } from "../types";

type Node = SimulationNodeDatum & {
  id: string;
  type: Type;
  list: boolean;
};
type Link = SimulationLinkDatum<Node> & {
  source: string;
  target: string;
};
type GraphData = { nodes: Node[]; links: Link[] };

export default function Data() {
  let svgRef: undefined | SVGSVGElement;
  let tooltipRef: undefined | HTMLDivElement;

  const inListTypeColorMap: Record<
    Type,
    Exclude<JSX.CSSProperties["color"], undefined>
  > = {
    [Type.Show]: "red",
    [Type.Cast]: "green",
    [Type.Crew]: "blue",
  };
  const notListTypeColorMap: Record<
    Type,
    Exclude<JSX.CSSProperties["color"], undefined>
  > = {
    [Type.Show]: "yellow",
    [Type.Cast]: "teal",
    [Type.Crew]: "purple",
  };

  const getGraphData = (): GraphData => {
    const nodes: Node[] = [];
    const links: Link[] = [];

    const listSeries = tvList.get();
    const listCast = listSeries
      .flatMap((id) => tvCast.getBySeries({ id }))
      .map((person) => person.id);
    const listCrew = listSeries
      .flatMap((id) => tvCrew.getBySeries({ id }))
      .map((person) => person.id);

    for (const series of tvSeries.get()) {
      const seriesId = `${Type.Show}:${series.id}`;
      nodes.push({
        id: seriesId,
        type: Type.Show,
        list: listSeries.includes(series.id),
      });
      for (const person of tvCast.getBySeries(series)) {
        if (person.order > ImportantRoles) continue;
        const personId = `${Type.Cast}:${person.id}`;
        if (!nodes.some((node) => node.id === personId))
          nodes.push({
            id: personId,
            type: Type.Cast,
            list: listCast.includes(person.id),
          });
        links.push({ source: seriesId, target: personId });
      }
      for (const person of tvCrew.getBySeries(series)) {
        if (!ImportantJobs.includes(person.job)) continue;
        const personId = `${Type.Crew}:${person.id}`;
        if (!nodes.some((node) => node.id === personId))
          nodes.push({
            id: personId,
            type: Type.Crew,
            list: listCrew.includes(person.id),
          });
        links.push({ source: seriesId, target: personId });
      }
    }

    return { nodes, links };
  };

  const [getTargetId, setTargetId] = createSignal<undefined | string>();

  createEffect(() => {
    if (!svgRef) return;
    if (!tooltipRef) return;

    svgRef.innerHTML = "";
    tooltipRef.innerHTML = "";

    const container = svgRef.parentElement;
    const width = container?.clientWidth ?? 800;
    const height = Math.max(600, container?.clientHeight ?? 600);

    const graphData = getGraphData();

    const nodeDegree: Record<string, number> = {};
    for (const link of graphData.links)
      for (const key of [link.source, link.target])
        nodeDegree[key] = (nodeDegree[key] ?? 0) + 1;

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

    const sizeScale = d3
      .scaleLinear()
      .domain([1, d3.max(Object.values(nodeDegree)) || 1])
      .range([6, 20]);

    const simulation = d3
      .forceSimulation(graphData.nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(graphData.links)
          .id((d) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svgGroup
      .append("g")
      .selectAll("line")
      .data(graphData.links)
      .enter()
      .append("line")
      .attr("stroke", "#aaa");

    const node = svgGroup
      .append("g")
      .selectAll("circle")
      .data(graphData.nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => sizeScale(d.list ? (nodeDegree[d.id] ?? 1) : 1))
      .attr("fill", (d) =>
        d.list ? inListTypeColorMap[d.type] : notListTypeColorMap[d.type],
      )
      .attr("opacity", (d) => (d.list ? 1 : 0.5))
      .on("mouseover", (event, d) => {
        setTargetId(d.id);
        tooltip
          .style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", () => {
        setTargetId(undefined);
        tooltip.style("display", "none");
      })
      .on("click", (_event, d) => {
        alert(`Clicked on: ${d.id}`);
      })
      .call(
        d3
          .drag<any, Node>()
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
      <div ref={tooltipRef}>
        <Show when={getTargetId()}>
          {(getId) => {
            const [type, id] = getId().split(":");
            return <RenderType type={type as Type} id={Number(id)} />;
          }}
        </Show>
      </div>
    </article>
  );
}

function RenderType(props: { type: Type; id: int }) {
  switch (props.type) {
    case Type.Show: {
      const item = tvSeries.getById(props.id);
      if (item)
        return (
          <aside>
            <h4>
              {item.name} ({props.type})
            </h4>
            <img
              src={new ImageSource(item.poster_path, "w154").toString()}
              alt="poster"
            />
          </aside>
        );
      break;
    }
    case Type.Crew:
    case Type.Cast: {
      const item =
        props.type === Type.Crew
          ? tvCrew.getById(props.id)
          : tvCast.getById(props.id);
      if (item)
        return (
          <aside>
            <h4>
              {item.name} ({props.type})
            </h4>
            <img
              src={new ImageSource(item.profile_path ?? "", "w185").toString()}
              alt="profile"
            />
          </aside>
        );
      break;
    }
  }
}
