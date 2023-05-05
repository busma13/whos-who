import styled from "styled-components"
import cheers from '../images/cheers.jpg'

const Background = styled.div`
  background: url(${cheers});
  background-color: #000000;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: fixed;
  z-index: -1;
  height: 100vh;
  width: 100vw;
`

export default Background
