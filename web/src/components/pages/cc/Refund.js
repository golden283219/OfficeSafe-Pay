import React, { useEffect, useState } from "react";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Button, Snackbar, TextField, Typography } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import ServerApi from "../../../ServerApi";
import { useDataTable } from "../../../hooks/useDatatable";
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

function Refund() {
  const classes = useStyles();

  const [rendered, setRendered] = useState(false);
  const [uiFreezed, setFreeze] = useState(false);
  const [snackopen, setSnakeOpen] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [successMsg, setSuccessMsg] = useState("Success!");
  const [availableData, setAvailableData] = useState([]);

  const { data } = useDataTable({
    source: {
      path: "transactions",
      payload: null,
    },
  });

  useEffect(() => {
    if (data) {
      setFreeze(false);
      console.log(data);
      setAvailableData(
        data.filter((entry) => {
          return entry.type == "SALE";
        })
      );
    } else {
      setFreeze(true);
    }
  }, [data]);

  const handleSnakeClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnakeOpen(false);
  };

  const [form, setForm] = useState({
    type: "refund",
    transactionid: "",
    amount: "",
  });

  useEffect(() => {
    setRendered(true);
  }, []);

  const [formErrors, setFormErrors] = useState({
    transactionid: false,
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

  const setGeneralFormError = (message) => {
    setFormErrors({ ...formErrors, general: message });
  };

  const submitFormData = () => {
    if (uiFreezed) return;
    setFreeze(true);
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
            Transaction Information
          </Typography>
          <form noValidate autoComplete="off">
            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={4} className={classes.inputlabel}>
                <InputLabel htmlFor="transactionid">Transaction ID</InputLabel>
              </Grid>
              <Grid item xs={12} sm={8}>
                <FormControl className={classes.inputbox}>
                  <Autocomplete
                    id="combo-box-demo"
                    options={availableData}
                    getOptionLabel={(option) => option.id}
                    // style={{ width: 300 }}
                    name="transactionid"
                    onInputChange={(event, newInputValue) => {
                      setForm({
                        ...form,
                        ["transactionid"]: newInputValue
                          .replace(/ /g, "")
                          .replace(/_/g, ""),
                      });
                      setFormErrors({
                        ...formErrors,
                        ["transactionid"]: false,
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        // label="Combo box"
                        variant="outlined"
                      />
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} className={classes.formLow}>
              <Grid item xs={12} sm={4} className={classes.inputlabel}>
                <InputLabel htmlFor="amount">Amount</InputLabel>
              </Grid>
              <Grid item xs={12} sm={8}>
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

            <Button
              variant="contained"
              className={classes.process_btn}
              color="primary"
              onClick={() => process()}
            >
              {uiFreezed ? "Processing..." : "Refund"}
            </Button>
          </form>
        </Grid>
        <Grid item sm={2} md={3}></Grid>
      </Grid>
    </div>
  );
}

export { Refund };
