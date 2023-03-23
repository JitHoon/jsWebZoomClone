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
  socket.on("enter_room", (roomName, done) => {
    // socket.onAny() 어떤 event든 가져올 수 있는 method
    socket.onAny((eventName) => {
      console.log(`Socket Event: ${eventName}`);
    });
    // socket.join() room 생성 및 room으로 들어가는 method
    socket.join(roomName);
    console.log(socket.rooms)
    // front에서의 showRoom 함수 실행
    done();
    // 모든 방으로 welcome event를 frontend로 전송
    socket.to(roomName).emit("welcome");
  });
  // 사용자의 서버가 종료 되었음을 알려주는 method
  socket.on("disconnecting", () => {
    // 모든 방으로 welcome event를 frontend로 전송
    socket.rooms.forEach((room) => socket.to(room).emit("bye"));
  });
  // frontend에서 new_message event를 listen
  socket.on("new_message", (msg, room, done) => {
    // frontend에서 보낸 room으로 새로운 message 전달
    // socket.to를 하는 경우는 발신자를 제외하고 전송
    // 발신자를 포함하여 전송하려면 io.to를 (여기서는 wsServer.to)사용
    socket.to(room).emit("new_message", msg);
    // frontend 있는 마지막 함수 실행
    done();
  });
});

// listen sever
const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);