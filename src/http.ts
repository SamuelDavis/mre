import { createRoot } from "solid-js";
import {
	type Api,
	type ApiFactory,
	type ErrorResponse,
	isErrorResponse,
	paths,
} from "./types";
import { createPersistentStore } from "./utilities";

const apiKey = window.location.hash.slice(1);

const state = createRoot(() => {
	const [requestPathResponseMap, setRequests] = createPersistentStore<
		Record<string, unknown>
	>({
		key: "requests",
		reviver: (value: string | null) => JSON.parse(value ?? "null") ?? {},
	});

	function addRequest(path: string, value: unknown): void {
		setRequests((requests) => ({ ...requests, [path]: value }));
	}

	return { requestPathResponseMap, addRequest };
});

async function httpFetch<Data extends Record<string, unknown>>(
	url: URL,
): Promise<Data> {
	const key = url.toString();
	let body = state.requestPathResponseMap[key];
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
	state.addRequest(key, body);
	return data;
}

function makeUrl(path: string, params: URLSearchParams): URL {
	return new URL(`https://api.themoviedb.org/3/${path}?${params}`);
}

function makeSearchParams(
	query: unknown | Record<string, string | boolean | number>,
): URLSearchParams {
	const params = new URLSearchParams();
	if (query) for (const key in query) params.set(key, query[key].toString());
	return params;
}

export const api = new Proxy(
	{},
	{
		get<Key extends keyof Api>(_target: never, p: Key, _receiver: never) {
			return (request: Api[Key]["request"]) => {
				const path = paths[p];
				const params = makeSearchParams(request);
				const pathString: string =
					path instanceof Function ? path(request) : path;
				const url = makeUrl(pathString, params);
				return httpFetch<Api[Key]["response"]>(url);
			};
		},
	},
) as ApiFactory;
