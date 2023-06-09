import React, { useEffect, useState } from "react"
import { Link, useHistory } from "react-router-dom"
import styled, { keyframes } from "styled-components"
import { Keyframes } from "styled-components"
import { Howl, Howler } from "howler"
import Background from "../Background.jsx"
import Content from "../Content.jsx"
import Button from "../Button"
import blueStop from "../../images/stop-blue.png"
import pinkStop from "../../images/stop-pink.png"
import bluePlay from "../../images/play-blue.png"
import pinkPlay from "../../images/play-pink.png"

const StyledGame = styled.div`
  color: #fff;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 30px;
  width: 70%;
  & span {
    margin: 10px 0;
  }
  @media only screen and (max-width: 1000px) {
    width: 70%;
  }
  @media only screen and (max-width: 720px) {
    width: 80%;
  }
  @media only screen and (max-width: 520px) {
    width: 90%;
    margin-top: 5%;
    justify-content: flex-start;
    padding: 10px;
  }
`

const blink = keyframes`
    0% { background: url(${bluePlay}) center no-repeat }
    50% { background: url(${pinkPlay}) center no-repeat; transform: translateX(1px) }
    100% { background: url(${bluePlay}) center no-repeat; transform: translateX(-1px) }
`

const PlayButton = styled.div`
  min-width: 40px;
  height: 40px;
  text-align: center;
  animation: ${blink} 0.9s ease-in-out 2 ${({ playState }) => playState};
  background: url(${({ bg }) => bg}) center no-repeat;
  background-size: contain;
  border-radius: 50%;
  cursor: pointer;
  line-height: 1.8;
  &:hover {
    box-shadow: inset 0px 0px 0px 3px #1f1b56;
  }
`

const Song = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  border: 3px solid #fff;
  border-radius: 7px;
  padding: 10px;
  margin: 20px;
  & * {
    margin: 0 10px;
  }
  @media only screen and (max-width: 520px) {
    margin: 10px;
  }
`

const ArtistContainer = styled.div`
  width: 80%;
  display: flex;
  justify-content: space-around;
  margin: 40px;
  @media only screen and (max-width: 600px) {
    width: 100%;
    flex-wrap: wrap;
    justify-content: space-evenly;
    margin: 5%;
  }
`

const InfoContainer = styled.div`
  display: flex;
  align-items: center;
`

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
`

const AnswerSpan = styled.span`
  display: inline-block;
  white-space: pre;
`

const Artist = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  height: 230px;
  width: 200px;
  display: flex;
  flex-direction: column;
  border: 3px solid #fff;
  border-radius: 7px;
  margin: 5px;
  cursor: pointer;
  & span {
    width: 100%;
    min-height: 40px;
    text-align: center;
  }
  &.selected-choice {
    border-color: #f00d0d;
  }
  @media only screen and (max-width: 1000px) {
    height: 170px;
  }
  @media only screen and (max-width: 600px) {
    width: 45%;
  }
  @media only screen and (max-width: 400px) {
    width: 40%;
  }
`

const ImgContainer = styled.div`
  width: 95%;
  height: 77%;
  margin-top: 10px;
  background: url(${({ image }) => image}) center no-repeat;
  background-size: contain;
`

const FinalScore = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 40%;
  margin: 20px;
  border: 3px solid #fff;
  border-radius: 7px;
  & span {
    margin: 5px;
  }
  @media only screen and (max-width: 520px) {
    width: auto;
    & span {
      text-align: center;
    }
  }
`

