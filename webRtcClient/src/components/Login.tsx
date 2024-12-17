import { useState } from "react"

const Login = ({ onSubmit }: { onSubmit: (username: string) => void }) => {
    const [username, setUsername] = useState("");
    return (
        <div>
            <h1>Welcome</h1>
            <h2>What should people call you ?</h2>
            <form 
                onSubmit={(e)=>{
                    e.preventDefault()
                    onSubmit(username)
                }}
            >
                <input 
                    type="text" 
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input type="submit" />
            </form>
        </div>
    )
}

export default Login