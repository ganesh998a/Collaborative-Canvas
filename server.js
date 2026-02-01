const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Serve static files from the client folder
app.use(express.static(path.join(__dirname, '../client')));

let drawingHistory = []; // Stores every stroke segment

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 1. Send existing drawing to the new user
    socket.emit('load_history', drawingHistory);

    // 2. Listen for new drawing segments
    socket.on('draw_step', (data) => {
        drawingHistory.push(data); // Save to history
        socket.broadcast.emit('draw_step', data); // Tell everyone else
    });

    // Enhanced Undo: Remove the last stroke (all segments with the same ID)
    socket.on('undo', () => {
        if (drawingHistory.length === 0) return;
        
        const lastStrokeId = drawingHistory[drawingHistory.length - 1].strokeId;
        drawingHistory = drawingHistory.filter(step => step.strokeId !== lastStrokeId);
        
        io.emit('load_history', drawingHistory);
    });

    socket.on('clear_canvas', () => {
        drawingHistory = []; // Wipe the server's memory
        io.emit('canvas_cleared'); // Broadcast to ALL users to clear their screens
    });

    

    socket.on('disconnect', () => console.log('User disconnected'));
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});