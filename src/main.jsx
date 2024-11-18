import React from "react";
import ReactDOM from "react-dom/client";
import ReactPlayer from "react-player";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        {/*<div className="flex w-full h-screen">*/}
        {/*    <ReactPlayer*/}
        {/*        url="./src/assets/splash.mp4"*/}
        {/*        playing={true}*/}
        {/*        width="100%"*/}
        {/*        height="100%"*/}
        {/*        className="object-cover"*/}
        {/*    />*/}
        {/*</div>*/}
        <App/>
    </React.StrictMode>
);
