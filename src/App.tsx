import { createEffect, createSignal, For } from "solid-js";
import SearchResults from "./SearchResults.tsx";
import state from "./state.ts";
import TvShow from "./TvShow.tsx";

export default function App() {
	const url = new URL(window.location.toString());
	const [getQuery, setQuery] = createSignal<undefined | string>(
		url.searchParams.get("query")?.toString(),
	);

	createEffect(() => {
		const query = getQuery();
		const url = new URL(window.location.toString());
		if (query) url.searchParams.set("query", query);
		else url.searchParams.delete("query");
		window.history.pushState(undefined, "", url.toString());
	});

	function onSubmit(event: Event & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const query = data.get("query")?.toString();
		setQuery(query || undefined);
	}

	return (
		<main role="group">
			<aside>
				<form onSubmit={onSubmit} role="search">
					<input
						type="search"
						name="query"
						id="query"
						value={getQuery() || ""}
					/>
					<input type="submit" />
				</form>
				<SearchResults getQuery={getQuery} />
			</aside>
			<ul>
				<For each={state.getShows()}>
					{(data) => (
						<li>
							<TvShow data={data} />
						</li>
					)}
				</For>
			</ul>
		</main>
	);
}
