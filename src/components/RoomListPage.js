import React, {useEffect, useState} from 'react'

const RoomListPage = ({rooms}) => {

  const [allRooms, setAllRooms] = useState(rooms)
  const [newRoomName, setNewRoomName] = useState("")
  const logOut = () => {
    localStorage.removeItem("userName")
    window.location.href = "/"
}

  useEffect(()=> {
    if (!rooms.length) {
      fetch(`/api/v1/chats/rooms/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "userName": localStorage.getItem("userName"),
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
          setAllRooms(data)
        })
        .catch(error => {
          console.log(error)
        })
      }
  }, [rooms])

  const createRoom = () => {
    fetch("/api/v1/chats/room/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: localStorage.getItem("userName"),
        roomName: newRoomName,
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
        window.location.href = `/room/${data.code}`
      })
      .catch(error => {
        console.log(error)
      })
  }
  
  return (
    <div className="rooms">
      <h2>Rooms list</h2>
      <div>
          <h4  className='rooms__header'>Available Rooms</h4>
          <div className='room__names'>
              {allRooms.map(room =><p key={room.code}> <a href={`/room/${room.code}`}>{room.name}</a></p>)}
          </div>
          <div>
            <label htmlFor="new_room_name">RoomName</label>
            <input name='new_room_name' value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}/>
            <button className='create_room__btn' onClick={createRoom}>Create Room</button>
          </div>
          {
            localStorage.getItem("userName") ?
            <div className='navbar__footer'>
              <h1>Welcome {localStorage.getItem("userName")}</h1>
              <button className='logout__btn' onClick={logOut}>LogOut</button>
              </div>
            : null
          }
      </div>
    </div>
  )
}

export default RoomListPage
