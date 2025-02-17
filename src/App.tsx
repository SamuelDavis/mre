import {
	createEffect,
	createResource,
	createSignal,
	For,
	Show,
} from "solid-js";
import { searchTv } from "./http.ts";
import ImgSrc from "./ImgSrc.ts";

export default function App() {
	const url = new URL(window.location.toString());
	const [getQuery, setQuery] = createSignal<undefined | string>(
		url.searchParams.get("query")?.toString(),
	);
	const [results] = createResource(() => getQuery(), searchTv);

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
		<main>
			<form onSubmit={onSubmit} role="search">
				<input type="search" name="query" id="query" value={getQuery() || ""} />
				<input type="submit" />
			</form>
			<Show when={results.loading}>Loading...</Show>
			<Show when={results.error}>Error: {results.error}</Show>
			<Show when={!(results.loading || results.error)}>
				<ul>
					<For each={results()?.results}>
						{(result) => (
							<li>
								<article role="group">
									<div>
										<header role="group">
											<button type="button">Add</button>
											<div>
												<h3>{result.name}</h3>
												<Show when={result.original_name !== result.name}>
													<small>{result.original_name}</small>
												</Show>
											</div>
										</header>
										<section>
											<h5>Categories</h5>
											<ul role="group">
												<For each={result.genre_ids}>
													{(id) => <li>{id}</li>}
												</For>
											</ul>
										</section>
										<section>
											<h5>Sentiment</h5>
											<table>
												<thead>
													<tr>
														<th>Popularity</th>
														<th>Vote Average</th>
														<th>Vote Count</th>
													</tr>
												</thead>
												<tbody>
													<tr>
														<td>{result.popularity}</td>
														<td>{result.vote_average}</td>
														<td>{result.vote_count}</td>
													</tr>
												</tbody>
											</table>
										</section>
										<section>
											<h5>Details</h5>
											<p>{result.overview}</p>
										</section>
									</div>
									<img
										aria-label="poster"
										src={`${new ImgSrc(result.poster_path)}`}
									/>
								</article>
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
