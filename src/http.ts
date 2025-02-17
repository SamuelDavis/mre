import {
	type Api,
	type ApiFactory,
	type ErrorResponse,
	isErrorResponse,
	paths,
} from "./types";

const apiKey = window.location.hash.slice(1);

async function httpFetch<Data extends Record<string, unknown>>(
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
	const data: ErrorResponse | Data = JSON.parse(body);

	if (isErrorResponse(data)) throw new Error(data.status_message);

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

export const api = new Proxy(
	{},
	{
		get<Key extends keyof Api>(_target: never, p: Key, _receiver: never) {
			return (request: Api[Key]["request"]) => {
				const { path, defaults = {} } = paths[p];
				const params = makeSearchParams({ ...defaults, ...request });
				const url = makeUrl(path, params);
				return httpFetch<Api[Key]["response"]>(url);
			};
		},
	},
) as ApiFactory;
