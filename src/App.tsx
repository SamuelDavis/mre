import { createResource, createSignal, For, Show } from "solid-js";
import { searchTv } from "./http.ts";
import ImgSrc from "./ImgSrc.ts";

export default function App() {
	const url = new URL(window.location.toString());
	const [getQuery, setQuery] = createSignal<undefined | string>(
		url.searchParams.get("query")?.toString(),
	);
	const [results] = createResource(getQuery, searchTv);

	function onSubmit(event: Event & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const query = data.get("query")?.toString() ?? "";
		setQuery(query);
		url.searchParams.set("query", query);
		window.history.pushState(undefined, "", url.toString());
	}

	return (
		<main>
			<form onSubmit={onSubmit}>
				<label for="query">Title</label>
				<input type="text" name="query" id="query" value={getQuery()} />
				<input type="submit" />
			</form>
			<Show when={results.loading}>Loading...</Show>
			<Show when={results.error}>Error: {results.error}</Show>
			<Show when={!(results.loading || results.error)}>
				<ul>
					<For each={results()?.results}>
						{(result) => (
							<li>
								<h3>{result.name}</h3>
								<Show when={result.original_name !== result.name}>
									<small>{result.original_name}</small>
								</Show>
								<p>{result.overview}</p>
								<img
									aria-label="poster"
									src={`${new ImgSrc(result.poster_path)}`}
								/>
							</li>
						)}
					</For>
				</ul>
				<details open>
					<summary>Raw Response</summary>
					<pre>{JSON.stringify(results(), null, 2)}</pre>
				</details>
			</Show>
		</main>
	);
}
