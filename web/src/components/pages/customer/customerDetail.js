import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import { Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import Paper from "@material-ui/core/Paper";
import {
  StyledTableCell,
  StyledTableRow,
  TablePaginationActions,
} from "../../atoms/uikit/TableKit";

import "./style.css";
import { Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import ServerApi from "../../../ServerApi";
import { usePatientList } from "../../../hooks/usePatientList";
import { useHistory, useParams } from "react-router-dom";
import { useCards } from "../../../hooks/useCards";
import { useSelector } from "react-redux";
import { useCustomerTransaction } from "../../../hooks/useCustomerTransaction";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    marginBottom: 20,
    marginTop: 30,
  },
  formgroup: {
    // maxWidth: 700,
  },
  table: {
    // height: 400,
    marginBottom: 20,
  },
  add_card: {
    margin: 2,
    paddingTop: 2,
    paddingBottom: 2,
    paddingRight: 10,
    paddingLeft: 10,
    float: "right",
  },
  cancel_btn: {
    margin: 2,
    paddingTop: 2,
    paddingBottom: 2,
    paddingRight: 10,
    paddingLeft: 10,
  },
  transactionlist: {
    marginTop: 60,
  },
}));

const columns = [
  { field: "id", headerName: "No" },
  {
    field: "customer",
    headerName: "Customer",
  },
  {
    field: "card",
    headerName: "Card",
  },
  {
    field: "exp",
    headerName: "Exp. Date",
  },
  {
    field: "action",
    headerName: "Action",
  },
];

const columns_t = [
  { field: "id", headerName: "No" },
  {
    field: "customer",
    headerName: "Customer",
  },
  {
    field: "amount",
    headerName: "Amount",
  },
  {
    field: "date",
    headerName: "Date",
  },
  {
    field: "type",
    headerName: "Type",
  },
];

