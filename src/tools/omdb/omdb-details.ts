import dedent from "dedent";
import { z } from "zod";
import { OmdbService } from "../../services/omdb-service.js";

/**
 * Zod schema for OMDB tool parameters.
 * Validates that the query is a non-empty string and type is "movie" or "series" or "episode".
 */
const omdbToolParams = z.object({
	query: z
		.string()
		.min(1)
		.describe("The title of the movie, series, or episode to search for"),
	type: z
		.enum(["movie", "series", "episode"])
		.optional()
		.describe("Specify whether to search for a movie, series, or episode"),
});

type OmdbToolParams = z.infer<typeof omdbToolParams>;

/**
 * OMDB tool for MCP (Model Context Protocol) server.
 *
 * This tool retrieves movie, series, or episode information from the OMDB API
 * using the provided title. It returns structured, formatted data including
 * title, year, IMDb rating, plot, and poster link.
 */
export const omdbDetailsTool = {
	name: "GET_OMDB_INFO",
	description:
		" Get IMDB info and also Get detailed information about a movie, series, or episode from OMDB",
	parameters: omdbToolParams,

	execute: async (params: OmdbToolParams) => {
		const omdbService = new OmdbService();

		try {
			const result = await omdbService.getByTitle(params.query, params.type);

			if (!result) {
				return `No ${params.type || "content"} found for "${params.query}".`;
			}

			return dedent`
				Title: ${result.title} (${result.year})
				IMDb Rating: ${result.rating} (${result.votes} votes)
				Metascore: ${result.metascore}
				Released: ${result.released}
				Genre: ${result.genre}
				Director: ${result.director}
				Actors: ${result.actors}
				Plot: ${result.plot}
				Poster: ${result.posterUrl || "N/A"}
			`;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("API key")) {
					return "Error: OMDB API key is not configured. Please set the OMDB_API_KEY environment variable.";
				}
				return `Error fetching OMDB data: ${error.message}`;
			}
			return "An unknown error occurred while fetching data from OMDB.";
		}
	},
} as const;
