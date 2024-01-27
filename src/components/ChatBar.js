import React from 'react'

const ChatBar = ({users, onlineUsers}) => {

const logOut = () => {
    localStorage.removeItem("userName")
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
                <div key={user} className='user__status'>
                    {user} 
                    <span className={onlineUsers.indexOf(user) !== -1 ? 'status__online': 'status__offline'}>
                        {
                            onlineUsers.indexOf(user) !== -1 ?
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
          localStorage.getItem("userName") ?
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