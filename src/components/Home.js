import React, {useState} from 'react'
import { useNavigate} from "react-router-dom"

const Home = ({socket, setRooms}) => {
  const navigate = useNavigate()
    const [userName, setUserName] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()

        fetch("/api/v1/chats/sign-in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: userName,
            device_identifier: `${navigator.userAgent}:${userName}`,
          }),
        })
          .then((response) => response.json())
          .then((responseData) => {
            socket.connect()
            socket.emit('sign_in', { userName })
            localStorage.setItem("userName", userName)
            if (responseData.newUser) {
              socket.emit("newUser", {userName, socketID: socket.id})
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
        <label htmlFor="username">Username</label>
        <input type="text"
          name="username"
          id='username'
          className='username__input'
          value={userName}
          onChange={e => setUserName(e.target.value)}
        />
        <button className='home__cta'>SIGN IN</button>
    </form>
  )
}

export default Home