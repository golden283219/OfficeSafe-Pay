import React, { useState, useEffect } from "react";
import { currentCustomerId, goBack } from "../../../utils";
import { BackButton } from "../../molecules/BackButton/BackButton";
import { Title } from "../../atoms/Title/Title";
import { Success } from "../../atoms/Success/Success";
import { Error } from "../../atoms/Error/Error";
import { Button } from "../../atoms/Button/Button";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { Wrapper } from "./11.css";
import ServerApi from "../../../ServerApi";

/**
 * Support request form
 *
 * @returns {JSX.Element}
 * @constructor
 */
function Screen11() {
  const [rendered, setRendered] = useState(false);

  const [form, setForm] = useState({
    message: "",
  });

  const formOnChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = (event) => {
    event.preventDefault();
    setFormSubmitRequested(true);
    formValidateBeforeSubmit();
  };

  const [formErrors, setFormErrors] = useState({
    message: false,
  });

  const [formHasError, setFormHasError] = useState(false);

  const [formSubmitRequested, setFormSubmitRequested] = useState(false);

  const [formTouched, setFormTouched] = useState(false);

  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    setRendered(true);
  }, []);

  useEffect(() => {
    if (formSubmitRequested && !formHasError && formTouched) {
      let appMeta = 'web';
      try {
        if (window.nodeapi) {
          appMeta = JSON.stringify(window.nodeapi.getAppMeta());
        }
      } catch(e) {
        //
      }

      ServerApi.request({
        path: 'support_requests',
        method: 'POST',
        payload: {
          user_id: currentCustomerId(),
          request: form.message,
          app_meta: appMeta,
        }
      }).then(() => setFormSubmitted(true))
    }
  }, [formHasError, formSubmitRequested]);

  useEffect(() => {
    if (rendered) {
      if (Object.values(formErrors).some((val) => val === true)) {
        setFormSubmitRequested(false);
        setFormHasError(true);
      } else {
        setFormHasError(false);
      }
    }
  }, [formErrors]);

  const formValidateBeforeSubmit = () => {
    const buffer = Object.assign({}, formErrors);
    for (const [key, value] of Object.entries(form)) {
      if (value.trim() === "") buffer[key] = true;
    }
    setFormErrors(buffer);
  };

  const formValidateField = (event) => {
    if (event.target.value.trim() === "") {
      setFormErrors({ ...formErrors, [event.target.name]: true });
    } else {
      setFormErrors({ ...formErrors, [event.target.name]: false });
    }
    setFormTouched(true);
    //validation goes here TODO
  };

  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper>
        <BackButton
          onClick={() => {
            goBack();
          }}
        />
        <Title>Request Support</Title>
        {formSubmitted ? (
          <Success fontSize={1.75} extendClass="success">
            Sent
          </Success>
        ) : (
          <form onSubmit={submit}>
            <textarea
              placeholder="type your request..."
              name="message"
              value={form.message}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            <Error visibility={formHasError} extendClass="form-error">
              Something is wrong...
            </Error>
            <Button>Submit</Button>
          </form>
        )}
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}

export { Screen11 };
