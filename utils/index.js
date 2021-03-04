const formatMessage = require('./messages');
const users = require('./users');
const encryption = require('./encryption');

module.exports = {
	formatMessage,
	...users,
	...encryption,
}