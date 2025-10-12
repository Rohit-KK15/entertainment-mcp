import { z } from "zod";
import { fetchJson } from "../lib/http.js";
import { config } from "../lib/config.js";

/**
 * TMDB movie response schema
 */
const tmdbMovieSchema = z.object({
	page: z.number(),
	results: z.array(
		z.object({
			id: z.number(),
			imdb_id: z.string().nullable().optional(),
			title: z.string(),
			overview: z.string().nullable(),
			release_date: z.string().nullable(),
			vote_average: z.number().nullable(),
			poster_path: z.string().nullable(),
			original_language: z.string().nullable(),
		}),
	),
	total_results: z.number(),
	total_pages: z.number(),
});

/**
 * TMDB movie details schema
 */
const tmdbMovieDetailsSchema = z.object({
    imdb_id: z.string().nullable().optional(),
});

/**
 * TMDB TV show response schema
 */
const tmdbTvSchema = z.object({
	page: z.number(),
	results: z.array(
		z.object({
			id: z.number(),
			imdb_id: z.string().nullable().optional(),
			name: z.string(),
			overview: z.string().nullable(),
			first_air_date: z.string().nullable(),
			vote_average: z.number().nullable(),
			poster_path: z.string().nullable(),
			original_language: z.string().nullable(),
		}),
	),
	total_results: z.number(),
	total_pages: z.number(),
});

/**
 * TMDB TV show details schema
 */
const tmdbTvDetailsSchema = z.object({
    external_ids: z.object({
        imdb_id: z.string().nullable().optional(),
    }).nullable().optional(),
});

type TmdbMovieResponse = z.infer<typeof tmdbMovieSchema>;
type TmdbTvResponse = z.infer<typeof tmdbTvSchema>;

/**
 * TMDB Trending Item Schema (Common for movies and TV shows)
 */
const tmdbTrendingItemSchema = z.object({
    id: z.number(),
    title: z.string().optional(), // For movies
    name: z.string().optional(), // For TV shows
    overview: z.string().nullable(),
    release_date: z.string().nullable().optional(), // For movies
    first_air_date: z.string().nullable().optional(), // For TV shows
    vote_average: z.number().nullable(),
    poster_path: z.string().nullable(),
    original_language: z.string().nullable(),
    media_type: z.enum(["movie", "tv", "person"]), // Indicate if it's a movie or TV show
});

/**
 * TMDB Trending Response Schema
 */
const tmdbTrendingResponseSchema = z.object({
    page: z.number(),
    results: z.array(tmdbTrendingItemSchema),
    total_pages: z.number(),
    total_results: z.number(),
});

type TmdbTrendingResponse = z.infer<typeof tmdbTrendingResponseSchema>;

/**
 * TMDB Popular Movie Response Schema
 */
const tmdbPopularMovieSchema = z.object({
    page: z.number(),
    results: z.array(z.object({
        id: z.number(),
        title: z.string(),
        overview: z.string().nullable(),
        release_date: z.string().nullable(),
        vote_average: z.number().nullable(),
        poster_path: z.string().nullable(),
        original_language: z.string().nullable(),
    })),
    total_results: z.number(),
    total_pages: z.number(),
});

/**
 * TMDB Popular TV Show Response Schema
 */
const tmdbPopularTvSchema = z.object({
    page: z.number(),
    results: z.array(z.object({
        id: z.number(),
        name: z.string(),
        overview: z.string().nullable(),
        first_air_date: z.string().nullable(),
        vote_average: z.number().nullable(),
        poster_path: z.string().nullable(),
        original_language: z.string().nullable(),
    })),
    total_results: z.number(),
    total_pages: z.number(),
});

type TmdbPopularMovieResponse = z.infer<typeof tmdbPopularMovieSchema>;
type TmdbPopularTvResponse = z.infer<typeof tmdbPopularTvSchema>;

/**
 * TMDB Genre List Item Schema
 */
const tmdbGenreSchema = z.object({
    id: z.number(),
    name: z.string(),
});

/**
 * TMDB Genre List Response Schema
 */
const tmdbGenreListResponseSchema = z.object({
    genres: z.array(tmdbGenreSchema),
});

type TmdbGenreListResponse = z.infer<typeof tmdbGenreListResponseSchema>;

/**
 * TMDB Discover Movie Response Schema (similar to tmdbMovieSchema but for discover endpoint)
 */
