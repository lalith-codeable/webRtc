import { useEffect, useState, useRef } from "react";
import useWebSocket from "react-use-websocket";
import {
    User,
    IncomingMessage,
    BroadcastPayload,
    handleRtcMessage
} from "../logic/websocket";

const Home = ({ username }: { username: string }) => {
    const [users, setUsers] = useState<Record<string, User>>({});
    const WS_URL = `ws://localhost:8000`;

    // WebSocket connection
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        queryParams: { username },
        share: true,
    });

    // RTCPeerConnection reference
    const pcRef = useRef<RTCPeerConnection | null>(null);

    // Initialize RTCPeerConnection
    useEffect(() => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.ekiga.net"},
                { urls: "stun:stun.ideasip.com"},
                { urls: "stun:stun.ekiga.net"},
                { urls: "stun:stun.iptel.org"},
                { urls: "stun:stun.l.google.com:19302" }
            ],
            iceCandidatePoolSize: 10, // Increased the pool size
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("New ICE candidate:", event.candidate);
                sendJsonMessage({
                    type: "iceCandidate",
                    ice: event.candidate,
                });
            }
        };

        pc.onicecandidateerror = (event) => {
            console.error("ICE Candidate Error:", event);
        };

        pc.oniceconnectionstatechange = () => {
            console.log("ICE Connection State:", pc.iceConnectionState);
        };

        pc.onicegatheringstatechange = () => {
            console.log("ICE Gathering State:", pc.iceGatheringState);
        };

        pcRef.current = pc;

        // Cleanup on unmount
        return () => {
            if (pcRef.current) {
                pcRef.current.close();
            }
        };
    }, [sendJsonMessage]);

    // Handle incoming WebSocket messages
    useEffect(() => {
        if (lastJsonMessage && pcRef.current) {
            const message = lastJsonMessage as IncomingMessage;

            if (message.type === "broadcast") {
                setUsers(message.payload as BroadcastPayload);
            }

            if (message.type === "rtc") {
                console.log("Handling RTC message...");
                handleRtcMessage(pcRef.current, sendJsonMessage, message.payload);
            }
        }
    }, [lastJsonMessage, sendJsonMessage]);

    // Create and send an SDP offer
    const createOffer = async ({ to }: { to: string }) => {
        if (!pcRef.current) return;
        try {
            const offer = await pcRef.current.createOffer({ iceRestart: true });
            console.log("Offer created, ICE Gathering State:", pcRef.current.iceGatheringState);
            await pcRef.current.setLocalDescription(offer);

            console.log("Generated and sent offer:", offer);
            sendJsonMessage({
                to,
                type: "offer",
                sdp: offer,
            });
        } catch (error) {
            console.error("Error creating offer:", error);
        }
    };

    return (
        <div>
            <div>Home: {username}</div>
            <ul>
                {Object.keys(users).map((uuid) => (
                    <li key={uuid}>
                        <span>
                            {uuid}: {users[uuid].username}
                        </span>
                        <button onClick={() => createOffer({ to: uuid })}>
                            Connect
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
