import { z } from "zod";
import { TmdbService } from "../../services/tmdb-service.js";
import dedent from "dedent";

/**
 * Zod schema for TMDB Genre tool parameters.
 */
const tmdbGenreParams = z.object({
    mediaType: z.enum(["movie", "tv"]).describe("The type of media to search for (movie or tv)"),
    genre: z.string().describe("The name of the genre to search for (e.g., 'Action', 'Comedy')"),
});

type TmdbGenreParams = z.infer<typeof tmdbGenreParams>;

/**
 * TMDB Genre tool for MCP (Model Context Protocol) server.
 *
 * This tool retrieves movies or TV shows by genre from the TMDB API.
 */
export const tmdbGenreTool = {
    name: "GET_TMDB_BY_GENRE",
    description: "Get a list of movies or TV shows by genre from TMDB",
    parameters: tmdbGenreParams,

    execute: async (params: TmdbGenreParams) => {
        const tmdbService = new TmdbService();

        try {
            const genres = await tmdbService.getGenres(params.mediaType);
            const selectedGenre = genres.find(
                (g) => g.name.toLowerCase() === params.genre.toLowerCase(),
            );

            if (!selectedGenre) {
                return `Genre "${params.genre}" not found for ${params.mediaType === "movie" ? "movies" : "TV shows"}.`;
            }

            const results = await tmdbService.discoverByGenre(
                params.mediaType,
                selectedGenre.id,
            );

            if (!results.length) {
                return `No ${params.mediaType === "movie" ? "movies" : "TV shows"} found for genre "${params.genre}".`;
            }

            const formatted = results
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
                Top ${params.mediaType === "movie" ? "Movies" : "TV Shows"} in genre "${params.genre}":

                ${formatted}
            `;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("API key")) {
                    return "Error: TMDB API key is not configured. Please set the TMDB_API_KEY environment variable.";
                }
                return `Error fetching TMDB data by genre: ${error.message}`;
            }
            return "An unknown error occurred while fetching data from TMDB by genre.";
        }
    },
} as const;
