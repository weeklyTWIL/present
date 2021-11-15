require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { PeerServer, ExpressPeerServer } = require("peer");
const axios = require("axios");

const api = express();
const http_server = createServer(api);

const report = async (message) => {
  try {
    await axios.post(process.env.REPORTING_WEBHOOK, { content: message });
  } catch (error) {
    console.log("error reporting: ", error);
  }
};

// initializing server state

let hosts = [];
const secret = Math.random().toString(36).slice(-8);
report(`new secret for hosts is ${secret}`);

// api routes

api.get("/hosts", (request, response) => {
  response.send(hosts);
});

// peerjs server
const peerServer = ExpressPeerServer(http_server, { path: "/", proxied: true });

peerServer.on("connection", (client) => {
  console.log("new peer is connected!");
});

peerServer.on("disconnect", (client) => {
  console.log("new peer is disconnected!");
});

api.use("/peerjs", peerServer);

// socketio server
const io = new Server(http_server, {
  path: "/socketio",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
  allowEIO3: true,
});

io.use((socket, next) => {
  console.log("a new host is trying to connect!");
  console.log(socket.handshake.auth);

  // checking if secret is valid
  if (socket.handshake.auth.secret != secret) {
    console.log(
      "invalid secret! found " +
        socket.handshake.auth.secret +
        " instead of " +
        secret
    );
    return next(new Error("invalid secret"));
  }

  // making sure that host name is unique
  if (hosts.find((host) => host.name == socket.handshake.auth.name)) {
    console.log("host name is not unique!");
    return next(
      new Error("host " + socket.handshake.auth.name + " already exists")
    );
  }
  hosts.push({
    socket_id: socket.id,
    name: socket.handshake.auth.name,
    state: "idle",
  });
  next();
});

io.on("connection", (socket) => {
  console.log("a new host is connected");
  const send_host_code = () => {
    const code = Math.floor(Math.random() * 90 + 10);
    socket.emit(socket.id, code);
    const host_index = hosts.findIndex(
      (host) => host.name == socket.handshake.auth.name
    );
    hosts[host_index].code = code;
  };
  send_host_code();
  const interval_id = setInterval(send_host_code, 10000);
  socket.on("disconnect", () => {
    console.log("socket is disconnected!");
    clearInterval(interval_id);
    hosts = hosts.filter((host) => host.socket_id != socket.id);
  });
});

// listening

http_server.listen(11000);
