import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  //console.log(socket);
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
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

  //방진입시 카메라 켜도록 신호 전송
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });

  //메세지 처리
  socket.on("new_message", (message, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname} : ${message}`);
    done();
  });

  //닉네임 변경
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));

  //접속 종료중
  socket.on("disconnecting", (room) =>
    socket.rooms.forEach(
      (room) => socket.to(room).emit("bye", socket.nickname),
      countRoom(room) - 1
    )
  );

  //접속 종료
  socket.on("disconnect", () =>
    wsServer.sockets.emit("room_change", publicRooms())
  );

  //peer 입장 정보 공유
  socket.on("offer", (offer, roomName) =>
    socket.to(roomName).emit("offer", offer)
  );
  //초대장 응답
  socket.on("answer", (answer, roomName) =>
    socket.to(roomName).emit("answer", answer)
  );
  //ice candidate
  socket.on("ice", (ice, roomName) => socket.to(roomName).emit("ice", ice));
});

httpServer.listen(process.env.PORT, handleListen);
