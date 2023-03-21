// 브라우저와 백엔드 간의 connection 이벤트를 위한 소스코드
// window.location.host를 통해 접속자의 url을 가져올 수 있다.
const socket = new WebSocket(`ws://${window.location.host}`)