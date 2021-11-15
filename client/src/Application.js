import axios from "axios";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import Host from "./Host";
import Present from "./Present";

function HostThumbnail(props) {
  return (
    <div className="bg-gray-300 p-4 rounded space-y-4 w-56">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{props.host.name}</h1>
        <h1 className="flex items-center">
          <span className="inline-block bg-green-500 w-2 h-2 rounded-full mr-2"></span>
          {props.host.state}
        </h1>
      </div>
      <Link
        className="w-full inline-block bg-gray-500 rounded p-2 text-center"
        to={"/present/" + props.host.name}
      >
        present
      </Link>
    </div>
  );
}

function HostsList() {
  const { isLoading, isError, isSuccess, data, error } = useQuery("hosts", () =>
    axios.get("/server/hosts")
  );

  const hosts = data?.data

  return (
    <div className="w-full h-full relative flex items-center justify-center gap-4">
      {isLoading && <h1>loading...</h1>}
      {isError && <h1>error fetching hosts {error.toString()}...</h1>}
      {isSuccess && !hosts?.length && <h1>there are no registered hosts.</h1>}
      {isSuccess && hosts?.map((host, i) => <HostThumbnail host={host} key={i} />)}
      <div className="absolute bottom-4 right-4">
        <Link to="/host" className="bg-gray-500 rounded p-2">
          add a host
        </Link>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

function Application() {
  return (
    <div className="w-full h-full bg-gray-200">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" exact element={<HostsList />}></Route>
            <Route path="/host" element={<Host />}></Route>
            <Route path="/present/:host" element={<Present />}></Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default Application;
