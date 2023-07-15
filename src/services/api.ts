import {
  SpotifyGenresResponse,
  SpotifyOptions,
  SpotifyFetchParamsObject,
  SpotifyTracksResponse,
  SpotifyArtistsResponse,
  SpotifyAccessTokenResponse,
} from "../types/api"
import toPairs from "lodash/toPairs"
import "whatwg-fetch"

const SPOTIFY_ROOT = "https://api.spotify.com/v1"

/**
 * Parses the JSON returned by a network request
 *
 * @param  {Response} response A response from a network request
 *
 * @return {Prominse<SpotifyGenresResponse>} The parsed JSON from the request
 */
const parseJSON = <T>(response: Response): Promise<T> | null => {
  if (response.status === 204 || response.status === 205) {
    return null
  }
  return response.json()
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {Response} response   A response from a network request
 *
 * @return {Response} Returns either the response, or throws an error
 */

const checkStatus = (response: Response): Response => {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  const error = new Error(response.statusText, { cause: response })
  throw error
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {SpotifyOptions} [options] The options we want to pass to "fetch"
 *
 * @return {Promise<any>}           The response data
 */
export const request = async <T>(
  url: string,
  options?: SpotifyOptions
): Promise<T | null> => {
  // eslint-disable-next-line no-undef
  const response = await fetch(url, options)
  const response_1 = checkStatus(response)
  console.log(response_1)
  return parseJSON<T>(response_1)
}

const fetchFromSpotify = <T>({
  token,
  endpoint,
  params,
}: SpotifyFetchParamsObject) => {
  let url = [SPOTIFY_ROOT, endpoint].join("/")
  if (params) {
    const paramString = toPairs(params)
      .map((param) => param.join("="))
      .join("&")
    url += `?${paramString}`
  }
  console.log(token)
  const options = { headers: { Authorization: `Bearer ${token.value}` } }
  console.log(options)
  return request<T>(url, options)
}

export default fetchFromSpotify
