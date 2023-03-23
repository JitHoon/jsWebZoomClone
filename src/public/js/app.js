// connection socket.io server in front-end
const socket = io();

// get html elelment #nickName
const nickName = document.getElementById("nickName");
const nickNameForm = nickName.querySelector("form");

// get html elelment #enterRoom
const enterRoom = document.getElementById("enterRoom");
const enterForm = enterRoom.querySelector("form");

// get html elelment #room
const room = document.getElementById("room");

room.hidden = true;

let roomName;
let userName;
// 새로운 message 생성 UI
function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}
// room에서 새로운 message 전송
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("input");
  const value = input.value;
  // new_message event 생성 (입력값 backend로 전달)
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}
// room이 생성 되고 들어갔을 때 UI
function showRoom() {
  nickName.hidden = true;
  enterRoom.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  // room안에서 새로운 message를 submit했을 떄 handleMessageSubmit 함수 실행
  const form = room.querySelector("form");
  form.addEventListener("submit", handleMessageSubmit);
}
// "enter_room" event 실행 함수
function handleEnterRoom(event) {
  event.preventDefault();
  const input = enterForm.querySelector("input");
  // socket.emit() // emit : 방출하다.
  // argument1 : "개발자가 임의로 지은 event 이름"
  // argument2 : object (JSON.stringify() 생략)
  // argument3 : function
  // n개의 argument를 보낼 수 있다.
  socket.emit(
    "enter_room", 
    input.value, 
    showRoom
  );
  roomName = input.value;
  input.value = "";
}
function handleNickname(event) {
  event.preventDefault();
  const input = nickNameForm.querySelector("input");
  socket.emit(
    "nickName", 
    input.value
  );
  userName = input.value;
  input.value = "";
}
// nickName btn EventListener
nickName.addEventListener("submit", handleNickname);
// enterRoom btn EventListener
enterForm.addEventListener("submit", handleEnterRoom);
// backend에서 전송된 welcome event 받아 addMessage 함수 실행
socket.on("welcome", (user) => {
  addMessage(`${user} arrived!`);
});
// backend에서 전송된 bye event 받아 addMessage 함수 실행
socket.on("bye", (user) => {
  addMessage(`${user} left ㅠㅠ`);
});
// backend에서 전송된 new_message event 받아 addMessage 함수 실행
socket.on("new_message", addMessage);
// backend에서 전송된 room_change event 받아 addMessage 함수 실행
socket.on("room_change", (rooms) => {
  // Open Rooms 들을 나열할 의 html element
  const roomList = enterRoom.querySelector("ul");
  // room_change 될 때마다 HTML 내용 새롭게 생성
  roomList.innerHTML = "";
  // rooms가 빈 array 일 때 event가 동작하도록 해주는 코드
  if (rooms.length === 0) {
    return;
  }
  // 받아온 publicRooms()의 return 값 publicRooms array 나열
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});