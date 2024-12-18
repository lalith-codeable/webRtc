import { useState } from 'react'
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
