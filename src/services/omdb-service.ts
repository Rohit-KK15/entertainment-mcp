import { z } from "zod";
import { fetchJson } from "../lib/http.js";
import { config } from "../lib/config.js";

/**
 * OMDB API Response Schema
 */
const omdbMovieSchema = z.object({
  Title: z.string().optional(),
  Year: z.string().optional(),
  Rated: z.string().optional(),
  Released: z.string().optional(),
  Runtime: z.string().optional(),
  Genre: z.string().optional(),
  Director: z.string().optional(),
  Writer: z.string().optional(),
  Actors: z.string().optional(),
  Plot: z.string().optional(),
  Language: z.string().optional(),
  Country: z.string().optional(),
  Awards: z.string().optional(),
  Poster: z.string().optional(),
  Ratings: z
    .array(
      z.object({
        Source: z.string(),
        Value: z.string(),
      })
    )
    .optional(),
  Metascore: z.string().optional(),
  imdbRating: z.string().optional(),
  imdbVotes: z.string().optional(),
  imdbID: z.string().optional(),
  Type: z.string().optional(),
  Response: z.string(),
  Error: z.string().optional(),
});

export type OmdbApiResponse = z.infer<typeof omdbMovieSchema>;

/**
 * Normalized Interface
 */
export interface OmdbItem {
  title: string;
  year: string;
  rating: string;
  votes: string;
  metascore: string;
  released: string;
  genre: string;
  director: string;
  writer: string;
  actors: string;
  plot: string;
  posterUrl: string;
  country: string;
  language: string;
  type: string;
}

/**
 * OMDB Service
 */
export class OmdbService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private cache = new Map<string, OmdbItem>(); // in-memory cache

  constructor() {
    this.apiKey = config.omdbApi?.apiKey ?? "";
    this.baseUrl = config.omdbApi?.baseUrl ?? "https://www.omdbapi.com/";
  }

  private validateApiKey() {
    if (!this.apiKey) throw new Error("OMDB API key is not configured");
  }

  private normalize(data: OmdbApiResponse): OmdbItem {
    return {
      title: data.Title ?? "Unknown",
      year: data.Year ?? "Unknown",
      rating: data.imdbRating ?? "N/A",
      votes: data.imdbVotes ?? "N/A",
      metascore: data.Metascore ?? "N/A",
      released: data.Released ?? "Unknown",
      genre: data.Genre ?? "Unknown",
      director: data.Director ?? "Unknown",
      writer: data.Writer ?? "Unknown",
      actors: data.Actors ?? "Unknown",
      plot: data.Plot ?? "No plot available.",
      posterUrl: data.Poster && data.Poster !== "N/A" ? data.Poster : "",
      country: data.Country ?? "Unknown",
      language: data.Language ?? "Unknown",
      type: data.Type ?? "movie",
    };
  }
	async getByTitle(title: string, type?: "movie" | "series" | "tv"): Promise<OmdbItem | null> {
        this.validateApiKey();
      
        const cacheKey = `title:${type ?? "auto"}:${title.toLowerCase()}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;
      
        try {
          const url = new URL(this.baseUrl);
          url.searchParams.append("apikey", this.apiKey);
          url.searchParams.append("t", title);
          url.searchParams.append("plot", "full");
      
          // Add type only if specified
          if (type) url.searchParams.append("type", type);
      
          const data = await fetchJson(url.toString(), undefined, omdbMovieSchema);
      
          if (data.Response === "False") {
            // 🔁 Retry automatically with the other type if not found
            if (!type) {
              const altType = data.Error?.includes("Series") ? "series" : "movie";
              return this.getByTitle(title, altType as "movie" | "series");
            }
            return null;
          }
      
          const item = this.normalize(data);
          this.cache.set(cacheKey, item);
          return item;
        } catch (err) {
          console.error(`OMDB fetch failed for "${title}":`, err);
          return null;
        }
      }
      

	/**
	 * Fetch short IMDb summary (fast lightweight lookup)
	 */
	async getImdbSummary(title: string): Promise<{ imdbRating: string; imdbVotes: string }> {
        this.validateApiKey();
    
        const url = new URL(this.baseUrl);
        url.searchParams.append("apikey", this.apiKey);
        url.searchParams.append("t", title);
    
        try {
          const data = await fetchJson(url.toString(), undefined, omdbMovieSchema);
    
          if (data.Response === "False") {
            return { imdbRating: "N/A", imdbVotes: "N/A" };
          }
    
          return {
            imdbRating: data.imdbRating ?? "N/A",
            imdbVotes: data.imdbVotes ?? "N/A",
          };
        } catch (err) {
          console.error(`OMDB summary fetch failed for "${title}":`, err);
          return { imdbRating: "N/A", imdbVotes: "N/A" };
        }
      }
    
      /**
       * Fetch by IMDb ID
       */
      async getByImdbId(imdbId: string): Promise<OmdbItem | null> {
        this.validateApiKey();
    
        const cacheKey = `id:${imdbId}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;
    
        try {
          const url = new URL(this.baseUrl);
          url.searchParams.append("apikey", this.apiKey);
          url.searchParams.append("i", imdbId);
          url.searchParams.append("plot", "full");
    
          const data = await fetchJson(url.toString(), undefined, omdbMovieSchema);
    
          if (data.Response === "False") return null;
    
          const item = this.normalize(data);
          this.cache.set(cacheKey, item);
          return item;
        } catch (err) {
          console.error(`OMDB fetch failed for IMDb ID "${imdbId}":`, err);
          return null;
        }
      }
    }