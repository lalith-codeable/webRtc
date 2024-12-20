import { WebhookOffIcon, MicOff, Mic, VideoOff, Video, VolumeX, Volume2 } from "lucide-react";
import { useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isCallingAtom, isStreamingAtom, localPeerAtom, localStreamAtom, remoteStreamAtom } from "../recoil/atom";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { RTCMessage } from "../types";

const OngoingCall = ({
    sendJsonMessage
}:{
    sendJsonMessage: SendJsonMessage
}) => {
    const [localStream, setLocalStream] = useRecoilState(localStreamAtom);
    const [remoteStream, setRemoteStream] = useRecoilState(remoteStreamAtom);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoHidden, setIsVideoHidden] = useState(false);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
    const [localPeer, setLocalPeer] = useRecoilState(localPeerAtom);
    const setIsCalling = useSetRecoilState(isCallingAtom);
    const setIsStreaming = useSetRecoilState(isStreamingAtom);

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

    const toggleSpeaker = () => {
        setIsSpeakerMuted((prev) => !prev);
    };

    const handleConnectionEnd = () => {
        localStream?.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
        setRemoteStream(null);
        if (localPeer) {
            localPeer.close();
            setLocalPeer(null);
        }
        setIsCalling(false);
        setIsStreaming(false);
        sendJsonMessage({
            type:"disconnect"
        } as RTCMessage)
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-black">
            {/* Video Container */}
            <div className="relative w-screen lg:max-w-4xl h-screen lg:h-5/6 aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                {/* Remote Video */}
                <video
                    className="w-full h-full object-cover"
                    playsInline
                    muted={isSpeakerMuted}
                    autoPlay
                    ref={(video) => {
                        if (video && remoteStream) {
                            video.srcObject = remoteStream;
                        }
                    }}
                />
                {/* Local Video */}
                <div
                    className={`absolute bottom-4 right-4 w-28 h-28 bg-black rounded-lg overflow-hidden md:w-36 md:h-36 shadow-md ${
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
                        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition shadow-md"
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
                        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition shadow-md"
                    >
                        {isVideoHidden ? (
                            <VideoOff className="text-white w-6 h-6" />
                        ) : (
                            <Video className="text-white w-6 h-6" />
                        )}
                    </button>
                    {/* Mute Speaker Button */}
                    <button
                        type="button"
                        onClick={toggleSpeaker}
                        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition shadow-md"
                    >
                        {isSpeakerMuted ? (
                            <VolumeX className="text-white w-6 h-6" />
                        ) : (
                            <Volume2 className="text-white w-6 h-6" />
                        )}
                    </button>
                    {/* End Call Button */}
                    <button
                        type="button"
                        onClick={handleConnectionEnd}
                        className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition shadow-md"
                    >
                        <WebhookOffIcon className="text-white w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export { OngoingCall };
