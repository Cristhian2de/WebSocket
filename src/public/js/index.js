const userNameElement = document.querySelector(".userName");
const chatMessageElement = document.querySelector(".chatMessage");
const inputMessage = document.getElementById("inputMessage");
const btnMessage = document.getElementById("btnMessage");
const typingElement = document.querySelector(".typing");

let nameUser = "";
const socket = io();

Swal.fire({
  title: "Ingrese su Nombre",
  input: "text",
  inputAttributes: {
    autocapitalize: "on",
  },
  showCancelButton: false,
  confirmButtonText: "Ingresar",
}).then((result) => {
  userNameElement.textContent = result.value;
  nameUser = result.value;
  socket.emit("userConnection", { user: result.value });
});

const messageInnerHTML = (data) => {
  let message = "";

  for (let i = 0; i < data.length; i++) {
    if (data[i].info === "connection") {
      message += `<p class="connection">${data[i].message}</p>`;
    }
    if (data[i].info === "message") {
      message += `
        <div class="messageUser">
          <h5>${data[i].name}</h5>
          <p>${data[i].message}</p>
        </div>
      `;
    }
  }

  return message;
};

const clearMessageInput = () => {
  inputMessage.value = "";
};

btnMessage.addEventListener("click", (e) => {
  e.preventDefault();
  socket.emit("userMessage", { message: inputMessage.value });
  clearMessageInput();
});

socket.on("userMessage", (data) => {
  chatMessageElement.innerHTML = messageInnerHTML(data);
});

inputMessage.addEventListener("keypress", () => {
  socket.emit("typing", { nameUser });
});

socket.on("typing", (data) => {
  typingElement.textContent = `${data.nameUser} escribiendo...`;
});