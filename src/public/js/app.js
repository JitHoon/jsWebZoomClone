// connection socket.io server in front-end
const socket = io();

// get html elelment #enterRoom
const enterRoom = document.getElementById("enterRoom");
const form = enterRoom.querySelector("form");

// get html elelment #room
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function showRoom() {
  enterRoom.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
}

// "enter_room" event 실행 함수
function handleEnterRoom(event) {
  event.preventDefault();
  const input = form.querySelector("input");
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
// enterRoom btn EventListener
form.addEventListener("submit", handleEnterRoom);
