import { useState } from "react";
import { useSetRecoilState } from "recoil";
import { motion } from "framer-motion";
import { usernameAtom } from "../recoil/atom";

const Login = () => {
    const onSubmit = useSetRecoilState(usernameAtom);
    const [username, setUsername] = useState("");

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-cyan-500 to-indigo-600 text-white">
            {/* Brand Section */}
            <div className="absolute top-8 left-8 flex items-center space-x-4">
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

            {/* Login Form */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center bg-white rounded-xl shadow-2xl p-10 max-w-md w-full mx-2"
            >
                <h1 className="text-4xl font-bold text-indigo-700 mb-6">Welcome</h1>
                <h2 className="text-lg text-gray-600 mb-8">
                    What should people call you?
                </h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit(username);
                    }}
                    className="space-y-6"
                >
                    {/* Input Field */}
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-800 text-center shadow-sm"
                    />
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-medium rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 focus:ring-4 focus:ring-indigo-400 transition-all duration-300"
                    >
                        Let’s Go!
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export { Login }
