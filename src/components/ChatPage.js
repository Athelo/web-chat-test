import React, { useEffect, useState, useRef} from 'react'
import { useParams } from "react-router-dom"
import ChatBar from './ChatBar'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'
import LoadingSpinner from './LoadingSpinner'
import { backendUrl } from '../config'

const ChatPage = ({socket}) => {
  const [messages, setMessages] = useState([])
  const [typingStatus, setTypingStatus] = useState("")
  const lastMessageRef = useRef(null)
  const { messageChannelId } = useParams()
  const [users, setUsers] = useState([])
  const [success, setSuccess] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loading, setLoading] = useState(true)

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
        const webSocketToken = data.websocket_token
        setSuccess(true)
        setMessages(channelInfo.messages)
        setUsers(channelInfo.members)

        setOnlineUsers(channelInfo.members.filter(member => member.is_online).map(member => member.id))
        socket.disconnect()
        socket.io.opts.extraHeaders = {
          "WEBSOCKET_TOKEN": webSocketToken
        };
        socket.connect()
        socket.emit("join_message_channel", 
          {
            messageChannelId,
            userId: localStorage.getItem("userId"),
          }
        )
        setLoading(false)
      })
      .catch(error => {
        console.log(error)
        setLoading(false)
        localStorage.removeItem("mySession")
        window.location.href = "/"
      })
  }, [])


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
    socket.on("joinMessageChannelResponse", (data) => {
      console.log(data)
      setOnlineUsers(data)
    })

    return () => {
      socket.off('joinMessageChannelResponse');
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
            <ChatBody messages={messages} typingStatus={typingStatus} lastMessageRef={lastMessageRef} channelName={messageChannelId}/>
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