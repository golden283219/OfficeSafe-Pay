import React, { useState, useEffect } from "react";
import {
  currentCustomerId,
  goBack,
  goToHome,
  goToScreen,
  // panMask,
  usePreservableState,
} from "../../../utils";
import { BackButton } from "../../molecules/BackButton/BackButton";
import { Title } from "../../atoms/Title/Title";
import { Textbox } from "../../molecules/Textbox/Textbox";
import { Button } from "../../atoms/Button/Button";
import { Error } from "../../atoms/Error/Error";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { Wrapper, BillingInfo } from "./19.css";
import ServerApi from "../../../ServerApi";
// import { Checkbox } from "../../molecules/Checkbox/Checkbox";

/**
 * Add patient
 *
 * Contact info + card authorization button
 * On submit - write to backend
 *
 * @returns {JSX.Element}
 * @constructor
 */
function Screen19() {
  const [rendered, setRendered] = useState(false);
  const [patient] = usePreservableState("patient", {
    patient: global?.statePayload?.patient || { id: 0 },
  });

  if (patient.patient.id == 0) {
    goToHome();
    return null;
  }

  const [form, setForm] = usePreservableState("form", {
    card_token: "",
    card_exp: "",
    card_address: "",
    card_city: "",
    card_state: "",
    card_zip: "",
    card_cvc: "",
    // manual_input: "false",
  });

  const formOnChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = (event) => {
    event.preventDefault();
    if (formValidateBeforeSubmit()) {
      submitFormData();
    }
  };

  const [formErrors, setFormErrors] = useState({
    card_token: false,
    card_exp: false,
    card_address: false,
    card_city: false,
    card_state: false,
    card_zip: false,
    card_cvc: false,
    general: false,
  });

  const [formHasError, setFormHasError] = useState(false);
  const [checkCard, setCheckCard] = useState(true);
  const [uiFreezed, setFreeze] = useState(false);

  useEffect(() => {
    setRendered(true);
  }, []);

  const setGeneralFormError = (message) => {
    if (message == "Card is not valid!") {
      setCheckCard(false);
    }
    setFormErrors({ ...formErrors, general: message });
  };

  const submitFormData = () => {
    if (uiFreezed) return;
    setFreeze(true);
    ServerApi.request({
      path: "add_card",
      method: "POST",
      payload: {
        user_id: currentCustomerId(),
        patient_id: patient.id,
        customer_vault_id: patient.customer_vault_id,
        card_token: form.card_token,
        card_exp: form.card_exp,
        card_address: form.card_address,
        card_city: form.card_city,
        card_state: form.card_state,
        card_zip: form.card_zip,
        card_cvc: form.card_cvc,
      },
    }).then(
      (data) => {
        setCheckCard(true);

        if (data) {
          goToScreen(18, {
            patient,
          });
        }
      },
      () => {
        setFreeze(false);
        setGeneralFormError("Card is not valid!");
      }
    );
  };

  useEffect(() => {
    if (rendered) {
      if (Object.values(formErrors).some((val) => val !== false)) {
        setFormHasError(true);
      } else {
        setFormHasError(false);
      }
    }
  }, [formErrors]);

  const formValidateBeforeSubmit = () => {
    const buffer = Object.assign({}, formErrors);
    for (const [key] of Object.entries(formErrors)) {
      if (typeof form[key] === "string" && form[key].trim() === "") {
        buffer[key] = true;
      }
    }
    buffer.general = false;
    setFormErrors(buffer);
    // return is any errors remains
    return Object.values(buffer).some((val) => val !== false) === false;
  };

  const formValidateField = (event) => {
    if (event.target.value.trim() === "") {
      setFormErrors({ ...formErrors, [event.target.name]: true });
    } else {
      setFormErrors({ ...formErrors, [event.target.name]: false });
    }
  };

  return (
    <div className="wrapper">
      <Wrapper className="deduct-bottom-nav-bar-and-start-from-the-top">
        <BackButton
          onClick={() => {
            goBack();
          }}
        />
        <Title>Add Card</Title>
        <form onSubmit={submit}>
          <Title variant="h2" color={checkCard ? "black" : "red"}>
            Card Info
          </Title>
          <BillingInfo>
            <Textbox
              label="Card Number"
              floatLabel={true}
              name="card_token"
              value={form.card_token}
              error={formErrors.card_token}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            <Textbox
              label="Expiration Date"
              floatLabel={true}
              name="card_exp"
              value={form.card_exp}
              error={formErrors.card_exp}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            <Textbox
              label="CVC"
              floatLabel={true}
              name="card_cvc"
              value={form.card_cvc}
              error={formErrors.card_cvc}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            {/* <Button onClick={preauthCard} variant={"inline"} tabIndex={-1}>
              Authorize
            </Button> */}
            <Textbox
              label="Billing Address"
              floatLabel={true}
              name="card_address"
              value={form.card_address}
              error={formErrors.card_address}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            <Textbox
              label="City"
              floatLabel={true}
              name="card_city"
              value={form.card_city}
              error={formErrors.card_city}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            <Textbox
              label="State"
              floatLabel={true}
              name="card_state"
              value={form.card_state}
              error={formErrors.card_state}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            <Textbox
              label="Zip"
              floatLabel={true}
              name="card_zip"
              value={form.card_zip}
              error={formErrors.card_zip}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
          </BillingInfo>
          <Error visibility={formHasError} extendClass="form-error">
            {formErrors.general ? formErrors.general : `Please fill the form`}
          </Error>
          <Button>{uiFreezed ? "Adding..." : "Add Patient"}</Button>
        </form>
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}

export { Screen19 };
