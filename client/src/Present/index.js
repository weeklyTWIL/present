import Peer from "peerjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

function Present() {
  const { host } = useParams();
  const [code, set_code] = useState("");
  const [error, set_error] = useState(null);
  const [is_streaming, set_is_streaming] = useState(false);

  const share_screen = () => {
    console.log("sharing screen")
      navigator.mediaDevices
        .getDisplayMedia()
        .then((stream) => {
          console.log(stream)
          const peer = new Peer({
            host: "localhost",
            port: 80,
            path: "/server/peerjs",
          });

          peer.on("open", (id) => {
            console.log("peer open", id);
            peer.call(host, stream);
          });

          peer.on("connection", (conn) => {
            console.log("peer connection", conn);
          });

          peer.on("error", (err) => {
            console.log("peer error", err);
          });

          peer.on("close", () => {
            console.log("peer close");
          });

          peer.on("disconnected", () => {
            console.log("peer disconnected");
          });
        })
        .catch((error) => {
          set_error(error.message);
        });
  };

  if (is_streaming) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col p-6 shadow space-y-4 bg-gray-300 rounded">
          <p className="text-center">
            <span className="inline-block bg-green-500 w-2 h-2 rounded-full mr-2"></span>{" "}
            you are presenting on <strong>{host}</strong>!
          </p>
          <button
            className="bg-gray-500 rounded p-2"
          >
            stop sharing
          </button>
        </div>
      </div>
    );
  }

  if (!is_streaming)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col p-6 shadow space-y-4 bg-gray-300 rounded">
          <h1 className="text-center">
            stream to <strong>{host}</strong>
          </h1>
          <div className="space-y-2">
            <label className="block">
              <span>Code:</span>
            </label>
            <input
              className="p-2 rounded text-center"
              autoFocus
              value={code}
              onChange={(e) => set_code(e.target.value)}
            />
          </div>
          {error && <p className="py-2 px-4 bg-red-500 rounded">{error}</p>}
          <button className="bg-gray-500 rounded p-2" onClick={share_screen}>
            share screen
          </button>
        </div>
      </div>
    );
}

export default Present;
