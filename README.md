# Entertainment-MCP

A Model Context Protocol (MCP) server that enables AI assistants to interact with entertainment APIs.

## Overview

Entertainment-MCP provides the following functionalities:

- Retrieve movie, series, and episode information from OMDB.
- Search and get details about movie collections from TMDB.
- Get detailed information about movies and TV shows from TMDB.
- Discover movies and TV shows by actor from TMDB.
- Get movies and TV shows by genre from TMDB.
- Retrieve popular movies and TV shows from TMDB.
- Search for movies and TV shows by title from TMDB.
- Search for people (actors) from TMDB.
- Get trending movies and TV shows from TMDB.
- Get entertainment suggestions based on genre, release year, and minimum IMDb rating.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Tools Documentation](#tools-documentation)
  - [OMDB Tools](#omdb-tools)
  - [TMDB Tools](#tmdb-tools)
- [Development](#development)

## Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher)
- API Keys for OMDB and TMDB (obtainable from their respective websites)
  - OMDB API Key (OMDB_API_KEY)
  - TMDB API Key (TMDB_API_KEY)

## Installation

### Manual Installation

```bash
# Clone the repository
git clone <repository_url>
cd entertainment-mcp

# Install dependencies
npm install

# Compile TypeScript
npm run build
```

## Configuration

All configuration is handled via environment variables. The following options are available:

| Option           | Type   | Default | Description                               |
|------------------|--------|---------|-------------------------------------------|
| `OMDB_API_KEY`   | string | —       | **Required.** OMDB API key.               |
| `TMDB_API_KEY`   | string | —       | **Required.** TMDB API key.               |

You can set these options via environment variables:

```bash
OMDB_API_KEY=your_omdb_api_key
TMDB_API_KEY=your_tmdb_api_key
```

## Tools Documentation

### OMDB Tools

- `GET_OMDB_INFO`: Get detailed information about a movie, series, or episode from OMDB.
  - Parameters:
    - `query`: The title of the movie, series, or episode to search for (string, required).
    - `type`: Specify whether to search for a movie, series, or episode (enum: "movie", "series", "episode", optional).

### TMDB Tools

- `GET_TMDB_SEARCH_COLLECTIONS`: Searches for movie collections by name.
  - Parameters:
    - `query`: The name of the collection to search for (string, required).

- `GET_TMDB_COLLECTION_DETAILS`: Fetches detailed information about a specific movie collection by its ID.
  - Parameters:
    - `collectionId`: The ID of the collection to get details for (number, required).

- `GET_TMDB_INFO`: Get detailed information about a movie or TV show from TMDB.
  - Parameters:
    - `query`: The title of the movie or TV show to search for (string, required).
    - `type`: Specify whether to search for a movie or TV show (enum: "movie", "tv", required).

- `GET_TMDB_DISCOVER_BY_ACTOR`: Discovers movies or TV shows by an actor's ID.
  - Parameters:
    - `actorId`: The ID of the actor to discover entertainment for (number, required).
    - `mediaType`: The type of media to discover (enum: "movie", "tv", required).
    - `releaseYear`: The release year of the entertainment (number, optional).

- `GET_TMDB_BY_GENRE`: Get a list of movies or TV shows by genre from TMDB.
  - Parameters:
    - `mediaType`: The type of media to search for (enum: "movie", "tv", required).
    - `genre`: The name of the genre to search for (string, required).

- `GET_TMDB_POPULAR`: Get a list of popular movies or TV shows from TMDB.
  - Parameters:
    - `mediaType`: The type of media to search for (enum: "movie", "tv", required).

- `GET_TMDB_SEARCH_MOVIE_BY_TITLE`: Searches for movies by title using the TMDB service.
  - Parameters:
    - `title`: The title of the movie to search for (string, required).

- `GET_TMDB_PERSON_SEARCH`: Searches for people (actors) by name using the TMDB service.
  - Parameters:
    - `query`: The name of the person (actor) to search for (string, required).

- `GET_TMDB_SEARCH_TV_BY_TITLE`: Searches for TV shows by title using the TMDB service.
  - Parameters:
    - `title`: The title of the TV show to search for (string, required).

- `GET_ENTERTAINMENT_SUGGESTIONS`: Suggests entertainment based on genre, release year, and minimum IMDb rating.
  - Parameters:
    - `mediaType`: The type of media to suggest (enum: "movie", "tv", required).
    - `genre`: The genre of entertainment to suggest (string, required).
    - `releaseYear`: The release year of the entertainment (number, optional).
    - `minImdbRating`: Minimum IMDb rating (1-10) (number, optional).

- `GET_TMDB_TRENDING`: Get a list of trending movies or TV shows from TMDB.
  - Parameters:
    - `mediaType`: The type of media to search for (enum: "all", "movie", "tv", required).
    - `timeWindow`: The time window to search for trending items (enum: "day", "week", required).

## Development

```bash
# Development mode
pnpm run dev
```
