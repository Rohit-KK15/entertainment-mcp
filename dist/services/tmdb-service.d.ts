/**
 * Common data interface for movie or TV show
 */
export interface TmdbItem {
    id: number;
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
export declare class TmdbService {
    private readonly apiKey;
    private readonly baseUrl;
    constructor();
    /**
     * Fetches movies by title.
     */
    getMovieByTitle(title: string): Promise<TmdbItem[]>;
    /**
     * Fetches TV shows by title.
     */
    getTvShowByTitle(title: string): Promise<TmdbItem[]>;
}
