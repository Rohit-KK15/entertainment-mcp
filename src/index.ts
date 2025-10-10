#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { tmdbTool } from "./tools/tmdb.js";

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
  console.log("🎬 Initializing TMDB MCP Server...");

  const server = new FastMCP({
    name: "TMDB MCP Server",
    version: "1.0.0",
  });

  // Register all TMDB tools
  server.addTool(tmdbTool);

  try {
    await server.start({
      transportType: "stdio",
    });

    console.log("✅ TMDB MCP Server started successfully over stdio.");
    console.log("   You can now connect to it using an MCP client.");
    console.log('   Try any TMDB tool, e.g., "GET_MOVIE" or "GET_TVSHOW"!');
  } catch (error) {
    console.error("❌ Failed to start TMDB MCP Server:", error);
    process.exit(1);
  }
}

// Start the MCP server
main().catch((error) => {
  console.error("❌ An unexpected error occurred in the TMDB MCP Server:", error);
  process.exit(1);
});
