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
  // on은 addEventListener이라고 생각
  // socket.on() 을 통해 아래와 같은 정보를 가져올 수 있다. ((JSON.parse() 생략 가능)
  // socket.on(개발자가 지정한 event 이름, object, function)
  // (msg, done, ... ) n개의 argument를 받을 수 있다.
  socket.on("enter_room", (msg, done) => {
    console.log(msg);
    setTimeout(() => {
      done();
    }, 10000);
  });
});

// listen sever
const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);