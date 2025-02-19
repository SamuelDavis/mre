import { createSignal } from "solid-js";
import SearchResults from "./SearchResults";

export default function Search() {
	const url = new URL(window.location.toString());
	const value = url.searchParams.get("query")?.toString();

	const [getQuery, setQuery] = createSignal(value ?? "");

	function onSubmit(event: Event & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const query = data.get("query")?.toString();

		if (query) url.searchParams.set("query", query);
		else url.searchParams.delete("query");
		window.history.pushState(undefined, "", url.toString());

		setQuery(query ?? "");
	}

	return (
		<>
			<form onSubmit={onSubmit} role="search">
				<input type="search" name="query" id="query" value={value ?? ""} />
				<input type="submit" />
			</form>
			<SearchResults getQuery={getQuery} />
		</>
	);
}
