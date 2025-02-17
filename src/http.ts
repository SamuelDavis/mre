import type { SearchTV } from "./types";

const apiKey = window.location.hash.slice(1);

export async function searchTv(query: SearchTV.Request["query"]) {
	const request: SearchTV.Request = {
		include_adult: true,
		language: "en",
		page: 1,
		query,
	};
	const params = makeSearchParams(request);
	const url = makeUrl("/search/tv", new URLSearchParams(params));
	return httpFetch<SearchTV.Response>(url);
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

function makeSearchParams(
	query: Record<string, string | boolean | number>,
): URLSearchParams {
	const params = new URLSearchParams();
	for (const key in query) params.set(key, query[key].toString());
	return params;
}
