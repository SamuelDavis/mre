type int = number;
type language = string | ("en" | "ko" | "ja");
type country = string | ("US" | "JP" | "KR");
export type path = string | "/${string}";
type date =
	`${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export type ErrorResponse = {
	status_code: int;
	status_message: string;
	success: boolean;
};

type Paginated<T> = {
	page: number;
	total_pages: int;
	total_results: int;
	results: T[];
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function isErrorResponse(value: any): value is ErrorResponse {
	return (
		value &&
		typeof value === "object" &&
		"success" in value &&
		value.success === false
	);
}

export interface Api {
	searchTv: {
		request: {
			query: string;
			first_air_date_year?: int;
			include_adult?: boolean;
			language?: language;
			page?: int;
			year?: int;
		};
		response: Paginated<{
			adult: boolean;
			backdrop_path: string;
			genre_ids: int[];
			id: int;
			origin_country: country[];
			original_language: language[];
			original_name: string;
			overview: string | "";
			popularity: number;
			poster_path: path | null;
			first_air_date: date;
			name: string;
			vote_average: number;
			vote_count: int;
		}>;
	};
	tvGenres: {
		request: void;
		response: {
			genres: { id: int; name: string }[];
		};
	};
}

export type ApiFactory = {
	[Key in keyof Api]: (
		request: Api[Key]["request"],
	) => Promise<Api[Key]["response"]>;
};

export const paths: {
	[Key in keyof Api]: {
		path: path;
		defaults?: Partial<Api[Key]["request"]>;
	};
} = {
	searchTv: { path: "/search/tv" },
	tvGenres: { path: "/genre/tv/list" },
};
