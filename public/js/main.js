const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from localstorage
const username = localStorage.getItem('username');
const room = localStorage.getItem('roomname');
const key = 'hbghjrbjgb7';

if (!username || !room) {
  window.location = '../index.html';
}

const socket = io();

// Join chatroom
socket.emit('joinRoom', encrypt({ username, room }));

// Get room and users
socket.on('roomUsers', (data) => {
  const { room, users } = decrypt(data)
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', (data) => {
  const message = decrypt(data);
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', encrypt(msg));

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

function login(e) {
  console.log(e);
}

// Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
    localStorage.removeItem('username');
    localStorage.removeItem('roomname');
  }
});

// Open sidebar for mobile view
document.getElementById('logo').addEventListener('click', () => {
  if (window.innerWidth <= 700) {
    const sidebar = document.getElementsByClassName('chat-sidebar')[0];
    sidebar.style.display = sidebar.style.display === 'none' || !sidebar.style.display ? 'block' : 'none';
  }
})

window.addEventListener('resize', () => {
  if (window.innerWidth > 700) {
    const sidebar = document.getElementsByClassName('chat-sidebar')[0];
    sidebar.style.display = 'block';
  }
});

function encrypt(msg) {
  return CryptoJS.AES.encrypt(JSON.stringify(msg), key).toString();
}

function decrypt(encryptedMsg) {
	return JSON.parse(CryptoJS.AES.decrypt(encryptedMsg, key).toString(CryptoJS.enc.Utf8))
}