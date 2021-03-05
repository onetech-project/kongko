import { compressImage, decrypt, encrypt, getRoomname, getUsername, isBase64, checkNotificationPermission, playAudioNotification } from './main.js';

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const socket = io();
const username = getUsername();
const room = getRoomname();

if (!username || !room) {
  window.location = "../";
}

// Join chatroom
socket.emit("joinRoom", encrypt({ username, room }));

// Get room and users
socket.on("roomUsers", (data) => {
  const { room, users } = decrypt(data);
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on("message", (data) => {
  const message = decrypt(data);
  checkNotificationPermission({ title: message.username, body: message.text });
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Chat history from server
socket.on("chatHistory", (data) => {
  if (data && data.length) {
    for (let datum in data) {
      const message = decrypt(data[datum]);
      outputMessage(message);
    }
  }

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit("chatMessage", encrypt(msg));

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add(message.username === username ? "message-self" : "message");
  
  if (message.username.toUpperCase() === document.title.toUpperCase()) {
    div.setAttribute('style', 'background-color: rgba(0,0,0,0.1); margin-inline: auto;')
  } else {
    const p = document.createElement("p");
    p.classList.add("meta");
    p.innerText = message.username;
    p.innerHTML += `<span style="font-size: 10px" class="meta">&nbsp;&nbsp;${message.time}</span>`;
    div.appendChild(p);
  }

  if (isBase64(message.text)) {
    const img = document.createElement("img");
    img.src = message.text;
    div.appendChild(img);
  } else {
    const para = document.createElement("p");
    para.classList.add("text");
    if (message.username === username) para.setAttribute('style', 'color: white;');
    else if (message.username.toUpperCase() !== document.title.toUpperCase()) playAudioNotification();
    para.innerText = message.text;
    div.appendChild(para);
  }
  chatMessages.appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

// Prompt the user before leave chat room
document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../login.html";
    localStorage.removeItem("username");
    localStorage.removeItem("roomname");
  }
});

// Open sidebar if screen width <= 700px
document.getElementById("logo").addEventListener("click", () => {
  if (window.innerWidth <= 700) {
    const sidebar = document.getElementsByClassName("chat-sidebar")[0];
    sidebar.style.display =
      sidebar.style.display === "none" || !sidebar.style.display
        ? "block"
        : "none";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("icon")
    .setAttribute(
      "class",
      window.innerWidth > 700 ? "fas fa-smile" : "fas fa-bars"
    );
});

// always show sidebar if screen width > 700px
window.addEventListener("resize", () => {
  const sidebar = document.getElementsByClassName("chat-sidebar")[0];
  sidebar.style.display = window.innerWidth > 700 ? "block" : "none";
  document
    .getElementById("icon")
    .setAttribute(
      "class",
      window.innerWidth > 700 ? "fas fa-smile" : "fas fa-bars"
    );
});

document.getElementById('imgupload').addEventListener('change', (input) => {
  readURL(input.currentTarget);
})

// send image to server
function readURL(input) {
  if (input.files.length > 0) {
    for (let i = 0;i < input.files.length;i++) {
      var reader = new FileReader();
      reader.onload = function (e) {
        socket.emit("chatMessage", encrypt(e.target.result));
      };
      if (input.files[i].size > 1024000) {
        compressImage(input.files[i], (compressedFile) => reader.readAsDataURL(compressedFile));
      } else {
        reader.readAsDataURL(input.files[i]);
      }
    }
  }
}