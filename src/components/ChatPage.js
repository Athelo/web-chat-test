import React, { useEffect, useState, useRef} from 'react'
import { useParams } from "react-router-dom"
import io from 'socket.io-client';
import ChatBar from './ChatBar'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'
import LoadingSpinner from './LoadingSpinner'
import { backendUrl, socketUrl } from '../config'


const ChatPage = () => {
  const [messages, setMessages] = useState([])
  const [typingStatus, setTypingStatus] = useState("")
  const lastMessageRef = useRef(null)
  const { messageChannelId } = useParams()
  const [users, setUsers] = useState([])
  const [success, setSuccess] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const [webSocketToken, setWebSocketToken] = useState("")

  useEffect(()=> {
    setLoading(true)
    fetch(`${backendUrl}/api/v1/message-channels/${messageChannelId}/`, {
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
        const channelInfo = data.message_channel_details
        setSuccess(true)
        setMessages(channelInfo.messages)
        setUsers(channelInfo.members)

        setOnlineUsers(channelInfo.members.filter(member => member.is_online).map(member => member.id))
        setWebSocketToken(data.websocket_token)

        setLoading(false)
      })
      .catch(error => {
        console.log(error)
        setLoading(false)
        // localStorage.removeItem("mySession")
        // window.location.href = "/"
      })
  }, [messageChannelId])

  useEffect(()=> {

    const socket = io(`${socketUrl}/chat`,  {
      // transports: ['websocket'],
      withCredentials: true,
      extraHeaders: {
        "websockettoken": webSocketToken,
        "maintoken": localStorage.getItem("mySession"),
      }
    })

    // socket.io.opts.extraHeaders = {
    //   "websockettoken": webSocketToken,
    //   "maintoken": localStorage.getItem("mySession"),
    // };
    socket.connect()
    setSocket(socket)

    console.log("====Send join message channel event========")
    socket.emit("join_message_channel", 
      {
        messageChannelId,
        userId: localStorage.getItem("userId"),
      }
    )
  }, [messageChannelId, webSocketToken])


  useEffect(()=> {
    if (socket === null) return
    socket.on("messageResponse", data => setMessages([...messages, data]))

    return () => {
      socket.off('messageResponse');
    };
  }, [socket, messages])


  useEffect(()=> {
    if (socket === null) return
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
    if (socket === null) return
    socket.on("joinMessageChannelResponse", (data) => {
      setOnlineUsers(data)
    })

    return () => {
      socket.off('joinMessageChannelResponse');
    };
  }, [socket])

  useEffect(()=> {
    if (socket === null) return
    socket.on("userDisconnectedResponse", data => setOnlineUsers(data))

    return () => {
      socket.off('userDisconnectedResponse');
    };
  }, [socket])

  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    lastMessageRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  return (
    <>
    {
      loading ?
      <LoadingSpinner/>
    :
    <div className="chat">
      {
        !success && !loading &&
        <h2>The page does not exist or you do not have the right permission</h2>
      }
      {
        !loading && success &&
        <>
          <ChatBar socket={socket} users={users} onlineUsers={onlineUsers}/>
          <div className='chat__main'>
            <ChatBody socket={socket} messages={messages} typingStatus={typingStatus} lastMessageRef={lastMessageRef} channelName={messageChannelId}/>
            <ChatFooter socket={socket} messageChannelId={messageChannelId}/>
          </div>
        </>
      }
    </div>
    }
    </>
    
  )
}

export default ChatPage