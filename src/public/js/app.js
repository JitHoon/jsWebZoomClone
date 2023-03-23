// connection socket.io server in front-end
const socket = io();

// get html elelment #enterRoom
const enterRoom = document.getElementById("enterRoom");
const form = enterRoom.querySelector("form");

// backend socket.on() 에서 호출하는 마지막 argument
function backendDone(msg) {
  console.log(`The backend says: `, msg);
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
    backendDone
  );
  input.value = "";
}
// enterRoom btn EventListener
form.addEventListener("submit", handleEnterRoom);
