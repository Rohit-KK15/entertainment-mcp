#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { tmdbTool } from "./tools/tmdb-details.js";
import { omdbTool } from "./tools/omdb-details.js";
import { tmdbTrendingTool } from "./tools/tmdb-trending.js";
import { tmdbPopularTool } from "./tools/tmdb-popular.js";
import { tmdbGenreTool } from "./tools/tmdb-genre.js";
import { entertainmentSuggestionsTool } from "./tools/tmdb-suggestions.js";

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
  server.addTool(tmdbTool);
  server.addTool(omdbTool);
  server.addTool(tmdbTrendingTool);
  server.addTool(tmdbPopularTool);
  server.addTool(tmdbGenreTool);
  server.addTool(entertainmentSuggestionsTool);

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