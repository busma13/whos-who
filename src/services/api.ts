import { SpotifyGenresResponse, SpotifyOptions, SpotifyFetchParamsObject, SpotifyTracksResponse, SpotifyArtistsResponse, SpotifyAccessTokenResponse } from '../types/api'
import toPairs from 'lodash/toPairs'
import 'whatwg-fetch'

const SPOTIFY_ROOT = 'https://api.spotify.com/v1'

/**
 * Parses the JSON returned by a network request
 *
 * @param  {Response} response A response from a network request
 *
 * @return {Prominse<SpotifyGenresResponse>} The parsed JSON from the request
 */
const parseJSON = (response: Response): Promise<any> => {
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
 * @return {Response|undefined} Returns either the response, or throws an error
 */

const checkStatus = (response: Response): Response | undefined => {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  const error = new Error(response.statusText, { cause: response})
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
export const request = async (url: string, options?: SpotifyOptions): Promise<SpotifyGenresResponse | SpotifyTracksResponse | SpotifyArtistsResponse | SpotifyAccessTokenResponse> => {
  // eslint-disable-next-line no-undef
  const response = await fetch(url, options)
  const response_1 = checkStatus(response)
  return parseJSON(response_1)
}

const fetchFromSpotify = ({ token, endpoint, params }: SpotifyFetchParamsObject) => {
  let url = [SPOTIFY_ROOT, endpoint].join('/')
  if (params) {
    const paramString = toPairs(params)
      .map(param => param.join('='))
      .join('&')
    url += `?${paramString}`
  }
  const options = { headers: { Authorization: `Bearer ${token}` } }
  return request(url, options)
}

export default fetchFromSpotify
