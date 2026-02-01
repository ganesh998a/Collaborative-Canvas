const socket = io();
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

// --- State Variables ---
let isDrawing = false;
let lastPos = { x: 0, y: 0 };
let currentStrokeId = null;
let currentTool = 'brush'; // Default tool
const cursors = {};

// --- Canvas Setup ---
const setupCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 60;
};
setupCanvas();
window.onresize = setupCanvas;

// --- Drawing Logic ---
function drawLine(start, end, color, size) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
}

// --- Tool Handlers ---
document.getElementById('brushBtn').onclick = () => {
    currentTool = 'brush';
    document.getElementById('brushBtn').classList.add('active');
    document.getElementById('eraserBtn').classList.remove('active');
};

document.getElementById('eraserBtn').onclick = () => {
    currentTool = 'eraser';
    document.getElementById('eraserBtn').classList.add('active');
    document.getElementById('brushBtn').classList.remove('active');
};

document.getElementById('clearBtn').onclick = () => {
    if(confirm("This will clear the canvas for everyone. Continue?")) {
        socket.emit('clear_canvas');
    }
};

document.getElementById('undoBtn').onclick = () => socket.emit('undo');

// --- Mouse Events ---
canvas.onmousedown = (e) => {
    isDrawing = true;
    lastPos = { x: e.offsetX, y: e.offsetY };
    currentStrokeId = Math.random().toString(36).substr(2, 9);
};

canvas.onmousemove = (e) => {
    const currentPos = { x: e.offsetX, y: e.offsetY };
    socket.emit('mouse_move', currentPos);

    if (!isDrawing) return;

    // Determine color: if eraser, use canvas background color
    const color = currentTool === 'eraser' ? '#fafafa' : document.getElementById('colorPicker').value;
    const size = document.getElementById('sizePicker').value;

    drawLine(lastPos, currentPos, color, size);

    socket.emit('draw_step', {
        strokeId: currentStrokeId,
        start: lastPos,
        end: currentPos,
        color: color,
        size: size
    });

    lastPos = currentPos;
};

window.onmouseup = () => isDrawing = false;

// --- Socket Listeners ---
socket.on('draw_step', (data) => {
    drawLine(data.start, data.end, data.color, data.size);
});

socket.on('mouse_move', ({ id, pos }) => {
    if (!cursors[id]) {
        const el = document.createElement('div');
        el.className = 'cursor';
        el.innerHTML = `<div class="cursor-label">User ${id.substring(0, 3)}</div>`;
        document.body.appendChild(el);
        cursors[id] = el;
    }
    cursors[id].style.left = pos.x + 'px';
    cursors[id].style.top = (pos.y + 60) + 'px';
});

socket.on('load_history', (history) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history.forEach(data => drawLine(data.start, data.end, data.color, data.size));
});

socket.on('canvas_cleared', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('user_disconnected', (id) => {
    if (cursors[id]) {
        cursors[id].remove();
        delete cursors[id];
    }
});