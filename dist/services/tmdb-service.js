import { z } from "zod";
import { fetchJson } from "../lib/http.js";
import { config } from "../lib/config.js";
/**
 * TMDB movie response schema
 */
const tmdbMovieSchema = z.object({
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
 * TMDB TV show response schema
 */
const tmdbTvSchema = z.object({
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
/**
 * Service class for interacting with TMDB API.
 * Supports fetching both movies and TV shows.
 */
export class TmdbService {
    apiKey;
    baseUrl;
    constructor() {
        this.apiKey = config.tmdbApi.apiKey;
        this.baseUrl = config.tmdbApi.baseUrl;
    }
    /**
     * Fetches movies by title.
     */
    async getMovieByTitle(title) {
        if (!this.apiKey) {
            throw new Error("TMDB API key is not configured");
        }
        const url = new URL(`${this.baseUrl}/search/movie`);
        url.searchParams.append("api_key", this.apiKey);
        url.searchParams.append("query", title);
        url.searchParams.append("language", "en-US");
        const data = await fetchJson(url.toString(), undefined, tmdbMovieSchema);
        return data.results.map((movie) => ({
            id: movie.id,
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
    async getTvShowByTitle(title) {
        if (!this.apiKey) {
            throw new Error("TMDB API key is not configured");
        }
        const url = new URL(`${this.baseUrl}/search/tv`);
        url.searchParams.append("api_key", this.apiKey);
        url.searchParams.append("query", title);
        url.searchParams.append("language", "en-US");
        const data = await fetchJson(url.toString(), undefined, tmdbTvSchema);
        return data.results.map((show) => ({
            id: show.id,
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
}
//# sourceMappingURL=tmdb-service.js.map