import { createEffect, createRoot } from "solid-js";
import { api } from "./http";
import type { Cast, Crew, Genre, Show } from "./types";
import { createPersistentSignal, createPersistentStore } from "./utilities";
import { produce } from "solid-js/store";

const state = createRoot(() => {
	const [genreIdNameMap, setGenres] = createPersistentStore<
		Record<Genre["id"], Genre["name"]>
	>({ key: "genres", reviver: {} });
	const [getShows, setShows] = createPersistentSignal<Show[]>({
		key: "showList",
		reviver: [],
	});
	const [showIdPeopleMap, setPeople] = createPersistentStore<
		Record<Show["id"], { cast: Cast[]; crew: Crew[] }>
	>({
		key: "people",
		reviver: {},
	});
	const [getApiKey, setApiKey] = createPersistentSignal({
		key: "api-key",
		reviver: "",
	});

	api.tvGenres().then((res) =>
		setGenres(
			produce((genres) => {
				for (const genre of res.genres) {
					const { id, name } = genre;
					genres[id] = name;
				}
			}),
		),
	);

	createEffect(() => {
		const requests = getShows()
			.filter((show) => !(show.id in showIdPeopleMap))
			.map((show) => api.tvPeople({ series_id: show.id }));
		Promise.all(requests).then((responses) => {
			setPeople(
				produce((people) => {
					for (const response of responses) {
						const { id, ...rest } = response;
						people[id] = rest;
					}
				}),
			);
		});
	});

	function addShow(show: Show): void {
		setShows((shows) => [...omitById(shows, show), show]);
	}

	function showIsAdded(show: Show): boolean {
		return getShows().some((item) => item.id === show.id);
	}

	function removeShow(show: Show): void {
		setShows((shows) => omitById(shows, show));
	}

	function getCast(show: Show): Cast[] {
		return showIdPeopleMap[show.id]?.cast ?? [];
	}

	function getCrew(show: Show): Crew[] {
		return showIdPeopleMap[show.id]?.crew ?? [];
	}

	return {
		genreIdNameMap,
		showIdPeopleMap,
		addShow,
		removeShow,
		showIsAdded,
		getShows,
		getCast,
		getCrew,
		getApiKey,
		setApiKey,
	};
});

export default state;

function omitById<T extends { id: number }>(items: T[], omit: T) {
	return items.filter((item) => item.id !== omit.id);
}
