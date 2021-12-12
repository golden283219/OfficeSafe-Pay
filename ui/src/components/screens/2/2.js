import React, { useState } from "react";
import { Wrapper, WelcomeText, TitleText } from "./2.css";
import { Button } from "../../atoms/Button/Button";
import { Textbox } from "../../molecules/Textbox/Textbox";
import { Error } from "../../atoms/Error/Error";
import { goToScreen } from "../../../utils";
import iconUser from "../../../assets/images/icon-user.svg";
import iconLock from "../../../assets/images/icon-lock.svg";
import { setUser } from "../../../utils";
import ServerApi from "../../../ServerApi";

function Screen2() {
  const [form, setForm] = useState({
    customer_id: "test",
    password: "test",
  });

  const formOnChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const [formHasError, setFormHasError] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    // if (form.customer_id === "test" && form.password === "test") {
    //   setUser({ customer_id: "1", name: "Kim" });
    //   setFormHasError(false);
    //   goToScreen(3);
    // } else {
    //   setFormHasError(true);
    // }
    ServerApi.request({
      path: "login",
      method: "POST",
      payload: {
        username: form.customer_id,
        password: form.password,
      },
    }).then(
      (data) => {
        console.log(data);
        if (data.status) {
          setUser({ customer_id: data.id, name: data.username });
          localStorage.setItem("token", data.token);
          setFormHasError(false);
          goToScreen(3);
        } else {
          setFormHasError(true);
        }
      },
      () => {
        setFormHasError(true);
      }
    );
  };

  return (
    <div className="wrapper">
      <Wrapper>
        <WelcomeText>Welcome to </WelcomeText>
        <TitleText>OfficeSafe Pay</TitleText>
        <form onSubmit={submit}>
          <Textbox
            label="Customer ID"
            placeholder="12 digit ID"
            name="customer_id"
            value={form.customer_id}
            onChange={formOnChange}
            iconWidth="0.5"
            iconHeight="0.5"
            icon={iconUser}
            extendCSS={{ marginTop: "3.875rem", marginBottom: "1.813rem" }}
          />
          <Textbox
            label="Password"
            placeholder="Your password"
            name="password"
            value={form.password}
            onChange={formOnChange}
            type="password"
            iconWidth="0.438"
            iconHeight="0.563"
            icon={iconLock}
            extendCSS={{
              marginTop: "1.813rem",
              marginBottom: "3.063rem",
            }}
          />
          <Error
            visibility={formHasError}
            extendCSS={{ marginTop: "-2rem", marginBottom: "1rem" }}
          >
            The user ID or Password is incorrect
          </Error>
          <Button>Sign In</Button>
        </form>
      </Wrapper>
    </div>
  );
}

export { Screen2 };
