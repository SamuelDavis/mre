import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  ErrorBoundary,
  For,
  onCleanup,
  onMount,
  Show,
  splitProps,
  Suspense,
  type Accessor,
  type Setter,
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
  type NodeData,
  type PeopleDetailsResponse,
  type TvSeriesDetailsResponse,
  type CreditsDetailsResponse,
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
import { HTMLIcon, Modal, type ExtendProps } from "@samueldavis/solidlib";
import ErrorModal from "../../Components/ErrorModal";
import Img from "../../Components/Img";

// @ts-ignore
cytoscape.use(fcose);

export default function Suggest() {
  const api = useApi();
  const list = useList();
  const [getTargetNode, setTargetNode] = createSignal<undefined | NodeData>();

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
      <Graph getElements={getElements} onClickNode={setTargetNode} />
      <Show when={getTargetNode()}>
        {(_) => {
          const api = useApi();
          const onClose = () => setTargetNode(undefined);
          const [getData] = createResource(getTargetNode, async (node) => {
            switch (node._type) {
              case "person":
                return api
                  .personDetails(node._id)
                  .then((res) => ({ _type: "person" as const, ...res }));
              case "series":
                return api
                  .tvSeriesDetails(node._id)
                  .then((res) => ({ _type: "series" as const, ...res }));
              case "credit":
                return api
                  .creditDetails(node._id)
                  .then((res) => ({ _type: "credit" as const, ...res }));
            }
          });
          return (
            <ErrorBoundary fallback={ErrorModal.fallback(onClose)}>
              <Suspense fallback={<progress />}>
                <Modal onClose={onClose} class="flex flex-col">
                  <article>
                    {(() => {
                      const data = getData();
                      if (!data) return;
                      switch (data._type) {
                        case "person":
                          return <PersonModal data={data} />;
                        case "series":
                          return <TvSeriesModal data={data} />;
                        case "credit":
                          return <CreditModal data={data} />;
                      }
                    })()}
                    <button onClick={onClose} class="float-right">
                      <HTMLIcon type="close" />
                    </button>
                  </article>
                </Modal>
              </Suspense>
            </ErrorBoundary>
          );
        }}
      </Show>
    </article>
  );
}

function PersonModal(local: { data: PeopleDetailsResponse }) {
  const getAlsoKnownAs = () =>
    local.data.also_known_as[0] !== local.data.name
      ? local.data.also_known_as[0]
      : undefined;
  const getGender = () => ["Male", "Female"][local.data.gender] ?? "Unknown";
  const getHref = (): string =>
    `https://www.themoviedb.org/person/${local.data.id}`;
  const getYear = (): string => local.data.birthday.slice(0, 4);

  return (
    <>
      <header>
        <h1 class="mb-0">
          <span>{local.data.name} </span>
        </h1>
        <Show when={getAlsoKnownAs()}>{(get) => <h2>{get()}</h2>}</Show>
      </header>
      <section class="grid gap-(--pico-block-spacing-horizontal) md:grid-cols-2">
        <div>
          <dl>
            <dt>Born</dt>
            <dd>{getYear()}</dd>
            <dt>Gender</dt>
            <dd>{getGender()}</dd>
            <dt>Known For</dt>
            <dd>{local.data.known_for_department}</dd>
          </dl>
          <p>{local.data.biography}</p>
          <a target="_blank" href={getHref()}>
            TMDB <HTMLIcon type="open_in_new" />
          </a>
        </div>
        <Img
          type="profile"
          size="original"
          path={local.data.profile_path}
          class="place-self-center"
        />
      </section>
    </>
  );
}

function TvSeriesModal(local: { data: TvSeriesDetailsResponse }) {
  const getHref = (): string =>
    `https://www.themoviedb.org/tv/${local.data.id}`;
  const getYear = (): string => local.data.first_air_date.slice(0, 4);

  return (
    <>
      <header>
        <h1 class="mb-0">
          <span>{local.data.name} </span>
          <small class="text-xs align-super">({getYear()})</small>
        </h1>
        <Show when={local.data.original_name}>{(get) => <h2>{get()}</h2>}</Show>
      </header>
      <section class="grid gap-(--pico-block-spacing-horizontal) md:grid-cols-2">
        <div>
          <dl>
            <dt>First Aired</dt>
            <dd>{local.data.first_air_date}</dd>
            <dt>Genres</dt>
            <For each={local.data.genres}>
              {(genre) => <dd>{genre.name}</dd>}
            </For>
            <dt>Production</dt>
            <dd>
              {local.data.number_of_episodes} episodes over{" "}
              {local.data.number_of_seasons} season
              {local.data.number_of_seasons === 1 ? "" : "s"}.
            </dd>
            <dt>runtime</dt>
            <dd>{local.data.episode_run_time[0]} minutes</dd>
          </dl>
          <hr />
          <q>{local.data.tagline}</q>
          <hr />
          <p>{local.data.overview}</p>
          <a target="_blank" href={getHref()}>
            TMDB <HTMLIcon type="open_in_new" />
          </a>
        </div>
        <Img
          type="poster"
          size="w342"
          path={local.data.poster_path}
          class="place-self-center"
        />
      </section>
    </>
  );
}

function CreditModal(local: { data: CreditsDetailsResponse }) {
  return (
    <>
      <header>
        <h1 class="mb-0">
          <span>{local.data.job} </span>
          <small class="text-xs align-super">
            (
            {local.data.job === "Actor"
              ? local.data.media.character
              : local.data.department}
            )
          </small>
        </h1>
      </header>
      <section class="grid gap-(--pico-block-spacing-horizontal) md:grid-cols-2">
        <div>
          <header>
            <h2>{local.data.person.name}</h2>
            <h3>{local.data.person.original_name}</h3>
            <a
              target="_blank"
              href={`https://www.themoviedb.org/tv/${local.data.media.id}`}
            >
              TMDB <HTMLIcon type="open_in_new" />
            </a>
          </header>
          <Img
            type="profile"
            size="w185"
            path={local.data.person.profile_path}
          />
        </div>
        <div>
          <header>
            <h2>{local.data.media.name}</h2>
            <h3>{local.data.media.original_name}</h3>
            <a
              target="_blank"
              href={`https://www.themoviedb.org/person/${local.data.person.id}`}
            >
              TMDB <HTMLIcon type="open_in_new" />
            </a>
          </header>
          <Img type="poster" size="w185" path={local.data.media.poster_path} />
        </div>
      </section>
    </>
  );
}

function Graph(
  props: ExtendProps<
    "div",
    {
      getElements: Accessor<ElementDefinition[]>;
      onClickNode: Setter<undefined | NodeData>;
    }
  >,
) {
  const [local, parent] = splitProps(props, ["getElements", "onClickNode"]);
  const list = useList();
  const getDocumentStyle = useDocumentStyles();
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
      local.onClickNode(event.target.data());
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
              return list.has(node.data("_id")) ? "blue" : "gold";
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
