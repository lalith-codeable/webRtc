import { motion } from "framer-motion"
import { LoaderPinwheelIcon,PhoneCallIcon } from "lucide-react"
import { isCallingAtom, localStreamAtom, usernameAtom, usersAtom } from "../recoil/atom"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { RTCMessage } from "../types"
import { SendJsonMessage } from "react-use-websocket/dist/lib/types"

const Userlist = ({
    sendJsonMessage
}:{
    sendJsonMessage: SendJsonMessage
}) => {
    const users = useRecoilValue(usersAtom);
    const username = useRecoilValue(usernameAtom);
    const [isCalling, setIsCalling]= useRecoilState(isCallingAtom);
    const setLocalStream = useSetRecoilState(localStreamAtom);
   
    const RtcCall = async ({
        recipient
    }:{
        recipient: string
    }) => {
        
        setIsCalling(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true});
        setLocalStream(stream);
        let uuid = "";
        Object.keys(users).forEach((id)=>{
            if(users[id].username === username){
                uuid = id;
            }
        })
        
        const message: RTCMessage= {
            recipient,
            type: "connect",
            sender: uuid
        }
        sendJsonMessage(message);
        console.log(uuid+ message + "sent");
        console.log(message);
    }
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
                            <div className="w-full h-16 border-2 grid grid-cols-2 px-2 rounded-md" key={uuid}>
                                <span className="flex justify-center items-center ">
                                    <h2 className="w-full tracking-wide text-2xl">{users[uuid].username}</h2>
                                </span>
                                <span className="flex justify-end items-center ">
                                <button 
                                    type="button"
                                    className={`text-xl  text-white font-bold  px-2 py-1 rounded-lg ${isCalling ? "bg-slate-500" : "bg-green-600"}`} 
                                    onClick={()=>{
                                        RtcCall({ recipient: uuid})
                                    }}
                                    disabled={isCalling}
                                >
                                {isCalling ?(
                                <span className="flex gap-1 items-center p-1">
                                    <LoaderPinwheelIcon className="animate-spin"/>
                                    Connecting
                                </span>
                                ):(<span className="flex gap-1 items-center p-1">
                                    <PhoneCallIcon />
                                    Connect
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

export { Userlist }