const tmdbDiscoverMovieSchema = z.object({
    page: z.number(),
    results: z.array(z.object({
        id: z.number(),
        title: z.string(),
        overview: z.string().nullable(),
        release_date: z.string().nullable(),
        vote_average: z.number().nullable(),
        poster_path: z.string().nullable(),
        original_language: z.string().nullable(),
    })),
    total_results: z.number(),
    total_pages: z.number(),
});

/**
 * TMDB Discover TV Response Schema (similar to tmdbTvSchema but for discover endpoint)
 */
const tmdbDiscoverTvSchema = z.object({
    page: z.number(),
    results: z.array(z.object({
        id: z.number(),
        name: z.string(),
        overview: z.string().nullable(),
        first_air_date: z.string().nullable(),
        vote_average: z.number().nullable(),
        poster_path: z.string().nullable(),
        original_language: z.string().nullable(),
    })),
    total_results: z.number(),
    total_pages: z.number(),
});

type TmdbDiscoverMovieResponse = z.infer<typeof tmdbDiscoverMovieSchema>;
type TmdbDiscoverTvResponse = z.infer<typeof tmdbDiscoverTvSchema>;

/**
 * Common data interface for movie or TV show
 */
export interface TmdbItem {
	id: number;
	imdbId: string | null | undefined;
	title: string;
	description: string;
	releaseDate: string;
	rating: number;
	posterUrl: string;
	language: string;
	type: "movie" | "tv";
}

/**
 * Service class for interacting with TMDB API.
 * Supports fetching both movies and TV shows.
 */
export class TmdbService {
	private readonly apiKey: string;
	private readonly baseUrl: string;

	constructor() {
		this.apiKey = config.tmdbApi.apiKey;
		this.baseUrl = config.tmdbApi.baseUrl;
	}

	/**
	 * Fetches movies by title.
	 */
	async getMovieByTitle(title: string): Promise<TmdbItem[]> {
		if (!this.apiKey) {
			throw new Error("TMDB API key is not configured");
		}

		const url = new URL(`${this.baseUrl}/search/movie`);
		url.searchParams.append("api_key", this.apiKey);
		url.searchParams.append("query", title);
		url.searchParams.append("language", "en-US");

		const data = await fetchJson<
			TmdbMovieResponse
		>(url.toString(), undefined, tmdbMovieSchema, 4, 1000);

		const moviesWithImdbId = await Promise.all(
			data.results.map(async (movie) => {
				const detailsUrl = new URL(`${this.baseUrl}/movie/${movie.id}`);
				detailsUrl.searchParams.append("api_key", this.apiKey);

				const movieDetails = await fetchJson<
					z.infer<typeof tmdbMovieDetailsSchema>
				>(detailsUrl.toString(), undefined, tmdbMovieDetailsSchema, 4, 1000);

				return { ...movie, imdb_id: movieDetails.imdb_id };
			}),
		);

		return moviesWithImdbId.map((movie) => ({
			id: movie.id,
			imdbId: movie.imdb_id ?? null,
			title: movie.title,
			description: movie.overview ?? "No description available.",
			releaseDate: movie.release_date ?? "Unknown",
			rating: movie.vote_average ?? 0,
			posterUrl: movie.poster_path
				? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
				: "",
			language: movie.original_language ?? "Unknown",
			type: "movie",
		}));
	}

	/**
	 * Fetches TV shows by title.
	 */
	async getTvShowByTitle(title: string): Promise<TmdbItem[]> {
		if (!this.apiKey) {
			throw new Error("TMDB API key is not configured");
		}

		const url = new URL(`${this.baseUrl}/search/tv`);
		url.searchParams.append("api_key", this.apiKey);
		url.searchParams.append("query", title);
		url.searchParams.append("language", "en-US");

		const data = await fetchJson<
			TmdbTvResponse
		>(url.toString(), undefined, tmdbTvSchema, 4, 1000);

		const tvShowsWithImdbId = await Promise.all(
			data.results.map(async (show) => {
				const detailsUrl = new URL(`${this.baseUrl}/tv/${show.id}`);
				detailsUrl.searchParams.append("api_key", this.apiKey);
				detailsUrl.searchParams.append("append_to_response", "external_ids");

				const tvDetails = await fetchJson<
					z.infer<typeof tmdbTvDetailsSchema>
				>(detailsUrl.toString(), undefined, tmdbTvDetailsSchema, 4, 1000);

				return { ...show, imdb_id: tvDetails.external_ids?.imdb_id };
			}),
		);

		return tvShowsWithImdbId.map((show) => ({
			id: show.id,
			imdbId: show.imdb_id ?? null,
			title: show.name,
			description: show.overview ?? "No description available.",
			releaseDate: show.first_air_date ?? "Unknown",
			rating: show.vote_average ?? 0,
			posterUrl: show.poster_path
				? `https://image.tmdb.org/t/p/w500${show.poster_path}`
				: "",
			language: show.original_language ?? "Unknown",
			type: "tv",
		}));
	}

