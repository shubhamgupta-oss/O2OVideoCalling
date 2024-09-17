import React, { useState, useCallback, useEffect } from "react";
import { useSocket } from '../Context/SocketProvider';
import { useNavigate } from 'react-router-dom';

const LobbyScreen = () => {
    const [email, setEmail] = useState("");
    const [roomId, setRoomId] = useState("");
    const { socket } = useSocket();    
    const navigate = useNavigate(); 

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!email || !roomId) {
            alert("Please enter both email and room ID");
            return;
        }
        socket.emit("room:join", { email, room: roomId });
    }, [email, roomId, socket]);

    const handleJoinRoom = useCallback(() => {
        navigate(`/room/${roomId}`);
    }, [navigate, roomId]);

    useEffect(() => {
        socket.on('room:join', handleJoinRoom);
        return () => {
            socket.off('room:join', handleJoinRoom);
        };
    }, [socket, handleJoinRoom]);

    return (
        <div>
            <h1>Lobby</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email ID: </label>
                <input 
                    type="email" 
                    id="email"  
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                /><br />
                
                <label htmlFor="roomId">Room ID: </label>
                <input 
                    type="text" 
                    id="roomId" 
                    value={roomId} 
                    onChange={(e) => setRoomId(e.target.value)} 
                    required
                /><br />
                
                <button type="submit">Join</button>
            </form>
        </div>
    );
};

export default LobbyScreen;
