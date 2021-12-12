import React from "react";
import logo from "../../../assets/images/logo.svg";
import { LoginButton } from "./1.css";
import { goToScreen } from "../../../utils";

function Screen1() {
  return (
    <div className="wrapper bg-blue">
      <img src={logo} className="logo" alt="logo" />
      <LoginButton
        onClick={() => {
          goToScreen(2);
        }}
      >
        Log in with existing account
      </LoginButton>
    </div>
  );
}

export { Screen1 };
