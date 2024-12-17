import { SendJsonMessage } from "react-use-websocket/dist/lib/types";

// Incoming WebSocket message type
export type IncomingMessage = {
    type: "broadcast" | "rtc";
    payload: any;
};

// Broadcast payload: A map of connected users
export type BroadcastPayload = Record<string, User>;

// SDP Offer Payload
export type SdpOfferPayload = {
    recipient: string;
    type: MsgType;
    sdp: RTCSessionDescriptionInit;
};

// SDP Answer Payload
export type SdpAnswerPayload = {
    type: MsgType;
    sdp: RTCSessionDescriptionInit;
};

// ICE Candidate Payload
export type IcePayload = {
    type: MsgType;
    ice: RTCIceCandidateInit;
};

// User information type
export type User = {
    username: string;
};

// Message types for RTC signaling
export type MsgType = "offer" | "answer" | "iceCandidate";

// Type guards for validation
const isSdpOfferPayload = (payload: any): payload is SdpOfferPayload =>
    payload && payload.type === "offer" && payload.sdp;

const isSdpAnswerPayload = (payload: any): payload is SdpAnswerPayload =>
    payload && payload.type === "answer" && payload.sdp;

const isIcePayload = (payload: any): payload is IcePayload =>
    payload && payload.type === "iceCandidate" && payload.ice;

// RTC Message Handler
export const handleRtcMessage = async (
    pc: RTCPeerConnection,
    sendJsonMessage: SendJsonMessage,
    payload: any
) => {
    try {
        if (isSdpAnswerPayload(payload)) {
            // Handle SDP Answer
            await pc.setRemoteDescription(payload.sdp);
            console.log("Remote SDP answer set successfully.");
        } else if (isSdpOfferPayload(payload)) {
            // Handle SDP Offer and generate an Answer
            await pc.setRemoteDescription(payload.sdp);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log("Generated and sent answer:", answer);
            const message: SdpAnswerPayload = {
                type: "answer",
                sdp: answer,
            };
            sendJsonMessage(message);
        } else if (isIcePayload(payload)) {
            // Handle ICE Candidate
            await pc.addIceCandidate(payload.ice);
            console.log("ICE candidate added:", payload.ice);
        } else {
            console.warn("Unknown or invalid RTC message:", payload);
        }
    } catch (error) {
        console.error("Error handling RTC message:", error);
    }
};
