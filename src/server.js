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
wss.on("connection", (socket)=>{console.log(socket);});

server.listen(3000, handleListen);