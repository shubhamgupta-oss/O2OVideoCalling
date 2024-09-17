import React, { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from "../Context/SocketProvider";
import peer from "../service/peer";
import ReactPlayer from 'react-player';

const RoomPage = () => {
    const { socket } = useSocket();
    const [remoteSocket, setRemoteSocket] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStrem, setRemoteStrem] = useState();

    const myVideoRef = useRef();

    const handleUserJoin = useCallback(({ email, id }) => {
        console.log(email);
        setRemoteSocket(id);
    }, []);

    const handleCallUser = useCallback(async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                setMyStream(stream);
                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = stream;  // Attach the stream to the video element
                }

                const offer = await peer.getOffer();
                socket.emit("user:call", { to: remoteSocket, offer });
            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        } else {
            console.error("getUserMedia is not supported in this browser.");
        }
    }, [remoteSocket, socket]);

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        setRemoteSocket(from);
    
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                setMyStream(stream);
    
                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = stream;  // Attach the stream to the video element
                }
    
                const ans = await peer.getAnswer(offer);
                socket.emit("call:accepted", { to: from, ans });
            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        } else {
            console.error("getUserMedia is not supported in this browser.");
        }
    }, [socket, peer]);
    

    const sendStrem = useCallback(() =>{
        for(const track of myStream.getTracks()){
            peer.peer.addTrack(track, myStream)
        }
    },[myStream])

    const handleCallAccepted = useCallback(({ from, ans }) => {
        peer.setLocalDescription(ans);
        console.log("Call Accepted");   
        sendStrem()
    }, [sendStrem]);

    const handleNegoFinal = useCallback ( async({ans}) =>{
       await peer.setLocalDescription(ans)
    }, [])


    const handelNegoNeeded = useCallback( async () => {
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', {offer, to:remoteSocket})
    })

    const handleNegoNeededIncoming = useCallback(async({from, offer}) =>{
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', {to:from,ans})
    }, [])

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded',handelNegoNeeded) 
        return() => {
            peer.peer.removeEventListener("negotiationneeded", handelNegoNeeded)
        }
    },[handelNegoNeeded])


    useEffect(() =>{
        peer.peer.addEventListener('track', async ev => {
            const remoteStrem = ev.streams
            setRemoteStrem(remoteStrem[0])

        })
    })
    

    useEffect(() => {
        socket.on("user:joined", handleUserJoin);
        socket.on("incoming:call", handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeededIncoming);
        socket.on("peer:nego:final", handleNegoFinal);



        return () => {
            socket.off("user:joined", handleUserJoin);
            socket.off("incoming:call", handleIncomingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeededIncoming);
            socket.off("peer:nego:final", handleNegoFinal);


        };
    }, [socket, handleUserJoin, handleIncomingCall, handleCallAccepted, handleNegoNeededIncoming,handleNegoFinal]);

    return (
        <div>
            <h1>{remoteSocket ? "Connected" : "No one is in the room, please wait..."}</h1>
            {myStream && <button onChange={sendStrem}>Send Strem</button>}
            {remoteSocket ? <button onClick={handleCallUser}>Call</button> : ""}
            {myStream && (
                <>
                    <h2>My Stream</h2>
                    <ReactPlayer playing muted height="300px" width="300px" url={myStream} />
                </>
            )}
             {remoteStrem && (
                <>
                    <h2>Remote Stream</h2>
                    <ReactPlayer playing muted height="300px" width="300px" url={remoteStrem} />
                </>
            )}
        </div>
    );
};

export default RoomPage;
