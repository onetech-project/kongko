const cryptojs = require("crypto-js");
const key = "hbghjrbjgb7";

function encrypt(msg) {
  return cryptojs.AES.encrypt(JSON.stringify(msg), key).toString();
}

function decrypt(encryptedMsg) {
  return JSON.parse(
    cryptojs.AES.decrypt(encryptedMsg, key).toString(cryptojs.enc.Utf8)
  );
}

module.exports = {
  encrypt,
  decrypt,
  key,
};
