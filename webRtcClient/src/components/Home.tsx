import { useEffect, useState, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { Stream } from "./Stream";
import {
    User,
    IncomingMessage,
    BroadcastPayload,
    handleRtcMessage,
} from "../logic/websocket";
import { WhoIsOnline } from "./WhoIsOnline";

const Home = ({ username }: { username: string }) => {
    const [users, setUsers] = useState<Record<string, User>>({});
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [switchToStream, setSwitchToStream] = useState<boolean>(false);
    const [isOffering,setIsOffering] = useState<boolean>(false);

    const WS_URL = "wss://ws.lalith.xyz";
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        queryParams: { username },
        share: true,
    });

    const pcRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        if (lastJsonMessage) {
            const message = lastJsonMessage as IncomingMessage;

            if (message.type === "broadcast") {
                setUsers(message.payload as BroadcastPayload);
            }

            if (message.type === "rtc") {
                console.log("Handling RTC message...");
                handleRtcMessage({
                    pcRef,
                    payload: message.payload,
                    sendJsonMessage,
                    setIsOffering,
                    setLocalStream,
                    setRemoteStream,
                    setSwitchToStream
                });
            }
        }
    }, [lastJsonMessage, sendJsonMessage]);


    return (
        <div>
            <div className="w-screen h-screen bg-gradient-to-br from-cyan-500 to-indigo-600 text-white">
                {
                    switchToStream ? (
                        <Stream 
                            remoteStream={remoteStream}
                            localStream={localStream}
                            pcRef={pcRef}
                            setSwitchToStream={setSwitchToStream}
                            setIsOffering={setIsOffering}
                            setLocalStream={setLocalStream}
                            setRemoteStream={setRemoteStream}
                        />
                    ):(
                        <WhoIsOnline 
                            users={users}
                            username={username}
                            pcRef={pcRef}
                            setIsOffering={setIsOffering}
                            isOffering={isOffering}
                            sendJsonMessage={sendJsonMessage}
                            setLocalStream={setLocalStream}
                            setSwitchToStream={setSwitchToStream}
                            setRemoteStream={setRemoteStream}
                        />
                    )
                }
            </div>
        </div>
    );
};

export default Home;
