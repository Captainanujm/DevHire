const { Server } = require("socket.io");

const io = new Server(3001, {
    cors: {
        origin: "*", // Adjust in production to frontend domain
        methods: ["GET", "POST"]
    }
});

console.log("WebSocket Signaling Server running on port 3001");

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
        socket.to(roomId).emit("user-connected", socket.id);
    });

    socket.on("offer", (payload) => {
        // Send the offer to everyone else in the room
        socket.to(payload.roomId).emit("offer", payload);
    });

    socket.on("answer", (payload) => {
        socket.to(payload.roomId).emit("answer", payload);
    });

    socket.on("ice-candidate", (payload) => {
        socket.to(payload.roomId).emit("ice-candidate", payload);
    });

    socket.on("trigger-ai-question", (payload) => {
        socket.to(payload.roomId).emit("trigger-ai-question", payload);
    });

    socket.on("hide-ai-question", (payload) => {
        socket.to(payload.roomId).emit("hide-ai-question", payload);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