	/**
	 * Fetches trending movies or TV shows.
	 */
	async getTrending(
		mediaType: "all" | "movie" | "tv" | "person",
		timeWindow: "day" | "week",
	): Promise<TmdbItem[]> {
		if (!this.apiKey) {
			throw new Error("TMDB API key is not configured");
		}

		const url = new URL(`${this.baseUrl}/trending/${mediaType}/${timeWindow}`);
		url.searchParams.append("api_key", this.apiKey);

		const data = await fetchJson<
			TmdbTrendingResponse
		>(url.toString(), undefined, tmdbTrendingResponseSchema, 4, 1000);

		const trendingItemsWithImdbId = await Promise.all(
			data.results.map(async (item) => {
				if (item.media_type === "movie") {
					const detailsUrl = new URL(`${this.baseUrl}/movie/${item.id}`);
					detailsUrl.searchParams.append("api_key", this.apiKey);
					const movieDetails = await fetchJson<
						z.infer<typeof tmdbMovieDetailsSchema>
					>(detailsUrl.toString(), undefined, tmdbMovieDetailsSchema, 4, 1000);
					return { ...item, imdb_id: movieDetails.imdb_id };
				} else if (item.media_type === "tv") {
					const detailsUrl = new URL(`${this.baseUrl}/tv/${item.id}`);
					detailsUrl.searchParams.append("api_key", this.apiKey);
					detailsUrl.searchParams.append("append_to_response", "external_ids");
					const tvDetails = await fetchJson<
						z.infer<typeof tmdbTvDetailsSchema>
					>(detailsUrl.toString(), undefined, tmdbTvDetailsSchema, 4, 1000);
					return { ...item, imdb_id: tvDetails.external_ids?.imdb_id };
				}
				return { ...item, imdb_id: undefined }; // For 'person' or other unsupported media_types
			}),
		);

		return trendingItemsWithImdbId.map((item) => ({
			id: item.id,
			imdbId: item.imdb_id ?? null,
			title: item.title ?? item.name ?? "Unknown",
			description: item.overview ?? "No description available.",
			releaseDate: item.release_date ?? item.first_air_date ?? "Unknown",
			rating: item.vote_average ?? 0,
			posterUrl: item.poster_path
				? `https://image.tmdb.org/t/p/w500${item.poster_path}`
				: "",
			language: item.original_language ?? "Unknown",
			type: item.media_type === "movie" ? "movie" : "tv", // Assuming only movie or tv for TmdbItem
		}));
	}

	/**
	 * Fetches popular movies or TV shows.
	 */
	async getPopular(mediaType: "movie" | "tv"): Promise<TmdbItem[]> {
		if (!this.apiKey) {
			throw new Error("TMDB API key is not configured");
		}

		const url = new URL(`${this.baseUrl}/${mediaType}/popular`);
		url.searchParams.append("api_key", this.apiKey);

		let data: TmdbPopularMovieResponse | TmdbPopularTvResponse;
		if (mediaType === "movie") {
			data = await fetchJson<
				TmdbPopularMovieResponse
			>(url.toString(), undefined, tmdbPopularMovieSchema, 4, 1000);
		} else {
			data = await fetchJson<
				TmdbPopularTvResponse
			>(url.toString(), undefined, tmdbPopularTvSchema, 4, 1000);
		}

		const popularItemsWithImdbId = await Promise.all(
			data.results.map(async (item) => {
				if (mediaType === "movie") {
					const detailsUrl = new URL(`${this.baseUrl}/movie/${item.id}`);
					detailsUrl.searchParams.append("api_key", this.apiKey);
					const movieDetails = await fetchJson<
						z.infer<typeof tmdbMovieDetailsSchema>
					>(detailsUrl.toString(), undefined, tmdbMovieDetailsSchema, 4, 1000);
					return { ...item, imdb_id: movieDetails.imdb_id };
				} else {
					const detailsUrl = new URL(`${this.baseUrl}/tv/${item.id}`);
					detailsUrl.searchParams.append("api_key", this.apiKey);
					detailsUrl.searchParams.append("append_to_response", "external_ids");
					const tvDetails = await fetchJson<
						z.infer<typeof tmdbTvDetailsSchema>
					>(detailsUrl.toString(), undefined, tmdbTvDetailsSchema, 4, 1000);
					return { ...item, imdb_id: tvDetails.external_ids?.imdb_id };
				}
			}),
		);

		return popularItemsWithImdbId.map((item) => ({
			id: item.id,
			imdbId: item.imdb_id ?? null,
			title: (item as any).title ?? (item as any).name ?? "Unknown",
			description: item.overview ?? "No description available.",
			releaseDate: (item as any).release_date ?? (item as any).first_air_date ?? "Unknown",
			rating: item.vote_average ?? 0,
			posterUrl: item.poster_path
				? `https://image.tmdb.org/t/p/w500${item.poster_path}`
				: "",
			language: item.original_language ?? "Unknown",
			type: mediaType,
		}));
	}

