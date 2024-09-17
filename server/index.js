const { Server } = require("socket.io");

const io = new Server(3000, {
    cors: {
        origin: "*", // Adjust this to allow specific domains, e.g. ["http://example.com"]
        methods: ["GET", "POST"]
    }
});

const emailToSocketMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Handle room join event
    socket.on('room:join', (data) => {
        const { email, room } = data;
        emailToSocketMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);

        socket.join(room);
        // Emit the event only after the user has joined the room
        io.to(room).emit('user:joined', { email, id: socket.id });
        io.to(socket.id).emit('room:join', data);
    });

    // Handle user calling another user
    socket.on('user:call', ({ to, offer }) => {
        io.to(to).emit("incoming:call", { from: socket.id, offer });
    });

    // Handle call accepted
    socket.on('call:accepted', ({ to, ans }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
    });

    // Handle socket disconnection
    socket.on("disconnect", () => {
        const email = socketIdToEmailMap.get(socket.id);
        if (email) {
            emailToSocketMap.delete(email);
            socketIdToEmailMap.delete(socket.id);
        }
        console.log("Socket disconnected:", socket.id);
    });

    socket.on('peer:nego:needed', ({to, offer}) => {
        io.to(to).emit("peer:nego:needed",{from:socket.id, offer})
    })

    socket.on('peer:nego:done',({to, ans}) =>{
        io.to(to).emit("peer:nego:final",{from:socket.id, ans})

    })
});
