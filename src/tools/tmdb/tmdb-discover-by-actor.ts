import dedent from "dedent";
import { z } from "zod";
import { TmdbService } from "../../services/tmdb-service.js";

/**
 * Zod schema for GET_TMDB_DISCOVER_BY_ACTOR tool parameters.
 */
const tmdbDiscoverByActorParams = z.object({
	actorId: z
		.number()
		.describe(
			"The ID of the actor to discover entertainment for. Use GET_TMDB_PERSON_SEARCH to find the actor ID.",
		),
	mediaType: z
		.enum(["movie", "tv"])
		.describe("The type of media to discover (movie or tv)."),
	releaseYear: z
		.number()
		.optional()
		.describe("The release year of the entertainment (e.g., 2023)."),
});

type TmdbDiscoverByActorParams = z.infer<typeof tmdbDiscoverByActorParams>;

/**
 * GET_TMDB_DISCOVER_BY_ACTOR tool for MCP (Model Context Protocol) server.
 *
 * This tool discovers movies or TV shows by an actor's ID using the TMDB service.
 */
export const tmdbDiscoverByActorTool = {
	name: "GET_TMDB_DISCOVER_BY_ACTOR",
	description:
		"Discovers movies or TV shows by an actor's ID using the TMDB service.",
	parameters: tmdbDiscoverByActorParams,

	execute: async (params: TmdbDiscoverByActorParams) => {
		const tmdbService = new TmdbService();

		try {
			const results = await tmdbService.discoverByActor(
				params.actorId,
				params.mediaType,
				params.releaseYear,
			);

			if (!results.length) {
				return `No ${params.mediaType}s found for actor ID ${params.actorId}${params.releaseYear ? ` in ${params.releaseYear}` : ""}.`;
			}

			const formatted = results
				.slice(0, 5) // Limit to top 5 suggestions
				.map(
					(item, i) => dedent`
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
                Here are some suggested ${params.mediaType}s starring the actor (ID: ${params.actorId}):

                ${formatted}
            `;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("API key")) {
					return "Error: API key is not configured. Please set the TMDB_API_KEY environment variable.";
				}
				return `Error discovering entertainment by actor: ${error.message}`;
			}
			return "An unknown error occurred while discovering entertainment by actor.";
		}
	},
} as const;
