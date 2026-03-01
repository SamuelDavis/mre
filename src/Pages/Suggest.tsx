import { isKeyed } from "@samueldavis/solidlib";
import { useAppState } from "../AppState";
import type { CreditId, Department, Job, PersonId, TVSeriesId } from "../Types";

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

  return (
    <article>
      <header>
        <h1>Suggest</h1>
      </header>
      <pre>{JSON.stringify(getListPeople(), null, 2)}</pre>
    </article>
  );
}
