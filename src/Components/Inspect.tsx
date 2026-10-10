import { extract, HTMLIcon, Modal } from "@samueldavis/solidlib";
import { For, Match, Show, Switch, type Signal } from "solid-js";
import { useCrawl } from "../AppState";
import {
  explainPerson,
  explainTitle,
  formatRole,
  type PersonExplanation,
  type Role,
  type Selection,
  type TitleExplanation,
} from "../Lib/model";
import Img from "./Img";
import ListToggle from "./ListToggle";

export default function Inspect(props: {
  selection: Signal<undefined | Selection>;
}) {
  const crawl = useCrawl();
  const getSelection = () => props.selection[0]();
  const getTitle = (): undefined | TitleExplanation => {
    const selection = extract(getSelection(), "key");
    const model = crawl.getModel();
    return selection && model.titles.has(selection.key)
      ? explainTitle(model, selection.key)
      : undefined;
  };
  const getPerson = (): undefined | PersonExplanation => {
    const selection = extract(getSelection(), "id");
    const model = crawl.getModel();
    return selection && model.people.has(selection.id)
      ? explainPerson(model, selection.id)
      : undefined;
  };

  function onSelect(selection: Selection): void {
    props.selection[1](selection);
  }

  function onClose(): void {
    props.selection[1](undefined);
  }

  return (
    <Show when={getSelection()}>
      <Modal onClose={onClose}>
        <article class="w-full">
          <div class="flex justify-end">
            <HTMLIcon type="close" onClick={onClose} />
          </div>
          <Switch fallback={<progress />}>
            <Match when={getTitle()}>
              {(get) => <TitleView explanation={get()} onSelect={onSelect} />}
            </Match>
            <Match when={getPerson()}>
              {(get) => <PersonView explanation={get()} onSelect={onSelect} />}
            </Match>
          </Switch>
        </article>
      </Modal>
    </Show>
  );
}

function formatRoles(roles: Role[]): string {
  return roles.map(formatRole).join(", ");
}

function TitleView(props: {
  explanation: TitleExplanation;
  onSelect: (selection: Selection) => void;
}) {
  const getTitle = () => props.explanation.title;
  const getHref = (): string =>
    `https://www.themoviedb.org/${getTitle().media}/${getTitle().id}`;

  return (
    <>
      <header class="flex gap-4">
        <Img
          type="poster"
          size="w154"
          path={getTitle().poster_path}
          class="w-24 self-start"
        />
        <div>
          <h2 class="mb-1">{getTitle().name}</h2>
          <p>
            <small>
              {getTitle().date.slice(0, 4)} · {getTitle().media}
              <Show when={!props.explanation.isList}>
                {" "}
                · score {props.explanation.score}
              </Show>
            </small>
          </p>
          <ListToggle mediaKey={getTitle().key} />
        </div>
      </header>
      <p>{getTitle().overview}</p>
      <h3>
        {props.explanation.isList ? "People you like in it" : "Why watch it"}
      </h3>
      <div class="overflow-auto">
        <table>
          <thead>
            <tr>
              <th>Person</th>
              <th>Role</th>
              <th>In your list</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.explanation.rows}>
              {(row) => (
                <tr>
                  <td>
                    <button
                      type="button"
                      class="link"
                      onClick={[
                        props.onSelect,
                        { type: "person", id: row.person.id },
                      ]}
                    >
                      {row.person.name}
                    </button>
                  </td>
                  <td>{formatRoles(row.roles)}</td>
                  <td>
                    <strong>{row.weight}</strong>:{" "}
                    <For each={row.titles}>
                      {(title, getIndex) => (
                        <>
                          <Show when={getIndex()}>, </Show>
                          <button
                            type="button"
                            class="link"
                            onClick={[
                              props.onSelect,
                              { type: "title", key: title.key },
                            ]}
                          >
                            {title.name}
                          </button>
                        </>
                      )}
                    </For>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      <a target="_blank" href={getHref()}>
        TMDB <HTMLIcon type="open_in_new" />
      </a>
    </>
  );
}

function PersonView(props: {
  explanation: PersonExplanation;
  onSelect: (selection: Selection) => void;
}) {
  const getPerson = () => props.explanation.person;
  const getHref = (): string =>
    `https://www.themoviedb.org/person/${getPerson().id}`;

  return (
    <>
      <header class="flex gap-4">
        <Img
          type="profile"
          size="w185"
          path={getPerson().profile_path}
          class="w-24 self-start"
        />
        <div>
          <h2 class="mb-1">{getPerson().name}</h2>
          <p>
            <small>In {props.explanation.weight} of your titles</small>
          </p>
        </div>
      </header>
      <h3>In your list</h3>
      <RoleTable rows={props.explanation.listRoles} onSelect={props.onSelect} />
      <Show when={props.explanation.candidateRoles.length}>
        <h3>Recommended</h3>
        <RoleTable
          rows={props.explanation.candidateRoles}
          onSelect={props.onSelect}
        />
      </Show>
      <a target="_blank" href={getHref()}>
        TMDB <HTMLIcon type="open_in_new" />
      </a>
    </>
  );
}

function RoleTable(props: {
  rows: (PersonExplanation["listRoles"][number] & { score?: number })[];
  onSelect: (selection: Selection) => void;
}) {
  return (
    <div class="overflow-auto">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Role</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.rows}>
            {(row) => (
              <tr>
                <td>
                  <button
                    type="button"
                    class="link"
                    onClick={[
                      props.onSelect,
                      { type: "title", key: row.title.key },
                    ]}
                  >
                    {row.title.name}
                  </button>{" "}
                  <small>{row.title.date.slice(0, 4)}</small>
                </td>
                <td>{formatRoles(row.roles)}</td>
                <td>{row.score ?? "—"}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
