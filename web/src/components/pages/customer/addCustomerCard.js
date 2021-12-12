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
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

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

function AddCustomerCard() {
  const classes = useStyles();
  const history = useHistory();
  const patient = useSelector((state) => state.global.patient);
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
    cc_number: "",
    cc_exp: "",
    cc_ccv: "",
    city: "",
    state: "",
    zip: "",
    address: "",
  });

  useEffect(() => {
    if (patient) {
      console.log(patient);
      if (!patient.id) {
        history.push("/customer/list");
      }
    }
  }, [patient]);

  useEffect(() => {
    setRendered(true);
  }, []);

  const [formErrors, setFormErrors] = useState({
    cc_number: false,
    cc_exp: false,
    cc_ccv: false,
    address: false,
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
      path: "web_add_card",
      method: "POST",
      payload: {
        card_token: form.cc_number,
        card_exp: form.cc_exp,
        card_cvc: form.cc_ccv,

        user_id: 1,
        patient_id: patient.id,
        customer_vault_id: patient.customer_vault_id,
        // billing address & etc

        card_address: form.address,
        card_city: form.city,
        card_state: form.state,
        card_zip: form.zip,
      },
    }).then(
      (data) => {
        console.log(data);
        setFreeze(false);
        if (data.status) {
          setAlertType("success");
          setSuccessMsg("Card was added successfuly!");
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
            Card Information
          </Typography>
          <form noValidate autoComplete="off">
            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="address">Address</InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    error={formErrors.address}
                    value={form.address}
                    onChange={handleChange}
                    name="address"
                    id="address"
                    placeholder="Address"
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
              {uiFreezed ? "Processing..." : "Add Card"}
            </Button>
          </form>
        </Grid>
        <Grid item sm={2} md={3}></Grid>
      </Grid>
    </div>
  );
}

export { AddCustomerCard };
