import React from 'react'

const ChatBar = ({socket, users, onlineUsers}) => {
  const logOut = () => {
    localStorage.removeItem("mySession")
    socket.disconnect()
    window.location.href = "/"
  }

  return (
    <div className='chat__sidebar'>
        <h2>Open Chat</h2>
        <div>
            <h4  className='chat__header'>USERS</h4>
            <div className='chat__users'>
                {
                users.map(user => 
                <div key={user.id} className='user__status'>
                    {user.name}
                    <span className={onlineUsers.indexOf(user.id) !== -1 ? 'status__online': 'status__offline'}>
                        {
                            onlineUsers.indexOf(user.id) !== -1 ?
                            'Online'
                            :
                            'Offline'
                        }
                    </span>
                </div>
                )}
            </div>
        </div>
        {
          localStorage.getItem("mySession") ?
          <div className='navbar__footer'>
            <h1>Welcome {localStorage.getItem("userName")}</h1>
            <button className='logout__btn' onClick={logOut}>LogOut</button>
            </div>
          : null
        }
  </div>
  )
}

export default ChatBar