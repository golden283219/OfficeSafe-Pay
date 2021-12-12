import React, { useEffect, useState } from "react";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import {
  Button,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import ServerApi from "../../../ServerApi";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Autocomplete } from "@material-ui/lab";

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

function CustomerAddSubscription() {
  const classes = useStyles();
  const history = useHistory();
  const patient = useSelector((state) => state.global.patient);
  const [rendered, setRendered] = useState(false);
  const [uiFreezed, setFreeze] = useState(false);
  const [snackopen, setSnakeOpen] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [successMsg, setSuccessMsg] = useState("Success!");

  const [card_options, setCardOption] = useState([]);
  useEffect(() => {
    if (patient.id != 0) {
      ServerApi.request({
        path: "web_card",
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
              label: element.card_token,
            });
          });

          setCardOption(card_list);
        }
      });
    }
  }, [patient]);

  useEffect(() => {
    if (patient) {
      console.log(patient);
      if (!patient.id) {
        history.push("/customer/list");
      }
    }
  }, [patient]);

  const handleSnakeClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnakeOpen(false);
  };

  const [form, setForm] = useState({
    charge_number: "",
    first_charge_date: "",
    charge_amount: "",
    card_id: "",
    created: "",
    total_amount: "",
    plan_name: "",
  });

  useEffect(() => {
    setRendered(true);
  }, []);

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
    console.log(form);
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

  const submitFormData = () => {
    if (uiFreezed) return;
    setFreeze(true);
    console.log(form);
    ServerApi.request({
      path: "web_add_plan",
      method: "POST",
      payload: {
        patient_id: patient.id,
        charge_number: form.charge_number,
        first_charge_date: form.first_charge_date,
        amount: form.charge_amount,
        card_id: form.card_id,
        created: form.created,
        total_amount: form.total_amount,
        plan_name: form.plan_name,
        user_id: 1,
      },
    }).then(
      (data) => {
        if (data.status) {
          setAlertType("success");
          setSuccessMsg("Plan and Subscription was created successfuly!");
          setSnakeOpen(true);
          setFreeze(false);
          //   window.location.reload();
        } else {
          setAlertType("error");
          setFreeze(false);
          setSuccessMsg(data.message);
          setSnakeOpen(true);
        }
      },
      (message) => {
        setAlertType("error");
        setFreeze(false);
        setSuccessMsg(message);
        setSnakeOpen(true);
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
            Information
          </Typography>
          <form noValidate autoComplete="off">
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
                <InputLabel htmlFor="created">Date of Agreement</InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    type="date"
                    error={formErrors.created}
                    value={form.created}
                    onChange={handleChange}
                    name="created"
                    id="created"
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="first_charge_date">
                  First Charge Date
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    type="date"
                    error={formErrors.first_charge_date}
                    value={form.first_charge_date}
                    onChange={handleChange}
                    name="first_charge_date"
                    id="first_charge_date"
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="charge_number">
                  Number of Charges
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Input
                    type="number"
                    error={formErrors.charge_number}
                    value={form.charge_number}
                    onChange={handleChange}
                    name="charge_number"
                    id="charge_number"
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
            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={3} className={classes.inputlabel}>
                <InputLabel htmlFor="card_id">Card</InputLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <FormControl className={classes.inputbox}>
                  <Select
                    native
                    value={form.card_id}
                    onChange={handleChange}
                    inputProps={{
                      name: "card_id",
                      id: "card-simple",
                    }}
                  >
                    <option key="key_0" value="">
                      Select Card
                    </option>
                    {card_options.map((item) => (
                      <option key={"key_" + item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              className={classes.process_btn}
              color="primary"
              onClick={() => process()}
            >
              {uiFreezed ? "Processing..." : "Add plan and subscription"}
            </Button>
          </form>
        </Grid>
        <Grid item sm={2} md={3}></Grid>
      </Grid>
    </div>
  );
}

export { CustomerAddSubscription };
