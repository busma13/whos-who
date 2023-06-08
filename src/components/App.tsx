import React from "react"
import { Route } from "react-router-dom"
import './App.css';

import Home from "./Screens/Home"
import Game from "./Screens/Game"

const App = () => (
  <>
    <Route exact path="/" component={Home} />
    <Route path="/Game" component={Game} />
  </>
)

export default App
