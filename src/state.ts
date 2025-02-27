import { createRoot } from "solid-js";
import type { Cast, Crew, Genre, Show } from "./types";
import { createPersistentSignal, createPersistentStore } from "./utilities";

const state = createRoot(() => {
  const [getShows, setShows] = createPersistentSignal<Show[]>({
    key: "shows",
    reviver: [],
  });
  function addShows(toAdd: Show[]) {
    return setShows((existing) => mergeUnique(existing, toAdd));
  }

  const [getList, setList] = createPersistentSignal<Show["id"][]>({
    key: "list",
    reviver: [],
  });
  function inList(item: Show) {
    return getList().includes(item.id);
  }
  function addToList(toAdd: Show) {
    return setList((existing) => mergeUnique(existing, [toAdd.id]));
  }
  function removeFromList(toRemove: Show) {
    return setList((existing) => existing.filter((id) => id !== toRemove.id));
  }

  const [showCastMap, setShowCastMap] = createPersistentStore<
    Record<Show["id"], Cast["id"][]>
  >({
    key: "show-cast-map",
    reviver: {},
  });
  const [getCast, setCast] = createPersistentSignal<Cast[]>({
    key: "cast",
    reviver: [],
  });
  function addCast(showId: Show["id"], toAdd: Cast[]) {
    setCast((existing) => mergeUnique(existing, toAdd, (e) => e.id));
    setShowCastMap((map) => {
      const idsToAdd = toAdd.map((cast) => cast.id);
      const existing = map[showId] ?? [];
      const list = mergeUnique(existing, idsToAdd);
      return list.length === existing.length ? map : { ...map, [showId]: list };
    });
  }
  const [showCrewMap, setShowCrewMap] = createPersistentStore<
    Record<Show["id"], Crew["id"][]>
  >({
    key: "show-crew-map",
    reviver: {},
  });
  const [getCrew, setCrew] = createPersistentSignal<Crew[]>({
    key: "crew",
    reviver: [],
  });
  function addCrew(showId: Show["id"], toAdd: Crew[]) {
    setCrew((existing) => mergeUnique(existing, toAdd, (e) => e.id));
    setShowCrewMap((map) => {
      const idsToAdd = toAdd.map((cast) => cast.id);
      const existing = map[showId] ?? [];
      const list = mergeUnique(existing, idsToAdd);
      return list.length === existing.length ? map : { ...map, [showId]: list };
    });
  }
  function getCastByShow(show: Show) {
    const ids = showCastMap[show.id] ?? [];
    return getCast().filter((cast) => ids.includes(cast.id));
  }
  function getCrewByShow(show: Show) {
    const ids = showCrewMap[show.id] ?? [];
    return getCrew().filter((cast) => ids.includes(cast.id));
  }

  function getGenreNameById(id: number) {
    return genres.find((genre) => genre.id === id);
  }

  function getShowsInList() {
    const shows = state.getShows();
    const list = state.getList();
    return list.map((id) => {
      const show = shows.find((show) => show.id === id);
      if (show) return show;
      throw new Error(`Show ${id} not found.`);
    });
  }

  function getShowById(id: Show["id"]): undefined | Show {
    return getShows().find((show) => show.id === id);
  }

  function getCastById(id: Cast["id"]): undefined | Cast {
    return getCast().find((cast) => cast.id === id);
  }

  return {
    getShows,
    addShows,
    getList,
    inList,
    addToList,
    removeFromList,
    addCast,
    addCrew,
    getCastByShow,
    getCrewByShow,
    getGenreNameById,
    getShowsInList,
    showCastMap,
    getShowById,
    getCastById,
  };
});

function mergeUnique<T>(
  existing: T[],
  toAdd: T[],
  getId: (t: T) => unknown = (t: T) => t,
): T[] {
  const knownIds = existing.map(getId);
  const unknown = toAdd.filter((item) => !knownIds.includes(getId(item)));
  return unknown.length ? [...existing, ...unknown] : existing;
}

const genres: Genre[] = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

export default state;
