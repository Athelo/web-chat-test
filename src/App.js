import React, {useState} from 'react'
import {BrowserRouter, Routes, Route, } from "react-router-dom"
import ChatPage from "./components/ChatPage";
import MessageChannelListPage from "./components/MessageChannelListPage";
import io from 'socket.io-client';
import Login from './components/Login';
import { socketUrl } from './config';

const socket = io(socketUrl,  {
  // transports: ['websocket'],
  withCredentials: true
})
function App() {
  const [messageChannels, setMessageChannels] = useState([])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login socket={socket} setMessageChannels={setMessageChannels}/>}></Route>
        <Route path="/message_channels" element={<MessageChannelListPage socket={socket} messageChannels={messageChannels}/>}></Route>
        <Route path="/message_channel/:messageChannelId" element={<ChatPage socket={socket}/>}></Route>
        <Route path="/chat" element={<ChatPage socket={socket}/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
