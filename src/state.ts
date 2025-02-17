import { createRoot } from "solid-js";
import { createStore } from "solid-js/store";
import { api } from "./http";

const state = createRoot(() => {
	const [genreIdNameMap, setGenres] = createStore<Record<number, string>>({});
	api.tvGenres().then((res) =>
		setGenres((acc) =>
			res.genres.reduce((acc, item) => {
				acc[item.id] = item.name;
				return acc;
			}, acc),
		),
	);

	return { genreIdNameMap };
});

export default state;
