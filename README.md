#Noom

Zoom Clone using NodeJS, webRTC and WebSockets.
url:https://nomadcoders.co/noom/lobby

step 1:
{
  install
  npm i nodemon -D
  npm i @babel/core @babel/cli @babel/node -D
  npm i @babel/preset-env -D
  npm i express
  npm i socket.io
  npm i @socket.io/admin-ui
  npm i pug
  
  makefile
  nodemon.json
  babel.config.json
  /src/server.js : console.log("hello")

  makefile
  touch .gitignore :  /node_modules
}
step 1:
{
  import javascript in web
  <script type="text/javascript" src="/socket.io/socket.io.js"></script>
}

참고
포트 에러 발생시
lsof -i TCP:3000
fuser -k -n tcp 3000

참고사이트
https://socket.io/

1. 소켓의 이벤트는 명칭은 소문자 작성 해야함
