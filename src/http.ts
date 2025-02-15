const apiKey = window.location.hash.slice(1);

export async function searchTv(query: string) {
	return httpFetch<{
		page: number;
		total_pages: number;
		total_results: number;
		results: {
			adult: boolean;
			backdrop_path: string;
			genre_ids: number[];
			id: number;
			origin_country: string[];
			original_language: string;
			original_name: string;
			overview: string;
			popularity: number;
			poster_path: string;
			first_air_date: string;
			name: string;
			vote_average: number;
			vote_count: number;
		}[];
	}>(
		makeUrl(
			"/search/tv",
			new URLSearchParams({
				include_adult: "true",
				language: "en-US",
				page: "1",
				query,
			}),
		),
	);
}

export async function httpFetch<Data extends Record<string, unknown>>(
	url: URL,
): Promise<Data> {
	const key = url.toString();
	let body = localStorage.getItem(key);
	if (!body)
		body = await fetch(url, {
			method: "GET",
			headers: {
				accept: "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
		}).then((res) => res.text());

	if (!(typeof body === "string")) throw new TypeError();
	const data: Data = JSON.parse(body);
	localStorage.setItem(key, body);
	console.log(url, data);
	return data;
}

function makeUrl(path: string, params: URLSearchParams): URL {
	return new URL(`https://api.themoviedb.org/3/${path}?${params}`);
}
