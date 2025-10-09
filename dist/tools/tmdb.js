import { z } from "zod";
import { TmdbService } from "../services/tmdb-service.js";
import dedent from "dedent";
/**
 * Zod schema for TMDB tool parameters.
 * Validates that the query is a non-empty string and type is "movie" or "tv".
 */
const tmdbToolParams = z.object({
    query: z.string().min(1).describe("The title of the movie or TV show to search for"),
    type: z.enum(["movie", "tv"]).describe("Specify whether to search for a movie or TV show"),
});
/**
 * TMDB tool for MCP (Model Context Protocol) server.
 *
 * This tool retrieves movie or TV show information from the TMDB API
 * using the provided title. It returns structured, formatted data including
 * title, release date, rating, overview, and poster link.
 */
export const tmdbTool = {
    name: "GET_TMDB_INFO",
    description: "Get detailed information about a movie or TV show from TMDB",
    parameters: tmdbToolParams,
    execute: async (params) => {
        const tmdbService = new TmdbService();
        try {
            let results = [];
            if (params.type === "movie") {
                results = await tmdbService.getMovieByTitle(params.query);
            }
            else {
                results = await tmdbService.getTvShowByTitle(params.query);
            }
            if (!results.length) {
                return `No ${params.type === "movie" ? "movies" : "TV shows"} found for "${params.query}".`;
            }
            const top = results.slice(0, 3); // limit to top 3 results for brevity
            const formatted = top
                .map((item, i) => dedent `
					${i + 1}. ${item.title} (${item.releaseDate})
					   ⭐ Rating: ${item.rating}
					   🗣️ Language: ${item.language.toUpperCase()}
					   📖 Overview: ${item.description}
					   🖼️ Poster: ${item.posterUrl || "N/A"}
				`)
                .join("\n\n");
            return dedent `
				Top ${params.type === "movie" ? "Movies" : "TV Shows"} for "${params.query}":
				
				${formatted}
			`;
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("API key")) {
                    return "Error: TMDB API key is not configured. Please set the TMDB_API_KEY environment variable.";
                }
                return `Error fetching TMDB data: ${error.message}`;
            }
            return "An unknown error occurred while fetching data from TMDB.";
        }
    },
};
//# sourceMappingURL=tmdb.js.map