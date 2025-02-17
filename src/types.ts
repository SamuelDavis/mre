type int = number;
type language = string & ("en" | "ko" | "ja");
type country = string & ("US" | "JP" | "KR");
export type path = "/${string}";
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

export namespace SearchTV {
	export type Request = {
		query: string;
		first_air_date_year?: int;
		include_adult?: boolean;
		language?: language;
		page?: int;
		year?: int;
	};

	export type Result = {
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
	};

	export type Response = Paginated<Result>;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function isErrorResponse(value: any): value is ErrorResponse {
	return (
		value &&
		typeof value === "object" &&
		"success" in value &&
		value.success === false
	);
}
