import React, {useState} from 'react'

const ChatFooter = ({socket, messageChannelId}) => {
    const [message, setMessage] = useState("")
    const handleTyping = () => socket.emit("typing", {
      userName: localStorage.getItem("userName"),
      text: `${localStorage.getItem("userName")} is typing`
    })

    const handleSendMessage = (e) => {
        e.preventDefault()
        if(message.trim() && localStorage.getItem("mySession")) {
          console.log(socket.io.opts.extraHeaders)
          socket.emit("message", 
              {
              messageChannelId,
              text: message,
              senderName: localStorage.getItem("userName"),
              socketID: socket.id
              }
          )
        }
        setMessage("")
    }
  return (
    <div className='chat__footer'>
        <form className='form' onSubmit={handleSendMessage}>
          <input 
            type="text" 
            placeholder='Write message' 
            className='message' 
            value={message} 
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleTyping}
            />
            <button className="sendBtn">SEND</button>
        </form>
     </div>
  )
}

export default ChatFooter