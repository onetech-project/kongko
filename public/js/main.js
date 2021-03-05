const key = "hbghjrbjgb7";
const errorText = "Cannot send message. Please try again";
const audio = new Audio("../assets/notification.mp3");

// Get roomname from localstorage
function getRoomname() {
  return localStorage.getItem("roomname");
}

// Get username from localstorage
function getUsername() {
  return localStorage.getItem("username");
}

// Set username to localstorage
function setUsername(username) {
  localStorage.setItem("username", username);
}

// Set roomname to localstorage
function setRoomname(roomname) {
  localStorage.setItem("roomname", roomname);
}

// encrypt message to server
function encrypt(msg) {
  return CryptoJS.AES.encrypt(JSON.stringify(msg), key).toString();
}

// decrypt message from server
function decrypt(encryptedMsg) {
  return JSON.parse(
    CryptoJS.AES.decrypt(encryptedMsg, key).toString(CryptoJS.enc.Utf8)
  );
}

// base64 checker
function isBase64(message) {
  let valid = false;
  try {
    // if (btoa(atob(message)) === message) valid = true;
    if (message.includes("base64")) valid = true;
  } catch (error) {
    valid = false;
  } finally {
    return valid;
  }
}

// compress image
function compressImage(image, callback) {
  try {
    const img = new Image();
    img.src = URL.createObjectURL(image);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File(
            [blob],
            `${new Date().getTime()}.jpeg`
          );
          callback(compressedFile);
        },
        "image/jpeg",
        0.3
      );
    };
  } catch (error) {
    outputMessage({
      username: document.title,
      text: errorText,
      time: getTime12HourFormat(),
    });
  }
}

// Get time 12 hour format
function getTime12HourFormat() {
  return new Date().toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

// Play audio notification
function playAudioNotification() {
  return audio.play();
}

// Show notification
function showNotification({ title, body }) {
  const notification = new Notification(title, {
    body,
    icon: "../../favicon.ico",
  });

  notification.onclick = (e) => {
    window.location.href = `${window.location.origin}/chat.html`;
  };
}

// Check notification permission
function checkNotificationPermission({ title, body }) {
  switch (Notification.permission) {
    case 'granted':
      showNotification({ title, body });
      break;
    case 'denied':
      break;
    default:
      Notification.requestPermission().then(() => {
        checkNotificationPermission()
      });
      break;
  }
}

export {
  getRoomname,
  getUsername,
  setRoomname,
  setUsername,
  encrypt,
  decrypt,
  compressImage,
  isBase64,
  showNotification,
  checkNotificationPermission,
  playAudioNotification,
};
