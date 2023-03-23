import express from "express";
import http from "http";
import { Server } from "socket.io";

// express
const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

// create http, socket.io server
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

// connection socket.io server in back-end
wsServer.on("connection", (socket) => {
  console.log(socket);
});

// listen sever
const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);