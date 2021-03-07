import { httpRequest } from "./main.js";

document.addEventListener("submit", () => {
  login();
});

// Login
function login() {
  const username = document.getElementById("username").value;
  const room = document.getElementById("room").value;
  httpRequest({ endpoint: "login", data: { username, room } }).then((res) => {
    if (res.valid) {
      localStorage.setItem("data", res.id);
      window.location.href = `${window.location.origin}/chat.html`;
    } else {
      document
        .getElementById("username")
        .setAttribute("style", "border: 3px solid red;border-radius: 5px;");
      document.getElementById("username").setAttribute("title", res.message);
    }
  });
  return false;
}
