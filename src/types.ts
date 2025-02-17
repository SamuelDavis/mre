export type int = number;
export type language = string & ("en" | "ko" | "ja");
export type country = string & ("US" | "JP" | "KR");
export type path = "/${string}";

export type Paginated<T> = {
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
		overview: string;
		popularity: number;
		poster_path: path;
		first_air_date: string;
		name: string;
		vote_average: number;
		vote_count: int;
	};

	export type Response = Paginated<Result>;
}
