// 브라우저와 백엔드 간의 connection 이벤트를 위한 소스코드
// window.location.host를 통해 접속자의 url을 가져올 수 있다.
const socket = new WebSocket(`ws://${window.location.host}`)

// socket 또한 다양한 EventListener가 존재한다.
// open, message, close 등
// socket event 'open'
socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});
// socket event 'message'
socket.addEventListener("message", (message) => {
    console.log("New message: ", message.data);
});
// socket event 'close'
socket.addEventListener("close", () => {
    console.log("Disconnected from Server ❌");
});
// socket method : 5초 후 backend로 message를 보냄
setTimeout(() => {
    socket.send("hello from the browser!");
}, 5000);