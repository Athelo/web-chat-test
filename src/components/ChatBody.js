import React from 'react'
import {useNavigate} from "react-router-dom"

const ChatBody = ({messages, typingStatus, lastMessageRef, channelName}) => { 
  const navigate = useNavigate()

  

  const goToMessageChannelList = () => {
    navigate("/message_channels")
  }

  const filtered_messages = messages.filter(message => message && message.sender !== undefined)
  
  return (
    <>
      <header className='chat__mainHeader'>
          <p><strong>{channelName}</strong></p>
          <button className='leaveChat__btn' onClick={goToMessageChannelList}>Channel List</button>
        </header>


        <div className='message__container'>
          {filtered_messages.map(message => (
            message.sender === "" ?
            (
              <div className="message__chats" key={message.id}>
            <p className='sender__system'>System</p>
            <div className='message__system'>
                <p>{message.text}</p>
                <p className='message__time'>{message.time}</p>
            </div>
          </div>
            ):
            message.sender === localStorage.getItem("userName") ? (
              <div className="message__chats" key={message.id}>
            <p className='sender__name'>You</p>
            <div className='message__sender'>
                <p>{message.text}</p>
                <p className='message__time'>{message.time}</p>
            </div>
          </div>
            ): (
              <div className="message__chats" key={message.id}>
            <p>{message.sender}</p>
            <div className='message__recipient'>
                <p>{message.text}</p>
                <p className='message__time'>{message.time}</p>
            </div>
          </div>
            )
            ))}

          <div className='message__status'>
            <p>{typingStatus}</p>
          </div>
          <div ref={lastMessageRef} />   
        </div>
    </>
  )
}

export default ChatBody