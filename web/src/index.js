import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./assets/css/reset.css";
import ServerApi from "./ServerApi";
require("dotenv").config();

ServerApi.init({
  endpoint: process.env.REACT_APP_ENDPOINT,
  auth: process.env.REACT_APP_AUTH,
});

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