	/**
	 * Fetches a list of movie or TV show genres.
	 */
	async getGenres(mediaType: "movie" | "tv"): Promise<z.infer<typeof tmdbGenreSchema>[]> {
		if (!this.apiKey) {
			throw new Error("TMDB API key is not configured");
		}

		const url = new URL(`${this.baseUrl}/genre/${mediaType}/list`);
		url.searchParams.append("api_key", this.apiKey);

		const data = await fetchJson<
			TmdbGenreListResponse
		>(url.toString(), undefined, tmdbGenreListResponseSchema, 4, 1000);

		return data.genres;
	}

	/**
	 * Discovers movies or TV shows by genre.
	 */
	async discoverByGenre(
		mediaType: "movie" | "tv",
		genreId: number,
		releaseYear?: number, // Add this parameter
	): Promise<TmdbItem[]> {
		if (!this.apiKey) {
			throw new Error("TMDB API key is not configured");
		}

		const url = new URL(`${this.baseUrl}/discover/${mediaType}`);
		url.searchParams.append("api_key", this.apiKey);
		url.searchParams.append("with_genres", genreId.toString());
		url.searchParams.append("language", "en-US");

		if (releaseYear) {
			if (mediaType === "movie") {
				url.searchParams.append("primary_release_year", releaseYear.toString());
			} else {
				url.searchParams.append("first_air_date_year", releaseYear.toString());
			}
		}

		let data: TmdbDiscoverMovieResponse | TmdbDiscoverTvResponse;
		if (mediaType === "movie") {
			data = await fetchJson<
				TmdbDiscoverMovieResponse
			>(url.toString(), undefined, tmdbDiscoverMovieSchema, 4, 1000);
		} else {
			data = await fetchJson<
				TmdbDiscoverTvResponse
			>(url.toString(), undefined, tmdbDiscoverTvSchema, 4, 1000);
		}

		const discoveredItemsWithImdbId = await Promise.all(
			data.results.map(async (item) => {
				if (mediaType === "movie") {
					const detailsUrl = new URL(`${this.baseUrl}/movie/${item.id}`);
					detailsUrl.searchParams.append("api_key", this.apiKey);
					const movieDetails = await fetchJson<
						z.infer<typeof tmdbMovieDetailsSchema>
					>(detailsUrl.toString(), undefined, tmdbMovieDetailsSchema, 4, 1000);
					return { ...item, imdb_id: movieDetails.imdb_id };
				} else {
					const detailsUrl = new URL(`${this.baseUrl}/tv/${item.id}`);
					detailsUrl.searchParams.append("api_key", this.apiKey);
					detailsUrl.searchParams.append("append_to_response", "external_ids");
					const tvDetails = await fetchJson<
						z.infer<typeof tmdbTvDetailsSchema>
					>(detailsUrl.toString(), undefined, tmdbTvDetailsSchema, 4, 1000);
					return { ...item, imdb_id: tvDetails.external_ids?.imdb_id };
				}
			}),
		);

		return discoveredItemsWithImdbId.map((item) => ({
			id: item.id,
			imdbId: item.imdb_id ?? null,
			title: (item as any).title ?? (item as any).name ?? "Unknown",
			description: item.overview ?? "No description available.",
			releaseDate: (item as any).release_date ?? (item as any).first_air_date ?? "Unknown",
			rating: item.vote_average ?? 0,
			posterUrl: item.poster_path
				? `https://image.tmdb.org/t/p/w500${item.poster_path}`
				: "",
			language: item.original_language ?? "Unknown",
			type: mediaType,
		}));
	}
}