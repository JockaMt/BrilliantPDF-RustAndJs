import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { check } from '@tauri-apps/plugin-updater';


async function checkForAppUpdates(onUserClick) {
    console.log("cheking...")
    const update = await check();
}

checkForAppUpdates(false).then()

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
