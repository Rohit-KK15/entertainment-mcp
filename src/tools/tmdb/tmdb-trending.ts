import dedent from "dedent";
import { z } from "zod";
import { TmdbService } from "../../services/tmdb-service.js";

/**
 * Zod schema for TMDB Trending tool parameters.
 */
const tmdbTrendingParams = z.object({
	mediaType: z
		.enum(["all", "movie", "tv"])
		.describe("The type of media to search for (all, movie, or tv)"),
	timeWindow: z
		.enum(["day", "week"])
		.describe("The time window to search for trending items (day or week)"),
});

type TmdbTrendingParams = z.infer<typeof tmdbTrendingParams>;

/**
 * TMDB Trending tool for MCP (Model Context Protocol) server.
 *
 * This tool retrieves trending movies or TV shows from the TMDB API
 * for a specified time window.
 */
export const tmdbTrendingTool = {
	name: "GET_TMDB_TRENDING",
	description: "Get a list of trending movies or TV shows from TMDB",
	parameters: tmdbTrendingParams,

	execute: async (params: TmdbTrendingParams) => {
		const tmdbService = new TmdbService();

		try {
			const results = await tmdbService.getTrending(
				params.mediaType,
				params.timeWindow,
			);

			if (!results.length) {
				return `No trending ${params.mediaType} found for the ${params.timeWindow}.`;
			}

			const formatted = results
				.map(
					(item, i) =>
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
                Top Trending ${params.mediaType === "all" ? "Content" : params.mediaType === "movie" ? "Movies" : "TV Shows"} for the ${params.timeWindow}:

                ${formatted}
            `;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("API key")) {
					return "Error: TMDB API key is not configured. Please set the TMDB_API_KEY environment variable.";
				}
				return `Error fetching trending TMDB data: ${error.message}`;
			}
			return "An unknown error occurred while fetching trending data from TMDB.";
		}
	},
} as const;
