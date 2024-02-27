import React, {useState} from 'react'
import {BrowserRouter, Routes, Route, } from "react-router-dom"
import ChatPage from "./components/ChatPage";
import MessageChannelListPage from "./components/MessageChannelListPage";
import Login from './components/Login';


function App() {
  const [messageChannels, setMessageChannels] = useState([])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login setMessageChannels={setMessageChannels}/>}></Route>
        <Route path="/message_channels" element={<MessageChannelListPage messageChannels={messageChannels}/>}></Route>
        <Route path="/message_channel/:messageChannelId" element={<ChatPage/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
