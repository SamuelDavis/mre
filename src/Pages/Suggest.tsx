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
  const getListPeople = () =>
    appState.list.map((series): PersonCredit[] =>
      [
        ...series.created_by,
        ...series.aggregate_credits.cast.flatMap((credit) =>
          credit.roles.map((role) => ({ ...credit, ...role })),
        ),
        ...series.aggregate_credits.crew.flatMap((credit) =>
          credit.jobs.map((job) => ({ ...credit, ...job })),
        ),
      ].map(
        (credit): PersonCredit => ({
          series_id: series.id,
          person_id: credit.id,
          credit_id: credit.credit_id,
          name: credit.name,
          original_name: credit.original_name,
          ...(isKeyed(credit, "department")
            ? { department: credit.department, job: credit.job }
            : isKeyed(credit, "character")
              ? { department: "Actors", job: credit.character }
              : { department: "Crew", job: "Creator" }),
        }),
      ),
    );

  return (
    <article>
      <header>
        <h1>Suggest</h1>
      </header>
      <pre>{JSON.stringify(getListPeople(), null, 2)}</pre>
    </article>
  );
}
