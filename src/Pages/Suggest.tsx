import { HTMLIcon, isKeyed, type ExtendProps } from "@samueldavis/solidlib";
import { useApi, useAppState } from "../AppState";
import {
  isInterestingCast,
  isInterestingCrew,
  type CreditId,
  type Department,
  type Job,
  type PersonId,
  type TVSeriesId,
} from "../Types";
import {
  createEffect,
  createResource,
  createSignal,
  For,
  onCleanup,
  onMount,
  Suspense,
} from "solid-js";
import { rateLimit } from "../util";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import type {
  Core,
  EdgeDefinition,
  ElementDefinition,
  NodeDefinition,
} from "cytoscape";

cytoscape.use(fcose);

type Credit = {
  series_id: TVSeriesId;
  person_id: PersonId;
  credit_id: CreditId;
};

function Graph(props: ExtendProps<"div">) {
  const [appState] = useAppState();
  const getCredits = () =>
    appState.list.flatMap((series) => [
      ...series.aggregate_credits.cast
        .flatMap((cast) => cast.roles.map((role) => ({ ...cast, ...role })))
        .filter(isInterestingCast)
        .map(
          (cast): Credit => ({
            series_id: series.id,
            person_id: cast.id,
            credit_id: cast.credit_id,
          }),
        ),
    ]);

  const getNodes = (): NodeDefinition[] => {
    const nodes = new Set<string>();
    for (const credit of getCredits()) {
      nodes.add(`person:${credit.person_id}`);
      nodes.add(`series:${credit.series_id}`);
    }
    return [...nodes.values()].map((id): NodeDefinition => ({ data: { id } }));
  };

  const getEdges = (): EdgeDefinition[] =>
    getCredits().map(
      (credit): EdgeDefinition => ({
        data: {
          id: credit.credit_id,
          source: `person:${credit.person_id}`,
          target: `series:${credit.series_id}`,
        },
      }),
    );

  const getElements = (): ElementDefinition[] => [...getNodes(), ...getEdges()];

  let ref: undefined | HTMLDivElement;
  let cy: undefined | Core;

  onMount(render);
  createEffect(render);
  onCleanup(() => cy?.destroy());

  function render() {
    cy?.destroy();
    cy = cytoscape({
      container: ref,
      elements: getElements(),
      style: [
        // the stylesheet for the graph
        {
          selector: "node",
          style: {
            "background-color": "#666",
            label: "data(id)",
          },
        },

        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],
      layout: {
        name: "fcose",
      },
    });
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }} ref={ref} {...props} />
  );
}

type PersonCredit = {
  series_id: TVSeriesId;
  person_id: PersonId;
  credit_id: CreditId;
  name: string;
  original_name: string;
  department: Department;
  job: Job | string;
};

export default function Suggest() {
  const [appState] = useAppState();
  const request = useApi();
  const getListPeople = (): PersonCredit[] =>
    appState.list.flatMap((series) => [
      ...series.created_by.map(
        (credit): PersonCredit => ({
          ...credit,
          series_id: series.id,
          person_id: credit.id,
          department: "Crew",
          job: "Creator",
        }),
      ),
      ...series.aggregate_credits.cast
        .filter(isInterestingCast)
        .flatMap((credit) =>
          credit.roles.map(
            (role): PersonCredit => ({
              ...credit,
              ...role,
              series_id: series.id,
              person_id: credit.id,
              department: "Actors",
              job: role.character,
            }),
          ),
        ),
      ...series.aggregate_credits.crew.flatMap((credit) =>
        credit.jobs.filter(isInterestingCrew).map(
          (job): PersonCredit => ({
            ...credit,
            ...job,
            series_id: series.id,
            person_id: credit.id,
          }),
        ),
      ),
    ]);

  const [getAbortController, setAbortController] =
    createSignal<AbortController>();
  const [getValue, setValue] = createSignal(0);
  const getMax = (): number => getListPeople().length;
  const [getListPeopleCredits] = createResource(
    getAbortController,
    async (controller) => {
      const requests = getListPeople().map(
        (person) => () =>
          request.personTvCredits(person.person_id, {
            signal: controller.signal,
          }),
      );

      setValue(0);
      let credits: PersonCredit[] = [];
      outerloop: for await (const responses of rateLimit(requests, 20, 1500))
        for (const response of responses) {
          for (const credit of response.cast.filter(isInterestingCast))
            credits.push({
              series_id: credit.id,
              person_id: response.id,
              credit_id: credit.credit_id,
              name: credit.name,
              original_name: credit.original_name,
              department: "Actors",
              job: credit.character,
            });
          for (const credit of response.crew.filter(isInterestingCrew))
            credits.push({
              series_id: credit.id,
              person_id: response.id,
              credit_id: credit.credit_id,
              name: credit.name,
              original_name: credit.original_name,
              department: credit.department,
              job: credit.job,
            });
          setValue((n) => n + 1);
          if (controller.signal.aborted) break outerloop;
        }
      return credits;
    },
  );

  onCleanup(() => {
    getAbortController()?.abort();
  });

  function onClick() {
    setAbortController((controller) => {
      controller?.abort();
      return new AbortController();
    });
  }

  return (
    <article>
      <header>
        <h1>Suggest</h1>
      </header>
      <section>
        <h2>Graph</h2>
        <Graph />
      </section>
      <details>
        <summary>List People</summary>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Job</th>
            </tr>
          </thead>
          <tbody>
            <For each={getListPeople()}>
              {(person) => {
                return (
                  <tr>
                    <td>
                      <a
                        target="_blank"
                        href={`https://www.themoviedb.org/person/${person.person_id}`}
                      >
                        <HTMLIcon type="open_in_new" />
                        {person.name}
                      </a>
                    </td>
                    <td>{person.department}</td>
                    <td>{person.job}</td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </details>
      <button onClick={onClick}>Load</button>
      <Suspense fallback={<progress value={getValue()} max={getMax()} />}>
        <details>
          <summary>
            List Credits ({getListPeopleCredits()?.length ?? "-"})
          </summary>
          <h2>
            {
              getListPeopleCredits()
                ?.map((credit) => credit.series_id)
                .filter((id, i, arr) => arr.indexOf(id) === i).length
            }
          </h2>
          <pre>{JSON.stringify(getListPeopleCredits(), null, 2)}</pre>
        </details>
      </Suspense>
    </article>
  );
}
