import { SendJsonMessage } from "react-use-websocket/dist/lib/types";

export const initiateRtcCall = async ({
    setLocalStream,
    setIsOffering,
    setSwitchToStream,
    setRemoteStream,
    pcRef,
    sendJsonMessage,
    to    
}:{
    setLocalStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,
    setIsOffering: React.Dispatch<React.SetStateAction<boolean>>,
    setSwitchToStream: React.Dispatch<React.SetStateAction<boolean>>,
    setRemoteStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,
    pcRef: React.MutableRefObject<RTCPeerConnection | null>
    sendJsonMessage: SendJsonMessage,
    to: string    
}) => {
    setIsOffering(true);
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

    try {
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);
        sendJsonMessage({
            to,
            type: "offer",
            sdp: offer,
        });
    } catch (error) {
        console.error("Error creating offer:", error);
    }
       
    pcRef.current = pc;
}

export const handleConnectionEnd = async ({
    localStream,
    setLocalStream,
    setIsOffering,
    setSwitchToStream,
    setRemoteStream,
    pcRef
}:{
    localStream: MediaStream | null,
    setLocalStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,
    setIsOffering: React.Dispatch<React.SetStateAction<boolean>>,
    setSwitchToStream: React.Dispatch<React.SetStateAction<boolean>>,
    setRemoteStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,  
    pcRef: React.MutableRefObject<RTCPeerConnection | null>
}) => {
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    if(pcRef.current){
        pcRef.current.close();
    }
    setRemoteStream(null);
    setIsOffering(false);
    setSwitchToStream(false);
    pcRef.current = null;
}