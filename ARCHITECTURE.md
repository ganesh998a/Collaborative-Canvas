1. High-Level Data Flow
This application follows a Client-Server-Client broadcast architecture. We prioritize real-time responsiveness by using an Optimistic UI approach—rendering strokes locally immediately to ensure zero latency for the active user, then syncing with the server.

The Lifecycle of a Stroke:

Capture: main.js captures high-frequency mouse movements from the user.
Serialization: Movements are bundled into a JSON object: { strokeId, start, end, color, size }.
Transmission: Data is sent via Socket.io (WebSockets) to the Node.js server.
Persistence: The server pushes the data into a drawingHistory array (the "Source of Truth").
Broadcast: The server broadcasts the segment to all other connected clients.
Remote Render: Other clients receive the event and render the segment using the shared drawLine() logic.

2. WebSocket Protocol (Events)

load_history (Server -> Client): Sends the Array of all existing strokes to sync the canvas state for new users.

draw_step (Bidirectional): Sends an Object containing { strokeId, start, end, color, size } to sync lines in real-time.

mouse_move (Bidirectional): Sends { x, y } coordinates to update "Ghost Cursors" for other users.

undo (Client -> Server): A void event that triggers the removal of the most recent global stroke.

clear_canvas (Client -> Server): A void event that resets the global history and clears all screens.

3. State Synchronization & Undo Strategy
The Challenge: In a multi-user environment, a simple "pop" of the history array might remove User A's work when User B clicks undo.

Implementation:
Stroke IDs: Every time mousedown occurs, a unique ID is generated for that specific path.
Atomic Undo: When the undo event is received, the server identifies the strokeId of the very last segment in the history and filters out every segment associated with that ID.
Global Refresh: To ensure all clients stay perfectly in sync, the server broadcasts the updated history. Clients execute a clearRect() and redraw the history to maintain 100% state consistency.

4. Conflict Resolution
While drawing is generally additive, conflicts can occur with high latency.

Ordering: The server acts as the sequencer. The order in which the server receives and pushes segments into the drawingHistory array defines the final visual "stacking" order.

Concurrency: Since we use an event-stream model rather than a pixel-buffer model, two users drawing in the same spot simply result in overlapping paths, handled gracefully by the Canvas 2D API.

5. Performance Optimizations
Layer Separation: User "Ghost Cursors" are rendered as DOM elements (div) instead of being drawn on the canvas. This prevents the need to re-render the entire drawing history 60 times per second just to move a cursor.

Path Smoothing: We utilize lineCap: 'round' and lineJoin: 'round' to prevent gaps between the high-frequency segments sent over the network.

Normalized Coordinates: Drawing coordinates are calculated relative to the canvas bounding box, ensuring that even if the window is resized, the drawing remains accurate to the canvas's internal coordinate system.