function CustomerDetails() {
  const classes = useStyles();
  const history = useHistory();
  const patient = useSelector((state) => state.global.patient);
  const [uiFreezed, setFreeze] = useState(false);
  const [snackopen, setSnakeOpen] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [successMsg, setSuccessMsg] = useState("Success!");

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

  const { data } = useCards({
    source: {
      path: "card",
      payload:
        patient && patient.id
          ? {
              patient_id: patient.id,
            }
          : null,
    },
  });

  const { data: transactionData } = useCustomerTransaction({
    source: {
      path: "web_tx",
      payload:
        patient && patient.id
          ? {
              patient_id: patient.id,
            }
          : null,
    },
  });

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [page1, setPage1] = React.useState(0);
  const [rowsPerPage1, setRowsPerPage1] = React.useState(5);

  const handleChangePage1 = (event, newPage1) => {
    setPage1(newPage1);
  };

  const handleChangeRowsPerPage1 = (event) => {
    setRowsPerPage1(parseInt(event.target.value, 10));
    setPage1(0);
  };

  const add_card = () => {
    history.push(`/customer/add_card`);
  };

  const removeCard = (id) => {
    ServerApi.request({
      path: `web_remove_card/${id}`,
    }).then(
      (data) => {
        if (data.status) {
          setAlertType("success");
          setSuccessMsg("Card removed successfuly!");
          setSnakeOpen(true);
          setFreeze(false);
          window.location.reload();
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

  useEffect(() => {
    if (data && transactionData) {
      setFreeze(false);
    } else {
      setFreeze(true);
    }
  }, [data, transactionData]);

  console.log(data);

  return (
    <div className={classes.root}>
      <Snackbar
        open={snackopen}
        autoHideDuration={6000}
        onClose={handleSnakeClose}
      >
        <Alert variant="filled" onClose={handleSnakeClose} severity={alertType}>
          {successMsg}
        </Alert>
      </Snackbar>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={12} md={12} className={classes.formgroup}>
          <Typography variant="h5" noWrap className={classes.title}>
            Customer Infomations
          </Typography>
          {uiFreezed ? (
            <Typography variant="subtitle1" noWrap className={classes.loading}>
              Loading...
            </Typography>
          ) : (
            <>
              <Typography
                variant="subtitle1"
                noWrap
                className={classes.loading}
              >
                Customer Cards
              </Typography>
              <Button
                variant="contained"
                className={classes.add_card}
                color="primary"
                onClick={() => add_card()}
              >
                {"Add card"}
              </Button>
              <Paper>
                <TableContainer component={Paper}>
                  <Table
                    className={classes.table}
                    aria-label="customized table"
                  >
                    <TableHead>
                      <TableRow>
                        {columns.map((col) => (
                          <StyledTableCell>{col.headerName}</StyledTableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(rowsPerPage > 0
                        ? data.slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                        : data
                      ).map((row, index) => (
                        <StyledTableRow key={row.id}>
                          <StyledTableCell component="th" scope="row">
                            {index + 1}
                          </StyledTableCell>
                          <StyledTableCell component="th" scope="row">
                            {row.customer}
                          </StyledTableCell>
                          <StyledTableCell component="th" scope="row">
                            {row.card_token}
                          </StyledTableCell>
                          <StyledTableCell component="th" scope="row">
                            {row.card_exp}
                          </StyledTableCell>
                          <StyledTableCell component="th" scope="row">
                            <Button
                              variant="contained"
                              className={classes.cancel_btn}
                              color="primary"
                              onClick={() => removeCard(row.id)}
                            >
                              {uiFreezed ? "Processing..." : "Remove"}
                            </Button>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                    {/* <TableRow> */}

                    {/* </TableRow> */}
                  </Table>
                </TableContainer>
                <TablePagination
                  style={{ float: "right", border: 0 }}
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={3}
                  count={data.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    inputProps: { "aria-label": "rows per page" },
                    native: true,
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </Paper>

              <div className={classes.transactionlist}>
                <Typography
                  variant="subtitle1"
                  noWrap
                  className={classes.loading}
                >
                  Customer Transactions
                </Typography>
                <Paper>
                  <TableContainer component={Paper}>
                    <Table
                      className={classes.table}
                      aria-label="customized table"
                    >
                      <TableHead>
                        <TableRow>
                          {columns_t.map((col) => (
                            <StyledTableCell>{col.headerName}</StyledTableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(rowsPerPage1 > 0
                          ? transactionData.slice(
                              page1 * rowsPerPage1,
                              page1 * rowsPerPage1 + rowsPerPage1
                            )
                          : transactionData
                        ).map((row, index) => (
                          <StyledTableRow key={row.id}>
                            <StyledTableCell component="th" scope="row">
                              {index + 1}
                            </StyledTableCell>
                            <StyledTableCell component="th" scope="row">
                              {row.customer}
                            </StyledTableCell>
                            <StyledTableCell component="th" scope="row">
                              {row.amount}
                            </StyledTableCell>
                            <StyledTableCell component="th" scope="row">
                              {row.date}
                            </StyledTableCell>
                            <StyledTableCell component="th" scope="row">
                              {row.type}
                            </StyledTableCell>
                            <StyledTableCell component="th" scope="row">
                              {row.address}
                            </StyledTableCell>
                            <StyledTableCell
                              component="th"
                              scope="row"
                            ></StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                      {/* <TableRow> */}

                      {/* </TableRow> */}
                    </Table>
                  </TableContainer>
                  <TablePagination
                    style={{ float: "right", border: 0 }}
                    rowsPerPageOptions={[
                      5,
                      10,
                      25,
                      { label: "All", value: -1 },
                    ]}
                    colSpan={3}
                    count={data.length}
                    rowsPerPage={rowsPerPage1}
                    page={page1}
                    SelectProps={{
                      inputProps: { "aria-label": "rows per page" },
                      native: true,
                    }}
                    onPageChange={handleChangePage1}
                    onRowsPerPageChange={handleChangeRowsPerPage1}
                    ActionsComponent={TablePaginationActions}
                  />
                </Paper>
              </div>
            </>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export { CustomerDetails };
