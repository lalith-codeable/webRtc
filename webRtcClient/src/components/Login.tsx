import { useState } from "react";
import { useSetRecoilState } from "recoil";
import { AnimatePresence, motion } from "framer-motion";
import { usernameAtom } from "../recoil/atom";

const Login = () => {
	const onSubmit = useSetRecoilState(usernameAtom);
	const [username, setUsername] = useState("");

	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#48494C] to-[#111119] text-white">
			<AnimatePresence>
				{/* Brand Section */}
				<div className="absolute top-8 left-8 flex items-center space-x-4">
					{/* Animated Logo */}
					<motion.div
						className="w-12 h-12  bg-[#bfc6dd] rounded-full flex items-center justify-center shadow-lg"
						initial={{ scale: 0, rotate: -180 }}
						animate={{ scale: 1, rotate: 0 }}
						transition={{
							type: "spring",
							stiffness: 200,
							damping: 20,
						}}
					>
						<motion.span
							className="text-white  text-3xl font-extrabold cursor-pointer"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3, duration: 0.6 }}
						>
							🌀
						</motion.span>
					</motion.div>

					{/* Animated Brand Name */}
					<motion.h1
						className="text-2xl font-bold tracking-wide cursor-pointer"
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
					className="text-center bg-[#bfc6dd] rounded-xl shadow-2xl p-10 max-w-md w-full mx-2 sm:mx-10 "
				>
					<h1 className="text-4xl font-bold text-[#1C2123] mb-6">
						Welcome
					</h1>
					<h2 className="text-lg text-black opacity-80 font-semibold mb-8">
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
							className="w-full px-4 py-3 text-lg border bg-gradient-to-br to-[#7a7c81] from-[#111119] rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:black text-white font-semibold text-center "
						/>
						{/* Submit Button */}
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							transition={{
								duration: 0.25,
								ease: "easeInOut",
								stiffness: 300,
							}}
							type="submit"
							className="w-full px-4 py-3 bg-gradient-to-br from-[#7a7c81] to-[#111119] text-white text-lg font-medium rounded-lg shadow-md hover:shadow-lg  focus:ring-2 focus:ring-black focus:black transition-all duration-300"
						>
							Let’s Go!
						</motion.button>
					</form>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="w-screen my-2 mx-1 p-2 font-semibold text-white text-sm flex justify-center items-center"
				>
					All rights are reserved by
					<motion.a
						whileHover={{ scale: 1.05, opacity: 1 }}
						href="https://github/lalith-codeable/webrtc"
						className="underline opacity-75 px-2"
					>
						Lalith_Borana@2025
					</motion.a>
				</motion.div>
			</AnimatePresence>
		</div>
	);
};

export { Login };
