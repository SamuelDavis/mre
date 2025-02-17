import { For, Show } from "solid-js";
import ImgSrc from "./ImgSrc";
import type { Api } from "./types";
import state from "./state";

export default function TvShow(props: {
	data: Api["searchTv"]["response"]["results"][number];
}) {
	const getGenres = () =>
		props.data.genre_ids.map((id) => state.genreIdNameMap[id]);

	return (
		<article role="group">
			<div>
				<header>
					<h3>{props.data.name}</h3>
					<Show when={props.data.original_name !== props.data.name}>
						<small>{props.data.original_name}</small>
					</Show>
				</header>
				<header>
					<button type="button">Add</button>
				</header>
				<Show when={props.data.genre_ids.length}>
					<section>
						<h5>Genres</h5>
						<ul aria-label="categories" role="group">
							<For each={getGenres()}>{(genre) => <li>{genre}</li>}</For>
						</ul>
					</section>
				</Show>
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
								<td>{props.data.popularity}</td>
								<td>{props.data.vote_average}</td>
								<td>{props.data.vote_count}</td>
							</tr>
						</tbody>
					</table>
				</section>
				<section>
					<h5>Details</h5>
					<table>
						<thead>
							<tr>
								<th>Aired</th>
								<th>Country</th>
								<th>Language</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>{props.data.first_air_date}</td>
								<td>{props.data.origin_country}</td>
								<td>{props.data.original_language}</td>
							</tr>
						</tbody>
					</table>
					<Show when={props.data.overview}>
						<p>{props.data.overview}</p>
					</Show>
				</section>
			</div>
			<Show when={props.data.poster_path}>
				{(get) => <img aria-label="poster" src={`${new ImgSrc(get())}`} />}
			</Show>
		</article>
	);
}
