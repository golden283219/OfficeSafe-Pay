import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
// import Alert from "@material-ui/lab/Alert";
import { useDataTable } from "../../../hooks/useDatatable";
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
  notransaction: {
    paddingTop: 20,
    textAlign: "center",
  },
}));

const columns = [
  { field: "id", headerName: "Transaction ID" },
  {
    field: "customer",
    headerName: "Customer",
  },
  {
    field: "type",
    headerName: "Type",
  },
  {
    field: "status",
    headerName: "Status",
  },
  {
    field: "details",
    headerName: "Details",
  },
  {
    field: "time",
    headerName: "Time",
  },
  {
    field: "amount",
    headerName: "Amount",
  },
];

function Transactions() {
  const classes = useStyles();
  const [uiFreezed, setFreeze] = useState(false);
  const { data } = useDataTable({
    source: {
      path: "transactions",
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

  useEffect(() => {
    if (data) {
      setFreeze(false);
    } else {
      setFreeze(true);
    }
  }, [data]);

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={12} md={12} className={classes.formgroup}>
          <Typography variant="h5" noWrap className={classes.title}>
            Transaction Report
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
                    {data.length > 0 ? (
                      (rowsPerPage > 0
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
                            {row.type}
                          </StyledTableCell>
                          <StyledTableCell component="th" scope="row">
                            {row.status}
                          </StyledTableCell>
                          <StyledTableCell component="th" scope="row">
                            {row.details}
                          </StyledTableCell>
                          <StyledTableCell component="th" scope="row">
                            {row.time}
                          </StyledTableCell>
                          <StyledTableCell component="th" scope="row">
                            {row.amount}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))
                    ) : (
                      <Typography
                        variant="subtitle1"
                        noWrap
                        className={classes.notransaction}
                      >
                        No transactions
                      </Typography>
                    )}
                  </TableBody>
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

export { Transactions };
