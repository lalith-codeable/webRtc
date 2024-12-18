import { motion } from "framer-motion"
import { SendJsonMessage } from "react-use-websocket/dist/lib/types"
import { LoaderPinwheelIcon,WebhookIcon } from "lucide-react"
import { initiateRtcCall } from "../logic/webrtc"

export const WhoIsOnline = ({ 
    users, 
    username, 
    pcRef,
    setIsOffering,
    setLocalStream,
    setSwitchToStream,
    setRemoteStream,
    sendJsonMessage,
    isOffering
}:{
    users: Record<string, {username: string}>,
    username: string,
    pcRef: React.MutableRefObject<RTCPeerConnection | null>,
    setIsOffering: React.Dispatch<React.SetStateAction<boolean>>,
    setLocalStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,
    setSwitchToStream: React.Dispatch<React.SetStateAction<boolean>>,
    setRemoteStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,
    sendJsonMessage: SendJsonMessage,
    isOffering: boolean
}

) => {
    
  return (
    <>
        <div className="flex items-center space-x-4 pt-8 pl-8 pb-4">
                {/* Animated Logo */}
                <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                    <motion.span
                        className="text-white text-3xl font-extrabold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        🌀
                    </motion.span>
                </motion.div>

                {/* Animated Brand Name */}
                <motion.h1
                    className="text-2xl font-bold tracking-wide"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    Peer2Peer RTC
                </motion.h1>
            </div>
            <motion.div 
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mx-4 my-2 flex flex-col justify-center items-center gap-2"
            >
                <h1 className="text-2xl mb-2">Who's online 👀</h1>
                {
                    Object.keys(users).map((uuid)=>{
                        return users[uuid].username !== username && (
                            <div className="w-5/6 h-16 border-2 grid grid-cols-3 px-4  rounded-md">
                                <span className="col-span-2 flex justify-center items-center">
                                    <h2 className="w-full tracking-wide text-2xl">{users[uuid].username}</h2>
                                </span>
                                <span className="flex justify-center items-center">
                                <button 
                                    type="button"
                                    className="col-start-3 text-xl  text-white font-bold bg-green-600 px-4 py-2 rounded-lg" 
                                    onClick={()=> initiateRtcCall({
                                        setLocalStream,
                                        setIsOffering,
                                        setRemoteStream,
                                        setSwitchToStream,
                                        pcRef,
                                        sendJsonMessage,
                                        to: uuid
                                    })}
                                    disabled={isOffering}
                                >
                                {isOffering ?(
                                <span className="flex items-center">
                                    <LoaderPinwheelIcon className="animate-spin"/>
                                </span>
                                ):(<span>
                                    <WebhookIcon/>
                                </span>)}
                                </button>
                                </span>    
                            </div>
                        ) 
                    })
                }
                
            </motion.div>
    </>
  )
}
