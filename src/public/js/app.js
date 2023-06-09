// connection socket.io server in front-end
const socket = io();

// get html elelment #nickName
const nickName = document.getElementById("nickName");
const h3 = nickName.querySelector("h3");
const nickNameForm = nickName.querySelector("form");

// get html elelment #enterRoom
const enterRoom = document.getElementById("enterRoom");
const enterForm = enterRoom.querySelector("form");

// get html elelment #room
const room = document.getElementById("room");
room.hidden = true;

// get html elelment #call (stream)
const call = document.getElementById("call");
call.hidden = true;

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
async function showRoomInitCall() {
  await getMedia();
  makeConnection();
  // room안에서 새로운 message를 submit했을 떄 handleMessageSubmit 함수 실행
  const form = room.querySelector("form");
  form.addEventListener("submit", handleMessageSubmit);
}
// "enter_room" event 실행 함수
async function handleEnterRoom(event) {
  event.preventDefault();
  const input = enterForm.querySelector("input");
  // socket.emit() // emit : 방출하다.
  // argument1 : "개발자가 임의로 지은 event 이름"
  // argument2 : object (JSON.stringify() 생략)
  // argument3 : function
  // n개의 argument를 보낼 수 있다.
  await showRoomInitCall();
  socket.emit("enter_room", input.value);
  roomName = input.value;
  nickName.hidden = true;
  enterRoom.hidden = true;
  room.hidden = false;
  call.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  input.value = "";
}
// changeNickname UI
function changeNickname(event) {
  event.preventDefault();
  h3.hidden = true;
  event.target.hidden = true;
  nickNameForm.hidden = false;
}
// Nickname event backend로 전송, 
function handleNickname(event) {
  event.preventDefault();
  nickNameForm.hidden = true;
  const input = nickNameForm.querySelector("input");
  socket.emit(
    "nickName", 
    input.value
  );
  userName = input.value;

  // userName 보여주기 및 수정 btn 생성 및 click event listen
  h3.innerText = userName;
  const changeBtn = document.createElement("button");
  changeBtn.innerText = "Change";
  nickName.appendChild(changeBtn);
  h3.hidden = false;
  changeBtn.hidden = false;
  changeBtn.addEventListener("click", changeNickname);
  input.value = "";
}
// nickName btn EventListener
nickName.addEventListener("submit", handleNickname);
// enterRoom btn EventListener
enterForm.addEventListener("submit", handleEnterRoom);
// backend에서 전송된 welcome event 받아 addMessage 함수 실행
socket.on("welcome", async (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} arrived!`);
  // peer A
  // create offer
  const offer = await myPeerConnection.createOffer();
  // 생성한 offer를 바탕으로 myPeerConnection에 offer를 구성하는 method
  myPeerConnection.setLocalDescription(offer);
  // send offer to server from front
  socket.emit("offer", offer, roomName);
});
// backend에서 전송된 bye event 받아 addMessage 함수 실행
socket.on("bye", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
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

// Video code
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
// 유저마다 navigator.mediaDevices.getUserMedia 값이 다르므로 let
let myStream;
let muted = false;
let cameraOff = false;
// 유저의 카메라 종류 가져오기 (처음 입장 했을 때만 동작)
async function getCameras() {
  try {
    // user가 '보유한' 모든 device 가져오기
    // navigator.mediaDevices : https://developer.mozilla.org/ko/docs/Web/API/Navigator/mediaDevices
    // navigator.mediaDevices 객체 가져오기 https://developer.mozilla.org/ko/docs/Web/API/MediaDevices
    const devices = await navigator.mediaDevices.enumerateDevices();
    // enumerateDevices() 를 통해 가져온 device.kind 중에서 videoinput (camera device)만 filter하여 반환
    const cameras = devices.filter((device) => device.kind === "videoinput");
    // 현재 '사용중인' (myStream) device중 video track에서 가장 상위에 있는 camera 정보가 현재 사용 중인 카메라
    const currentCamera = myStream.getVideoTracks()[0];
    // html option element를 생성하여 camera.deviceId 와 camera.label 보여주기
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      // '사용중인' 카메라와 '보유한' 카메라의 이름이 동일 할 때 해당 camera를 선택했다고 설정 option.selected = true;
      if (currentCamera.label === camera.label) {
        // <option> 태그의 selected 속성은 페이지가 로드될 때 옵션이 미리 선택된다.
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
// 유저의 비디오 및 마이크 가져오기
async function getMedia(deviceId) {
  // .getUserMedia(의 초기 constrain 정보)
  const initialConstrains = {
    audio: true,
    // 셀프 카메라 모드가 기본
    video: { facingMode: "user" },
  };
  // .getUserMedia(deviceId를 받았다면 새로운 constrain 정보 생성)
  const newConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    // navigator.mediaDevices : https://developer.mozilla.org/ko/docs/Web/API/Navigator/mediaDevices
    // navigator.mediaDevices 객체 가져오기 https://developer.mozilla.org/ko/docs/Web/API/MediaDevices
    // camera를 가져오는 것은 한번 이지만 변경된 camera 정보는 
    // newConstraints에서 갱신되어 myStream element에 paint 되므로
    //  getCameras가 한번만 실행되어도 상관 없다.
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? newConstraints : initialConstrains
    );
    // html에 media 보여주기
    myFace.srcObject = myStream;
    // deviceId가 없을 때(처음 입장했을 때)만 어떤 종류의 카메라 있는지 확인
    // getCameras 로 option elements들 생성
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}
// 음소가 on off hadle
function handleMuteClick() {
  // .getUserMedia() 를 통해 가져온 vaudio의 track을 가져와 enabled 속성 변경
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
// 카메라 on off hadle
function handleCameraClick() {
  // .getUserMedia() 를 통해 가져온 video의 각 track을 가져와 enabled 속성 변경
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}
// 유저가 카메라 선택 시 (select element의 input event) getMedia 동작
async function handleCameraChange() {
  // 카메라 변경시에도 소리 상태 유지
  if (muted) {
    myStream.getAudioTracks().forEach((track) => (track.enabled = false));
  } else {
    myStream.getAudioTracks().forEach((track) => (track.enabled = true));
  }
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
		// peer A에 있는 myStream에서 바뀐 후 video(camera)를 가져옴
    const videoTrack = myStream.getVideoTracks()[0];
		// peerB에 있는 sender에서 설정된 바뀌기 전 video(camera) 가져오기
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
		// videoSender를 videoTrack으로 변경하기
    videoSender.replaceTrack(videoTrack);
  }
}
// 카메라 on off, 음소거 on, off click event
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
// select html element 의 event는 input
camerasSelect.addEventListener("input", handleCameraChange);

// web RTC code
// RTCPeerConnection() 정보 저장
let myPeerConnection;
// peer connection 생성
function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  // offer, answer 교환이 일어난 후 icecandidate event 시작
  myPeerConnection.addEventListener("icecandidate", handleIce);
  // offer, answer, icecandidate 교환이 일어난 후 addstream event 시작
  myPeerConnection.addEventListener("track", handleAddStream);
	// 기존 stream의 track data들을 peer connection에 전송
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}
function handleIce(data) {
  // sent candidate to server from peer A
  socket.emit("ice", data.candidate, roomName);
}
// peer B
// get offer event from server
// front peer A (send offer event1) -> server (get offer event1, send offer event2) -> front peer B (get offer event2)
socket.on("offer", async (offer) => {
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  // send answer event to server
  socket.emit("answer", answer, roomName);
});
// peer A
// get answer event from server
socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});
// peer A, B
// icecandidate event는 양방향으로 전송된다.
// get ice candidate event from server
socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice);
});
// peer A, B
// icecandidate event는 양방향으로 전송된다.
function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.streams[0];
}