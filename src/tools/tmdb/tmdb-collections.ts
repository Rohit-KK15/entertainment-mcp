import dedent from "dedent";
import { z } from "zod";
import { TmdbService } from "../../services/tmdb-service.js";

/**
 * Zod schema for GET_TMDB_SEARCH_COLLECTIONS tool parameters.
 */
const tmdbSearchCollectionsParams = z.object({
	query: z.string().describe("The name of the collection to search for."),
});

type TmdbSearchCollectionsParams = z.infer<typeof tmdbSearchCollectionsParams>;

/**
 * GET_TMDB_SEARCH_COLLECTIONS tool for MCP (Model Context Protocol) server.
 *
 * This tool searches for movie collections by name using the TMDB service.
 */
export const tmdbSearchCollectionsTool = {
	name: "GET_TMDB_SEARCH_COLLECTIONS",
	description: "Searches for movie collections by name using the TMDB service.",
	parameters: tmdbSearchCollectionsParams,

	execute: async (params: TmdbSearchCollectionsParams) => {
		const tmdbService = new TmdbService();

		try {
			const results = await tmdbService.searchCollections(params.query);

			if (!results.length) {
				return `No collections found matching "${params.query}".`;
			}

			const formatted = results
				.slice(0, 5) // Limit to top 5 results
				.map(
					(collection, i) => dedent`
                    ${i + 1}. Name: ${collection.name}
                       ID: ${collection.id}
                       Overview: ${collection.overview}
                       Poster: ${collection.posterUrl || "N/A"}
                `,
				)
				.join("\n\n");

			return dedent`
                Here are some collections found matching "${params.query}":

                ${formatted}
            `;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("API key")) {
					return "Error: API key is not configured. Please set the TMDB_API_KEY environment variable.";
				}
				return `Error searching for collections: ${error.message}`;
			}
			return "An unknown error occurred while searching for collections.";
		}
	},
} as const;

/**
 * Zod schema for GET_TMDB_COLLECTION_DETAILS tool parameters.
 */
const tmdbCollectionDetailsParams = z.object({
	collectionId: z
		.number()
		.describe("The ID of the collection to get details for."),
});

type TmdbCollectionDetailsParams = z.infer<typeof tmdbCollectionDetailsParams>;

/**
 * GET_TMDB_COLLECTION_DETAILS tool for MCP (Model Context Protocol) server.
 *
 * This tool fetches detailed information about a specific movie collection by its ID using the TMDB service.
 */
export const tmdbCollectionDetailsTool = {
	name: "GET_TMDB_COLLECTION_DETAILS",
	description:
		"Fetches detailed information about a specific movie collection by its ID using the TMDB service.",
	parameters: tmdbCollectionDetailsParams,

	execute: async (params: TmdbCollectionDetailsParams) => {
		const tmdbService = new TmdbService();

		try {
			const collection = await tmdbService.getCollectionDetails(
				params.collectionId,
			);

			if (!collection) {
				return `No collection found for ID ${params.collectionId}.`;
			}

			const formattedParts = collection.parts
				.map(
					(movie, i) => dedent`
                ${i + 1}. Title: ${movie.title} (${movie.releaseDate})
                   Rating: ${movie.rating}
                   Overview: ${movie.description}
                   Poster: ${movie.posterUrl || "N/A"}
            `,
				)
				.join("\n");

			return dedent`
                Here are the details for the collection "${collection.name}" (ID: ${collection.id}):

                Overview: ${collection.overview}
                Poster: ${collection.posterUrl || "N/A"}
                Backdrop: ${collection.backdropUrl || "N/A"}

                Movies in this collection:
                ${formattedParts || "No movies found in this collection."}
            `;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("API key")) {
					return "Error: API key is not configured. Please set the TMDB_API_KEY environment variable.";
				}
				return `Error fetching collection details: ${error.message}`;
			}
			return "An unknown error occurred while fetching collection details.";
		}
	},
} as const;
