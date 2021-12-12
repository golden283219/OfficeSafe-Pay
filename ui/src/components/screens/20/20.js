import React, { useState, useEffect } from "react";
import {
  currentCustomerId,
  goBack,
  goToHome,
  goToScreen,
  panMask,
  // panMask,
  usePreservableState,
} from "../../../utils";
import { BackButton } from "../../molecules/BackButton/BackButton";
import { Title } from "../../atoms/Title/Title";
import { Textbox } from "../../molecules/Textbox/Textbox";
import { Button } from "../../atoms/Button/Button";
import { Error } from "../../atoms/Error/Error";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { Wrapper, BillingInfo } from "./20.css";
import ServerApi from "../../../ServerApi";

import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";

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

const useStyles = makeStyles(() => ({
  formControl: {
    // margin: theme.spacing(1),
    marginTop: 13,
    minWidth: 120,
  },
  textField: {
    marginTop: "13px",
  },
}));
function Screen20() {
  const [rendered, setRendered] = useState(false);
  const [patient] = usePreservableState("patient", {
    patient: global?.statePayload?.patient || { id: 0 },
  });
  const classes = useStyles();

  if (patient.patient.id == 0) {
    goToHome();
    return null;
  }

  useEffect(() => {
    if (patient.patient.id != 0) {
      ServerApi.request({
        path: "card",
        payload:
          patient && patient.id
            ? {
                patient_id: patient.id,
              }
            : null,
      }).then((data) => {
        if (data) {
          console.log(data);
          var card_list = [];
          data.forEach((element) => {
            card_list.push({
              value: element.id,
              label: panMask(element.card_token, element.card_exp),
            });
          });

          setCardOption(card_list);
        }
      });
    }
  }, [patient]);
  const [card_options, setCardOption] = useState([]);

  const [form, setForm] = usePreservableState("form", {
    charge_number: "",
    first_charge_date: "",
    charge_amount: "",
    card_id: "",
    created: "",
    total_amount: "",
    plan_name: "",
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
    charge_number: false,
    first_charge_date: false,
    charge_amount: false,
    card_id: false,
    created: false,
    total_amount: false,
    plan_name: false,
    general: false,
  });

  const [formHasError, setFormHasError] = useState(false);
  const [checkCard, setCheckCard] = useState(true);
  const [uiFreezed, setFreeze] = useState(false);

  useEffect(() => {
    setRendered(true);
  }, []);

  const setGeneralFormError = (message) => {
    if (message == "Can't create new plan!") {
      setCheckCard(false);
    }
    setFormErrors({ ...formErrors, general: message });
  };

  const submitFormData = () => {
    if (uiFreezed) return;
    setFreeze(true);
    ServerApi.request({
      path: "add_plan",
      method: "POST",
      payload: {
        user_id: currentCustomerId(),
        patient_id: patient.id,
        charge_number: form.charge_number,
        first_charge_date: form.first_charge_date,
        amount: form.charge_amount,
        card_id: form.card_id,
        created: form.created,
        total_amount: form.total_amount,
        plan_name: form.plan_name,
      },
    }).then(
      (data) => {
        setCheckCard(true);

        if (data.status) {
          goToScreen(16, {
            patient,
          });
        } else {
          setFreeze(false);
          setGeneralFormError(data.message);
        }
      },
      () => {
        setFreeze(false);
        setGeneralFormError("Can't creat new plan!");
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
    console.log(formErrors);
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
        <Title>Add Recurring Payment Plan</Title>
        <form onSubmit={submit}>
          <Title variant="h2" color={checkCard ? "black" : "red"}></Title>
          <BillingInfo>
            <Textbox
              label="Plan Name"
              floatLabel={true}
              name="plan_name"
              value={form.plan_name}
              error={formErrors.plan_name}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            <TextField
              id="date"
              label="Date of Agreement"
              name="created"
              type="date"
              value={form.created}
              error={formErrors.created}
              onChange={formOnChange}
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              id="date"
              label="First Charge Date"
              name="first_charge_date"
              type="date"
              value={form.first_charge_date}
              error={formErrors.first_charge_date}
              onChange={formOnChange}
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Textbox
              label="Number of Charges"
              floatLabel={true}
              name="charge_number"
              value={form.charge_number}
              error={formErrors.charge_number}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            <Textbox
              label="Charge Amount"
              floatLabel={true}
              name="charge_amount"
              value={form.charge_amount}
              error={formErrors.charge_amount}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            <Textbox
              label="Total Plan Amount"
              floatLabel={true}
              name="total_amount"
              value={form.total_amount}
              error={formErrors.total_amount}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            />
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="card-simple">Select Card</InputLabel>
              <Select
                native
                value={form.card_id}
                onChange={formOnChange}
                inputProps={{
                  name: "card_id",
                  id: "card-simple",
                }}
              >
                <option key="key_0" value=""></option>
                {card_options.map((item) => (
                  <option key={"key_" + item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            {/* <Textbox
              label="Select Card"
              floatLabel={true}
              name="card_id"
              value={form.card_id}
              error={formErrors.card_id}
              onChange={formOnChange}
              onInput={formValidateField}
              onBlur={formValidateField}
            /> */}
          </BillingInfo>
          <Error visibility={formHasError} extendClass="form-error">
            {formErrors.general ? formErrors.general : `Please fill the form`}
          </Error>
          <Button onClick={submit}>
            {uiFreezed ? "Adding..." : "Add Plan"}
          </Button>
        </form>
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}

export { Screen20 };
