export default class ImageSource {
	public readonly base = "https://image.tmdb.org/t/p/";
	constructor(
		public readonly path: string,
		public readonly size = "w500",
	) {}

	toString(): string {
		return `${this.base}${this.size}${this.path}`;
	}
}
