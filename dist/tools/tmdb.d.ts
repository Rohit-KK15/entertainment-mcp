import { z } from "zod";
/**
 * Zod schema for TMDB tool parameters.
 * Validates that the query is a non-empty string and type is "movie" or "tv".
 */
declare const tmdbToolParams: z.ZodObject<{
    query: z.ZodString;
    type: z.ZodEnum<{
        movie: "movie";
        tv: "tv";
    }>;
}, z.core.$strip>;
type TmdbToolParams = z.infer<typeof tmdbToolParams>;
/**
 * TMDB tool for MCP (Model Context Protocol) server.
 *
 * This tool retrieves movie or TV show information from the TMDB API
 * using the provided title. It returns structured, formatted data including
 * title, release date, rating, overview, and poster link.
 */
export declare const tmdbTool: {
    readonly name: "GET_TMDB_INFO";
    readonly description: "Get detailed information about a movie or TV show from TMDB";
    readonly parameters: z.ZodObject<{
        query: z.ZodString;
        type: z.ZodEnum<{
            movie: "movie";
            tv: "tv";
        }>;
    }, z.core.$strip>;
    readonly execute: (params: TmdbToolParams) => Promise<string>;
};
export {};
