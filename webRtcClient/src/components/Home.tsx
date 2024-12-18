import { useEffect, useState, useRef } from "react";
import useWebSocket from "react-use-websocket";

import {
    User,
    IncomingMessage,
    BroadcastPayload,
    handleRtcMessage,
} from "../logic/websocket";

const Home = ({ username }: { username: string }) => {
    const [users, setUsers] = useState<Record<string, User>>({});
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const WS_URL = "wss://ws.lalith.xyz";

    // WebSocket connection
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        queryParams: { username },
        share: true,
    });

    // RTCPeerConnection reference
    const pcRef = useRef<RTCPeerConnection | null>(null);

    // Initialize media and RTCPeerConnection
    useEffect(() => {
        // Access local media
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setLocalStream(stream);
            })
            .catch((error) => console.error("Error accessing media devices:", error));

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
            ],
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendJsonMessage({
                    type: "iceCandidate",
                    ice: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            if (event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log("ICE Connection State:", pc.iceConnectionState);
        };

        pcRef.current = pc;

        // Cleanup on unmount
        return () => {
            if (pcRef.current) {
                pcRef.current.close();
            }
        };
    }, [sendJsonMessage]);

    // Add local tracks to RTCPeerConnection when the stream is ready
    useEffect(() => {
        if (localStream && pcRef.current) {
            localStream.getTracks().forEach((track) => {
                pcRef.current?.addTrack(track, localStream);
            });
        }
    }, [localStream]);

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
            await pcRef.current.setLocalDescription(offer);

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
            <div>
                <video
                    playsInline
                    muted
                    autoPlay
                    ref={(video) => {
                        if (video && localStream) {
                            video.srcObject = localStream;
                        }
                    }}
                    style={{ width: "300px", height: "200px", border: "1px solid black" }}
                />
                <video
                    playsInline
                    autoPlay
                    ref={(video) => {
                        if (video && remoteStream) {
                            video.srcObject = remoteStream;
                        }
                    }}
                    style={{ width: "300px", height: "200px", border: "1px solid black" }}
                />
            </div>
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
