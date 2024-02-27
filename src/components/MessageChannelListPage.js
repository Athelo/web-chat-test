import React, {useEffect, useState} from 'react'
import LoadingSpinner from './LoadingSpinner'
import { backendUrl } from '../config';

const MessageChannelListPage = ({messageChannels}) => {

  const [allMessageChannels, setAllMessageChannels] = useState(messageChannels)
  const [isLoading, setIsLoading] = useState(true)
  const logOut = () => {
    localStorage.removeItem("mySession")
    window.location.href = "/"
}

  useEffect(()=> {
    console.log(allMessageChannels);
    if (!allMessageChannels.length) {
      setIsLoading(true)
      fetch(`${backendUrl}/api/v1/message-channels/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("mySession")}`,
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
          console.log("removing token")
          localStorage.removeItem("mySession")
          window.location.href = "/"
        })
      }
  }, [messageChannels])

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
              {allMessageChannels.map(channel =><p key={channel.id}> <a href={`/message_channel/${channel.id}`}>{channel.id}</a> Users: {channel.name}</p>)}
          </div>
          {/* <div>
            <label htmlFor="new_room_name">RoomName</label>
            <input name='new_room_name' value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}/>
            <button className='create_room__btn' onClick={createRoom}>Create Room</button>
          </div> */}
          {
            localStorage.getItem("mySession") ?
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
