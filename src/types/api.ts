import { SpotifyToken } from "./Home"

export interface SpotifyAccessTokenResponse {
  access_token: string,
  token_type: SpotifyToken,
  expires_in: number
}

export interface SpotifyGenresResponse {
  genres: Array<string>
}

export interface SpotifyTracksResponse {
  tracks: {
    href: string,
    items: [],
    limit: number,
    next: string,
    offset: number,
    previous: string | null,
    total: number
  }
}

export interface SpotifyArtistsResponse {
  artists: {
    href: string,
    items: [],
    limit: number,
    next: string,
    offset: number,
    previous: string | null,
    total: number
  }
}

export interface SpotifyOptions {
  headers: {
    Authorization: string
  }
}

export interface SpotifyFetchParamsObject {
  token: {
    value: string,
    expiration: Date
  },
  endpoint: string,
  params?: {}
}