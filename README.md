# Real-Time Collaborative Drawing Canvas

A multi-user drawing application where users can draw simultaneously on a shared canvas with real-time synchronization, stroke-based undo, and live user indicators.

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18.x or higher)
* **npm** (v9.x or higher)

### Installation
1.  **Extract/Clone the project:**
    ```bash
    cd collaborative-canvas
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running Locally
1.  **Start the server:**
    ```bash
    npm start
    ```
2.  **Open the app:**
    Navigate to `http://localhost:3000` in your web browser.

---

## 🧪 How to Test with Multiple Users

1.  Open `http://localhost:3000` in your primary browser.
2.  Open the same URL in an **Incognito/Private window** or a different browser (e.g., Firefox or Safari).
3.  **Real-Time Sync:** Draw a line in the first window; it will appear instantly in the second.
4.  **Ghost Cursors:** Move your mouse in one window to see your "User Indicator" move in the other.
5.  **Global Undo:** Draw a full shape in Window A. Click "Undo" in Window B. The entire shape (stroke) will be removed for everyone.
6.  **Tool Switching:** Test the **Eraser** tool to see real-time "erasing" (white-out) across all clients.

---

## 🛠️ Features & Technical Implementation

* **Native Canvas API:** Implemented using `getContext('2d')` without external drawing libraries.
* **Real-time Synchronization:** Built with Socket.io for low-latency event broadcasting.
* **Global History Management:** The server maintains a "Source of Truth" history stack, allowing new users to see previous drawings upon joining.
* **Stroke-Based Undo:** Instead of removing single pixels or segments, the application tracks unique `strokeId`s to remove entire user actions.
* **User Management:** Automatic assignment of random colors and unique IDs to connected users.
* **Path Optimization:** Uses `lineCap: 'round'` and `lineJoin: 'round'` to ensure smooth, professional lines during high-frequency mouse movement.

---

## ⚠️ Known Limitations
* **Persistent Storage:** The canvas state is stored in server RAM. Restarting the Node server will clear the canvas.
* **Viewport Scaling:** The canvas is responsive to window size, but drawing coordinates are currently mapped to the initial client's viewport.
* **Conflict Resolution:** While simultaneous drawing is supported, the "Undo" function removes the absolute last stroke added to the global stack regardless of who drew it.

---

## ⏱️ Time Spent on Project
* **Project Initialization & Architecture:** 1 hour
* **Canvas Drawing Logic:** 2 hours
* **WebSocket Implementation:** 2 hours
* **Global Undo/Redo & State Sync:** 3 hours
* **Documentation & Final Polish:** 1 hour
* **Total:** **9 Hours**