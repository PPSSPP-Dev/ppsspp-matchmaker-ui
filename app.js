// 1. Connect to Live Server
const socket = new WebSocket("wss://ppsspp-server.onrender.com");

// 2. Select All UI Elements
const statusBadge = document.getElementById("statusBadge");
const outputText = document.getElementById("outputText");
const usernameInput = document.getElementById("usernameInput");
const roomCodeInput = document.getElementById("roomCodeInput");
const playerCountText = document.getElementById("playerCountText");
const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const sendChatBtn = document.getElementById("sendChatBtn");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");

let currentRoomCode = null;

// 3. Connection Handlers
socket.onopen = () => {
  statusBadge.innerText = "• Network Online";
  statusBadge.className = "status-badge online";
  outputText.innerText = "Ready to host or join a session.";
};

socket.onclose = () => {
  statusBadge.innerText = "• Network Offline";
  statusBadge.className = "status-badge offline";
};

// 4. Button Click Listeners
createRoomBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim() || "Anonymous";
  const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
  currentRoomCode = roomCode;

  socket.send(JSON.stringify({
    action: "CREATE_ROOM",
    roomCode: roomCode,
    username: username
  }));
});

joinRoomBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim() || "Anonymous";
  const roomCode = roomCodeInput.value.trim();

  if (!roomCode) {
    alert("Please enter a room code!");
    return;
  }
  currentRoomCode = roomCode;

  socket.send(JSON.stringify({
    action: "JOIN_ROOM",
    roomCode: roomCode,
    username: username
  }));
});

sendChatBtn.addEventListener("click", () => {
  const msg = chatInput.value.trim();
  const username = usernameInput.value.trim() || "Anonymous";

  if (msg && currentRoomCode) {
    socket.send(JSON.stringify({
      action: "SEND_CHAT",
      roomCode: currentRoomCode,
      username: username,
      message: msg
    }));
    chatInput.value = "";
  } else if (!currentRoomCode) {
    alert("You must be in a room to chat!");
  }
});

leaveRoomBtn.addEventListener("click", () => {
  currentRoomCode = null;
  outputText.innerText = "Disconnected from session.";
  playerCountText.innerText = "Players in Room: 0/4";
});

// 5. Receive Server Messages
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.status === "SUCCESS" && data.action === "CREATE_ROOM") {
    outputText.innerText = `Connected to ROOM-${data.roomCode}`;
    playerCountText.innerText = `Players in Room: 1/4`;
  }

  if (data.status === "SUCCESS" && data.action === "JOIN_ROOM") {
    outputText.innerText = `Connected to ROOM-${data.roomCode}`;
  }

  if (data.status === "PLAYER_JOINED") {
    playerCountText.innerText = `Players in Room: ${data.totalPlayers}/4`;
    const p = document.createElement("p");
    p.style.margin = "2px 0";
    p.innerText = `System: ${data.username || 'A player'} joined the room!`;
    chatBox.appendChild(p);
  }

  if (data.action === "NEW_CHAT") {
    const p = document.createElement("p");
    p.style.margin = "2px 0";
    p.innerText = `${data.username}: ${data.message}`;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  if (data.status === "ERROR") {
    alert(data.message);
  }
};
// In app.js, disable buttons when joining/creating:
joinRoomBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim() || "Anonymous";
  const roomCode = roomCodeInput.value.trim();

  if (!roomCode) {
    alert("Please enter a room code!");
    return;
  }
  
  currentRoomCode = roomCode;

  // Disable button so user can't tap it again!
  joinRoomBtn.disabled = true;

  socket.send(JSON.stringify({
    action: "JOIN_ROOM",
    roomCode: roomCode,
    username: username
  }));
});

// Re-enable the button when tapping "Leave Room"
leaveRoomBtn.addEventListener("click", () => {
  currentRoomCode = null;
  joinRoomBtn.disabled = false;
  createRoomBtn.disabled = false;
  outputText.innerText = "Disconnected from session.";
  playerCountText.innerText = "Players in Room: 0/4";
});
