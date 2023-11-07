import express from "express";
import { engine } from "express-handlebars";
import { __dirname } from "./utils.js";
import * as path from "path";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 3030;

try {
  const server = app.listen(PORT, () => {
    console.log(`Server run Express port: ${PORT}`);
  });

  const io = new Server(server);

  app.engine("handlebars", engine());
  app.set("view engine", "handlebars");
  app.set("views", path.resolve(__dirname + "/views"));

  app.use("/", express.static(__dirname + "/public"));

  app.get("/", (req, res) => {
    res.render("index");
  });

  const message = [];
  const MAX_MESSAGES = 50;

  io.on("connection", (socket) => {
    console.log(`User ${socket.id} Connection`);

    let userName = "";

    socket.on("userConnection", (data) => {
      userName = data.user;
      message.push({
        id: socket.id,
        info: "connection",
        name: data.user,
        message: `${data.user} Connectado`,
        date: new Date().toTimeString(),
      });

      if (message.length > MAX_MESSAGES) {
        message.shift();
      }

      io.sockets.emit("userConnection", message);
    });

    socket.on("userMessage", (data) => {
      message.push({
        id: socket.id,
        info: "message",
        name: userName,
        message: data.message,
        date: new Date().toTimeString(),
      });

      if (message.length > MAX_MESSAGES) {
        message.shift();
      }

      io.sockets.emit("userMessage", message);

      // Emitir el evento para limpiar el cuadro de texto en el lado del cliente
      socket.emit("clearMessageInput");
    });

    socket.on("typing", (data) => {
      socket.broadcast.emit("typing", data);
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.id} Disconnected`);
      const index = message.findIndex((msg) => msg.id === socket.id);
      if (index !== -1) {
        message.splice(index, 1);
        io.sockets.emit("userConnection", message);
      }
    });
  });
} catch (error) {
  console.error("Error al iniciar el servidor:", error);
}
