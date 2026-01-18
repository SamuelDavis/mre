import {
  type ExtendProps,
  isInstanceOf,
  HTMLDate,
  type Targeted,
} from "@samueldavis/solidlib";
import {
  For,
  splitProps,
  Show,
  createSignal,
  createResource,
  Suspense,
} from "solid-js";
import { useApi, useCredits, useList } from "../AppState";
import type {
  Cast,
  Crew,
  MediaCredit,
  MediaDetails,
  MediaItem,
} from "../types";
import ErrorModal from "./ErrorModal";
import ImageAsset from "./ImageAsset";

export default function MediaList(
  props: ExtendProps<"ul", { items: undefined | (Error | MediaItem)[] }>,
) {
  const [local, parent] = splitProps(props, ["children", "items"]);
  return (
    <ul {...parent}>
      <For each={local.items} fallback={local.children}>
        {(result) => <MediaListItem value={result} />}
      </For>
    </ul>
  );
}

function MediaListItem(
  props: ExtendProps<"aside", { value: Error | MediaItem }, "children">,
) {
  const [local, parent] = splitProps(props, ["value"]);

  if (isInstanceOf(local.value, Error))
    return (
      <aside {...parent}>
        <details>
          <summary>
            <h5>{local.value.message}</h5>
          </summary>
          <pre>{JSON.stringify(local.value.cause, null, 2)}</pre>
        </details>
      </aside>
    );

  const credits = useCredits(local.value.id);
  return (
    <aside {...parent}>
      <header>
        <div role="group">
          <h2>{local.value.name}</h2>
          <HTMLDate value={new Date(local.value.date)} />
        </div>
        <Show
          when={
            local.value.originalName &&
            local.value.originalName !== local.value.name
          }
        >
          <q>{local.value.originalName}</q>
        </Show>
      </header>
      <ListToggle value={local.value} />
      <section role="group">
        <ImageAsset
          type="poster"
          size="w154"
          path={local.value.poster}
          style={{ "object-fit": "contain" }}
        />
        <p>{local.value.overview}</p>
      </section>
      <section>
        <details>
          <summary>Cast & Crew</summary>
          <ul>
            <For each={credits}>
              {(credit) => (
                <li>
                  <header>
                    <h4>{credit.name}</h4>
                    <small>{credit.original_name}</small>
                  </header>

                  <section role="group">
                    <ImageAsset
                      type="profile"
                      size="w185"
                      path={credit.profile_path}
                      style={{ "object-fit": "contain" }}
                    />
                    <dl>
                      <dt>Department</dt>
                      <dd>{credit.department}</dd>
                      <dt>Role</dt>
                      <dd>{credit.job}</dd>
                      <dt>Order</dt>
                      <dd>{credit.order}</dd>
                    </dl>
                  </section>
                </li>
              )}
            </For>
          </ul>
        </details>
      </section>
    </aside>
  );
}

function ListToggle(
  props: ExtendProps<"form", { value: MediaItem }, "onSubmit">,
) {
  const request = useApi();
  const list = useList();
  const [local, parent] = splitProps(props, ["value"]);
  const [getChecked, setChecked] = createSignal(list.has(local.value.id));
  const [resource] = createResource(getChecked, async function () {
    const response = await request<MediaDetails>(
      `/${local.value.type}/${local.value.id}`,
      { append_to_response: "credits" },
    );
    list.add(
      local.value,
      normalizeCredits(response.credits.cast, response.credits.crew),
    );
    return response;
  });

  function onInput(event: Targeted<HTMLInputElement>): void {
    setChecked(event.currentTarget.checked);
    if (!event.currentTarget.checked) list.del(local.value.id);
  }

  return (
    <ErrorModal>
      <Suspense fallback={<progress />}>
        <form onSubmit={(e) => e.preventDefault()} {...parent}>
          <label>
            <input
              type="checkbox"
              role="switch"
              checked={getChecked()}
              onInput={onInput}
              disabled={resource.loading}
            />
            <span>
              <Show when={getChecked()} fallback="Add to List">
                Remove from List
              </Show>
            </span>
          </label>
        </form>
      </Suspense>
    </ErrorModal>
  );
}

function normalizeCredits(cast: Cast[], crew: Crew[]): MediaCredit[] {
  return [
    ...cast.map(
      (member): MediaCredit => ({
        credit_id: member.credit_id,
        id: member.id,
        name: member.name,
        original_name: member.original_name,
        profile_path: member.profile_path,
        department: "Cast",
        job: member.character,
        order: member.order,
      }),
    ),
    ...crew.map(
      (member): MediaCredit => ({
        credit_id: member.credit_id,
        id: member.id,
        name: member.name,
        original_name: member.original_name,
        profile_path: member.profile_path,
        department: member.department,
        job: member.job,
        order: 0,
      }),
    ),
  ];
}
