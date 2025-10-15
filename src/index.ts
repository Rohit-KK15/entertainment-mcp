#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { tmdbDetailsTool } from "./tools/tmdb/tmdb-details.js";
import { omdbDetailsTool } from "./tools/omdb/omdb-details.js";
import { tmdbTrendingTool } from "./tools/tmdb/tmdb-trending.js";
import { tmdbPopularTool } from "./tools/tmdb/tmdb-popular.js";
import { tmdbGenreTool } from "./tools/tmdb/tmdb-genre.js";
import { entertainmentSuggestionsTool } from "./tools/tmdb/tmdb-suggestions.js";
import { tmdbPersonSearchTool } from "./tools/tmdb/tmdb-search-person.js";
import { tmdbDiscoverByActorTool } from "./tools/tmdb/tmdb-discover-by-actor.js";
import { tmdbSearchMovieByTitleTool } from "./tools/tmdb/tmdb-search-movie-by-title.js";
import { tmdbSearchTvByTitleTool } from "./tools/tmdb/tmdb-search-tv-by-title.js";
import { tmdbSearchCollectionsTool, tmdbCollectionDetailsTool } from "./tools/tmdb/tmdb-collections.js";

/**
 * Initializes and starts the TMDB MCP (Model Context Protocol) Server.
 *
 * This server provides access to TMDB (The Movie Database) tools for fetching
 * detailed information about movies and TV shows.
 *
 * It uses FastMCP with stdio transport for integration with MCP-compatible clients
 * or AI agents (like OpenAI MCP interface).
 */
async function main() {
  const server = new FastMCP({
    name: "TMDB MCP Server",
    version: "1.0.0",
  });

  // Register all TMDB tools
  server.addTool(tmdbDetailsTool);
  server.addTool(omdbDetailsTool);
  server.addTool(tmdbTrendingTool);
  server.addTool(tmdbPopularTool);
  server.addTool(tmdbGenreTool);
  server.addTool(entertainmentSuggestionsTool);
  // server.addTool(omdbByTitleTool);
  // server.addTool(omdbImdbSummaryTool);
  server.addTool(tmdbPersonSearchTool);
  server.addTool(tmdbDiscoverByActorTool);
  server.addTool(tmdbSearchMovieByTitleTool);
  server.addTool(tmdbSearchTvByTitleTool);
  server.addTool(tmdbSearchCollectionsTool);
  server.addTool(tmdbCollectionDetailsTool);

  try {
    await server.start({
      transportType: "stdio",
    });
  } catch (error) {
    throw error;
  }
}

// Start the MCP server
main().catch((error) => {
  throw error;
});