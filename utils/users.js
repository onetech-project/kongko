let users = [];

// Join user to chat
function userJoin(id, username, room) {
  const userIndex = users.findIndex(
    (x) => x.username === username && x.room === room
  );
  const user = { id, username, room };

  if (userIndex !== -1) {
    users[userIndex] = user;
  } else {
    users.push(user);
  }

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

// Get user inside room
function getUserInRoom(username, room) {
  return users.find((user) => user.room === room && user.username === username);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getUserInRoom,
};
