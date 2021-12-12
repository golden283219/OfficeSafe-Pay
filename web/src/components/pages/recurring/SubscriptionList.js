import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import { Button, Typography } from "@material-ui/core";
// import Alert from "@material-ui/lab/Alert";
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
import { useSubscriptionList } from "../../../hooks/useSubscriptionList";
import { Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import ServerApi from "../../../ServerApi";

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
  cancel_btn: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingRight: 10,
    paddingLeft: 10,
  },
}));

const columns = [
  { field: "id", headerName: "Subscription ID" },
  {
    field: "customer",
    headerName: "Customer",
  },
  {
    field: "details",
    headerName: "Details",
  },
  {
    field: "plan_id",
    headerName: "Order ID/Plan ID",
  },
  {
    field: "created",
    headerName: "Agreed Date",
  },
  {
    field: "amount",
    headerName: "Amount",
  },
  {
    field: "action",
    headerName: "Action",
  },
];

function SubscriptionList() {
  const classes = useStyles();
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

  const { data } = useSubscriptionList({
    source: {
      path: "get_all_plans",
      payload: null,
    },
  });

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const cancelSubscription = (id) => {
    ServerApi.request({
      path: "cancel_subscription",
      method: "POST",
      payload: { subscription_id: id },
    }).then(
      (data) => {
        setFreeze(false);
        if (data.status) {
          setAlertType("success");
          setSuccessMsg("Subscription was cancelled successfuly!");
          setSnakeOpen(true);
          window.location.reload();
        } else {
          setAlertType("error");
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
    if (data) {
      setFreeze(false);
    } else {
      setFreeze(true);
    }
  }, [data]);

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
            Subscriptions List
          </Typography>
          {uiFreezed ? (
            <Typography variant="subtitle1" noWrap className={classes.loading}>
              Loading...
            </Typography>
          ) : (
            <Paper>
              <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="customized table">
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
                    ).map((row) => (
                      <StyledTableRow key={row.name}>
                        <StyledTableCell component="th" scope="row">
                          {row.id}
                        </StyledTableCell>
                        <StyledTableCell component="th" scope="row">
                          {row.customer}
                        </StyledTableCell>
                        <StyledTableCell component="th" scope="row">
                          {row.details}
                        </StyledTableCell>
                        <StyledTableCell component="th" scope="row">
                          {row.plan_id}
                        </StyledTableCell>
                        <StyledTableCell component="th" scope="row">
                          {row.created}
                        </StyledTableCell>
                        <StyledTableCell component="th" scope="row">
                          $ {row.amount}
                        </StyledTableCell>
                        <StyledTableCell component="th" scope="row">
                          <Button
                            variant="contained"
                            className={classes.cancel_btn}
                            color="primary"
                            onClick={() => cancelSubscription(row.id)}
                          >
                            {uiFreezed ? "Processing..." : "Cancel"}
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
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export { SubscriptionList };
