import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  type Accessor,
} from "solid-js";
import { buildModel, type Model, type Settings } from "./model";
import type { Tmdb } from "./tmdb";
import type {
  CombinedCredits,
  Details,
  MediaKey,
  PersonId,
} from "../Types/TMDB";

export type Crawl = {
  getDetails: Accessor<ReadonlyMap<MediaKey, Details>>;
  getModel: Accessor<Model>;
  getErrors: Accessor<Error[]>;
};

type CrawlOptions = {
  tmdb: Tmdb;
  getEnabled: Accessor<boolean>;
  getList: Accessor<MediaKey[]>;
  getSettings: Accessor<Settings>;
  flushMs?: number;
};

export function createCrawl(options: CrawlOptions): Crawl {
  const { tmdb, getEnabled, getList, getSettings, flushMs = 500 } = options;
  const [getDetails, setDetails] = createSignal<
    ReadonlyMap<MediaKey, Details>
  >(new Map());
  const [getCredits, setCredits] = createSignal<
    ReadonlyMap<PersonId, CombinedCredits>
  >(new Map());
  const [getErrors, setErrors] = createSignal<Error[]>([]);
  const requested = new Set<MediaKey | PersonId>();
  const pendingDetails = new Map<MediaKey, Details>();
  const pendingCredits = new Map<PersonId, CombinedCredits>();

  const getModel = createMemo(() =>
    buildModel(getList(), getDetails(), getCredits(), getSettings()),
  );

  function track<K extends MediaKey | PersonId, V>(
    key: K,
    load: (key: K) => Promise<V>,
    pending: Map<K, V>,
  ): void {
    if (requested.has(key)) return;
    requested.add(key);
    load(key).then(
      (value) => pending.set(key, value),
      (error: Error) => {
        requested.delete(key);
        setErrors((errors) => [...errors, error]);
      },
    );
  }

  function flush(): void {
    if (pendingDetails.size) {
      setDetails((prev) => new Map([...prev, ...pendingDetails]));
      pendingDetails.clear();
    }
    if (pendingCredits.size) {
      setCredits((prev) => new Map([...prev, ...pendingCredits]));
      pendingCredits.clear();
    }
  }

  createEffect(() => {
    if (!getEnabled()) return;
    for (const key of getList()) track(key, tmdb.details, pendingDetails);
  });

  createEffect(() => {
    if (!getEnabled()) return;
    for (const id of getModel().people.keys())
      track(id, tmdb.credits, pendingCredits);
  });

  const interval = setInterval(flush, flushMs);
  onCleanup(clearInterval.bind(null, interval));

  return { getDetails, getModel, getErrors };
}
