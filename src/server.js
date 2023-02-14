/*
  socket data payload
  1 message
  {
    type:"message"
    , payload:"hello everyone"
  }
  
  2 nickname
  {
    type:"nickname"
    , payload:"nico"
  }
*/
import http from "http";
//import WebSocket from 'ws';
//import SocketIO from 'socket.io';
import {Server} from 'socket.io';
import {instrument} from '@socket.io/admin-ui';
import express from "express";


const app = express();
//view 엔진설정
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

//접근가능한 폴더 설정ex js, css, etc 
app.use("/public", express.static(__dirname + "/public"));

//라우터 및 렌더링 파일 설정
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const httpServer = http.createServer(app);
//const wsServer = SocketIO(httpServer);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});

instrument(wsServer, {
  auth: false,
  mode: "development",
});

function publicRooms() {
  //const sids = wsServer.socket.adapter.sids;
  //const rooms = wsServer.socket.adapter.rooms;
  //const {rooms, sids} = wsServer.socket.adapter;
  const {
    sockets: {
      adapter: { sids, rooms }
    }
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      //console.log(rooms.get(key).size);
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  //const count = wsServer.sockets.adapter.rooms.get(roomName).size;
  return wsServer.sockets.adapter.rooms.get(roomName)?.size; //방제 틀릴경우에 오류 방지를 위해 ? 사용
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => console.log(`socket event Any : ${event}`));
  wsServer.sockets.emit("room_change", publicRooms());
  socket.on("enter_room", (roomName, done) => {
    // console.log(socket.id);//id확인  console.log(socket.rooms); //방 리스트 확인 //https://socket.io/docs/v4/server-api/
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (message, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname} : ${message}`);
    done();
  });

  socket.on("nickname", (nickname) => socket["nickname"] = nickname);

  socket.on("disconnecting", (room) => socket.rooms.forEach(room => socket.to(room).emit('bye', socket.nickname), countRoom(room) - 1));

  socket.on("disconnect", () => wsServer.sockets.emit("room_change", publicRooms()));
});

/*
const wss = new WebSocket.Server({ server });

const sockets = [];

const messageType = ["nickname", "new_message"];

wss.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  sockets.push(socket);
  console.log("Connected to Brower ✔");
  socket.on('close', () => console.log('Disconnected to Browser ❌'));
  socket.on("message", (msg, isBinary) => {
    const data = isBinary ? msg : msg.toString();
    const message = JSON.parse(data);
    switch (message.type) {
      case messageType[0]:
        socket["nickname"] = message.payload;
        break;
      case messageType[1]:
        sockets.forEach((aSocket) => aSocket.send(`${socket.nickname} : ${message.payload}`));
        break;
      default:
        break;
    }
  });
  socket.send("welcome to chat");
})
*/
httpServer.listen(3000, handleListen);//http 로 서버 실행.listen(3000, handleListen);