import { useRecoilValue } from 'recoil';
import { Entrypoint } from './components/Entrypoint';
import { Login } from "./components/Login"
import { usernameAtom } from './recoil/atom';

function App() {
  const username = useRecoilValue(usernameAtom);

  return username ? (
    <Entrypoint/>
  ):(
    <Login/>
  )
}

export default App

//connect -> create get and set localStream for both sides
//approve -> create rtc -> send offer -> reciveve offer -> create rtc -> send answer <-> ice exchange
//reject -> stop localstream -> set media to null
//disconnect -> stop localstream -> set media to null -> clean rtc connection -> set Triggers back to normal