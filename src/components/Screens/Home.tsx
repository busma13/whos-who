import React, { useEffect, useState } from "react"
import fetchFromSpotify, { request } from "../../services/api"
import styled from "styled-components"
import { useHistory } from "react-router-dom"

import Button from "../Button"
import Background from "../Background"
import Content from "../Content"
import { SpotifyToken, Track, Artist, ArtistGuessData } from "../../types/Home"
import {
  SpotifyAccessTokenResponse,
  SpotifyArtistsResponse,
  SpotifyGenresResponse,
  SpotifyTracksResponse,
} from "../../types/api"

const AUTH_ENDPOINT =
  "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token"
const TOKEN_KEY = "whos-who-access-token"

const HomeContainer = styled.div`
  font-size: 2rem;
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  @media only screen and (max-width: 1000px) {
    width: 70%;
  }
  @media only screen and (max-width: 720px) {
    width: 80%;
  }
  @media only screen and (max-width: 520px) {
    width: 90%;
    margin-top: 20%;
  }
`

const GameConfig = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  * {
    margin-right: 10px;
    margin-left: 10px;
  }
`

const GameConfigItem = styled.div<{ jc?: string }>`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: ${({ jc = "space-between" }) => jc};
  padding: 10px 10px 10px 10px;
  @media only screen and (max-width: 520px) {
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    & input,
    select {
      margin-top: 12px;
    }
  }
`

const Select = styled.select`
  border-radius: 7px;
  font-size: 0.7em;
  & option {
    padding-left: 10px;
  }
`

const Input = styled.input`
  border-radius: 7px;
  font-size: 0.8em;
  max-width: 35px;
