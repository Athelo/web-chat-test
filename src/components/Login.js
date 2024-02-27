import GoogleButton from 'react-google-button'
import { useNavigate} from "react-router-dom"
import { useEffect, useState } from 'react'
import io from 'socket.io-client';
import { signInWithGooglePopup } from "./firebase"
import LoadingSpinner from './LoadingSpinner'
import { backendUrl, socketUrl } from '../config';


const Login = ({setMessageChannels}) => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const logGoogleUser = async () => {
        const response = await signInWithGooglePopup()
        const token = response.user.accessToken
        // const refreshToken = response.user.stsTokenManager.refreshToken
        localStorage.setItem("mySession", token)

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
              // const loginSocket = io(`${socketUrl}/login`,  {
              //   // transports: ['websocket'],
              //   withCredentials: true
              // })
              // loginSocket.connect()
              // loginSocket.emit('sign_in', { userId: responseData.id })
              localStorage.setItem("mySession", token)
              localStorage.setItem("userName", responseData.name)
              localStorage.setItem("userId", responseData.id)
              setMessageChannels(responseData.message_channels)
              navigate("/message_channels")
            });
    }

    useEffect(() => {
        if (localStorage.getItem("mySession")) {
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
