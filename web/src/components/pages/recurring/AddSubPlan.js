import React, { useEffect, useState } from "react";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Button, Select, Snackbar, Typography } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import ServerApi from "../../../ServerApi";
import {
  AMEXCCVMask,
  AMEXCreditCardMask,
  CCVMask,
  CreditCardMask,
  ExpireMask,
  ZipMask,
} from "../../atoms/uikit/Mask";

const useStyles = makeStyles((theme) => ({
  process_btn: {
    float: "right",
    marginTop: 20,
  },
  root: {
    flexGrow: 1,
  },
  title: {
    marginBottom: 20,
    marginTop: 30,
  },
  inputbox: {
    width: "100%",
  },
  formgroup: {
    maxWidth: 700,
  },
  inputlabel: {
    display: "flex",
    alignItems: "center",
  },
  formLow: {
    padding: 10,
  },
}));

function AddSubscriptionPlan() {
  const classes = useStyles();

  const [amexcard, setAmexcard] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [uiFreezed, setFreeze] = useState(false);
  const [snackopen, setSnakeOpen] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [successMsg, setSuccessMsg] = useState("Success!");

  const handleSnakeClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnakeOpen(false);
  };

  const [form, setForm] = useState({
    plan_name: "",
    agree_date: "",
    first_charge: "",
    number_charge: "",
    charge_amount: "",
    total_amount: "",
    cc_number: "",
    cc_exp: "",
    cc_ccv: "",
    firstname: "",
    lastname: "",
    city: "",
    state: "",
    zip: "",
    plan_id: "",
  });

  useEffect(() => {
    setRendered(true);
  }, []);

  const [formErrors, setFormErrors] = useState({
    plan_name: false,
    agree_date: false,
    first_charge: false,
    number_charge: false,
    charge_amount: false,
    total_amount: false,
    cc_number: false,
    cc_exp: false,
    cc_ccv: false,
    firstname: false,
    lastname: false,
    general: false,
    city: false,
    state: false,
    zip: false,
  });

  useEffect(() => {
    if (!snackopen) {
      setFormErrors({ ...formErrors, general: false });
    }
  }, [snackopen]);

  useEffect(() => {
    if (rendered) {
      if (Object.values(formErrors).some((val) => val !== false)) {
        setSnakeOpen(true);
        setAlertType("error");
      } else {
        // setFormHasError(false);
      }
    }
  }, [rendered, formErrors]);

  const formValidateBeforeSubmit = () => {
    const buffer = Object.assign({}, formErrors);
    for (const [key] of Object.entries(formErrors)) {
      if (typeof form[key] === "string" && form[key].trim() === "") {
        buffer[key] = true;
      }
    }
    buffer.general = false;
    setFormErrors(buffer);
    return Object.values(buffer).some((val) => val !== false) === false;
  };

  const handleChange = (event) => {
    if (event.target.name == "cc_number") {
      if (
        event.target.value.indexOf("34") === 0 ||
        event.target.value.indexOf("37") === 0
      ) {
        setAmexcard(true);
      }
    }
    setForm({
      ...form,
      [event.target.name]: event.target.value
        .replace(/ /g, "")
        .replace(/_/g, ""),
    });
    setFormErrors({
      ...formErrors,
      [event.target.name]: false,
    });
  };

  const process = React.useCallback(() => {
    setSnakeOpen(false);
    if (formValidateBeforeSubmit()) {
      submitFormData();
    }
  }, [form]);

  const setGeneralFormError = (message) => {
    setFormErrors({ ...formErrors, general: message });
  };

  const submitFormData = () => {
    if (uiFreezed) return;
    setFreeze(true);
    console.log(form);
    ServerApi.request({
      path: "add_new_plan",
      method: "POST",
      payload: {
        plan_name: form.plan_name,
        agree_date: form.agree_date,
        first_charge: form.first_charge,
        number_charge: form.number_charge,
        charge_amount: form.charge_amount,
        total_amount: form.total_amount,
      },
    }).then(
      (data) => {
        console.log(data);
        setFreeze(false);
        if (data.status) {
          ServerApi.request({
            path: "add_subscription",
            method: "POST",
            payload: {
              cc_number: form.cc_number,
              cc_exp: form.cc_exp,
              cc_ccv: form.cc_ccv,
              firstname: form.firstname,
              lastname: form.lastname,
              city: form.city,
              state: form.state,
              zip: form.zip,
              plan_id: data.plan_id_ttt,
            },
          }).then(
            (data) => {
              setFreeze(false);
              if (data.status) {
                setAlertType("success");
                setSuccessMsg("Plan and Subscription was added successfuly!");
                setSnakeOpen(true);
              } else {
                setGeneralFormError(data.message);
              }
            },
            (message) => {
              setFreeze(false);
              setGeneralFormError(message);
            }
          );
        } else {
          setGeneralFormError(data.message);
        }
      },
      (message) => {
        setFreeze(false);
        setGeneralFormError(message);
      }
    );
  };

  return (
    <div className={classes.root}>
      <Snackbar
        open={snackopen}
        autoHideDuration={6000}
        onClose={handleSnakeClose}
      >
        <Alert variant="filled" onClose={handleSnakeClose} severity={alertType}>
          {alertType == "error"
            ? formErrors.general
              ? formErrors.general
              : `Please fill the form`
            : successMsg}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        <Grid item sm={2} md={3}></Grid>
        <Grid item xs={12} sm={8} md={6} className={classes.formgroup}>
          <Typography variant="h5" noWrap className={classes.title}>
            Plan and Subscription Information
          </Typography>
          <form noValidate autoComplete="off">
            <Typography variant="subtitle1" noWrap className={classes.title}>
              Plan information
            </Typography>
            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="plan_name">Plan Name</InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    error={formErrors.plan_name}
                    value={form.plan_name}
                    onChange={handleChange}
                    name="plan_name"
                    id="plan_name"
                    placeholder="Plan Name"
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="agree_date">Date of Agreement</InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    type="date"
                    error={formErrors.agree_date}
                    value={form.agree_date}
                    onChange={handleChange}
                    name="agree_date"
                    id="agree_date"
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="first_charge">
                  First Charge Date
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    type="date"
                    error={formErrors.first_charge}
                    value={form.first_charge}
                    onChange={handleChange}
                    name="first_charge"
                    id="first_charge"
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="number_charge">
                  Number of Charges
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    type="number"
                    error={formErrors.number_charge}
                    value={form.number_charge}
                    onChange={handleChange}
                    name="number_charge"
                    id="number_charge"
                    placeholder="Number of Charges"
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="charge_amount">Charge Amount</InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    type="number"
                    error={formErrors.charge_amount}
                    value={form.charge_amount}
                    onChange={handleChange}
                    name="charge_amount"
                    id="charge_amount"
                    placeholder="Charge Amount"
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="total_amount">
                  Total Plan Amount
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    type="number"
                    error={formErrors.total_amount}
                    value={form.total_amount}
                    onChange={handleChange}
                    name="total_amount"
                    id="total_amount"
                    placeholder="Total Plan Amount"
                  />
                </FormControl>
              </Grid>
            </Grid>

            {/* Subscription info */}
            <Typography variant="subtitle1" noWrap className={classes.title}>
              Subscription information
            </Typography>
            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="firstname">First Name</InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    error={formErrors.firstname}
                    value={form.firstname}
                    onChange={handleChange}
                    name="firstname"
                    id="firstname"
                    placeholder="First Name"
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="lastname">Last Name</InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    error={formErrors.lastname}
                    value={form.lastname}
                    onChange={handleChange}
                    name="lastname"
                    id="lastname"
                    placeholder="Last Name"
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="city">City</InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    error={formErrors.city}
                    value={form.city}
                    onChange={handleChange}
                    name="city"
                    id="city"
                    placeholder="City"
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="state">State</InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    error={formErrors.state}
                    value={form.state}
                    onChange={handleChange}
                    name="state"
                    id="state"
                    placeholder="State"
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="zip">Zip</InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    error={formErrors.zip}
                    value={form.zip}
                    onChange={handleChange}
                    name="zip"
                    id="zip"
                    placeholder="Zip"
                    inputComponent={ZipMask}
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="cc_number">Credit Card Number</InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    error={formErrors.cc_number}
                    value={form.cc_number}
                    onChange={handleChange}
                    name="cc_number"
                    id="cc_number"
                    placeholder="cc_number"
                    inputComponent={
                      amexcard ? AMEXCreditCardMask : CreditCardMask
                    }
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5} className={classes.inputlabel}>
                    <InputLabel htmlFor="cc_exp">Expiration Date</InputLabel>
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <Input
                      error={formErrors.cc_exp}
                      value={form.cc_exp}
                      onChange={handleChange}
                      name="cc_exp"
                      id="cc_exp"
                      placeholder="MMYY"
                      inputComponent={ExpireMask}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5} className={classes.inputlabel}>
                    <InputLabel htmlFor="cc_ccv">CCV/CID</InputLabel>
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <Input
                      error={formErrors.cc_ccv}
                      value={form.cc_ccv}
                      onChange={handleChange}
                      name="cc_ccv"
                      id="cc_ccv"
                      inputComponent={amexcard ? AMEXCCVMask : CCVMask}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              className={classes.process_btn}
              color="primary"
              onClick={() => process()}
            >
              {uiFreezed ? "Processing..." : "Add Plan and subscription"}
            </Button>
          </form>
        </Grid>
        <Grid item sm={2} md={3}></Grid>
      </Grid>
    </div>
  );
}

export { AddSubscriptionPlan };
