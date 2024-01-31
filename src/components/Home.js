import React, {useState} from 'react'
import { useNavigate} from "react-router-dom"
import { backendUrl } from '../config';

const Home = ({socket, setRooms}) => {
  const navigate = useNavigate()
    const [token, setToken] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()

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
            socket.connect()
            socket.emit('sign_in', { userId: responseData.id })
            localStorage.setItem("mySession", token)
            localStorage.setItem("userName", responseData.name)
            if (responseData.newUser) {
              socket.emit("newUser", {userId: responseData.id, socketID: socket.id})
              navigate("/chat")
              return;
            }
            setRooms(responseData.rooms)
            navigate("/rooms_list")
          });

    }
  return (
    <form className='home__container' onSubmit={handleSubmit}>
        <h2 className='home__header'>Sign in to Open Chat</h2>
        <label htmlFor="username">Google Auth Token</label>
        <input type="text"
          name="username"
          id='username'
          className='username__input'
          value={token}
          onChange={e => setToken(e.target.value)}
        />
        <button className='home__cta'>SIGN IN</button>
    </form>
  )
}

export default Home