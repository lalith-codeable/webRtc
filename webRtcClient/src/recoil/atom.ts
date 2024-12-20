import { atom } from "recoil"
import { Users } from "../types/index"

const usernameAtom = atom<string>({
    key: "usernameAtom",
    default: ""
})

const usersAtom = atom<Users>({
    key: "usersAtom",
    default: {}
})

const localPeerAtom = atom<RTCPeerConnection | null>({
    key: "localPeerAtom",
    default: null
})

const localStreamAtom = atom<MediaStream | null>({
    key: "localStreamAtom",
    default: null
})

const remoteStreamAtom = atom<MediaStream | null>({
    key: "remoteStreamAtom",
    default: null
})

const isStreamingAtom = atom<boolean>({
    key: "isStreamingAtom",
    default: false
})

const isCallingAtom = atom<boolean>({
    key: "isCallingAtom",
    default: false
})

const incomingCallAtom = atom<{
    callerName:string, 
    callledId: string,
} | null>({
    key: "incomingCallAtom",
    default: null
})
export { 
    usernameAtom, 
    usersAtom, 
    localPeerAtom, 
    localStreamAtom, 
    remoteStreamAtom, 
    isStreamingAtom, 
    isCallingAtom,
    incomingCallAtom
}
