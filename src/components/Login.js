import GoogleButton from 'react-google-button'
import { useNavigate} from "react-router-dom"
import { useEffect, useState } from 'react'
import { signInWithGooglePopup } from "./firebase"
import LoadingSpinner from './LoadingSpinner'
import { backendUrl } from '../config';


const Login = ({socket, setMessageChannels}) => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const logGoogleUser = async () => {
        const response = await signInWithGooglePopup()
        const token = response.user.accessToken
        localStorage.setItem("token", token)

        setIsLoading(true)

        fetch(`${backendUrl}/api/v1/chats/sign-in`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
              device_identifier: `${navigator.userAgent}:${token}`,
            }),
          })
            .then((response) => response.json())
            .then((responseData) => {
              setIsLoading(false)
              socket.connect()
              socket.emit('sign_in', { userId: responseData.id })
              localStorage.setItem("token", token)
              localStorage.setItem("userName", responseData.name)
              localStorage.setItem("userId", responseData.id)
              if (responseData.newUser) {
                socket.emit("newUser", {userId: responseData.id, socketID: socket.id})
                navigate("/chat")
                return;
              }
              setMessageChannels(responseData.message_channels)
              navigate("/message_channels")
            });
    }

    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate("/message_channels")
        }
    })
    
    return (
        <>
        {isLoading ? <LoadingSpinner/> :
        <div className='login__container'>
            <GoogleButton onClick={logGoogleUser}/>
        </div>}
        </>
        
    )
}

export default Login;
