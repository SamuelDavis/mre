import { For, Match, type ParentProps, Show, Switch } from "solid-js";
import state from "../state";
import type { Cast, Crew } from "../types";
import ImageSource from "../ImgSrc";
import TvShow from "../TvShow";

export default function List() {
  return (
    <article>
      <h1>Saved Shows</h1>
      <ul>
        <For each={state.getShowsInList()}>
          {(show) => {
            return (
              <li>
                <TvShow show={show} />
                <details>
                  <summary>Cast</summary>
                  <For each={state.getCastByShow(show)}>
                    {(person) => (
                      <PersonDetails person={person}>
                        <dt>Roles</dt>
                        <ul role="group">
                          <For each={person.roles}>
                            {(role) => <li>{role.character}</li>}
                          </For>
                        </ul>
                      </PersonDetails>
                    )}
                  </For>
                </details>
                <details>
                  <summary>Crew</summary>
                  <For each={state.getCrewByShow(show)}>
                    {(person) => (
                      <PersonDetails person={person}>
                        <dt>Jobs</dt>
                        <ul role="group">
                          <For each={person.jobs}>
                            {(job) => <li>{job.job}</li>}
                          </For>
                        </ul>
                      </PersonDetails>
                    )}
                  </For>
                </details>
              </li>
            );
          }}
        </For>
      </ul>
    </article>
  );
}

function PersonDetails(props: ParentProps<{ person: Cast | Crew }>) {
  return (
    <article role="group">
      <section>
        <h1>{props.person.name}</h1>
        <Show when={props.person.original_name !== props.person.name}>
          <h5>{props.person.original_name}</h5>
        </Show>
        <dl>
          {props.children}
          <dt>Adult</dt>
          <dd>{props.person.adult ? "Yes" : "No"}</dd>
          <dt>Gender</dt>
          <dd>
            <Switch fallback={"Unknown"}>
              <Match when={props.person.gender === 0}>Male</Match>
              <Match when={props.person.gender === 1}>Female</Match>
            </Switch>
          </dd>
        </dl>
      </section>
      <Show when={props.person.profile_path}>
        {(getPath) => (
          <section>
            <img
              alt={props.person.name}
              src={new ImageSource(getPath()).toString()}
            />
          </section>
        )}
      </Show>
    </article>
  );
}
