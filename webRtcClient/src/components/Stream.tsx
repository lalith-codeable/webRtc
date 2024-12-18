import { handleConnectionEnd } from "../logic/webrtc";
import { WebhookOffIcon, MicOff, Mic, VideoOff, Video } from "lucide-react";
import { useState } from "react";

export const Stream = ({
    remoteStream,
    localStream,
    pcRef,
    setSwitchToStream,
    setLocalStream,
    setIsOffering,
    setRemoteStream

}: {
    remoteStream: MediaStream | null,
    localStream: MediaStream | null,
    pcRef: React.MutableRefObject<RTCPeerConnection | null>,
    setSwitchToStream: React.Dispatch<React.SetStateAction<boolean>>;
    setLocalStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,
    setIsOffering: React.Dispatch<React.SetStateAction<boolean>>,
    setRemoteStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,
}) => {
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoHidden, setIsVideoHidden] = useState(false);

    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsAudioMuted((prev) => !prev);
        }
    };
    const toggleVideo = () => {
        setIsVideoHidden((prev) => !prev);
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-black">
            {/* Video Container */}
            <div className="relative w-full max-w-4xl aspect-video bg-gray-800 rounded-lg overflow-hidden">
                {/* Remote Video */}
                <video
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    autoPlay
                    ref={(video) => {
                        if (video && remoteStream) {
                            video.srcObject = remoteStream;
                        }
                    }}
                />
                {/* Local Video */}
                <div
                    className={`absolute bottom-4 right-4 w-28 h-28 bg-black rounded-lg overflow-hidden md:w-36 md:h-36 ${
                        isVideoHidden ? "hidden" : ""
                    }`}
                >
                    <video
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                        autoPlay
                        ref={(video) => {
                            if (video && localStream) {
                                video.srcObject = localStream;
                            }
                        }}
                    />
                </div>
                {/* Controls */}
                <div className="absolute bottom-4 left-4 flex space-x-4">
                    {/* Mute Audio Button */}
                    <button
                        type="button"
                        onClick={toggleAudio}
                        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                    >
                        {isAudioMuted ? (
                            <MicOff className="text-white w-6 h-6" />
                        ) : (
                            <Mic className="text-white w-6 h-6" />
                        )}
                    </button>
                    {/* Hide Video Button */}
                    <button
                        type="button"
                        onClick={toggleVideo}
                        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                    >
                        {isVideoHidden ? (
                            <VideoOff className="text-white w-6 h-6" />
                        ) : (
                            <Video className="text-white w-6 h-6" />
                        )}
                    </button>
                    {/* End Call Button */}
                    <button
                        type="button"
                        onClick={() =>{
                            handleConnectionEnd({
                                localStream,
                                setLocalStream,
                                setIsOffering,
                                setSwitchToStream,
                                setRemoteStream,
                                pcRef
                            })
                        }
                        }
                        className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition"
                    >
                        <WebhookOffIcon className="text-white w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};
