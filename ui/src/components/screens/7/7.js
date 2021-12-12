import React, { useState, useEffect } from "react";
import {
  // commitTransaction,
  currentCustomerId,
  // followNavResult,
  // getDelayedTransaction,
  goBack,
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
import { Wrapper, PatientInfo, BillingInfo, Amount } from "./7.css";
import ServerApi from "../../../ServerApi";
// import Processor from "../../../Processor";
// import { Checkbox } from "../../molecules/Checkbox/Checkbox";
// import WinAutomate from "../../../WinAutomate";

/**
 * Card payment
 *
 * Fill patient + pay, create on success.
 *
 * @returns {JSX.Element}
 * @constructor
 */
function Screen7() {
  const [rendered, setRendered] = useState(false);

  const [form, setForm] = usePreservableState("form", {
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
    card_token: "",
    card_exp: "",
    card_address: "",
    card_city: "",
    card_state: "",
    card_zip: "",
    card_cvc: "",
    amount: "",
  });

  const formOnChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const [uiFreezed, setFreeze] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (formValidateBeforeSubmit()) {
      submitFormData();
    }
  };

  const [formErrors, setFormErrors] = useState({
    first_name: false,
    last_name: false,
    address: false,
    phone: false,
    card_token: false,
    card_exp: false,
    card_address: false,
    card_city: false,
    card_state: false,
    card_zip: false,
    card_cvc: false,
    amount: false,
    general: false,
  });

  const [formHasError, setFormHasError] = useState(false);

  useEffect(() => {
    setRendered(true);
  }, []);

  const setGeneralFormError = (message) => {
    setFormErrors({ ...formErrors, general: message });
  };

  const submitFormData = () => {
    if (!formValidateBeforeSubmit()) return;
    if (uiFreezed) return;
    setFreeze(true);

    ServerApi.request({
      path: "patients",
      method: "POST",
      payload: {
        user_id: currentCustomerId(),
        alias: "",
        first_name: form.first_name,
        last_name: form.last_name,
        address: form.address,
        phone: form.first_name,
        card_token: form.card_token,
        card_exp: form.card_exp,
        card_address: form.card_address,
        card_city: form.card_city,
        card_state: form.card_state,
        card_zip: form.card_zip,
        card_cvc: form.card_cvc,
        // amount: form.amount,
        meta: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          address: form.address,
          phone: form.first_name,
          card_address: form.card_address,
          card_city: form.card_city,
          card_state: form.card_state,
          card_zip: form.card_zip,
        }),
      },
    }).then(
      (data) => {
        console.log(data.patient_id);
        if (data.patient_id) {
          ServerApi.request({
            path: `patients/${data.patient_id}`,
          }).then(
            (res) => {
              if (res[0]) {
                goToScreen(8, {
                  patient: res[0],
                  amount: form.amount,
                  skipHistory: true,
                });
              }
            },
            (error) => {
              setFreeze(false);
              setGeneralFormError(error);
            }
          );
        } else {
          setFreeze(false);
          setGeneralFormError(data.message);
        }
        // fill and commit delayed transaction
        // let tx = getDelayedTransaction();
        // tx.patient_id = data.patient_id;
        // commitTransaction(tx);

        // // and show success
        // goToScreen(5, {
        //   message: { success: "Payment passed, patient successfully added" },
        //   skipHistory: true,
        // });
      },
      (error) => {
        setFreeze(false);
        setGeneralFormError(error);
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
        <Title>Accept Payment</Title>
        <form onSubmit={submit}>
          <Title variant="h2">Client info</Title>
          <PatientInfo>
            <Textbox
              label="First Name"
              floatLabel={true}
              name="first_name"
              value={form.first_name}
              error={formErrors.first_name}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            <Textbox
              label="Last Name"
              floatLabel={true}
              name="last_name"
              value={form.last_name}
              error={formErrors.last_name}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            <Textbox
              label="Address"
              floatLabel={true}
              name="address"
              value={form.address}
              error={formErrors.address}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            <Textbox
              label="Phone"
              floatLabel={true}
              name="phone"
              value={form.phone}
              error={formErrors.phone}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
          </PatientInfo>
          <Title variant="h2">Card Info</Title>
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
          <Amount>
            <Textbox
              label="Amount"
              floatLabel={true}
              name="amount"
              value={form.amount}
              error={formErrors.amount}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
          </Amount>
          <Error visibility={formHasError} extendClass="form-error">
            {formErrors.general ? formErrors.general : `Please fill the form`}
          </Error>
          <Button>{uiFreezed ? "Saving..." : "Process"}</Button>
        </form>
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}

export { Screen7 };
