import { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { handleConnectionEnd } from "./webrtc";

export type User = {
    username: string;
};
export type MsgType = "offer" | "answer" | "iceCandidate";

export type IncomingMessage = {
    type: "broadcast" | "rtc";
    payload: any;
};

export type BroadcastPayload = Record<string, User>;

export type SdpOfferPayload = {
    recipient: string;
    type: MsgType;
    sdp: RTCSessionDescriptionInit;
};

export type SdpAnswerPayload = {
    type: MsgType;
    sdp: RTCSessionDescriptionInit;
};

export type IcePayload = {
    type: MsgType;
    ice: RTCIceCandidateInit;
};

const isSdpOfferPayload = (payload: any): payload is SdpOfferPayload =>
    payload && payload.type === "offer" && payload.sdp;

const isSdpAnswerPayload = (payload: any): payload is SdpAnswerPayload =>
    payload && payload.type === "answer" && payload.sdp;

const isIcePayload = (payload: any): payload is IcePayload =>
    payload && payload.type === "iceCandidate" && payload.ice;

export const handleRtcMessage = async ({
    pcRef,
    sendJsonMessage,
    payload,
    setSwitchToStream,
    setLocalStream,
    setRemoteStream,
    setIsOffering
}: {
    pcRef: React.MutableRefObject<RTCPeerConnection | null>;
    sendJsonMessage: SendJsonMessage;
    payload: any;
    setSwitchToStream: React.Dispatch<React.SetStateAction<boolean>>;
    setLocalStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,
    setIsOffering: React.Dispatch<React.SetStateAction<boolean>>,
    setRemoteStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,
}) => {
    try {
        if(!pcRef.current){

            const localStream= await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(localStream);
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun1.l.google.com:19302" },
                ],
            });

            pc.onicecandidate = (event) => {
            setSwitchToStream(true);
            if (event.candidate) {
                sendJsonMessage({
                    type: "iceCandidate",
                    ice: event.candidate,
                });
            }
            };

            //remote track from peer
            pc.ontrack = (event) => {
            if (event.streams[0]) {
                setRemoteStream(event.streams[0]);
                }
            };
        
            localStream.getTracks().forEach((track) => {
               pc.addTrack(track, localStream);
            })

            pc.oniceconnectionstatechange = () => {
                const state = pc.iceConnectionState;
                console.log("ICE Connection State:", state);
    
                if (state === "disconnected") {
                    console.warn("Connection lost. Attempting reconnection...");
                    // Optional: Handle reconnection logic
                }
    
                if (state === "failed" || state === "closed") {
                    console.error("Connection failed or closed. Cleaning up...");
                    // Cleanup resources if the connection fails
                    handleConnectionEnd({
                        localStream,
                        setLocalStream,
                        setIsOffering,
                        setSwitchToStream,
                        setRemoteStream,
                        pcRef
                    });
                }
            };       
            pcRef.current = pc;
        }
        
        if (isSdpAnswerPayload(payload)) {

            await pcRef.current.setRemoteDescription(payload.sdp);
            console.log("Remote SDP answer set successfully.");

        } else if (isSdpOfferPayload(payload)) {

            await pcRef.current.setRemoteDescription(payload.sdp);
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);

            console.log("Generated and sent answer:", answer);
            const message: SdpAnswerPayload = {
                type: "answer",
                sdp: answer,
            };
            sendJsonMessage(message);

        } else if (isIcePayload(payload)) {
            
            await pcRef.current.addIceCandidate(payload.ice);
            console.log("ICE candidate added:", payload.ice);

        } else {
            console.warn("Unknown or invalid RTC message:", payload);
        }
    } catch (error) {
        console.error("Error handling RTC message:", error);
    }
};


