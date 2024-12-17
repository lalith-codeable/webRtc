import { useState } from 'react'
import './App.css'
import Home from './components/Home';
import Login from "./components/Login"

function App() {
  const [username, setUsername] = useState("");

  return username ? (
    <Home username={username} />
  ):(
    <Login onSubmit={setUsername} />
  )
}

export default App
