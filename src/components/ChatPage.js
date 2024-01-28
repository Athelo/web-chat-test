import React, { useEffect, useState, useRef} from 'react'
import { useParams } from "react-router-dom"
import ChatBar from './ChatBar'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'

const ChatPage = ({socket}) => {
  const [messages, setMessages] = useState([])
  const [typingStatus, setTypingStatus] = useState("")
  const lastMessageRef = useRef(null)
  const { room_code } = useParams()
  const [users, setUsers] = useState([])
  const [success, setSuccess] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [roomInfo, setRoomInfo] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(()=> {
    fetch(`/api/v1/chats/room/${room_code}/`, {
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
        const rooomInfo = data.room_info
        const webSocketToken = data.websocket_token
        setSuccess(true)
        setMessages(rooomInfo.messages)
        setUsers(rooomInfo.members)
        setOnlineUsers(rooomInfo.onlineUsers)
        setRoomInfo(rooomInfo)
        socket.emit("join_room", 
            {
            roomCode: room_code,
            userName: localStorage.getItem("userName"),
            }
        )
        socket.disconnect()
        socket.io.opts.extraHeaders = {
          "WEBSOCKET_TOKEN": webSocketToken
        };
        socket.connect()
        setLoading(false)
      })
      .catch(error => {
        console.log(error)
      })
  }, [room_code])


  useEffect(()=> {
    socket.on("messageResponse", data => setMessages([...messages, data]))

    return () => {
      socket.off('messageResponse');
    };
  }, [socket, messages])


  useEffect(()=> {
    socket.on("typingResponse", (data) => {
      if (data.userName === localStorage.getItem("userName")) return;
      setTypingStatus(data.text);
      setTimeout(() => setTypingStatus(""), 1000);
    })

    return () => {
      socket.off('typingResponse');
    };
  }, [socket])

  useEffect(()=> {
    socket.on("joinRoomResponse", (data) => {
      setOnlineUsers(data)
    })

    return () => {
      socket.off('joinRoomResponse');
    };
  }, [socket])

  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    lastMessageRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  useEffect(()=> {
      socket.on("newUserResponse", data => setUsers(data))

      return () => {
        socket.off('newUserResponse');
      };
  }, [socket, users])

  useEffect(()=> {
    socket.on("userDisconnectedResponse", data => setOnlineUsers(data))

    return () => {
      socket.off('userDisconnectedResponse');
    };
  }, [socket])

  return (
    <div className="chat">
      {
        !success && !loading &&
        <h2>The page does not exist or you do not have the right permission</h2>
      }
      {
        !loading && success &&
        <>
          {/* <a href="/rooms_list">Back</a> */}
          <ChatBar users={users} onlineUsers={onlineUsers}/>
          <div className='chat__main'>
            <ChatBody messages={messages} typingStatus={typingStatus} lastMessageRef={lastMessageRef} roomName={roomInfo.name}/>
            <ChatFooter socket={socket} roomCode={room_code}/>
          </div>
        </>
      }
    </div>
  )
}

export default ChatPage