/**
 * Configuration object for the MCP weather server.
 *
 * Centralizes all configuration values including API endpoints,
 * authentication keys, and default settings. Reads sensitive values
 * from environment variables for security.
 */
export const config = {
	tmdbApi: {
		baseUrl: "https://api.themoviedb.org/3",
		apiKey: process.env.TMDB_API_KEY || "",
	},
	omdbApi: {
		baseUrl: "https://www.omdbapi.com",
		apiKey: process.env.OMDB_API_KEY || "",
	},
};
