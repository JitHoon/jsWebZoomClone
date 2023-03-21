
import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

// pug set
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// public static 설정
app.use("/public", express.static(__dirname + "/public"));
// url get 요청 시 reder할 파일 설정
app.get("/", (req, res) => res.render("home"));
// "/"외 url get 요청 시 redirect
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// http protocol 서버 생성
const server = http.createServer(app);
// 3000 PORT에 handleListen 함수 실행
//app.listen(3000, handleListen);

// http protocol가 가능한 PORT 위에 websocket protocol 서버 추가 생성
const wss = new WebSocket.Server({ server });

// js와 유사하게 ws 또한 event(on method, socket) 들을 가지고 있으며 
// vanilla js 문법과 유사하게 handling 할 수 있다.
/*
function handleConnection(socket) {
    console.log(socket)
}
wss.on("connection", handleConnection)
*/
// wss event listen
// wss.on("connection", (socket)=>{console.log(socket);});

// 접속한 모든 브라우저에 메세지를 전송하기위한 임시 데이터 베이스
const sockets = [];

wss.on("connection", (socket) => {
    // 접속한 브라우저 저장
    sockets.push(socket);
    // socket 자체도 object 형태로 접근 가능
    socket["nickname"] = "Anon";
    console.log("Connected to Browser ✅");
    // socket 또한 front에서 보내는 event에 대한 다앙한 Listener들이 존재한다.
    // close, message 등
    // socket event 'close'
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));
    // socket event 'message'
    socket.on("message", (msg) => {
        // 문자열로 전송받은 데이터 object로 변환
      const message = JSON.parse(msg);
      // msg onject의 메세지 종류 별로 전송하는 데이터 달리하기
      switch (message.type) {
        case "new_message":
          sockets.forEach((aSocket) =>
            aSocket.send(`${socket.nickname}: ${message.payload}`)
          );
          break;
        case "nickname":
          socket["nickname"] = message.payload;
          break;
      }
    });
    // front로 message를 보내는 socket method
    // socket.send("hello!!!");
  });

// express, http 서버 listen
server.listen(3000, handleListen);