import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { OngoingCall } from "./OngoingCall";
import { Userlist } from "./Userlist";
import useWebSocket from "react-use-websocket";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { PhoneCallIcon, PhoneOffIcon } from "lucide-react";
import { 
    isStreamingAtom, 
    usernameAtom, 
    usersAtom, 
    localPeerAtom,
    localStreamAtom,
    remoteStreamAtom,
    incomingCallAtom,
    isCallingAtom,
} from "../recoil/atom";

import { 
    IncomingMessage, 
    BroadcastPayload,
    RTCMessage
} from "../types/index";



const Entrypoint = () => {
    const username = useRecoilValue(usernameAtom);
    const [isStreaming, setIsStreaming] = useRecoilState(isStreamingAtom);
    const [users,setUsers] = useRecoilState(usersAtom);
    const [localPeer, setLocalPeer] = useRecoilState(localPeerAtom);
    const [localStream, setLocalStream] = useRecoilState(localStreamAtom);
    const setRemoteStream = useSetRecoilState(remoteStreamAtom);
    const [incomingCall, setIncomingCall] = useRecoilState(incomingCallAtom);
    const setIsCalling = useSetRecoilState(isCallingAtom);

    const WS_URL = "wss://ws.lalith.xyz";
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        queryParams: { username },
        share: true,
    });

    useEffect(()=>{
        if(!sendJsonMessage) return;
        if(!lastJsonMessage) return;
        const incoming = lastJsonMessage as IncomingMessage;
        switch(incoming.type){
            case "broadcast":{
                const users = incoming.payload as BroadcastPayload;
                setUsers(users);
                break;
            }
            case "rtc":{
                const payload = incoming.payload as RTCMessage;
                switch(payload.type){
                    case "connect" :{
                        console.log(payload);
                        if(!payload.sender){
                            console.warn("Sender not found in connect payload");
                            return;
                        }
                        
                        setIncomingCall({
                            callerName: users[payload.sender].username,
                            callledId: payload.sender
                        })
                        console.log("Connection message recieved.");
                        break;
                    }
                    case "reject" :{
                        //toast that call was rejected 
                        localStream?.getTracks().forEach((track) => track.stop());
                        setIsCalling(false);
                        console.log(payload.sender + "rejected the call");
                        console.log("rejection message recieved")
                        break;
                    }
                    case "approve" :{

                        if(!payload.sdp){
                            console.warn("Sdp not found in approved payload");
                            return;
                        }
                        const peer = new RTCPeerConnection({
                            iceServers: [
                                { urls: "stun:stun.l.google.com:19302" },
                                { urls: "stun:stun1.l.google.com:19302" },
                            ],
                        });
                        
                        //adding localStream to RTC
                        localStream?.getTracks().forEach((track) => peer.addTrack(track,localStream));
                        setLocalStream(localStream);
                
                        peer.onicecandidate = (event) => {
                            setIsStreaming(true);
                            if (event.candidate) {
                                sendJsonMessage({
                                    type: "iceCandidate",
                                    ice: event.candidate,
                                });
                            }
                        };
                        
                        //remote track from peer
                        peer.ontrack = (event) => {
                            if (event.streams[0]) {
                                setRemoteStream(event.streams[0]);
                                console.log("Got remote stream");
                                
                            }
                        };

                        peer?.setRemoteDescription(payload.sdp);
                        peer?.createAnswer()
                            .then((answer)=>{
                                peer?.setLocalDescription(answer); 
                                sendJsonMessage({
                                    type: "answer",
                                    sdp: answer
                                } as RTCMessage)
                            })
                        setLocalPeer(peer)
                        console.log("Aprroval recieved");
                        break;
                    }
                    case "answer" :{
                        if(!payload.sdp){
                            console.warn("Sdp not found in answer payload");
                            return;
                        }
                                     
                        localPeer?.setRemoteDescription(payload.sdp);
                        console.log("Answer recieved")
                        break;
                    }
                    case "iceCandidate" :{
                        if(!payload.ice){
                            console.warn("Ice Candidates not found in Ice payload");
                            return;
                        }
                        console.log("Ice exchanged");
                        localPeer?.addIceCandidate(payload.ice);
                        break;
                    }
                    case "disconnect" : {
                        localStream?.getTracks().forEach((track) => track.stop());
                        setLocalPeer(null);
                        setRemoteStream(null);
                        setLocalStream(null);
                        setIsCalling(false);
                        setIsStreaming(false);
                    }
                }
                break;
            }
        }
    },[sendJsonMessage,lastJsonMessage])

    const rejectCall = ({ recipient }:{ recipient: string }) => {
        sendJsonMessage({
            type: "reject",
            recipient,
        } as RTCMessage)
        setIncomingCall(null);
    }

    const approveCall = async ({ recipient }:{ recipient: string }) => {
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
            ],
        });
        
        //adding localStream to RTC
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true});
        stream?.getTracks().forEach((track) => peer.addTrack(track,stream));
        setLocalStream(stream);

        peer.onicecandidate = (event) => {
            setIsStreaming(true);
            if (event.candidate) {
                sendJsonMessage({
                    type: "iceCandidate",
                    ice: event.candidate,
                });
            }
        };
        
        //remote track from peer
        peer.ontrack = (event) => {
            if (event.streams[0]) {
                setRemoteStream(event.streams[0]);
                console.log("Got remote stream");
                
            }
        };

        peer.createOffer({ iceRestart: true})
            .then((offer)=>{
                peer.setLocalDescription(offer);
                sendJsonMessage({
                    type: "approve",
                    recipient,
                    sdp: offer
                } as RTCMessage)
            })
        setIncomingCall(null);
        setLocalPeer(peer);
    }

    return (
        <div>
            <div className="w-screen h-screen bg-gradient-to-br from-cyan-500 to-indigo-600 text-white flex flex-col items-center justify-center">
                {/* Incoming Call Toast */}
                {incomingCall && (
                    <motion.div
                        className="absolute top-4 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 w-11/12 md:w-1/2 flex items-center justify-between text-gray-800"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        {/* Caller Details */}
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-indigo-500 text-white flex items-center justify-center rounded-full text-lg font-semibold">
                                {incomingCall.callerName}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{incomingCall.callerName}</h4>
                                <p className="text-sm text-gray-600">Incoming call...</p>
                            </div>
                        </div>
    
                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                            <button
                                onClick={() =>
                                    rejectCall({ recipient: incomingCall.callledId })
                                }
                                className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full text-white transition duration-300"
                            >
                                <PhoneOffIcon className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    approveCall({ recipient: incomingCall.callledId })
                                }
                                className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full text-white transition duration-300"
                            >
                                <PhoneCallIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                )}
    
                {/* Main Content */}
                <div className="flex flex-col items-center w-full h-full">
                    {isStreaming ? (
                        <OngoingCall sendJsonMessage={sendJsonMessage}/>
                    ) : (
                        <Userlist sendJsonMessage={sendJsonMessage} />
                    )}
                </div>
            </div>
        </div>
    );
}

export { Entrypoint }
    