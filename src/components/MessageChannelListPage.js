import React, {useEffect, useState} from 'react'
import LoadingSpinner from './LoadingSpinner'

const MessageChannelListPage = ({socket, messageChannels}) => {

  const [allMessageChannels, setAllMessageChannels] = useState(messageChannels)
  const [newRoomName, setNewRoomName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const logOut = () => {
    localStorage.removeItem("token")
    socket.disconnect()
    window.location.href = "/"
}

  useEffect(()=> {
    if (!allMessageChannels.length) {
      setIsLoading(true)
      fetch(`/api/v1/message-channels/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then(response => {
          if (response.ok) {
            return response.json()
          } else if(response.status === 404) {
            return Promise.reject('error 404')
          } else {
            return Promise.reject('some other error: ' + response.status)
          }
        })
        .then(data => {
          const channels = data.map(channel => {
            return {
              id: channel.id,
              name: channel.users.map(user => user).join(", ")
            }
          })
          setAllMessageChannels(channels)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.log(error)
          localStorage.removeItem("token")
          window.location.href = "/"
        })
      }
  }, [messageChannels])

  const createRoom = () => {
    setIsLoading(true)
    fetch("/api/v1/chats/room/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_name: newRoomName,
      }),
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        } else if(response.status === 404) {
          return Promise.reject('error 404')
        } else {
          return Promise.reject('some other error: ' + response.status)
        }
      })
      .then(data => {
        window.location.href = `/room/${data.id}`
      })
      .catch(error => {
        setIsLoading(false)
        console.log(error)
      })
  }
  
  return (
    <>
    {isLoading ?
    <LoadingSpinner/>
     :
     <div className="rooms">
      <h2>Message Channels list</h2>
      <div>
          <h4  className='rooms__header'>Available Channels</h4>
          <div className='room__names'>
              {allMessageChannels.map(channel =><p key={channel.id}> <a href={`/message_channel/${channel.id}`}>{channel.id}</a></p>)}
          </div>
          <div>
            <label htmlFor="new_room_name">RoomName</label>
            <input name='new_room_name' value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}/>
            <button className='create_room__btn' onClick={createRoom}>Create Room</button>
          </div>
          {
            localStorage.getItem("token") ?
            <div className='navbar__footer'>
              <h1>Welcome {localStorage.getItem("userName")}</h1>
              <button className='logout__btn' onClick={logOut}>LogOut</button>
              </div>
            : null
          }
      </div>
    </div> 
     }
    </>
    
  )
}

export default MessageChannelListPage
