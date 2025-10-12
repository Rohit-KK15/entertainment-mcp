import { z } from "zod";
import { TmdbService } from "../services/tmdb-service.js";
import { OmdbService } from "../services/omdb-service.js";
import dedent from "dedent";

/**
 * Zod schema for GET_ENTERTAINMENT_SUGGESTIONS tool parameters.
 */
const entertainmentSuggestionsParams = z.object({
    mediaType: z.enum(["movie", "tv"]).describe("The type of media to suggest (movie or tv)"),
    genre: z.string().describe("The genre of entertainment to suggest (e.g., 'Horror', 'Action')"),
    releaseYear: z.number().optional().describe("The release year of the entertainment (e.g., 2023)"),
    minImdbRating: z.number().min(1).max(10).optional().describe("Minimum IMDb rating (1-10)"),
});

type EntertainmentSuggestionsParams = z.infer<typeof entertainmentSuggestionsParams>;

/**
 * GET_ENTERTAINMENT_SUGGESTIONS tool for MCP (Model Context Protocol) server.
 *
 * This tool suggests entertainment based on genre, release year, and minimum IMDb rating.
 */
export const entertainmentSuggestionsTool = {
    name: "GET_ENTERTAINMENT_SUGGESTIONS",
    description: "Suggests entertainment based on genre, release year, and minimum IMDb rating",
    parameters: entertainmentSuggestionsParams,

    execute: async (params: EntertainmentSuggestionsParams) => {
        const tmdbService = new TmdbService();
        const omdbService = new OmdbService();

        try {
            // 1. Get genre ID from TMDB
            const genres = await tmdbService.getGenres(params.mediaType);
            const selectedGenre = genres.find(
                (g) => g.name.toLowerCase() === params.genre.toLowerCase(),
            );

            if (!selectedGenre) {
                return `Genre "${params.genre}" not found for ${params.mediaType}.`;
            }

            // 2. Discover movies by genre and release year from TMDB
            let tmdbMovies = await tmdbService.discoverByGenre(
                params.mediaType,
                selectedGenre.id,
                params.releaseYear,
            );

            if (!tmdbMovies.length) {
                return `No ${params.mediaType}s found for genre "${params.genre}"${params.releaseYear ? ` in ${params.releaseYear}` : ""}.`;
            }

            // 3. Filter by IMDb rating using OMDB
            const suggestedMovies = [];
            for (const movie of tmdbMovies) {
                if (movie.imdbId) {
                    const omdbDetails = await omdbService.getByImdbId(movie.imdbId);
                    if (omdbDetails && parseFloat(omdbDetails.rating) >= (params.minImdbRating ?? 0)) {
                        suggestedMovies.push(movie);
                    }
                }
            }

            if (!suggestedMovies.length) {
                return `No ${params.mediaType}s found matching the criteria (genre: "${params.genre}"${params.releaseYear ? `, year: ${params.releaseYear}` : ""}${params.minImdbRating ? `, min IMDb rating: ${params.minImdbRating}` : ""}).`;
            }

            const formatted = suggestedMovies.slice(0, 5) // Limit to top 5 suggestions
                .map((item, i) =>
                    dedent`
                    ${i + 1}. ${item.title} (${item.releaseDate})
                       🎬 IMDB ID: ${item.imdbId || "N/A"}
                       ⭐ Rating: ${item.rating}
                       🗣️ Language: ${item.language.toUpperCase()}
                       📖 Overview: ${item.description}
                       🖼️ Poster: ${item.posterUrl || "N/A"}
                `,
                )
                .join("\n\n");

            return dedent`
                Here are some suggested ${params.mediaType}s:

                ${formatted}
            `;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("API key")) {
                    return "Error: API key is not configured. Please set the TMDB_API_KEY and OMDB_API_KEY environment variables.";
                }
                return `Error fetching ${params.mediaType} suggestions: ${error.message}`;
            }
            return "An unknown error occurred while fetching entertainment suggestions.";
        }
    },
} as const;
