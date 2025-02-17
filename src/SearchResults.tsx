import {
	type Accessor,
	ErrorBoundary,
	For,
	Match,
	Switch,
	createResource,
} from "solid-js";
import TvShow from "./TvShow";
import { api } from "./http";

export default function SearchResults(props: {
	getQuery: Accessor<string | undefined>;
}) {
	const [results] = createResource(() => {
		const query = props.getQuery();
		return query ? { query } : undefined;
	}, api.searchTv);

	return (
		<ErrorBoundary fallback={(err: Error) => <p>{err.message}</p>}>
			<Switch>
				<Match when={results?.loading}>
					<progress />
				</Match>
				<Match when={results()?.results}>
					{(get) => (
						<ul>
							<For each={get()}>
								{(result) => (
									<li>
										<TvShow data={result} />
									</li>
								)}
							</For>
						</ul>
					)}
				</Match>
			</Switch>
		</ErrorBoundary>
	);
}
