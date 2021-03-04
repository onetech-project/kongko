const moment = require('moment');
const { decrypt } = require('./encryption');
const history = [];

function formatMessage(username, text, room) {
  return {
    username,
    text,
    room,
    time: moment().format('h:mm a')
  };
}

function saveMessageHistory(message) {
  history.push(message);
}

function getMessageHistory(room) {
  return history.filter(x => decrypt(x)?.room === room);
}

module.exports = { formatMessage, saveMessageHistory, getMessageHistory };