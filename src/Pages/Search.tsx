import { useApi, useSearchQuery } from "../AppState";
import {
  createMemo,
  createResource,
  createSignal,
  For,
  Match,
  Show,
  splitProps,
  Suspense,
  Switch,
} from "solid-js";
import type {
  ExtendProps,
  MultiSearchResult,
  PersonSearchResult,
  Signal,
  Targeted,
} from "../types";
import ErrorModal from "../Components/ErrorModal";
import ImageAsset from "../Components/ImageAsset";
import { extract, Modal } from "@samueldavis/solidlib";

export default function Search() {
  return (
    <article>
      <header>
        <h1>Search</h1>
      </header>
      <SearchForm />
      <SearchResultList />
    </article>
  );
}

function SearchForm(props: ExtendProps<"form", {}, "children" | "onSubmit">) {
  const [getQuery, setQuery] = useSearchQuery();

  function onSubmit(event: Targeted<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = data.get("q")?.toString().trim() || undefined;
    setQuery(query);
  }

  return (
    <form onSubmit={onSubmit} {...props}>
      <label for="q">Query</label>
      <fieldset role="search">
        <input id="q" name="q" type="search" value={getQuery()} />
        <input type="submit" />
      </fieldset>
    </form>
  );
}

function SearchResultList() {
  const [getQuery, setQuery] = useSearchQuery();
  const { requestSearchMulti: searchMulti } = useApi();
  const [resource] = createResource(getQuery, searchMulti);

  function onReset() {
    setQuery();
  }

  return (
    <ErrorModal reset={onReset}>
      <Show when={resource()} fallback={<progress />}>
        {(get) => (
          <ul>
            <For each={get().results}>
              {(result) => (
                <li>
                  <SearchResultListItem item={result} />
                </li>
              )}
            </For>
          </ul>
        )}
      </Show>
    </ErrorModal>
  );
}

function SearchResultListItem(
  props: ExtendProps<"article", { item: MultiSearchResult }, "children">,
) {
  const [local, parent] = splitProps(props, ["item"]);

  function getType<T extends MultiSearchResult["media_type"]>(
    type: T,
  ): undefined | Extract<MultiSearchResult, { media_type: T }> {
    return local.item.media_type === type ? (local.item as any) : undefined;
  }

  const getNorm = createMemo(() => {
    switch (local.item.media_type) {
      case "movie":
        return {
          type: local.item.media_type,
          original_name: local.item.original_title,
          name: local.item.title,
        };
      case "tv":
        return {
          type: local.item.media_type,
          original_name: local.item.original_name,
          name: local.item.name,
        };
      case "person":
        return {
          type: local.item.media_type,
          original_name: local.item.original_name,
          name: local.item.name,
        };
    }
  });

  const [getShowModal, setShowModel] = createSignal(false);

  return (
    <article {...parent}>
      <header>
        <small>{getNorm().type}</small>
        <h1>{getNorm().name}</h1>
        <Show when={getNorm().original_name !== getNorm().name}>
          <h5>{getNorm().original_name}</h5>
        </Show>
      </header>
      <header>
        <button onClick={[setShowModel, true]}>Details</button>
        <DetailsModal item={local.item} toggle={[getShowModal, setShowModel]} />
      </header>
      <Switch>
        <Match when={getType("movie") ?? getType("tv")}>
          {(get) => (
            <>
              <ImageAsset type="poster" size="w185" path={get().poster_path} />
              <p>{get().overview}</p>
            </>
          )}
        </Match>
        <Match when={getType("person")}>
          {(get) => (
            <>
              <ImageAsset
                type="profile"
                size="w185"
                path={get().profile_path}
              />
              <dl>
                <dt>Popularity</dt>
                <dd>{get().popularity}</dd>
                <dt>Known For</dt>
                <dd>{get().known_for_department}</dd>
                <dd>
                  <ul>
                    <For each={get().known_for}>
                      {(item) => <KnownForListItem item={item} />}
                    </For>
                  </ul>
                </dd>
              </dl>
            </>
          )}
        </Match>
      </Switch>
    </article>
  );
}

function KnownForListItem(
  props: ExtendProps<
    "li",
    { item: PersonSearchResult["known_for"][number] },
    "children"
  >,
) {
  const [local, parent] = splitProps(props, ["item"]);
  const getName = () =>
    extract(local.item, "title")?.title ?? extract(local.item, "name")?.name;
  return <li {...parent}>{getName()}</li>;
}

function DetailsModal(
  props: ExtendProps<
    typeof Modal,
    { item: MultiSearchResult; toggle: Signal<boolean> },
    "children" | "when" | "onClose"
  >,
) {
  const { requestDetails } = useApi();
  const [local, parent] = splitProps(props, ["item", "toggle"]);
  const [getOpen, setOpen] = local.toggle;
  const onClose = () => setOpen(false);
  const [resource] = createResource(
    () => (getOpen() ? local.item : undefined),
    requestDetails,
  );

  return (
    <Modal when={getOpen()} onClose={onClose} {...parent}>
      <ErrorModal>
        <Suspense fallback={<progress />}>
          <pre>
            {JSON.stringify(extract(resource(), "credits")?.id, null, 2)}
          </pre>
        </Suspense>
      </ErrorModal>
    </Modal>
  );
}
