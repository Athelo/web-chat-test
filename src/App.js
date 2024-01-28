import React, {useState} from 'react'
import {BrowserRouter, Routes, Route, } from "react-router-dom"
import Home from "./components/Home"
import ChatPage from "./components/ChatPage";
import RoomListPage from "./components/RoomListPage";
// import socketIO from "socket.io-client"
import io from 'socket.io-client';

const socket = io("http://localhost:5001")
function App() {
  const [rooms, setRooms] = useState([])

  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Home socket={socket} setRooms={setRooms}/>}></Route>
          <Route path="/rooms_list" element={<RoomListPage rooms={rooms}/>}></Route>
          <Route path="/room/:room_code" element={<ChatPage socket={socket}/>}></Route>
          <Route path="/chat" element={<ChatPage socket={socket}/>}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
