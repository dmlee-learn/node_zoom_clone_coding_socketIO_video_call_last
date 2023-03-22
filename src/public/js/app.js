const socket = io();
const myFace = document.querySelector("#myFace");
const muteBtn = document.querySelector("#mute");
const cameraBtn = document.querySelector("#camera");
const camerasSelect = document.querySelector("#cameras");

const call = document.querySelector("#call");

let roomName = "";

const peersStream = document.querySelector("#peersStream");
//----------------RTCPeerConnection : S---------------------
let myPeerConnection;

function handleIce(data) {
  socket.emit("ice", data.candidate, roomName);
  console.log("sent candidate");
}

function handleAddStream(data) {
  peerFace.srcObject = data.stream;
}

function makeConnection() {
  // myPeerConnection = new RTCPeerConnection({
  //   iceServers: [
  //     {
  //       urls: [
  //         "stun:stun.l.google.com:19302",
  //         "stun:stun1.l.google.com:19302",
  //         "stun:stun2.l.google.com:19302",
  //         "stun:stun3.l.google.com:19302",
  //         "stun:stun4.l.google.com:19302",
  //       ],
  //     },
  //   ],
  // });
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  if (myStream) {
    //카메라가 없는 컴퓨터에서 에러 발생 방지 20230315
    myStream
      .getTracks()
      .forEach((track) => myPeerConnection.addTrack(track, myStream));
  } else {
    console.log("myStream : null");
  }
}
//----------------RTCPeerConnection : E---------------------
//----------------DATA Channel : S---------------------
let myDataChannel;
async function CreateDataChannel(peerConnection) {
  myDataChannel = peerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", console.log);
  console.log("Made data channel");
}

//----------------DATA Channel : E---------------------
//----------------Welcom : S---------------------
socket.on("welcome", async (nickname, count) => {
  console.log("[Someone joined]", "nickname : ", nickname, ", count :", count);
  await CreateDataChannel(myPeerConnection);
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});
//----------------Welcom : E---------------------

socket.on("offer", async (offer) => {
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", console.log);
  });
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
});

socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
  console.log("received candidate add");
});

//----------------방 입장 : S---------------------
async function initCall() {
  const call = document.querySelector("#call");
  call.classList.remove("hidden");
  welcome.classList.add("hidden");
  await getMedia();
  makeConnection();
}

const welcome = document.querySelector("#welcome");
welcomeForm = welcome.querySelector("form");
async function handleWelcomeSubmit(event) {
  event.preventDefault();
  await initCall();
  const input = welcomeForm.querySelector("input");
  roomName = input.value;
  socket.emit("join_room", input.value);
  input.value = "";
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);
//----------------방 입장 : E---------------------

let myStream;
async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");

    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      let option = document.createElement("option");
      let label = camera.label;
      const labelSubsrtCount =
        label.lastIndexOf("(") > 0 ? label.lastIndexOf("(") : label.length;
      label = label.substr(0, labelSubsrtCount);
      option.text = label;
      option.value = camera.deviceId;
      if (currentCamera.label === camera.label) option.selected = true;
      camerasSelect.appendChild(option);
    });
    //console.log(cameras);
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) await getCameras();
    console.log(myStream);
  } catch (e) {
    console.log(e);
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

camerasSelect.addEventListener("change", handleCameraChange); //카메라 변경 이벤트는 changed가 아니라 change

let muted = false;
function handleMuteBtnClick() {
  if (muted) muteBtn.innerText = "Mute";
  else muteBtn.innerText = "Unmute";

  muted = !muted;
  myStream.getAudioTracks().forEach((track) => (track.enabled = !muted));
}
muteBtn.addEventListener("click", handleMuteBtnClick);

let cameraOff = false;
function handleCameraBtnClick() {
  if (cameraOff) cameraBtn.innerText = "Turn Camera OFF";
  else cameraBtn.innerText = "Turn Camera ON";

  cameraOff = !cameraOff;
  myStream.getVideoTracks().forEach((track) => (track.enabled = !cameraOff));
}
cameraBtn.addEventListener("click", handleCameraBtnClick);
