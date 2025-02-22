import { For } from "solid-js";
import state from "./state";

type Row = {
  id: number;
  name: string;
  role: string;
  show: string;
  dep: string;
};

export default function Data() {
  const getPeople = () =>
    state
      .getShows()
      .flatMap((show): Row[] => {
        const cast = state.getCast(show);
        const crew = state.getCrew(show);

        return [
          ...cast.flatMap((member) =>
            member.roles.map((role) => ({
              id: member.id,
              name: member.name,
              role: role.character,
              show: show.name,
              dep: member.known_for_department,
            })),
          ),
          ...crew.flatMap((member) =>
            member.jobs.map((job) => ({
              id: member.id,
              name: member.name,
              role: job.job,
              show: show.name,
              dep: member.department,
            })),
          ),
        ];
      })
      .sort((a, b) => a.id - b.id)
      .reduce<Record<Row["id"], Row[]>>((acc, row) => {
        acc[row.id] = [...(acc[row.id] ?? []), row];
        return acc;
      }, {});
  const getRows = () =>
    Object.values(getPeople()).sort((a, b) => b.length - a.length);
  return (
    <main>
      <For each={getRows()}>
        {(rows) => (
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Show</th>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              <For each={rows}>
                {(row) => (
                  <tr>
                    <td>{row.id}</td>
                    <td>{row.show}</td>
                    <td>{row.name}</td>
                    <td>{row.role}</td>
                    <td>{row.dep}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        )}
      </For>
    </main>
  );
}
