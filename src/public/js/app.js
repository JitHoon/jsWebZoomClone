// 브라우저와 백엔드 간의 connection 이벤트를 위한 소스코드
// window.location.host를 통해 접속자의 url을 가져올 수 있다.
const socket = new WebSocket(`ws://${window.location.host}`);
// message html element 가져오기
const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
// socket 또한 다양한 EventListener가 존재한다.
// open, message, close 등
// socket event 'open'
socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});
// socket event 'close'
socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌");
});
/*
// socket event 'message'
socket.addEventListener("message", (message) => {
    console.log("New message: ", message.data);
});

// socket method : 5초 후 backend로 message를 보냄
setTimeout(() => {
    socket.send("hello from the browser!");
}, 5000);
*/
// 백엔드에서 다시 받은 메세지 프론트에 생성
socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});
// 입력받은 메세지 문자열화
function makeMessage(type, payload) {
    const msg = { type, payload };
    return JSON.stringify(msg);
}
// 백엔드에 nickname 전송
function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}
// 백엔드에 new_message 전송
function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);