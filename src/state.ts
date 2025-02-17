import { createRoot } from "solid-js";
import { api } from "./http";
import type { Genre, Show } from "./types";
import { createPersistentSignal, createPersistentStore } from "./utilities";

const state = createRoot(() => {
	const [genreIdNameMap, setGenres] = createPersistentStore<
		Record<Genre["id"], Genre["name"]>
	>({
		key: "genres",
		reviver: (value: string | null) => JSON.parse(value ?? "null") ?? {},
	});
	const [getShowList, setShowList] = createPersistentSignal<Show[]>({
		key: "showList",
		reviver: (value: string | null) => JSON.parse(value ?? "null") ?? [],
	});

	api.tvGenres().then((res) =>
		setGenres((acc) =>
			res.genres.reduce((acc, item) => {
				acc[item.id] = item.name;
				return acc;
			}, acc),
		),
	);

	function addShow(show: Show): void {
		setShowList((shows) => [...omitById(shows, show), show]);
	}

	function showIsAdded(show: Show): boolean {
		return getShowList().some((item) => item.id === show.id);
	}

	function removeShow(show: Show): void {
		setShowList((shows) => omitById(shows, show));
	}

	return {
		genreIdNameMap,
		addShow,
		removeShow,
		showIsAdded,
	};
});

export default state;

function omitById<T extends { id: number }>(items: T[], omit: T) {
	return items.filter((item) => item.id !== omit.id);
}
