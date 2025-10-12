import { z } from "zod";
import { TmdbService } from "../services/tmdb-service.js";
import dedent from "dedent";

/**
 * Zod schema for TMDB Popular tool parameters.
 */
const tmdbPopularParams = z.object({
    mediaType: z.enum(["movie", "tv"]).describe("The type of media to search for (movie or tv)"),
});

type TmdbPopularParams = z.infer<typeof tmdbPopularParams>;

/**
 * TMDB Popular tool for MCP (Model Context Protocol) server.
 *
 * This tool retrieves popular movies or TV shows from the TMDB API.
 */
export const tmdbPopularTool = {
    name: "GET_TMDB_POPULAR",
    description: "Get a list of popular movies or TV shows from TMDB",
    parameters: tmdbPopularParams,

    execute: async (params: TmdbPopularParams) => {
        const tmdbService = new TmdbService();

        try {
            const results = await tmdbService.getPopular(params.mediaType);

            if (!results.length) {
                return `No popular ${params.mediaType} found.`;
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
                Top Popular ${params.mediaType === "movie" ? "Movies" : "TV Shows"}:

                ${formatted}
            `;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("API key")) {
                    return "Error: TMDB API key is not configured. Please set the TMDB_API_KEY environment variable.";
                }
                return `Error fetching popular TMDB data: ${error.message}`;
            }
            return "An unknown error occurred while fetching popular data from TMDB.";
        }
    },
} as const;
