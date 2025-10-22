import dedent from "dedent";
import { z } from "zod";
import { TmdbService } from "../../services/tmdb-service.js";

/**
 * Zod schema for GET_TMDB_PERSON_SEARCH tool parameters.
 */
const tmdbPersonSearchParams = z.object({
	query: z.string().describe("The name of the person (actor) to search for."),
});

type TmdbPersonSearchParams = z.infer<typeof tmdbPersonSearchParams>;

/**
 * GET_TMDB_PERSON_SEARCH tool for MCP (Model Context Protocol) server.
 *
 * This tool searches for people (actors) by name using the TMDB service.
 */
export const tmdbPersonSearchTool = {
	name: "GET_TMDB_PERSON_SEARCH",
	description: "Searches for people (actors) by name using the TMDB service.",
	parameters: tmdbPersonSearchParams,

	execute: async (params: TmdbPersonSearchParams) => {
		const tmdbService = new TmdbService();

		try {
			const results = await tmdbService.searchPerson(params.query);

			if (!results.length) {
				return `No people found matching "${params.query}".`;
			}

			const formatted = results
				.slice(0, 5) // Limit to top 5 suggestions
				.map(
					(person, i) => dedent`
                    ${i + 1}. Name: ${person.name}
                       ID: ${person.id}
                       Popularity: ${person.popularity}
                       Known For: ${person.knownFor}
                `,
				)
				.join("\n\n");

			return dedent`
                Here are some people found matching "${params.query}":

                ${formatted}
            `;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("API key")) {
					return "Error: API key is not configured. Please set the TMDB_API_KEY environment variable.";
				}
				return `Error searching for people: ${error.message}`;
			}
			return "An unknown error occurred while searching for people.";
		}
	},
} as const;
