import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "./assets/css/style.css";
import App from "./App";
import ServerApi from "./ServerApi";
import Processor from "./Processor";
import WinAutomate from "./WinAutomate";
import { MessageBox } from "./components/molecules/MessageBox/MessageBox";
import store from "./store";

ServerApi.init({
  endpoint: "http://localhost:3001/",
  auth: "2b10y7UnPTFBszk2dq0xXdJDC.mdtjq2QlBPezcLHeVxRFgFQQOXkC1bK",
});
Processor.init();
WinAutomate.init();

ReactDOM.render(
  <React.StrictMode>
    <meta charSet="utf-8" />
    <title>OfficeSafe Pay [osp]</title>
    <Provider store={store}>
      <App />
    </Provider>
    <MessageBox />
  </React.StrictMode>,
  document.getElementById("root")
);
