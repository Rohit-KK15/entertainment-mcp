import dedent from "dedent";
import { z } from "zod";
import { TmdbService } from "../../services/tmdb-service.js";

/**
 * Zod schema for GET_TMDB_SEARCH_MOVIE_BY_TITLE tool parameters.
 */
const tmdbSearchMovieByTitleParams = z.object({
	title: z.string().describe("The title of the movie to search for."),
});

type TmdbSearchMovieByTitleParams = z.infer<
	typeof tmdbSearchMovieByTitleParams
>;

/**
 * GET_TMDB_SEARCH_MOVIE_BY_TITLE tool for MCP (Model Context Protocol) server.
 *
 * This tool searches for movies by title using the TMDB service.
 */
export const tmdbSearchMovieByTitleTool = {
	name: "GET_TMDB_SEARCH_MOVIE_BY_TITLE",
	description: "Searches for movies by title using the TMDB service.",
	parameters: tmdbSearchMovieByTitleParams,

	execute: async (params: TmdbSearchMovieByTitleParams) => {
		const tmdbService = new TmdbService();

		try {
			const results = await tmdbService.getMovieByTitle(params.title);

			if (!results.length) {
				return `No movies found matching "${params.title}".`;
			}

			const formatted = results
				.slice(0, 5) // Limit to top 5 results
				.map(
					(movie, i) => dedent`
                    ${i + 1}. Title: ${movie.title} (${movie.releaseDate})
                       IMDB ID: ${movie.imdbId || "N/A"}
                       Rating: ${movie.rating}
                       Language: ${movie.language.toUpperCase()}
                       Overview: ${movie.description}
                       Poster: ${movie.posterUrl || "N/A"}
                `,
				)
				.join("\n\n");

			return dedent`
                Here are some movies found matching "${params.title}":

                ${formatted}
            `;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("API key")) {
					return "Error: API key is not configured. Please set the TMDB_API_KEY environment variable.";
				}
				return `Error searching for movies by title: ${error.message}`;
			}
			return "An unknown error occurred while searching for movies by title.";
		}
	},
} as const;