`

const Home = () => {
  //Using history to conditionally redirect to Game if all validations pass
  const history = useHistory()
  const [guessDataComplete, setGuessDataComplete] = useState([])

  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState(() => {
    //function to get state from local storage if available
    const localGenre = JSON.parse(localStorage.getItem("SELECTED_GENRE"))
    return localGenre || ""
  })
  //Added two states to capture number of Songs and Artists config
  const [numSongs, setNumSongs] = useState(() => {
    //function to get state from local storage if available

    const localNumSongs = JSON.parse(localStorage.getItem("NUM_SONGS"))
    return localNumSongs || 1
  })
  const [numArtists, setNumArtists] = useState(() => {
    //function to get state from local storage if available
    const localNumArtists = JSON.parse(localStorage.getItem("NUM_ARTISTS"))
    return localNumArtists || 2
  })

  const [authLoading, setAuthLoading] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)
  const [token, setToken] = useState(null)

  // save config to local storage
  useEffect(() => {
    localStorage.setItem("SELECTED_GENRE", JSON.stringify(selectedGenre))
    localStorage.setItem("NUM_SONGS", JSON.stringify(numSongs))
    localStorage.setItem("NUM_ARTISTS", JSON.stringify(numArtists))
  }, [selectedGenre, numArtists, numSongs])

  const loadGenres = async (t: SpotifyToken) => {
    setConfigLoading(true)
    const response = await fetchFromSpotify<SpotifyGenresResponse>({
      token: t,
      endpoint: "recommendations/available-genre-seeds",
    })
    console.log(response)
    const emptyGenres = ['bossanova', 'disney', 'holidays', 'metal-misc', 'movies', 'mpb', 'new-release', 'philippines-opm', 'post-dubstep', 'rainy-day', 'road-trip', 'rockabilly', 'soundtracks', 'summer', 'work-out', 'world-music']
    setGenres(response.genres.filter((genre) => !emptyGenres.includes(genre)))
    setConfigLoading(false)
  }

  const validateConfig = () => {
    if (!selectedGenre) {
      alert("Choose a genre!")
      return false
    }
    return true
  }
  const fetchGameData = async (t: SpotifyToken) => {
    if (validateConfig()) {
      //Fetch tracks by genre
      let chunkOfTracks: Track[] = await fetchTracksByGenre(t)
      let fetchTracksAttemptsCounter = 0
      while (chunkOfTracks.length < numSongs * numArtists && fetchTracksAttemptsCounter < 3) {
        chunkOfTracks = await fetchTracksByGenre(t)
        fetchTracksAttemptsCounter++
      }
      //Select tracks to guess
      let tracksForGuessing = chunkOfTracks.splice(0, numSongs)
      console.log(tracksForGuessing)

      //fetch artists by genre
      let artistsForGuessing: ArtistGuessData[] = chunkOfTracks.map(
        (track) => ({
          artist: track.artists[0],
          image: track.album.images[0],
        })
      )
      console.log(artistsForGuessing)

      //using the tracks and artists build the guessing game data
      buildGuessData(tracksForGuessing, artistsForGuessing)
    }
  }

  const fetchTracksByGenre = async (t: SpotifyToken) => {
    //Fetching 50 to allow some randomization of tracks
    let randomizedTracks: Track[] = []
    const offset = Math.floor(Math.random() * 200)
    const endpoint = `search?q=genre:"${selectedGenre}"&type=track&market=US&limit=50&offset=${offset}`
    const response = await fetchFromSpotify<SpotifyTracksResponse>({
      token: t,
      endpoint: endpoint,
    })

    console.log(response)
    const tracks: Track[] = response.tracks.items
    const seenArtists = new Set()
    const tracksWithPreviewAndNoDuplicateArtists = tracks.slice().filter((track) => {
      if (track.preview_url === null) {
        return false
      }
      const duplicate = seenArtists.has(track.artists[0].name)
      seenArtists.add(track.artists[0].name)
      return !duplicate
    })
    console.log("valid tracks: ", tracksWithPreviewAndNoDuplicateArtists)

    const popularTracks = tracksWithPreviewAndNoDuplicateArtists.slice().filter(track => track.popularity >= 50)
    console.log("popular tracks: ", popularTracks)

    if (popularTracks.length >= numArtists * numSongs) {
      randomizedTracks = popularTracks.sort(
        () => 0.5 - Math.random()
      )
    } else if (tracksWithPreviewAndNoDuplicateArtists.length >= numArtists * numSongs) {
      randomizedTracks = tracksWithPreviewAndNoDuplicateArtists.sort(
        () => 0.5 - Math.random()
      )
    }
    console.log("Randomized tracks: ", randomizedTracks)
    return randomizedTracks
  }

  const buildGuessData = async (
    tracksForGuessing: Track[],
    artistsForGuessing: ArtistGuessData[]
  ) => {
    let artistChoicesArr = artistsForGuessing.map((artistGuessData) => {
      let imgUrl = artistGuessData.image
        ? artistGuessData.image.url
        : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
      return {
        key: artistGuessData.artist.name,
        name: artistGuessData.artist.name,
        imgUrl: imgUrl,
      }
    }) // create an array of artist names from artistsForGuessing

    //for each track build a new newGuessData object with track name, preview_url, artist name and an array of choice options
    const guessDataBuild = tracksForGuessing.reduce((acc, guessData) => {
      //Randomize artists for choices
      const shuffledArtistChoicesArr = artistChoicesArr.sort(
        () => 0.5 - Math.random()
      )
      // Pick random artist choice from the shuffledChoices based on numArtist minus 1 (for the correct choice)
      const pickedArtistChoices = shuffledArtistChoicesArr.slice(
        0,
        numArtists - 1
      )

      //Insert correct artist choice
      pickedArtistChoices.push({
        key: guessData.artists[0].name,
        name: guessData.artists[0].name,
        imgUrl: guessData.album.images[0].url,
      })
      console.log("pickedArtistChoices")
      console.log(pickedArtistChoices)
      const shuffledPickedArtistChoices = pickedArtistChoices.sort(
        () => 0.5 - Math.random()
      )

      const newGuessData = {
        key: guessData.name,
        name: guessData.name,
        preview_url: guessData.preview_url,
        artist: guessData.artists[0].name, //picking the first artist in case there are multiple ones
        choices: shuffledPickedArtistChoices,
      }

      return [...acc, newGuessData] // Append newGuessData to accumulator array
    }, [])

    setGuessDataComplete(guessDataBuild)
  }

  //Pass control to Game component only after guessDataComplete is populated
  useEffect(() => {
    if (guessDataComplete.length > 0) {
      console.log("Guess Data Complete: " + guessDataComplete)
      history.push("/Game", { guessDataComplete })
    }
  }, [guessDataComplete, history])

  useEffect(() => {
    setAuthLoading(true)

    const storedTokenString: string = localStorage.getItem(TOKEN_KEY)
    if (storedTokenString) {
      const storedToken: SpotifyToken = JSON.parse(storedTokenString)
      if (storedToken.expiration > Date.now()) {
        console.log("Token found in localstorage")
        setAuthLoading(false)
        setToken(storedToken)
        loadGenres(storedToken)
        return
      }
    }
    console.log("Sending request to AWS endpoint")
    const resp = request<SpotifyAccessTokenResponse>(AUTH_ENDPOINT)
    console.log(resp)
    resp.then(({ access_token, expires_in }) => {
      const newToken: SpotifyToken = {
        value: access_token,
        expiration: Date.now() + (expires_in - 20) * 1000,
      }
      localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken))
      setAuthLoading(false)
      setToken(newToken)
      loadGenres(newToken)
    })
  }, [])

  if (authLoading || configLoading) {
    return (
      <Background>
        <HomeContainer>Loading...</HomeContainer>
      </Background>
    )
  }

  return (
    <>
      <Background />
      <Content>
        <HomeContainer>
          <h1>Who's Who</h1>
          <GameConfig>
            <GameConfigItem>
              Genre:
              <Select
                value={selectedGenre}
                onChange={(event) => setSelectedGenre(event.target.value)}
              >
                <option value=''>Select Genre</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </Select>
            </GameConfigItem>
            <GameConfigItem>
              # of Songs in Game
              <Input
                type='number'
                min='1'
                max='3'
                inputMode='numeric'
                value={numSongs}
                onChange={(event) => {
                  const inputVal = event.target.value
                  // Use regular expression to remove any non-numeric characters
                  const numericVal = event.target.value
                    .replace(/[^1-3]?/, "")
                    .substr(0, 1)
                  setNumSongs(numericVal)
                }}
              />
            </GameConfigItem>
            <GameConfigItem>
              # of Artists in Choice
              <Input
                type='number'
                min='2'
                max='4'
                inputMode='numeric'
                value={numArtists}
                onChange={(event) => {
                  const inputVal = event.target.value
                  // Use regular expression to remove any non-numeric characters
                  const numericVal = event.target.value
                    .replace(/[^2-4]/g, "")
                    .substr(0, 1)
                  setNumArtists(numericVal)
                }}
              />
            </GameConfigItem>
            <GameConfigItem jc={"center"}>
              {/* <Link to="/Game"> */}
              <Button
                width={"80%"}
                value='Start'
                onClick={() => {
                  console.log("Button clicked")
                  console.log("Genre: " + selectedGenre)
                  console.log("Num Songs: " + numSongs)
                  console.log("Num Artists: " + numArtists)

                  fetchGameData(token)
                  //Fetch x songs based on genre
                  //For each song build array of artists - 1 correct + n-1 random
                }}
              >
                Start
              </Button>
              {/* </Link> */}
            </GameConfigItem>
          </GameConfig>
        </HomeContainer>
      </Content>
    </>
  )
}

export default Home
