import React, { useEffect, useState } from "react";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Typography,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import ServerApi from "../../../ServerApi";
import {
  AMEXCCVMask,
  AMEXCreditCardMask,
  CCVMask,
  CreditCardMask,
  ExpireMask,
} from "../../atoms/uikit/Mask";

const useStyles = makeStyles((theme) => ({
  process_btn: {
    float: "right",
    // backgroundColor: "#23313c",
    // color: "#ffffff",
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

function Authorize() {
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

  const [terminal, setTerminal] = useState(false);
  const [form, setForm] = useState({
    type: "auth",
    cc_number: "",
    cc_exp: "",
    cc_ccv: "",
    firstname: "",
    lastname: "",
    amount: "",
    terminal: false,
    customerVault: false,
  });

  useEffect(() => {
    setRendered(true);
  }, []);

  const [formErrors, setFormErrors] = useState({
    cc_number: false,
    cc_exp: false,
    cc_ccv: false,
    firstname: false,
    lastname: false,
    amount: false,
    general: false,
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
    if (terminal) {
      buffer.cc_number = false;
      buffer.cc_exp = false;
      buffer.cc_ccv = false;
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

  const handleTerminalChange = (event) => {
    setTerminal(event.target.checked);
    setForm({ ...form, terminal: event.target.checked });
  };

  const handleCustomerVaultChange = (event) => {
    setForm({ ...form, customerVault: event.target.checked });
  };

  const process = React.useCallback(() => {
    setSnakeOpen(false);
    if (formValidateBeforeSubmit()) {
      submitFormData();
    }
  }, [form, terminal]);

  const setGeneralFormError = (message) => {
    setFormErrors({ ...formErrors, general: message });
  };

  const submitFormData = () => {
    if (uiFreezed) return;
    setFreeze(true);
    console.log(form);
    if (terminal) {
      ServerApi.request({
        path: "web_terminal_payment",
        method: "POST",
        payload: {
          type: "auth",
          amount: form.amount,
        },
      }).then(
        (data) => {
          console.log(data);
          setFreeze(false);
          if (data.status) {
            setAlertType("success");
            setSuccessMsg("Terminal payment paid successfuly!");
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
      ServerApi.request({
        path: "credit_card",
        method: "POST",
        payload: form,
      }).then(
        (data) => {
          console.log(data);
          setFreeze(false);
          if (data.status) {
            setAlertType("success");
            setSuccessMsg(data.message);
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
    }
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
            Billing Information
          </Typography>
          <form noValidate autoComplete="off">
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
                <InputLabel htmlFor="amount">Amount</InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    error={formErrors.amount}
                    value={form.amount}
                    onChange={handleChange}
                    name="amount"
                    id="amount"
                    placeholder="Amount"
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
                    disabled={terminal}
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
                      disabled={terminal}
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
                      disabled={terminal}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid container spacing={1} className={classes.formLow}>
              <Grid item xs={12} sm={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={terminal}
                      onChange={handleTerminalChange}
                      name="terminal"
                      color="primary"
                    />
                  }
                  label="Use Terminal"
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.customerVault}
                      onChange={handleCustomerVaultChange}
                      name="terminal"
                      color="primary"
                    />
                  }
                  label="Add to Customer Vault"
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              className={classes.process_btn}
              color="primary"
              onClick={() => process()}
            >
              {uiFreezed ? "Processing..." : "Authorize"}
            </Button>
          </form>
        </Grid>
        <Grid item sm={2} md={3}></Grid>
      </Grid>
    </div>
  );
}

export { Authorize };
