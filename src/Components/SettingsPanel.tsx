import {
  assert,
  isNumber,
  isOf,
  type Targeted,
} from "@samueldavis/solidlib";
import { For } from "solid-js";
import { useCrawl, useSettings, useTmdb } from "../AppState";
import {
  creditFilterNames,
  defaultSettings,
  genres,
  selectableJobs,
  type CreditFilter,
  type GenreId,
  type Settings,
} from "../Lib/model";
import type { Job } from "../Types/TMDB";

const numericSettings = [
  "castLimit",
  "minEpisodes",
  "episodeShare",
  "topK",
] as const satisfies readonly (keyof Settings)[];

export default function SettingsPanel() {
  const [getSettings, setSettings] = useSettings();
  const tmdb = useTmdb();
  const crawl = useCrawl();
  const getStats = () => tmdb.getStats();
  const getPercent = (): string =>
    `${Math.round(getSettings().episodeShare * 100)}%`;

  function onNumberInput(event: Targeted<HTMLInputElement, InputEvent>): void {
    const { name, valueAsNumber } = event.currentTarget;
    assert(isOf, name, numericSettings);
    if (!isNumber(valueAsNumber)) return;
    setSettings((settings) => ({ ...settings, [name]: valueAsNumber }));
  }

  function onToggleJob(job: Job): void {
    setSettings((settings) => ({
      ...settings,
      jobs: toggled(settings.jobs, job),
    }));
  }

  function onToggleGenre(id: GenreId): void {
    setSettings((settings) => ({
      ...settings,
      excludedGenres: toggled(settings.excludedGenres, id),
    }));
  }

  function onToggleCredit(name: CreditFilter): void {
    setSettings((settings) => ({
      ...settings,
      excludedCredits: toggled(settings.excludedCredits, name),
    }));
  }

  function onReset(): void {
    setSettings(defaultSettings);
  }

  return (
    <details>
      <summary>
        Settings{" "}
        <small>
          {getStats().fetched} fetched · {getStats().cached} cached ·{" "}
          {getStats().pending} pending · {getStats().failed} failed ·{" "}
          {crawl.getModel().people.size} people ·{" "}
          {crawl.getModel().candidates.length} candidates
        </small>
      </summary>
      <form>
        <div class="grid gap-x-4 sm:grid-cols-2">
          <label>
            Lead cast per title
            <input
              type="number"
              name="castLimit"
              min="0"
              max="50"
              value={getSettings().castLimit}
              onInput={onNumberInput}
            />
          </label>
          <label>
            Min. episodes for TV candidates
            <input
              type="number"
              name="minEpisodes"
              min="1"
              max="500"
              value={getSettings().minEpisodes}
              onInput={onNumberInput}
            />
          </label>
          <label>
            TV crew must work on {getPercent()} of episodes
            <input
              type="range"
              name="episodeShare"
              min="0"
              max="1"
              step="0.05"
              value={getSettings().episodeShare}
              onInput={onNumberInput}
            />
          </label>
          <label>
            Recommendations shown
            <input
              type="number"
              name="topK"
              min="1"
              max="100"
              value={getSettings().topK}
              onInput={onNumberInput}
            />
          </label>
        </div>
        <fieldset>
          <legend>Important crew jobs</legend>
          <div class="grid sm:grid-cols-3">
            <For each={selectableJobs}>
              {(job) => (
                <label>
                  <input
                    type="checkbox"
                    checked={getSettings().jobs.includes(job)}
                    onChange={[onToggleJob, job]}
                  />
                  {job}
                </label>
              )}
            </For>
          </div>
        </fieldset>
        <fieldset>
          <legend>Ignored credits</legend>
          <div class="grid sm:grid-cols-3">
            <For each={creditFilterNames}>
              {(name) => (
                <label>
                  <input
                    type="checkbox"
                    checked={getSettings().excludedCredits.includes(name)}
                    onChange={[onToggleCredit, name]}
                  />
                  {name}
                </label>
              )}
            </For>
          </div>
        </fieldset>
        <fieldset>
          <legend>Ignored genres</legend>
          <div class="grid sm:grid-cols-3">
            <For each={genres}>
              {(genre) => (
                <label>
                  <input
                    type="checkbox"
                    checked={getSettings().excludedGenres.includes(genre.id)}
                    onChange={[onToggleGenre, genre.id]}
                  />
                  {genre.name}
                </label>
              )}
            </For>
          </div>
        </fieldset>
        <button type="button" onClick={onReset}>
          Reset to defaults
        </button>
      </form>
    </details>
  );
}

function toggled<T>(items: readonly T[], item: T): T[] {
  return items.includes(item)
    ? items.filter((existing) => existing !== item)
    : [...items, item];
}
