import { decrypt, encrypt, setRoomname, setUsername } from './main.js';

const socket = io();

document.addEventListener('submit', () => {
	login();
})

// Login
function login() {
	const username = document.getElementById('username').value;
	const room = document.getElementById('room').value;
	setUsername(username);
	setRoomname(room);
	socket.emit('checkUsername', encrypt({ username, room }));
	return false;
}

socket.on('isUsernameValid', data => {
	if (decrypt(data)){ 
		window.location.href = window.location.origin + '/chat.html';
	} else {
		document.getElementById('username').setAttribute('style', 'border: 3px solid red;border-radius: 5px;');
		document.getElementById('username').setAttribute('title', 'Username already in use');
	}
});