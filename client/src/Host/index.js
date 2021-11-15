import Peer from "peerjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";

function Streamor(props) {
  useEffect(() => {
    const video = document.getElementById("stream");
    console.log(video, props.stream);
    video.srcObject = props.stream;
  }, []);

  return (
    <div className="h-full w-full">
      <video id="stream" autoPlay className="w-full h-full"></video>
    </div>
  );
}

function Authenticator(props) {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <h1 className="text-7xl">{props.code}</h1>
    </div>
  );
}

function HostRegistror(props) {
  const [credentials, set_credentials] = useState({
    name: "",
    secret: "",
  });

  return (
    <div className="flex flex-col p-6 shadow space-y-4 bg-gray-300 rounded">
      <h1 className="text-center">register a new host</h1>
      <div className="space-y-2">
        <label className="block">
          <span>name:</span>
        </label>
        <input
          className="p-2 rounded "
          autoFocus
          value={credentials.name}
          onChange={(e) =>
            set_credentials({ ...credentials, name: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <label className="block">
          <span>secret:</span>
        </label>
        <input
          className="p-2 rounded "
          autoFocus
          value={credentials.secret}
          onChange={(e) =>
            set_credentials({ ...credentials, secret: e.target.value })
          }
        />
      </div>
      {props.error && (
        <p className="py-2 px-4 bg-red-500 rounded">{props.error}</p>
      )}
      <button
        className="bg-gray-500 rounded p-2"
        onClick={() => props.onSubmit(credentials)}
      >
        register
      </button>
    </div>
  );
}

function Host() {
  const [error, set_error] = useState(null);
  const [connected, set_connected] = useState(false);
  const [host, set_host] = useState(null);
  const [code, set_code] = useState(null);
  const [stream, set_stream] = useState(null);

  useEffect(() => {
    if (host) {
      const peer = new Peer(host, {
        host: "localhost",
        port: 80,
        path: "/server/peerjs",
      });

      peer.on("call", (call) => {
        console.log("we called");
        call.answer();
        call.on("stream", function (_stream) {
          console.log("we got a stream", _stream);
          set_stream(_stream);
        });
      });

      peer.on("error", (err) => {
        console.log("peer error", err);
      });

      peer.on("disconnected", () => {
        console.log("peer disconnected");
      });
      return () => {
        peer.destroy();
      };
    }
  }, [host]);

  const register_host = (credentials) => {
    set_host(credentials.name);
    const socket = io("http://localhost", {
      path: "/server/socketio",
      auth: credentials,
      reconnection: false,
    });

    socket.on("connect", () => {
      console.log("connected");
      set_connected(true);
      socket.on(socket.id, (code) => {
        console.log(code);
        set_code(code);
      });
    });

    socket.on("connect_error", (error) => {
      console.log(error);
      set_error(error.message);
    });
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center gap-4">
      {!code && <HostRegistror error={error} onSubmit={register_host} />}
      {code && !stream && <Authenticator code={code} />}
      {stream && <Streamor stream={stream} />}
    </div>
  );
}

export default Host;
