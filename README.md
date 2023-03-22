#Noom

Zoom Clone using NodeJS, webRTC and WebSockets.
url:https://nomadcoders.co/noom/lobby

step 1:<br>
{<br>
  install<br>
  npm i nodemon -D<br>
  npm i @babel/core @babel/cli @babel/node -D<br>
  npm i @babel/preset-env -D<br>
  npm i express<br><br>
  npm i socket.io<br>
  npm i @socket.io/admin-ui<br>
  npm i pug<br>
  <br>
  makefile<br>
  nodemon.json<br>
  babel.config.json<br>
  /src/server.js : console.log("hello")<br>

  makefile<br>
  touch .gitignore :  /node_modules<br>
}<br>
step 1:<br>
{<br>
  import javascript in web<br>
  <script type="text/javascript" src="/socket.io/socket.io.js"></script><br>
}<br>
<br>
참고<br>
포트 에러 발생시<br>
lsof -i TCP:3000<br>
fuser -k -n tcp 3000<br>
<br>
참고사이트<br>
https://socket.io/<br>
<br>
1. 소켓의 이벤트는 명칭은 소문자 작성 해야함<br>
