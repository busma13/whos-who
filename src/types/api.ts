export interface SpotifyGenresResponse {
  genres: Array<string>
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