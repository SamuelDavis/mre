import { isKeyed } from "@samueldavis/solidlib";
import { useApi, useAppState } from "../AppState";
import type { CreditId, Department, Job, PersonId, TVSeriesId } from "../Types";
import { createResource, createSignal, onCleanup, Suspense } from "solid-js";
import { rateLimit } from "../util";

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
      ...series.aggregate_credits.cast.flatMap((credit) =>
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
        credit.jobs.map(
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

  function isInterestingCast(credit: { episode_count: number }): boolean {
    return credit.episode_count > 1;
  }

  function isInterestingCrew(credit: { job: Job }): boolean {
    return appState.filters.interestingJobs.includes(credit.job);
  }

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
      <details>
        <summary>List People</summary>
        <pre>{JSON.stringify(getListPeople(), null, 2)}</pre>
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