const Game = (props) => {
  const history = useHistory()
  const [gameRound, setGameRound] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isIncorrect, setIsIncorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [showFinalScore, setShowFinalScore] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState(null)
  const [showNextAction, setShowNextAction] = useState(false)
  const [nextAction, setNextAction] = useState(
    props.location.state.guessDataComplete.length > 1 ? "Next Song" : "Results"
  )
  const [choiceSubmitted, setChoiceSubmitted] = useState(false)
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [animationKey, setAnimationKey] = useState(Math.random())
  const guessData = props.location.state.guessDataComplete

  // toggles the song play or pause and the IsPlaying state
  const toggleSong = (currentSong) => {
    if (currentSong?.playing()) {
      currentSong.pause()
      setIsPlaying(false)
    } else {
      currentSong.play()
      setIsPlaying(true)
    }
  }

  const playOrPauseSong = () => {
    //if song exists
    if (currentSong) {
      toggleSong(currentSong)
    } else {
      //if song not exists
      const newSong = new Howl({
        src: [guessData[gameRound].preview_url],
        html5: true,
        autoplay: true,
      })
      setCurrentSong(newSong)
      toggleSong(newSong)
    }
  }

  const handleNextRound = () => {
    //Reset clicked indices
    // setClickedIndices([])
    console.log(selectedChoice)
    selectedChoice.classList.remove('selected-choice')
    setSelectedChoice(null)
    setChoiceSubmitted(false)
    //Stop playing the song if next button is clicked
    if (currentSong) {
      currentSong.stop()
    }
    setCurrentSong(null)
    setIsPlaying(false)
    setShowNextAction(false)
    setIsCorrect(false)
    setIsIncorrect(false)

    //Checking to see when the next button is to be disabled
    if (gameRound === guessData.length - 1) {
      setShowFinalScore(true)
    } else if (gameRound === guessData.length - 2) {
      setNextAction("Results")
      setGameRound(gameRound + 1)
    } else {
      //else increment gameRound to get next Song and Choices
      setGameRound(gameRound + 1)
    }
  }

  const startNewGame = () => {
    if (currentSong?.playing()) {
      currentSong.pause()
      setIsPlaying(false)
    }
    history.push("/")
  }

  const submitArtistChoice = (currentTarget, choice, index) => {
    setChoiceSubmitted(true)
    setShowNextAction(true)
    console.log(currentTarget)
    currentTarget.classList.add("selected-choice")
    //check if the choice is correct
    if (choice.name === guessData[gameRound].artist) {
      setIsCorrect(true)
      setIsIncorrect(false)
      setScore(score + 1)
    } else {
      setIsCorrect(false)
      setIsIncorrect(true)
    }
    // }
  }

  return (
    <>
      <Background></Background>
      <Content>
        <StyledGame>
          <>
            <h1>Round {gameRound + 1}</h1>
            <Song>
              <h4>Song:</h4>
              <h2>{guessData[gameRound].name}</h2>
              <PlayButton
                key={
                  showNextAction && nextAction === "Next Song"
                    ? setAnimationKey
                    : animationKey
                }
                playState={showNextAction ? "paused" : "running"}
                bg={isPlaying ? blueStop : bluePlay}
                onClick={() => playOrPauseSong()}
              ></PlayButton>
            </Song>
            <ArtistContainer>
              {guessData[gameRound].choices.map((choice, index) =>
                choiceSubmitted || showFinalScore ? (
                  <Artist key={index} style={{ cursor: "auto" }}>
                    <ImgContainer image={choice.imgUrl} />
                    <span>{choice.name}</span>
                  </Artist>
                ) : (
                  <Artist
                    key={index}
                    onClick={(e) => {
                      setSelectedChoice(e.currentTarget)
                      submitArtistChoice(e.currentTarget, choice, index)
                    }}
                  >
                    <ImgContainer image={choice.imgUrl} />
                    <span>{choice.name}</span>
                  </Artist>
                )
              )}
            </ArtistContainer>
            <InfoContainer>
              <TextContainer>
                {!showFinalScore && <span>Current Score: {score}</span>}

                {isCorrect === true && <span>Correct!</span>}
                {isIncorrect === true && <span>Incorrect!</span>}
                {isIncorrect === true && (
                  <p style={{ textAlign: "center", margin: 0 }}>
                    <AnswerSpan>Correct Answer:</AnswerSpan>
                    <AnswerSpan> {guessData[gameRound].artist}</AnswerSpan>
                  </p>
                )}
              </TextContainer>
              {showNextAction && (
                <Button onClick={handleNextRound}>{nextAction}</Button>
              )}
            </InfoContainer>
          </>
          {showFinalScore && (
            <FinalScore>
              {" "}
              <span>Final Score:</span>
              <span>
                {" "}
                {score} out of {guessData.length}{" "}
              </span>
              <Button onClick={startNewGame}>New Game</Button>
            </FinalScore>
          )}
        </StyledGame>
      </Content>
    </>
  )
}

export default Game
