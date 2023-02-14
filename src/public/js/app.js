const EVENT_SUBMIT = 'submit';
const ELEMENT_INPUT = 'input';
const ELEMENT_LI = 'li';
const ELEMENT_DIV = 'div';

const socket = io();
const welcome = document.querySelector('#welcome');
const form = welcome.querySelector('form');
const room = document.querySelector('#room');
const msgForm = room.querySelector('#msg');
const nickForm = room.querySelector('#nick');
const ul = room.querySelector('ul');
let roomName = "";

//받은 메세지를 ul에 추가 : S
function addMessage(message) {
  const li = document.createElement(ELEMENT_LI);
  li.innerText = message;
  ul.appendChild(li);
}
//받은 메세지를 ul에 추가 : E

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} joined!`)
});

socket.on("bye", (user) => addMessage(`${user} left!`));

socket.on("new_message", addMessage);


//room list make
function listRoom(rooms) {
  const roomUl = welcome.querySelector('ul');
  roomUl.innerHTML = '';

  if (rooms.length > 0) {
    rooms.forEach((room) => {
      const li = document.createElement(ELEMENT_LI);
      li.innerText = room;
      roomUl.appendChild(li);
    });
  }
}
socket.on("room_change", listRoom);

socket.on(roomName, () => addMessage(`${roomName} : test`));

function showRoom() {
  room.classList.remove('hidden');
  welcome.classList.add('hidden');
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  msgForm.addEventListener(EVENT_SUBMIT, handleMessageSubmit);
  nickForm.addEventListener(EVENT_SUBMIT, handleNicknameSubmit);
}

//방 입장 : S
function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector(ELEMENT_INPUT);
  if ('' == input.value) {
    alert("입장을 원하는 방의 이름을 입력해주세요!!");
    return false;
  }
  socket.emit('enter_room', input.value, showRoom);
  roomName = input.value;
  input.value = "";
}
form.addEventListener(EVENT_SUBMIT, handleRoomSubmit);
//방 입장 : E

//메세지 전달 기능 : S
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#msg input');
  socket.emit('new_message', input.value, roomName, () => {
    addMessage(`you : ${input.value}`)
    input.value = "";
  });
}
//메세지 전달 기능 : E

//nickname 전달 기능 : S
function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#nick input');
  socket.emit('nickname', input.value);
}
//닉 전달 기능 : E