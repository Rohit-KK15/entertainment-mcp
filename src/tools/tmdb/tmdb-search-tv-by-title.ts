import dedent from "dedent";
import { z } from "zod";
import { TmdbService } from "../../services/tmdb-service.js";

/**
 * Zod schema for GET_TMDB_SEARCH_TV_BY_TITLE tool parameters.
 */
const tmdbSearchTvByTitleParams = z.object({
	title: z.string().describe("The title of the TV show to search for."),
});

type TmdbSearchTvByTitleParams = z.infer<typeof tmdbSearchTvByTitleParams>;

/**
 * GET_TMDB_SEARCH_TV_BY_TITLE tool for MCP (Model Context Protocol) server.
 *
 * This tool searches for TV shows by title using the TMDB service.
 */
export const tmdbSearchTvByTitleTool = {
	name: "GET_TMDB_SEARCH_TV_BY_TITLE",
	description: "Searches for TV shows by title using the TMDB service.",
	parameters: tmdbSearchTvByTitleParams,

	execute: async (params: TmdbSearchTvByTitleParams) => {
		const tmdbService = new TmdbService();

		try {
			const results = await tmdbService.getTvShowByTitle(params.title);

			if (!results.length) {
				return `No TV shows found matching "${params.title}".`;
			}

			const formatted = results
				.slice(0, 5) // Limit to top 5 results
				.map(
					(tvShow, i) => dedent`
                    ${i + 1}. Title: ${tvShow.title} (${tvShow.releaseDate})
                       IMDB ID: ${tvShow.imdbId || "N/A"}
                       Rating: ${tvShow.rating}
                       Language: ${tvShow.language.toUpperCase()}
                       Overview: ${tvShow.description}
                       Poster: ${tvShow.posterUrl || "N/A"}
                `,
				)
				.join("\n\n");

			return dedent`
                Here are some TV shows found matching "${params.title}":

                ${formatted}
            `;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("API key")) {
					return "Error: API key is not configured. Please set the TMDB_API_KEY environment variable.";
				}
				return `Error searching for TV shows by title: ${error.message}`;
			}
			return "An unknown error occurred while searching for TV shows by title.";
		}
	},
} as const;
