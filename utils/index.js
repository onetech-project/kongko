const messages = require('./messages');
const users = require('./users');
const encryption = require('./encryption');

module.exports = {
	...messages,
	...users,
	...encryption,
}